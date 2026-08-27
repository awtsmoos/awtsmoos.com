// B"H
/**
 * @file RuntimeSnapshot.js
 * @brief Compresses preview reality into evidence an agent can judge.
 */

/**
 * Creates provider-neutral runtime snapshots from manifests, previews, and logs.
 */
export const RuntimeSnapshot = {
    /**
     * Captures the visible runtime facts available inside the editor process.
     *
     * @param {object} input Snapshot input.
     * @param {object} [input.project] Static project inspection.
     * @param {object} [input.manifest] Runtime manifest.
     * @param {object} [input.preview] Preview object.
     * @param {Array<string>} [input.logs] Runtime logs.
     * @returns {object} Snapshot record.
     */
    capture(input = {}) {
        const logs = Array.isArray(input.logs) ? input.logs : input.preview?.logs || [];
        const errors = logs.filter(line => /error|failed|exception|missing|not found/i.test(String(line)));
        const url = input.preview?.url || input.preview?.localUrl || input.manifest?.urls?.local || null;

        return {
            capturedAt: new Date().toISOString(),
            project: input.project || null,
            importVerification: input.importVerification || input.imports || null,
            manifest: input.manifest || null,
            preview: input.preview ? {
                id: input.preview.id || null,
                status: input.preview.status || null,
                kind: input.preview.kind || input.manifest?.kind || null,
                type: input.preview.type || input.manifest?.type || null,
                url,
                publicUrl: input.preview.publicUrl || input.manifest?.urls?.public || null
            } : null,
            health: {
                hasRunnableEntry: !!(input.manifest?.entry || input.project?.hasIndexHtml || input.project?.hasPackageJson),
                hasPreviewUrl: !!url,
                status: input.preview?.status || (url ? 'running' : 'unknown'),
                errorCount: errors.length,
                errors
            },
            logs
        };
    }
};
