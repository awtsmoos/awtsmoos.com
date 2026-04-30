
// B"H
import { PR } from './parser/constants.js';
import { ResponseParser } from './ResponseParser.js';
import { ExternalLayout } from './external/layout.js';
import { ExternalActions } from './external/actions.js';
import { ExternalLogic } from './external/logic.js';
import { ExternalPreview } from './external/preview.js';
import promptData from "./promptData.js";

/**
 * @class ExternalManifest
 * @description
 * * Chapter 55: The Bridge of Manual Manifestation
 * Sometimes the soul chooses to use an external oracle. 
 * This module allows for the manual intake of that oracle's speech,
 * parsing it into physical vessels just like the internal timestream.
 */
export const ExternalManifest = {
    getPrompt() {
        const { S, E, tO, tC, fO, fC, oO, oC, cO, cC } = PR;
        return `B"H\n${promptData}
Wrap changes in this format:\n${tO}\n  ${fO}file.js${fC}\n  ${oO}write${oC}\n  ${cO}${S}\n// code\n${E}${cC}\n${tC}`;
    },

    /**
     * B"H
     * Injects the Manifestation UI and binds the 'oninput' listener 
     * to watch for incoming fragments of light.
     */
    injectUI(container, tab, rootItem) {
        if (!container) return;
        
        container.innerHTML = ExternalLayout.getHTML(this.getPrompt());
        const input = container.querySelector('#em-xml-input');
        const goBtn = container.querySelector('#em-manifest-btn');

        if (input && goBtn) {
            ExternalActions.bind(container, rootItem);

            input.oninput = () => {
                const rawValue = input.value;
                console.log(`B"H [ExternalManifest] Input detected. Length: ${rawValue.length}`);

                // 1. DISSECTION: Attempt to extract changes from the raw input
                const changes = ResponseParser.parseChanges(rawValue, rootItem.path);
                
                console.log(`B"H [ExternalManifest] Parser returned ${changes.length} potential vessels.`);
                
                if (changes.length > 0) {
                    console.log(`B"H [ExternalManifest] First change detected:`, changes[0]);
                }

                // 2. ENABLING: By default, every found vessel is ready for inscription
                changes.forEach(c => c.isEnabled = true);
                
                // 3. PERSISTENCE: Keep the pending changes in the session soul
                tab.vibeSession.pendingChanges = changes;
                
                // 4. VISION: Render the interactive card tree
                ExternalPreview.render(container, changes);
            };

            goBtn.onclick = () => ExternalLogic.manifest(tab, rootItem, input);
        }
    }
};
