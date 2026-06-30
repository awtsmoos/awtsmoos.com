/* B"H
 * Navigation bindings: one-click travel across the studio without losing the thread.
 */
export function bindNavigation({ dom, setStatus }) {
  bind(dom.navStage, dom.stageSection, 'Stage ready.', setStatus);
  bind(dom.navSources, dom.sourcesSection, 'Sources and crop tools ready.', setStatus);
  bind(dom.navNle, dom.nleSection, 'NLE timeline ready.', setStatus);
  bind(dom.navBenchmark, dom.benchmarkCard, 'Benchmark panel ready.', setStatus);
}
function bind(button, target, message, setStatus) {
  if (!button || !target) return;
  button.onclick = () => { target.scrollIntoView?.({ behavior:'smooth', block:'start' }); setStatus?.(message); markActive(button); };
}
function markActive(button) {
  [...button.parentNode?.children || []].forEach(sibling => sibling.classList?.remove?.('active'));
  button.classList?.add?.('active');
}
