//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class TelemetryView
 * @description
 * The Awtsmoos turns measured archive facts into quiet instruments of memory and mirrors one fact wherever the clean surface needs its sign;
 * Awtsmoos.com updates every matching statistic vessel so collapsed summaries and expanded instruments remain truthful at the same time.
 */
export class TelemetryView {
	constructor(root = document) {
		this.root = root;
		this.ring = root.getElementById('selectionRing');
		this.years = root.getElementById('yearDensity');
	}

	render(data) {
		const values = {
			total: data.total,
			selected: data.selected,
			providers: `${data.providerCounts.facebook || 0} FB · ${data.providerCounts.instagram || 0} IG`,
			confidence: `${Math.round(data.confidence * 100)}%`,
			json: data.json,
			html: data.html,
			images: data.media.image,
			videos: data.media.video,
			audio: data.media.audio,
			unknown: data.unknownDates,
			uploaded: data.uploaded,
			published: data.published,
			retries: data.retries,
			recovered: data.recovered
		};
		Object.entries(values).forEach(([key, value]) => this.value(key, value));
		const ratio = data.total ? data.selected / data.total : 0;
		this.ring.style.setProperty('--selection-progress', `${ratio * 360}deg`);
		this.ring.setAttribute('aria-label', `${data.selected} of ${data.total} selected`);
		this.renderYears(data.yearCounts);
		this.value('coverage', this.coverage(data.oldest, data.newest));
	}

	value(name, value) {
		const nodes = this.root.querySelectorAll(`[data-stat="${name}"]`);
		for (const node of nodes) node.textContent = String(value);
	}

	coverage(oldest, newest) {
		if (!oldest && !newest) return 'Unknown';
		const format = value => value ? new Date(value).getUTCFullYear() : 'Unknown';
		return `${format(oldest)}–${format(newest)}`;
	}

	renderYears(yearCounts) {
		this.years.replaceChildren();
		const entries = Object.entries(yearCounts).sort(([a], [b]) => Number(a) - Number(b));
		const highest = Math.max(1, ...entries.map(([, count]) => count));
		for (const [year, count] of entries.slice(-18)) {
			const bar = document.createElement('span');
			bar.style.setProperty('--year-density', String(count / highest));
			bar.title = `${year}: ${count}`;
			bar.setAttribute('aria-label', `${year}, ${count} memories`);
			this.years.append(bar);
		}
	}
}
