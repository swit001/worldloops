import type { Proposal } from '../types/proposal';
export declare function getProposalsPath(): string;
export declare function loadProposals(): Proposal[];
export declare function saveProposal(proposal: Proposal): void;
export declare function findProposalById(id: string): Proposal | null;
export declare function listProposals(): Proposal[];
