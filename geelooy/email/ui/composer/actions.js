
// B"H
import { sendMessageApi } from '../../network.js';
import { FX } from '../fx.js';
import { chatState } from '../chat/state.js';
import { notify } from '../../store.js';
import { composerState } from './state.js';

// --- BROADCASTING (GHOST TYPING) ---
export function handleInput(e) {
    const el = e.target;
    // Auto-Resize
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight) + 'px';

    const now = Date.now();
    const STREAM_RATE = 150; // Throttle ms

    // Throttle the LIVE_PREVIEW signal
    if (now - composerState.lastStreamTime > STREAM_RATE) {
        composerState.lastStreamTime = now;
        
        // IMPORTANT: Matches `awtsmoosSocket.js` expected payload:
        // { type: 'LIVE_PREVIEW', to: <alias>, content: <string> }
        // We use `notify` to bridge to the network layer which sends the socket frame.
        if (chatState.activeThreadId) {
            notify('broadcast', { 
                type: 'LIVE_PREVIEW', 
                to: chatState.activeThreadId, 
                content: el.value 
            });
        }
    }
}

// --- SENDING ---
export async function handleSend(ui) {
    const input = ui.getHtml('chatInput');
    const txt = input.value.trim();
    if (!txt || !chatState.activeThreadId) return;

    if (FX.playSound) FX.playSound('sent');
    
    // Clear Input
    input.value = '';
    input.style.height = 'auto';
    input.focus();
    
    // Clear Ghost Text on Recipient Screen
    notify('broadcast', { 
        type: 'LIVE_PREVIEW', 
        to: chatState.activeThreadId, 
        content: '' 
    });

    try {
        await sendMessageApi(chatState.activeThreadId, null, txt);
        if (FX.explode) FX.explode(window.innerWidth / 2, window.innerHeight - 50);
    } catch (err) {
        console.error("Transmission failed", err);
        input.value = txt; // Restore draft
        notify('error', 'Transmission Failed');
    }
}

// --- MAGNETIC PHYSICS ---
export function handleMagneticMove(e) {
    const btn = e.target;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    // Slight pull effect
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
}

export function handleMagneticLeave(e) {
    e.target.style.transform = 'translate(0,0)';
}
