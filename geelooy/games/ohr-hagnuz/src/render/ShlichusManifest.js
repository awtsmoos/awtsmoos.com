
import { StateRegister } from '../binah/StateRegister.js';
import { ShlichusLedger } from '../shlichus/ShlichusLedger.js';

/**
 * B"H
 * @class ShlichusManifest
 * @description 
 * Fills the UI vessel with the data of the Tzaddik's divine missions.
 */
export class ShlichusManifest {
    static refresh() {
        const container = document.getElementById('shlichus-content');
        if (!container) return;
        container.innerHTML = '';

        const active = StateRegister.ActiveShlichus;
        const completed = StateRegister.CompletedShlichus;

        // Render Active
        const activeTitle = document.createElement('h2');
        activeTitle.innerText = `Active Decrees (${active.length})`;
        activeTitle.style.color = '#ea80fc';
        container.appendChild(activeTitle);

        if (active.length === 0) {
            container.innerHTML += `<div style="color:#888; font-style:italic;">No active missions. Speak to Sages.</div>`;
        }

        active.forEach(id => {
            const quest = ShlichusLedger[id];
            if (!quest) return;
            const block = document.createElement('div');
            block.style.cssText = 'padding:15px; background:rgba(255,255,255,0.05); border-left:4px solid #ea80fc; border-radius:5px;';
            block.innerHTML = `
                <div style="font-size:20px; font-weight:bold; color:#fff;">${quest.title}</div>
                <div style="font-size:14px; color:#ccc; margin-top:5px;">${quest.desc}</div>
                <div style="font-size:14px; color:#ffd54f; margin-top:10px; font-style:italic;">Reward: ${quest.rewardGelt} Gelt${quest.rewardItem ? ' + Divine Garment' : ''}</div>
            `;
            container.appendChild(block);
        });

        // Render Completed
        const compTitle = document.createElement('h2');
        compTitle.innerText = `Elevated Sparks (${completed.length})`;
        compTitle.style.color = '#4caf50';
        compTitle.style.marginTop = '30px';
        container.appendChild(compTitle);

        completed.forEach(id => {
            const quest = ShlichusLedger[id];
            if (!quest) return;
            const block = document.createElement('div');
            block.style.cssText = 'padding:10px; background:rgba(76, 175, 80, 0.1); border-left:4px solid #4caf50; border-radius:5px; color:#888; text-decoration:line-through;';
            block.innerText = quest.title;
            container.appendChild(block);
        });
    }
}
