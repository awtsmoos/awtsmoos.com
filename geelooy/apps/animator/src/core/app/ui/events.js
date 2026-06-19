
/* B”H */
export class UIEvents {
  static bind(app) {
    const left = document.getElementById('left-sidebar');
    const nle = document.getElementById('nle-timeline'); 
    const appShell = document.getElementById('app-shell');
    const workspaceOverlay = document.getElementById('workspace-mount');
    
    // Auto-hide workspace initially
    if (workspaceOverlay) workspaceOverlay.classList.add('closed');

    // === Global Action Bar Buttons === //
    const actionBar = document.querySelector('.action-bar');
    if (actionBar) {
      actionBar.addEventListener('click', (e) => {
        const target = e.target.closest('.action-btn');
        if (!target) return;

        switch (target.id) {
          case 'hide-ui-btn':
            if (appShell) appShell.classList.toggle('ui-hidden');
            target.innerText = appShell && appShell.classList.contains('ui-hidden') ? '👁️‍🗨️' : '👁️';
            break;
          case 'toggle-logic-btn':
            if (workspaceOverlay) workspaceOverlay.classList.toggle('closed');
            target.style.background = workspaceOverlay.classList.contains('closed') ? '' : 'var(--accent-primary)';
            break;
          case 'reset-cam-btn':
            app.state.set('camera', { x: 0, y: -100, zoom: 1 });
            break;
        }
      });
    }

    // === MOBILE NAVIGATION ROUTING === //
    // Controls the shifting CSS grids on small viewports
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav && appShell) {
      mobileNav.addEventListener('click', (e) => {
        const btn = e.target.closest('.nav-btn');
        if (!btn) return;

        // Reset all classes
        appShell.classList.remove('sidebar-mobile-active', 'timeline-mobile-active', 'props-mobile-active');
        mobileNav.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Apply specific layout mode
        if (btn.id === 'nav-editor') {
          appShell.classList.add('sidebar-mobile-active');
        } else if (btn.id === 'nav-time') {
          appShell.classList.add('timeline-mobile-active');
        } else if (btn.id === 'nav-props') {
          appShell.classList.add('props-mobile-active');
        }
        // If 'nav-stage', no class is added; it returns to default canvas view.
      });
    }
  }
}
