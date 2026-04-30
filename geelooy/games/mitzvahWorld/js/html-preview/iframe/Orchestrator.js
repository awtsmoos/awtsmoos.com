
/**
 * B"H
 * @module IframeOrchestrator
 * @description
 * * Chapter 10: The High Priest of Perception
 * The Orchestrator unites the modular vessels to perform the sacred 
 * ritual of Manifestation. It takes the fragmented steps of 
 * generating the shield, assembling the HTML, and solidifying the 
 * reality, and binds them into a single, undeniable flow.
 */

import { SanctuaryShield } from './SanctuaryShield.js';
import { ShieldGenerator } from './ShieldGenerator.js';
import { HtmlAssembler } from './HtmlAssembler.js';
import { RealitySolidifier } from './RealitySolidifier.js';
import { ErrorSentinel } from './ErrorSentinel.js';
import { InjectionAssembler } from '../injections/index.js';

export const IframeOrchestrator = {
    /**
     * B"H
     * Initiates the manifestation ritual for a preview tab.
     */
    manifest(doc, iframe, identity, tabId) {
        try {
            // 1. Establish the Sacred Bounds
            SanctuaryShield.apply(iframe);

            // 2. Obtain the Interceptor code
            const scriptStr = InjectionAssembler.getNetworkInterceptorScript(
                identity.workspaceId, 
                identity.path, 
                tabId
            );

            // 3. Generate the Shield Tag
            const shieldTag = ShieldGenerator.generate(scriptStr);

            // 4. Assemble the final Form
            const finalizedHTML = HtmlAssembler.assemble(doc, shieldTag);

            // 5. Solidify into Reality
            RealitySolidifier.solidify(iframe, finalizedHTML);

            console.log("%cB\"H [IframeOrchestrator] Reality Stabilized.", "color: #00f6ff; font-weight: bold;");
        } catch (e) {
            console.error(`B"H [IframeOrchestrator] Ritual Shattered:`, e);
            ErrorSentinel.render(iframe, e.message);
        }
    }
};
