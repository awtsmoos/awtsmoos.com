
// B"H
// FILE: js/visuals/graph-nav.js

import { State } from '../state.js';
import { Tabs } from '../tabs/index.js';

/**
 * --- GRAPH NAVIGATOR ---
 * B"H - Visualizes the project hierarchy as a living graph.
 * Refined with defensive initialization to prevent startup shevirah.
 */
export const GraphNav = {
    overlay: null,
    canvas: null,
    ctx: null,
    nodes: [],
    links: [],
    isRunning: false,
    
    init() {
        this.overlay = document.getElementById('graph-nav-overlay');
        this.canvas = document.getElementById('graph-canvas');
        
        // Defensive check: If vessels haven't manifested in HTML, abort quietly
        if (!this.overlay || !this.canvas) {
            console.warn('[GraphNav] Vessels not found in DOM. Navigator disabled.');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        
        const closeBtn = document.getElementById('graph-nav-close');
        if (closeBtn) closeBtn.onclick = () => this.hide();
        
        // Unified Click/Tap Handler
        const handleInteract = (clientX, clientY) => {
            const clicked = this.nodes.find(n => {
                const dx = n.x - clientX;
                const dy = n.y - clientY;
                const hitRadius = window.innerWidth < 768 ? 40 : 20; 
                return Math.sqrt(dx*dx + dy*dy) < hitRadius;
            });
            
            if (clicked) {
                Tabs.create(clicked.item);
                this.hide();
            }
        };

        this.canvas.addEventListener('click', (e) => handleInteract(e.clientX, e.clientY));
        
        this.canvas.addEventListener('touchstart', (e) => {
            if(e.touches.length === 1) {
                e.preventDefault(); 
                handleInteract(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: false });
        
        window.addEventListener('resize', () => {
            if (this.isRunning && this.canvas) {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            }
        });
    },
    
    show() {
        if (!this.overlay || !this.canvas) return;
        
        this.overlay.classList.remove('hidden');
        void this.overlay.offsetWidth;
        this.overlay.classList.add('visible');
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.isRunning = true;
        this._buildGraph();
        this._loop();
    },
    
    hide() {
        if (!this.overlay) return;
        this.overlay.classList.remove('visible');
        setTimeout(() => {
            if (this.overlay) this.overlay.classList.add('hidden');
            this.isRunning = false;
        }, 300);
    },
    
    _buildGraph() {
        this.nodes = [];
        this.links = [];
        
        // 1. Create Root Nodes (Workspaces)
        State.workspaces.forEach(ws => {
            this.nodes.push({
                id: ws.id,
                label: ws.name,
                type: 'root',
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: 0, vy: 0,
                item: { ...ws, path: '/', kind: 'directory' }
            });
        });
        
        // 2. Create Nodes from DOM Item Map
        State.domItemMap.forEach((entry, uniquePath) => {
            const item = entry.item;
            if (item.path === '/') return; 
            
            const node = {
                id: uniquePath,
                label: item.name,
                type: item.kind,
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: 0, vy: 0,
                item: item
            };
            this.nodes.push(node);
            
            const parentPath = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
            const parentUnique = `${item.workspaceId}::${parentPath}`;
            
            let parentNode = this.nodes.find(n => 
                (n.type === 'root' && n.id === item.workspaceId && parentPath === '/') ||
                (n.id === parentUnique)
            );
            
            if (parentNode) {
                this.links.push({ source: parentNode, target: node });
            }
        });
    },
    
    _loop() {
        if (!this.isRunning || !this.ctx) return;
        
        const center = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        const repulsion = window.innerWidth < 768 ? 2000 : 5000; 
        
        this.nodes.forEach(node => {
            this.nodes.forEach(other => {
                if (node === other) return;
                const dx = node.x - other.x;
                const dy = node.y - other.y;
                const dist = Math.sqrt(dx*dx + dy*dy) || 1;
                const force = repulsion / (dist * dist);
                node.vx += (dx / dist) * force;
                node.vy += (dy / dist) * force;
            });
            
            node.vx += (center.x - node.x) * 0.005;
            node.vy += (center.y - node.y) * 0.005;
            node.vx *= 0.9;
            node.vy *= 0.9;
            node.x += node.vx;
            node.y += node.vy;
            
            if (node.x < 0) node.x = 0;
            if (node.x > this.canvas.width) node.x = this.canvas.width;
            if (node.y < 0) node.y = 0;
            if (node.y > this.canvas.height) node.y = this.canvas.height;
        });
        
        this.links.forEach(link => {
            const dx = link.target.x - link.source.x;
            const dy = link.target.y - link.source.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const springLen = window.innerWidth < 768 ? 50 : 100;
            const force = (dist - springLen) * 0.05; 
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            link.source.x += fx;
            link.source.y += fy;
            link.target.x -= fx;
            link.target.y -= fy;
        });
        
        this._render();
        requestAnimationFrame(() => this._loop());
    },
    
    _render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.strokeStyle = 'rgba(100, 100, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        this.links.forEach(link => {
            ctx.moveTo(link.source.x, link.source.y);
            ctx.lineTo(link.target.x, link.target.y);
        });
        ctx.stroke();
        
        const isMobile = window.innerWidth < 768;
        this.nodes.forEach(node => {
            const radius = node.type === 'root' ? (isMobile ? 15 : 10) : (isMobile ? 8 : 5);
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = node.type === 'root' ? '#00f6ff' : (node.type === 'directory' ? '#ffe000' : '#ffffff');
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.font = isMobile ? '12px monospace' : '10px monospace';
            ctx.fillText(node.label, node.x + radius + 4, node.y + 4);
        });
    }
};
