// B"H
/**
 * @file ConnectedVessels.js
 * @brief THE RITUAL OF THE RECURSIVE CHASE.
 */

import { FileSystemProvider } from '../../../../fs-provider.js';
import { ParserFactory } from '../../../../selection/connected-seeker/parsers/factory.js';
import { SeekerPathMapper } from '../../../../selection/connected-seeker/path-mapper.js';

export class ConnectedVessels {
    /**
     * B"H - Traces the dependencies of a starting vessel.
     */
    static async chase(ws, type, startPath, maxDepth, onProgress) {
        const visited = new Set();
        const results = [];
        const queue = [{ path: startPath, depth: 0 }];

        while (queue.length > 0) {
            const current = queue.shift();
            const path = current.path;
            const depth = current.depth;

            if (visited.has(path) || depth > maxDepth) continue;
            visited.add(path);

            if (onProgress) onProgress(`Chasing chain: ${path.split('/').pop()} (Depth ${depth})`);

            try {
                const item = { ...ws, path: path, kind: 'file', type: type };
                const raw = await FileSystemProvider.read(item);
                const content = (raw instanceof Blob) ? await raw.text() : String(raw);

                let entry = '### File: `' + path + '` (Depth: ' + depth + ')\n\n';
                entry += '```\n' + content.trim() + '\n```\n\n---\n';
                results.push(entry);

                if (depth < maxDepth) {
                    const links = await ParserFactory.extract(item, content);
                    for (let j = 0; j < links.length; j++) {
                        const link = links[j];
                        const resolved = await SeekerPathMapper.resolve(item, link);
                        if (resolved && !visited.has(resolved.path)) {
                            queue.push({ path: resolved.path, depth: depth + 1 });
                        }
                    }
                }
            } catch (e) {
                results.push('### [Error Reading: ' + path + ']\n' + e.message + '\n\n---\n');
            }
        }

        return 'B"H - Dependency Web for ' + startPath + ' (Depth: ' + maxDepth + '):\n\n' + results.join('\n');
    }
}