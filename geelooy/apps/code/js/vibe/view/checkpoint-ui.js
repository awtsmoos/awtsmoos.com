// B"H
// FILE: js/vibe/view/checkpoint-ui.js
import { VibeDB } from '../db.js';
import { UI } from '../../ui.js';

export const CheckpointUI = {
    async render(container, tab, controller) {
        var checkpoints = await VibeDB.getCheckpoints(tab.vibeSession.id);
        
        container.innerHTML = '<h4 style="margin-top:0; color:var(--neon-cyan);">State of Being</h4>' +
            '<div id="cp-list" style="display:flex; flex-direction:column; gap:10px;">' +
                (checkpoints.length === 0 ? '<p style="opacity:0.5;">No past states found.</p>' : '') +
            '</div>';
            
        var list = container.querySelector('#cp-list');
        checkpoints.reverse().forEach(function(cp) {
            var card = document.createElement('div');
            card.className = "vibe-manifest-card";
            card.style.padding = "10px";
            card.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<span style="font-size:0.8em; color:var(--neon-lime);">' + new Date(cp.timestamp).toLocaleString() + '</span>' +
                '<div>' +
                    '<button class="restore-cp secondary-btn" style="min-height:0; padding:2px 8px; font-size:0.7em; margin-right:5px;">Restore</button>' +
                    '<button class="delete-cp secondary-btn danger" style="min-height:0; padding:2px 8px; font-size:0.7em;">×</button>' +
                '</div>' +
            '</div>';
            
            card.querySelector('.restore-cp').onclick = async function() {
                if (await UI.showDialog({ title: "Restore State", message: "This will replace your current chat history. Continue?", okText: "Restore" })) {
                    tab.vibeSession.history = cp.history;
                    await VibeDB.saveSession(tab.vibeSession.id, tab.vibeSession);
                    controller.render(tab);
                    UI.showToast("B\"H: State restored.", "success");
                }
            };
            
            card.querySelector('.delete-cp').onclick = async function() {
                await VibeDB.deleteCheckpoint(cp.id);
                CheckpointUI.render(container, tab, controller);
            };
            
            list.appendChild(card);
        });
    }
};