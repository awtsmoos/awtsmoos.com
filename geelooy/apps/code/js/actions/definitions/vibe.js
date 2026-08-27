
// B"H
/**
 * @file vibe.js
 * @brief The Pulse of Code.
 */
import { ContextParser } from '../utils/context-parser.js';

export const VibeAction = {
    async run(context) {
        const item = ContextParser.getItem(context);
        if (!item) return;

        console.log("B\"H - Vibe: Initiating connection for", item.name);
        
        if (window.AWTSMOOS_VIBE_BRIDGE) {
            return await window.AWTSMOOS_VIBE_BRIDGE.startVibe(item);
        }
    }
};
