
// B"H
/**
 * @file BackgroundIlluminator.js
 * @brief Gathers project context with absolute jailing and clear directives.
 */

import { State } from '../../../state.js';
import { PathEngine } from '../../../core/paths/PathEngine.js';
import { TreeSurveyor } from '../../agent/executors/fs/TreeSurveyor.js';

export const BackgroundIlluminator = {
    /**
     * B"H - Collects the tree and file content of the SESSION root.
     */
    async illuminate(tab, onProgress) {
        // B"H - Force extraction of the Workspace ID from the physical item
        const wsId = tab.item.workspaceId || tab.item.id;
        const ws = State.workspaces.find(w => String(w?.id) === String(wsId));
        
        if (!ws) throw new Error('B"H - Workspace anchor lost.');

        // B"H - THE CORE RECTIFICATION:
        // We completely ignore tab.vibeSession.path, as it may be corrupted from IndexedDB.
        // We use the tab.item.path, which is generated fresh on user click.
        const sessPath = PathEngine.toSafeString(tab.item.path || "/");
        const coreType = ws.originalType || ws.type;

        console.log('[BackgroundIlluminator] B"H - ILLUMINATING GARDEN: ' + sessPath);

        try {
            if (onProgress) onProgress('SURVEYING: ' + sessPath);
            
            const rootItem = { ...ws, path: sessPath, kind: 'directory', type: coreType };
            
            // The Surveyor uses the provider which respects the physical sessPath
            const tree = await TreeSurveyor.build(rootItem);
            
            // B"H - THE DIRECTIVE OF TRUTH
            // We explicitly tell the AI that its "/" maps to the sub-path.
            let directive = '\n\n--- ⚠️ CRITICAL PROJECT BOUNDARY MAP ⚠️ ---\n';
            directive += `YOUR ROOT "/" IS PERMANENTLY ANCHORED TO THE SUBFOLDER: ${sessPath}\n`;
            directive += `All operations on "/" refer to this physical location.\n`;
            directive += `You cannot access parent directories of this folder.\n\n`;
            
            directive += 'DIRECTORY STRUCTURE (Relative to your "/"):\n' + (tree || '[Folder is empty]') + '\n\n';
            
            const { ContextGenerator } = await import('../../../file-ops/context-generator.js');
            if (onProgress) onProgress('READING ESSENCE: ' + sessPath);
            
            // The ContextGenerator relativizes everything against sessPath!
            const essence = await ContextGenerator.generate([rootItem], sessPath);
            
            if (essence && essence.length < 45000) {
                directive += 'FILE CONTENTS (Relative to your "/"):\n' + essence + '\n';
            } else if (essence) {
                directive += '[Project content is extensive. Use tools for deep inspection.]\n';
            }

            directive += '------------------------------------\n';
            return directive;
        } catch (e) {
            console.error('[BackgroundIlluminator] B"H - Illumination failed: ', e);
            return '\n\n[Context gathered unsuccessfully: ' + e.message + ']\n';
        }
    }
};
