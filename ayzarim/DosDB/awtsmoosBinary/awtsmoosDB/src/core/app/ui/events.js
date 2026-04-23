
/* B”H */
export class UIEvents {
  static bind(app) {
    const left = document.getElementById('left-sidebar');
    const nle = document.querySelector('.nle-advanced-container');
    const appShell = document.getElementById('app-shell');
    
    const toggleCreatorBtn = document.getElementById('toggle-creator-btn');
    if (toggleCreatorBtn) {
      toggleCreatorBtn.addEventListener('click', () => {
        if (left) left.classList.toggle('active-mobile');
        if (nle) nle.classList.remove('active-mobile');
      });
    }

    const toggleNleBtn = document.getElementById('toggle-nle-btn');
    if (toggleNleBtn) {
      toggleNleBtn.addEventListener('click', () => {
        if (nle) nle.classList.toggle('active-mobile');
        if (left) left.classList.remove('active-mobile');
      });
    }

    const actionBar = document.querySelector('.action-bar');
    if (actionBar) {
      actionBar.addEventListener('click', (e) => {
        const target = e.target.closest('.action-btn');
        if (!target) return;

        switch (target.id) {
          case 'hide-ui-btn':
            if (appShell) appShell.classList.toggle('ui-hidden');
            target.innerText = appShell && appShell.classList.contains('ui-hidden') ? '👁️‍🗨️' : '👁️';
            // Also hide panels if active on mobile
            if (left) left.classList.remove('active-mobile');
            if (nle) nle.classList.remove('active-mobile');
            break;
          case 'play-btn':
            const isPlaying = !app.state.get('isPlaying');
            app.state.set('isPlaying', isPlaying);
            if (isPlaying) {
              app.director.play(app.state.get('activeSequence'));
              target.innerText = '⏹';
            } else {
              app.director.isPlaying = false;
              target.innerText = '▶';
            }
            break;
          case 'reset-cam-btn':
            app.state.set('camera', { x: 0, y: -100, zoom: 1 });
            break;
        }
      });
    }
  }
}
