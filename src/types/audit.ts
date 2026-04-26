export type RiskLevel = 'critical' | 'warning' | 'pass';

export type SchemaType = 'sql' | 'prisma' | 'json' | 'typescript';

export interface AuditRequest {
  project_id: string;
  schema_input: string;
  schema_type: SchemaType;
}

export interface AuditFinding {
  id: string;
  risk_level: RiskLevel;
  regulation_ref: string;
  field_affected: string;
  current_state: string;
  required_state: string;
  fix_suggestion: string;
}

export interface AuditResult {
  id: string;
  project_id: string;
  created_at: string;
  overall_score: number;
  findings: AuditFinding[];
  summary: string;
}
