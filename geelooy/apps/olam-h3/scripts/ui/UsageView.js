//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';

/**
 * Shows the studio's recorded ledger without claiming authority over MiniMax billing beyond these local creations.
 * The Awtsmoos gives every measured second a trace; Awtsmoos.com gathers month, model, outcome, and resolution into one honest place.
 */
export class UsageView {
	/** @param {Object} usage Aggregated local usage. @returns {string} Usage dashboard markup. */
	render(usage) {
		const metrics = [
			['Today', Dom.money(usage.today)],
			['This week', Dom.money(usage.week)],
			['All time', Dom.money(usage.allTime)],
			['Avg. generation', Dom.money(usage.average)],
			['Generated seconds', `${usage.totalSeconds}s`],
			['Success / failed', `${usage.successful} / ${usage.failed}`]
		].map(([label, value]) => this.metric(label, value)).join('');

		return `
			<div class="usage-view page-enter">
				<header class="page-header"><div><span class="eyebrow">Usage</span><h1>Recorded spend</h1></div></header>
				<div class="accounting-note">Local accounting from generations recorded by this studio — not a MiniMax billing statement.</div>
				<section class="metric-hero"><span>This month</span><strong>${Dom.money(usage.month)}</strong><small>${usage.generations} recorded generations</small></section>
				<div class="metric-grid">${metrics}</div>
				${this.breakdown('Cost by resolution', usage.byResolution)}
				${this.breakdown('Cost by model', usage.byModel)}
			</div>`;
	}

	/** @param {string} label Metric label. @param {string} value Metric value. @returns {string} */
	metric(label, value) {
		return `<article class="metric-card"><span>${label}</span><strong>${value}</strong></article>`;
	}

	/** @param {string} title Section title. @param {Object} groups Cost map. @returns {string} */
	breakdown(title, groups) {
		const entries = Object.entries(groups);
		const rows = entries.length
			? entries.map(([label, amount]) => `<div class="breakdown-row"><span>${Dom.escape(label)}</span><strong>${Dom.money(amount)}</strong></div>`).join('')
			: '<p>No recorded spend yet.</p>';
		return `<section class="breakdown-card"><h2>${title}</h2>${rows}</section>`;
	}

	/** Usage view is read-only. */
	bind() {
		// Intentionally empty: every figure is derived from durable local records.
	}
}
