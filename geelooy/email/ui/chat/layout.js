
// B"H
import { renderComposer } from '../composer.js';
import { FX } from '../fx.js';
import { setUiRef, chatState } from './state.js';
import { handleScroll, handleMagneticField, toggleSpotlight } from './physics.js';
import { deleteThread } from '../../network.js';
import { renderThreadList } from '../sidebar.js';
import { state as globalState, notify } from '../../store.js';

export function initChatLayout(ui, parent) {
    setUiRef(ui);
    
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
                            document.dispatchEvent(new CustomEvent('chat:exit'));
                            // Clear URL params
                            const url = new URL(window.location);
                            url.searchParams.delete('thread');
                            window.history.pushState({}, '', url);
                        }}
                    },
                    { tag: 'h2', classList: ['chat-title'], shaym: 'chatTitle', textContent: 'Quantum Stream' }
                ]
            },
            { 
                tag: 'div', 
                style: 'position:relative;',
                children: [
                    { 
                        tag: 'button', classList: ['tool-btn'], textContent: '⋮', 
                        events: { 
                            click: (e) => {
                                const menu = e.target.nextSibling;
                                menu.classList.toggle('hidden');
                            } 
                        } 
                    },
                    // HEADER MENU
                    {
                        tag: 'div', classList: ['context-menu', 'hidden'],
                        style: 'position:absolute; top:30px; right:0; width:150px; opacity:1; transform:none;',
                        children: [
                            { 
                                tag: 'div', classList: ['ctx-item'], textContent: 'Toggle Spotlight',
                                events: { click: (e) => { e.target.parentElement.classList.add('hidden'); toggleSpotlight(); } }
                            },
                            { tag: 'div', classList: ['ctx-separator'] },
                            { 
                                tag: 'div', classList: ['ctx-item', 'ctx-danger'], textContent: 'Delete Thread',
                                events: { click: (e) => { 
                                    e.target.parentElement.classList.add('hidden');
                                    showDeleteConfirmation(ui, parent);
                                } }
                            }
                        ],
                        ready: (el) => {
                            document.addEventListener('click', (ev) => {
                                if(!el.contains(ev.target) && !el.previousSibling.contains(ev.target)) {
                                    el.classList.add('hidden');
                                }
                            });
                        }
                    }
                ]
            }
        ]
    });

    // 6. TIMELINE SCRUBBER
    ui.html({
        parent, tag: 'div', shaym: 'timeScrubber', classList: ['time-scrubber'],
        events: {
            click: (e) => {
                const perc = e.offsetY / e.target.offsetHeight;
                const con = ui.getHtml('msgContainer');
                if(con) con.scrollTop = perc * con.scrollHeight;
            },
            mousemove: (e) => {
                if(e.buttons === 1) {
                    const perc = e.offsetY / e.target.offsetHeight;
                    const con = ui.getHtml('msgContainer');
                    if(con) con.scrollTop = perc * con.scrollHeight;
                }
            }
        }
    });

    // Command Modal
    ui.html({
        parent, tag: 'div', shaym: 'cmdModal', classList: ['cmd-modal', 'hidden'],
        children: [{
            tag: 'input', classList: ['cmd-input'], placeholder: 'Run protocol...',
            events: { keydown: handleCmdKey }
        }]
    });

    // Message Container
    ui.html({
        parent,
        tag: 'div',
        shaym: 'msgContainer',
        classList: ['messages-scroll'],
        events: { 
            scroll: (e) => handleScroll(e),
            click: (e) => { if(FX.triggerSonar) FX.triggerSonar(e.clientX, e.clientY); },
            mousemove: (e) => handleMagneticField(e)
        },
        children: [
            // EMPTY STATE / LANDING HERO
            {
                tag: 'div', classList: ['void-logo'], 
                children: [
                    { tag: 'div', style: 'font-size: 3rem; margin-bottom: 20px;', textContent: '⚛' },
                    { tag: 'h2', textContent: 'Awaiting Transmission' },
                    { tag: 'p', style: 'color: var(--text-secondary);', textContent: 'Select a frequency from the sidebar to begin.' }
                ]
            }
        ]
    });

    // Wormhole Loader
    const container = ui.getHtml('msgContainer');
    if(container) {
        ui.html({
            parent: container,
            tag: 'div', shaym: 'wormhole', classList: ['wormhole-loader', 'hidden'],
            textContent: 'WARPING SPACETIME...'
        });
    }

    if(!document.getElementById('particleCanvas')) {
        const cvs = document.createElement('canvas');
        cvs.id = 'particleCanvas';
        parent.appendChild(cvs);
        if(FX && FX.init) FX.init(cvs);
    }

    renderComposer(ui, parent);
    setupDropZone(parent);
}

function showDeleteConfirmation(ui, parent) {
    const confirmId = 'delConfirm_' + Date.now();
    ui.html({
        parent: parent.closest('.app-container') || parent,
        tag: 'div',
        dataset: { id: confirmId },
        classList: ['overlay', 'visible'],
        style: 'z-index: 10000;',
        children: [{
            tag: 'div',
            classList: ['modal-card', 'holo-border'],
            style: 'border-color: var(--mail-danger); text-align:center; max-width: 400px; background: #fff;',
            children: [
                { tag: 'h3', style: 'color: var(--mail-danger); margin-top:0; font-size: 1.1rem;', textContent: '⚠️ CRITICAL WARNING' },
                { tag: 'p', style: 'color: #ccc; margin: 20px 0;', textContent: 'Permanently purge this timeline from local reality? This action cannot be undone.' },
                { 
                    tag: 'div', classList: ['flex'], style: 'gap: 12px; justify-content: center;',
                    children: [
                        { 
                            tag: 'button', 
                            classList: ['btn-primary'], 
                            style: 'background: transparent; border: 1px solid #555; color: #aaa; flex:1;', 
                            textContent: 'ABORT',
                            events: { click: () => {
                                const el = document.querySelector(`[data-id="${confirmId}"]`);
                                if(el) el.remove();
                            }}
                        },
                        { 
                            tag: 'button', 
                            classList: ['btn-primary'], 
                            style: 'background: var(--mail-danger); color: #fff; flex:1;', 
                            textContent: 'PURGE',
                            events: { click: async () => {
                                const el = document.querySelector(`[data-id="${confirmId}"]`);
                                if(el) el.remove();
                                
                                if(chatState.activeThreadId) {
                                    if(FX.playSound) FX.playSound('error'); // Reuse error sound or similar for dramatic effect
                                    await deleteThread(chatState.activeThreadId);
                                    
                                    // Cleanup Local State
                                    delete globalState.threads[chatState.activeThreadId];
                                    globalState.snippets = globalState.snippets.filter(s => s.correspondent !== chatState.activeThreadId);
                                    
                                    renderThreadList();
                                    document.querySelector('.back-button').click();
                                }
                            }}
                        }
                    ]
                }
            ]
        }]
    });
}

function handleCmdKey(e) {
    if(e.key === 'Enter') {
        const val = e.target.value.toLowerCase();
        if(val === 'theme zen' && FX.setTheme) FX.setTheme('zen');
        else if(val === 'theme mech' && FX.setTheme) FX.setTheme('mech');
        else if(val === 'home') document.querySelector('.back-button').click();
        e.target.value = '';
        e.target.parentElement.classList.add('hidden');
    }
    if(e.key === 'Escape') e.target.parentElement.classList.add('hidden');
}

function setupDropZone(root) {
    if(root.querySelector('.drop-portal')) return;
    
    // Simple drag drop logic
    root.addEventListener('dragover', (e) => { e.preventDefault(); root.classList.add('dragging-over'); });
    root.addEventListener('dragleave', () => { root.classList.remove('dragging-over'); });
    root.addEventListener('drop', (e) => {
        e.preventDefault();
        root.classList.remove('dragging-over');
    });
    
    const overlay = document.createElement('div');
    overlay.className = 'drop-portal';
    overlay.innerHTML = '<div class="portal-text">INITIATE DATA TRANSFER</div>';
    root.appendChild(overlay);
}
