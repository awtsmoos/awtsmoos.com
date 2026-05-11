
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
        let systemPromptText = PromptBuilder.getAutoSystemBase(true);

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
};
