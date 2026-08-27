
// B"H
// FILE: js/visuals/nebula-map.js

import { DOM, State } from '../state.js';

export const NebulaMap = {
    canvas: null,
    ctx: null,
    isDragging: false,
    
    init() {
        this.canvas = document.getElementById('minimap-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this._handleInput(e.clientY);
        });
        window.addEventListener('mousemove', (e) => {
            if (this.isDragging) this._handleInput(e.clientY);
        });
        window.addEventListener('mouseup', () => this.isDragging = false);

        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                e.preventDefault(); 
                this.isDragging = true;
                this._handleInput(e.touches[0].clientY);
            }
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            if (this.isDragging && e.touches.length > 0) {
                e.preventDefault();
                this._handleInput(e.touches[0].clientY);
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', () => this.isDragging = false);
    },
    
    _handleInput(clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const y = clientY - rect.top;
        const percentage = Math.max(0, Math.min(1, y / rect.height));
        const editor = DOM.editor;
        const targetScroll = (percentage * editor.scrollHeight) - (editor.clientHeight / 2);
        editor.scrollTop = targetScroll;
    },
    
    render() {
        if (!State.activeTabId || DOM.editorWrapper.classList.contains('hidden')) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }
        
        const editor = DOM.editor;
        const text = editor.value;
        const lines = text.split('\n');
        
        const rect = this.canvas.getBoundingClientRect();
        if (this.canvas.width !== rect.width || this.canvas.height !== rect.height) {
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
        }

        const w = this.canvas.width;
        const h = this.canvas.height;
        this.ctx.clearRect(0, 0, w, h);
        
        const totalLines = lines.length;
        const lineHeight = Math.max(window.innerWidth < 768 ? 2 : 1, h / totalLines); 
        
        // B"H - Calculate Selection Range Lines
        const selStart = editor.selectionStart;
        const selEnd = editor.selectionEnd;
        const selStartLine = text.substring(0, selStart).split('\n').length - 1;
        const selEndLine = text.substring(0, selEnd).split('\n').length - 1;
        const hasSelection = selStart !== selEnd;
        
        lines.forEach((line, i) => {
            if (!line.trim()) return;
            const y = i * lineHeight;
            
            // Heuristic Color
            let color = 'rgba(160, 168, 208, 0.5)'; 
            if (line.includes('function') || line.includes('=>')) color = 'rgba(0, 246, 255, 0.8)';
            if (line.includes('import') || line.includes('export')) color = 'rgba(255, 0, 255, 0.8)';
            if (line.match(/^\s*(\/\/|\*)/)) color = 'rgba(100, 255, 100, 0.4)';
            
            // Selection Highlight Aura
            if (hasSelection && i >= selStartLine && i <= selEndLine) {
                color = 'rgba(255, 215, 0, 0.9)'; // Golden highlight
            }
            
            const indent = line.search(/\S|$/);
            const x = (indent * 2);
            const lineWidth = Math.min(w - x, line.length * 2);
            
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, lineWidth, Math.ceil(lineHeight));
        });
        
        // Draw Viewport Highlight Box
        const scrollPercent = editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
        const visiblePercent = editor.clientHeight / editor.scrollHeight;
        
        const viewY = scrollPercent * h;
        const viewH = Math.max(20, visiblePercent * h); 
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(0, viewY, w, viewH);
        this.ctx.strokeStyle = 'rgba(0, 246, 255, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(0, viewY, w, viewH);
    },
    
    onScroll() {}
};
