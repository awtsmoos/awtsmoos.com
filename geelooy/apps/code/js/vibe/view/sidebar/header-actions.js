
// B"H
/**
 * @file header-actions.js
 * @brief Orchestrates the buttons at the crown of the sidebar.
 */
export const VibeHeaderActions = {
    bind(container, tab, onUpdate) {
        const sess = tab.vibeSession;

        const maxBtn = container.querySelector('#vibe-panel-max-btn');
        const minBtn = container.querySelector('#vibe-panel-min-btn');
        const restoreBtn = container.querySelector('#vibe-panel-restore-btn');

        if (maxBtn) {
            maxBtn.onclick = () => {
                sess.viewState.isPanelMaximized = !sess.viewState.isPanelMaximized;
                sess.viewState.isPanelMinimized = false;
                onUpdate();
            };
        }

        if (minBtn) {
            minBtn.onclick = () => {
                sess.viewState.isPanelMinimized = true;
                sess.viewState.isPanelMaximized = false;
                onUpdate();
            };
        }

        if (restoreBtn) {
            restoreBtn.onclick = () => {
                sess.viewState.isPanelMinimized = false;
                onUpdate();
            };
        }

        container.querySelectorAll('.vibe-sb-tab').forEach(t => {
            t.onclick = () => {
                sess.viewState.activeSidebarTab = t.dataset.tab;
                onUpdate();
            };
        });
    }
};
