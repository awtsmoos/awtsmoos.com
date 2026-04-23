
// B"H
/**
 * @file controller.js
 * @brief The Guardian of Sidebar Visibility.
 */
export const SidebarController = {
    bind(container, tab, onUpdate) {
        const sess = tab.vibeSession;
        const toggleBtn = container.querySelector('#vibe-sidebar-toggle-btn');

        if (toggleBtn) {
            toggleBtn.onclick = () => {
                sess.viewState.isSidebarCollapsed = !sess.viewState.isSidebarCollapsed;
                onUpdate();
            };
        }
    }
};
