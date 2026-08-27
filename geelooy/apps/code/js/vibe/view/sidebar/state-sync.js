
// B"H
/**
 * @file state-sync.js
 * @brief Syncs the session state with the physical DOM.
 */
export const VibeStateSync = {
    apply(container, tab) {
        const sess = tab.vibeSession;
        const containerEl = container.querySelector('.vibe-container');
        if (!containerEl) return;

        // B"H - THE LOGICAL TIKKUN: Mutual Exclusivity
        if (sess.viewState.isPanelMaximized) sess.viewState.isPanelMinimized = false;
        if (sess.viewState.isPanelMinimized) sess.viewState.isPanelMaximized = false;

        // Apply Layout Mode Classes
        containerEl.classList.toggle('panel-maximized', !!sess.viewState.isPanelMaximized);
        containerEl.classList.toggle('panel-minimized', !!sess.viewState.isPanelMinimized);
        
        // Update Icons & UI Visibility
        const maxBtn = container.querySelector('#vibe-panel-max-btn');
        if (maxBtn) {
            maxBtn.innerHTML = sess.viewState.isPanelMaximized 
                ? '<svg viewBox="0 0 24 24" class="svg-icon" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>'
                : '<svg class="svg-icon"><use href="#icon-fullscreen"></use></svg>';
        }

        const restoreBtn = container.querySelector('#vibe-panel-restore-btn');
        if (restoreBtn) restoreBtn.style.display = sess.viewState.isPanelMinimized ? 'flex' : 'none';
        
        const innerPanel = container.querySelector('.vibe-panel-inner');
        if (innerPanel) innerPanel.style.display = sess.viewState.isPanelMinimized ? 'none' : 'flex';
    }
};
