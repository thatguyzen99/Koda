-- Koda demo projects table
-- A simpler, auth-optional projects table for the hackathon demo.
-- Production deployments should migrate to the auth-scoped projects table in 001.

CREATE TABLE IF NOT EXISTS public.koda_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  jurisdictions TEXT[] NOT NULL DEFAULT '{}',
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  prd_generated BOOLEAN NOT NULL DEFAULT FALSE,
  compliance_score SMALLINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT koda_projects_status_chk
    CHECK (status IN ('draft', 'in_progress', 'completed', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_koda_projects_status
  ON public.koda_projects(status);
CREATE INDEX IF NOT EXISTS idx_koda_projects_created_at
  ON public.koda_projects(created_at DESC);

ALTER TABLE public.koda_projects ENABLE ROW LEVEL SECURITY;

-- Demo: public read, server-only write (service role bypasses RLS).
DROP POLICY IF EXISTS koda_projects_select_public ON public.koda_projects;
CREATE POLICY koda_projects_select_public ON public.koda_projects
  FOR SELECT USING (true);
