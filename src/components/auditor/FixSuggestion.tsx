'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FixSuggestionProps {
  suggestion: string;
  language: string;
  regulation: string;
}

export default function FixSuggestion({
  suggestion,
  regulation,
}: FixSuggestionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(suggestion ?? '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      // Clipboard can fail in insecure contexts; fail quietly.
      console.warn('Clipboard copy failed:', err);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2">
        <p className="font-mono text-xs text-slate-600">{regulation}</p>
        <button
          onClick={handleCopy}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all',
            copied
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
              : 'bg-accent-50 text-accent-700 ring-1 ring-accent-200 hover:bg-accent-100'
          )}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto bg-[#0F172A] p-4 font-mono text-xs leading-relaxed text-slate-100">
        <code>{suggestion}</code>
      </pre>
    </div>
  );
}
