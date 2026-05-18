import type { NotificationPrefs, MinSeverity } from '../types';
export declare function getPrefsPath(): string;
export declare const DEFAULT_PREFS: NotificationPrefs;
export declare function loadPrefs(): NotificationPrefs;
export declare function savePrefs(prefs: NotificationPrefs): void;
export declare function initPrefs(): boolean;
export declare function setDotPath(obj: Record<string, unknown>, dotPath: string, value: unknown): void;
export declare function isInQuietHours(prefs: NotificationPrefs, now?: Date): boolean;
export declare function meetsSeverity(candidateSeverity: string | undefined, minSeverity: MinSeverity): boolean;
