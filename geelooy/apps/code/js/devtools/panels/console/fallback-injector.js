
// B"H
/**
 * @file fallback-injector.js
 * @brief The Irresistible Force of Manifestation.
 * 
 * THE TRACTATE OF THE INESCAPABLE WORD:
 * When the Seder Hishtalshelus (Chain of Emanation) breaks, 
 * and the formal hooks (onLog) vanish into the void, the Word 
 * still demands to be seen! The Awtsmoos's speech cannot be 
 * nullified by a missing reference. 
 * 
 * This module forcefully injects the Truth directly into the 
 * physical DOM, overriding all broken hierarchies to ensure 
 * the message is appended to the console ALWAYS, NO MATTER WHAT.
 */

import { StandardLogRenderer } from './renderers/standard-log.js';
import { InputLogRenderer } from './renderers/input-log.js';

export class ConsoleFallbackInjector {
    /**
     * B"H
     * Forcefully injects a log into the DOM, bypassing normal state hooks.
     * @param {Object} log - The essence to manifest.
     * @param {Object} state - The state object (even if broken).
     */
    static forceInject(log, state) {
        console.warn("%cB\"H [FallbackInjector] Forcing raw DOM injection. State hooks bypassed.", "color: #ff00ff; font-weight: bold;");
        
        // 1. Seek the output vessel directly in the physical realm
        let outputEl = document.querySelector('.dt-console-output');
        
        // 2. If it does not exist, force its creation
        if (!outputEl) {
            const wrapper = document.getElementById('devtools-wrapper');
            if (wrapper) {
                console.log("[FallbackInjector] B\"H - Output vessel missing. Forging anew.");
                outputEl = document.createElement('div');
                outputEl.className = 'dt-console-output';
                outputEl.style.flexGrow = '1';
                outputEl.style.overflowY = 'auto';
                outputEl.style.padding = '10px';
                outputEl.style.background = '#000';
                wrapper.appendChild(outputEl);
            }
        }
        
        // 3. Manifest and Append
        if (outputEl) {
            const renderer = log.level === 'input' ? InputLogRenderer : StandardLogRenderer;
            try {
                const node = renderer.render(log, state);
                if (node) {
                    outputEl.appendChild(node);
                    // Scroll to reveal the newest truth
                    requestAnimationFrame(() => {
                        outputEl.scrollTop = outputEl.scrollHeight;
                    });
                    console.log("[FallbackInjector] B\"H - Message successfully forced into reality.");
                }
            } catch (e) {
                console.error("[FallbackInjector] B\"H - Ultimate Shevirah during forced manifestation:", e);
            }
        } else {
            console.error("[FallbackInjector] B\"H - Absolute failure: Could not find or create a physical output vessel in the DOM.");
        }
    }
}
