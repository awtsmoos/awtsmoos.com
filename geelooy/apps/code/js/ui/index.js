
// B"H
import { UICore } from './core.js';
import { UINotifications } from './notifications.js';
import { UIDialogs } from './dialogs.js';
import { UILineNumbers } from './line-numbers.js';

export const UI = {
    ...UICore,
    ...UINotifications,
    ...UIDialogs,
    ...UILineNumbers
};
