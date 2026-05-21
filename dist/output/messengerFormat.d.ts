import type { ProposalCandidate } from '../types';
export interface MessengerOutputData {
    ok: boolean;
    candidates: ProposalCandidate[];
    openLoopCount: number;
    receiptsGenerated: number;
    proposalsPersisted: number;
    proposalsAlreadyTracked: number;
}
export declare function printMessengerOutput(data: MessengerOutputData): void;
