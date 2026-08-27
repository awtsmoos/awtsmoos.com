// B"H
// FILE: js/vibe/controllers/execution.js

import { State } from '../../state.js';
import { UI } from '../../ui.js';

export const ExecutionController = {
    lastErrorTime: 0,
    lastErrorMsg: '',

    handleRuntimeError(errorObj) {
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        
        // Must be a Vibe tab, and user must not have requested a stop
        if (!activeTab || activeTab.fileType !== 'vibe' || State.isVibeStopRequested) return;
        
        // B"H - Temporal Filtering (5 Second Shield)
        const now = Date.now();
        if (this.lastErrorMsg === errorObj.message && (now - this.lastErrorTime < 5000)) {
            return;
        }
        
        this.lastErrorMsg = errorObj.message;
        this.lastErrorTime = now;
        
        console.log("B\"H - Vibe Runtime Error Intercepted:", errorObj);
        
        // Ensure session state exists
        if (!activeTab.vibeSession.pendingErrors) activeTab.vibeSession.pendingErrors = [];
        
        const errorMsg = `[Runtime Error] ${errorObj.message}\nStack: ${errorObj.stack || 'N/A'}`;
        
        // Queue error if unique
        if (!activeTab.vibeSession.pendingErrors.includes(errorMsg)) {
            activeTab.vibeSession.pendingErrors.push(errorMsg);
            UI.showToast("B\"H: Auto-Healing Sequence Initiated.", "warning");
        }
    }
};