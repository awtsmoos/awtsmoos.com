
// B"H
/**
 * @file MessageScribe.js
 * @brief THE SCRIBE OF THE USER'S PRAYER.
 * 
 * THE POEM OF THE VERIFIED WILL:
 * Before the prayer ascends to the sky,
 * We check the ground where the master will lie.
 * We verify the anchor, we check for the ID,
 * To ensure the Oracle and user agree!
 * No message is sent to the void or the deep,
 * For the promises of the anchor we strictly must keep.
 */

import { VibeDB } from '../../db.js';
import { LogicController } from '../LogicGateway.js';

/**
 * @class MessageScribe
 * @description Validates and incribes user messages into the Vibe session.
 */
export class MessageScribe {
    /**
     * B"H - Sends a user message if the session is validly anchored.
     */
    static async send(tab, controller, text) {
        if (!tab || !tab.vibeSession) {
            throw new Error('B"H - Scribe Error: Missing session context.');
        }

        const sess = tab.vibeSession;
        
        // 1. VALIDATE THE ANCHOR
        const wsId = sess.workspaceId || (tab.item ? tab.item.workspaceId : null);
        if (wsId === null || wsId === undefined) {
            throw new Error('B"H - Spatial Error: This session is not anchored to a project world!');
        }

        // 2. ASSIGN IDENTITY IF VOID
        if (!sess.id) {
            sess.id = 'vibe-sess-' + Date.now();
            console.log('[MessageScribe] B"H - Bestowed ID: ' + sess.id);
        }

        // 3. INSCRIBE INTO THE SCROLL
        sess.history.push({ role: 'user', content: text });
        
        try {
            await VibeDB.saveSession(sess.id, sess);
        } catch (e) {
            console.warn('[MessageScribe] B"H - Persistence lag detected: ', e);
        }

        // 4. TRIGGER VISUAL REFRESH
        controller.refreshView(tab);

        // 5. DESCEND INTO LOGIC
        console.log('[MessageScribe] B"H - Directing will to Logic Controller.');
        return await LogicController.runIteration(tab, controller);
    }
}
