/**
 * Regulation search — keyword-based ranking over the seeded
 * regulation_chunks dataset. Scaffolds the future pgvector semantic
 * search; the storage shape is the same so swapping in real embeddings
 * is a server-side change only.
 *
 * SECURITY: caps query length and rejects unknown filter values.
 */

import { NextRequest, NextResponse } from 'next/server';

interface RegulationSearchRequest {
  query?: unknown;
  jurisdiction?: unknown;
  constraint_type?: unknown;
}

const MAX_QUERY_LEN = 256;
const ALLOWED_CONSTRAINT_TYPES = new Set([
  'kyc',
  'aml',
  'data_protection',
  'reporting',
  'capital',
]);

interface RegulationChunk {
  regulation_id: string;
  jurisdiction: string;
  framework: string;
  constraint_type: string;
  text: string;
  relevance_score: number;
  source: string;
}

// Mock regulation chunks database
const REGULATION_CHUNKS: RegulationChunk[] = [
  {
    regulation_id: 'liberia-kyc-001',
    jurisdiction: 'liberia',
    framework: 'Money Transmitter Regulation',
    constraint_type: 'kyc',
    text: 'Money transmitters must obtain and verify customer identification information including: full name, date of birth, address, government-issued ID, and beneficial ownership information for corporate customers.',
    relevance_score: 0.95,
    source: 'CBL Circular 2024-01',
  },
  {
    regulation_id: 'liberia-aml-001',
    jurisdiction: 'liberia',
    framework: 'Anti-Money Laundering Act',
    constraint_type: 'aml',
    text: 'Suspicious activities including transactions above $10,000, rapid fund movements, or unusual patterns must be reported to the Financial Intelligence Unit within 10 business days.',
    relevance_score: 0.92,
    source: 'AML Act 2011 (Amended)',
  },
  {
    regulation_id: 'ghana-retention-001',
    jurisdiction: 'ghana',
    framework: 'Payment Systems Regulation',
    constraint_type: 'reporting',
    text: 'Transaction records including sender and beneficiary details, amount, date, and settlement information must be retained for a minimum of 5 years and be readily retrievable for regulatory inspection.',
    relevance_score: 0.88,
    source: 'BOG Guidelines 2024',
  },
  {
    regulation_id: 'ghana-data-001',
    jurisdiction: 'ghana',
    framework: 'Data Protection Act',
    constraint_type: 'data_protection',
    text: 'Personal data must be processed lawfully, fairly, and transparently. Processing must have a lawful basis such as explicit consent, contract fulfillment, or legal obligation.',
    relevance_score: 0.90,
    source: 'Data Protection Act 2012',
  },
  {
    regulation_id: 'nigeria-capital-001',
    jurisdiction: 'nigeria',
    framework: 'CBN Guidelines for PSP',
    constraint_type: 'capital',
    text: 'PSPs must maintain a minimum paid-up capital of N500 million for full service providers, N100 million for mobile money operators, and N50 million for payment service providers under umbrella entities.',
    relevance_score: 0.87,
    source: 'CBN Circular 2024-02',
  },
  {
    regulation_id: 'nigeria-aml-001',
    jurisdiction: 'nigeria',
    framework: 'Money Laundering Prohibition Act',
    constraint_type: 'aml',
    text: 'Enhanced Due Diligence applies to customers with beneficial ownership exceeding 25%, politically exposed persons, and customers from high-risk jurisdictions. EDD includes source of funds verification.',
    relevance_score: 0.94,
    source: 'MLPA 2011 (Amended)',
  },
  {
    regulation_id: 'sierra-leone-kyc-001',
    jurisdiction: 'sierra-leone',
    framework: 'Money Services Regulation',
    constraint_type: 'kyc',
    text: 'Customer identity verification must be completed before account opening. For high-value accounts (>$5,000), additional verification of source of funds is required.',
    relevance_score: 0.86,
    source: 'BSL Directive 2023',
  },
  {
    regulation_id: 'ecowas-cross-border-001',
    jurisdiction: 'ecowas',
    framework: 'ECOWAS Directive on Cross-Border Payments',
    constraint_type: 'kyc',
    text: 'Cross-border payments require harmonized KYC identification data across ECOWAS member states. Minimum information set includes: name, address, account identifier, and beneficial owner details.',
    relevance_score: 0.91,
    source: 'ECOWAS Directive D/2020/07',
  },
];

// Mock semantic search - in production, use pgvector similarity search
function mockSemanticSearch(query: string, chunks: RegulationChunk[]): RegulationChunk[] {
  const queryLower = query.toLowerCase();
  const keywords = queryLower.split(/\s+/);

  return chunks
    .map((chunk) => {
      let score = chunk.relevance_score;
      const textLower = chunk.text.toLowerCase();

      // Boost score based on keyword matches
      keywords.forEach((keyword) => {
        if (textLower.includes(keyword)) {
          score += 0.05;
        }
      });

      return { ...chunk, relevance_score: Math.min(score, 1.0) };
    })
    .sort((a, b) => b.relevance_score - a.relevance_score);
}

function invalid(message: string, field: string) {
  return NextResponse.json(
    { error: { code: 'INVALID_INPUT', message, field } },
    { status: 400 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegulationSearchRequest;

    if (typeof body.query !== 'string' || body.query.trim().length === 0) {
      return invalid('query is required', 'query');
    }
    if (body.query.length > MAX_QUERY_LEN) {
      return invalid(`query must be ≤ ${MAX_QUERY_LEN} characters`, 'query');
    }
    const query = body.query.trim();

    let jurisdictionFilter: string | undefined;
    if (body.jurisdiction !== undefined) {
      if (typeof body.jurisdiction !== 'string') {
        return invalid('jurisdiction must be a string', 'jurisdiction');
      }
      jurisdictionFilter = body.jurisdiction.toLowerCase();
    }

    let constraintFilter: string | undefined;
    if (body.constraint_type !== undefined) {
      if (
        typeof body.constraint_type !== 'string' ||
        !ALLOWED_CONSTRAINT_TYPES.has(body.constraint_type)
      ) {
        return invalid(
          `constraint_type must be one of: ${Array.from(ALLOWED_CONSTRAINT_TYPES).join(', ')}`,
          'constraint_type'
        );
      }
      constraintFilter = body.constraint_type;
    }

    let results = REGULATION_CHUNKS;
    if (jurisdictionFilter) {
      results = results.filter((r) => r.jurisdiction === jurisdictionFilter);
    }
    if (constraintFilter) {
      results = results.filter((r) => r.constraint_type === constraintFilter);
    }

    // Mock semantic ranking — production will use pgvector cosine similarity.
    results = mockSemanticSearch(query, results);
    const topResults = results.slice(0, 10);

    return NextResponse.json(
      {
        success: true,
        query,
        jurisdiction_filter: jurisdictionFilter ?? 'all',
        constraint_type_filter: constraintFilter ?? 'all',
        total_results: topResults.length,
        results: topResults,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error searching regulations:', error);
    return NextResponse.json(
      { error: 'Failed to search regulations' },
      { status: 500 }
    );
  }
}
