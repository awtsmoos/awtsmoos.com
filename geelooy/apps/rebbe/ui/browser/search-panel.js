//B"H
import { getSearchOptions } from '../../search.js';
import { clearSearchHistory, listSearchHistory, saveSearchHistory } from '../../modules/store.js';

const SUGGESTED_TERMS = ['farbrengen', 'sicha', 'maamar', 'yud shvat', 'chof ches sivan', 'lag baomer'];

/**
 * B"H
 * SearchPanel is a remembering gate. The Awtsmoos does not merely answer one
 * scan; it keeps the path: ranges, years, days, and words can be opened again
 * like a door in the archive palace.
 */
export class SearchPanel {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.options = getSearchOptions();
  }

  mount(modal) {
    if (!modal) return;
    modal.classList.add('search-modal');
    modal.innerHTML = this.render();
    this.bind(modal);
    this.refreshHistory(modal);
  }

  render() {
    return `
      <h2>SEARCH BY ZMAN</h2>
      <label class="keyword-row">KEYWORD TITLE SEARCH<input id="search-keyword" class="cyber-input" placeholder="OPTIONAL WORDS IN TITLE / FOLDER..."></label>
      <div class="suggest-row">${SUGGESTED_TERMS.map(term => `<button class="term-chip" data-term="${term}">${term}</button>`).join('')}</div>
      <div class="search-actions sticky-actions">
        <button class="modal-btn primary-scan" id="btn-date-search">🔍 SCAN NOW</button>
        <button class="modal-btn" id="btn-results-fullscreen">EVENTS FULLSCREEN</button>
      </div>
      <div class="search-stack">${this.filterBlock('year')}${this.filterBlock('month')}${this.filterBlock('day')}</div>
      <details class="history-box" open>
        <summary>SEARCH HISTORY</summary>
        <div class="history-actions"><button class="modal-btn" id="btn-history-refresh">REFRESH HISTORY</button><button class="modal-btn danger" id="btn-history-clear">CLEAR HISTORY</button></div>
        <div id="search-history-list" class="history-list"><div class="history-empty">NO SAVED SEARCHES YET</div></div>
      </details>
      <div class="search-actions lower-actions">
        <button class="modal-btn primary-scan" id="btn-date-search-bottom">🔍 SCAN NOW</button>
        <button class="modal-btn" id="btn-cache-indexes">CACHE ALL INDEXES</button>
        <button class="modal-btn" id="btn-date-reset">RESET</button>
        <button class="modal-btn modal-close">CLOSE</button>
      </div>
      <div class="search-help">Past searches are remembered automatically. Click a history row to restore exact ranges/text, or RUN to restore and scan.</div>
      <button class="modal-btn results-exit hidden" id="btn-results-exit">EXIT EVENTS FULLSCREEN</button>
      <div class="search-res date-search-results" id="search-results"><div class="search-empty">SELECT FILTERS AND SCAN</div></div>
      ${this.styles()}`;
  }

  filterBlock(kind) {
    return `<section class="zman-filter" data-kind="${kind}">
      <div class="zman-filter-head"><strong>${kind.toUpperCase()}</strong>${this.modeSelect(kind)}</div>
      <div class="zman-exact">${this.select(`${kind}-exact`, `ALL ${kind.toUpperCase()}S`, this.values(kind))}</div>
      <div class="zman-range hidden">
        ${this.select(`${kind}-from`, `FROM ${kind.toUpperCase()}`, this.values(kind))}
        ${this.select(`${kind}-to`, `TO ${kind.toUpperCase()}`, this.values(kind))}
      </div>
    </section>`;
  }

  modeSelect(kind) {
    return `<select id="search-${kind}-mode" class="cyber-input mode-input">
      <option value="exact" selected>EXACT</option><option value="range">RANGE</option><option value="any">ANY</option>
    </select>`;
  }

  select(id, label, values) {
    return `<select id="search-${id}" class="cyber-input"><option value="">${label}</option>${values.join('')}</select>`;
  }

  values(kind) {
    const maps = {
      year: this.options.years.map(y => `<option value="${y}">${y}</option>`),
      month: this.options.months.map(x => `<option value="${x.id}">${x.id} // ${x.name}</option>`),
      day: this.options.days.map(d => `<option value="${d}">${d}</option>`)
    };
    return maps[kind] || [];
  }

  bind(modal) {
    const one = selector => modal.querySelector(selector);
    ['year', 'month', 'day'].forEach(kind => this.bindMode(modal, kind));
    one('#btn-date-search')?.addEventListener('click', () => this.run(modal));
    one('#btn-date-search-bottom')?.addEventListener('click', () => this.run(modal));
    one('#btn-cache-indexes')?.addEventListener('click', () => this.cacheAll(modal));
    one('#btn-date-reset')?.addEventListener('click', () => this.reset(modal));
    one('#btn-results-fullscreen')?.addEventListener('click', () => this.setResultsFullscreen(modal, true));
    one('#btn-results-exit')?.addEventListener('click', () => this.setResultsFullscreen(modal, false));
    one('#btn-history-refresh')?.addEventListener('click', () => this.refreshHistory(modal));
    one('#btn-history-clear')?.addEventListener('click', async () => this.clearHistory(modal));
    modal.querySelectorAll('.term-chip').forEach(chip => chip.addEventListener('click', () => this.applyTerm(modal, chip.dataset.term)));
    one('#search-keyword')?.addEventListener('keydown', event => {
      if (event.key === 'Enter') this.run(modal);
    });
  }

  bindMode(modal, kind) {
    const mode = modal.querySelector(`#search-${kind}-mode`);
    const block = modal.querySelector(`[data-kind="${kind}"]`);
    const sync = () => {
      const isRange = mode.value === 'range';
      block?.querySelector('.zman-range')?.classList.toggle('hidden', !isRange);
      block?.querySelector('.zman-exact')?.classList.toggle('hidden', mode.value !== 'exact');
    };
    mode?.addEventListener('change', sync);
    sync();
  }

  async run(modal) {
    const request = this.readRequest(modal);
    const results = modal.querySelector('#search-results');
    if (!this.hasFilter(request)) {
      results.innerHTML = '<div class="search-empty">CHOOSE DATE FILTERS OR A KEYWORD</div>';
      return;
    }
    results.innerHTML = '<div class="search-empty">ACCESSING ARCHIVE INDEXES...</div>';
    await saveSearchHistory(request, this.describe(request));
    this.refreshHistory(modal);
    this.callbacks.onSearch?.(request);
  }

  cacheAll(modal) {
    const results = modal.querySelector('#search-results');
    results.innerHTML = '<div class="search-empty">CACHING DATE INDEXES...</div>';
    this.callbacks.onPrimeSearchCache?.(progress => {
      results.innerHTML = `<div class="search-empty">CACHED ${progress.done} / ${progress.total}</div>`;
    });
  }

  readRequest(modal) {
    const request = Object.fromEntries(['year', 'month', 'day'].map(kind => [kind, this.readKind(modal, kind)]));
    request.keyword = modal.querySelector('#search-keyword')?.value || '';
    return request;
  }

  readKind(modal, kind) {
    const mode = modal.querySelector(`#search-${kind}-mode`)?.value || 'exact';
    if (mode === 'exact') return modal.querySelector(`#search-${kind}-exact`)?.value || '';
    if (mode === 'range') return { from: modal.querySelector(`#search-${kind}-from`)?.value || '', to: modal.querySelector(`#search-${kind}-to`)?.value || '' };
    return '';
  }

  applyTerm(modal, term) {
    const input = modal.querySelector('#search-keyword');
    if (!input) return;
    const current = input.value.trim();
    input.value = current && !current.toLowerCase().includes(term) ? `${current} ${term}` : term;
    input.focus();
  }

  async refreshHistory(modal) {
    const root = modal.querySelector('#search-history-list');
    if (!root) return;
    const history = await listSearchHistory();
    root.innerHTML = history.length ? '' : '<div class="history-empty">NO SAVED SEARCHES YET</div>';
    history.forEach(entry => root.appendChild(this.historyRow(modal, entry)));
  }

  historyRow(modal, entry) {
    const row = document.createElement('div');
    row.className = 'history-row';
    row.innerHTML = `<button class="history-label"></button><button class="history-run">RUN</button>`;
    row.querySelector('.history-label').textContent = entry.label || this.describe(entry.request);
    row.querySelector('.history-label').onclick = () => this.applyRequest(modal, entry.request, false);
    row.querySelector('.history-run').onclick = () => this.applyRequest(modal, entry.request, true);
    return row;
  }

  applyRequest(modal, request, shouldRun) {
    ['year', 'month', 'day'].forEach(kind => this.writeKind(modal, kind, request[kind]));
    const keyword = modal.querySelector('#search-keyword');
    if (keyword) keyword.value = request.keyword || '';
    if (shouldRun) this.run(modal);
  }

  writeKind(modal, kind, value) {
    const mode = modal.querySelector(`#search-${kind}-mode`);
    const exact = modal.querySelector(`#search-${kind}-exact`);
    const from = modal.querySelector(`#search-${kind}-from`);
    const to = modal.querySelector(`#search-${kind}-to`);
    if (value && typeof value === 'object') {
      mode.value = 'range';
      from.value = value.from || '';
      to.value = value.to || '';
    } else if (value) {
      mode.value = 'exact';
      exact.value = value;
    } else {
      mode.value = 'exact';
      exact.value = '';
      from.value = '';
      to.value = '';
    }
    this.bindMode(modal, kind);
  }

  hasFilter(request) {
    return Object.entries(request).some(([key, value]) => key === 'keyword'
      ? String(value || '').trim()
      : typeof value === 'object' ? value.from || value.to : value);
  }

  async clearHistory(modal) {
    await clearSearchHistory();
    this.refreshHistory(modal);
  }

  reset(modal) {
    modal.querySelectorAll('select,input').forEach(field => { field.value = ''; });
    modal.querySelectorAll('.mode-input').forEach(select => { select.value = 'exact'; });
    ['year', 'month', 'day'].forEach(kind => this.bindMode(modal, kind));
    this.setResultsFullscreen(modal, false);
    modal.querySelector('#search-results').innerHTML = '<div class="search-empty">SELECT FILTERS AND SCAN</div>';
  }

  setResultsFullscreen(modal, enabled) {
    const results = modal.querySelector('#search-results');
    const exit = modal.querySelector('#btn-results-exit');
    const open = modal.querySelector('#btn-results-fullscreen');
    results.classList.toggle('result-fullscreen', enabled);
    exit?.classList.toggle('hidden', !enabled);
    if (open) open.textContent = enabled ? 'EVENTS ARE FULL' : 'EVENTS FULLSCREEN';
  }

  describe(request) {
    const parts = [];
    if (request.keyword) parts.push(`“${request.keyword}”`);
    ['year', 'month', 'day'].forEach(kind => {
      const value = request[kind];
      if (!value) return;
      if (typeof value === 'object' && (value.from || value.to)) parts.push(`${kind} ${value.from || '*'}-${value.to || '*'}`);
      else if (value) parts.push(`${kind} ${value}`);
    });
    return parts.join(' // ') || 'Search';
  }

  styles() {
    return `<style>.search-modal{width:min(980px,94vw);height:min(84vh,760px);max-height:84vh;overflow:auto!important;padding-bottom:120px!important}.keyword-row{display:grid;gap:8px;color:#aaa;font-weight:900;letter-spacing:1px;background:rgba(0,243,255,.035);border:1px solid #123;padding:12px}.suggest-row{display:flex;gap:8px;flex-wrap:wrap}.term-chip{border:1px solid #244;background:#050b0c;color:var(--c-cyan);padding:8px 10px;font-family:monospace;font-weight:900;letter-spacing:1px}.term-chip:hover{background:var(--c-cyan);color:#000}.search-stack{display:grid;grid-template-columns:1fr;gap:12px}.zman-filter{border:1px solid #222;background:rgba(255,255,255,.035);padding:12px;display:grid;gap:10px}.zman-filter-head{display:flex;justify-content:space-between;gap:12px;align-items:center;color:#aaa}.mode-input{max-width:150px}.zman-range{display:grid;grid-template-columns:1fr 1fr;gap:10px}.search-actions{display:flex;gap:10px;flex-wrap:wrap}.history-box{border:1px solid #183239;background:rgba(0,243,255,.035);padding:10px}.history-box summary{color:var(--c-yellow);font-weight:900;letter-spacing:2px;cursor:pointer}.history-actions{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.history-list{display:grid;gap:8px}.history-row{display:grid;grid-template-columns:1fr auto;gap:8px}.history-label,.history-run{border:1px solid #244;background:#010606;color:#ddd;padding:10px;text-align:left;font-family:monospace;cursor:pointer}.history-run{color:#000;background:var(--c-cyan);font-weight:900;text-align:center}.history-empty{padding:12px;color:#778;text-align:center;letter-spacing:2px}.lower-actions{padding-bottom:4px}.sticky-actions{position:sticky;top:0;z-index:12;background:#000;padding:8px 0;border-bottom:1px solid #123}.primary-scan{background:var(--c-cyan)!important;color:#000!important;border-color:var(--c-cyan)!important;box-shadow:0 0 14px rgba(0,243,255,.35)}.search-help{color:#b7c5d0;border-left:3px solid var(--c-magenta);padding:8px 12px;background:rgba(255,0,128,.06);font-size:13px}.search-res.date-search-results{max-height:none!important;min-height:220px;overflow:auto!important;border:1px solid #244!important;margin-top:0!important;margin-bottom:90px!important;background:#010606!important}.date-search-results.result-fullscreen{position:fixed!important;inset:10px!important;z-index:9999!important;max-height:none!important;height:auto!important;min-height:0!important;margin:0!important;background:#000!important;border:3px solid var(--c-cyan)!important;box-shadow:0 0 45px rgba(0,243,255,.45)!important;padding-top:54px}.results-exit{position:fixed!important;top:18px!important;right:20px!important;z-index:10001!important;background:var(--c-magenta)!important;color:#fff!important;border-color:var(--c-magenta)!important}.search-empty{padding:26px;text-align:center;color:#778;letter-spacing:2px;font-weight:900}.search-summary{position:sticky;top:0;z-index:3;padding:12px 14px;background:#000;border-bottom:1px solid #244;color:#bbb;font-weight:900}.result-fullscreen .search-summary{top:0}.search-summary span{color:var(--c-cyan);font-size:18px}.date-result{appearance:none!important;-webkit-appearance:none!important;width:100%;display:block;text-align:left;border:0!important;border-bottom:1px solid #163235!important;background:linear-gradient(90deg,rgba(0,243,255,.12),rgba(0,0,0,.98))!important;color:#eee!important;padding:16px 20px!important;cursor:pointer}.date-result:hover{background:rgba(0,243,255,.18)!important;color:#fff!important}.result-topline{display:flex;justify-content:space-between;gap:12px}.result-date{color:var(--c-yellow);font-weight:900}.result-arrow{color:var(--c-cyan);font-weight:900}.result-title{font-size:17px;font-weight:800;color:#fff;margin:8px 0}.result-meta{display:flex;gap:8px;flex-wrap:wrap;color:#91a4ad;font:11px monospace}@media(min-width:820px){.search-stack{grid-template-columns:repeat(3,1fr)}}@media(max-width:720px){.search-modal{height:88vh;max-height:88vh;padding-bottom:170px!important}.zman-range{grid-template-columns:1fr}.mode-input{max-width:100%}.sticky-actions .modal-btn{flex:1 1 140px}.history-row{grid-template-columns:1fr}.search-res.date-search-results{min-height:180px;margin-bottom:140px!important}.results-exit{left:18px!important;right:18px!important;top:16px!important}}</style>`;
  }
}
