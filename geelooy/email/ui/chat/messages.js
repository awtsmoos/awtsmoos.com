
// B"H
import { chatState, getUiRef } from './state.js';
import { attachSwipePhysics, handleRightClick, triggerReply, resetScrollPhysics } from './physics.js';
import { smartParse } from '../../helpers.js';
import { FX } from '../fx.js';
import { renderContextMenu } from '../modals.js';

function decryptText(element, finalString) {
    if(!element) return;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
    let iterations = 0;
    const originalHTML = element.innerHTML;
    const plainText = element.innerText; 
    
    // Ensure we start with the class
    element.classList.add('loading-text');

    const interval = setInterval(() => {
        element.innerText = plainText
            .split("")
            .map((letter, index) => {
                if(index < iterations) return plainText[index]; 
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");
        
        if(iterations >= plainText.length) { 
            clearInterval(interval);
            element.innerHTML = originalHTML;
            element.classList.remove('loading-text'); 
        }
        iterations += 1; 
    }, 20);
    
    setTimeout(() => { 
        clearInterval(interval); 
        element.innerHTML = originalHTML; 
        element.classList.remove('loading-text'); 
    }, 2000);
}

function getSentimentClass(text) {
    if (!text) return '';
    const t = text.toLowerCase();
    if (t.includes('!')) return 'sentiment-excited';
    if (t.includes('?')) return 'sentiment-curious';
    if (t.match(/error|fail|warn|alert|critical/i)) return 'sentiment-danger';
    if (t.match(/love|great|thanks|good|confirmed/i)) return 'sentiment-positive';
    return 'sentiment-neutral';
}

export function renderMessages(threadId, msgs) {
    const ui = getUiRef();
    if (!ui || chatState.activeThreadId !== threadId) return;
    
    const container = ui.getHtml('msgContainer');
    const wormhole = container.querySelector('.wormhole-loader');
    
    const wasNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;

    container.innerHTML = '';
    if(wormhole) container.appendChild(wormhole);
    
    msgs.forEach((m, index) => {
        const isMe = m.direction === 'outgoing';
        const isNew = index === msgs.length - 1; 

        const parsedContent = smartParse(m.content);
        const hasTags = /<[a-z][\s\S]*>/i.test(parsedContent); 
        const shouldDecrypt = isNew && !hasTags && m.content.length < 300;
        const sentiment = getSentimentClass(m.content);

        const row = ui.html({
            parent: container,
            tag: 'div',
            classList: ['msg-row', isMe ? 'me' : 'them', isNew ? 'message-entry' : null].filter(Boolean),
            dataset: { id: m.id },
            ready: (el) => {
                attachSwipePhysics(el, m);
                if(isNew) setTimeout(() => el.classList.remove('message-entry'), 500);
            },
            events: {
                contextmenu: (e) => handleRightClick(e, m, row),
                dblclick: (e) => { if(FX.explode) FX.explode(e.clientX, e.clientY, '#ef4444'); }
            },
            children: [
                {
                    tag: 'div', classList: ['swipe-wrapper'],
                    children: [
                        { tag: 'div', classList: ['swipe-icon'], textContent: 'REPLY' },
                        {
                            tag: 'div',
                            classList: ['msg-bubble', 'message-card', sentiment].filter(Boolean), 
                            children: [
                                m.subject ? { tag: 'div', classList: ['msg-subject'], textContent: m.subject } : null,
                                { 
                                    tag: 'div', 
                                    classList: ['msg-content', shouldDecrypt ? 'loading-text' : ''].filter(Boolean), 
                                    innerHTML: parsedContent 
                                },
                                { 
                                    tag: 'div', classList: ['msg-footer'],
                                    children: [
                                        { tag: 'span', classList: ['msg-time'], dataset: { ts: m.timeSent }, textContent: 'Just now' },
                                        {
                                            tag: 'div', classList: ['msg-actions'],
                                            children: [
                                                // REPLY BUTTON
                                                { 
                                                    tag: 'button', classList: ['action-btn'], title: 'Reply', innerHTML: '↩',
                                                    events: { 
                                                        click: (e) => { 
                                                            e.stopPropagation(); 
                                                            triggerReply(m, isMe); 
                                                        },
                                                        pointerdown: (e) => e.stopPropagation()
                                                    }
                                                },
                                                // MENU BUTTON
                                                { 
                                                    tag: 'button', classList: ['action-btn'], title: 'Menu', innerHTML: '⋮',
                                                    events: { 
                                                        click: (e) => { 
                                                            e.stopPropagation(); 
                                                            const rect = e.target.getBoundingClientRect();
                                                            renderContextMenu(ui, rect.left, rect.bottom + 5, m, row);
                                                        },
                                                        pointerdown: (e) => e.stopPropagation()
                                                    }
                                                },
                                                // TTS BUTTON
                                                { 
                                                    tag: 'button', classList: ['action-btn', 'tts-btn'], title: 'Speak', innerHTML: '🔊', 
                                                    events: { 
                                                        click: (e) => { 
                                                            e.stopPropagation(); 
                                                            if(FX.playTTS) FX.playTTS(m.content); 
                                                        },
                                                        pointerdown: (e) => e.stopPropagation()
                                                    }
                                                }
                                            ]
                                        }
                                    ] 
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        const blocks = row.querySelectorAll('pre');
        blocks.forEach(blk => {
            const btn = document.createElement('button');
            btn.className = 'code-copy-btn';
            btn.innerHTML = '⚡ COPY';
            btn.onclick = (e) => {
                e.stopPropagation();
                const code = blk.querySelector('code').innerText;
                navigator.clipboard.writeText(code);
                const laser = document.createElement('div');
                laser.className = 'laser-scan';
                blk.appendChild(laser);
                setTimeout(() => laser.remove(), 1000);
                btn.innerText = 'COPIED';
                setTimeout(() => btn.innerText = '⚡ COPY', 2000);
            };
            blk.appendChild(btn);
        });

        if (shouldDecrypt) decryptText(row.querySelector('.msg-content'), m.content);
    });
    
    if (wasNearBottom || msgs.length === 0 || msgs[msgs.length-1].direction === 'outgoing') {
        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
            resetScrollPhysics(container); // Reset to prevent glitching
            
            // Double assurance
            requestAnimationFrame(() => {
                container.scrollTop = container.scrollHeight;
                resetScrollPhysics(container);
            });
        });
    }
    
    updateTimeline(msgs);
}

function updateTimeline(msgs) {
    const ui = getUiRef();
    if(!ui) return;
    const scrubber = ui.getHtml('timeScrubber');
    if(!scrubber) return;
    scrubber.innerHTML = '';
    if(msgs.length === 0) return;

    const startTime = msgs[0].timeSent;
    const endTime = msgs[msgs.length-1].timeSent;
    const duration = endTime - startTime;
    if(duration <= 0) return;

    msgs.forEach(m => {
        const perc = ((m.timeSent - startTime) / duration) * 100;
        const dot = document.createElement('div');
        dot.className = 'time-dot';
        dot.style.top = `${perc}%`;
        dot.style.background = m.direction === 'outgoing' ? 'var(--mail-accent)' : 'var(--mail-line-strong)';
        scrubber.appendChild(dot);
    });
}

export function renderGhostBubble(content) {
    const ui = getUiRef();
    if(!ui) return;
    const container = ui.getHtml('msgContainer');
    if(!container) return;

    let ghost = document.getElementById('ghostBubble');
    if (!content) {
        if(ghost) ghost.remove();
        return;
    }

    const parsed = smartParse(content);

    if (!ghost) {
        ghost = document.createElement('div');
        ghost.id = 'ghostBubble';
        ghost.className = 'msg-row them ghost-row';
        ghost.innerHTML = `<div class="msg-bubble ghost-bubble"><div class="msg-content decrypting"></div></div>`;
        container.appendChild(ghost);
        container.scrollTop = container.scrollHeight;
    }
    
    const contentEl = ghost.querySelector('.msg-content');
    if(contentEl) contentEl.innerHTML = parsed;
    container.scrollTop = container.scrollHeight;
}

export function updateRelativeTimes() {
    document.querySelectorAll('.msg-time').forEach(el => {
        const ts = parseInt(el.dataset.ts);
        if(!ts) return;
        const diff = Math.floor((Date.now() - ts) / 1000);
        if (diff < 60) el.textContent = `${diff}s ago`;
        else if (diff < 3600) el.textContent = `${Math.floor(diff/60)}m ago`;
        else {
            const date = new Date(ts);
            el.textContent = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
    });
}
