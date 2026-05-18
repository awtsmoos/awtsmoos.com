
// B"H
/**
 * @file FileSystemExecutor.js
 * @brief THE DISPATCHER OF EARTHLY DEEDS.
 */

import { FileSystemProvider } from '../../../fs-provider.js';
import { ContextGenerator } from '../../../file-ops/context-generator.js';
import { ArchitectOfDomains } from '../../modules/loop/engine/ArchitectOfDomains.js';
import { TreeSurveyor } from './fs/TreeSurveyor.js';
import { ConnectedVessels } from './fs/ConnectedVessels.js';

export const FileSystemExecutor = {
    async execute(name, args, ws, coreType, resolvePath, onProgress, tab = null) {
        const itemArgs = { ...ws, type: coreType };
        const sess = tab?.vibeSession || null;
        const getCwd = () => (sess?.agentCwd || '/');
        const setCwd = (cwd) => { if (sess) sess.agentCwd = cwd; };

        const toRel = (abs) => {
            const root = ws.path === '/' ? '' : ws.path;
            if (!root) return abs || '/';
            if (!abs.startsWith(root)) return abs;
            const rel = abs.slice(root.length) || '/';
            return rel.startsWith('/') ? rel : '/' + rel;
        };

        const resolveFromCwd = (pathLike = '') => {
            if (!pathLike || pathLike === '.') return resolvePath(getCwd());
            if (pathLike.startsWith('/')) return resolvePath(pathLike);
            const cwd = getCwd().replace(/\/+$/, '') || '/';
            const combined = cwd === '/' ? `/${pathLike}` : `${cwd}/${pathLike}`;
            return resolvePath(combined);
        };
        
        switch (name) {
            case "set_working_directory": {
                const abs = resolvePath(args.directory_path || '/');
                const dirItem = { ...itemArgs, path: abs, kind: 'directory' };
                await FileSystemProvider.readDir(dirItem);
                const rel = toRel(abs);
                setCwd(rel);
                return `[B"H Success] Working directory set to ${rel}`;
            }

            case "run_terminal_command": {
                const raw = String(args.command || '').trim();
                if (!raw) return '[B"H Error] Empty command.';

                const cwdAbs = args.cwd ? resolvePath(args.cwd) : resolveFromCwd('.');
                const cwdRel = toRel(cwdAbs);
                if (args.cwd) setCwd(cwdRel);

                const [cmd, ...rest] = raw.split(/\s+/);
                const subPath = rest[0] || '.';

                if (cmd === 'pwd') return cwdRel;

                if (cmd === 'ls') {
                    const abs = resolveFromCwd(subPath);
                    const dir = await FileSystemProvider.readDir({ ...itemArgs, path: abs, kind: 'directory' });
                    return dir.map(d => `${d.kind === 'directory' ? 'd' : 'f'} ${d.name}`).join('\n');
                }

                if (cmd === 'tree') {
                    const abs = resolveFromCwd(subPath);
                    return await TreeSurveyor.build({ ...itemArgs, path: abs, kind: 'directory' });
                }

                if (cmd === 'cat') {
                    const abs = resolveFromCwd(subPath);
                    const rawData = await FileSystemProvider.read({ ...itemArgs, path: abs, kind: 'file' });
                    return (rawData instanceof Blob) ? await rawData.text() : String(rawData);
                }

                if (cmd === 'head' || cmd === 'tail') {
                    const nRaw = Number(rest[1] || 20);
                    const n = Number.isFinite(nRaw) && nRaw > 0 ? nRaw : 20;
                    const abs = resolveFromCwd(subPath);
                    const rawData = await FileSystemProvider.read({ ...itemArgs, path: abs, kind: 'file' });
                    const lines = ((rawData instanceof Blob) ? await rawData.text() : String(rawData)).split('\n');
                    const out = cmd === 'head' ? lines.slice(0, n) : lines.slice(-n);
                    return out.join('\n');
                }

                if (cmd === 'grep') {
                    const query = rest[0];
                    const base = rest[1] || '.';
                    if (!query) return '[B"H Error] grep requires a query.';
                    const absDir = resolveFromCwd(base);
                    const allFiles = await FileSystemProvider.listAllFiles({ ...itemArgs, path: absDir, kind: 'directory' });
                    const hits = [];
                    for (const f of allFiles) {
                        try {
                            const rawData = await FileSystemProvider.read({ ...itemArgs, path: f.path, kind: 'file' });
                            const text = (rawData instanceof Blob) ? await rawData.text() : String(rawData);
                            const lines = text.split('\n');
                            for (let i = 0; i < lines.length; i++) {
                                if (lines[i].includes(query)) {
                                    hits.push(`${toRel(f.path)}:${i + 1}: ${lines[i].trim()}`);
                                    if (hits.length >= 300) return hits.join('\n');
                                }
                            }
                        } catch (e) {}
                    }
                    return hits.length ? hits.join('\n') : `No matches for "${query}".`;
                }

                return `[B"H Error] Unsupported terminal command: ${cmd}. Supported: pwd, ls, tree, cat, grep, head, tail`;
            }


            case "semantic_outline": {
                if (onProgress) onProgress('Outlining: ' + args.path);
                const abs = resolvePath(args.path);
                return JSON.stringify(await FileSystemProvider.astOutline({ ...itemArgs, path: abs, kind: 'file' }), null, 2);
            }

            case "semantic_search": {
                if (onProgress) onProgress('Semantic search: ' + args.query);
                const abs = resolvePath(args.path || args.directory_path || '/');
                return JSON.stringify(await FileSystemProvider.semanticSearch({ ...itemArgs, path: abs, kind: 'directory' }, args.query, { limit: args.limit }), null, 2);
            }

            case "dependency_graph": {
                if (onProgress) onProgress('Building dependency graph: ' + args.path);
                const abs = resolvePath(args.path);
                return JSON.stringify(await FileSystemProvider.dependencyGraph({ ...itemArgs, path: abs, kind: 'file' }, { maxFiles: args.max_files, maxDepth: args.max_depth }), null, 2);
            }

            case "file_hashes": {
                const rawPaths = Array.isArray(args.paths) ? args.paths : [args.path].filter(Boolean);
                const paths = rawPaths.map(pth => resolvePath(pth));
                return JSON.stringify(await FileSystemProvider.fileHashes({ ...itemArgs, path: paths[0] || resolvePath('/'), kind: 'file' }, { paths }), null, 2);
            }

            case "replace_range": {
                if (onProgress) onProgress('Patching range: ' + args.path);
                const abs = resolvePath(args.path);
                const result = await FileSystemProvider.replaceRange({ ...itemArgs, path: abs, kind: 'file' }, {
                    start: args.start,
                    end: args.end,
                    replacement: args.replacement,
                    expectedSha256: args.expectedSha256
                });
                return JSON.stringify(result, null, 2);
            }

            case "apply_patch": {
                if (onProgress) onProgress('Applying patch: ' + args.path);
                const abs = resolvePath(args.path);
                const result = await FileSystemProvider.applyPatch({ ...itemArgs, path: abs, kind: 'file' }, {
                    patches: args.patches,
                    expectedSha256: args.expectedSha256
                });
                return JSON.stringify(result, null, 2);
            }

            case "read_file_chunk": {
                if (onProgress) onProgress('Slicing: ' + args.path);
                const abs = resolvePath(args.path);
                const raw = await FileSystemProvider.read({ ...itemArgs, path: abs, kind: 'file' });
                const text = (raw instanceof Blob) ? await raw.text() : String(raw);
                const lines = text.split('\n');
                
                const start = Math.max(0, args.start_line - 1);
                const end = Math.min(lines.length, args.end_line);
                const sliced = lines.slice(start, end).join('\n');
                
                return '### CHUNK: ' + args.path + ' (Lines ' + args.start_line + '-' + args.end_line + ')\n\n```\n' + sliced + '\n```';
            }

            case "search_in_files": {
                if (onProgress) onProgress('Searching for: "' + args.query + '"');
                const absDir = resolvePath(args.directory_path || '/');
                const dirItem = { ...itemArgs, path: absDir, kind: 'directory' };
                const allFiles = await FileSystemProvider.listAllFiles(dirItem);
                
                let matches = [];
                for (const f of allFiles) {
                    const ext = f.name.split('.').pop().toLowerCase();
                    if (['png', 'jpg', 'zip', 'mp4', 'exe', 'pdf'].includes(ext)) continue;
                    
                    try {
                        const content = await FileSystemProvider.read({ ...itemArgs, path: f.path, kind: 'file' });
                        const text = (content instanceof Blob) ? await content.text() : String(content);
                        
                        if (text.includes(args.query)) {
                            matches.push('#### MATCH: `' + f.path + '`');
                            // Extract snippets
                            const foundLines = text.split('\n').map((l, i) => [i + 1, l]).filter(pair => pair[1].includes(args.query));
                            foundLines.slice(0, 5).forEach(pair => {
                                matches.push('  Ln ' + pair[0] + ': ' + pair[1].trim().substring(0, 100));
                            });
                        }
                    } catch(e) {}
                }
                return matches.length > 0 ? matches.join('\n') : 'No results for "' + args.query + '" found.';
            }

            case "read_connected_vessels": {
                if (onProgress) onProgress("Tracing connected vessels...");
                const abs = resolvePath(args.path);
                const maxDepth = Number.isFinite(Number(args.max_depth)) ? Math.max(0, Number(args.max_depth)) : 2;
                return await ConnectedVessels.chase(ws, coreType, abs, maxDepth, onProgress);
            }

            case "list_files_tree": {
                if (onProgress) onProgress("Surveying dimensions...");
                const abs = resolvePath(args.path || '/');
                const item = { ...itemArgs, path: abs, kind: 'directory' };
                const tree = await TreeSurveyor.build(item);
                return 'Boundary Map [Target: ' + abs + ']:\n' + tree;
            }

            case "read_vessel": {
                if (onProgress) onProgress('Absorbing: ' + args.path);
                const abs = resolvePath(args.path);
                const raw = await FileSystemProvider.read({ ...itemArgs, path: abs, kind: 'file' });
                return (raw instanceof Blob) ? await raw.text() : String(raw);
            }

            case "bulk_read_markdown": {
                const abs = resolvePath(args.directory_path || '/');
                const item = { ...itemArgs, path: abs, kind: 'directory' };
                return await ContextGenerator.generate([item], abs, onProgress);
            }

            case "engrave_vessel": {
                if (onProgress) onProgress('Manifesting: ' + args.path);
                const abs = resolvePath(args.path);
                await ArchitectOfDomains.ensureExists(ws, abs, coreType);
                await FileSystemProvider.write({ ...itemArgs, path: abs, kind: 'file' }, args.content);
                return '[B"H Success] Vessel ' + args.path + ' (Internal: ' + abs + ') manifested.';
            }

            case "purge_vessel": {
                if (onProgress) onProgress('Purifying: ' + args.path);
                const abs = resolvePath(args.path);
                await FileSystemProvider.delete({ ...itemArgs, path: abs, kind: 'file' });
                return '[B"H Success] Coordinate ' + args.path + ' released.';
            }

            default: throw new Error("Divine schema mismatch: " + name);
        }
    }
};
