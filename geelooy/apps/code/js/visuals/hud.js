
// B"H
// FILE: js/visuals/hud.js

import { DOM, State } from '../state.js';
import { Editor } from '../editor.js';

export const HUD = {
    el: null,
    apm: 0,
    actions: [], // timestamps
    isVisible: false,
    isMinimized: false,
    
    init() {
        this.el = document.getElementById('hud-stats');
        this.toggle(true); 
    },
    
    toggle(show) {
        this.isVisible = show;
        this.el.style.display = show ? 'block' : 'none';
        if (show) this.renderStructure();
    },
    
    // B"H - Gematria Map
    getGematria(text) {
        if (!text) return 0;
        const map = {
            'א':1, 'ב':2, 'g':3, 'ד':4, 'ה':5, 'ו':6, 'ז':7, 'ח':8, 'ט':9,
            'י':10, 'כ':20, 'ך':20, 'ל':30, 'מ':40, 'ם':40, 'נ':50, 'ן':50,
            'ס':60, 'ע':70, 'פ':80, 'ף':80, 'צ':90, 'ץ':90, 'ק':100, 'ר':200, 'ש':300, 'ת':400
        };
        // Simple English Gematria (A=1, B=2...)
        const mapEng = {};
        for(let i=0; i<26; i++) mapEng[String.fromCharCode(97+i)] = i+1;
        
        let sum = 0;
        const normalized = text.toLowerCase();
        
        for (let char of normalized) {
            if (map[char]) sum += map[char];
            else if (mapEng[char]) sum += mapEng[char];
        }
        return sum;
    },

    getCurrentWordOrSelection() {
        const editor = DOM.editor;
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const text = editor.value;

        if (start !== end) {
            return text.substring(start, end);
        }

        // Get word around cursor
        let i = start;
        while (i > 0 && /\S/.test(text[i - 1])) i--;
        let j = start;
        while (j < text.length && /\S/.test(text[j])) j++;
        
        return text.substring(i, j);
    },
    
    renderStructure() {
        if (this.el.querySelector('.hud-minimize')) return;
        
        this.el.innerHTML = `
            <div class="hud-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; border-bottom:1px solid #333; padding-bottom:2px;">
                <span style="font-weight:bold; font-size:0.9em; opacity:0.7;">SYS.MON</span>
                <button class="hud-minimize" style="background:none; border:none; color:var(--neon-cyan); cursor:pointer; font-weight:bold;">[ - ]</button>
            </div>
            <div class="hud-content">
                <!-- Dynamic Content -->
            </div>
        `;
        
        this.el.querySelector('.hud-minimize').onclick = (e) => {
            e.stopPropagation();
            this.toggleMinimize();
        };
    },
    
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        const content = this.el.querySelector('.hud-content');
        const btn = this.el.querySelector('.hud-minimize');
        
        if (this.isMinimized) {
            content.style.display = 'none';
            btn.textContent = '[ + ]';
            this.el.style.width = 'auto';
        } else {
            content.style.display = 'block';
            btn.textContent = '[ - ]';
            this.el.style.minWidth = '150px';
        }
    },
    
    registerAction() {
        const now = Date.now();
        this.actions.push(now);
        this.actions = this.actions.filter(t => now - t < 60000); 
        this.apm = this.actions.length;
    },
    
    update() {
        if (!this.isVisible) return;
        if (this.isMinimized) return; 
        
        const now = Date.now();
        if (this.actions.length > 0 && now - this.actions[0] > 60000) {
            this.actions.shift();
            this.apm = this.actions.length;
        }
        
        const cursor = Editor.getCursorInfo();
        const content = DOM.editor.value;
        const size = (content.length / 1024).toFixed(2) + ' KB';
        
        // Calculate Gematria
        const currentText = this.getCurrentWordOrSelection();
        const gematria = this.getGematria(currentText);
        const gematriaDisplay = gematria > 0 ? `GEM: <span style="color:var(--neon-lime)">${gematria}</span>` : 'GEM: --';
        
        const contentEl = this.el.querySelector('.hud-content');
        if (contentEl) {
            contentEl.innerHTML = `
                <div class="hud-row">
                    <span>APM: ${this.apm}</span>
                    <span>SIZE: ${size}</span>
                </div>
                <div class="hud-row">
                    <span>LN: ${cursor.line}</span>
                    <span>COL: ${cursor.col}</span>
                </div>
                <div class="hud-row" style="margin-top:5px; border-top:1px solid #333; padding-top:2px;">
                    <span>${gematriaDisplay}</span>
                </div>
            `;
        }
        
        if (this.apm > 100) this.el.style.borderColor = 'var(--neon-magenta)';
        else this.el.style.borderColor = 'var(--neon-cyan)';
    }
};