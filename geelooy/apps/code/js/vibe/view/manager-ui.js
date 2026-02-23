// B"H
// FILE: js/vibe/view/manager-ui.js
import { VibeDB } from '../db.js';
import { VibeController } from '../vibe-controller.js';

export const VibeManagerUI = {
    async render(container) {
        const sessions = await VibeDB.getAllSessions();

        container.innerHTML = `
            <div style="padding:40px; max-width:800px; margin:0 auto; color:white;"-->
                <h1 style="color:var(--neon-cyan); border-bottom:2px solid var(--neon-cyan); padding-bottom:10px;">Vibe Timestream Manager</h1>
                <div id="vibe-mgr-list" style="margin-top:20px; display:flex; flex-direction:column; gap:15px;">
                    ${sessions.length === 0 ? '<p style="opacity:0.5; text-align:center;">No active timestreams.</p>' : ''}
                </div>
            `;

        const list = container.querySelector('#vibe-mgr-list');
        sessions.forEach(sess => {
            const card = document.createElement('div');
            card.className = 'vibe-manifest-card';
            card.style.display = 'flex';
            card.style.justifyContent = 'space-between';
            card.style.alignItems = 'center';
            card.innerHTML = `
                <div>
                    <div style="font-weight:bold; color:var(--neon-lime);">${sess.name}</div>
                    <div style="font-size:0.8em; opacity:0.6; font-family:monospace;">${sess.path}</div>
                </div>
                <div style="display:flex; gap:10px;">
                    <button class="secondary-btn open-v" style="min-height:0; padding:5px 10px;">Enter</button>
                    <button class="secondary-btn danger delete-v" style="min-height:0; padding:5px 10px;">Delete</button>
                </div>`;
            
            card.querySelector('.open-v').onclick = () => VibeController.open({
                name: sess.name.replace('Vibe: ', ''), path: sess.path, workspaceId: sess.workspaceId, type: sess.originalType, kind: 'directory'
            });
            card.querySelector('.delete-v').onclick = async () => {
                if(confirm("B\"H: Purge this session forever?")) {
                    await VibeDB.deleteSession(sess.id);
                    this.render(container);
                }
            };
            list.appendChild(card);
        });
    }
};
