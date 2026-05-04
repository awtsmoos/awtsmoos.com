
/**
 * B"H
 * 
 * CHAPTER: THE HARMONIZATION OF THE PATHS
 * 
 * "Make straight the path of the Lord."
 * In the realm of digital coordinates, confusion arises when the 
 * slashes of the Earth (Windows) meet the slashes of the Heavens (POSIX).
 * This assembler now purifies all paths, ensuring they follow a single, 
 * unified direction before being presented to the AI Oracle.
 * 
 * @module PromptAssembler
 */

import { StopMandate } from './StopMandate.js';
import { UsageGuide } from './UsageGuide.js';
import { RelayProtocol } from './RelayProtocol.js';
import { State } from '../../../../state.js';

export const PromptAssembler = {
    /**
     * B"H
     * Assembles the complete instruction set based on the current workspace context,
     * with absolute path normalization.
     * 
     * @param {Object} rootItem - The directory vessel from which context was pulled.
     * @returns {string} The assembled divine instructions.
     */
    assemble(rootItem) {
        let assembled = `## ⚠️ CRITICAL DIVINE DIRECTIVE FOR THE AI ORACLE ⚠️\n\n`;
        
        assembled += StopMandate.get() + "\n";
        assembled += UsageGuide.get() + "\n";

        // Determine the True Base Path
        const ws = State.workspaces.find(w => String(w.id) === String(rootItem.workspaceId));
        if (ws && ws.type === 'relay') {
            /**
             * B"H - THE PATH PURIFICATION RITUAL
             * We transmute all backslashes to forward slashes and ensure
             * the joining of the two halves creates a single, undeniable Truth.
             */
            const wsBase = (ws.basePath || "").replace(/\\/g, '/').replace(/\/+$/, "");
            const itemRel = (rootItem.path === "/" ? "" : rootItem.path).replace(/\\/g, '/').replace(/^\/+/, "");
            
            const trueAbsoluteBase = (wsBase + (itemRel ? "/" + itemRel : ""))
                .replace(/\/+/g, '/'); // Collapse multiple slashes
            
            assembled += RelayProtocol.get(trueAbsoluteBase) + "\n";
        }

        assembled += "---\n\n";
        return assembled;
    }
};
