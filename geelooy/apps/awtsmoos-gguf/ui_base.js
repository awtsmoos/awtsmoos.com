// B"H
/**
 * UI Base Module
 * Core DOM manipulation and Logging
 */

export const uiBase = {
    logs: null,
    status: null,
    file: null,
    tabMeta: null,
    tabChat: null,
    viewInspector: null,
    viewChat: null,
    init: function() {
        this.logs = document.getElementById('logs');
        this.status = document.getElementById('statusIndicator');
        this.file = document.getElementById('fileInput');
        this.tabMeta = document.getElementById('tabMeta');
        this.tabChat = document.getElementById('tabChat');
        this.viewInspector = document.getElementById('viewInspector');
        this.viewChat = document.getElementById('viewChat');
    }
};

export function log(msg, type = 'info') {
    if (!uiBase.logs) return;
    const el = document.createElement('div');
    const time = new Date().toLocaleTimeString();
    
    let color = 'text-green-400';
    if (type === 'error') color = 'text-red-500 font-bold';
    if (type === 'warn') color = 'text-yellow-500';
    if (type === 'accent') color = 'text-blue-300 font-bold';
    
    el.className = `break-all ${color}`;
    el.innerText = `[${time}] ${msg}`;
    uiBase.logs.appendChild(el);
    uiBase.logs.scrollTop = uiBase.logs.scrollHeight;
}

export function setStatus(msg, active = false) {
    if (!uiBase.status) return;
    uiBase.status.innerText = msg;
    uiBase.status.className = active 
        ? "text-xs font-mono px-2 py-1 rounded bg-blue-900 text-blue-200 animate-pulse" 
        : "text-xs font-mono px-2 py-1 rounded bg-gray-800 text-gray-400";
}

export function switchTab(tab) {
    if (!uiBase.viewInspector || !uiBase.viewChat || !uiBase.tabMeta || !uiBase.tabChat) return;
    
    const isMeta = tab === 'meta';
    
    uiBase.viewInspector.classList.toggle('hidden', !isMeta);
    uiBase.viewChat.classList.toggle('hidden', isMeta);

    uiBase.tabMeta.classList.toggle('active', isMeta);
    uiBase.tabChat.classList.toggle('active', !isMeta);
}

export function enableChatTab(enabled) {
    if (!uiBase.tabChat) return;
    uiBase.tabChat.disabled = !enabled;
    if (!enabled && !uiBase.viewChat.classList.contains('hidden')) {
        switchTab('meta');
    }
}