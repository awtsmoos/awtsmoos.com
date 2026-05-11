
// B"H
/**
 * @file FileSystemExecutor.js
 * @brief THE DISPATCHER OF EARTHLY DEEDS.
 */

import { FileSystemProvider } from '../../../fs-provider.js';
import { ContextGenerator } from '../../../file-ops/context-generator.js';
import { ArchitectOfDomains } from '../../modules/loop/engine/ArchitectOfDomains.js';
import { TreeSurveyor } from './fs/TreeSurveyor.js';

export const FileSystemExecutor = {
    async execute(name, args, ws, coreType, resolvePath, onProgress) {
        const itemArgs = { ...ws, type: coreType };
        
        switch (name) {
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
