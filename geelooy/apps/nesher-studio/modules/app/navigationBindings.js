/* B"H
 * Page navigation: the NLE becomes its own chamber, not another hallway below.
 */
export function bindNavigation({ dom, setStatus }) {
  const pages = { studio: dom.studioPage, nle: dom.nleSection };
  const show = (page, target, message) => showPage({ pages, page, target, message, setStatus });
  bind(dom.navStage, () => show('studio', dom.stageSection, 'Stage ready.'));
  bind(dom.navSources, () => show('studio', dom.sourcesSection, 'Sources and crop tools ready.'));
  bind(dom.navNle, () => show('nle', dom.nleSection, 'NLE page ready.'));
  bind(dom.navBenchmark, () => show('nle', dom.benchmarkCard, 'Benchmark panel ready.'));
  bind(dom.backToStudio, () => show('studio', dom.homeSection, 'Studio dashboard ready.'));
  bindPageTiles(show);
  openInitialHash(show, dom);
}

function bind(button, run) {
  if (!button) return;
  button.onclick = event => { event?.preventDefault?.(); run(); markActive(button); };
}

function bindPageTiles(show) {
  const tiles = [...document.querySelectorAll?.('[data-page-target]') || []];
  tiles.forEach(tile => tile.addEventListener?.('click', event => openTile(event, tile, show)));
}

function openTile(event, tile, show) {
  event.preventDefault();
  const page = tile.dataset.pageTarget || 'studio';
  const target = document.querySelector?.(tile.hash) || document.getElementById?.(`${page}Section`);
  show(page, target, page === 'nle' ? 'NLE page ready.' : 'Studio page ready.');
}

function showPage({ pages, page, target, message, setStatus }) {
  if (!pages.studio || !pages.nle) return;
  pages.studio.hidden = page !== 'studio';
  pages.nle.hidden = page !== 'nle';
  openContainingDrawers(target);
  history.replaceState?.(null, '', target?.id ? `#${target.id}` : location.pathname || '');
  requestAnimationFrame?.(() => target?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }));
  setStatus?.(message);
}

function openContainingDrawers(target) {
  if (target?.tagName === 'DETAILS') target.open = true;
  target?.closest?.('details')?.setAttribute('open', '');
}

function openInitialHash(show, dom) {
  const id = (location.hash || '').slice(1);
  if (!id) return;
  const target = document.getElementById?.(id);
  const isNle = target === dom.nleSection || target?.closest?.('#nleSection');
  show(isNle ? 'nle' : 'studio', target, isNle ? 'NLE page ready.' : 'Studio page ready.');
}

function markActive(button) {
  [...button.parentNode?.children || []].forEach(sibling => sibling.classList?.remove?.('active'));
  button.classList?.add?.('active');
}
