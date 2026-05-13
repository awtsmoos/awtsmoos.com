
// B"H
/**
 * @file SecretGuard.js
 * @description
 * Blocks dangerous files from automatic GitHub sync.
 */

const DANGEROUS_PATTERNS = [
    /\.env$/i,
    /\.pem$/i,
    /\.key$/i,
    /service.*account.*\.json$/i,
    /firebase.*admin.*\.json$/i,
    /credentials?\.json$/i,
    /private.*key/i
];

export const SecretGuard = {
    isDangerousPath(path) {
        return DANGEROUS_PATTERNS.some((pattern) => pattern.test(String(path || '')));
    },

    scanChanges(changes = []) {
        const blocked = changes.filter((change) => this.isDangerousPath(change.file || change.path || ''));
        return {
            ok: blocked.length === 0,
            blocked
        };
    }
};
