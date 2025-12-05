
// B"H
import { renderComposer } from '../composer.js';
import { FX } from '../fx.js';
import { setUiRef, chatState } from './state.js';
import { handleScroll, handleMagneticField, toggleSpotlight } from './physics.js';
import { updateRelativeTimes } from './messages.js';

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
                            // Trigger Cleanup via Custom Event or Callback managed by aggregator
                            // For now, we manually assume the aggregator handles view switching
                            ui.getHtml('appContainer').classList.remove('view-chat');
                            // We dispatch a cleanup event that the aggregator listens to? 
                            // Or we simply rely on the aggregator's switch logic. 
                            // Actually, let's call the global cleanup directly if we can, 
                            // but better to dispatch an event for loose coupling.
                            document.dispatchEvent(new CustomEvent('chat:exit'));
                        }}
                    },
                    { tag: 'h2', classList: ['chat-title'], shaym: 'chatTitle', textContent: 'Quantum Stream' }
                ]
            },
            { tag: 'button', classList: ['tool-btn'], textContent: '⋮', events: { click: () => toggleSpotlight() } }
        ]
    });

    // 6. TIMELINE SCRUBBER
    ui.html({
        parent, tag: 'div', shaym: 'timeScrubber', classList: ['time-scrubber'],
        events: {
            mousemove: (e) => {
                const perc = e.offsetY / e.target.offsetHeight;
                const con = ui.getHtml('msgContainer');
                if(con) con.scrollTop = perc * con.scrollHeight;
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
        }
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

    // GL Canvas
    if(!document.getElementById('particleCanvas')) {
        const cvs = document.createElement('canvas');
        cvs.id = 'particleCanvas';
        parent.appendChild(cvs);
        if(FX && FX.init) FX.init(cvs);
    }

    renderComposer(ui, parent);
    setupDropZone(parent);
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
        // File handling logic would go here
    });
    
    const overlay = document.createElement('div');
    overlay.className = 'drop-portal';
    overlay.innerHTML = '<div class="portal-text">INITIATE DATA TRANSFER</div>';
    root.appendChild(overlay);
}
