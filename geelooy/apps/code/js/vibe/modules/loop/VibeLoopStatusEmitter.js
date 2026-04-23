
// B"H
import { UI } from '../../../ui.js';

export const VibeLoopStatusEmitter = {
    announceStart(path, index) {
        const taskId = `vibe-apply-${Date.now()}-${index}`;
        UI.startTask(taskId, `Manifesting: ${path}`);
        return taskId;
    },
    announceSuccess(taskId, path) {
        UI.endTask(taskId, 'success', `Solid: ${path}`);
    },
    announceFailure(taskId, path, err) {
        UI.endTask(taskId, 'error', `Shattered: ${path}`);
        console.error(`[Emitter] B"H - Error at ${path}:`, err);
    }
};
