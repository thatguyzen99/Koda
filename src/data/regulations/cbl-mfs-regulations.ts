/**
 * Central Bank of Liberia Mobile Financial Services Regulations
 * Mock dataset for regulatory compliance auditing
 */

export interface RegulationChunk {
  id: string;
  regulation_id: string;
  section: string;
  content: string;
  constraint_type: string;
}

export const cblMfsRegulations: RegulationChunk[] = [
  {
    id: "cbl-mfs-001",
    regulation_id: "CBL-MFS-2023",
    section: "Section 2.1 - Data Residency Requirements",
    content: `All personal customer data, transaction records, and operational information
must be stored exclusively on servers physically located within the territorial boundaries
of the Republic of Liberia. This requirement applies to primary data storage, backup copies,
and disaster recovery systems. Financial institutions and Electronic Money Institution (EMI)
licensees shall maintain a documented data inventory specifying the location of all systems
containing customer information.

The Central Bank of Liberia reserves the right to conduct periodic inspections and audits
to verify compliance with this provision. Any data storage outside Liberia without explicit
written approval from the Bank's Director of Banking Supervision constitutes a material
violation of the EMI license. Cross-border data transfer for processing, analytics, or
regulatory reporting must be conducted through encrypted channels and is subject to approval
on a case-by-case basis by the Central Bank.`,
    constraint_type: "DATA_RESIDENCY",
  },
  {
    id: "cbl-mfs-002",
    regulation_id: "CBL-MFS-2023",
    section: "Section 3.2 - KYC/AML Transaction Limits and Customer Tiers",
    content: `Electronic Money Institution licensees shall implement a tiered customer
verification system in accordance with Know Your Customer (KYC) and Anti-Money Laundering (AML)
requirements. Tier 1 customers, verified through mobile number and basic identification, shall
have daily transaction limits not to exceed LRD 30,000 (Thirty Thousand Liberian Dollars) in
aggregate per 24-hour period. This includes all incoming and outgoing transfers, merchant
payments, and cash-out transactions.

Tier 2 customers, who have provided government-issued identification and address verification,
shall have daily limits not exceeding LRD 150,000 (One Hundred Fifty Thousand Liberian Dollars).
Tier 3 customers, subject to full enhanced due diligence including beneficial ownership
verification, may be approved for higher limits subject to individual assessment and Central
Bank approval. All limits shall be monitored in real-time, and transactions exceeding tier
limits shall be automatically rejected with notification to the customer and the EMI's compliance
officer.`,
    constraint_type: "KYC_AML",
  },
  {
    id: "cbl-mfs-003",
    regulation_id: "CBL-MFS-2023",
    section: "Section 4.2 - Encryption and Data Security Standards",
    content: `All customer data, account credentials, and transaction information at rest
shall be protected using Advanced Encryption Standard (AES) with a minimum key length of 256 bits.
EMI licensees shall maintain documented evidence of encryption implementation, including
encryption algorithm specifications, key management procedures, and hardware security module (HSM)
deployment where applicable.

Data in transit between customer devices and platform servers, between platform servers and
third-party service providers, and across any network boundary shall be encrypted using Transport
Layer Security (TLS) protocol version 1.2 or higher. All certificates shall be issued by
recognized certificate authorities and renewed before expiration.

EMI licensees shall conduct annual penetration testing and vulnerability assessments by
independent third-party security firms. Results must be documented and made available to the
Central Bank upon request. Remediation of identified vulnerabilities shall be completed within
30 days of identification, with written notification to the Bank.`,
    constraint_type: "ENCRYPTION",
  },
  {
    id: "cbl-mfs-004",
    regulation_id: "CBL-MFS-2023",
    section: "Section 5.1 - Transaction Logging and Audit Trail Requirements",
    content: `Every transaction processed through an EMI platform shall be logged in full,
with the following minimum data elements recorded: unique transaction identifier, timestamp
(accurate to milliseconds) in Monrovia timezone (UTC-0), participant account identifiers
(both originator and beneficiary), transaction type (transfer, payment, deposit, withdrawal,
reversal), transaction amount in LRD, original currency and exchange rate if applicable,
transaction status (pending, completed, failed, reversed), and all party-initiated modifications.

Transaction logs shall be immutable once committed and shall be retained for a minimum of
seven (7) years in an indexed, searchable format. Any queries, modifications, or access to
transaction logs shall themselves be logged, including the identity of the accessor, timestamp,
and nature of the access. These audit logs shall be retained for a minimum of three (3) years.

EMI licensees shall provide the Central Bank with read-only access to transaction logs upon
request, with response time not to exceed 48 business hours for ad-hoc requests and 24 hours
for regulatory enforcement inquiries.`,
    constraint_type: "TRANSACTION_LOGGING",
  },
  {
    id: "cbl-mfs-005",
    regulation_id: "CBL-MFS-2023",
    section: "Section 6.3 - Minimum Capital Requirements for EMI License",
    content: `An applicant for an Electronic Money Institution (EMI) license shall demonstrate
minimum paid-in capital of LRD 50,000,000 (Fifty Million Liberian Dollars) or equivalent in
foreign currency at the Central Bank's official exchange rate at the time of application. This
capital must be held in an account at a licensed commercial bank in Liberia and shall be subject
to a regulatory hold restricting withdrawal without Central Bank approval.

Additionally, EMI licensees shall maintain a capital adequacy ratio of not less than 10% of
risk-weighted assets at all times, calculated in accordance with the Central Bank's Capital
Adequacy Directive. Minimum capital requirements shall be reviewed annually and may be increased
if the EMI's risk profile, transaction volume, or non-compliance history warrants elevated
capital buffers.

Failure to maintain minimum capital requirements for two consecutive months shall result in
issuance of a remedial directive. Failure to cure within 90 days shall be grounds for license
suspension or revocation.`,
    constraint_type: "CAPITAL_REQUIREMENTS",
  },
  {
    id: "cbl-mfs-006",
    regulation_id: "CBL-MFS-2023",
    section: "Section 7.4 - Interoperability Mandate and Cross-Provider Transactions",
    content: `Effective January 1, 2025, all EMI licensees shall implement interoperability
functionality enabling customers to initiate transactions to customers of other licensed EMI
providers without requiring the recipient to hold an account with the originator's provider.
This mandate encompasses account-to-account transfers, merchant payments, and bill payments
across different EMI platforms.

EMI licensees shall participate in a Central Bank-designated clearing and settlement
infrastructure that processes interoperability transactions with settlement within 24 business
hours. Standard settlement fees shall not exceed 0.5% of transaction value, with a maximum
absolute fee of LRD 500 per transaction.

Technical specifications for interoperability, including API standards, security requirements,
and data field specifications, shall be published by the Central Bank by September 30, 2024.
All licensees must achieve full technical compliance by December 31, 2024. EMI licensees that
fail to implement interoperability by the January 1, 2025 deadline shall be assessed a daily
non-compliance fee of LRD 100,000 per business day until compliance is achieved.`,
    constraint_type: "INTEROPERABILITY",
  },
  {
    id: "cbl-mfs-007",
    regulation_id: "CBL-MFS-2023",
    section: "Section 8.1 - Customer Dispute Resolution and Chargeback Procedures",
    content: `EMI licensees shall establish and maintain a documented customer dispute
resolution process for transaction-related complaints, including but not limited to:
unauthorized transactions, duplicate charges, failed transactions, and suspected fraud. Customers
shall be entitled to file disputes within 90 days of the transaction date.

Disputed transactions shall be investigated within 5 business days, and a determination shall
be communicated to the customer within 10 business days of the dispute filing. Funds related to
substantiated disputes shall be credited to the customer's account within 15 business days of
the determination. EMI licensees shall maintain detailed dispute records and provide summary
reports to the Central Bank on a monthly basis.

For any dispute involving fraud or unauthorized access, the EMI licensee shall file a report
with the Central Bank's Financial Crimes Unit and conduct a forensic investigation to determine
root cause and implement remedial controls to prevent recurrence.`,
    constraint_type: "CONSUMER_PROTECTION",
  },
  {
    id: "cbl-mfs-008",
    regulation_id: "CBL-MFS-2023",
    section: "Section 9.2 - Regulatory Reporting and Compliance Certification",
    content: `EMI licensees shall submit to the Central Bank the following regulatory reports
on the schedules specified: (a) Monthly Transaction Report by the 15th of the following month,
detailing total transaction count, volume, and value by transaction type; (b) Quarterly Capital
Adequacy Report within 30 days of quarter-end; (c) Annual Audited Financial Statements within
120 days of fiscal year-end, prepared by an independent auditor approved by the Central Bank;
and (d) Annual Compliance Certification signed by the EMI's Chief Executive Officer and Chief
Compliance Officer attesting to compliance with all applicable regulations.

EMI licensees shall also submit within 30 days of identified occurrence: (a) any data breach
affecting customer information, (b) any IT system failure exceeding 4 consecutive hours,
(c) any material control deficiency, and (d) any transaction volume or value deviation exceeding
25% from forecasted figures.

Failure to submit required reports within specified deadlines shall result in assessment of
penalties as outlined in Section 12 of this directive.`,
    constraint_type: "REGULATORY_REPORTING",
  },
];

export default cblMfsRegulations;
