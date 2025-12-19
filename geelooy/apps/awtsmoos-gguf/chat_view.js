// B"H
/**
 * Chat UI Module
 * Handles DOM interactions and state
 */
import { ui } from './ui.js';
import { appendUserMessage, appendSystemMessage, scrollToBottom, startStreamMessage as renderStartStream, streamToken as renderStreamToken, endStreamMessage as renderEndStream } from './chat_render.js';

export const chatUI = {
    history: null,
    input: null,
    sendBtn: null,
    engineLog: null,
    btnCopy: null,
    btnClear: null,
    btnReset: null,
    
    // Status
    chatOnlineIndicator: null,
    chatStatusText: null,
    
    // Settings
    btnToggleSettings: null,
    settingsPanel: null,
    rngTemp: null,
    valTemp: null,
    rngTopP: null,
    valTopP: null,
    rngPenalty: null,
    valPenalty: null,
    rngMaxTok: null,
    valMaxTok: null,
    
    // Actions
    btnExport: null,
    btnImport: null,
    btnCopyChat: null,
    importInput: null,
    
    // Log
    logSearch: null,
    
    // Console
    btnToggleConsole: null,
    consolePanel: null,
    btnCloseConsole: null,
    
    isGenerating: false
};

export function initChatUI() {
    chatUI.history = document.getElementById('chatHistory');
    chatUI.input = document.getElementById('chatInput');
    chatUI.sendBtn = document.getElementById('btnSend');
    chatUI.engineLog = document.getElementById('engineLog');
    
    chatUI.btnCopy = document.getElementById('btnCopyLog');
    chatUI.btnClear = document.getElementById('btnClearLog');
    chatUI.btnReset = document.getElementById('btnResetSession');
    
    chatUI.chatOnlineIndicator = document.getElementById('chatOnlineIndicator');
    chatUI.chatStatusText = document.getElementById('chatStatusText');

    chatUI.btnToggleSettings = document.getElementById('btnToggleSettings');
    chatUI.settingsPanel = document.getElementById('settingsPanel');
    
    chatUI.rngTemp = document.getElementById('rngTemp');
    chatUI.valTemp = document.getElementById('valTemp');
    chatUI.rngTopP = document.getElementById('rngTopP');
    chatUI.valTopP = document.getElementById('valTopP');
    chatUI.rngPenalty = document.getElementById('rngPenalty');
    chatUI.valPenalty = document.getElementById('valPenalty');
    chatUI.rngMaxTok = document.getElementById('rngMaxTok');
    chatUI.valMaxTok = document.getElementById('valMaxTok');

    chatUI.btnExport = document.getElementById('btnExportChat');
    chatUI.btnImport = document.getElementById('btnImportChat');
    chatUI.btnCopyChat = document.getElementById('btnCopyChat');
    chatUI.importInput = document.getElementById('importChatInput');
    
    chatUI.logSearch = document.getElementById('logSearch');
    
    // Console
    chatUI.btnToggleConsole = document.getElementById('btnToggleConsole');
    chatUI.consolePanel = document.getElementById('consolePanel');
    chatUI.btnCloseConsole = document.getElementById('btnCloseConsole');

    // Default Prompt
    if (chatUI.input) {
        chatUI.input.value = "B\"H\nExplain the concept of Divine Providence in code (Judaism, Chabad).";
        chatUI.input.placeholder = "B\"H... Type your deepest thoughts here. (Ctrl+Enter to send)";
    }

    // Log Logic
    if (chatUI.btnCopy) chatUI.btnCopy.onclick = () => {
        if (chatUI.engineLog) navigator.clipboard.writeText(chatUI.engineLog.innerText);
    };

    if (chatUI.btnClear) chatUI.btnClear.onclick = () => {
        if (chatUI.engineLog) chatUI.engineLog.innerHTML = '';
    };
    
    if (chatUI.logSearch) {
        chatUI.logSearch.oninput = (e) => {
            const term = e.target.value.toLowerCase();
            const lines = chatUI.engineLog.querySelectorAll('.log-entry');
            lines.forEach(line => {
                line.style.display = line.innerText.toLowerCase().includes(term) ? 'flex' : 'none';
            });
        };
    }

    if (chatUI.btnToggleSettings && chatUI.settingsPanel) {
        chatUI.btnToggleSettings.onclick = () => {
            chatUI.settingsPanel.classList.toggle('hidden');
        };
    }
    
    // Console Toggle Logic
    const toggleConsole = () => {
        if (!chatUI.consolePanel) return;
        chatUI.consolePanel.classList.toggle('collapsed');
    };

    if (chatUI.btnToggleConsole) chatUI.btnToggleConsole.onclick = toggleConsole;
    if (chatUI.btnCloseConsole) chatUI.btnCloseConsole.onclick = toggleConsole;
    
    const bindSlider = (rng, val) => {
        if(rng && val) rng.addEventListener('input', (e) => val.innerText = e.target.value);
    };
    bindSlider(chatUI.rngTemp, chatUI.valTemp);
    bindSlider(chatUI.rngTopP, chatUI.valTopP);
    bindSlider(chatUI.rngPenalty, chatUI.valPenalty);
    bindSlider(chatUI.rngMaxTok, chatUI.valMaxTok);
}

export function getGenerationParams() {
    return {
        temp: parseFloat(chatUI.rngTemp?.value || 0.8),
        top_p: parseFloat(chatUI.rngTopP?.value || 0.9),
        penalty: parseFloat(chatUI.rngPenalty?.value || 1.1),
        max_tokens: parseInt(chatUI.rngMaxTok?.value || 512)
    };
}

export function updateProgress(percent, msg) {
    const bar = document.getElementById('progressBar');
    const txt = document.getElementById('progressText');
    const container = document.getElementById('loadProgress');
    
    if (container) {
        if (percent >= 100) {
             setTimeout(() => container.classList.add('hidden'), 2000);
        } else {
             container.classList.remove('hidden');
        }
    }
    if (bar) bar.style.width = `${percent}%`;
    if (txt) txt.innerText = msg;
}

export function setGeneratingState(generating) {
    chatUI.isGenerating = generating;
    if (chatUI.sendBtn) {
        if (generating) {
            chatUI.sendBtn.innerHTML = '&#9632;'; // Stop icon
            chatUI.sendBtn.classList.add('active'); 
        } else {
            chatUI.sendBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 1rem; height: 1rem;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"></path>
                </svg>
            `;
            chatUI.sendBtn.classList.remove('active');
        }
    }
}

export function onChatReady() {
    if (chatUI.chatOnlineIndicator) {
        chatUI.chatOnlineIndicator.style.background = 'var(--accent-emerald)';
        chatUI.chatOnlineIndicator.style.boxShadow = '0 0 10px var(--accent-emerald)';
    }
    if (chatUI.chatStatusText) {
        chatUI.chatStatusText.innerText = "ONLINE";
        chatUI.chatStatusText.style.color = 'var(--accent-emerald)';
    }

    if(chatUI.history && chatUI.history.children.length === 0) {
         chatUI.history.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; opacity:0.3; margin-top:50px;">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:48px; height:48px; margin-bottom:10px;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                <div style="font-family:var(--font-mono); font-size:12px; letter-spacing:2px;">ENGINE READY</div>
            </div>
         `;
    }
}

function escapeHtml(text) {
    if (!text) return text;
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function logEngine(msg, type = 'info') {
    if (!chatUI.engineLog) return;
    const div = document.createElement('div');
    const time = new Date().toLocaleTimeString().split(' ')[0];
    
    div.className = `log-entry log-${type}`;
    div.innerHTML = `<span class="log-time">[${time}]</span><span class="log-msg">${escapeHtml(msg)}</span>`;
    
    chatUI.engineLog.appendChild(div);
    chatUI.engineLog.scrollTop = chatUI.engineLog.scrollHeight;
}

export function setTensorCount(count) {}

// Re-export Render Functions
export { appendUserMessage, appendSystemMessage, renderStartStream as startStreamMessage, renderStreamToken as streamToken, renderEndStream as endStreamMessage };