/* B"H */
import { AppState } from './state.js';
import { setStatus } from './ui.js';
import { handleWorkerMessage } from './actions.js';

export function initWorker() {
    if (AppState.worker) AppState.worker.terminate();
    
    try {
        AppState.worker = new Worker('ein_sof_worker.js');
        AppState.worker.onmessage = handleWorkerMessage;
        AppState.worker.onerror = (e) => {
            console.error("Worker Crash", e);
            setStatus(`Engine Failure: ${e.message}`, 'error');
            AppState.status = 'IDLE';
        };
    } catch (e) {
        setStatus("FATAL: Worker Init Failed", 'error');
    }
}

export function sendMessage(type, payload, transfer = []) {
    if (!AppState.worker) {
        console.error("Worker dead, reviving...");
        initWorker();
    }
    // Small delay to ensure init
    setTimeout(() => {
        if(AppState.worker) AppState.worker.postMessage({ type, payload }, transfer);
        else setStatus("System Error: Worker Unreachable", 'error');
    }, 10);
}