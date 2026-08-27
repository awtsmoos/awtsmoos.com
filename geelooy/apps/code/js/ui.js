// B"H
import { UICore } from './ui/core.js';
import { UINotifications } from './ui/notifications.js';
import { UIDialogs } from './ui/dialogs.js';
import { UILineNumbers } from './ui/line-numbers.js';

export const UI = {
    showLoading: UICore.showLoading,
    hideLoading: UICore.hideLoading,
    switchView: UICore.switchView,
    showToast: UINotifications.showToast,
    startTask: UINotifications.startTask,
    updateTask: UINotifications.updateTask,
    endTask: UINotifications.endTask,
    showDialog: UIDialogs.showDialog,
    updateLineNumbers: UILineNumbers.update,
    syncScroll: UILineNumbers.syncScroll
};