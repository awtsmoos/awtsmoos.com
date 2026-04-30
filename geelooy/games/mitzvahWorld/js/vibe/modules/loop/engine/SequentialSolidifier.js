
/**
 * B"H
 * @module SequentialSolidifier
 */

import { LoopEngine } from '../LoopEngine.js';
import { MarkerRemover } from '../../parser/MarkerRemover.js';

export const SequentialSolidifier = {
    activePaths: new Set(),

    async attempt(directive, workspaceId, sessionId) {
        if (!directive.isComplete || !directive.path) return false;
        if (this.activePaths.has(directive.path)) return false;

        const isDelete = directive.operation === 'delete';
        const rawContent = directive.content || "";
        
        const purifiedContent = MarkerRemover.purify(rawContent);

        if (!isDelete && purifiedContent.length === 0) return false;

        console.log("%cB\"H [Solidifier] Finalizing Vessel: " + directive.path, "color: #a8ff00; font-weight: bold;");
        
        this.activePaths.add(directive.path);

        await LoopEngine.apply(
            [{ ...directive, content: purifiedContent }],
            workspaceId,
            sessionId,
            false 
        );

        return true;
    },

    reset() {
        this.activePaths.clear();
    }
};
