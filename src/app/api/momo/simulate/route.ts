/**
 * Mobile money transaction simulation.
 *
 * Returns a mocked transaction flow with a fixed sequence of compliance
 * checkpoints (KYC → AML → limit check → beneficiary → jurisdiction →
 * fraud). Used by the MoMo Lab UI to drive the visual simulation.
 *
 * SECURITY: validates length and shape of every field. Caps amount at
 * a sane upper bound to keep mock IDs stable and prevent log spam.
 */

import { NextRequest, NextResponse } from 'next/server';

interface MomoSimulateRequest {
  source_provider?: unknown;
  target_provider?: unknown;
  amount?: unknown;
  currency?: unknown;
}

const MAX_PROVIDER_LEN = 32;
const ALLOWED_CURRENCIES = new Set(['USD', 'LRD', 'XOF', 'GHS', 'NGN', 'EUR']);
const MAX_AMOUNT = 1_000_000_000;

interface ComplianceCheckpoint {
  checkpoint_id: string;
  name: string;
  status: 'passed' | 'failed' | 'pending';
  description: string;
  timestamp: string;
}

interface TransactionFlow {
  transaction_id: string;
  source: {
    provider: string;
    account: string;
  };
  target: {
    provider: string;
    account: string;
  };
  amount: number;
  currency: string;
  exchange_rate?: number;
  compliance_checkpoints: ComplianceCheckpoint[];
  estimated_delivery: string;
  status: 'initiated' | 'in_progress' | 'completed' | 'failed';
}

// Mock transaction flow simulation
function simulateTransactionFlow(
  sourceProvider: string,
  targetProvider: string,
  amount: number,
  currency: string
): TransactionFlow {
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date();
  const deliveryTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours estimated

  const checkpoints: ComplianceCheckpoint[] = [
    {
      checkpoint_id: 'check-001',
      name: 'KYC Verification',
      status: 'passed',
      description: 'Sender KYC status verified against regulatory database',
      timestamp: new Date(now.getTime()).toISOString(),
    },
    {
      checkpoint_id: 'check-002',
      name: 'AML Screening',
      status: 'passed',
      description: 'Transaction screened against OFAC and local AML watchlists',
      timestamp: new Date(now.getTime() + 5000).toISOString(),
    },
    {
      checkpoint_id: 'check-003',
      name: 'Transaction Limit Verification',
      status: 'passed',
      description: `Amount ${amount} ${currency} within daily limits`,
      timestamp: new Date(now.getTime() + 10000).toISOString(),
    },
    {
      checkpoint_id: 'check-004',
      name: 'Beneficiary Validation',
      status: 'passed',
      description: `${targetProvider} account holder details verified`,
      timestamp: new Date(now.getTime() + 15000).toISOString(),
    },
    {
      checkpoint_id: 'check-005',
      name: 'Jurisdiction Compliance',
      status: 'passed',
      description: 'Transaction route complies with inter-regional regulatory requirements',
      timestamp: new Date(now.getTime() + 20000).toISOString(),
    },
    {
      checkpoint_id: 'check-006',
      name: 'Fraud Detection',
      status: 'passed',
      description: 'Transaction pattern analysis shows low fraud risk',
      timestamp: new Date(now.getTime() + 25000).toISOString(),
    },
  ];

  return {
    transaction_id: transactionId,
    source: {
      provider: sourceProvider,
      account: `${sourceProvider.substring(0, 3).toUpperCase()}****1234`,
    },
    target: {
      provider: targetProvider,
      account: `${targetProvider.substring(0, 3).toUpperCase()}****5678`,
    },
    amount,
    currency,
    exchange_rate: currency !== 'USD' ? 1.0 : undefined,
    compliance_checkpoints: checkpoints,
    estimated_delivery: deliveryTime.toISOString(),
    status: 'in_progress',
  };
}

function invalid(message: string, field: string) {
  return NextResponse.json(
    { error: { code: 'INVALID_INPUT', message, field } },
    { status: 400 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MomoSimulateRequest;

    // Provider IDs must be short, non-empty strings.
    if (typeof body.source_provider !== 'string' || body.source_provider.trim().length === 0) {
      return invalid('source_provider is required', 'source_provider');
    }
    if (body.source_provider.length > MAX_PROVIDER_LEN) {
      return invalid(`source_provider must be ≤ ${MAX_PROVIDER_LEN} chars`, 'source_provider');
    }
    if (typeof body.target_provider !== 'string' || body.target_provider.trim().length === 0) {
      return invalid('target_provider is required', 'target_provider');
    }
    if (body.target_provider.length > MAX_PROVIDER_LEN) {
      return invalid(`target_provider must be ≤ ${MAX_PROVIDER_LEN} chars`, 'target_provider');
    }
    if (body.source_provider === body.target_provider) {
      return invalid('source and target providers must differ', 'target_provider');
    }

    // Amount must be a positive finite number under the sanity ceiling.
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return invalid('amount must be a positive number', 'amount');
    }
    if (amount > MAX_AMOUNT) {
      return invalid(`amount must be ≤ ${MAX_AMOUNT}`, 'amount');
    }

    // Currency restricted to the supported set.
    if (typeof body.currency !== 'string' || !ALLOWED_CURRENCIES.has(body.currency)) {
      return invalid(
        `currency must be one of: ${Array.from(ALLOWED_CURRENCIES).join(', ')}`,
        'currency'
      );
    }

    const transactionFlow = simulateTransactionFlow(
      body.source_provider,
      body.target_provider,
      amount,
      body.currency
    );

    return NextResponse.json(
      {
        success: true,
        transaction: transactionFlow,
        message: 'Mobile money transaction flow simulated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    // Stack traces logged server-side; client gets a generic message.
    console.error('Error simulating mobile money transaction:', error);
    return NextResponse.json(
      { error: 'Failed to simulate transaction' },
      { status: 500 }
    );
  }
}
