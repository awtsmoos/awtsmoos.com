// B"H
/**
 * @file RuntimeExecutor.js
 * @brief Routes AI runtime tools into the virtual preview manager.
 */
import { PreviewRuntimeManager } from '../../runtime/PreviewRuntimeManager.js';

function asJson(value) {
    return JSON.stringify(value, null, 2);
}

export const RuntimeExecutor = {
    async execute(name, args, ws, coreType, resolvePath, tabId, onProgress = null) {
        const projectPath = args.project_path || args.path || '/';

        if (name === 'inspect_runtime') {
            onProgress?.(`Inspecting runtime at ${projectPath}`);
            return asJson(await PreviewRuntimeManager.inspect(ws, coreType, resolvePath(projectPath)));
        }

        if (name === 'launch_preview') {
            onProgress?.(`Launching preview for ${projectPath}`);
            const preview = await PreviewRuntimeManager.launch(ws, coreType, { ...args, project_path: resolvePath(projectPath) }, tabId);
            return asJson({
                ok: preview.status !== 'error',
                id: preview.id,
                kind: preview.kind,
                type: preview.type,
                url: preview.url,
                entry: preview.entry,
                port: preview.port || null,
                manifest: preview.manifest || null,
                message: preview.url ? `Preview URL: ${preview.url}` : preview.logs?.[0]
            });
        }

        if (name === 'list_previews') return asJson({ ok: true, previews: PreviewRuntimeManager.list() });
        if (name === 'preview_logs') return asJson({ ok: true, id: args.id, logs: PreviewRuntimeManager.logs(args.id) });
        if (name === 'stop_preview') {
            const stopped = PreviewRuntimeManager.stop(args.id);
            return asJson({ ok: !!stopped, preview: stopped });
        }
        if (name === 'restart_preview') {
            if (args.id) PreviewRuntimeManager.stop(args.id);
            const preview = await PreviewRuntimeManager.launch(ws, coreType, { ...args, project_path: resolvePath(projectPath) }, tabId);
            return asJson({ ok: preview.status !== 'error', preview, manifest: preview.manifest || null });
        }
        throw new Error(`Unhandled runtime tool: ${name}`);
    }
};
