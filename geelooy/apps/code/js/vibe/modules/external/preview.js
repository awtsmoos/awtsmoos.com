
// B"H
import { ManifestTree } from '../ManifestTree.js';

export const ExternalPreview = {
    /**
     * @function render
     * @description Injects the visual tree of pending changes and the progress bar.
     */
    render(container, changes) {
        console.log(`B"H [ExternalPreview] Rendering ${changes.length} vessel cards.`);
        
        const preArea = container.querySelector('#em-preview-area');
        const goBtn = container.querySelector('#em-manifest-btn');
        if (!preArea || !goBtn) {
            console.error('B"H [ExternalPreview] UI Vessels not found in DOM!');
            return;
        }

        if (changes.length > 0) {
            const count = changes.filter(c => c.isEnabled !== false).length;
            preArea.innerHTML = `
                <div class="em-summary-bubble" style="color:var(--neon-lime); font-weight:bold; padding:10px; background:rgba(168,255,0,0.1); border-radius:4px; border:1px solid var(--neon-lime); margin-bottom:10px; font-size:0.85em;">
                    ${count} of ${changes.length} Vessels Selected for Inscription.
                </div>
                
                <!-- B"H: The Progress Bar Vessel -->
                <div id="em-progress-container" class="hidden" style="margin-bottom: 15px; background: rgba(0,0,0,0.4); padding: 12px; border-radius: 8px; border: 1px solid var(--color-border);">
                    <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:8px; color: var(--neon-cyan); font-family: var(--font-code); font-weight: bold;">
                        <span id="em-progress-text">Manifesting...</span>
                        <span id="em-progress-pct">0%</span>
                    </div>
                    <div style="height:10px; background:rgba(255,255,255,0.1); border-radius:5px; overflow:hidden; box-shadow: inset 0 0 5px rgba(0,0,0,0.5);">
                        <div id="em-progress-fill" style="height:100%; width:0%; background:linear-gradient(90deg, var(--neon-cyan), var(--neon-magenta)); transition:width 0.15s ease-out;"></div>
                    </div>
                </div>

                <div class="em-tree-vessel" style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05); border-radius:8px; padding:10px; max-height:400px; overflow-y:auto;">
                    ${ManifestTree.buildHTML(changes)}
                </div>
            `;
            preArea.classList.remove('hidden');
            goBtn.classList.remove('hidden');
        } else {
            console.log(`B"H [ExternalPreview] Empty change set. Hiding preview.`);
            preArea.classList.add('hidden');
            goBtn.classList.add('hidden');
        }
    }
};
