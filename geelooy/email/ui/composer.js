
// B"H
import { sendMessageApi, broadcastTyping } from '../network.js';
import { state, subscribe } from '../store.js';
import { smartParse, htmlToMarkdown } from '../helpers.js';
import { FX } from './fx.js';

export function renderComposer(ui, parent) {
    
    subscribe((key, val) => {
        if(key === 'triggerReply') {
            const { msg, name } = val;
            state.replyingTo = msg;
            
            const bar = ui.getHtml('replyBar');
            bar.classList.remove('hidden');
            bar.classList.add('visible'); 
            
            ui.getHtml('replyText').innerHTML = `<span>Entangled with</span> <strong>${name}</strong>`;
            
            const subInput = ui.getHtml('compSubject');
            if(subInput) {
                const oldSub = msg.subject || "No Subject";
                subInput.value = oldSub.startsWith("Re:") ? oldSub : "Re: " + oldSub;
            }

            const msgEls = document.querySelectorAll('.msg-row');
            let targetEl = null;
            msgEls.forEach(el => {
                if(el.dataset.id === msg.id) targetEl = el.querySelector('.msg-bubble');
            });
            if(targetEl) FX.setTether(targetEl, ui.getHtml('composerBox'));

            const visual = ui.getHtml('compVisual');
            if(!visual.classList.contains('hidden')) visual.focus();
            else ui.getHtml('compSource').focus();
        }
        if(key === 'filesDropped') {
            const container = ui.getHtml('attachArea');
            container.classList.remove('hidden');
            Array.from(val).forEach(f => {
                const chip = document.createElement('div');
                chip.className = 'attach-chip';
                chip.innerText = f.name;
                chip.onclick = () => chip.remove();
                container.appendChild(chip);
            });
            FX.kabbalahMolecule(window.innerWidth/2, window.innerHeight - 100, '#0f0');
        }
        if(key === 'smartSuggestions') {
            const area = ui.getHtml('smartChips');
            area.innerHTML = '';
            area.classList.remove('hidden');
            val.forEach(txt => {
                const c = document.createElement('button');
                c.className = 'smart-chip';
                c.innerText = txt;
                c.onclick = () => {
                    const v = ui.getHtml('compVisual');
                    v.innerText = txt; 
                    area.classList.add('hidden');
                    sendMsg(ui);
                };
                area.appendChild(c);
            });
        }
    });

    ui.html({
        parent,
        tag: 'div',
        classList: ['composer-area'],
        children: [
            // Smart Chips
            { tag: 'div', shaym: 'smartChips', classList: ['smart-suggestions', 'hidden'] },
            
            // Holographic Reply Bar
            {
                tag: 'div', shaym: 'replyBar', classList: ['reply-preview', 'hidden'],
                children: [
                    { tag: 'div', classList: ['holo-scanline'] },
                    { tag: 'div', classList: ['reply-content'], children: [
                        { tag: 'span', shaym: 'replyText', classList: ['reply-text'] },
                        { tag: 'div', classList: ['reply-actions'], children: [
                             { tag: 'button', classList: ['close-reply'], textContent: '✕', events: {
                                click: () => closeReply(ui)
                            }}
                        ]}
                    ]}
                ]
            },
            // Mode Tabs
            {
                tag: 'div', classList: ['composer-tabs'],
                children: [
                    { tag: 'button', classList: ['mode-tab', 'active'], textContent: 'Visual', events: { click: (e) => switchMode(e, 'visual', ui) } },
                    { tag: 'button', classList: ['mode-tab'], textContent: 'Markdown', events: { click: (e) => switchMode(e, 'markdown', ui) } },
                    { tag: 'button', classList: ['mode-tab'], textContent: 'HTML', events: { click: (e) => switchMode(e, 'html', ui) } }
                ]
            },
            // Composer Box Container
            {
                tag: 'div',
                shaym: 'composerBox',
                classList: ['composer-box'],
                children: [
                    // Attachment Area
                    { tag: 'div', shaym: 'attachArea', classList: ['attachments-list', 'hidden'] },

                    // Subject Line
                    {
                        tag: 'input',
                        shaym: 'compSubject',
                        classList: ['subject-input'],
                        placeholder: 'Subject Protocol...',
                        events: { input: () => FX.playSound('type') }
                    },
                    // Toolbar
                    {
                        tag: 'div', shaym: 'visualToolbar', classList: ['visual-toolbar'],
                        children: [
                            { tag: 'button', textContent: 'B', events: { click: () => document.execCommand('bold') } },
                            { tag: 'button', textContent: 'I', events: { click: () => document.execCommand('italic') } },
                            { tag: 'button', textContent: 'H1', events: { click: () => document.execCommand('formatBlock', false, '<h1>') } },
                            { tag: 'button', textContent: '•', events: { click: () => document.execCommand('insertUnorderedList') } }
                        ]
                    },
                    // Editors
                    {
                        tag: 'div', classList: ['editor-container'],
                        children: [
                            {
                                tag: 'div', shaym: 'compVisual', classList: ['message-input', 'visual-editor'],
                                contentEditable: true,
                                events: {
                                    input: (e) => handleInput(e, ui),
                                    keydown: (e) => handleKey(e, ui)
                                }
                            },
                            {
                                tag: 'textarea', shaym: 'compSource', classList: ['message-input', 'source-editor', 'hidden'],
                                events: {
                                    input: (e) => handleInput(e, ui),
                                    keydown: (e) => handleKey(e, ui)
                                }
                            },
                            {
                                tag: 'button', classList: ['send-btn', 'ready'], textContent: '➤',
                                events: { click: () => sendMsg(ui) }
                            }
                        ]
                    }
                ]
            }
        ]
    });
}

function closeReply(ui) {
    const bar = ui.getHtml('replyBar');
    bar.classList.remove('visible');
    setTimeout(() => bar.classList.add('hidden'), 300);
    state.replyingTo = null;
    FX.clearTether();
}

let currentMode = 'visual';

function switchMode(e, mode, ui) {
    if(currentMode === mode) return;
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');

    const visual = ui.getHtml('compVisual');
    const source = ui.getHtml('compSource');
    const toolbar = ui.getHtml('visualToolbar');

    FX.playSound('hover');

    let content = '';
    if (currentMode === 'visual') content = visual.innerHTML; 
    else content = source.value;

    let newContent = content;

    if (mode === 'visual') {
        if (currentMode === 'markdown') newContent = smartParse(content);
        visual.innerHTML = newContent;
        visual.classList.remove('hidden');
        source.classList.add('hidden');
        toolbar.classList.remove('hidden');
        visual.focus();
    } 
    else if (mode === 'markdown') {
        if (currentMode === 'visual' || currentMode === 'html') newContent = htmlToMarkdown(content);
        source.value = newContent;
        source.classList.remove('hidden');
        visual.classList.add('hidden');
        toolbar.classList.add('hidden');
        source.focus();
    }
    else if (mode === 'html') {
        if (currentMode === 'markdown') newContent = smartParse(content);
        else if (currentMode === 'visual') newContent = content;
        source.value = newContent;
        source.classList.remove('hidden');
        visual.classList.add('hidden');
        toolbar.classList.add('hidden');
        source.focus();
    }

    currentMode = mode;
}

function handleInput(e, ui) {
    broadcastTyping(e.target.value || e.target.innerText);
    const rect = e.target.getBoundingClientRect();
    FX.sparks(rect.left + Math.random() * rect.width, rect.bottom - 10);
    if(Math.random() > 0.8) FX.playSound('type');
}

function handleKey(e, ui) {
    if(e.ctrlKey && e.key === 'Enter') sendMsg(ui);
}

async function sendMsg(ui) {
    if(!state.activeThread) return;
    
    const visual = ui.getHtml('compVisual');
    const source = ui.getHtml('compSource');
    const subjectIn = ui.getHtml('compSubject');
    
    let content = '';
    if (currentMode === 'visual') content = htmlToMarkdown(visual.innerHTML);
    else if (currentMode === 'markdown') content = source.value;
    else if (currentMode === 'html') content = htmlToMarkdown(source.value);
    
    if(!content.trim()) return;
    
    FX.playSound('sent');
    const rect = document.querySelector('.send-btn').getBoundingClientRect();
    FX.explode(rect.left + 20, rect.top + 20, '#ffb700'); 

    const chatC = document.querySelector('.messages-scroll');
    if(chatC) {
        chatC.classList.add('warp-speed');
        setTimeout(() => chatC.classList.remove('warp-speed'), 800);
    }

    visual.innerHTML = '';
    source.value = '';
    
    const subject = subjectIn.value || "No Subject";
    subjectIn.value = ''; 
    
    ui.getHtml('smartChips').classList.add('hidden');
    ui.getHtml('attachArea').innerHTML = ''; 
    
    closeReply(ui);
    
    await sendMessageApi(state.activeThread, subject, content);
}
