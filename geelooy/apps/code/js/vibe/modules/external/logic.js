// B"H
import { UI } from '../../../ui.js';
import { VibeDB } from '../../db.js';
import { ExternalPreview } from './preview.js';

export const ExternalLogic = {
    async manifest(tab, rootItem, xmlInputEl) {
        console.log(`\n[ExternalManifest] B"H - INITIATING HONEST MANIFESTATION.`);
        const totalStartTime = performance.now();

        const changes = tab.vibeSession.pendingChanges;
        if (!changes || changes.length === 0) return;

        try {
            const toApply = changes.filter(c => c.isEnabled !== false);
            if (toApply.length === 0) return;

            const loop = await import('../LoopEngine.js');
            
            // Connect to Progress Bar UI
            const container = xmlInputEl.closest('.external-manifest-wrapper');
            const progContainer = container?.querySelector('#em-progress-container');
            const progFill = container?.querySelector('#em-progress-fill');
            const progText = container?.querySelector('#em-progress-text');
            const progPct = container?.querySelector('#em-progress-pct');
            const goBtn = container?.querySelector('#em-manifest-btn');

            if (progContainer) progContainer.classList.remove('hidden');
            if (goBtn) goBtn.disabled = true;

            let completed = 0;
            const total = toApply.length;
            
            // HONEST REAL-TIME SYNC:
            // LoopEngine.apply strictly awaits OS writes before calling the success hook.
            await loop.LoopEngine.apply(toApply, rootItem.workspaceId, tab.vibeSession.id, false, (change, success) => {
                if (success) {
                    completed++;
                    const pct = Math.round((completed / total) * 100);
                    
                    // Update Progress Bar
                    if (progFill) progFill.style.width = `${pct}%`;
                    if (progPct) progPct.textContent = `${pct}%`;
                    if (progText) progText.textContent = `Wrote: ${change.path.split('/').pop()}`;

                    // Swipe away the completed card
                    const card = container?.querySelector(`.vibe-manifest-card[data-index="${change.originalIndex}"]`);
                    if (card) {
                        card.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease';
                        card.style.transform = 'translateX(100%)';
                        card.style.opacity = '0';
                        setTimeout(() => {
                            if (card.parentElement) card.remove();
                        }, 400);
                    }
                }
            });
            
            // Final Timing Log
            const totalEndTime = performance.now();
            const durationSec = ((totalEndTime - totalStartTime) / 1000).toFixed(2);
            console.log(`[ExternalManifest] B"H - Successfully manifested ${toApply.length} files in ${durationSec} seconds.`);
            
            // Wait for animations to clear
            await new Promise(r => setTimeout(r, 450));
            
            tab.vibeSession.history.push({ 
                role: 'user', content: `B"H - Manually manifested ${toApply.length} vessels in ${durationSec}s.` 
            });
            tab.vibeSession.history.push({ 
                role: 'model', content: xmlInputEl.value, isStreaming: false 
            });

            tab.vibeSession.pendingChanges = [];
            
            if (tab.vibeSession.id) {
                await VibeDB.saveSession(tab.vibeSession.id, tab.vibeSession);
            }
            
            // UI Cleanup
            xmlInputEl.value = '';
            if (container) {
                const preArea = container.querySelector('#em-preview-area');
                if (preArea) preArea.innerHTML = ''; 
                ExternalPreview.render(container, []); 
            }
            if (goBtn) goBtn.disabled = false;
            
            import('../../vibe-controller.js').then(m => m.VibeController.render(tab));
            UI.showToast(`B"H: ${toApply.length} changes manifested in ${durationSec}s.`, "success");
            
        } catch (err) {
            console.error(`[ExternalManifest] Operation Shattered:`, err);
            UI.showToast("B\"H Manifestation Failed: " + err.message, "error");
        }
    }
};