-- Koda audits + audit findings tables
-- Stores schema audit runs (one row per Run Audit click) and their findings.
-- Writes happen via service role from /api/audit; reads are public for the demo.

CREATE TABLE IF NOT EXISTS public.koda_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(32) NOT NULL DEFAULT 'review_required',
  compliance_score SMALLINT NOT NULL DEFAULT 0,
  schema_type VARCHAR(32) NOT NULL,
  jurisdictions TEXT[] NOT NULL DEFAULT '{}',
  source VARCHAR(16) NOT NULL DEFAULT 'mock',
  findings_count INTEGER NOT NULL DEFAULT 0,
  schema_input TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT koda_audits_status_chk
    CHECK (status IN ('passed', 'failed', 'review_required')),
  CONSTRAINT koda_audits_source_chk
    CHECK (source IN ('claude', 'mock')),
  CONSTRAINT koda_audits_schema_type_chk
    CHECK (schema_type IN ('sql', 'prisma', 'json', 'typescript'))
);

CREATE INDEX IF NOT EXISTS idx_koda_audits_created_at
  ON public.koda_audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_koda_audits_status
  ON public.koda_audits(status);

CREATE TABLE IF NOT EXISTS public.koda_audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.koda_audits(id) ON DELETE CASCADE,
  severity VARCHAR(16) NOT NULL,
  category VARCHAR(128) NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT koda_audit_findings_severity_chk
    CHECK (severity IN ('critical', 'warning', 'info'))
);

CREATE INDEX IF NOT EXISTS idx_koda_audit_findings_audit_id
  ON public.koda_audit_findings(audit_id);
CREATE INDEX IF NOT EXISTS idx_koda_audit_findings_severity
  ON public.koda_audit_findings(severity);

ALTER TABLE public.koda_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.koda_audit_findings ENABLE ROW LEVEL SECURITY;

-- Demo: public read, server-only write (service role bypasses RLS).
DROP POLICY IF EXISTS koda_audits_select_public ON public.koda_audits;
CREATE POLICY koda_audits_select_public ON public.koda_audits
  FOR SELECT USING (true);

DROP POLICY IF EXISTS koda_audit_findings_select_public ON public.koda_audit_findings;
CREATE POLICY koda_audit_findings_select_public ON public.koda_audit_findings
  FOR SELECT USING (true);
