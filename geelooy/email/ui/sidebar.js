// B"H
import { state } from '../store.js';
import { refreshSnippets } from '../network.js';
import { formatTime } from '../helpers.js';
import { FX } from './fx.js';

let _uiRef = null;

export function renderSidebar(ui, parent) {
    _uiRef = ui;
    
    // Header
    ui.html({
        parent,
        tag: 'div',
        classList: ['sidebar-header'],
        children: [
            { tag: 'div', classList: ['brand-title'], textContent: 'Awtsmoos Mail' },
            { 
                tag: 'div', classList: ['user-badge'], 
                children: [
                    { tag: 'span', classList: ['status-dot'] },
                    { tag: 'span', textContent: 'SECURE' } 
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
            { tag: 'button', classList: ['nav-tab', 'active'], textContent: 'Inbox', events: { click: () => setView('inbox') } },
            { tag: 'button', classList: ['nav-tab'], textContent: 'Sent', events: { click: () => setView('requests') } }
        ]
    });

    // Thread List Container
    ui.html({ parent, tag: 'div', shaym: 'threadList', classList: ['thread-list'] });

    // Initialize Main Chat View (Flex Child)
    let app = ui.getHtml('appContainer');
    let mainView = ui.getHtml('mainChatView');
    if (app && !mainView) {
        ui.html({
            parent: app,
            tag: 'div',
            shaym: 'mainChatView',
            classList: ['chat-view'],
            children: [
                { 
                    tag: 'div', 
                    style: 'height:100%; display:flex; align-items:center; justify-content:center; color:var(--text-muted); flex-direction:column;',
                    children: [
                        { tag: 'div', style:'font-size:3rem; margin-bottom:20px; opacity:0.2;', textContent: '▲' },
                        { tag: 'div', textContent: 'Select a transmission frequency' }
                    ]
                }
            ]
        });
    }
}

function setView(view) {
    state.view = view;
    renderThreadList();
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

    const threads = state.snippets ? state.snippets.filter(t => state.view === 'requests' ? false : true) : [];

    if (threads.length === 0) {
        _uiRef.html({ parent: list, tag: 'div', style: 'padding:20px; text-align:center; color:#555;', textContent: 'Void.' });
        return;
    }

    threads.forEach(t => {
        const name = t.correspondent ? t.correspondent.replace(/_at_/g, '@') : "Unknown";
        const bg = getQuantumColor(name);
        const isActive = state.activeThread === t.correspondent;
        
        _uiRef.html({
            parent: list,
            tag: 'div',
            classList: ['thread-item', isActive ? 'active' : null].filter(Boolean),
            events: {
                click: () => { 
                    if(FX.playSound) FX.playSound('hover'); 
                    switchChat(_uiRef, t.correspondent, name);
                }
            },
            children: [
                { tag: 'div', classList: ['avatar-circle'], style: `background: ${bg}`, textContent: name[0].toUpperCase() },
                {
                    tag: 'div', classList: ['thread-content'],
                    children: [
                        {
                            tag: 'div', classList: ['thread-top'],
                            children: [{tag:'span', classList:['thread-name'], textContent:name}, {tag:'span', classList:['thread-time'], textContent:formatTime(t.timeSent)}]
                        },
                        { tag: 'div', classList: ['thread-snippet'], textContent: (t.snippet || "...").substring(0, 40) }
                    ]
                }
            ]
        });
    });
}

function switchChat(ui, correspondent, displayName) {
    state.activeThread = correspondent;
    renderThreadList();
    
    const view = ui.getHtml('mainChatView');
    view.innerHTML = '';
    
    // Chat Header
    const bg = getQuantumColor(displayName);
    ui.html({
        parent: view,
        tag: 'div',
        classList: ['chat-header'],
        children: [
            { 
                tag: 'div', style: 'display:flex; align-items:center; gap:12px;',
                children: [
                    { tag: 'div', classList: ['avatar-circle'], style: `background: ${bg}; width:36px; height:36px;`, textContent: displayName[0].toUpperCase() },
                    { 
                        tag: 'div', 
                        children: [
                            { tag: 'div', classList: ['brand-title'], style:'font-size:0.9rem; letter-spacing:1px;', textContent: displayName },
                            { tag: 'div', style:'font-size:0.7rem; color:var(--text-secondary);', textContent: 'Encrypted Connection' }
                        ]
                    }
                ]
            },
            { tag: 'div', classList: ['status-dot'], style: 'background:var(--neon-gold); box-shadow:0 0 10px var(--neon-gold);' }
        ]
    });

    // Messages Area
    const msgArea = ui.html({
        parent: view,
        tag: 'div',
        classList: ['messages-scroll-area'],
        shaym: 'messageList'
    });

    const messages = state.messages && state.messages[correspondent] ? state.messages[correspondent] : [];
    
    if (messages.length === 0) {
        ui.html({ parent: msgArea, tag: 'div', style:'text-align:center; color:#444; margin-top:50px;', textContent: '--- START OF TRANSMISSION ---' });
    } else {
        renderMessageList(ui, msgArea, messages, displayName);
    }
    
    requestAnimationFrame(() => msgArea.scrollTop = msgArea.scrollHeight);

    // Composer
    const composer = ui.html({
        parent: view,
        tag: 'div',
        classList: ['chat-composer'],
        children: [
            { 
                tag: 'textarea', 
                classList: ['composer-input'], 
                props: { placeholder: 'Write a message...', rows: 1 },
                events: {
                    keydown: (e) => {
                        if(e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            const val = e.target.value.trim();
                            if(val) {
                                const msgObj = { from: 'me', body: val, time: Date.now(), type: 'sent' };
                                if(!state.messages[correspondent]) state.messages[correspondent] = [];
                                state.messages[correspondent].push(msgObj);
                                
                                renderMessage(ui, msgArea, msgObj, messages.length > 0 ? messages[messages.length-1] : null, displayName);
                                
                                e.target.value = '';
                                msgArea.scrollTop = msgArea.scrollHeight;
                                if(FX.playSound) FX.playSound('sent');
                                
                                // Network call would go here
                            }
                        }
                    }
                }
            },
            { 
                tag: 'button', classList: ['btn-primary'], style: 'width:auto; padding: 0 20px; height: 46px;', textContent: 'SEND',
                events: { click: () => { /* Logic */ } }
            }
        ]
    });
}

function renderMessageList(ui, parent, messages, chatName) {
    let lastDate = null;
    let prevMsg = null;

    messages.forEach((msg) => {
        const date = new Date(msg.time || Date.now()).toLocaleDateString();
        if (date !== lastDate) {
            ui.html({
                parent, tag: 'div', classList: ['date-divider'],
                children: [{ tag: 'span', textContent: date }]
            });
            lastDate = date;
        }
        renderMessage(ui, parent, msg, prevMsg, chatName);
        prevMsg = msg;
    });
}

function renderMessage(ui, parent, msg, prevMsg, chatName) {
    const isMe = msg.from === 'me' || msg.type === 'sent';
    const isPrevSame = prevMsg && (prevMsg.from === 'me' ? isMe : !isMe); 
    
    let groupClass = 'group-start';
    if (isPrevSame && Math.abs(msg.time - prevMsg.time) < 300000) groupClass = 'group-middle';

    const row = ui.html({
        parent,
        tag: 'div',
        classList: ['message-row', isMe ? 'sent' : 'received', groupClass]
    });

    // Avatar
    if (!isMe) {
        if (groupClass === 'group-start') {
            const bg = getQuantumColor(chatName);
            ui.html({
                parent: row,
                tag: 'div',
                classList: ['avatar-circle'],
                style: `background:${bg}`,
                textContent: chatName[0]
            });
        } else {
             ui.html({ parent: row, tag: 'div', classList:['avatar-placeholder'] });
        }
    }

    // Bubble
    const bubble = ui.html({
        parent: row,
        tag: 'div',
        classList: ['message-bubble']
    });

    // Content
    const contentEl = ui.html({
        parent: bubble,
        tag: 'div',
        classList: ['message-content']
    });
    
    // DIRECT HTML INJECTION
    contentEl.innerHTML = robustParse(msg.body);

    // Time
    ui.html({
        parent: bubble,
        tag: 'div',
        style: 'font-size:0.65rem; color:rgba(255,255,255,0.2); margin-top:4px; text-align:right;',
        textContent: formatTime(msg.time || Date.now())
    });
}

function robustParse(text) {
    if (!text) return '';
    let decoded = text
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&');

    // Formatting
    decoded = decoded.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    decoded = decoded.replace(/\*(.*?)\*/g, '<i>$1</i>');
    decoded = decoded.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    decoded = decoded.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Auto-Link with Inline Styles to FORCE Cyan Color (No Blue)
    decoded = decoded.replace(
        /(?<!=")(https?:\/\/[^\s<]+)/g, 
        '<a href="$1" target="_blank" style="color:#06b6d4;text-decoration:none;border-bottom:1px dotted #06b6d4;">$1</a>'
    );
    
    // Newlines (preserve inside pre)
    let parts = decoded.split(/(<pre[\s\S]*?<\/pre>)/g);
    decoded = parts.map(p => {
        if(p.startsWith('<pre')) return p;
        return p.replace(/\n/g, '<br>');
    }).join('');

    return decoded;
}