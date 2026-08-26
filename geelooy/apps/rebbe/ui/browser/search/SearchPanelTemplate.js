//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class MalchusSearchPanelTemplate
 * @description
 * The Awtsmoos is beyond year, month, day, keyword, and result, while Awtsmoos.com lets each finite search dimension enter one clean progressive chamber whose advanced filters remain available without cluttering the first glance.
 */
export class MalchusSearchPanelTemplate {
	/** Creates the static search markup from trusted archive option data. */
	constructor(tiferesOptions = {}) {
		this.options = tiferesOptions;
	}

	/** Returns the complete bounded panel surface without runtime style tags. */
	render() {
		return `
			<h2>Search by zman</h2>
			<label class="keyword-row">
				<span>Keyword title search</span>
				<input id="search-keyword" class="cyber-input" placeholder="Words in title or folder…">
			</label>
			<div class="suggest-row">${this.suggestions()}</div>
			<div class="search-actions sticky-actions">
				<button class="modal-btn primary-scan" id="btn-date-search">Scan now</button>
				<button class="modal-btn" id="btn-results-fullscreen">Events fullscreen</button>
			</div>
			<div class="search-stack">${['year', 'month', 'day'].map(kind => this.filterBlock(kind)).join('')}</div>
			<details class="history-box">
				<summary>Recent searches</summary>
				<div class="history-actions">
					<button class="history-small" id="btn-history-refresh">Refresh</button>
					<button class="history-small danger" id="btn-history-clear">Clear</button>
				</div>
				<div id="search-history-list" class="history-list"><div class="history-empty">No saved searches yet</div></div>
			</details>
			<div class="search-actions lower-actions">
				<button class="modal-btn primary-scan" id="btn-date-search-bottom">Scan now</button>
				<button class="modal-btn" id="btn-cache-indexes">Cache indexes</button>
				<button class="modal-btn" id="btn-date-reset">Reset</button>
				<button class="modal-btn modal-close">Close</button>
			</div>
			<p class="search-help">Past searches are remembered automatically. Open Recent searches to restore or run one.</p>
			<section class="search-res date-search-results" id="search-results" aria-label="Archive search results">
				<header class="search-results-toolbar">
					<div><span class="search-results-kicker">Archive events</span><strong>Results</strong></div>
					<button class="modal-btn search-results-exit" id="btn-results-exit" hidden>Exit fullscreen</button>
				</header>
				<div id="search-results-content" class="search-results-content"><div class="search-empty">Choose filters and scan</div></div>
			</section>`;
	}

	/** Returns the fixed trusted suggestion chips. */
	suggestions() {
		return ['farbrengen', 'sicha', 'maamar', 'Yud Shvat', 'Chof Ches Sivan', 'Lag BaOmer']
			.map(term => `<button class="term-chip" data-term="${term}">${term}</button>`)
			.join('');
	}

	/** Returns one exact/range/any filter vessel. */
	filterBlock(kind) {
		return `<section class="zman-filter" data-kind="${kind}">
			<div class="zman-filter-head"><strong>${title(kind)}</strong>${this.modeSelect(kind)}</div>
			<div class="zman-exact">${this.select(`${kind}-exact`, `All ${kind}s`, this.values(kind))}</div>
			<div class="zman-range hidden">${this.select(`${kind}-from`, `From ${kind}`, this.values(kind))}${this.select(`${kind}-to`, `To ${kind}`, this.values(kind))}</div>
		</section>`;
	}

	/** Returns one mode selector. */
	modeSelect(kind) {
		return `<select id="search-${kind}-mode" class="cyber-input mode-input"><option value="exact">Exact</option><option value="range">Range</option><option value="any">Any</option></select>`;
	}

	/** Returns one archive value selector. */
	select(id, label, values) {
		return `<select id="search-${id}" class="cyber-input"><option value="">${label}</option>${values.join('')}</select>`;
	}

	/** Converts trusted archive option data into option markup. */
	values(kind) {
		if (kind === 'year') return (this.options.years || []).map(value => `<option value="${value}">${value}</option>`);
		if (kind === 'month') return (this.options.months || []).map(value => `<option value="${value.id}">${value.id} // ${value.name}</option>`);
		if (kind === 'day') return (this.options.days || []).map(value => `<option value="${value}">${value}</option>`);
		return [];
	}
}

/** Capitalizes one internal filter name. */
function title(value) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
