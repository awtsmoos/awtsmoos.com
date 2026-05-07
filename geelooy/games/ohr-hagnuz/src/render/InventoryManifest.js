
import { StateRegister } from '../binah/StateRegister.js';
import { MasterWisdom } from '../data/debate/MasterWisdom.js';
import { MasterItems } from '../data/items/MasterItems.js';

/**
 * B"H
 * @class InventoryManifest
 */
export class InventoryManifest {
    static refresh() {
        const container = document.getElementById('inventory-content');
        if (!container) return;
        const S = StateRegister;
        container.innerHTML = ''; 

        const sidebar = document.createElement('div');
        sidebar.style.cssText = 'width:200px; display:flex; flex-direction:column; gap:10px; border-right:1px solid #444; padding-right:20px;';

        const tabs = [
            { id: 'WISDOM', label: '📖 WISDOM', color: '#00e5ff' },
            { id: 'MATERIALS', label: '📦 MATERIALS', color: '#81c784' },
            { id: 'GARMENTS', label: '👕 GARMENTS', color: '#ff80ab' },
            { id: 'VESSELS', label: '🏺 VESSELS', color: '#ffd54f' }
        ];

        tabs.forEach(tab => {
            const btn = document.createElement('div');
            const isActive = S.ActiveInventoryTab === tab.id;
            btn.innerText = tab.label;
            btn.style.cssText = `padding:15px; border-radius:5px; cursor:pointer; font-weight:bold; background:${isActive ? tab.color : 'rgba(255,255,255,0.05)'}; color:${isActive ? '#000' : '#888'};`;
            btn.onclick = () => { S.ActiveInventoryTab = tab.id; this.refresh(); };
            sidebar.appendChild(btn);
        });

        const geltInfo = document.createElement('div');
        geltInfo.style.cssText = 'margin-top:auto; padding:10px; color:#ffd54f; font-size:18px;';
        geltInfo.innerText = `💰 Gelt: ${S.Gelt}`;
        sidebar.appendChild(geltInfo);
        container.appendChild(sidebar);

        const main = document.createElement('div');
        main.style.cssText = 'flex:1; padding-left:30px; display:flex; flex-direction:column; gap:20px;';
        
        if (S.ActiveInventoryTab === 'WISDOM') this._renderWisdom(main, S);
        else if (S.ActiveInventoryTab === 'MATERIALS') this._renderMaterials(main, S);
        else if (S.ActiveInventoryTab === 'GARMENTS') this._renderGarments(main, S);
        else if (S.ActiveInventoryTab === 'VESSELS') this._renderVessels(main, S);

        container.appendChild(main);
    }

    static _renderMaterials(parent, S) {
        parent.innerHTML = '<h3 style="color:#81c784; margin:0;">Collected Sparks</h3>';
        if (S.MaterialBag.length === 0) {
            parent.innerHTML += '<div style="color:#666; font-style:italic;">Your bag is empty of matter.</div>';
            return;
        }

        S.MaterialBag.forEach(itemEntry => {
            const meta = MasterItems[itemEntry.id];
            if (!meta) return;
            const row = document.createElement('div');
            row.style.cssText = 'padding:15px; background:rgba(255,255,255,0.05); border-radius:8px; display:flex; justify-content:space-between; align-items:center; border-left:4px solid #81c784;';
            row.innerHTML = `
                <div style="display:flex; gap:15px; align-items:center;">
                    <span style="font-size:24px;">${meta.icon}</span>
                    <div>
                        <div style="font-weight:bold; color:#fff;">${meta.name} (x${itemEntry.qty})</div>
                        <div style="font-size:12px; color:#888;">${meta.desc}</div>
                    </div>
                </div>
                <div style="color:#ffd54f; font-weight:bold;">Value: ${meta.value} Gelt</div>
            `;
            parent.appendChild(row);
        });
    }

    static _renderWisdom(parent, S) {
        const cats = [{id:'mishnah', label:'Mishnah', color:'#00e5ff'}, {id:'kabbalah', label:'Kabbalah', color:'#d500f9'}, {id:'niggunim', label:'Niggunim', color:'#ff1744'}];
        cats.forEach(cat => {
            const sec = document.createElement('div');
            sec.innerHTML = `<h3 style="color:${cat.color}; margin:0;">${cat.label}</h3>`;
            const list = S.Inventory[cat.id];
            if (list.length === 0) sec.innerHTML += `<div style="color:#666; font-style:italic;">None.</div>`;
            else list.forEach(id => {
                const b = MasterWisdom[id];
                if (b) sec.innerHTML += `<div style="padding:10px; margin:5px 0; background:rgba(255,255,255,0.02); border-left:3px solid ${cat.color}; font-size:14px;"><div style="font-weight:bold;">${b.name}</div><div style="color:#888; font-style:italic;">"${b.quote}"</div></div>`;
            });
            parent.appendChild(sec);
        });
    }

    static _renderGarments(parent, S) {
        parent.innerHTML = '<h3 style="color:#ff80ab; margin:0;">Garments</h3>';
        S.Outfits.owned.forEach(id => {
            const o = S.OutfitCatalog[id];
            const b = document.createElement('div');
            const active = S.Outfits.active === id;
            b.innerText = (active ? '▶ ' : '') + o.name;
            b.style.cssText = `padding:15px; margin:5px 0; cursor:pointer; border-radius:5px; background:${active?'#ff80ab':'rgba(255,255,255,0.05)'}; color:${active?'#000':'#ccc'};`;
            b.onclick = () => { S.Outfits.active = id; this.refresh(); };
            parent.appendChild(b);
        });
    }

    static _renderVessels(parent, S) {
        parent.innerHTML = '<h3 style="color:#ffd54f; margin:0;">Vessels</h3>';
        S.Vessels.owned.forEach(id => {
            const v = S.VesselCatalog[id];
            const b = document.createElement('div');
            const active = S.Vessels.active === id;
            b.innerHTML = `<span style="font-size:24px;">${v.icon}</span> ${v.name}`;
            b.style.cssText = `padding:15px; margin:5px 0; cursor:pointer; border-radius:5px; display:flex; align-items:center; gap:15px; background:${active?'#ffd54f':'rgba(255,255,255,0.05)'}; color:${active?'#000':'#ccc'};`;
            b.onclick = () => { S.Vessels.active = id; this.refresh(); };
            parent.appendChild(b);
        });
    }
}
