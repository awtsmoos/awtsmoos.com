// B"H
/**
 * @file RuntimeDetector.js
 * @brief Detects app runtime from a virtual filesystem workspace.
 */
import { joinVirtualPath } from './RuntimePath.js';
import { findFirstExisting, readJsonIfExists } from './RuntimeProviderIO.js';

const SERVER_ENTRIES = ['server.js', 'index.js', 'app.js', 'api.js'];
const STATIC_ENTRIES = ['index.html', 'public/index.html', 'dist/index.html'];

function scriptIncludes(pkg, needle) {
    return Object.values(pkg?.scripts || {}).some(script => String(script).includes(needle));
}

export const RuntimeDetector = {
    async detect(ws, coreType, projectPath = '/') {
        const pkg = await readJsonIfExists(ws, coreType, joinVirtualPath(projectPath, 'package.json'));

        if (pkg) {
            const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
            if (deps.vite || scriptIncludes(pkg, 'vite')) {
                return { kind: 'frontend', type: 'vite', projectPath, entry: joinVirtualPath(projectPath, 'index.html'), command: pkg.scripts?.dev || 'npm run dev', port: 5173 };
            }
            if (deps.next || scriptIncludes(pkg, 'next')) {
                return { kind: 'fullstack', type: 'next', projectPath, entry: joinVirtualPath(projectPath, 'package.json'), command: pkg.scripts?.dev || 'npm run dev', port: 3000 };
            }
            const serverHit = await findFirstExisting(ws, coreType, projectPath, SERVER_ENTRIES);
            if (serverHit || deps.express || deps.fastify || deps.hono) {
                return { kind: 'backend', type: 'node-server', projectPath, entry: serverHit?.path || joinVirtualPath(projectPath, 'index.js'), command: pkg.scripts?.start || 'node index.js', port: 3000 };
            }
        }

        const staticHit = await findFirstExisting(ws, coreType, projectPath, STATIC_ENTRIES);
        if (staticHit) {
            return { kind: 'static', type: 'static-html', projectPath, entry: staticHit.path, command: null, port: null };
        }

        const serverHit = await findFirstExisting(ws, coreType, projectPath, SERVER_ENTRIES);
        if (serverHit) {
            return { kind: 'backend', type: 'node-server', projectPath, entry: serverHit.path, command: `node ${serverHit.path}`, port: 3000 };
        }

        return { kind: 'unknown', type: 'unknown', projectPath, entry: null, command: null, port: null };
    }
};
