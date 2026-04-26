export type Jurisdiction = 'liberia' | 'ghana' | 'nigeria' | 'sierra_leone' | 'ecowas';

export type SourceType = 'central_bank' | 'regional_protocol' | 'data_protection' | 'licensing';

export type ConstraintType = 'technical' | 'operational' | 'reporting' | 'security';

export interface RegulationSource {
  id: string;
  title: string;
  jurisdiction: Jurisdiction;
  source_type: SourceType;
  effective_date: string;
  content: string;
  url?: string;
}

export interface RegulationChunk {
  id: string;
  regulation_id: string;
  section: string;
  content: string;
  constraint_type: ConstraintType;
  embedding?: number[];
}
