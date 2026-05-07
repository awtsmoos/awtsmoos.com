
import { StateRegister } from '../../binah/StateRegister.js';
import { MasterWisdom } from '../../data/debate/MasterWisdom.js';

/**
 * B"H
 * @class ActionMenuManifest
 */
export class ActionMenuManifest {
    static refresh(container) {
        if (!container) return;
        const S = StateRegister;
        const cursor = window.AwtsmoosBattleCursor || 0;

        if (S.BattleMenuState === 'LIST') {
            this._renderList(container, S, cursor);
        } else if (S.BattleMenuState === 'CATEGORY') {
            this._renderGrid(container, S, cursor, ["MISHNAH", "KABBALAH", "NIGGUNIM", "YICHUD"]);
        } else {
            this._renderGrid(container, S, cursor, ["DEBATE", "REDEEM", "BAG", "RUN"]);
        }
    }

    static _renderGrid(container, S, cursor, labels) {
        container.style.display = 'grid';
        container.style.gridTemplateColumns = '1fr 1fr';
        
        if (container.children.length === labels.length) {
            labels.forEach((text, i) => {
                const btn = container.children[i];
                const isSelected = (i === cursor);
                btn.className = isSelected ? 'battle-action-btn active-intent' : 'battle-action-btn';
                btn.innerText = (isSelected ? '▶ ' : '') + text;
            });
            return;
        }

        container.innerHTML = '';
        labels.forEach((text, i) => {
            const btn = document.createElement('div');
            const isSelected = (i === cursor);
            btn.className = isSelected ? 'battle-action-btn active-intent' : 'battle-action-btn';
            btn.style.display = 'flex'; btn.style.alignItems = 'center'; btn.style.justifyContent = 'center';
            btn.innerText = (isSelected ? '▶ ' : '') + text;
            
            btn.addEventListener('mouseenter', () => {
                if (window.AwtsmoosBattleCursor !== i) {
                    window.AwtsmoosBattleCursor = i;
                    this.refresh(container);
                }
            });
            
            const trigger = (e) => {
                e.preventDefault(); e.stopPropagation();
                if (window._awtsmoosIntentLocked) return;
                window._awtsmoosIntentLocked = true;
                setTimeout(() => { window._awtsmoosIntentLocked = false; }, 200);

                window.AwtsmoosBattleCursor = i;
                window.dispatchEvent(new CustomEvent('awtsmoos-battle-move-click', { detail: i }));
            };
            
            btn.onpointerdown = trigger;
            container.appendChild(btn);
        });
    }

    static _renderList(container, S, cursor) {
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.overflowY = 'auto';

        const cat = S.DebateCategory;
        const ids = S.Inventory[cat] || [];
        const list = ids.map(id => MasterWisdom[id]).filter(x => x);

        if (list.length === 0) {
            container.innerHTML = `<div style="color: #666; padding: 20px; font-size: 14px; text-shadow: none;">Nothing here yet. [B to Back]</div>`;
            return;
        }

        if (container.children.length === list.length && container.firstChild.classList.contains('battle-action-btn')) {
            list.forEach((item, i) => {
                const row = container.children[i];
                const isSelected = (i === cursor);
                row.className = isSelected ? 'battle-action-btn active-intent' : 'battle-action-btn';
                row.innerText = (isSelected ? '▶ ' : '') + `${item.name}`;
            });
            return;
        }

        container.innerHTML = '';
        list.forEach((item, i) => {
            const row = document.createElement('div');
            const isSelected = (i === cursor);
            row.className = isSelected ? 'battle-action-btn active-intent' : 'battle-action-btn';
            row.style.minHeight = '45px'; row.style.padding = '0 15px'; row.style.fontSize = '16px';
            row.style.display = 'flex'; row.style.alignItems = 'center';
            row.innerText = (isSelected ? '▶ ' : '') + `${item.name}`;
            
            row.addEventListener('mouseenter', () => {
                if (window.AwtsmoosBattleCursor !== i) {
                    window.AwtsmoosBattleCursor = i;
                    this.refresh(container);
                }
            });
            
            const trigger = (e) => {
                e.preventDefault(); e.stopPropagation();
                if (window._awtsmoosIntentLocked) return;
                window._awtsmoosIntentLocked = true;
                setTimeout(() => { window._awtsmoosIntentLocked = false; }, 200);

                window.AwtsmoosBattleCursor = i;
                window.dispatchEvent(new CustomEvent('awtsmoos-battle-move-click', { detail: i }));
            };
            
            row.onpointerdown = trigger;
            container.appendChild(row);
        });
    }
}
