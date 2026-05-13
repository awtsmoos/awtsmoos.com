
import { StateRegister } from '../binah/StateRegister.js';
import { MasterWisdom } from '../data/debate/MasterWisdom.js';
import { MasterItems } from '../data/items/MasterItems.js';
import { GarmentLedger } from '../chochmah/GarmentLedger.js';
import { NiggunimLedger } from '../chochmah/NiggunimLedger.js';
import { WeaponLedger } from '../chochmah/WeaponLedger.js';

/**
 * B"H
 * @class InventoryManifest
 * @description 
 * The Holy Tabernacle of UI. Every pixel here is derived purely from the JSON DNA of the Ledgers.
 * No placeholders. Absolute perfection.
 */
export class InventoryManifest {
    static refresh() {
        const container = document.getElementById('inventory-content');
        if (!container) return;
        const S = StateRegister;
        container.innerHTML = ''; 

        // SIDEBAR
        const sidebar = document.createElement('div');
        sidebar.style.cssText = 'width:240px; display:flex; flex-direction:column; gap:10px; border-right:2px solid #00e5ff; padding-right:20px;';

        // SEFIROTIC STATS DISPLAY
        const statBox = document.createElement('div');
        statBox.style.cssText = 'background:rgba(0, 229, 255, 0.1); padding:15px; border-radius:8px; margin-bottom:15px; border:1px solid #00e5ff;';
        
        // Calculate dynamic stats
        const gMod = GarmentLedger[S.Equipment.garment]?.statMod || { chochmah:0, binah:0, daat:0 };
        const totalChochmah = S.EtzChaim.CHOCHMAH + gMod.chochmah;
        const totalBinah = S.EtzChaim.BINAH + gMod.binah;
        const totalDaat = S.EtzChaim.DAAT + gMod.daat;

        statBox.innerHTML = `
            <div style="font-weight:bold; color:#00e5ff; text-align:center; margin-bottom:10px;">SOUL STATS</div>
            <div style="color:#ff5252; font-size:14px; margin:5px 0;">⚔️ Chochmah (Atk): ${totalChochmah}</div>
            <div style="color:#81c784; font-size:14px; margin:5px 0;">🛡️ Binah (Def): ${totalBinah}</div>
            <div style="color:#ffd54f; font-size:14px; margin:5px 0;">🎯 Daat (Crit): ${totalDaat}</div>
            <div style="color:#e0f7fa; font-size:12px; margin-top:10px; border-top:1px solid #444; padding-top:5px;">LVL: ${S.HeroStats.level} | Sparks: ${S.HeroStats.xp}/${S.HeroStats.xpNeeded}</div>
        `;
        sidebar.appendChild(statBox);

        const tabs =[
            { id: 'WISDOM', label: '📖 Sefarim', color: '#00e5ff' },
            { id: 'MATERIALS', label: '📦 Sparks', color: '#81c784' },
            { id: 'GARMENTS', label: '👕 Begadim', color: '#ff80ab' },
            { id: 'WEAPONS', label: '⚔️ Kelim (Weapons)', color: '#ff5252' },
            { id: 'NIGGUNIM', label: '🎻 Niggunim', color: '#ffd54f' }
        ];

        tabs.forEach(tab => {
            const btn = document.createElement('div');
            const isActive = S.ActiveInventoryTab === tab.id;
            btn.innerText = tab.label;
            btn.style.cssText = `padding:12px; border-radius:5px; cursor:pointer; font-weight:bold; background:${isActive ? tab.color : 'rgba(255,255,255,0.05)'}; color:${isActive ? '#000' : '#888'}; transition:all 0.2s;`;
            btn.onclick = () => { S.ActiveInventoryTab = tab.id; this.refresh(); };
            sidebar.appendChild(btn);
        });

        const geltInfo = document.createElement('div');
        geltInfo.style.cssText = 'margin-top:auto; padding:10px; color:#ffd54f; font-size:18px; text-align:center; background:rgba(255, 213, 79, 0.1); border-radius:8px; border:1px solid #ffd54f;';
        geltInfo.innerText = `💰 Gelt: ${S.Gelt}`;
        sidebar.appendChild(geltInfo);
        container.appendChild(sidebar);

        // MAIN CONTENT AREA
        const main = document.createElement('div');
        main.style.cssText = 'flex:1; padding-left:30px; display:flex; flex-direction:column; gap:20px; overflow-y:auto; padding-right:15px;';
        
        if (S.ActiveInventoryTab === 'WISDOM') this._renderWisdom(main, S);
        else if (S.ActiveInventoryTab === 'MATERIALS') this._renderMaterials(main, S);
        else if (S.ActiveInventoryTab === 'GARMENTS') this._renderGarments(main, S);
        else if (S.ActiveInventoryTab === 'WEAPONS') this._renderWeapons(main, S);
        else if (S.ActiveInventoryTab === 'NIGGUNIM') this._renderNiggunim(main, S);

        container.appendChild(main);
    }

    static _renderMaterials(parent, S) {
        parent.innerHTML = '<h2 style="color:#81c784; margin:0; border-bottom:2px solid #81c784; padding-bottom:10px;">Physical Sparks (Matter)</h2><p style="color:#888; font-size:14px;">The shattered letters of Tohu, trapped in inorganic and animal forms. Even a rock (Aleph Beis Nun) contains these sparks.</p>';
        if (S.MaterialBag.length === 0) {
            parent.innerHTML += '<div style="color:#666; font-style:italic; padding:20px; text-align:center; border:1px dashed #444;">Your bag is empty of matter. Go sift the tall grass.</div>';
            return;
        }

        S.MaterialBag.forEach(itemEntry => {
            const meta = MasterItems[itemEntry.id];
            if (!meta) return;
            const row = document.createElement('div');
            row.style.cssText = 'padding:15px; background:rgba(255,255,255,0.05); border-radius:8px; display:flex; justify-content:space-between; align-items:center; border-left:4px solid #81c784; margin-bottom:10px; box-shadow:0 4px 6px rgba(0,0,0,0.3);';
            row.innerHTML = `
                <div style="display:flex; gap:15px; align-items:center;">
                    <span style="font-size:28px; text-shadow:0 0 10px #81c784;">${meta.icon}</span>
                    <div>
                        <div style="font-weight:bold; color:#fff; font-size:18px;">${meta.name} <span style="color:#81c784;">(x${itemEntry.qty})</span></div>
                        <div style="font-size:14px; color:#aaa; margin-top:4px;">${meta.desc}</div>
                    </div>
                </div>
                <div style="color:#ffd54f; font-weight:bold; font-size:16px; background:rgba(0,0,0,0.5); padding:8px 15px; border-radius:20px;">🪙 ${meta.value} Gelt</div>
            `;
            parent.appendChild(row);
        });
    }

    static _renderWisdom(parent, S) {
        parent.innerHTML = '<h2 style="color:#00e5ff; margin:0; border-bottom:2px solid #00e5ff; padding-bottom:10px;">The Holy Sefarim</h2><p style="color:#888; font-size:14px;">The words of Our G-d are eternal. These texts are used to shatter the unhinged logic of the Klipot.</p>';
        const cats = [
            {id:'mishnah', label:'Mishnah (Pshat)', color:'#00e5ff'}, 
            {id:'kabbalah', label:'Kabbalah (Sod)', color:'#ea80fc'},
            {id:'chassidus', label:'Chassidus (Yechidah)', color:'#ffb300'}
        ];
        
        cats.forEach(cat => {
            const sec = document.createElement('div');
            sec.style.marginBottom = '20px';
            sec.innerHTML = `<h3 style="color:${cat.color}; margin:0 0 10px 0;">${cat.label}</h3>`;
            const list = S.Inventory[cat.id] ||[];
            
            if (list.length === 0) {
                sec.innerHTML += `<div style="color:#666; font-style:italic; padding:10px; background:rgba(0,0,0,0.3); border-radius:5px;">No texts discovered in this realm yet.</div>`;
            } else {
                list.forEach(id => {
                    const b = MasterWisdom[id];
                    if (b) {
                        sec.innerHTML += `
                            <div style="padding:15px; margin-bottom:10px; background:linear-gradient(90deg, rgba(255,255,255,0.05), transparent); border-left:4px solid ${cat.color}; border-radius:4px;">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <div style="font-weight:bold; font-size:18px; color:#fff;">${b.name}</div>
                                    <div style="font-size:12px; color:${cat.color}; border:1px solid ${cat.color}; padding:2px 8px; border-radius:10px;">Power: ${b.power}</div>
                                </div>
                                <div style="color:#bbb; font-style:italic; margin-top:8px; font-size:15px;">"${b.quote}"</div>
                            </div>`;
                    }
                });
            }
            parent.appendChild(sec);
        });
    }

    static _renderGarments(parent, S) {
        parent.innerHTML = '<h2 style="color:#ff80ab; margin:0; border-bottom:2px solid #ff80ab; padding-bottom:10px;">Garments of the Soul (Begadim)</h2><p style="color:#888; font-size:14px;">Equip a garment to alter your physical appearance and manipulate your Sefirotic stats.</p>';
        S.Outfits.owned.forEach(id => {
            const o = GarmentLedger[id] || { name: 'Unknown', desc: '...', icon: '?', statMod:{} };
            const b = document.createElement('div');
            const active = S.Equipment.garment === id;
            
            let statsHtml = `<div style="display:flex; gap:10px; margin-top:10px; font-size:12px;">`;
            if(o.statMod.chochmah) statsHtml += `<span style="color:#ff5252; background:rgba(255,82,82,0.1); padding:4px 8px; border-radius:4px;">Chochmah: ${o.statMod.chochmah > 0 ? '+'+o.statMod.chochmah : o.statMod.chochmah}</span>`;
            if(o.statMod.binah) statsHtml += `<span style="color:#81c784; background:rgba(129,199,132,0.1); padding:4px 8px; border-radius:4px;">Binah: ${o.statMod.binah > 0 ? '+'+o.statMod.binah : o.statMod.binah}</span>`;
            if(o.statMod.daat) statsHtml += `<span style="color:#ffd54f; background:rgba(255,213,79,0.1); padding:4px 8px; border-radius:4px;">Daat: ${o.statMod.daat > 0 ? '+'+o.statMod.daat : o.statMod.daat}</span>`;
            if(o.statMod.maxLight) statsHtml += `<span style="color:#00e5ff; background:rgba(0,229,255,0.1); padding:4px 8px; border-radius:4px;">Max Light: +${o.statMod.maxLight}</span>`;
            statsHtml += `</div>`;

            b.innerHTML = `
                <div style="display:flex; align-items:center; gap:15px;">
                    <span style="font-size:32px; filter:drop-shadow(0 0 5px ${active?'#000':'transparent'});">${o.icon}</span>
                    <div style="flex:1;">
                        <div style="font-weight:bold; font-size:20px;">${o.name}</div>
                        <div style="font-size:14px; opacity:0.8; margin-top:4px;">${o.desc}</div>
                        ${statsHtml}
                    </div>
                    ${active ? '<div style="background:#000; color:#ff80ab; padding:5px 15px; border-radius:20px; font-weight:bold; border:2px solid #ff80ab;">EQUIPPED</div>' : ''}
                </div>
            `;
            b.style.cssText = `padding:20px; margin-bottom:15px; cursor:pointer; border-radius:10px; background:${active?'linear-gradient(135deg, #ff80ab, #f50057)':'rgba(255,255,255,0.05)'}; color:${active?'#fff':'#ccc'}; border:2px solid ${active?'#ff80ab':'transparent'}; transition:transform 0.1s; box-shadow:0 5px 15px rgba(0,0,0,0.4);`;
            
            if(!active) {
                b.onmouseenter = () => b.style.transform = 'translateY(-2px)';
                b.onmouseleave = () => b.style.transform = 'none';
            }

            b.onclick = () => { 
                S.Equipment.garment = id; 
                const buff = o.statMod.maxLight || 0;
                S.HeroStats.maxLight = 100 + (S.HeroStats.level * 25) + buff; 
                this.refresh(); 
            };
            parent.appendChild(b);
        });
    }

    static _renderWeapons(parent, S) {
        parent.innerHTML = '<h2 style="color:#ff5252; margin:0; border-bottom:2px solid #ff5252; padding-bottom:10px;">Holy Weapons (Kelim)</h2><p style="color:#888; font-size:14px;">"With my sword and with my bow" - These are the prayers. The Shema is a sword, the Amidah is a bow. Equip them to channel your stats in debates.</p>';
        S.Weapons.owned.forEach(id => {
            const w = WeaponLedger[id] || { name: 'Unknown', desc: '...', icon: '?', statMod:{} };
            const b = document.createElement('div');
            const active = S.Equipment.weapon === id;
            
            let statsHtml = `<div style="display:flex; gap:10px; margin-top:10px; font-size:12px;">`;
            if(w.statMod.attack) statsHtml += `<span style="color:#ff5252; background:rgba(255,82,82,0.1); padding:4px 8px; border-radius:4px;">Base Power: +${w.statMod.attack}</span>`;
            if(w.statMod.defense) statsHtml += `<span style="color:#81c784; background:rgba(129,199,132,0.1); padding:4px 8px; border-radius:4px;">Block: +${w.statMod.defense}</span>`;
            if(w.statMod.crit) statsHtml += `<span style="color:#ffd54f; background:rgba(255,213,79,0.1); padding:4px 8px; border-radius:4px;">Crit Rate: +${w.statMod.crit}%</span>`;
            statsHtml += `</div>`;

            b.innerHTML = `
                <div style="display:flex; align-items:center; gap:15px;">
                    <span style="font-size:32px; filter:drop-shadow(0 0 5px ${active?'#000':'transparent'});">${w.icon}</span>
                    <div style="flex:1;">
                        <div style="font-weight:bold; font-size:20px;">${w.name}</div>
                        <div style="font-size:14px; opacity:0.8; margin-top:4px;">${w.desc}</div>
                        ${statsHtml}
                    </div>
                    ${active ? '<div style="background:#000; color:#ff5252; padding:5px 15px; border-radius:20px; font-weight:bold; border:2px solid #ff5252;">WIELDING</div>' : ''}
                </div>
            `;
            b.style.cssText = `padding:20px; margin-bottom:15px; cursor:pointer; border-radius:10px; background:${active?'linear-gradient(135deg, #ff5252, #d50000)':'rgba(255,255,255,0.05)'}; color:${active?'#fff':'#ccc'}; border:2px solid ${active?'#ff5252':'transparent'}; transition:transform 0.1s; box-shadow:0 5px 15px rgba(0,0,0,0.4);`;
            
            if(!active) {
                b.onmouseenter = () => b.style.transform = 'translateY(-2px)';
                b.onmouseleave = () => b.style.transform = 'none';
            }

            b.onclick = () => { 
                S.Equipment.weapon = id; 
                this.refresh(); 
            };
            parent.appendChild(b);
        });
    }

    static _renderNiggunim(parent, S) {
        parent.innerHTML = '<h2 style="color:#ffd54f; margin:0; border-bottom:2px solid #ffd54f; padding-bottom:10px;">Holy Melodies (Niggunim)</h2><p style="color:#888; font-size:14px;">Sing a Niggun in your heart to bypass logic and gain passive miracles in the Overworld.</p>';
        const list = ['NONE', ...S.Inventory.niggunim];
        
        list.forEach(id => {
            const v = NiggunimLedger[id] || { name: 'Silence', desc: 'The quiet void. No active buffs.', icon: '🤫' };
            const b = document.createElement('div');
            const active = S.Equipment.niggun === id;
            
            b.innerHTML = `
                <div style="display:flex; align-items:center; gap:15px;">
                    <span style="font-size:32px; filter:drop-shadow(0 0 5px ${active?'#000':'transparent'});">${v.icon}</span>
                    <div style="flex:1;">
                        <div style="font-weight:bold; font-size:20px;">${v.name}</div>
                        <div style="font-size:14px; opacity:0.8; margin-top:4px;">${v.desc}</div>
                    </div>
                    ${active ? '<div style="background:#000; color:#ffd54f; padding:5px 15px; border-radius:20px; font-weight:bold; border:2px solid #ffd54f;">SINGING</div>' : ''}
                </div>
            `;
            b.style.cssText = `padding:20px; margin-bottom:15px; cursor:pointer; border-radius:10px; background:${active?'linear-gradient(135deg, #ffd54f, #ff8f00)':'rgba(255,255,255,0.05)'}; color:${active?'#000':'#ccc'}; border:2px solid ${active?'#ffd54f':'transparent'}; transition:transform 0.1s; box-shadow:0 5px 15px rgba(0,0,0,0.4);`;
            
            if(!active) {
                b.onmouseenter = () => b.style.transform = 'translateY(-2px)';
                b.onmouseleave = () => b.style.transform = 'none';
            }

            b.onclick = () => { 
                S.Equipment.niggun = id; 
                S.GameSpeedMultiplier = v.buffType === 'SPEED' ? v.buffValue : 1;
                this.refresh(); 
            };
            parent.appendChild(b);
        });
    }
}
