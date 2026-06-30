// B"H
import { toolbarGroup } from './toolbar/group.js';
import { TOOLBAR_GROUPS } from './toolbar/definitions.js';
import { createCommandRunner } from './toolbar/commandRunner.js';
import { updateButtonState } from './toolbar/buttonState.js';
import { searchBox } from './toolbar/searchBox.js';
import { statusStrip } from './toolbar/statusStrip.js';
import { bindToolbarKeyboard } from './toolbar/keyboard.js';
export default function createToolbar({ state, os, controller, onRefresh, onToggleSidebar }) {
  void os; const el = document.createElement('div'); el.className = 'button-bar'; el.dataset.buttonAudit = 'all-actions-wired';
  const run = createCommandRunner({ controller, state, onRefresh });
  el.append(sidebarButton(onToggleSidebar), ...Object.entries(TOOLBAR_GROUPS).map(([name, defs]) => toolbarGroup(name, defs, run)), searchBox({ state, controller, onRefresh }), spacer(), statusStrip({ controller }));
  bindToolbarKeyboard(el); return { dom:el, update:() => { state.hasClipboard = !!controller.os?.clipboard?.action; updateButtonState(el, state); el.querySelector('.toolbar-status')?.awtsUpdate?.(); } };
}
function sidebarButton(click) { const b = document.createElement('button'); b.type = 'button'; b.className = 'sidebar-toggle-btn xp-button'; b.textContent = '☰'; b.title = 'Toggle sidebar'; b.dataset.action = 'toggleSidebar'; b.addEventListener('click', click); return b; }
function spacer() { const el = document.createElement('div'); el.className = 'toolbar-spacer'; return el; }
/** B"H: toolbar is now an audited command surface; no decorative dead buttons. */
