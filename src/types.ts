export type SignalSource =
  | 'slack'
  | 'gmail'
  | 'calendar'
  | 'github'
  | 'manual';

export interface Signal {
  source: SignalSource;
  text: string;
  url?: string;
  createdAt?: string;
}

export interface OpenLoop {
  source: SignalSource;
  text: string;
  reason: string;
}

export interface ProposalCandidate {
  idempotencyKey: string;
  entityType: string;
  source: SignalSource;
  currentState: string;
  proposedState: string;
  reason: string;
  approvalRequired: boolean;
  actionHint: string;
}

export interface WorldLoopsBriefResponse {
  ok: boolean;
  mode?: string;
  source?: string;
  brief?: string;
  openLoops?: OpenLoop[];
  proposalCandidates?: ProposalCandidate[];
  metadata?: Record<string, unknown>;
  safety: {
    externalWrite: false;
    note?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}
