
// B"H
import { normalizePath } from './path.js';

export function makeProviderItem(env, path, kind = 'file') {
    return {
        ...env.workspace,
        type: env.workspaceType,
        originalType: env.workspace.originalType || env.workspace.type,
        path: normalizePath(path),
        kind
    };
}
