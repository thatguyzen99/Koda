/**
 * Sample Database Schemas for Compliance Auditing
 * Includes non-compliant, partially compliant, and reference schemas
 */

/**
 * SCHEMA 1: NON-COMPLIANT Mobile Money Database
 * Violations:
 * - Customer PII (email, phone) stored in plaintext without encryption
 * - No encryption_algorithm field for sensitive data
 * - Missing audit_trail table for transaction logging
 * - Transaction amounts and statuses not immutable
 * - No data residency verification mechanism
 * - Missing encryption requirements per CBL-MFS Section 4.2
 * - Violates LDPA Section 1.2 PII protection requirements
 * - No KYC tier enforcement
 */
export const nonCompliantMobileMoneySchema = `
-- Non-compliant schema - DO NOT USE IN PRODUCTION
CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,  -- Plaintext email - VIOLATION
  phone_number VARCHAR(20) NOT NULL,  -- Plaintext phone - VIOLATION
  national_id VARCHAR(50) NOT NULL,  -- Plaintext ID - VIOLATION
  name VARCHAR(255) NOT NULL,
  kyc_tier VARCHAR(10) NOT NULL DEFAULT 'tier_1',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE accounts (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id),
  account_number VARCHAR(20) UNIQUE NOT NULL,
  balance DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'LRD',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  source_account_id BIGINT NOT NULL REFERENCES accounts(id),
  destination_account_id BIGINT NOT NULL REFERENCES accounts(id),
  amount DECIMAL(15, 2) NOT NULL,  -- Mutable - can be changed
  status VARCHAR(20) NOT NULL,  -- Mutable status
  description VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Allows modification - VIOLATION
);

-- NO audit_trail table - VIOLATION of CBL-MFS Section 5.1
-- NO transaction logging with immutable timestamps - VIOLATION
`;

/**
 * SCHEMA 2: PARTIALLY COMPLIANT Prisma Schema
 * Compliance Status:
 * - Has encryption_algorithm field but not enforced
 * - Has audit_trail table but incomplete logging
 * - Transaction logging exists but missing some required fields
 * - KYC tier exists but no enforcement on transaction limits
 * - Data residency location tracked but no verification
 * - Missing full immutability for transaction records
 * - Partially addresses LDPA requirements but incomplete
 * - Missing role-based access control
 */
export const partiallyCompliantPrismaSchema = `
// Partially compliant Prisma schema
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Customer {
  id                    Int       @id @default(autoincrement())
  email                 String    @unique
  encrypted_email       String?   // Has encryption field but not required
  phone_number          String    @unique
  encrypted_phone       String?   // Has encryption field but not required
  national_id           String    @unique
  encrypted_national_id String?   // Has encryption field but not required
  encryption_algorithm  String?   // Tracks algorithm but not enforced
  name                  String
  kyc_tier              String    @default("tier_1")  // Has KYC tier

  accounts    Account[]
  audits      AuditLog[]
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt
}

model Account {
  id              Int       @id @default(autoincrement())
  customer_id     Int       @db.Integer
  customer        Customer  @relation(fields: [customer_id], references: [id])
  account_number  String    @unique
  balance         Decimal   @db.Decimal(15, 2)  // Can be modified
  currency        String    @default("LRD")

  source_transactions     Transaction[] @relation("source")
  destination_transactions Transaction[] @relation("destination")
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt
}

model Transaction {
  id                    Int       @id @default(autoincrement())
  source_account_id     Int
  source_account        Account   @relation("source", fields: [source_account_id], references: [id])
  destination_account_id Int
  destination_account   Account   @relation("destination", fields: [destination_account_id], references: [id])
  amount                Decimal   @db.Decimal(15, 2)
  status                String    @default("pending")  // Mutable status - PARTIALLY COMPLIANT

  // Partial compliance: has audit trail reference but fields incomplete
  audit_logs            AuditLog[]
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt  // Still updatable - PARTIALLY COMPLIANT
}

model AuditLog {
  id              Int       @id @default(autoincrement())
  customer_id     Int?
  customer        Customer? @relation(fields: [customer_id], references: [id])
  transaction_id  Int?
  action          String    // Has action logging
  // Missing: participant_ids, transaction_id as required
  // Missing: immutable record enforcement
  // Missing: timestamp accuracy to milliseconds
  created_at  DateTime  @default(now())  // Only to second precision
  @@index([customer_id])
  @@index([transaction_id])
}

// Partial compliance: has audit but missing full transaction details
// Missing: RLS policies for data isolation
// Missing: encryption enforcement
`;

/**
 * SCHEMA 3: Compliance Requirements Reference Guide
 * Maps regulatory requirements to implementation details
 */
export const complianceRequirementsReference = {
  encryptionRequirements: {
    regulation: "CBL-MFS Section 4.2",
    description:
      "All customer data at rest shall be protected using AES-256 encryption",
    implementation:
      'Add "encryption_algorithm" field to customer data tables, require AES-256, enforce at application layer',
    severity: "CRITICAL",
    affectedSchema: "NON-COMPLIANT",
  },

  transactionLoggingRequirements: {
    regulation: "CBL-MFS Section 5.1",
    description:
      "Every transaction must be logged with timestamp (millisecond precision), participant IDs, amounts, and status",
    implementation:
      "Create immutable audit_trail table with triggers preventing modification, store millisecond-precision timestamps",
    severity: "CRITICAL",
    affectedSchema: "PARTIALLY-COMPLIANT",
  },

  dataResidencyRequirements: {
    regulation: "CBL-MFS Section 2.1",
    description: "All customer data must be stored on servers physically in Liberia",
    implementation:
      "Add data_residency_location field, validate region before insert, implement geo-fencing in DB connection",
    severity: "CRITICAL",
    affectedSchema: "PARTIALLY-COMPLIANT",
  },

  kycAmlLimitEnforcement: {
    regulation: "CBL-MFS Section 3.2",
    description:
      "Tier 1: max LRD 30,000/day, Tier 2: max LRD 150,000/day, enforce via automatic rejection",
    implementation:
      "Add function to check kyc_tier and daily_transaction_total before accepting transactions",
    severity: "CRITICAL",
    affectedSchema: "PARTIALLY-COMPLIANT",
  },

  interoperabilitySupport: {
    regulation: "CBL-MFS Section 7.4",
    description:
      "Must support cross-provider transactions with settlement within 24 hours",
    implementation:
      "Add interoperability_partner table, cross-provider transaction routing, settlement status tracking",
    severity: "HIGH",
    affectedSchema: "PARTIALLY-COMPLIANT",
  },

  piiDefinition: {
    regulation: "LDPA Section 1.2",
    description:
      "Email, phone, national ID, biometric data are PII - must be encrypted and access-restricted",
    implementation:
      "Identify all PII fields, apply AES-256 encryption, implement column-level encryption",
    severity: "CRITICAL",
    affectedSchema: "NON-COMPLIANT",
  },

  consentTracking: {
    regulation: "LDPA Section 2.3",
    description:
      "Must track explicit consent with timestamp and content of consent request",
    implementation:
      "Add consent_tracking table with timestamp, consent_request_text, consent_version",
    severity: "HIGH",
    affectedSchema: "PARTIALLY-COMPLIANT",
  },

  breachNotificationCapability: {
    regulation: "LDPA Section 3.1",
    description:
      "Must identify and notify of breaches within 72 hours, log breach details",
    implementation:
      "Add breach_log table, implement access monitoring, alerting on unusual access patterns",
    severity: "HIGH",
    affectedSchema: "PARTIALLY-COMPLIANT",
  },

  dataPortabilitySupport: {
    regulation: "LDPA Section 4.2",
    description:
      "Must provide customer data in machine-readable format (JSON/CSV) within 20 business days",
    implementation:
      "Add data_export endpoint, implement audit logging of exports, retention schedule tracking",
    severity: "MEDIUM",
    affectedSchema: "PARTIALLY-COMPLIANT",
  },

  crossBorderRestrictions: {
    regulation: "LDPA Section 5.3",
    description:
      "Cannot transfer PII outside Liberia without documented safeguards and LDPA approval",
    implementation:
      "Add data_transfer_destination field, prevent data replication outside Liberia, validate before any transfer",
    severity: "CRITICAL",
    affectedSchema: "NON-COMPLIANT",
  },
};

/**
 * Compliance Assessment Summary
 */
export const complianceAssessment = {
  nonCompliant: {
    complianceScore: "15%",
    criticalViolations: [
      "PII stored in plaintext (CBL-MFS 4.2, LDPA 1.2)",
      "No transaction audit trail (CBL-MFS 5.1)",
      "No encryption mechanism (CBL-MFS 4.2)",
      "No cross-border transfer restrictions (LDPA 5.3)",
      "No consent tracking (LDPA 2.3)",
    ],
    requiredActions:
      "Complete redesign required - cannot be deployed in production",
  },
  partiallyCompliant: {
    complianceScore: "55%",
    criticalViolations: [
      "Encryption fields present but not enforced",
      "Audit trail incomplete - missing millisecond timestamps",
      "No KYC tier enforcement on transactions",
      "Transaction records mutable - violates immutability requirement",
      "Missing RLS policies for data isolation",
    ],
    requiredActions:
      "Implement encryption enforcement, fix immutability, add transaction limit checks before production",
  },
};

export default {
  nonCompliantMobileMoneySchema,
  partiallyCompliantPrismaSchema,
  complianceRequirementsReference,
  complianceAssessment,
};
