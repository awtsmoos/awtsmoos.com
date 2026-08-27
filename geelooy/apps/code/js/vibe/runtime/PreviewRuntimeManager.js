// B"H
/**
 * @file PreviewRuntimeManager.js
 * @brief Provider-neutral preview launcher for static, frontend, and backend apps.
 */
import { RuntimeRegistry } from './RuntimeRegistry.js';
import { RuntimeDetector } from './RuntimeDetector.js';
import { RuntimeManifest } from './RuntimeManifest.js';
import { StaticPreviewBuilder } from './StaticPreviewBuilder.js';
import { BackendPreviewBuilder } from './BackendPreviewBuilder.js';

export const PreviewRuntimeManager = {
    async inspect(ws, coreType, projectPath = '/') {
        const detected = await RuntimeDetector.detect(ws, coreType, projectPath || '/');
        return RuntimeManifest.create(detected, { projectPath });
    },

    async launch(ws, coreType, args = {}, tabId = null) {
        const projectPath = args.project_path || args.path || '/';
        const detected = await RuntimeDetector.detect(ws, coreType, projectPath);
        const manifest = RuntimeManifest.create(
            { ...detected, ...(args.manifest || {}) },
            { projectPath, ...(args.manifest || {}) }
        );

        if (manifest.kind === 'unknown') {
            return RuntimeRegistry.create({
                kind: 'unknown',
                type: 'unknown',
                status: 'error',
                projectPath,
                entry: null,
                url: null,
                manifest,
                logs: ['No runnable app entry was detected. Add index.html, package.json, or server.js.']
            });
        }

        const built = manifest.kind === 'backend' || manifest.kind === 'fullstack'
            ? await BackendPreviewBuilder.build(ws, coreType, manifest, tabId)
            : await StaticPreviewBuilder.build(ws, coreType, manifest);

        const previewSeed = {
            id: built.id,
            status: built.status || 'running',
            url: built.url,
            localUrl: built.url,
            virtualUrl: built.objectUrl || built.url,
            chatgptFetchUrl: built.chatgptFetchUrl || null,
            chatgptLogsUrl: built.chatgptLogsUrl || null,
            chatgptStopUrl: built.chatgptStopUrl || null,
            chatgptRestartUrl: built.chatgptRestartUrl || null,
            publicUrl: built.publicUrl || null
        };

        const resolvedManifest = RuntimeManifest.withPreview(manifest, previewSeed);

        return RuntimeRegistry.create({
            kind: resolvedManifest.kind,
            type: resolvedManifest.type,
            projectPath,
            entry: built.entry,
            url: built.url,
            objectUrl: built.objectUrl || null,
            pid: built.pid || null,
            port: built.port || null,
            manifest: resolvedManifest,
            logs: built.logs || []
        });
    },

    logs(id) {
        const preview = RuntimeRegistry.get(id);
        return preview ? preview.logs : [`Preview not found: ${id}`];
    },

    stop(id) {
        return RuntimeRegistry.stop(id);
    },

    list() {
        return RuntimeRegistry.list();
    }
};
