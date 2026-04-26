'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Lightbulb,
  Globe,
  FileSearch,
  Download,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageShell } from '@/components/layout/PageShell';
import { useToast } from '@/components/ui/Toaster';
import { cn } from '@/lib/utils';
import { useRotatingMessage } from '@/lib/use-rotating-message';

const PRD_PROGRESS = [
  'Reading your idea…',
  'Mapping target jurisdictions…',
  'Drafting executive summary…',
  'Modeling regulatory requirements…',
  'Designing data model & API…',
  'Compiling security controls…',
] as const;

interface Jurisdiction {
  id: string;
  name: string;
  code: string;
  flag: string;
}

interface GeneratedPRD {
  executiveSummary: string;
  regulatoryRequirements: string[];
  dataModel: { entities: string[]; relationships: string[] };
  apiSpecs: { endpoints: Array<{ method: string; path: string; description: string }> };
  securityRequirements: string[];
}

const JURISDICTIONS: Jurisdiction[] = [
  { id: 'liberia', name: 'Liberia', code: 'LR', flag: '🇱🇷' },
  { id: 'ghana', name: 'Ghana', code: 'GH', flag: '🇬🇭' },
  { id: 'nigeria', name: 'Nigeria', code: 'NG', flag: '🇳🇬' },
  { id: 'sierra-leone', name: 'Sierra Leone', code: 'SL', flag: '🇸🇱' },
  { id: 'ecowas', name: 'ECOWAS', code: 'WA', flag: '🌍' },
];

const STEPS = [
  { num: 1, label: 'Idea', icon: Lightbulb },
  { num: 2, label: 'Jurisdictions', icon: Globe },
  { num: 3, label: 'Review', icon: FileSearch },
] as const;

export default function PRDStudioPage() {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [idea, setIdea] = useState('');
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPRD, setGeneratedPRD] = useState<GeneratedPRD | null>(null);
  const progressMessage = useRotatingMessage(isGenerating, PRD_PROGRESS, 1500);

  const toggleJurisdiction = (id: string) =>
    setSelectedJurisdictions((prev) =>
      prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]
    );

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/prd/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: idea,
          jurisdictions: selectedJurisdictions,
        }),
      });
      if (!response.ok) {
        let detail = `Status ${response.status}`;
        try {
          const errBody = await response.json();
          if (errBody?.error) detail = String(errBody.error);
        } catch {
          // body wasn't JSON — fall back to status code
        }
        throw new Error(detail);
      }
      const data = await response.json().catch(() => null);
      if (!data || !data.prd) {
        throw new Error('PRD response was malformed.');
      }
      setGeneratedPRD(data.prd as GeneratedPRD);
      toast.success('Your PRD is ready — review it below.');
    } catch (error) {
      console.error('Error generating PRD:', error);
      const msg =
        error instanceof Error ? error.message : 'Could not generate PRD.';
      toast.error(`PRD generation failed: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const canProceedStep1 = idea.trim().length > 20;
  const canProceedStep2 = selectedJurisdictions.length > 0;
  const stepValidationMessage = (() => {
    if (currentStep === 1 && !canProceedStep1) {
      const len = idea.trim().length;
      return len === 0
        ? 'Describe your product to continue (at least 20 characters).'
        : `Add ${21 - len} more character${21 - len === 1 ? '' : 's'} to continue.`;
    }
    if (currentStep === 2 && !canProceedStep2) {
      return 'Select at least one jurisdiction to continue.';
    }
    return null;
  })();

  if (generatedPRD) {
    return (
      <PageShell
        eyebrow={
          <>
            <Sparkles className="h-3 w-3" />
            PRD Generated
          </>
        }
        title={
          <>
            Your PRD is{' '}
            <span className="text-gradient-vibrant">ready</span>
          </>
        }
        description="A compliance-first PRD tailored to your idea and jurisdictions. Review, refine, then ship to engineering."
        actions={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setGeneratedPRD(null);
                setCurrentStep(1);
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Start Over
            </Button>
            <Button
              variant="gradient"
              size="md"
              onClick={() =>
                toast.info('PRD export (PDF / Markdown) is coming soon.')
              }
            >
              <Download className="h-4 w-4" />
              Export PRD
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-accent-500" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-slate-700">
                {generatedPRD.executiveSummary || 'No summary available.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" />
                Regulatory Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {(generatedPRD.regulatoryRequirements ?? []).map((req, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                    <span className="text-sm text-slate-700">{req}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-magenta-500" />
                Data Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Entities
                  </h4>
                  <ul className="space-y-2">
                    {(generatedPRD.dataModel?.entities ?? []).map((entity, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                        {entity}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Relationships
                  </h4>
                  <ul className="space-y-2">
                    {(generatedPRD.dataModel?.relationships ?? []).map((rel, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-magenta-500" />
                        {rel}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                API Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(generatedPRD.apiSpecs?.endpoints ?? []).map((endpoint, i) => (
                  <div
                    key={i}
                    className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 transition-colors hover:border-accent-200 hover:bg-white"
                  >
                    <span
                      className={cn(
                        'inline-flex w-16 justify-center rounded-md px-2 py-0.5 font-mono text-[11px] font-bold',
                        endpoint.method === 'POST' && 'bg-accent-100 text-accent-700',
                        endpoint.method === 'GET' && 'bg-sky-100 text-sky-700',
                        endpoint.method === 'PUT' && 'bg-amber-100 text-amber-700',
                        endpoint.method === 'DELETE' && 'bg-red-100 text-red-700'
                      )}
                    >
                      {endpoint.method}
                    </span>
                    <code className="font-mono text-sm text-[#0A2540]">{endpoint.path}</code>
                    <span className="ml-auto truncate text-xs text-slate-500">
                      {endpoint.description}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
                Security Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {(generatedPRD.securityRequirements ?? []).map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                    <span className="text-sm text-slate-700">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow={
        <>
          <Sparkles className="h-3 w-3" />
          PRD Studio
        </>
      }
      title={
        <>
          Brain-dump to{' '}
          <span className="text-gradient-vibrant">PRD</span>{' '}
          in three steps
        </>
      }
      description="Describe what you want to build. We'll write a compliance-aware PRD against the jurisdictions you select."
      maxWidth="max-w-4xl"
    >
      {/* Stepper */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const active = currentStep === step.num;
            const complete = currentStep > step.num;
            return (
              <div key={step.num} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={
                      active
                        ? { scale: [1, 1.05, 1] }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.4 }}
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-full font-bold transition-all',
                      complete
                        ? 'bg-gradient-to-br from-accent-500 to-magenta-500 text-white shadow-md shadow-accent-500/30'
                        : active
                        ? 'bg-white text-accent-600 ring-2 ring-accent-500 shadow-lg shadow-accent-500/20'
                        : 'bg-slate-100 text-slate-400'
                    )}
                  >
                    {complete ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </motion.div>
                  <p
                    className={cn(
                      'mt-2 text-xs font-semibold uppercase tracking-wider',
                      active ? 'text-accent-700' : complete ? 'text-[#0A2540]' : 'text-slate-400'
                    )}
                  >
                    {step.label}
                  </p>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="relative mx-3 h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{
                        width: currentStep > step.num ? '100%' : '0%',
                      }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-500 to-magenta-500"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>What are you building?</CardTitle>
                <p className="text-sm text-slate-500">
                  Be as detailed or casual as you like — target market, core features, regulatory concerns.
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="e.g. A cross-border remittance app for Liberians in the US that supports mobile money cashout, with KYC tiers and a $500/day untiered limit..."
                  className="min-h-64 text-base"
                />
                <p className="mt-3 text-xs text-slate-500">
                  {idea.trim().length}/20+ characters · {canProceedStep1 ? 'Ready to continue' : 'Add a bit more detail'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Where will you operate?</CardTitle>
                <p className="text-sm text-slate-500">
                  Pick every jurisdiction your product will touch — we'll layer their regulations into the PRD.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {JURISDICTIONS.map((j) => {
                    const selected = selectedJurisdictions.includes(j.id);
                    return (
                      <motion.button
                        key={j.id}
                        type="button"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleJurisdiction(j.id)}
                        className={cn(
                          'group relative overflow-hidden rounded-2xl border p-4 text-left transition-all',
                          selected
                            ? 'border-accent-300 bg-accent-50/50 shadow-glow-accent'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-card'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{j.flag}</div>
                          <div className="flex-1">
                            <p className="font-heading font-bold text-[#0A2540]">{j.name}</p>
                            <p className="text-xs font-mono uppercase text-slate-500">
                              {j.code}
                            </p>
                          </div>
                          <div
                            className={cn(
                              'flex h-6 w-6 items-center justify-center rounded-full transition-all',
                              selected
                                ? 'bg-accent-500 text-white scale-100'
                                : 'border-2 border-slate-200 scale-90'
                            )}
                          >
                            {selected && <CheckCircle2 className="h-4 w-4" />}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Review & generate</CardTitle>
                <p className="text-sm text-slate-500">
                  Final check before we hand it to Claude.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Your idea
                  </p>
                  <p className="whitespace-pre-wrap text-sm text-slate-800">{idea}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Jurisdictions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedJurisdictions.map((id) => {
                      const j = JURISDICTIONS.find((x) => x.id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-accent-500 to-magenta-500 px-3 py-1 text-xs font-semibold text-white shadow-sm"
                        >
                          {j?.flag} {j?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation summary */}
      {stepValidationMessage && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          className="mt-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-2.5 text-sm font-medium text-amber-700"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{stepValidationMessage}</span>
        </motion.div>
      )}

      {/* Nav */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          size="md"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {currentStep < 3 ? (
          <Button
            variant="primary"
            size="md"
            onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
            disabled={currentStep === 1 ? !canProceedStep1 : !canProceedStep2}
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="gradient"
            size="md"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="tabular-nums">{progressMessage}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate PRD
              </>
            )}
          </Button>
        )}
      </div>
    </PageShell>
  );
}
