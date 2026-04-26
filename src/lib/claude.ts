/**
 * Anthropic SDK wrapper.
 *
 * The product calls Claude in exactly one shape: "give me JSON that
 * matches this schema." We implement that with **forced tool use** —
 * the model has to invoke a tool whose `input_schema` is our return
 * type, so we get a typed object back instead of having to parse free
 * text. This is the most reliable way to extract structured data from
 * an LLM today.
 *
 * Two perf knobs:
 *
 * 1. **Prompt caching** — the system prompt is wrapped in a
 *    `cache_control: { type: 'ephemeral' }` block. Repeated calls
 *    with the same system prompt within ~5 minutes pay ~10% of the
 *    input-token cost for that prefix and skip re-processing it.
 *    See `usage.cache_read_input_tokens` on the response to verify.
 *
 * 2. **Model choice** — we default to `claude-haiku-4-5`, which is
 *    fast and cheap and more than capable enough for the structured
 *    audit/PRD outputs Koda needs. Bump to Sonnet 4.6 or Opus 4.7
 *    if a future use case needs deeper reasoning.
 *
 * Graceful fallback: `getClaude()` returns null when no API key is
 * set, so callers can branch and serve a mocked response. This keeps
 * the demo runnable on a fresh clone.
 */
import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-haiku-4-5';

let cachedClient: Anthropic | null = null;
let cachedKeyResolved = false;

export function getClaude(): Anthropic | null {
  if (cachedKeyResolved) return cachedClient;
  cachedKeyResolved = true;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key === 'your_anthropic_api_key_here') return null;
  cachedClient = new Anthropic({ apiKey: key });
  return cachedClient;
}

export const isClaudeEnabled = () => getClaude() !== null;

interface RunStructuredOpts<T> {
  systemPrompt: string;
  userPrompt: string;
  toolName: string;
  toolDescription: string;
  inputSchema: Anthropic.Tool.InputSchema;
  maxTokens?: number;
}

/**
 * Forces a single tool call so the model returns typed structured output.
 * The system prompt is wrapped in a cached block — repeated calls hit the cache.
 */
export async function runStructured<T>({
  systemPrompt,
  userPrompt,
  toolName,
  toolDescription,
  inputSchema,
  maxTokens = 4096,
}: RunStructuredOpts<T>): Promise<T> {
  const client = getClaude();
  if (!client) throw new Error('ANTHROPIC_API_KEY not configured');

  const tool: Anthropic.Tool = {
    name: toolName,
    description: toolDescription,
    input_schema: inputSchema,
  };

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    tools: [tool],
    tool_choice: { type: 'tool', name: toolName },
    messages: [{ role: 'user', content: userPrompt }],
  });

  const block = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
  );
  if (!block) throw new Error('Claude did not return a tool_use block');
  return block.input as T;
}
