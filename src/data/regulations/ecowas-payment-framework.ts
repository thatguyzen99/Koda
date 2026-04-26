/**
 * ECOWAS Payment System Integration Framework
 * Mock dataset for regional payment regulatory compliance
 */

export interface RegulationChunk {
  id: string;
  regulation_id: string;
  section: string;
  content: string;
  constraint_type: string;
}

export const ecowasPaymentFramework: RegulationChunk[] = [
  {
    id: "ecowas-psif-001",
    regulation_id: "ECOWAS-PSIF-2024",
    section: "Section 2.1 - Cross-Border Transaction Standards and Message Format",
    content: `All cross-border payment transactions within ECOWAS member states shall
conform to the ISO 20022 financial messaging standard for payment initiation, clearing, and
settlement. Payment messages shall include mandatory fields: originator identification, beneficiary
identification, transaction amount in both originating currency and West African CFA franc
(XOF), purpose of payment, and transaction reference number.

Payment messages exceeding the ISO 20022 standard message size limit shall be rejected. Originators
and beneficiaries shall be identified using either International Bank Account Number (IBAN),
national identifier with bank account number, or national mobile money identifier registered with
the ECOWAS Payment System Authority. All cross-border payments shall include an audit trail
capturing each step of the transaction lifecycle from initiation through settlement.`,
    constraint_type: "CROSS_BORDER_STANDARDS",
  },
  {
    id: "ecowas-psif-002",
    regulation_id: "ECOWAS-PSIF-2024",
    section: "Section 3.2 - Settlement and Clearing Requirements",
    content: `Cross-border payment transactions shall be settled within a maximum of two (2)
business days from initiation, with same-day settlement available for transactions below
XOF 500,000. All payment service providers participating in cross-border transactions shall
maintain settlement accounts with authorized clearing banks designated by the ECOWAS Monetary
Cooperation Programme (EMCP).

Each transaction shall pass through designated clearing houses established in each member state,
with settlement amounts netted across all payment service providers on a daily basis. Net settlement
amounts shall be due within 24 hours of clearing house settlement determination. Payment service
providers failing to settle within this window shall be assessed daily penalties equivalent to 0.1%
of unsettled amounts, compounded daily, and shall have their cross-border authorization suspended
until full settlement is achieved.

The ECOWAS Payment System Authority shall maintain a real-time gross settlement (RTGS) system for
high-value transactions exceeding XOF 2,000,000, with settlement finality upon transaction
completion in the RTGS system.`,
    constraint_type: "SETTLEMENT_CLEARING",
  },
  {
    id: "ecowas-psif-003",
    regulation_id: "ECOWAS-PSIF-2024",
    section: "Section 4.3 - Consumer Protection Mandates for Cross-Border Payments",
    content: `Payment service providers shall disclose to customers prior to transaction
initiation: (a) total transaction fees and charges, (b) expected settlement timeframe, (c) exchange
rate to be applied if different currencies are involved, and (d) recourse mechanism for disputed
transactions. Fees shall be displayed in both the customer's home currency and the settlement
currency.

For transactions where the actual exchange rate applied differs from the disclosed rate by more
than 0.5%, the customer shall have the right to cancel the transaction prior to settlement with
no penalty. Payment service providers shall maintain records of all fee disclosures and exchange
rate differences for audit by the ECOWAS Payment System Authority.

Consumers have the right to dispute cross-border transactions within 120 days of the transaction
date. Payment service providers shall investigate disputes within 10 business days and provide
resolution within 20 business days. Substantiated disputes shall result in refund within 15
business days of determination. Payment service providers that fail to meet these timelines shall
be assessed penalties of XOF 50,000 per business day of delay.`,
    constraint_type: "CONSUMER_PROTECTION",
  },
  {
    id: "ecowas-psif-004",
    regulation_id: "ECOWAS-PSIF-2024",
    section: "Section 5.1 - Interoperability Protocol Specifications",
    content: `Payment service providers authorized to operate cross-border payment services
shall implement the ECOWAS Interoperability Protocol (EIP) version 2.1 or later. This protocol
specifies: (a) API authentication mechanisms using OAuth 2.0 or equivalent, (b) message encryption
using TLS 1.2 or higher, (c) data format specifications for payment initiation requests and
responses, and (d) error handling and retry logic.

All API endpoints shall use HTTPS with certificates issued by trusted certificate authorities
recognized by the ECOWAS Payment System Authority. API calls shall include request/response
authentication tokens with validity limited to 3600 seconds. Failed authentication attempts exceeding
three consecutive failures shall result in temporary account lockout for 15 minutes.

Payment service providers shall maintain separate API credentials for production and testing
environments. Testing environment credentials shall not authenticate transactions in production
systems. API logs shall be retained for a minimum of 18 months and shall be made available to the
ECOWAS Payment System Authority within 5 business days of request.`,
    constraint_type: "INTEROPERABILITY_PROTOCOL",
  },
  {
    id: "ecowas-psif-005",
    regulation_id: "ECOWAS-PSIF-2024",
    section: "Section 6.2 - Sanctions Compliance and Transaction Screening",
    content: `All payment service providers shall implement automated transaction screening
against international sanctions lists, including the United Nations Security Council Consolidated
Sanctions List, the ECOWAS regional sanctions list, and member state-specific sanctions lists.
Screening shall occur at transaction initiation and again prior to settlement.

Transactions flagged as suspicious matches shall be held in pending status for 48 hours while
a manual compliance review is conducted. If sanctions concerns cannot be resolved, the transaction
shall be rejected and the originator notified with sanitized explanation of rejection reason.
Rejected transactions shall be reported to the ECOWAS Financial Intelligence Unit (FIU) and
recorded in the payment service provider's transaction screening log.

Payment service providers shall update sanctions list sources at minimum on a daily basis and
maintain documented evidence of updates. Failure to implement sanctions screening or delays in
screening implementation exceeding 5 business days shall result in immediate cross-border payment
authorization suspension until compliance is demonstrated.`,
    constraint_type: "SANCTIONS_COMPLIANCE",
  },
];

export default ecowasPaymentFramework;
