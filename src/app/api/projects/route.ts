/**
 * Projects API — list and create Koda compliance projects.
 *
 * Data flow: client → POST /api/projects → server validation (this file)
 * → Supabase service-role insert (when configured) OR in-memory append
 * → JSON response.
 *
 * Persistence is best-effort: if Supabase is unreachable we still return
 * a project record so the demo never fails on infra. Every response
 * includes a `source: 'supabase' | 'mock'` field so callers know which
 * path was taken.
 *
 * SECURITY: server-side validation rejects oversized fields and
 * malformed jurisdictions. 500 responses return a generic message —
 * stack traces are logged server-side, never to the client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase-server';

interface Project {
  id: string;
  name: string;
  description: string;
  jurisdictions: string[];
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  prd_generated: boolean;
  compliance_score?: number;
}

interface CreateProjectRequest {
  name?: unknown;
  description?: unknown;
  jurisdictions?: unknown;
}

const MAX_NAME_LEN = 255;
const MAX_DESC_LEN = 4096;
const MAX_JURISDICTIONS = 16;
const MAX_JURISDICTION_LEN = 32;

const SEED: Project[] = [
  {
    id: 'proj-001',
    name: 'Cross-Border Remittance Platform',
    description: 'Mobile-first remittance app for West African markets',
    jurisdictions: ['liberia', 'ghana', 'nigeria'],
    status: 'in_progress',
    created_at: '2026-03-15T10:30:00Z',
    updated_at: '2026-04-20T14:45:00Z',
    prd_generated: true,
    compliance_score: 87,
  },
  {
    id: 'proj-002',
    name: 'Digital Wallet Solution',
    description: 'Secure digital wallet with merchant integration',
    jurisdictions: ['ghana', 'sierra-leone'],
    status: 'draft',
    created_at: '2026-04-10T09:15:00Z',
    updated_at: '2026-04-18T11:20:00Z',
    prd_generated: false,
  },
  {
    id: 'proj-003',
    name: 'ECOWAS Payment Gateway',
    description: 'Regional payment hub for ECOWAS member states',
    jurisdictions: ['ecowas'],
    status: 'completed',
    created_at: '2026-02-01T08:00:00Z',
    updated_at: '2026-03-30T16:00:00Z',
    prd_generated: true,
    compliance_score: 94,
  },
];

const memoryProjects: Project[] = [...SEED];
const TABLE = 'koda_projects';

function invalid(message: string, field: string) {
  return NextResponse.json(
    { error: { code: 'INVALID_INPUT', message, field } },
    { status: 400 }
  );
}

interface ValidatedCreate {
  name: string;
  description: string;
  jurisdictions: string[];
}

function validateCreate(body: CreateProjectRequest): ValidatedCreate | NextResponse {
  if (typeof body.name !== 'string' || body.name.trim().length === 0) {
    return invalid('name is required', 'name');
  }
  if (body.name.length > MAX_NAME_LEN) {
    return invalid(`name must be ≤ ${MAX_NAME_LEN} characters`, 'name');
  }

  if (typeof body.description !== 'string' || body.description.trim().length === 0) {
    return invalid('description is required', 'description');
  }
  if (body.description.length > MAX_DESC_LEN) {
    return invalid(`description must be ≤ ${MAX_DESC_LEN} characters`, 'description');
  }

  if (!Array.isArray(body.jurisdictions) || body.jurisdictions.length === 0) {
    return invalid('jurisdictions must be a non-empty array', 'jurisdictions');
  }
  if (body.jurisdictions.length > MAX_JURISDICTIONS) {
    return invalid(`at most ${MAX_JURISDICTIONS} jurisdictions allowed`, 'jurisdictions');
  }
  const jurisdictions: string[] = [];
  for (const j of body.jurisdictions) {
    if (typeof j !== 'string' || j.trim().length === 0) {
      return invalid('every jurisdiction must be a non-empty string', 'jurisdictions');
    }
    if (j.length > MAX_JURISDICTION_LEN) {
      return invalid(
        `jurisdiction values must be ≤ ${MAX_JURISDICTION_LEN} characters`,
        'jurisdictions'
      );
    }
    jurisdictions.push(j.trim().toLowerCase());
  }

  return {
    name: body.name.trim(),
    description: body.description.trim(),
    jurisdictions,
  };
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const status = params.get('status');
  const jurisdiction = params.get('jurisdiction');

  const supabase = getServiceSupabase();
  if (supabase) {
    let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    if (jurisdiction) query = query.contains('jurisdictions', [jurisdiction.toLowerCase()]);

    const { data, error } = await query;
    if (!error && data) {
      return NextResponse.json(
        { success: true, count: data.length, projects: data, source: 'supabase' },
        { status: 200 }
      );
    }
    console.warn('Supabase projects query failed, using mock:', error?.message);
  }

  let filtered = memoryProjects;
  if (status) filtered = filtered.filter((p) => p.status === status);
  if (jurisdiction) {
    const j = jurisdiction.toLowerCase();
    filtered = filtered.filter((p) => p.jurisdictions.includes(j));
  }
  return NextResponse.json(
    { success: true, count: filtered.length, projects: filtered, source: 'mock' },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateProjectRequest;
    const validated = validateCreate(body);
    if (validated instanceof NextResponse) return validated;

    const supabase = getServiceSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from(TABLE)
        .insert({
          name: validated.name,
          description: validated.description,
          jurisdictions: validated.jurisdictions,
          status: 'draft',
          prd_generated: false,
        })
        .select()
        .single();
      if (!error && data) {
        return NextResponse.json(
          { success: true, project: data, source: 'supabase' },
          { status: 201 }
        );
      }
      console.warn('Supabase project insert failed, using mock:', error?.message);
    }

    const newProject: Project = {
      id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: validated.name,
      description: validated.description,
      jurisdictions: validated.jurisdictions,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      prd_generated: false,
    };
    memoryProjects.push(newProject);
    return NextResponse.json(
      { success: true, project: newProject, source: 'mock' },
      { status: 201 }
    );
  } catch (error) {
    // Log internally; surface a generic message to the client to avoid
    // leaking stack traces or DB error details.
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
