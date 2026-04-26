import type { Jurisdiction } from './regulation';

export type ComplianceStatus = 'compliant' | 'non_compliant' | 'needs_review';

export interface ComplianceCheckpoint {
  regulation_ref: string;
  description: string;
  status: ComplianceStatus;
}

export interface MoMoProvider {
  id: string;
  name: string;
  code: string;
  country: Jurisdiction;
}

export interface TransactionFlow {
  id: string;
  source_provider: string;
  target_provider: string;
  amount: number;
  currency: string;
  checkpoints: ComplianceCheckpoint[];
}
