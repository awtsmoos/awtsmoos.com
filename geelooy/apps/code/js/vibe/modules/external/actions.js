
// B"H
import { UI } from '../../../ui.js';
import { FileOperations } from '../../../file-operations.js';
import { ManifestTree } from '../ManifestTree.js';

export const ExternalActions = {
    bind(container, rootItem) {
        const dlBtn = container.querySelector('#em-dl-btn');
        const cpBtn = container.querySelector('#em-copy-btn');
        const promptArea = container.querySelector('#em-prompt-area');

        if (dlBtn) dlBtn.onclick = () => FileOperations.downloadAllContents([rootItem]);
        
        if (cpBtn) cpBtn.onclick = () => {
            navigator.clipboard.writeText(promptArea.value);
            UI.showToast("B\"H - Ritual Copied.", "success");
        };
    },

    renderPreview(container, changes) {
        const preArea = container.querySelector('#em-preview-area');
        const goBtn = container.querySelector('#em-manifest-btn');
        
        if (changes.length > 0) {
            const count = changes.filter(c => c.isEnabled !== false).length;
            preArea.innerHTML = `
                <div style="color:var(--neon-lime); font-weight:bold; padding:10px; background:rgba(168,255,0,0.1); border-radius:4px; border:1px solid var(--neon-lime); margin-bottom:10px; font-size:0.85em;">
                    ${count} of ${changes.length} Vessels Selected for Inscription.
                </div>
                <div style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05); border-radius:8px; padding:10px;">
                    ${ManifestTree.buildHTML(changes)}
                </div>
            `;
            preArea.classList.remove('hidden');
            goBtn.classList.remove('hidden');
        } else {
            preArea.classList.add('hidden');
            goBtn.classList.add('hidden');
        }
    }
};
