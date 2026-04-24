// B"H
import { PR } from './parser/constants.js';
import { ResponseParser } from './ResponseParser.js';
import { ExternalLayout } from './external/layout.js';
import { ExternalActions } from './external/actions.js';
import { ExternalLogic } from './external/logic.js';
import { ExternalPreview } from './external/preview.js';
import promptData from "./promptData.js";

export const ExternalManifest = {
    getPrompt() {
        const { S, E, tO, tC, fO, fC, oO, oC, cO, cC } = PR;
        return `B"H\n${promptData}
Wrap changes in this format:\n${tO}\n  ${fO}file.js${fC}\n  ${oO}write${oC}\n  ${cO}${S}\n// code\n${E}${cC}\n${tC}`;
    },

    injectUI(container, tab, rootItem) {
        if (!container) return;
        
        container.innerHTML = ExternalLayout.getHTML(this.getPrompt());
        const input = container.querySelector('#em-xml-input');
        const goBtn = container.querySelector('#em-manifest-btn');

        if (input && goBtn) {
            ExternalActions.bind(container, rootItem);

            input.oninput = () => {
                const changes = ResponseParser.parseChanges(input.value, rootItem.path);
                changes.forEach(c => c.isEnabled = true);
                tab.vibeSession.pendingChanges = changes;
                ExternalPreview.render(container, changes);
            };

            goBtn.onclick = () => ExternalLogic.manifest(tab, rootItem, input);
        }
    }
};