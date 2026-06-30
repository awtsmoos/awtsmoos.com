// B"H
import { statusText } from '../../api/actions/status.js';
export function statusStrip({ controller }) { const el = document.createElement('div'); el.className = 'xp-status-strip toolbar-status'; el.awtsUpdate = () => el.textContent = statusText({ controller }); el.awtsUpdate(); return el; }
/** B"H: the toolbar speaks item and selection count. */
