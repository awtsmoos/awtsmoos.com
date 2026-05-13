
import { StateRegister } from '../binah/StateRegister.js';

/**
 * B"H
 * @class EtzChaimManifest
 * @description 
 * Renders the internal Sefirotic structure of the Tzaddik.
 */
export class EtzChaimManifest {
    static refresh() {
        const container = document.getElementById('etz-chaim-canvas');
        const pointsDisplay = document.getElementById('spark-points-display');
        if (!container || !pointsDisplay) return;

        const S = StateRegister;
        pointsDisplay.innerText = `Sparks: ${S.HeroStats.sparkPoints}`;
        container.innerHTML = '';

        // Sefirot Coordinate Map (Relative to Center)
        // Chochmah/Binah are skipped for now to focus on the lower 6 (Zeir Anpin)
        const nodes =[
            { id: 'CHESED', label: 'Chesed (Max Light)', x: 60, y: 15, color: '#e0f7fa' },
            { id: 'GEVURAH', label: 'Gevurah (Power)', x: 40, y: 15, color: '#ffcdd2' },
            { id: 'TIFERET', label: 'Tiferet (XP Yield)', x: 50, y: 40, color: '#fff9c4' },
            { id: 'NETZACH', label: 'Netzach (Defense)', x: 60, y: 65, color: '#dcedc8' },
            { id: 'HOD', label: 'Hod (Speed)', x: 40, y: 65, color: '#ffccbc' },
            { id: 'YESOD', label: 'Yesod (Catch Rate)', x: 50, y: 90, color: '#e1bee7' }
        ];

        // Draw Lines (Tzinorot / Channels)
        const lines = [
            ['CHESED', 'TIFERET'], ['GEVURAH', 'TIFERET'], ['CHESED', 'GEVURAH'],
            ['TIFERET', 'NETZACH'], ['TIFERET', 'HOD'], ['NETZACH', 'HOD'],
            ['NETZACH', 'YESOD'], ['HOD', 'YESOD'], ['TIFERET', 'YESOD']
        ];

        const getCoords = (id) => nodes.find(n => n.id === id);

        lines.forEach(pair => {
            const p1 = getCoords(pair[0]);
            const p2 = getCoords(pair[1]);
            if(p1 && p2) this._drawLine(container, p1.x, p1.y, p2.x, p2.y);
        });

        // Draw Nodes
        nodes.forEach(node => {
            const level = S.EtzChaim[node.id];
            const el = document.createElement('div');
            el.style.cssText = `
                position: absolute;
                left: ${node.x}%; top: ${node.y}%;
                transform: translate(-50%, -50%);
                width: 100px; height: 100px;
                border-radius: 50%;
                background: radial-gradient(circle at center, ${node.color} 0%, #000 100%);
                border: 3px solid ${node.color};
                box-shadow: 0 0 ${10 + (level * 5)}px ${node.color};
                display: flex; flex-direction: column; justify-content: center; align-items: center;
                cursor: pointer; text-align: center; user-select: none;
                transition: transform 0.2s;
            `;
            
            el.innerHTML = `
                <div style="font-weight:bold; font-size:12px; color:#fff;">${node.label}</div>
                <div style="font-size:24px; font-weight:bold; color:${node.color}; margin-top:5px;">${level}</div>
            `;

            el.onmouseenter = () => el.style.transform = 'translate(-50%, -50%) scale(1.1)';
            el.onmouseleave = () => el.style.transform = 'translate(-50%, -50%) scale(1.0)';
            
            el.onpointerdown = (e) => {
                e.preventDefault();
                if (S.HeroStats.sparkPoints > 0) {
                    S.HeroStats.sparkPoints--;
                    S.EtzChaim[node.id]++;
                    
                    // Immediately apply retroactive stat boosts
                    if (node.id === 'CHESED') {
                        S.HeroStats.maxLight += 10;
                        S.HeroStats.light += 10;
                    }
                    this.refresh();
                }
            };

            container.appendChild(el);
        });
    }

    static _drawLine(parent, x1, y1, x2, y2) {
        const line = document.createElement('div');
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

        line.style.cssText = `
            position: absolute;
            left: ${x1}%; top: ${y1}%;
            width: ${length}%; height: 4px;
            background: rgba(255,255,255,0.2);
            transform-origin: 0 50%;
            transform: rotate(${angle}deg);
            z-index: -1;
            box-shadow: 0 0 10px rgba(255,255,255,0.3);
        `;
        parent.appendChild(line);
    }
}
