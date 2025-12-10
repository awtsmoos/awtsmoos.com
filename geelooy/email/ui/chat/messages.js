
// B"H
import { chatState, getUiRef } from './state.js';
import { attachSwipePhysics, handleRightClick } from './physics.js';
import { smartParse } from '../../helpers.js';
import { FX } from '../fx.js';

// QUANTUM DECRYPTION (Local Implementation)
// Decrypts text by cycling random characters before settling
function decryptText(element, finalString) {
    if(!element) return;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
    let iterations = 0;
    
    // We only animate the TEXT content to protect HTML structure
    const originalHTML = element.innerHTML;
    const plainText = element.innerText; 
    
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
            element.innerHTML = originalHTML; // Restore formatted HTML (bold, links)
        }
        iterations += 1; 
    }, 30);
    
    setTimeout(() => { clearInterval(interval); element.innerHTML = originalHTML; }, 2000);
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
    
    // Intelligent Scroll Lock: Only auto-scroll if user is near bottom
    const wasNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;

    // Clear but preserve loader if it exists (though usually we clear all)
    container.innerHTML = '';
    if(wormhole) container.appendChild(wormhole);
    
    msgs.forEach((m, index) => {
        const isMe = m.direction === 'outgoing';
        const isNew = index === msgs.length - 1; 

        const parsedContent = smartParse(m.content);
        
        // Decryption Rules: Only decrypt new messages that don't have complex tags
        // We check raw content for tags to be safe
        const hasTags = /<[a-z][\s\S]*>/i.test(parsedContent); 
        const shouldDecrypt = isNew && !hasTags && m.content.length < 300;

        const sentiment = getSentimentClass(m.content);

        const row = ui.html({
            parent: container,
            tag: 'div',
            // FIXED: Added .filter(Boolean) to prevent empty string tokens in classList
            classList: ['msg-row', isMe ? 'me' : 'them', isNew ? 'glitch-entry' : null].filter(Boolean),
            dataset: { id: m.id },
            ready: (el) => attachSwipePhysics(el, m),
            events: {
                contextmenu: (e) => handleRightClick(e, m, row),
                dblclick: (e) => { if(FX.explode) FX.explode(e.clientX, e.clientY, '#ef4444'); }
            },
            children: [
                {
                    tag: 'div', classList: ['swipe-wrapper'],
                    children: [
                        { tag: 'div', classList: ['swipe-icon'], textContent: isMe ? '↩️' : 'reply' },
                        {
                            tag: 'div',
                            // FIXED: Added .filter(Boolean) here as well
                            classList: ['msg-bubble', 'magnetic', sentiment].filter(Boolean), 
                            children: [
                                m.subject ? { tag: 'div', classList: ['msg-subject'], textContent: m.subject } : null,
                                { 
                                    tag: 'div', 
                                    classList: ['msg-content', shouldDecrypt ? 'decrypting' : ''].filter(Boolean), 
                                    innerHTML: parsedContent // Set content initially
                                },
                                { 
                                    tag: 'div', classList: ['msg-footer'],
                                    children: [
                                        { tag: 'span', classList: ['msg-time'], dataset: { ts: m.timeSent }, textContent: 'Just now' },
                                        { tag: 'button', classList: ['tts-btn'], textContent: '🔊', events: { click: (e) => { e.stopPropagation(); if(FX.playTTS) FX.playTTS(m.content); }}}
                                    ] 
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        // Attach Laser Copy Logic to Code Blocks
        const blocks = row.querySelectorAll('pre');
        blocks.forEach(blk => {
            const btn = document.createElement('button');
            btn.className = 'code-copy-btn';
            btn.innerHTML = '⚡ COPY';
            btn.onclick = (e) => {
                e.stopPropagation();
                const code = blk.querySelector('code').innerText;
                navigator.clipboard.writeText(code);
                
                // Laser Effect
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
    
    // Scroll handling
    if (wasNearBottom || msgs.length === 0) {
        setTimeout(() => container.scrollTop = container.scrollHeight, 10);
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
        dot.style.background = m.direction === 'outgoing' ? 'var(--neon-gold)' : 'var(--neon-cyan)';
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

    if (!ghost) {
        ghost = document.createElement('div');
        ghost.id = 'ghostBubble';
        ghost.className = 'msg-row them ghost-row';
        ghost.innerHTML = `
            <div class="msg-bubble ghost-bubble">
                <div class="msg-content decrypting"></div>
            </div>
        `;
        container.appendChild(ghost);
        container.scrollTop = container.scrollHeight;
    }
    
    const contentEl = ghost.querySelector('.msg-content');
    if(contentEl) contentEl.innerText = content;
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
