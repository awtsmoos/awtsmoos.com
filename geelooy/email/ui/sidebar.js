
// B"H
import { state, subscribe } from '../store.js';
import { formatTime } from '../helpers.js';
import { FX } from './fx.js';
import { switchChat } from './chat.js';
import createProfileDropdown from '/scripts/awtsmoos/social/profileDropdown.js';

let _uiRef = null;

export function renderSidebar(ui, parent) {
    _uiRef = ui;
    
    // Subscribe to updates
    subscribe((key, val) => {
        if (key === 'snippets') renderThreadList();
    });

    // Header
    ui.html({
        parent,
        tag: 'div',
        classList: ['sidebar-header'],
        style: 'overflow: visible; z-index: 100;', // FIXED: Allow dropdown to overflow
        children: [
            { 
                tag: 'div', 
                style: 'display:flex; flex-direction:column; gap:4px; width:100%;',
                children: [
                    { tag: 'div', classList: ['brand-title'], textContent: 'Awtsmoos Mail' },
                    // Mount Point for Profile Dropdown
                    { 
                        tag: 'div', 
                        shaym: 'sidebarProfileMount',
                        style: 'font-size:0.8rem; position:relative; z-index:1000; margin-top: 5px;',
                        ready: (el) => {
                            try {
                                createProfileDropdown(el);
                                // Style Tweaks for Sidebar context
                                const style = document.createElement('style');
                                style.textContent = `
                                    .awtsmoosDrop { width: 100%; }
                                    .awtsmoosDrop .btn.dropt { 
                                        color: var(--neon-cyan); 
                                        padding: 8px 12px; 
                                        background: rgba(6, 182, 212, 0.1); 
                                        border: 1px solid rgba(6, 182, 212, 0.2); 
                                        border-radius: 6px;
                                        font-family: var(--font-mono); font-size: 0.8rem;
                                        display: flex; align-items: center; justify-content: space-between; gap: 6px;
                                        width: 100%; box-sizing: border-box;
                                        cursor: pointer; transition: 0.2s;
                                    }
                                    .awtsmoosDrop .btn.dropt:hover {
                                        background: rgba(6, 182, 212, 0.2);
                                        border-color: var(--neon-cyan);
                                        box-shadow: 0 0 10px rgba(6, 182, 212, 0.1);
                                    }
                                    .awtsmoosDrop .arrow { font-size: 0.6em; opacity: 0.7; }
                                    .awtsmoosDrop .dropdown-content {
                                        background: rgba(5, 5, 8, 0.98);
                                        border: 1px solid var(--neon-cyan);
                                        backdrop-filter: blur(20px);
                                        box-shadow: 0 10px 40px #000;
                                        min-width: 220px;
                                        top: 110%; left: 0;
                                        z-index: 99999;
                                        border-radius: 8px;
                                        padding: 8px 0;
                                    }
                                    .awtsmoosDrop .dropdown-content > div { padding: 8px 16px; }
                                    .awtsmoosDrop .dropdown-content a { color: #fff; text-decoration: none; display:block; padding: 8px 16px; }
                                    .awtsmoosDrop .dropdown-content a:hover { background: rgba(255,255,255,0.1); }
                                `;
                                el.appendChild(style);
                            } catch(e) { console.error("Profile Mount Error", e); }
                        }
                    }
                ]
            }
        ]
    });

    // Compose Button
    ui.html({
        parent,
        tag: 'button',
        classList: ['fab-compose'],
        textContent: '+ NEW TRANSMISSION',
        events: {
            click: () => {
                const modal = ui.getHtml('composeModal');
                if(modal) {
                     modal.classList.remove('hidden');
                     setTimeout(() => modal.classList.add('visible'), 10);
                     if(FX.playSound) FX.playSound('hover');
                }
            }
        }
    });

    // Tabs
    ui.html({
        parent,
        tag: 'div', classList: ['tabs-container'],
        children: [
            { tag: 'button', classList: ['nav-tab', 'active'], textContent: 'Inbox', events: { click: (e) => updateTabs(e, 'inbox') } },
            { tag: 'button', classList: ['nav-tab'], textContent: 'Requests', events: { click: (e) => updateTabs(e, 'requests') } }
        ]
    });

    // Thread List Container
    ui.html({ parent, tag: 'div', shaym: 'threadList', classList: ['thread-list'] });
}

function updateTabs(e, view) {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    setView(view);
}

function setView(view) {
    state.view = view;
    renderThreadList();
}

function formatHandle(str) {
    if(!str) return "Unknown";
    
    // 1. Basic Decode
    let formatted = str.replace(/_at_/g, '@');
    
    // 2. Remove redundant default domain suffix
    // Example: coby@gmail.com@awtsmoos.com -> coby@gmail.com
    const defaultDomain = "@awtsmoos.com"; // Adjust if your domain differs
    
    if (formatted.endsWith(defaultDomain)) {
        const withoutSuffix = formatted.slice(0, -defaultDomain.length);
        // Only strip if what remains is still a valid-ish handle (contains @ or at least 1 char)
        if (withoutSuffix.length > 0) {
            // If the remaining part is an email (has @), we definitely strip the federated suffix
            if (withoutSuffix.includes('@')) {
                formatted = withoutSuffix;
            }
            // If it's just a username "awtsmoos@awtsmoos.com", we might keep it or strip it depending on preference.
            // Let's strip it to be clean: "awtsmoos"
            else {
               // Optional: formatted = withoutSuffix; 
            }
        }
    }

    return formatted;
}

function getQuantumColor(name) {
    let hash = 0;
    if(!name) name = "?";
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return `linear-gradient(135deg, #${("00000" + c).substr(-6)}44, #${("00000" + c).substr(-6)}aa)`;
}

export function renderThreadList() {
    if (!_uiRef) return;
    const list = _uiRef.getHtml('threadList');
    list.innerHTML = '';

    const threads = state.snippets ? state.snippets.filter(t => {
        if(state.view === 'requests') return t.status === 'request';
        return (!t.status || t.status === 'inbox');
    }) : [];

    if (threads.length === 0) {
        _uiRef.html({ parent: list, tag: 'div', style: 'padding:20px; text-align:center; color:#555;', textContent: 'Void.' });
        return;
    }

    threads.forEach(t => {
        const rawName = t.correspondent || "Unknown";
        const displayName = formatHandle(rawName);
        const bg = getQuantumColor(displayName);
        const isActive = state.activeThread === t.correspondent;
        
        _uiRef.html({
            parent: list,
            tag: 'div',
            classList: ['thread-item', isActive ? 'active' : null].filter(Boolean),
            events: {
                click: () => { 
                    if(FX.playSound) FX.playSound('hover'); 
                    switchChat(_uiRef, t.correspondent, displayName);
                    renderThreadList(); 
                }
            },
            children: [
                { tag: 'div', classList: ['avatar-circle'], style: `background: ${bg}`, textContent: displayName[0].toUpperCase() },
                {
                    tag: 'div', classList: ['thread-content'],
                    children: [
                        {
                            tag: 'div', classList: ['thread-top'],
                            children: [
                                {tag:'span', classList:['thread-name'], textContent: displayName }, 
                                {tag:'span', classList:['thread-time'], textContent: formatTime(t.timeSent) }
                            ]
                        },
                        { tag: 'div', classList: ['thread-snippet'], textContent: (t.snippet || "...").substring(0, 40) }
                    ]
                }
            ]
        });
    });
}
