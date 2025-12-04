// B"H
import { sendMessageApi, broadcastTyping } from '../network.js';
import { state } from '../store.js';
import { smartParse } from '../helpers.js';

export function renderComposer(ui, parent) {
    
    const container = ui.html({
        parent,
        tag: 'div',
        classList: ['composer-area'],
        children: [
            // Reply Preview (Hidden by default)
            {
                tag: 'div', shaym: 'replyBar', classList: ['reply-preview', 'hidden'],
                children: [
                    { tag: 'span', textContent: 'Replying...' },
                    { tag: 'button', classList: ['close-reply'], textContent: '×', events: {
                        click: () => ui.getHtml('replyBar').classList.add('hidden')
                    }}
                ]
            },
            // Composer Box
            {
                tag: 'div',
                classList: ['composer-box'],
                children: [
                    // Toolbar
                    {
                        tag: 'div', classList: ['toolbar'],
                        children: [
                            { tag: 'button', classList: ['tool-btn'], textContent: 'B', events: { click: () => insertFormat('**','**') } },
                            { tag: 'button', classList: ['tool-btn'], textContent: 'I', events: { click: () => insertFormat('*','*') } },
                            { tag: 'button', classList: ['tool-btn'], textContent: '</>', events: { click: () => insertFormat('```','```') } }
                        ]
                    },
                    // Subject
                    {
                        tag: 'input',
                        classList: ['subject-input'],
                        shaym: 'compSubject',
                        placeholder: 'Subject (Optional)...'
                    },
                    // Editor & Send
                    {
                        tag: 'div',
                        classList: ['editor-container'],
                        children: [
                            {
                                tag: 'textarea',
                                shaym: 'compInput',
                                classList: ['message-input'],
                                placeholder: 'Write something...',
                                events: {
                                    input: (e) => broadcastTyping(e.target.value),
                                    keydown: (e) => {
                                        if(e.ctrlKey && e.key === 'Enter') sendMsg(ui);
                                    }
                                }
                            },
                            {
                                tag: 'button',
                                classList: ['send-btn', 'ready'],
                                textContent: '➤',
                                events: { click: () => sendMsg(ui) }
                            }
                        ]
                    }
                ]
            }
        ]
    });
}

function insertFormat(start, end) {
    const el = document.querySelector('.message-input'); // Quick access
    if(!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const val = el.value;
    el.value = val.substring(0,s) + start + val.substring(s,e) + end + val.substring(e);
    el.focus();
}

async function sendMsg(ui) {
    if(!state.activeThread) return;
    const input = ui.getHtml('compInput');
    const sub = ui.getHtml('compSubject');
    
    const content = input.value;
    const subject = sub.value;
    
    if(!content.trim()) return;
    
    input.value = ''; // Optimistic clear
    
    await sendMessageApi(state.activeThread, subject, content);
}