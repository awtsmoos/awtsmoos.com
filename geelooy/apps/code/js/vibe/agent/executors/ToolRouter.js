// B"H
/**
 * @file ToolRouter.js
 * @brief THE DISPATCHER OF THE ANCHORED WILL.
 */

import { State } from '../../../state.js';
import { FileSystemExecutor } from './FileSystemExecutor.js';
import { TestingExecutor } from './TestingExecutor.js';
import { OrchestrationExecutor } from './OrchestrationExecutor.js';
import { PathJailer } from './PathJailer.js';

export const ToolRouter = {
    /**
     * B"H - Channels AI intent to action with absolute boundary enforcement.
     */
    async execute(name, args, tab, onProgress = null) {
        try {
            console.log('%cB"H [ToolRouter] --- RITUAL: ' + name + ' ---', "color: #00f6ff; font-weight: bold;");

            if (!tab || !tab.item) throw new Error('B"H - Logical error: Tab context is null.');

            const wsId = tab.item.workspaceId || tab.item.id;

            if (wsId === undefined || wsId === null) {
                throw new Error('Physical world ID is missing. The garden has no anchor.');
            }

            const ws = State.workspaces.find(w => String(w.id) === String(wsId));
            
            if (!ws) {
                throw new Error('The world of ' + wsId + ' has vanished from the active Registry.');
            }
            
            const coreType = ws.originalType || ws.type;
            const resolvePath = (p) => PathJailer.jail(p, tab.item);

            const fsTools = [
                'list_files_tree', 'read_vessel', 'bulk_read_markdown', 
                'read_connected_vessels', 'search_essence', 'engrave_vessel', 'purge_vessel'
            ];
            
            if (fsTools.includes(name)) {
                // Pass onProgress directly to FS Executor
                return await FileSystemExecutor.execute(name, args, ws, coreType, resolvePath, onProgress);
            }
            
            if (name === 'run_ui_test') {
                return await TestingExecutor.execute(name, args, ws, coreType, resolvePath, tab.id, onProgress);
            }
            
            const metaTools = [
                'get_model_usage_limits', 'shift_consciousness', 
                'consult_oracle', 'continue_autonomous_loop'
            ];
            
            if (metaTools.includes(name)) {
                return await OrchestrationExecutor.execute(name, args, onProgress);
            }

            return '[B"H Error] Ritual \'' + name + '\' is not in the Divine Registry.';
            
        } catch (e) {
            console.error('[ToolRouter] B"H - Shevirah during ' + name + ': ', e);
            return '[B"H Error] Manifestation failed: ' + e.message;
        }
    }
};