// B"H
/**
 * @file RuntimeManifest.js
 * @brief Creates self-describing virtual app manifests for editor, tunnel, and GPT preview orchestration.
 */

function normalizePath(path = '/') {
    const value = String(path || '/').replace(/\\/g, '/');
    return value.startsWith('/') ? value : `/${value}`;
}

function now() {
    return new Date().toISOString();
}

export const RuntimeManifest = {
    /**
     * B"H
     * Builds a durable manifest that describes how a generated app may be inspected,
     * previewed, restarted, logged, tested, and eventually promoted to a hosted runtime.
     *
     * @param {object} detected Runtime detection result.
     * @param {object} overrides Optional caller-provided values.
     * @returns {object} Self-describing runtime manifest.
     */
    create(detected = {}, overrides = {}) {
        const projectPath = normalizePath(overrides.projectPath || detected.projectPath || '/');
        const kind = overrides.kind || detected.kind || 'unknown';
        const type = overrides.type || detected.type || 'unknown';
        const port = overrides.port ?? detected.port ?? null;

        return {
            schema: 'awtsmoos.vibe.runtime',
            version: 1,
            createdAt: overrides.createdAt || now(),
            updatedAt: now(),
            projectPath,
            kind,
            type,
            entry: overrides.entry || detected.entry || null,
            command: overrides.command || detected.command || null,
            port,
            urls: {
                local: overrides.localUrl || null,
                virtual: overrides.virtualUrl || null,
                chatgptFetch: overrides.chatgptFetchUrl || null,
                logs: overrides.logsUrl || null,
                stop: overrides.stopUrl || null,
                restart: overrides.restartUrl || null,
                public: overrides.publicUrl || null
            },
            runtime: {
                virtualFirst: true,
                supportsOfflineBrowserStorage: true,
                supportsBackend: kind === 'backend' || kind === 'fullstack',
                supportsStaticPreview: kind === 'static' || kind === 'frontend' || kind === 'fullstack',
                processMode: kind === 'backend' || kind === 'fullstack'
                    ? 'virtual-node-or-tunnel'
                    : 'browser-blob-or-static-server'
            },
            safety: {
                requiresUserMachineForLocalhost: !!overrides.requiresUserMachineForLocalhost,
                tunnelMediated: !!overrides.chatgptFetchUrl,
                publicUrlRequiresBroker: !overrides.publicUrl
            },
            metadata: overrides.metadata || {}
        };
    },

    withPreview(manifest, preview = {}) {
        const urls = manifest.urls || {};
        return {
            ...manifest,
            updatedAt: now(),
            previewId: preview.id || manifest.previewId || null,
            status: preview.status || manifest.status || 'running',
            urls: {
                ...urls,
                local: preview.localUrl || preview.url || urls.local || null,
                virtual: preview.virtualUrl || urls.virtual || null,
                chatgptFetch: preview.chatgptFetchUrl || urls.chatgptFetch || null,
                logs: preview.chatgptLogsUrl || preview.logsUrl || urls.logs || null,
                stop: preview.chatgptStopUrl || preview.stopUrl || urls.stop || null,
                restart: preview.chatgptRestartUrl || preview.restartUrl || urls.restart || null,
                public: preview.publicUrl || urls.public || null
            }
        };
    }
};
