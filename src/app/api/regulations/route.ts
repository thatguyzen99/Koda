import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface RegulatoryFramework {
  id: string;
  jurisdiction: string;
  framework_name: string;
  description: string;
  key_requirements: string[];
  last_updated: string;
}

// Mock regulatory frameworks database
const REGULATORY_FRAMEWORKS: RegulatoryFramework[] = [
  {
    id: 'liberia-mtr',
    jurisdiction: 'liberia',
    framework_name: 'Money Transmitter Regulation (CBL)',
    description: 'Central Bank of Liberia regulations for money transmitter operations and oversight',
    key_requirements: [
      'Obtain Money Transmitter License from CBL',
      'Maintain minimum capital requirements',
      'File annual compliance reports',
      'Implement KYC/AML procedures',
      'Transaction record retention for 5+ years',
    ],
    last_updated: '2024-01-15',
  },
  {
    id: 'liberia-aml',
    jurisdiction: 'liberia',
    framework_name: 'Anti-Money Laundering Act',
    description: 'Liberia AML/CFT regulations aligned with FATF recommendations',
    key_requirements: [
      'File Suspicious Activity Reports (SARs)',
      'Customer identification and verification',
      'Ongoing transaction monitoring',
      'Enhanced due diligence for high-risk customers',
      'Staff training and compliance programs',
    ],
    last_updated: '2023-06-20',
  },
  {
    id: 'ghana-mtr',
    jurisdiction: 'ghana',
    framework_name: 'Payment Systems Regulation (BOG)',
    description: 'Bank of Ghana regulations for payment service providers and money transmitters',
    key_requirements: [
      'Obtain Payment Service Provider License',
      'Maintain liquidity reserve requirements',
      'Consumer protection standards',
      'Data protection and cybersecurity standards',
      'Quarterly compliance reporting',
    ],
    last_updated: '2024-02-28',
  },
  {
    id: 'ghana-privacy',
    jurisdiction: 'ghana',
    framework_name: 'Data Protection Act',
    description: 'Ghana Data Protection Act for personal data processing and storage',
    key_requirements: [
      'Data minimization principles',
      'Explicit user consent for data collection',
      'Right to access and deletion',
      'Data breach notification requirements',
      'Data Protection Impact Assessments',
    ],
    last_updated: '2023-11-10',
  },
  {
    id: 'nigeria-cbn',
    jurisdiction: 'nigeria',
    framework_name: 'Guidelines for Payment Service Providers (CBN)',
    description: 'Central Bank of Nigeria framework for digital payment operations',
    key_requirements: [
      'PSP License or authorization',
      'Minimum capital requirements based on PSP tier',
      'Real-time transaction monitoring',
      'Fraud prevention mechanisms',
      'Settlement finality procedures',
    ],
    last_updated: '2024-01-30',
  },
  {
    id: 'nigeria-aml',
    jurisdiction: 'nigeria',
    framework_name: 'Money Laundering (Prohibition) Act',
    description: 'Nigeria MLPA and associated regulations for AML/CFT compliance',
    key_requirements: [
      'Customer Due Diligence (CDD)',
      'Enhanced Due Diligence (EDD) for high-risk',
      'Reporting of suspicious transactions',
      'Sanctions compliance screening',
      'Beneficial ownership identification',
    ],
    last_updated: '2023-09-15',
  },
  {
    id: 'sierra-leone-mtr',
    jurisdiction: 'sierra-leone',
    framework_name: 'Money Services Regulation (BOG)',
    description: 'Bank of Sierra Leone regulations for money service providers',
    key_requirements: [
      'Money Service Provider Authorization',
      'Capital and reserve requirements',
      'Consumer complaints handling',
      'Cyber resilience standards',
      'Annual compliance certification',
    ],
    last_updated: '2023-12-01',
  },
  {
    id: 'ecowas-regional',
    jurisdiction: 'ecowas',
    framework_name: 'ECOWAS Directive on Cross-Border Payments',
    description: 'Regional framework for cross-border payment operations within ECOWAS member states',
    key_requirements: [
      'Harmonized KYC standards across ECOWAS',
      'Interoperability with regional payment systems',
      'Standardized transaction limits and reporting',
      'Regional dispute resolution mechanisms',
      'Currency and settlement guidelines',
    ],
    last_updated: '2024-03-10',
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jurisdiction = searchParams.get('jurisdiction')?.toLowerCase();

    let frameworks = REGULATORY_FRAMEWORKS;

    // Filter by jurisdiction if provided
    if (jurisdiction) {
      frameworks = frameworks.filter((f) => f.jurisdiction === jurisdiction);

      if (frameworks.length === 0) {
        return NextResponse.json(
          { error: `No frameworks found for jurisdiction: ${jurisdiction}` },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        count: frameworks.length,
        frameworks,
        available_jurisdictions: ['liberia', 'ghana', 'nigeria', 'sierra-leone', 'ecowas'],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching regulatory frameworks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regulatory frameworks' },
      { status: 500 }
    );
  }
}
