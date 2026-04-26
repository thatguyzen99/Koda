/**
 * Audit history API — returns the most recent 20 koda_audits rows for the
 * Recent Audits strip on the Auditor page. Falls back to an empty array when
 * Supabase is not configured so demo builds (no env keys) stay stable.
 */

import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase-server';

interface AuditHistoryRow {
  id: string;
  status: 'passed' | 'failed' | 'review_required';
  compliance_score: number;
  total_findings: number;
  schema_type: string;
  jurisdictions: string[];
  created_at: string;
  source: 'claude' | 'mock';
}

export async function GET() {
  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { success: true, audits: [] as AuditHistoryRow[], source: 'empty' },
      { status: 200 }
    );
  }

  try {
    const { data, error } = await supabase
      .from('koda_audits')
      .select(
        'id, status, compliance_score, findings_count, schema_type, jurisdictions, created_at, source'
      )
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data) {
      console.warn('Audit history query failed:', error?.message);
      return NextResponse.json(
        { success: true, audits: [] as AuditHistoryRow[], source: 'empty' },
        { status: 200 }
      );
    }

    const audits: AuditHistoryRow[] = data.map((row) => ({
      id: row.id as string,
      status: row.status as AuditHistoryRow['status'],
      compliance_score: row.compliance_score as number,
      total_findings: row.findings_count as number,
      schema_type: row.schema_type as string,
      jurisdictions: (row.jurisdictions as string[]) ?? [],
      created_at: row.created_at as string,
      source: row.source as AuditHistoryRow['source'],
    }));

    return NextResponse.json(
      { success: true, audits, source: 'supabase' },
      { status: 200 }
    );
  } catch (e) {
    console.warn('Audit history threw:', e);
    return NextResponse.json(
      { success: true, audits: [] as AuditHistoryRow[], source: 'empty' },
      { status: 200 }
    );
  }
}
