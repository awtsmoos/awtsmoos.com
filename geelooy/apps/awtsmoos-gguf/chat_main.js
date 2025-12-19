// B"H
/**
 * Chat Main Entry
 */
import { initChatUI, chatUI, setGeneratingState, getGenerationParams, logEngine } from './chat_view.js';
import { appendUserMessage, appendSystemMessage } from './chat_render.js';

let sendCallback = null;
let stopCallback = null;
let resetCallback = null;

export function setupChat(onSend, onStop, onReset) {
    initChatUI();
    sendCallback = onSend;
    stopCallback = onStop;
    resetCallback = onReset;
    
    if (chatUI.sendBtn) {
        chatUI.sendBtn.addEventListener('click', handleAction);
    }
    
    if (chatUI.btnReset) {
        chatUI.btnReset.addEventListener('click', handleReset);
    }
    
    if (chatUI.input) {
        chatUI.input.addEventListener('keydown', (e) => {
            // B"H - Send on Ctrl+Enter or Cmd+Enter
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleAction();
            }
        });
        
        chatUI.input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            if(this.value === '') this.style.height = 'auto';
        });
    }

    // Export History
    if (chatUI.btnExport) {
        chatUI.btnExport.addEventListener('click', () => {
             const history = [];
             const messages = chatUI.history.children;
             
             for(let msg of messages) {
                 const userB = msg.querySelector('.chat-bubble-user');
                 const modelB = msg.querySelector('.chat-bubble-model');
                 
                 if(userB) {
                     history.push({ role: 'user', text: userB.innerText });
                 } else if(modelB) {
                     let text = modelB.innerText;
                     if(text.endsWith('█') || text.endsWith('|')) text = text.slice(0, -1);
                     history.push({ role: 'model', text: text });
                 }
             }
             
             const blob = new Blob([JSON.stringify(history, null, 2)], {type: 'application/json'});
             const url = URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = url;
             a.download = `bh_chat_history_${Date.now()}.json`;
             a.click();
             logEngine("Chat Saved Successfully.", "accent");
        });
    }

    // Import History
    if (chatUI.btnImport && chatUI.importInput) {
        chatUI.btnImport.addEventListener('click', () => chatUI.importInput.click());
        chatUI.importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if(!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    if(Array.isArray(data)) {
                        chatUI.history.innerHTML = ''; 
                        data.forEach(msg => {
                            if(msg.role === 'user') appendUserMessage(msg.text);
                            else appendSystemMessage(msg.text);
                        });
                        logEngine("History Loaded.", "accent");
                    }
                } catch(err) {
                    logEngine("Failed to load history: " + err.message, "error");
                }
            };
            reader.readAsText(file);
            e.target.value = ''; 
        });
    }
    
    // Copy History
    if (chatUI.btnCopyChat) {
        chatUI.btnCopyChat.addEventListener('click', () => {
             const text = chatUI.history.innerText;
             navigator.clipboard.writeText(text);
             logEngine("Chat copied to clipboard.", "info");
        });
    }
}

function handleReset() {
    if (chatUI.history) chatUI.history.innerHTML = `
        <div class="flex flex-col items-center justify-center py-10 opacity-70 animate-fade-in">
            <div class="text-emerald-400 font-bold tracking-widest text-xs">SESSION RESET</div>
        </div>
    `;
    logEngine("--- SESSION RESET ---", 'warn');
    if (resetCallback) resetCallback();
}

async function handleAction() {
    if (chatUI.isGenerating) {
        if (stopCallback) {
            stopCallback();
            logEngine("--- STOPPING GENERATION ---", 'warn');
        }
        return;
    }

    const text = chatUI.input.value;
    if (!text.trim()) return;
    
    appendUserMessage(text);
    chatUI.input.value = '';
    chatUI.input.style.height = 'auto';
    
    setGeneratingState(true);
    
    const params = getGenerationParams();
    params.prompt = text;
    
    if (sendCallback) {
        try {
            sendCallback(params);
        } catch (e) {
            logEngine(`Error: ${e.message}`, 'error');
            setGeneratingState(false);
        }
    } else {
        logEngine("Error: Chat not connected to engine.", 'error');
        setGeneratingState(false);
    }
}