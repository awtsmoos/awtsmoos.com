
// B"H
/**
 * @file IterationInitializer.js
 * @brief Prepares the historical and environmental context for the API.
 * 
 * THE POEM OF THE PREPARATION:
 * Before the Priest may enter the holy place,
 * He must prepare his garments and wash his face.
 * We gather the context, the map, and the string,
 * To form the exact prompt the Oracle will bring!
 */

import { HistoryCompressor } from '../../modules/history/index.js';
import { PromptBuilder } from '../../modules/prompt-builder.js';
import { BackgroundIlluminator } from './BackgroundIlluminator.js';
import { ModelManager } from '../../model-manager.js';
import { AgentCapabilities } from '../../agent/logic/AgentCapabilities.js';
import { AgentRolePrompter } from '../../agent/logic/AgentRolePrompter.js';

export const IterationInitializer = {
    /**
     * B"H - Assembles the full API payload history.
     */
    async prepare(tab, controller, promptOverride) {
        let lastMsg = tab.vibeSession.history[tab.vibeSession.history.length - 1];
        
        // Ensure a connecting vessel exists for visual feedback
        if (!lastMsg || !lastMsg.isConnecting) {
            tab.vibeSession.history.push({ 
                role: 'assistant', content: '', isConnecting: true, isStreaming: true, statusText: 'CONTINUING AUTONOMOUS LOOP...' 
            });
            controller.refreshView(tab);
            lastMsg = tab.vibeSession.history[tab.vibeSession.history.length - 1];
        }

        const historyForApi = tab.vibeSession.history.filter(m => !m.isConnecting);
        const compressedHistory = HistoryCompressor.compress(historyForApi);
        const activeModel = ModelManager.getActiveModel();
        const supportsNativeTools = activeModel ? AgentCapabilities.supportsTools(activeModel) : true;
        let systemPromptText = PromptBuilder.getAutoSystemBase(supportsNativeTools);
        
        const activeRole = this._detectActiveRole(tab);
        systemPromptText += AgentRolePrompter.build(activeRole);

        // Gather deep context if this is a fresh start or manual override
        if (compressedHistory.length === 0 || promptOverride) {
            try {
                const contextScroll = await BackgroundIlluminator.illuminate(tab, (msg) => {
                    if (lastMsg && lastMsg.isConnecting) {
                        lastMsg.statusText = msg;
                        controller.refreshView(tab);
                    }
                });
                systemPromptText += contextScroll;
            } catch (gatherErr) {
                throw gatherErr;
            }
        }

        const apiHistory =[{ role: 'system', content: systemPromptText }, ...compressedHistory];
        if (promptOverride) apiHistory.push({ role: 'user', content: promptOverride });

        lastMsg.statusText = 'AWAITING FIRST SPARK...';
        controller.refreshView(tab);

        return { apiHistory, lastMsg };
    }
    ,
    _detectActiveRole(tab) {
        const fromView = tab?.vibeSession?.viewState?.activeRole;
        if (fromView) return fromView;
        const hist = tab?.vibeSession?.history || [];
        for (let i = hist.length - 1; i >= 0; i--) {
            const msg = hist[i];
            if (msg && msg.role === 'user' && msg.agent_role) return msg.agent_role;
        }
        return 'auto';
    }
};
