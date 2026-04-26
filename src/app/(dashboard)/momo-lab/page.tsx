'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Send, ArrowDown, Wallet, Sparkles, Globe, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageShell } from '@/components/layout/PageShell';
import ProviderCard from '@/components/momo/ProviderCard';
import TransactionFlow from '@/components/momo/TransactionFlow';
import { useToast } from '@/components/ui/Toaster';

interface Provider {
  id: string;
  name: string;
  code: string;
  country: string;
  color: string;
}

const PROVIDERS: Provider[] = [
  { id: 'om', name: 'Orange Money', code: 'OM', country: 'Senegal', color: '#FF8800' },
  { id: 'mtn', name: 'MTN MoMo', code: 'MTN', country: 'Multiple', color: '#FFCC00' },
  { id: 'lsc', name: 'Lonestar Cell', code: 'LSC', country: 'Liberia', color: '#FF0000' },
];

interface ComplianceCheckpoint {
  label: string;
  regulation: string;
  status: 'success' | 'warning' | 'critical' | 'pending';
}

interface TransactionFlowStep {
  icon: string;
  label: string;
  status: 'pending' | 'processing' | 'success' | 'warning' | 'critical';
  checkpoints: ComplianceCheckpoint[];
}

export default function MoMoLabPage() {
  const toast = useToast();
  const [sourceProvider, setSourceProvider] = useState<string | null>(null);
  const [destProvider, setDestProvider] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('500');
  const [currency, setCurrency] = useState<'LRD' | 'USD' | 'XOF'>('USD');
  const [isSimulating, setIsSimulating] = useState(false);
  const [flowSteps, setFlowSteps] = useState<TransactionFlowStep[]>([]);

  const sourceProviderData = PROVIDERS.find((p) => p.id === sourceProvider);
  const destProviderData = PROVIDERS.find((p) => p.id === destProvider);

  const numericAmount = Number(amount);
  const validationIssue: string | null = (() => {
    if (!sourceProvider) return 'Pick a source provider to continue.';
    if (!destProvider) return 'Pick a destination provider.';
    if (sourceProvider === destProvider)
      return 'Source and destination must be different providers.';
    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0)
      return 'Enter an amount greater than zero.';
    return null;
  })();

  const mockFlowSteps: TransactionFlowStep[] = [
    {
      icon: '📱',
      label: 'Initiation',
      status: 'success',
      checkpoints: [
        { label: 'Format Validation', regulation: 'CBL-MFS 3.1', status: 'success' },
      ],
    },
    {
      icon: '👤',
      label: 'KYC Verification',
      status: 'success',
      checkpoints: [
        { label: 'Identity Check', regulation: 'CBL-MFS 4.1', status: 'success' },
        { label: 'Document Verification', regulation: 'CBL-MFS 4.2', status: 'success' },
      ],
    },
    {
      icon: '🔍',
      label: 'AML Screening',
      status: 'warning',
      checkpoints: [
        { label: 'Sanctions List Check', regulation: 'CBL-MFS 5.1', status: 'success' },
        { label: 'Beneficiary Verification', regulation: 'CBL-MFS 5.2', status: 'warning' },
      ],
    },
    {
      icon: '🌐',
      label: 'Cross-Network Routing',
      status: 'processing',
      checkpoints: [
        { label: 'Network Compatibility', regulation: 'WAEMU Directive 2.3', status: 'success' },
      ],
    },
    {
      icon: '💰',
      label: 'Settlement',
      status: 'pending',
      checkpoints: [
        { label: 'Fund Transfer', regulation: 'CBL-MFS 6.1', status: 'pending' },
      ],
    },
    {
      icon: '✓',
      label: 'Confirmation',
      status: 'pending',
      checkpoints: [
        { label: 'Receipt Generation', regulation: 'CBL-MFS 7.1', status: 'pending' },
      ],
    },
  ];

  const handleSimulate = async () => {
    if (validationIssue) {
      toast.error(validationIssue);
      return;
    }
    setIsSimulating(true);
    setFlowSteps([]);
    try {
      for (let i = 0; i < mockFlowSteps.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 450));
        const next = mockFlowSteps[i];
        if (!next) continue;
        setFlowSteps((prev) => [...prev, next]);
      }
      toast.success('Simulation complete — review the flow below.');
    } catch (error) {
      console.error('Simulation failed:', error);
      toast.error('Simulation failed. Try again in a moment.');
    } finally {
      setIsSimulating(false);
    }
  };

  const canSimulate = !validationIssue;

  return (
    <PageShell
      eyebrow={
        <>
          <Sparkles className="h-3 w-3" />
          MoMo Lab · Sandbox
        </>
      }
      title={
        <>
          Mobile money,{' '}
          <span className="text-gradient-vibrant">simulated</span>
        </>
      }
      description="Watch a cross-network transaction flow play out, checkpoint by checkpoint, with the regulation that governs each one."
    >
      <div className="space-y-6">
        {/* Source */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
            <div>
              <CardTitle>Source Provider</CardTitle>
              <p className="mt-1 text-sm text-slate-500">Where does the money start?</p>
            </div>
            {sourceProviderData && (
              <span className="inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
                <Wallet className="h-3 w-3" />
                {sourceProviderData.name}
              </span>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {PROVIDERS.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  selected={sourceProvider === provider.id}
                  isDestination={false}
                  onClick={() => setSourceProvider(provider.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {sourceProvider && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-magenta-500 text-white shadow-md shadow-accent-500/30">
              <ArrowDown className="h-4 w-4" />
            </div>
          </motion.div>
        )}

        {/* Destination */}
        {sourceProvider && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <div>
                  <CardTitle>Destination Provider</CardTitle>
                  <p className="mt-1 text-sm text-slate-500">Where does it land?</p>
                </div>
                {destProviderData && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-magenta-400/30 bg-magenta-500/10 px-3 py-1 text-xs font-semibold text-magenta-600">
                    <Wallet className="h-3 w-3" />
                    {destProviderData.name}
                  </span>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {PROVIDERS.map((provider) => (
                    <ProviderCard
                      key={provider.id}
                      provider={provider}
                      selected={destProvider === provider.id}
                      isDestination={true}
                      onClick={() => setDestProvider(provider.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Parameters */}
        <AnimatePresence>
          {sourceProvider && destProvider && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Parameters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr,1fr,auto]">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Amount
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-mono text-lg font-semibold text-[#0A2540] shadow-sm transition-all focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Currency
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as 'LRD' | 'USD' | 'XOF')}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-medium text-[#0A2540] shadow-sm transition-all focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
                      >
                        <option value="USD">USD — US Dollar</option>
                        <option value="LRD">LRD — Liberian Dollar</option>
                        <option value="XOF">XOF — CFA Franc</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="gradient"
                        size="lg"
                        onClick={handleSimulate}
                        disabled={!canSimulate || isSimulating}
                        className="w-full md:w-auto"
                      >
                        {isSimulating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Simulating...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Simulate Transaction
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  {validationIssue && !isSimulating && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      role="status"
                      className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs font-medium text-amber-700"
                    >
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{validationIssue}</span>
                    </motion.div>
                  )}
                  <p className="mt-3 text-xs text-slate-500">
                    Sandbox simulation only — no real funds are moved.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flow */}
        <AnimatePresence>
          {flowSteps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Flow & Compliance Checkpoints</CardTitle>
                </CardHeader>
                <CardContent>
                  <TransactionFlow steps={flowSteps} />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state info */}
        {!sourceProvider && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            {[
              {
                icon: <Globe className="h-5 w-5" />,
                title: 'Multi-Provider',
                desc: 'Orange Money, MTN MoMo, Lonestar Cell — and more on the way.',
                tone: 'from-sky-500/15 to-sky-500/5',
              },
              {
                icon: <ShieldCheck className="h-5 w-5" />,
                title: 'Compliance-Aware',
                desc: 'Each step is annotated with the regulation that governs it.',
                tone: 'from-accent-500/15 to-accent-500/5',
              },
              {
                icon: <Sparkles className="h-5 w-5" />,
                title: 'Live Sandbox',
                desc: 'Tweak parameters and watch the transaction route in real time.',
                tone: 'from-magenta-500/15 to-magenta-500/5',
              },
            ].map((card) => (
              <Card key={card.title} className="relative overflow-hidden">
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${card.tone} blur-2xl`}
                />
                <CardContent className="relative p-6">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-accent-600 shadow-sm ring-1 ring-slate-200">
                    {card.icon}
                  </div>
                  <h3 className="font-heading text-base font-bold text-[#0A2540]">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-600">{card.desc}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </div>
    </PageShell>
  );
}
