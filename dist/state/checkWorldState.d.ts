export interface IntegrityIssue {
    code: string;
    severity: 'error' | 'warning';
    file: string;
    message: string;
    referenceId?: string;
}
export interface IntegrityResult {
    ok: boolean;
    status: 'passed' | 'failed';
    summary: {
        filesChecked: number;
        issues: number;
        warnings: number;
    };
    issues: IntegrityIssue[];
    safety: {
        externalWrite: false;
    };
}
export interface CheckOptions {
    worldloopsDir?: string;
}
export declare function checkWorldState(options?: CheckOptions): IntegrityResult;
export declare function checkReceipts(options?: CheckOptions): IntegrityResult;
