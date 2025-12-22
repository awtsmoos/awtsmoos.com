
// B"H
// FILE: js/visuals/index.js

import { NebulaMap } from './nebula-map.js';
import { ParticleSystem } from './particle-system.js';
import { ScopeLaser } from './scope-laser.js';
import { GraphNav } from './graph-nav.js';
import { HUD } from './hud.js';
import { ZenRain } from './zen-rain.js';
import { CaretRadar } from './caret-radar.js';
import { NeonBrackets } from './neon-brackets.js';
import { ColorOrbs } from './color-orbs.js';
import { VisualSettings } from './settings.js';

export const VisualEngine = {
    canvasOverlay: null,
    ctxOverlay: null,
    
    isRunning: false,
    
    init() {
        VisualSettings.init();
        
        this.canvasOverlay = document.getElementById('canvas-overlay');
        if (!this.canvasOverlay) return; // Guard
        
        this.ctxOverlay = this.canvasOverlay.getContext('2d');
        
        this._resize();
        window.addEventListener('resize', () => this._resize());
        
        // Initialize Sub-Systems
        NebulaMap.init();
        ParticleSystem.init(this.ctxOverlay);
        ScopeLaser.init(this.ctxOverlay);
        GraphNav.init();
        HUD.init();
        ZenRain.init();
        CaretRadar.init(this.ctxOverlay);
        NeonBrackets.init(this.ctxOverlay);
        
        this.startLoop();
    },
    
    _resize() {
        if (!this.canvasOverlay) return;
        // B"H - Use window dimensions to match position: fixed
        this.canvasOverlay.width = window.innerWidth;
        this.canvasOverlay.height = window.innerHeight;
    },
    
    startLoop() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        const loop = () => {
            if (!this.isRunning) return;
            
            // Clear Overlay Canvas
            this.ctxOverlay.clearRect(0, 0, this.canvasOverlay.width, this.canvasOverlay.height);
            
            // Update & Draw Sub-systems based on Settings
            if (VisualSettings.get('zenRain')) {
                ZenRain.update();
            } else {
                // B"H - Explicitly clear rain if disabled to prevent freezing artifacts
                ZenRain.clear();
            }
            
            // Editor Overlays
            if (VisualSettings.get('scopeLaser')) ScopeLaser.render();
            if (VisualSettings.get('neonBrackets')) NeonBrackets.render();
            if (VisualSettings.get('particles')) ParticleSystem.updateAndRender();
            if (VisualSettings.get('caretRadar')) CaretRadar.render();
            
            // Right-side Minimap 
            if (VisualSettings.get('nebulaMap')) NebulaMap.render();
            else {
                // Clear minimap if disabled but canvas exists
                const mm = document.getElementById('minimap-canvas');
                if (mm) {
                    const ctx = mm.getContext('2d');
                    ctx.clearRect(0, 0, mm.width, mm.height);
                }
            }
            
            if (VisualSettings.get('hud')) {
                HUD.toggle(true);
                HUD.update();
            } else {
                HUD.toggle(false);
            }
            
            requestAnimationFrame(loop);
        };
        loop();
    },
    
    onInput(text, deletion = false) {
        if (VisualSettings.get('hud')) HUD.registerAction();
        if (VisualSettings.get('zenRain')) ZenRain.addEnergy();
        if (VisualSettings.get('particles') && deletion) ParticleSystem.spawnFromCaret('delete');
        
        // Shockwave
        if (VisualSettings.get('shockwave') && HUD.apm > 150) {
            document.body.classList.add('shockwave-active');
            setTimeout(() => document.body.classList.remove('shockwave-active'), 100);
        }
        
        // Color Orbs (Debounced in logic usually, but handled by UI update loop)
        if (VisualSettings.get('colorOrbs')) {
             ColorOrbs.scanAndRender(document.getElementById('line-numbers'));
        }
    },
    
    onScroll() {
        if (VisualSettings.get('nebulaMap')) NebulaMap.onScroll();
    },
    
    onCaretMove() {
        if (VisualSettings.get('scopeLaser')) ScopeLaser.updatePosition();
        if (VisualSettings.get('caretRadar')) CaretRadar.ping();
        if (VisualSettings.get('neonBrackets')) NeonBrackets.scan();
    },
    
    triggerGraphNav() {
        if (VisualSettings.get('graphNav')) GraphNav.show();
    }
};