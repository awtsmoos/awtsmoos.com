// B"H
/**
 * @file ToolRouter.js
 * @brief Dispatches AI tool calls to filesystem, runtime, workflow, cognition, testing, and orchestration executors.
 */
import { State } from '../../../state.js';
import { FileSystemExecutor } from './FileSystemExecutor.js';
import { TestingExecutor } from './TestingExecutor.js';
import { OrchestrationExecutor } from './OrchestrationExecutor.js';
import { RuntimeExecutor } from './RuntimeExecutor.js';
import { WorkflowExecutor } from './WorkflowExecutor.js';
import { CognitionExecutor } from './CognitionExecutor.js';
import { PathJailer } from './PathJailer.js';

const fsTools = [
    'list_files_tree', 'read_vessel', 'bulk_read_markdown',
    'read_connected_vessels', 'search_essence', 'engrave_vessel', 'purge_vessel',
    'read_file_chunk', 'search_in_files', 'set_working_directory', 'run_terminal_command',
    'semantic_outline', 'semantic_search', 'dependency_graph', 'file_hashes', 'replace_range', 'apply_patch'
];

const runtimeTools = [
    'inspect_runtime', 'launch_preview', 'list_previews',
    'preview_logs', 'stop_preview', 'restart_preview'
];

const testingTools = [
    'run_ui_test', 'run_node_script', 'run_command_batch'
];

const workflowTools = [
    'run_semantic_workflow', 'run_command_tree',
    'ai_command_batch', 'assert_runtime_contracts'
];

const metaTools = [
    'get_model_usage_limits', 'shift_consciousness',
    'consult_oracle', 'continue_autonomous_loop',
    'get_provider_status', 'get_provider_telemetry', 'get_registered_keys',
    'shift_consciousness_by_provider'
];

export const ToolRouter = {
    /**
     * B"H. Channels AI intent to action with workspace anchoring and path jailing.
     */
    async execute(name, args, tab, onProgress = null) {
        try {
            console.log('%cB"H [ToolRouter] --- RITUAL: ' + name + ' ---', 'color: #00f6ff; font-weight: bold;');

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

            if (fsTools.includes(name)) {
                return await FileSystemExecutor.execute(name, args, ws, coreType, resolvePath, onProgress, tab);
            }

            if (runtimeTools.includes(name)) {
                return await RuntimeExecutor.execute(name, args, ws, coreType, resolvePath, tab.id, onProgress);
            }

            if (testingTools.includes(name)) {
                return await TestingExecutor.execute(name, args, ws, coreType, resolvePath, tab.id, onProgress);
            }

            if (workflowTools.includes(name)) {
                return await WorkflowExecutor.execute(name, args, tab);
            }

            if (CognitionExecutor.has(name)) {
                return await CognitionExecutor.execute(name, args, ws, coreType, resolvePath, tab, onProgress);
            }

            if (metaTools.includes(name)) {
                return await OrchestrationExecutor.execute(name, args, onProgress);
            }

            return '[B"H Error] Ritual "' + name + '" is not in the Divine Registry.';
        } catch (e) {
            console.error('[ToolRouter] B"H - Shevirah during ' + name + ': ', e);
            return '[B"H Error] Manifestation failed: ' + e.message;
        }
    }
};
