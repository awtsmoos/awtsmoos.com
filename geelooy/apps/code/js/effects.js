
// B"H
// FILE: js/effects.js

import { State, DOM } from './state.js';
import { UI } from './ui.js';

export const Effects = {
    audioCtx: null,
    matrixCanvas: null,
    matrixInterval: null,
    entropyTimer: null,
    isPowerMode: false,
    isSonicMode: false,
    isEntropyMode: false,
    isSpotlightMode: false,

    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        } catch(e) { console.warn("Audio Context not supported"); }
        
        this.createMatrixCanvas();
    },

    createMatrixCanvas() {
        const cvs = document.createElement('canvas');
        cvs.id = 'matrix-overlay';
        cvs.style.position = 'fixed';
        cvs.style.top = '0';
        cvs.style.left = '0';
        cvs.style.width = '100%';
        cvs.style.height = '100%';
        cvs.style.zIndex = '99999';
        cvs.style.pointerEvents = 'none';
        cvs.style.opacity = '0.15';
        cvs.style.display = 'none';
        document.body.appendChild(cvs);
        this.matrixCanvas = cvs;
    },

    toggleMatrix() {
        const cvs = this.matrixCanvas;
        if (this.matrixInterval) {
            clearInterval(this.matrixInterval);
            this.matrixInterval = null;
            cvs.style.display = 'none';
            UI.showToast("Matrix Mode Deactivated", "info");
            return;
        }

        cvs.style.display = 'block';
        UI.showToast("Matrix Mode Activated", "success");
        const ctx = cvs.getContext('2d');
        let w = cvs.width = window.innerWidth;
        let h = cvs.height = window.innerHeight;
        const cols = Math.floor(w / 20) + 1;
        const ypos = Array(cols).fill(0);

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);

        this.matrixInterval = setInterval(() => {
            ctx.fillStyle = '#0001';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#0f0';
            ctx.font = '15pt monospace';

            ypos.forEach((y, ind) => {
                const text = String.fromCharCode(Math.random() * 128);
                const x = ind * 20;
                ctx.fillText(text, x, y);
                if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
                else ypos[ind] = y + 20;
            });
        }, 50);
        
        window.onresize = () => { w = cvs.width = window.innerWidth; h = cvs.height = window.innerHeight; };
    },

    togglePowerMode() {
        this.isPowerMode = !this.isPowerMode;
        UI.showToast(`Power Mode: ${this.isPowerMode ? "ON" : "OFF"}`, this.isPowerMode ? "success" : "info");
    },

    spawnParticles() {
        if (!this.isPowerMode) return;
        
        // Shake Screen
        document.body.style.transform = `translate(${Math.random()*4-2}px, ${Math.random()*4-2}px)`;
        setTimeout(() => document.body.style.transform = 'none', 50);

        // Spawn Particles (Simplified - random spawn in editor)
        // Creating true cursor-following particles requires layout thrashing (getClientRects).
        // For performance, we spawn them in the center of the active area.
        const el = document.createElement('div');
        el.style.position = 'fixed';
        el.style.left = '50%';
        el.style.top = '50%';
        el.style.width = '4px';
        el.style.height = '4px';
        el.style.background = `hsl(${Math.random()*360}, 100%, 50%)`;
        el.style.pointerEvents = 'none';
        el.style.zIndex = '10000';
        document.body.appendChild(el);
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 100 + 50;
        
        const anim = el.animate([
            { transform: 'translate(0,0) scale(1)', opacity: 1 },
            { transform: `translate(${Math.cos(angle)*velocity}px, ${Math.sin(angle)*velocity}px) scale(0)`, opacity: 0 }
        ], { duration: 500, easing: 'ease-out' });
        
        anim.onfinish = () => el.remove();
    },

    toggleSonic() {
        this.isSonicMode = !this.isSonicMode;
        if(this.isSonicMode && this.audioCtx && this.audioCtx.state === 'suspended') this.audioCtx.resume();
        UI.showToast(`Sonic Typing: ${this.isSonicMode ? "ON" : "OFF"}`, "info");
    },

    playKeystrokeSound(key) {
        if (!this.isSonicMode || !this.audioCtx) return;
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        // Pentatonic mapping
        const code = key.charCodeAt(0) % 50;
        const freq = 200 + (code * 15);
        
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.1);
    },

    toggleEntropy() {
        this.isEntropyMode = !this.isEntropyMode;
        UI.showToast(`Entropy Mode: ${this.isEntropyMode ? "ON" : "OFF"}`, "info");
        DOM.editor.classList.toggle('entropy-active', this.isEntropyMode);
    },

    resetEntropy() {
        if (!this.isEntropyMode) return;
        DOM.editor.classList.remove('entropy-decay');
        void DOM.editor.offsetWidth; 
        
        if (this.entropyTimer) clearTimeout(this.entropyTimer);
        this.entropyTimer = setTimeout(() => {
            DOM.editor.classList.add('entropy-decay');
        }, 5000);
    },

    toggleSpotlight() {
        this.isSpotlightMode = !this.isSpotlightMode;
        document.body.classList.toggle('spotlight-mode', this.isSpotlightMode);
        UI.showToast(`Focus Spotlight: ${this.isSpotlightMode ? "ON" : "OFF"}`, "info");
    },

    voiceCommand() {
        if (!('webkitSpeechRecognition' in window)) {
            UI.showToast("Voice API not supported.", "error");
            return;
        }
        
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        UI.showToast("Listening... (Say: Save, Clear, Run)", "info");

        recognition.onresult = (event) => {
            const cmd = event.results[0][0].transcript.toLowerCase();
            UI.showToast(`Heard: "${cmd}"`, "success");
            
            // B"H - Rectified Import Path: Explicitly pointing to index.js
            import('./actions/index.js').then(m => {
                if (cmd.includes("save")) m.Actions.handle('save');
                if (cmd.includes("run")) m.Actions.handle('view-html');
                if (cmd.includes("clear")) DOM.editor.value = "";
            });
        };
        
        recognition.onerror = (e) => UI.showToast("Voice Error: " + e.error, "error");
        recognition.start();
    }
};
