
// B"H
/**
 * @file StreamHandler.js
 * @brief The Master of the Living Stream: Synchronizing the Voice with the Hand.
 * 
 * CHAPTER LXXIII: THE CHRONICLE OF THE DEED
 * In the realm of Asiyah, we watch the flow and prepare the vessels. 
 * But the act of Solidification (writing to disk) is a final decree.
 * We must not anchor a vessel that is only half-born!
 */

import { LoopEngine } from '../../modules/LoopEngine.js';
import { BlockExtractor } from '../../modules/parser/block-extractor.js';

export const StreamHandler = {
    /** @property {Set} solidifiedPaths - Records which vessels have already been anchored in this stream cycle. */
    solidifiedPaths: new Set(),

    /**
     * B"H - Receives droplets of light from the stream and manages the transition to Action.
     * 
     * @param {string} chunk - The latest token.
     * @param {string} fullBuffer - The total accumulated emanation.
     * @param {Object} tab - The Vibe session context.
     * @param {null} _ - Legacy padding.
     * @param {Object} controller - The Vibe controller for UI updates.
     */
    async processChunk(chunk, fullBuffer, tab, _, controller) {
        // B"H - Rely strictly on tab.item.path for grounding
        const root = tab.item?.path || "/";
        
        // 1. VISION: Update the UI history with the latest buffer state.
        if (controller && controller.handleStreamChunk) {
            controller.handleStreamChunk(fullBuffer, tab);
        }

        // 2. DISSECTION: Extract structured directives from the buffer.
        const directives = BlockExtractor.extract(fullBuffer, root);

        // 3. SOLIDIFICATION: Anchor only the finalized vessels.
        for (const directive of directives) {
            const isDelete = directive.operation === 'delete';
            const hasEssence = directive.content && directive.content.trim().length > 0;
            
            /**
             * B"H - THE ANCHORING LOGIC:
             * We solidify if:
             * - The specific block is truly closed in the raw stream (isComplete).
             * - It has content (if write) OR it's a delete.
             * - It hasn't been solidified yet in this session.
             */
            if (directive.isComplete && (isDelete || hasEssence) && !this.solidifiedPaths.has(directive.path)) {
                
                // B"H - THE ANCHORING LOG (Diagnostic)
                console.log(`\n%cB"H [StreamHandler] ⚡ SOLIDIFYING OPERATION ⚡`, "color: #00f6ff; font-weight: bold; font-size: 1.1em;");
                console.log(`  -> Path:      ${directive.path}`);
                console.log(`  -> Label:     ${directive.fileLabel}`);
                console.log(`  -> Operation: ${directive.operation.toUpperCase()}`);
                if (!isDelete) console.log(`  -> Measure:   ${directive.content.length} characters`);
                console.log(`  -> Project:   ${root}`);

                this.solidifiedPaths.add(directive.path);
                
                // Engrave or dissolve the vessel upon the physical disk.
                // LoopEngine.apply uses sequential processing to prevent OS race conditions.
                await LoopEngine.apply(
                    [directive], 
                    tab.item.workspaceId, 
                    tab.vibeSession.id, 
                    false // Do not skip timeline
                );
            }
        }
        return fullBuffer;
    },

    /**
     * B"H - Ensures totality after the model finishes speaking.
     * It performs a final sweep to catch any vessels that might have been 
     * completed in the very last token of the stream.
     */
    async finalize(finalText, tab) {
        const root = tab.item?.path || "/";
        const allDirectives = BlockExtractor.extract(finalText, root);
        
        for (const directive of allDirectives) {
            const isDelete = directive.operation === 'delete';
            const hasEssence = directive.content && directive.content.trim().length > 0;
            
            if ((isDelete || hasEssence) && !this.solidifiedPaths.has(directive.path)) {
                console.log(`%cB"H [StreamHandler] 🏁 FINALIZING REMAINING VESSEL: ${directive.path}`, "color: #a8ff00; font-weight: bold;");
                
                await LoopEngine.apply([directive], tab.item.workspaceId, tab.vibeSession.id);
                this.solidifiedPaths.add(directive.path);
            }
        }

        // Return the scribe to a state of silence for the next iteration.
        this.solidifiedPaths.clear();
    }
};
