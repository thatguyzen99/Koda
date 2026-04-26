/**
 * Unified Regulation Data Index
 * Aggregates all regulatory frameworks for audit processing
 */

import cblMfsRegulations from "./cbl-mfs-regulations";
import ecowasPaymentFramework from "./ecowas-payment-framework";
import liberiaDataProtectionAct from "./data-protection-act";

export interface RegulationChunk {
  id: string;
  regulation_id: string;
  section: string;
  content: string;
  constraint_type: string;
}

/**
 * Complete aggregate of all regulatory data
 * Used for semantic search and compliance auditing
 */
export const allRegulations: RegulationChunk[] = [
  ...cblMfsRegulations,
  ...ecowasPaymentFramework,
  ...liberiaDataProtectionAct,
];

/**
 * Regulation framework metadata
 */
export interface RegulationFramework {
  id: string;
  name: string;
  issuer: string;
  effectiveDate: string;
  description: string;
  chunkCount: number;
}

export const regulationFrameworks: RegulationFramework[] = [
  {
    id: "CBL-MFS-2023",
    name: "Central Bank of Liberia Mobile Financial Services Regulations",
    issuer: "Central Bank of Liberia",
    effectiveDate: "2023-06-15",
    description:
      "Comprehensive regulatory framework for Electronic Money Institution (EMI) licensees covering data residency, KYC/AML, encryption, transaction logging, capital requirements, and interoperability mandates.",
    chunkCount: 8,
  },
  {
    id: "ECOWAS-PSIF-2024",
    name: "ECOWAS Payment System Integration Framework",
    issuer: "Economic Community of West African States",
    effectiveDate: "2024-01-01",
    description:
      "Regional payment system standards covering cross-border transactions, settlement and clearing, consumer protection, interoperability protocols, and sanctions compliance.",
    chunkCount: 5,
  },
  {
    id: "LDPA-2023",
    name: "Liberia Data Protection Act",
    issuer: "Liberia Data Protection Authority",
    effectiveDate: "2023-09-01",
    description:
      "Data privacy and protection requirements defining PII, consent obligations, breach notification timelines, individual rights, and cross-border transfer restrictions.",
    chunkCount: 5,
  },
];

/**
 * Get all regulations by framework
 */
export function getRegulationsByFramework(
  regulationId: string
): RegulationChunk[] {
  return allRegulations.filter((chunk) => chunk.regulation_id === regulationId);
}

/**
 * Get all regulations by constraint type
 */
export function getRegulationsByConstraintType(
  constraintType: string
): RegulationChunk[] {
  return allRegulations.filter(
    (chunk) => chunk.constraint_type === constraintType
  );
}

/**
 * Search regulations by keyword
 */
export function searchRegulations(keyword: string): RegulationChunk[] {
  const lowerKeyword = keyword.toLowerCase();
  return allRegulations.filter(
    (chunk) =>
      chunk.section.toLowerCase().includes(lowerKeyword) ||
      chunk.content.toLowerCase().includes(lowerKeyword)
  );
}

export default allRegulations;
