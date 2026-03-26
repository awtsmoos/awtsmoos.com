
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
import { ASTEngine } from '../tools/ast-engine.js';
import { DOM, State } from '../state.js';
import { Editor } from '../editor.js';

export const VisualEngine = {
    canvasOverlay: null,
    ctxOverlay: null,
    isRunning: false,
    hoverDebounce: null,
    hideTimer: null,
    _cachedCharWidth: null,
    
    init() {
        this.canvasOverlay = document.getElementById('canvas-overlay');
        if (!this.canvasOverlay) return; 
        
        this.ctxOverlay = this.canvasOverlay.getContext('2d');
        this._resize();
        window.addEventListener('resize', () => {
            this._resize();
            this._cachedCharWidth = null; 
        });
        
        DOM.editor.addEventListener('mousemove', (e) => this._handleHover(e));
        DOM.editor.addEventListener('mouseleave', () => this._hideTooltip());
        
        const tooltip = DOM.intelligenceTooltip;
        if (tooltip) {
            // Apply defensive high Z-Index
            tooltip.style.zIndex = '300000';
            tooltip.addEventListener('mouseenter', () => {
                if (this.hideTimer) clearTimeout(this.hideTimer);
            });
            tooltip.addEventListener('mouseleave', () => {
                this._hideTooltip();
            });
            tooltip.addEventListener('click', (e) => {
                if (e.target.classList.contains('generate-docs-link')) {
                    e.preventDefault();
                    e.stopPropagation();
                    const start = parseInt(e.target.dataset.start);
                    const template = decodeURIComponent(e.target.dataset.template);
                    const editor = DOM.editor;
                    editor.setRangeText(template + '\n', start, start, 'select');
                    editor.dispatchEvent(new Event('input'));
                    this._hideTooltip(true); 
                }
            });
        }
        
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

    _getCharWidth() {
        if (this._cachedCharWidth) return this._cachedCharWidth;
        const style = window.getComputedStyle(DOM.editor);
        const span = document.createElement('span');
        span.style.fontFamily = style.fontFamily;
        span.style.fontSize = style.fontSize;
        span.style.fontWeight = style.fontWeight;
        span.style.letterSpacing = style.letterSpacing;
        span.style.visibility = 'hidden';
        span.style.position = 'absolute';
        span.style.whiteSpace = 'pre';
        span.textContent = 'M'.repeat(100); 
        DOM.editorWrapper.appendChild(span);
        
        // Defensive zero width protection
        let width = span.getBoundingClientRect().width;
        if (width <= 0) width = parseFloat(style.fontSize) * 60; // Approximate fallback

        DOM.editorWrapper.removeChild(span);
        this._cachedCharWidth = width / 100;
        return this._cachedCharWidth;
    },

    async _handleHover(e) {
        if (!VisualSettings.get('intelligence')) return;
        if (this.hoverDebounce) clearTimeout(this.hoverDebounce);
        
        this.hoverDebounce = setTimeout(async () => {
            const tab = State.tabs.find(t => t.id === State.activeTabId);
            if (!tab || tab.fileType !== 'text' || DOM.editorWrapper.classList.contains('hidden')) {
                this._hideTooltip();
                return;
            }

            const rect = DOM.editor.getBoundingClientRect();
            const y = e.clientY - rect.top + DOM.editor.scrollTop;
            const style = window.getComputedStyle(DOM.editor);
            
            const lh = parseFloat(style.lineHeight) || 24;
            const paddingTop = parseFloat(style.paddingTop) || 10;
            const paddingLeft = parseFloat(style.paddingLeft) || 10;
            const charWidth = this._getCharWidth() || 8; 
            
            const line = Math.floor((y - paddingTop) / lh);
            const x = e.clientX - rect.left - paddingLeft + DOM.editor.scrollLeft;
            const col = Math.round(x / charWidth);

            const lines = DOM.editor.value.split('\n');
            if (line >= 0 && line < lines.length) {
                let offset = 0;
                for(let i=0; i<line; i++) offset += lines[i].length + 1;
                const finalCol = Math.max(0, Math.min(col, lines[line].length));
                offset += finalCol;

                // AST Lookup
                const data = await ASTEngine.getSummaryAtOffset(DOM.editor.value, offset);
                
                if (data) {
                    this._showTooltip(e.clientX, e.clientY, data);
                } else {
                    const secondaryData = await ASTEngine.getSummaryAtOffset(DOM.editor.value, Math.max(0, offset - 1));
                    if (secondaryData) this._showTooltip(e.clientX, e.clientY, secondaryData);
                    else this._hideTooltip();
                }
            } else {
                this._hideTooltip();
            }
        }, 50); 
    },

    _showTooltip(x, y, data) {
        const tooltip = DOM.intelligenceTooltip;
        if (!tooltip) return;
        
        if (this.hideTimer) clearTimeout(this.hideTimer);

        tooltip.innerHTML = `
            <div class="tooltip-header">
                <span>${data.summary}</span>
                <span style="font-size:0.8em; opacity:0.5;">B"H</span>
            </div>
            <div class="tooltip-body">
                ${data.docs ? `<div class="tooltip-docs">${data.docs}</div>` : ''}
                <div class="tooltip-signature"><code>${data.signature}</code></div>
            </div>
        `;
        
        tooltip.classList.remove('hidden');
        
        const marginX = 15;
        const marginY = 20; 
        
        let posX = x + marginX;
        let posY = y + marginY;
        
        const tooltipRect = tooltip.getBoundingClientRect();
        if (posX + tooltipRect.width > window.innerWidth) posX = x - tooltipRect.width - marginX;
        if (posY + tooltipRect.height > window.innerHeight) posY = y - tooltipRect.height - marginY;
        
        tooltip.style.left = `${Math.max(10, posX)}px`;
        tooltip.style.top = `${Math.max(10, posY)}px`;
        tooltip.style.opacity = '1';
    },

    _hideTooltip(immediate = false) {
        if (this.hideTimer) clearTimeout(this.hideTimer);
        
        const performHide = () => {
            const tooltip = DOM.intelligenceTooltip;
            if (tooltip && tooltip.style.opacity !== '0') {
                tooltip.style.opacity = '0';
                setTimeout(() => {
                    if (tooltip.style.opacity === '0') tooltip.classList.add('hidden');
                }, 200);
            }
        };

        if (immediate) performHide();
        else this.hideTimer = setTimeout(performHide, 300);
    },
    
    _resize() {
        if (!this.canvasOverlay) return;
        this.canvasOverlay.width = window.innerWidth;
        this.canvasOverlay.height = window.innerHeight;
    },
    
    startLoop() {
        if (this.isRunning) return;
        this.isRunning = true;
        const loop = () => {
            if (!this.isRunning) return;
            this.ctxOverlay.clearRect(0, 0, this.canvasOverlay.width, this.canvasOverlay.height);
            const safeRender = (fn) => { try { fn(); } catch(e) {} };
            
            if (VisualSettings.get('zenRain')) safeRender(() => ZenRain.update());
            if (VisualSettings.get('scopeLaser')) safeRender(() => ScopeLaser.render());
            if (VisualSettings.get('neonBrackets')) safeRender(() => NeonBrackets.render());
            if (VisualSettings.get('particles')) safeRender(() => ParticleSystem.updateAndRender());
            if (VisualSettings.get('caretRadar')) safeRender(() => CaretRadar.render());
            if (VisualSettings.get('nebulaMap')) safeRender(() => NebulaMap.render());
            
            safeRender(() => {
                if (VisualSettings.get('hud')) { HUD.toggle(true); HUD.update(); } 
                else { HUD.toggle(false); }
            });
            requestAnimationFrame(loop);
        };
        loop();
    },
    
    onInput(text, deletion = false) {
        if (VisualSettings.get('hud')) HUD.registerAction();
        if (VisualSettings.get('zenRain')) ZenRain.addEnergy();
        if (VisualSettings.get('particles') && deletion) ParticleSystem.spawnFromCaret('delete');
        if (VisualSettings.get('colorOrbs')) ColorOrbs.scanAndRender(document.getElementById('line-numbers'));
    },
    
    onScroll() { 
        if (VisualSettings.get('nebulaMap')) NebulaMap.onScroll(); 
        this._hideTooltip(true); 
    },
    
    onCaretMove() {
        if (VisualSettings.get('scopeLaser')) ScopeLaser.updatePosition();
        if (VisualSettings.get('caretRadar')) CaretRadar.ping();
        if (VisualSettings.get('neonBrackets')) NeonBrackets.scan();
        this._hideTooltip(true);
    },
    
    triggerGraphNav() { if (VisualSettings.get('graphNav')) GraphNav.show(); }
};
