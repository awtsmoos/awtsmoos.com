
// B"H
// FILE: js/app/fullscreen-manager.js

import { State } from '../state.js';
import { UI } from '../ui.js';

/**
 * @class FullscreenManager
 * @description Controls the expansion and contraction of reality's borders.
 */
export const FullscreenManager = {
    /**
     * @function toggleApp
     * @description Expands the entire browser window.
     */
    toggleApp() {
        const isFull = document.fullscreenElement || document.webkitFullscreenElement;
        const target = document.documentElement;

        if (isFull) {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            UI.showToast("App boundaries restored.", "info");
        } else {
            if (target.requestFullscreen) target.requestFullscreen();
            else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
            UI.showToast("App boundaries expanded to Infinity.", "success");
        }
    },

    /**
     * @function toggleActiveTab
     * @description Expands ONLY the specific active container (Editor, Preview, Terminal)
     * so that it occupies the entire screen without the sidebar or menus.
     */
    toggleActiveTab() {
        const tab = State.tabs.find(t => t.id === State.activeTabId);
        if (!tab) {
            UI.showToast("No active tab to expand.", "warning");
            return;
        }

        let targetEl = null;

        if (tab.fileType === 'html-preview' || tab.isPreview) {
            targetEl = document.getElementById('previewer');
        } else if (tab.fileType === 'terminal' || tab.item.type === 'terminal') {
            targetEl = document.getElementById('terminal-wrapper');
        } else if (tab.item.type === 'commander') {
            targetEl = document.getElementById('file-commander-wrapper');
        } else if (tab.fileType === 'vibe' || tab.item.type === 'vibe-session') {
            targetEl = document.getElementById('vibe-editor-wrapper');
        } else if (tab.fileType === 'virtual-os' || tab.item?.type === 'virtual-os') {
            targetEl = document.getElementById('virtual-os-wrapper');
        } else if (tab.fileType === 'zip') {
            targetEl = document.getElementById('zip-editor-wrapper');
        } else if (tab.isHexView) {
            targetEl = document.getElementById('hex-editor-wrapper');
        } else if (tab.isAltarView) {
            targetEl = document.getElementById('data-altar-container');
        } else {
            targetEl = document.getElementById('editor-wrapper');
        }

        if (!targetEl) return;

        const isFull = document.fullscreenElement || document.webkitFullscreenElement;

        if (isFull === targetEl) {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        } else {
            // Enter Fullscreen on specific element
            // We set a background color so it doesn't default to pure black/transparent
            targetEl.style.backgroundColor = 'var(--color-bg-deep)';
            
            if (targetEl.requestFullscreen) targetEl.requestFullscreen();
            else if (targetEl.webkitRequestFullscreen) targetEl.webkitRequestFullscreen();
            
            UI.showToast(`Expanded Tab: ${tab.item.name}`, "success");
        }
    }
};
