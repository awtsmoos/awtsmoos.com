
// B"H
/**
 * @file IterationRunner.js
 * @brief THE ROOT ENGINE OF AI ITERATION.
 * 
 * CHAPTER LX: THE DELEGATION OF POWER
 * The Runner had grown too vast, carrying the weight of Initialization, 
 * Streaming, and Finalization all within its singular body. 
 * We now perform an act of Tzimtzum (Contraction), splitting these 
 * duties into specialized Sefirot (modules), leaving the Runner as 
 * the pure Keter (Crown) that directs the flow.
 */

import { UI } from '../../../ui.js';
import { ModelManager } from '../../model-manager.js';
import { AutoLoopState } from '../../agent/state/AutoLoopState.js';
import { IterationInitializer } from './IterationInitializer.js';
import { IterationStream } from './IterationStream.js';
import { IterationFinalizer } from './IterationFinalizer.js';
import { VibeAPI } from '../../api/client.js';
import { ToolSchemas } from '../../agent/schemas/index.js';
import { AgentRoleRegistry } from '../../agent/state/AgentRoleRegistry.js';

export const IterationRunner = {
    /**
     * B"H - Conducts the ritual of thought-manifestation.
     * @param {Object} tab - The Vibe Session tab.
     * @param {Object} controller - The overarching VibeController.
     * @param {string|null} promptOverride - Injection for user requests.
     * @param {boolean} isAutonomousLoop - True if called recursively.
     */
    async run(tab, controller, promptOverride = null, isAutonomousLoop = false) {
        console.log('%cB"H [IterationRunner] --- STARTING CYCLE ---', "color: #00f6ff; font-weight: bold;");

        if (!tab || !tab.vibeSession) return;
        
        if (!isAutonomousLoop) AutoLoopState.reset();
        
        if (!AutoLoopState.advance()) {
            tab.vibeSession.isProcessing = false;
            controller.refreshView(tab);
            return;
        }

        const role = tab?.vibeSession?.viewState?.activeRole || 'auto';
        const roleReq = this._roleRequirements(role);
        const roleModel = AgentRoleRegistry.chooseModelId(role, roleReq);
        if (roleModel && roleModel !== ModelManager.currentModel) {
            ModelManager.setModel(roleModel);
        }

        const apiKey = ModelManager.getActiveKey();
        if (!apiKey) { 
            UI.showToast("B\"H - API Key Missing.", "error"); 
            tab.vibeSession.isProcessing = false;
            controller.refreshView(tab);
            return; 
        }

        tab.vibeSession.isProcessing = true;

        try {
            // 1. INITIALIZATION & CONTEXT GATHERING
            const { apiHistory, lastMsg } = await IterationInitializer.prepare(tab, controller, promptOverride);
            
            if (AutoLoopState.isStopped) {
                tab.vibeSession.isProcessing = false;
                controller.refreshView(tab);
                return;
            }

            // 2. THE STREAMING RECEPTACLE
            const stream = new IterationStream(tab, controller);

            // 3. THE DIVINE INVOCATION
            await VibeAPI.streamChat(
                apiHistory, apiKey, ModelManager.currentModel, ToolSchemas,
                
                // onActive Hook (Pierces the latency void)
                () => { 
                    if (lastMsg && lastMsg.isConnecting) {
                        lastMsg.isConnecting = false;
                        controller.refreshView(tab);
                    }
                },
                
                (chunk) => { if (!AutoLoopState.isStopped) stream.handleText(chunk); },
                (thought) => { if (!AutoLoopState.isStopped) stream.handleThought(thought); },
                (tools) => { if (!AutoLoopState.isStopped) stream.handleToolTrigger(tools); },

                // 4. FINALIZATION & RECURSION CHECK
                async (finalText, finalReasoning, finalTools, signature) => {
                    if (AutoLoopState.isStopped) return;
                    await IterationFinalizer.complete(tab, controller, lastMsg, finalText, finalReasoning, finalTools, signature);
                },

                // 5. ERROR HANDLING
                async (err) => {
                    const { VibeErrorParser } = await import('../../api/error-parser.js');
                    const errReport = await VibeErrorParser.parse(err);
                    tab.vibeSession.history.pop();
                    tab.vibeSession.history.push({ role: 'error', content: errReport });
                    tab.vibeSession.isProcessing = false;
                    controller.refreshView(tab);
                }
            );
        } catch (e) {
            console.error('[IterationRunner] B"H - Execution Shattered: ', e);
            tab.vibeSession.history.pop();
            tab.vibeSession.history.push({
                role: 'error',
                content: {
                    title: 'Vibe cycle failed before streaming',
                    message: e.message || String(e),
                    code: e.code || e.status || 'ITERATION_RUNNER_ERROR',
                    action: 'Check the model key, selected model, and browser console details.'
                }
            });
            tab.vibeSession.isProcessing = false;
            controller.refreshView(tab);
        }
    }
    ,
    _roleRequirements(role) {
        const r = String(role || '').toLowerCase().trim();
        if (r === 'planner') return { requireTools: false, requireFree: true };
        if (r === 'reviewer') return { requireTools: false, requireFree: true };
        if (r === 'tester') return { requireTools: true, requireFree: true };
        if (r === 'builder') return { requireTools: true, requireFree: false };
        return { requireTools: true, requireFree: true };
    }
};
