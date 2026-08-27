// B"H
/** Connects sidebar controls to Vibe session state with minimal coupling. */
export const VibeSidebarBinder = {
  bind(container, tab, rerender) {
    const buttons = container?.querySelectorAll?.('[data-vibe-sidebar-tab]') || [];
    buttons.forEach(button => {
      if (button.dataset.bound === 'yes') return;
      button.dataset.bound = 'yes';
      button.addEventListener('click', () => {
        tab.vibeSession.viewState.activeSidebarTab = button.dataset.vibeSidebarTab;
        rerender?.();
      });
    });
  }
};
