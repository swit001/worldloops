import type { ProposalCandidate } from './types';
export declare const DEFAULT_INBOX_DIR = ".worldloops/inbox";
export declare const SOURCES: ({
    id: "gmail";
    file: string;
    label: string;
    emoji: string;
} | {
    id: "calendar";
    file: string;
    label: string;
    emoji: string;
} | {
    id: "slack";
    file: string;
    label: string;
    emoji: string;
})[];
export type SourceId = 'gmail' | 'calendar' | 'slack';
export interface SourceResult {
    id: SourceId;
    label: string;
    emoji: string;
    file: string;
    found: boolean;
    ok: boolean;
    candidates: ProposalCandidate[];
    summaryLines: string[];
}
export declare function processSource(sourceId: SourceId, file: string, label: string, emoji: string, inboxDir: string): Promise<SourceResult>;
export declare function processAllSources(inboxDir: string): Promise<SourceResult[]>;
export declare function buildBriefLines(results: SourceResult[]): string[];
