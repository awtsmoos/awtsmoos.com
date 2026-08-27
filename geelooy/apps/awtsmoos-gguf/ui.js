// B"H
/**
 * UI Aggregator Module
 * Combines Base, Inspector, and Markdown sub-modules
 */

import { uiBase, log, setStatus, switchTab, enableChatTab } from './ui_base.js';
import { 
    uiInspector, 
    resetMetadata, 
    addMetaEntry, 
    populateModelConfig, 
    populateTensorList, 
    visualizeRoPE,
    setTokenizerState,
    setTokenOutput,
    showPurifyUI,
    logPurify
} from './ui_inspector.js';
import { initMarkdown, openInfoModal, closeInfoModal } from './ui_markdown.js';

export const ui = {
    // expose specific elements needed by chat_view.js and others
    get logs() { return uiBase.logs; },
    get file() { return uiBase.file; },
    get btnSearch() { return uiInspector.btnSearch; },
    get btnLookup() { return uiInspector.btnLookup; },
    get termInput() { return uiInspector.termInput; },
    get idInput() { return uiInspector.idInput; },
    // Exposed for Inspector
    get btnShowMeta() { return uiInspector.btnShowMeta; },
    get btnShowTensors() { return uiInspector.btnShowTensors; },
    get btnShowVocab() { return uiInspector.btnShowVocab; }
};

export function initUI() {
    uiBase.init();
    uiInspector.init();
    initMarkdown('infoModal', 'infoContent');

    // Wire up Tabs (Main View)
    if (uiBase.tabMeta && uiBase.tabChat) {
        uiBase.tabMeta.onclick = () => switchTab('meta');
        uiBase.tabChat.onclick = () => switchTab('chat');
    }

    // Wire up Info Modal
    const btnInfo = document.getElementById('btnInfo');
    const btnCloseInfo = document.getElementById('btnCloseInfo');
    if (btnInfo) btnInfo.onclick = openInfoModal;
    if (btnCloseInfo) btnCloseInfo.onclick = closeInfoModal;

    return !!(uiBase.logs && uiBase.file);
}

// Re-export functions for app.js and other consumers
export { 
    log, 
    setStatus, 
    resetMetadata, 
    addMetaEntry, 
    populateModelConfig, 
    populateTensorList, 
    visualizeRoPE, 
    setTokenizerState, 
    setTokenOutput, 
    enableChatTab, 
    switchTab,
    showPurifyUI,
    logPurify
};