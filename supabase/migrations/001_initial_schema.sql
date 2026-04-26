-- Koda Initial Schema Migration
-- Supabase PostgreSQL Database Setup
-- Created: 2024-04-25
-- Compliance: CBL-MFS, ECOWAS-PSIF, LDPA regulations

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ===========================
-- PROFILES TABLE
-- ===========================
-- Stores user profile information linked to auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  organization_name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'auditor',
  -- Role: 'admin', 'auditor', 'reviewer', 'viewer'
  subscription_tier VARCHAR(50) NOT NULL DEFAULT 'free',
  api_key_hash VARCHAR(255) UNIQUE,
  -- Hash of API key for authentication
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_role CHECK (role IN ('admin', 'auditor', 'reviewer', 'viewer')),
  CONSTRAINT valid_subscription CHECK (subscription_tier IN ('free', 'professional', 'enterprise'))
);

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_api_key_hash ON public.profiles(api_key_hash);

-- ===========================
-- PROJECTS TABLE
-- ===========================
-- Stores database projects that users want to audit
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_name VARCHAR(255) NOT NULL,
  description TEXT,
  database_type VARCHAR(50) NOT NULL,
  -- 'postgresql', 'mysql', 'sqlite', 'schema_upload'
  connection_string_encrypted TEXT,
  -- Encrypted database connection details
  schema_content TEXT,
  -- Raw SQL schema or JSON schema if uploaded
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  -- 'active', 'archived', 'error'
  data_residency_location VARCHAR(100),
  -- Location where data is stored (e.g., 'Liberia')
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_db_type CHECK (database_type IN ('postgresql', 'mysql', 'sqlite', 'schema_upload')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'archived', 'error'))
);

CREATE INDEX idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX idx_projects_created_at ON public.projects(created_at);
CREATE INDEX idx_projects_status ON public.projects(status);

-- ===========================
-- REGULATIONS TABLE
-- ===========================
-- Stores regulatory framework metadata
CREATE TABLE public.regulations (
  id VARCHAR(50) PRIMARY KEY,
  -- e.g., 'CBL-MFS-2023', 'ECOWAS-PSIF-2024', 'LDPA-2023'
  name VARCHAR(500) NOT NULL UNIQUE,
  issuer VARCHAR(255) NOT NULL,
  effective_date DATE NOT NULL,
  description TEXT,
  jurisdiction VARCHAR(100) NOT NULL,
  -- 'Liberia', 'ECOWAS', 'International'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_regulations_jurisdiction ON public.regulations(jurisdiction);
CREATE INDEX idx_regulations_effective_date ON public.regulations(effective_date);

-- ===========================
-- REGULATION_CHUNKS TABLE
-- ===========================
-- Stores individual regulation sections with vector embeddings
CREATE TABLE public.regulation_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  regulation_id VARCHAR(50) NOT NULL REFERENCES public.regulations(id) ON DELETE CASCADE,
  section VARCHAR(255) NOT NULL,
  -- e.g., 'Section 2.1', 'Section 3.2'
  content TEXT NOT NULL,
  -- Full regulatory language (2-3 paragraphs)
  constraint_type VARCHAR(100) NOT NULL,
  -- e.g., 'DATA_RESIDENCY', 'ENCRYPTION', 'KYC_AML', 'TRANSACTION_LOGGING'
  embedding vector(1536),
  -- OpenAI text-embedding-3-small vector for semantic search
  chunk_index INTEGER NOT NULL,
  -- Order within regulation
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_regulation_chunks_regulation_id ON public.regulation_chunks(regulation_id);
CREATE INDEX idx_regulation_chunks_constraint_type ON public.regulation_chunks(constraint_type);
CREATE INDEX idx_regulation_chunks_embedding ON public.regulation_chunks USING ivfflat(embedding vector_cosine_ops);

-- ===========================
-- AUDITS TABLE
-- ===========================
-- Stores audit sessions for schema compliance checking
CREATE TABLE public.audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Denormalized for query efficiency
  audit_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- 'pending', 'in_progress', 'completed', 'failed'
  compliance_score DECIMAL(5, 2),
  -- 0-100 percentage
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  processing_duration_seconds INTEGER,
  -- How long the audit took
  error_message TEXT,
  -- If status is 'failed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_audit_status CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  CONSTRAINT valid_compliance_score CHECK (compliance_score >= 0 AND compliance_score <= 100)
);

CREATE INDEX idx_audits_project_id ON public.audits(project_id);
CREATE INDEX idx_audits_owner_id ON public.audits(owner_id);
CREATE INDEX idx_audits_status ON public.audits(status);
CREATE INDEX idx_audits_created_at ON public.audits(created_at);
CREATE INDEX idx_audits_compliance_score ON public.audits(compliance_score);

-- ===========================
-- AUDIT_FINDINGS TABLE
-- ===========================
-- Stores compliance findings from each audit
CREATE TABLE public.audit_findings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  regulation_chunk_id UUID REFERENCES public.regulation_chunks(id) ON DELETE SET NULL,
  -- Link to specific regulation section
  finding_type VARCHAR(50) NOT NULL,
  -- 'violation', 'warning', 'suggestion', 'pass'
  severity VARCHAR(50) NOT NULL,
  -- 'critical', 'high', 'medium', 'low', 'info'
  constraint_type VARCHAR(100),
  -- e.g., 'ENCRYPTION', 'DATA_RESIDENCY', 'KYC_AML'
  schema_element VARCHAR(500),
  -- Table/column name with issue, e.g., 'customers.email'
  finding_title VARCHAR(255) NOT NULL,
  finding_description TEXT NOT NULL,
  regulation_requirement TEXT,
  -- Quote from regulation
  recommended_action TEXT,
  similarity_score DECIMAL(3, 2),
  -- 0-1 semantic similarity to regulation requirement
  evidence_text TEXT,
  -- Relevant excerpt from schema or audit context
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  -- 'open', 'acknowledged', 'resolved', 'dismissed'
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_finding_type CHECK (finding_type IN ('violation', 'warning', 'suggestion', 'pass')),
  CONSTRAINT valid_severity CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  CONSTRAINT valid_finding_status CHECK (status IN ('open', 'acknowledged', 'resolved', 'dismissed'))
);

CREATE INDEX idx_audit_findings_audit_id ON public.audit_findings(audit_id);
CREATE INDEX idx_audit_findings_regulation_chunk_id ON public.audit_findings(regulation_chunk_id);
CREATE INDEX idx_audit_findings_finding_type ON public.audit_findings(finding_type);
CREATE INDEX idx_audit_findings_severity ON public.audit_findings(severity);
CREATE INDEX idx_audit_findings_constraint_type ON public.audit_findings(constraint_type);
CREATE INDEX idx_audit_findings_status ON public.audit_findings(status);
CREATE INDEX idx_audit_findings_created_at ON public.audit_findings(created_at);

-- ===========================
-- ROW LEVEL SECURITY (RLS)
-- ===========================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_findings ENABLE ROW LEVEL SECURITY;

-- PROFILES RLS: Users can only view/update their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- PROJECTS RLS: Users can only access their own projects
CREATE POLICY "projects_select_own" ON public.projects
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "projects_insert_own" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "projects_update_own" ON public.projects
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "projects_delete_own" ON public.projects
  FOR DELETE USING (auth.uid() = owner_id);

-- AUDITS RLS: Users can only access audits for their own projects
CREATE POLICY "audits_select_own" ON public.audits
  FOR SELECT USING (
    auth.uid() = owner_id
    OR auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    )
  );

CREATE POLICY "audits_insert_own" ON public.audits
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id
    AND auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    )
  );

CREATE POLICY "audits_update_own" ON public.audits
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "audits_delete_own" ON public.audits
  FOR DELETE USING (auth.uid() = owner_id);

-- AUDIT_FINDINGS RLS: Users can access findings for their audits
CREATE POLICY "audit_findings_select_own" ON public.audit_findings
  FOR SELECT USING (
    auth.uid() IN (
      SELECT owner_id FROM public.audits WHERE id = audit_id
    )
  );

CREATE POLICY "audit_findings_insert_own" ON public.audit_findings
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT owner_id FROM public.audits WHERE id = audit_id
    )
  );

CREATE POLICY "audit_findings_update_own" ON public.audit_findings
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT owner_id FROM public.audits WHERE id = audit_id
    )
  );

-- REGULATION_CHUNKS RLS: Public read-only access
ALTER TABLE public.regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulation_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "regulations_select_public" ON public.regulations
  FOR SELECT USING (true);

CREATE POLICY "regulation_chunks_select_public" ON public.regulation_chunks
  FOR SELECT USING (true);

-- ===========================
-- TRIGGER FUNCTIONS
-- ===========================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON public.audits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_findings_updated_at BEFORE UPDATE ON public.audit_findings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regulations_updated_at BEFORE UPDATE ON public.regulations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regulation_chunks_updated_at BEFORE UPDATE ON public.regulation_chunks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================
-- INITIAL DATA
-- ===========================

-- Insert regulatory frameworks
INSERT INTO public.regulations (id, name, issuer, effective_date, description, jurisdiction)
VALUES
  (
    'CBL-MFS-2023',
    'Central Bank of Liberia Mobile Financial Services Regulations',
    'Central Bank of Liberia',
    '2023-06-15',
    'Comprehensive regulatory framework for Electronic Money Institution (EMI) licensees',
    'Liberia'
  ),
  (
    'ECOWAS-PSIF-2024',
    'ECOWAS Payment System Integration Framework',
    'Economic Community of West African States',
    '2024-01-01',
    'Regional payment system standards for cross-border transactions and settlement',
    'ECOWAS'
  ),
  (
    'LDPA-2023',
    'Liberia Data Protection Act',
    'Liberia Data Protection Authority',
    '2023-09-01',
    'Data privacy and protection requirements for PII handling and breach notification',
    'Liberia'
  )
ON CONFLICT (id) DO NOTHING;

-- ===========================
-- COMMENTS
-- ===========================

COMMENT ON TABLE public.profiles IS 'User profiles linked to authentication users for role and subscription management';
COMMENT ON TABLE public.projects IS 'Database projects that users submit for regulatory compliance auditing';
COMMENT ON TABLE public.regulations IS 'Regulatory framework metadata (CBL-MFS, ECOWAS, LDPA, etc.)';
COMMENT ON TABLE public.regulation_chunks IS 'Individual sections of regulations with vector embeddings for semantic search';
COMMENT ON TABLE public.audits IS 'Audit session records tracking compliance checks against user projects';
COMMENT ON TABLE public.audit_findings IS 'Specific compliance findings and violations identified during audits';
COMMENT ON COLUMN public.regulation_chunks.embedding IS 'OpenAI text-embedding-3-small vector (1536 dimensions) for semantic similarity search';
COMMENT ON COLUMN public.audits.compliance_score IS 'Percentage compliance score (0-100) based on audit findings';
COMMENT ON COLUMN public.audit_findings.similarity_score IS 'Semantic similarity score (0-1) between schema element and regulation requirement';
