// B"H
import { state, notify } from '../store.js';
import { loadThreadHistory } from '../network.js';
import { renderComposer } from './composer.js';
import { smartParse, formatTime } from '../helpers.js';

let _uiRef = null;
let _particles = null;

export function renderChat(ui, parent) {
    _uiRef = ui;
    
    // Header
    ui.html({
        parent,
        tag: 'header',
        classList: ['chat-header'],
        children: [
            {
                tag: 'div', classList: ['flex', 'items-center'],
                children: [
                    { 
                        tag: 'button', classList: ['back-button'], textContent: '←',
                        events: { click: () => {
                            ui.getHtml('appContainer').classList.remove('view-chat');
                        }}
                    },
                    { tag: 'h2', classList: ['chat-title'], shaym: 'chatTitle', textContent: 'Select a Frequency' }
                ]
            },
            {
                tag: 'div', classList: ['header-actions'],
                children: [
                    { tag: 'button', classList: ['tool-btn'], textContent: '⋮' }
                ]
            }
        ]
    });

    // Messages
    ui.html({
        parent,
        tag: 'div',
        shaym: 'msgContainer',
        classList: ['messages-scroll'],
        events: {
            scroll: handleParallax
        }
    });

    // Particle Canvas Overlay
    const cvs = document.createElement('canvas');
    cvs.id = 'particleCanvas';
    parent.appendChild(cvs);
    _particles = new ParticleEngine(cvs);

    // Composer (Bottom)
    renderComposer(ui, parent);

    // Global Listener for Particle Triggers
    parent.addEventListener('click', (e) => {
        if(e.target.closest('.send-btn')) {
            const rect = e.target.closest('.send-btn').getBoundingClientRect();
            _particles.explode(rect.left + 22, rect.top + 22, '#ffb700');
        }
    });

    // Ghost Listener
    notify('ghost', (data) => {
        // Implement Ghost Bubble Logic here
    });
}

// --- PARTICLE ENGINE ---
class ParticleEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    explode(x, y, color) {
        for(let i=0; i<40; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                life: 1.0,
                color,
                size: Math.random() * 4 + 1
            });
        }
    }
    animate() {
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
        this.particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            p.vy += 0.5; // Gravity
            
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            this.ctx.fill();

            if(p.life <= 0) this.particles.splice(i, 1);
        });
        requestAnimationFrame(() => this.animate());
    }
}

// --- PARALLAX SCROLL ---
function handleParallax(e) {
    const el = e.target;
    const rows = el.querySelectorAll('.msg-row');
    const center = el.scrollTop + el.clientHeight / 2;
    
    rows.forEach(row => {
        const rowTop = row.offsetTop;
        const dist = (rowTop - center) * 0.05; // 3D depth factor
        // Apply transform via style directly for performance
        // Only valid if user has scrolled
        row.style.transform = `translateZ(${dist}px)`; // Requires perspective on container
    });
}

// --- CONTEXT MENU ---
function initContextMenu(row, msg) {
    row.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const existing = document.querySelector('.glass-context-menu');
        if(existing) existing.remove();

        const menu = document.createElement('div');
        menu.className = 'glass-context-menu';
        menu.style.top = e.clientY + 'px';
        menu.style.left = e.clientX + 'px';
        menu.innerHTML = `
            <div class="ctx-item" onclick="navigator.clipboard.writeText('${msg.content.replace(/'/g, "\\'")}'); this.parentElement.remove()">📋 Copy Text</div>
            <div class="ctx-item" onclick="alert('Replying...'); this.parentElement.remove()">↩️ Reply</div>
            <div class="ctx-item" onclick="this.parentElement.remove()">🗑️ Delete</div>
        `;
        document.body.appendChild(menu);

        // Close on click outside
        const close = () => { menu.remove(); window.removeEventListener('click', close); };
        setTimeout(() => window.addEventListener('click', close), 10);
    });
}

export async function switchChat(ui, threadId, displayName) {
    state.activeThread = threadId;
    ui.getHtml('chatTitle').textContent = displayName;
    ui.getHtml('appContainer').classList.add('view-chat'); 
    
    const container = ui.getHtml('msgContainer');
    
    // Singularity Loader
    container.innerHTML = `
        <div class="singularity-container">
            <div class="singularity-ring"></div>
            <div class="singularity-core"></div>
        </div>`;
    
    await loadThreadHistory(threadId);
    renderMessages(threadId);
}

export function renderMessages(threadId) {
    if (!_uiRef || state.activeThread !== threadId) return;
    const container = _uiRef.getHtml('msgContainer');
    const msgs = state.threads[threadId] || [];
    
    container.innerHTML = '';

    let lastDate = null;
    let prevSender = null;
    let prevTime = 0;

    msgs.forEach((m, index) => {
        // Sticky Date Logic
        const dateStr = new Date(m.timeSent).toLocaleDateString();
        if (dateStr !== lastDate) {
            _uiRef.html({
                parent: container,
                tag: 'div',
                classList: ['date-separator'],
                textContent: dateStr
            });
            lastDate = dateStr;
            prevSender = null;
        }

        const isMe = m.direction === 'outgoing';
        const sender = isMe ? 'me' : m.from;
        
        // Clustering Logic
        let clusterClass = '';
        const timeDiff = m.timeSent - prevTime;
        if (prevSender === sender && timeDiff < 5 * 60 * 1000) {
            clusterClass = 'cluster-middle';
            const nextMsg = msgs[index + 1];
            if (!nextMsg || (nextMsg.direction === 'outgoing' ? 'me' : nextMsg.from) !== sender) {
                clusterClass = 'cluster-end';
            }
        } else {
            if (prevSender === sender) clusterClass = 'cluster-end'; 
        }

        prevSender = sender;
        prevTime = m.timeSent;

        const classes = ['msg-row', isMe ? 'me' : 'them'];
        if(isMe) classes.push('slide-in-right'); else classes.push('slide-in-left');
        if(clusterClass) classes.push(clusterClass);

        const row = _uiRef.html({
            parent: container,
            tag: 'div',
            classList: classes,
            events: {
                dblclick: (e) => {
                    // Reaction Particles
                    _particles.explode(e.clientX, e.clientY, '#ef4444');
                    // Add visual heart
                    const heart = document.createElement('span');
                    heart.textContent = '❤️';
                    heart.style.position = 'absolute';
                    heart.style.left = '50%';
                    heart.style.top = '50%';
                    heart.style.transform = 'translate(-50%, -50%)';
                    heart.style.fontSize = '2rem';
                    heart.style.animation = 'slideUp 1s forwards';
                    e.currentTarget.appendChild(heart);
                    setTimeout(() => heart.remove(), 1000);
                }
            },
            children: [{
                tag: 'div',
                classList: ['msg-bubble'],
                children: [
                    (!clusterClass && m.subject) ? { tag: 'div', classList: ['msg-subject'], textContent: m.subject } : null,
                    { 
                        tag: 'div', 
                        classList: ['msg-content'], 
                        outerHTML: `<div class="msg-content">${smartParse(m.content)}</div>`
                    },
                    { tag: 'div', classList: ['msg-time'], textContent: formatTime(m.timeSent) }
                ]
            }]
        });

        initContextMenu(row, m);
    });

    setTimeout(() => container.scrollTop = container.scrollHeight, 0);
}