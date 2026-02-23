// B"H
// FILE: js/ui/notifications.js
import { State, DOM } from '../state.js';

let _taskStack = null;

/**
 * --- UI NOTIFICATIONS ---
 * A robust vessel for non-blocking feedback. 
 * Uses module-level scope to avoid 'this' binding paradoxes. B"H.
 */

function _ensureTaskStack() {
    if (_taskStack) return;
    _taskStack = document.createElement('div');
    _taskStack.className = 'task-notification-stack';
    document.body.appendChild(_taskStack);
}

export const UINotifications = {
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        DOM.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }, 10);
    },

    startTask(taskId, label) {
        _ensureTaskStack();
        const card = document.createElement('div');
        card.className = 'task-card';
        card.innerHTML = `
            <div class="task-info">
                <span class="task-label">${label}</span>
                <span class="task-percent">0%</span>
            </div>
            <div class="task-progress-bg">
                <div class="task-progress-fill" style="width: 0%"></div>
            </div>
        `;
        _taskStack.appendChild(card);
        State.activeTasks.set(taskId, { card, label });
        return taskId;
    },

    updateTask(taskId, progress, message = '') {
        const task = State.activeTasks.get(taskId);
        if (!task) return;
        const fill = task.card.querySelector('.task-progress-fill');
        const percent = task.card.querySelector('.task-percent');
        if (fill) fill.style.width = `${progress}%`;
        if (percent) percent.textContent = `${Math.round(progress)}%`;
        if (message) {
            const labelEl = task.card.querySelector('.task-label');
            if (labelEl) labelEl.textContent = message;
        }
    },

    endTask(taskId, status = 'success', message = '') {
        const task = State.activeTasks.get(taskId);
        if (!task) return;
        task.card.classList.add(status);
        if (message) task.card.querySelector('.task-label').textContent = message;
        
        const fill = task.card.querySelector('.task-progress-fill');
        const percent = task.card.querySelector('.task-percent');
        if (fill) fill.style.width = '100%';
        if (percent) percent.textContent = status === 'success' ? 'DONE' : 'ERR';
        
        setTimeout(() => {
            task.card.classList.add('fading');
            setTimeout(() => {
                task.card.remove();
                State.activeTasks.delete(taskId);
            }, 500);
        }, 3000);
    }
};
