import type { Jurisdiction } from './regulation';

export interface Project {
  id: string;
  name: string;
  description: string;
  jurisdiction: Jurisdiction[];
  compliance_score: number;
  created_at: string;
  updated_at: string;
  schema?: string;
}
