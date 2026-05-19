import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Proposal } from '../types/proposal';

function getWorldLoopsDir(): string {
  return process.env.WORLDLOOPS_DIR ?? path.join(process.cwd(), '.worldloops');
}

export function getProposalsPath(): string {
  return path.join(getWorldLoopsDir(), 'proposals.json');
}

export function loadProposals(): Proposal[] {
  const proposalsPath = getProposalsPath();
  if (!fs.existsSync(proposalsPath)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(proposalsPath, 'utf8')) as Proposal[];
}

export function saveProposal(proposal: Proposal): void {
  const proposalsPath = getProposalsPath();
  const dir = path.dirname(proposalsPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const existing = loadProposals();
  const upserted = existing.filter((p) => p.id !== proposal.id);
  upserted.push(proposal);
  fs.writeFileSync(proposalsPath, JSON.stringify(upserted, null, 2) + '\n', 'utf8');
}

export function findProposalById(id: string): Proposal | null {
  return loadProposals().find((p) => p.id === id) ?? null;
}

export function listProposals(): Proposal[] {
  return loadProposals();
}
