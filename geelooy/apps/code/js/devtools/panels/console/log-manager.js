
// B"H
/**
 * @file log-manager.js
 * @brief THE SCRIBE OF ASIYAH (ACTION).
 */

import { StandardLogRenderer } from './renderers/standard-log.js';
import { InputLogRenderer } from './renderers/input-log.js';

/**
 * @class ConsoleLogManager
 * @description Controls the rendering flow for the console output window.
 */
export class ConsoleLogManager {
    constructor(outputElement) {
        this.container = outputElement;
        console.log(`B"H [LogManager] Anchored to container:`, this.container);
    }

    /**
     * B"H - Re-engraves history from memory.
     */
    hydrate(logs, state) {
        if (this.container) this.container.innerHTML = '';
        if (logs) {
            console.log(`[LogManager] B"H - Reconstituting ${logs.length} historical fragments.`);
            logs.forEach(l => this.append(l, state));
        }
    }

    /**
     * B"H - Engraves a single spark into the visual layer.
     */
    append(log, state) {
        if (!log) return;
        
        // 1. RE-ANCHORING RITUAL
        // Ensure the container is physically present.
        if (!this.container || !document.body.contains(this.container)) {
            console.warn(`[LogManager] B"H - Anchor lost. Re-seeking physical vessel...`);
            const found = document.querySelector('.dt-console-output');
            if (found) {
                this.container = found;
                console.log(`[LogManager] B"H - New anchor secured.`);
            } else {
                console.error("[LogManager] B\"H - Could not find output vessel! Vision is blinded.");
                return;
            }
        }

        console.log(`[LogManager] B"H - Appending [${log.level}] result to Vision [${state.previewTabId}]`);

        const isInput = log.level === 'input';
        const renderer = isInput ? InputLogRenderer : StandardLogRenderer;
        
        try {
            const visualNode = renderer.render(log, state);
            if (visualNode) {
                this.container.appendChild(visualNode);
                
                // Final visual check
                requestAnimationFrame(() => {
                    this.container.scrollTop = this.container.scrollHeight;
                });
            }
        } catch (e) {
            console.error(`[LogManager] B"H - Manifestation Shevirah:`, e);
        }
    }
}
