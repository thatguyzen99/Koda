import type { Jurisdiction, RiskLevel, SchemaType } from '@/types';

export const BRAND_COLORS = {
  primary: '#EF4444',
  secondary: '#1F2937',
  accent: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
} as const;

export const JURISDICTIONS: Array<{ label: string; value: Jurisdiction }> = [
  { label: 'Liberia', value: 'liberia' },
  { label: 'Ghana', value: 'ghana' },
  { label: 'Nigeria', value: 'nigeria' },
  { label: 'Sierra Leone', value: 'sierra_leone' },
  { label: 'ECOWAS', value: 'ecowas' },
];

export const RISK_LEVELS: Array<{ label: string; value: RiskLevel }> = [
  { label: 'Critical', value: 'critical' },
  { label: 'Warning', value: 'warning' },
  { label: 'Pass', value: 'pass' },
];

export const SCHEMA_TYPES: Array<{ label: string; value: SchemaType }> = [
  { label: 'SQL', value: 'sql' },
  { label: 'Prisma', value: 'prisma' },
  { label: 'JSON Schema', value: 'json' },
  { label: 'TypeScript', value: 'typescript' },
];

export const NAV_ITEMS = [
  {
    label: 'War Room',
    href: '/war-room',
    icon: 'Shield',
    description: 'Real-time compliance monitoring dashboard',
  },
  {
    label: 'Auditor',
    href: '/auditor',
    icon: 'Code',
    description: 'Database schema compliance auditing',
  },
  {
    label: 'MoMo Lab',
    href: '/momo-lab',
    icon: 'Smartphone',
    description: 'Mobile money transaction simulation',
  },
  {
    label: 'PRD Studio',
    href: '/prd-studio',
    icon: 'FileText',
    description: 'AI-powered compliance PRD generation',
  },
];
