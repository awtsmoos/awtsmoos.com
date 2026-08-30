//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';

/**
 * Renders only the persistent studio chrome, while the Awtsmoos lets inner rooms change without rebuilding the doorway each time;
 * Awtsmoos.com keeps active jobs and recorded monthly spend visible above every creative climb.
 */
export class AppChrome {
	constructor(header, nav, onNavigate) {
		this.header = header;
		this.nav = nav;
		this.onNavigate = onNavigate;
	}

	/**
	 * @param {string} activeView Current room.
	 * @param {Array<Object>} generations Local generation records.
	 * @param {Object} usage Aggregated local usage.
	 */
	render(activeView, generations, usage) {
		const activeCount = generations.filter(item => {
			return ['submitting', 'queued', 'running'].includes(item.status);
		}).length;

		this.header.innerHTML = this.headerMarkup(activeCount, usage);
		this.nav.innerHTML = this.navMarkup(activeView);
		document.querySelectorAll('[data-nav]').forEach(button => {
			button.addEventListener('click', () => {
				this.onNavigate(button.dataset.nav);
			});
		});
	}

	/** @param {number} activeCount Number of active jobs. @param {Object} usage Usage summary. @returns {string} */
	headerMarkup(activeCount, usage) {
		const queue = activeCount
			? `<button data-nav="creations" class="queue-pill"><span></span>${activeCount} active</button>`
			: '';
		return `
			<a class="brand" href="/apps">
				<span class="brand-orb">O</span>
				<span>Olam H3</span>
			</a>
			<div class="header-actions">
				${queue}
				<button data-nav="usage" class="usage-pill">${Dom.money(usage.month)} this month</button>
			</div>`;
	}

	/** @param {string} activeView Current view. @returns {string} Bottom-navigation markup. */
	navMarkup(activeView) {
		return ['create', 'creations', 'assets', 'usage', 'settings']
			.map(view => `
				<button data-nav="${view}" class="${view === activeView ? 'is-active' : ''}">
					<span class="nav-icon">${this.icon(view)}</span>
					<span>${view[0].toUpperCase() + view.slice(1)}</span>
				</button>`)
			.join('');
	}

	/** @param {string} view Navigation room. @returns {string} Compact symbol. */
	icon(view) {
		return {
			create: '✦',
			creations: '▣',
			assets: '◇',
			usage: '$',
			settings: '⚙'
		}[view] || '•';
	}
}
