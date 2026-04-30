
/**
 * B"H
 * @module StreamHandler
 * @description
 * * Chapter 22: The Master of the Living Stream
 * This module is the eye that watches the stream. It performs two 
 * holy duties simultaneously:
 * 1. VISION: It notifies the controller to update the chat UI with the 
 *    accumulated buffer, so the user sees the "Thought" and "Action" live.
 * 2. ACTION: It passes the buffer to the BlockExtractor and then the 
 *    SequentialSolidifier to anchor completed code blocks to the disk.
 * * It ensures that the transition from a streaming thought to a 
 * physical file is seamless and stable.
 */

import { SequentialSolidifier } from '../../modules/loop/engine/SequentialSolidifier.js';
import { BlockExtractor } from '../../modules/parser/block-extractor.js';

export const StreamHandler = {
    /**
     * B"H
     * Receives tokens from the AI oracle and directs them to vision and action.
     */
    async processChunk(chunk, fullBuffer, tab, _, controller) {
        const sess = tab.vibeSession || tab.content || {};
        const root = sess.path || sess.rootPath || tab.item?.path || "/";
        
        // 1. VISION: Real-time update of the chat history in the UI
        if (controller && controller.handleStreamChunk) {
            controller.handleStreamChunk(fullBuffer, tab);
        }

        // 2. DISSECTION: Extract potential directives from the growing buffer
        const directives = BlockExtractor.extract(fullBuffer, root);

        // 3. SOLIDIFICATION: Attempt to anchor any completed vessels
        for (const directive of directives) {
            await SequentialSolidifier.attempt(
                directive, 
                tab.item.workspaceId, 
                tab.vibeSession.id
            );
        }
        return fullBuffer;
    },

    /**
     * B"H - Ensures every vessel is sealed after the oracle finishes its song.
     */
    async finalize(finalText, tab) {
        const sess = tab.vibeSession || tab.content || {};
        const root = sess.path || sess.rootPath || tab.item?.path || "/";
        const allDirectives = BlockExtractor.extract(finalText, root);
        
        for (const directive of allDirectives) {
            await SequentialSolidifier.attempt(
                directive, 
                tab.item.workspaceId, 
                tab.vibeSession.id
            );
        }

        // Return the solidifier to a state of stillness for the next iteration
        SequentialSolidifier.reset();
    }
};
