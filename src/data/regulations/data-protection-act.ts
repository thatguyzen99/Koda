/**
 * Liberia Data Protection Act
 * Mock dataset for data privacy and protection compliance
 */

export interface RegulationChunk {
  id: string;
  regulation_id: string;
  section: string;
  content: string;
  constraint_type: string;
}

export const liberiaDataProtectionAct: RegulationChunk[] = [
  {
    id: "ldpa-001",
    regulation_id: "LDPA-2023",
    section: "Section 1.2 - Personal Identifiable Information (PII) Definition and Classification",
    content: `Personal Identifiable Information (PII) is defined as any information that
identifies, relates to, or could reasonably be linked with a particular natural person, whether
directly or indirectly. This includes but is not limited to: full legal name, national ID number,
passport number, tax identification number, biometric data (fingerprints, iris scans, voice prints),
financial account information, email address, telephone number, physical address, date of birth,
marital status, government identification documents, and photographic images.

Financial PII includes: account numbers, PIN codes, credit card numbers, CVV/CVC codes, banking
transaction history, credit history, and salary information. Health PII includes: medical conditions,
medications, medical provider names, and health insurance information. Genetic PII includes: DNA
sequences, genetic markers, and family health history related to genetic disposition.

Sensitive PII encompasses: racial or ethnic origin, religious or philosophical beliefs, political
opinions, union membership, genetic data, biometric data, health information, and criminal history.
Organizations processing Sensitive PII shall implement enhanced security measures including encryption
at rest with AES-256, encrypted transmission with TLS 1.2 or higher, and restricted access limited
to trained personnel with explicit need-to-know.`,
    constraint_type: "PII_DEFINITION",
  },
  {
    id: "ldpa-002",
    regulation_id: "LDPA-2023",
    section: "Section 2.3 - Consent Requirements for Data Processing",
    content: `Organizations shall obtain explicit, informed written consent from individuals prior
to collection and processing of any PII. Consent requests shall clearly specify: (a) the identity of
the organization collecting data, (b) the specific categories of PII to be collected, (c) the purpose
and legal basis for processing, (d) recipient organizations or third parties that will receive the data,
(e) the retention period for the data, and (f) the individual's rights under the Liberia Data
Protection Act.

Consent shall be affirmative and voluntary, and shall not be a condition for service provision unless
the specific PII categories are necessary for the service. Consent requests using vague language,
pre-checked boxes, or continuing silence as acceptance shall be deemed invalid. Organizations shall
maintain auditable records of consent, including timestamp, content of the consent request presented,
and individual's consent decision.

Consent shall be revocable at any time, with revocation effective within 10 business days. Withdrawal
of consent shall not affect the lawfulness of processing prior to withdrawal. Organizations shall
provide individuals with mechanisms to withdraw consent with equivalent ease to providing consent.

For Sensitive PII categories, organizations shall obtain explicit written consent in physical or
electronic format with explicit affirmative action. Consent for Sensitive PII shall be limited to a
maximum of 12 months, after which renewed explicit consent must be obtained.`,
    constraint_type: "CONSENT_REQUIREMENTS",
  },
  {
    id: "ldpa-003",
    regulation_id: "LDPA-2023",
    section: "Section 3.1 - Data Breach Notification Requirements",
    content: `Any confirmed breach of PII security resulting in unauthorized access, disclosure,
or loss of data shall be reported to affected individuals without undue delay and in no case later
than 72 hours from discovery of the breach. The data controller shall notify the Liberia Data
Protection Authority (LDPA) of breaches simultaneously with individual notification.

Breach notification shall include: (a) description of the breach including categories of PII affected
and approximate number of individuals affected, (b) likely consequences of the breach, (c) measures
taken to mitigate harm, (d) contact information for the organization's data protection officer or
designee, and (e) information on how affected individuals can obtain further information or file
complaints.

Notification to individuals may be withheld if: (a) the organization has implemented appropriate
technical and organizational security measures making the data unintelligible to unauthorized persons,
(b) the organization has subsequently obtained assurance that the breached data has not been accessed,
or (c) notification would be disproportionately difficult. Withheld notification shall be reported to
the LDPA with justification.

Organizations failing to comply with the 72-hour notification requirement shall be assessed penalties
based on breach severity and number of affected individuals. Intentional delays in breach notification
shall result in civil and potentially criminal penalties.`,
    constraint_type: "DATA_BREACH_NOTIFICATION",
  },
  {
    id: "ldpa-004",
    regulation_id: "LDPA-2023",
    section: "Section 4.2 - Rights to Data Portability and Deletion",
    content: `Individuals have the right to obtain and reuse their PII across services operated by
different data controllers. Upon request, organizations shall provide individuals with a copy of their
PII in a structured, commonly used, machine-readable format (such as CSV or JSON) within 20 business
days. Data shall be provided free of charge for the first two requests per calendar year; subsequent
requests may be subject to a reasonable administrative fee not exceeding LRD 500.

Individuals have the right to erasure of their PII under the following circumstances: (a) the data is
no longer necessary for the purpose for which it was collected, (b) the individual withdraws consent and
no other legal basis exists for processing, (c) the individual objects to processing and there are no
overriding legitimate interests, or (d) the PII was collected from a minor without proper parental
consent.

Right to erasure does not apply when: (a) processing is necessary for compliance with legal obligations,
(b) processing is necessary for establishment, exercise or defense of legal claims, or (c) the individual
is a public official and the data is necessary for performing official duties. Organizations shall erase
requested data or provide written justification for refusal within 20 business days.

Organizations shall implement technical mechanisms to enable individuals to exercise portability and
deletion rights directly through their account settings where practical. Individuals may also exercise
these rights through written request to the organization's Data Protection Officer.`,
    constraint_type: "DATA_RIGHTS",
  },
  {
    id: "ldpa-005",
    regulation_id: "LDPA-2023",
    section: "Section 5.3 - Cross-Border Data Transfer Restrictions",
    content: `Transfer of PII to recipients outside the Republic of Liberia is prohibited unless:
(a) the recipient country has been determined by the Liberia Data Protection Authority to have an
adequate level of data protection through adequacy decision, or (b) appropriate safeguards are
implemented through binding corporate rules, contractual clauses approved by the LDPA, or standard
contractual clauses published by the LDPA.

Currently approved recipient countries and jurisdictions for adequacy are limited to: European Union
member states, United Kingdom, Switzerland, Canada, and Japan. Transfers to other jurisdictions require
either recipient country adequacy determination or approved safeguards documentation.

All cross-border data transfer agreements shall be in writing and shall specify: (a) categories of PII
being transferred, (b) purposes for processing by the recipient, (c) duration of transfer, (d) technical
and organizational security measures implemented by both parties, (e) procedures for handling data subject
rights requests, (f) mechanisms for auditing recipient compliance, and (g) remedies for non-compliance.

Organizations transferring PII across borders shall maintain documented evidence of legal basis and
safeguards and shall provide this documentation to the Liberia Data Protection Authority within 5
business days of request. Transfers to jurisdictions without adequate protection and without approved
safeguards shall result in administrative fines of up to LRD 20,000,000 per violation.`,
    constraint_type: "CROSS_BORDER_TRANSFERS",
  },
];

export default liberiaDataProtectionAct;
