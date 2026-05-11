
// B"H
/**
 * @file TreeBuilder.js
 * @brief THE SCRIBE OF THE PROJECT SKELETON.
 * 
 * THE POEM OF THE MAPPED REALITY:
 * We walk through the folders, we see every door,
 * From the roof of the project to the physical floor.
 * Each branch is a pathway, each leaf is a name,
 * Revealed in this structure, within the AI's frame.
 * No need to guess where the logic may be,
 * For the scribe has manifested the project as a Tree!
 */

import { FileSystemProvider } from '../../../../fs-provider.js';

/**
 * @class TreeBuilder
 * @description Generates a textual representation of a directory tree.
 */
export class TreeBuilder {
    /**
     * B"H - Recursively builds the ASCII tree.
     */
    static async build(item, depth = 0, maxDepth = 4) {
        if (depth > maxDepth) return "  ".repeat(depth) + "... [Structure Hidden]\n";
        
        let str = "";
        try {
            const res = await FileSystemProvider.list(item);
            const children = Array.isArray(res) ? res : (res.entries || []);
            
            children.sort((a,b) => (a.kind === 'directory' ? -1 : 1) || a.name.localeCompare(b.name));
            
            for (const child of children) {
                if (['node_modules', '.git', '.awtsmoos-repo', 'dist'].includes(child.name)) continue;
                
                const icon = child.kind === 'directory' ? '📁 ' : '📄 ';
                str += "  ".repeat(depth) + icon + child.name + "\n";
                
                if (child.kind === 'directory') {
                    const childPath = (item.path === '/' ? '' : item.path) + '/' + child.name;
                    const subTree = await this.build({ ...item, ...child, path: childPath }, depth + 1, maxDepth);
                    str += subTree;
                }
            }
        } catch(e) {
            str += "  ".repeat(depth) + `[Access Error: ${e.message}]\n`;
        }
        return str;
    }
}
