
// B"H
/**
 * @file hud.js
 * @brief System Monitor and Gematria HUD.
 */

import { DOM } from '../state.js';
import { Editor } from '../editor.js';

export const HUD = {
    el: null,
    actions: [], 
    isVisible: false,
    
    init() {
        this.el = document.getElementById('hud-stats');
        this.toggle(true); 
    },
    
    toggle(show) {
        this.isVisible = show;
        this.el.style.display = show ? 'block' : 'none';
        if (show) this._renderBase();
    },

    _renderBase() {
        this.el.innerHTML = `<div class="hud-header">SYS.MON</div><div class="hud-content"></div>`;
    },
    
    /**
     * @function getGematria
     * @description Calculates the Mispar Hechrachi (Absolute Value) of a string.
     */
    getGematria(text) {
        if (!text) return 0;
        const map = {
            'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,
            'י':10,'כ':20,'ך':20,'ל':30,'מ':40,'ם':40,'נ':50,'ן':50,
            'ס':60,'ע':70,'פ':80,'ף':80,'צ':90,'ץ':90,'ק':100,'ר':200,'ש':300,'ת':400
        };
        const engMap = {};
        for(let i=0; i<26; i++) engMap[String.fromCharCode(97+i)] = i+1;
        
        let sum = 0;
        for (let char of text.toLowerCase()) {
            if (map[char]) sum += map[char];
            else if (engMap[char]) sum += engMap[char];
        }
        return sum;
    },

    update() {
        if (!this.isVisible) return;
        
        const selection = window.getSelection().toString() || "";
        const cursor = Editor.getCursorInfo();
        const gem = selection ? this.getGematria(selection) : 0;
        
        const contentEl = this.el.querySelector('.hud-content');
        if (contentEl) {
            contentEl.innerHTML = `
                <div class="hud-row"><span>LN: ${cursor.line}</span><span>COL: ${cursor.col}</span></div>
                ${gem ? `<div class="hud-row" style="color:var(--neon-lime); margin-top:5px; border-top:1px solid #444;"><span>GEMATRIA:</span><span>${gem}</span></div>` : ''}
            `;
        }
    }
};
