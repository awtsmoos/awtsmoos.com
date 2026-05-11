
// B"H
/**
 * @file IterationBackground.js
 * @brief The Observer of the Local Realm.
 */

import { State } from '../../../state.js';
import { TreeSurveyor } from '../../agent/executors/fs/TreeSurveyor.js';
import { PathEngine } from '../../../core/paths/PathEngine.js';

export const IterationBackground = {
    /**
     * B"H - Illuminates the local project context.
     */
    async illuminate(tab, onProgress) {
        const wsId = tab.item?.workspaceId || tab.item?.id;
        const ws = State.workspaces.find(w => String(w?.id) === String(wsId));
        
        if (!ws) return "";

        // B"H - Force extraction of the true path
        const sessPath = PathEngine.toSafeString(tab.item?.path || "/");
        const coreType = ws.originalType || ws.type;

        try {
            if (onProgress) onProgress('Awakening sight for: ' + sessPath);
            
            const rootItem = { ...ws, path: sessPath, kind: 'directory', type: coreType };
            const treeStr = await TreeSurveyor.build(rootItem);
            
            const isEmpty = !treeStr || treeStr.trim() === "" || treeStr.indexOf("Empty") !== -1;
            
            let directive = '\n\n--- ⚠️ CRITICAL PROJECT BOUNDARY MAP ⚠️ ---\n';
            directive += `YOUR ROOT "/" IS PERMANENTLY ANCHORED TO THE SUBFOLDER: ${sessPath}\n`;
            directive += `All operations on "/" refer to this physical location.\n\n`;

            if (isEmpty) {
                directive += '[THE DIRECTORY IS VOID]. Create your first vessel.\n';
            } else {
                directive += 'STRUCTURE (Relative to your "/"):\n' + treeStr + '\n\n';
                
                const { ContextGenerator } = await import('../../../file-ops/context-generator.js');
                if (onProgress) onProgress('Gathering context from: ' + sessPath);
                
                const fullEssence = await ContextGenerator.generate([rootItem], sessPath);
                
                if (fullEssence && fullEssence.length < 40000) { 
                    directive += 'PROJECT DATA (Relative to your "/"):\n' + fullEssence + '\n';
                } else if (fullEssence) {
                    directive += '[Project data is vast. Use tools to read specific segments.]\n';
                }
                
                directive += '\n**NOTE:** Use the map above. Do NOT call \'list_files_tree\' initially.\n';
            }
            
            directive += '------------------------------------\n';
            return directive;

        } catch(e) {
            console.error('[IterationBackground] B"H - Illumination Shattered: ', e);
            return '\n\n[Sight Obscured: ' + e.message + ']\n';
        }
    }
};
