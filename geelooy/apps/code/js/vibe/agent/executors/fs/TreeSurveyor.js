
// B"H
/**
 * @file TreeSurveyor.js
 * @brief THE SCRIBE OF THE PROJECT SKELETON.
 * 
 * THE POEM OF THE SURVEYED LAND:
 * We do not wander with blind eyes or hand,
 * We survey the structure of this holy land.
 * Every directory is a sphere of thought,
 * Every file is a vessel that the Scribe has wrought.
 * We map out the branches, we name every leaf,
 * To banish the shadows and the AI's grief.
 */

import { FileSystemProvider } from '../../../../fs-provider.js';

/**
 * @class TreeSurveyor
 * @description Generates a textual representation of a directory tree.
 */
export class TreeSurveyor {
    /**
     * B"H - Recursively builds the ASCII tree.
     */
    static async build(item, depth = 0, maxDepth = 4) {
        if (depth > maxDepth) return '  '.repeat(depth) + '... [Structure continues deeper]\n';
        
        let str = "";
        try {
            const res = await FileSystemProvider.list(item);
            const children = Array.isArray(res) ? res : (res.entries || []);
            
            // Seder: Directories first, then alphabetical
            children.sort((a,b) => {
                if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
                return (a.name || "").localeCompare(b.name || "");
            });
            
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                // Hide common noise to preserve clarity
                if (['node_modules', '.git', '.awtsmoos-repo', 'dist', '.DS_Store'].includes(child.name)) continue;
                
                const icon = child.kind === 'directory' ? '📁 ' : '📄 ';
                str += '  '.repeat(depth) + icon + child.name + '\n';
                
                if (child.kind === 'directory') {
                    const childPath = (item.path === '/' ? '' : item.path) + '/' + child.name;
                    const subTree = await this.build({ ...item, ...child, path: childPath }, depth + 1, maxDepth);
                    str += subTree;
                }
            }
        } catch(e) {
            str += '  '.repeat(depth) + '[Access Denied: ' + e.message + ']\n';
        }
        return str;
    }
}
