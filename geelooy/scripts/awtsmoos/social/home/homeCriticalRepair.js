// B"H
(function () {
  if (window.__geelooyHomeCriticalRepair) return;
  window.__geelooyHomeCriticalRepair = true;
  const posts = [
    ['Maya Stern', 'Campus Life', 'Study group forming', 'Calc II review tonight at the quiet tables. Bring old quizzes, coffee, and patience.'],
    ['Noam Levy', 'Campus Life', 'Lost hoodie found', 'Blue university hoodie near the vending machines. Left it at the front desk.'],
    ['Talia Brooks', 'Campus Life', 'Shabbos meal seats', 'Two seats open for dinner. Message if you need a warm place.'],
    ['Eli Cohen', 'Campus Life', 'Dorm store run', 'Heading to the store soon. Drop requests before I leave North Quad.']
  ];
  function start() {
    bindDirectMenuButton();
    document.addEventListener('click', routeTabClick, true);
    document.addEventListener('touchend', routeTabTouch, { capture: true, passive: false });
    setTimeout(ensureFeed, 150);
    setTimeout(ensureFeed, 1000);
    setTimeout(ensureFeed, 2500);
  }
  function bindDirectMenuButton() {
    const button = document.querySelector('#shared-menu-button,.menuBtn,[data-geelooy-menu]');
    if (!button || button.dataset.criticalMenuBound === 'true') return;
    button.dataset.criticalMenuBound = 'true';
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      toggleMenu(button);
    }, true);
    button.addEventListener('touchend', event => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      toggleMenu(button);
    }, { capture: true, passive: false });
  }
  function routeTabTouch(event) {
    const button = event.target.closest?.('[data-feed-mode]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    activateTab(button);
  }
  function routeTabClick(event) {
    const button = event.target.closest?.('[data-feed-mode]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    activateTab(button);
  }
  function toggleMenu(button) {
    const drawer = document.getElementById('shared-sidebar') || document.querySelector('.sidebarMitzvah');
    if (!drawer) return;
    const open = drawer.classList.contains('offscreen') || drawer.hidden || button.getAttribute('aria-expanded') !== 'true';
    drawer.hidden = false;
    drawer.classList.add('geelooy-drawer');
    drawer.classList.toggle('offscreen', !open);
    button.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    document.body.dataset.geelooyDrawerOpen = String(open);
  }
  function activateTab(button) {
    const mode = button.dataset.feedMode || 'forYou';
    document.querySelectorAll('[data-feed-mode]').forEach(tab => {
      const active = tab === button;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-pressed', String(active));
    });
    const feed = document.querySelector('[data-home-feed]');
    if (feed) feed.dataset.mode = mode;
    ensureFeed(`${mode}-critical-click`);
    document.dispatchEvent(new CustomEvent('geelooy:feed-mode', { detail: { mode } }));
  }
  function ensureFeed(reason = 'critical-repair') {
    const feed = document.querySelector('[data-home-feed]');
    if (!feed) return false;
    if (feed.querySelector('[data-feed-renderer="unified-feed-card"]')) return true;
    feed.dataset.feedModule = reason;
    feed.replaceChildren(...posts.map(card));
    return true;
  }
  function card([author, room, title, text], index) {
    const article = document.createElement('article');
    article.className = 'home-post-card geelooy-feed-card';
    article.dataset.feedRenderer = 'unified-feed-card';
    article.dataset.criticalFallbackCard = String(index + 1);
    article.innerHTML = `<header class="geelooy-feed-card-head">${avatar()}<div class="geelooy-feed-byline"><strong>${author}</strong><small>${room} · Post</small></div></header><h3 class="geelooy-feed-title">${title}</h3><p class="geelooy-feed-summary">${text}</p><div class="geelooy-feed-meta-line"><button type="button" class="geelooy-verse-chip">Read verses</button><span class="awt-media-pill">${3 + index} comments</span><span class="awt-media-pill">${12 + index * 8} reactions</span></div><div class="geelooy-feed-compact-actions"><button type="button">👍 Like</button><button type="button">💬 Comment</button><button type="button">↗ Share</button></div>`;
    return article;
  }
  function avatar() {
    const parts = ['character-aura','character-shadow','character-leg left','character-leg right','character-shoe left','character-shoe right','character-robe','character-lapel left','character-lapel right','character-belt','character-arm left','character-arm right','character-hand left','character-hand right','character-neck','character-head','character-ear left','character-ear right','character-hair','character-peyos left','character-peyos right','character-hat-brim','character-hat-crown','character-eye left','character-eye right','character-brow left','character-brow right','character-nose','character-moustache','character-beard','character-smile'];
    return `<span class="geelooy-avatar geelooy-feed-avatar geelooy-character-avatar character-variant-0" aria-hidden="true">${parts.map(part => `<i class="${part}" aria-hidden="true"></i>`).join('')}</span>`;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
