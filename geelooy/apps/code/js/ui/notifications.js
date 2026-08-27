
// B"H
// FILE: js/ui/notifications.js

import { State, DOM } from '../state.js';

let _taskStack = null;

function _ensureTaskStack() {
    if (_taskStack && document.body.contains(_taskStack)) return;
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
        
        requestAnimationFrame(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 400);
            }, duration);
        });
    },

    startTask(taskId, label) {
        _ensureTaskStack();
        const card = document.createElement('div');
        card.className = 'task-card';
        card.id = `task-${taskId}`;
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
        const label = task.card.querySelector('.task-label');

        if (fill) fill.style.width = `${progress}%`;
        if (percent) percent.textContent = `${Math.round(progress)}%`;
        if (message && label) label.textContent = message;
    },

    endTask(taskId, status = 'success', message = '') {
        const task = State.activeTasks.get(taskId);
        if (!task) return;
        
        task.card.classList.add(status);
        const label = task.card.querySelector('.task-label');
        if (label) label.textContent = message || (status === 'success' ? 'Completed' : 'Failed');
        
        const percent = task.card.querySelector('.task-percent');
        if (percent) percent.textContent = status === 'success' ? 'DONE' : 'ERR';
        
        const fill = task.card.querySelector('.task-progress-fill');
        if (fill) fill.style.width = '100%';

        setTimeout(() => {
            task.card.style.opacity = '0';
            task.card.style.transform = 'translateX(20px)';
            setTimeout(() => {
                task.card.remove();
                State.activeTasks.delete(taskId);
            }, 400);
        }, 3000);
    }
};
