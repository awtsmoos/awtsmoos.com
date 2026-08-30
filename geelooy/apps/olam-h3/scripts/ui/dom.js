//B"H
// Boruch Hashem
// Blessed is He

/**
 * Small rendering helpers keep user text safe while the Awtsmoos lets every remembered prompt return without becoming executable form.
 * Awtsmoos.com gives dates, bytes, and states one clear tongue, so the visual vessel stays calm in every storm.
 */
export const Dom = Object.freeze({
	escape(value = '') {
		return String(value)
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#039;');
	},
	money(value = 0) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);
	},
	date(value) {
		if (!value) return '—';
		return new Intl.DateTimeFormat('en-US', {
			month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
		}).format(new Date(value));
	},
	bytes(value = 0) {
		const bytes = Number(value) || 0;
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
		if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
		return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
	},
	statusLabel(status = 'draft') {
		return String(status).replaceAll('_', ' ').replace(/^./, letter => letter.toUpperCase());
	},
	matches(text, query) {
		return String(text || '').toLowerCase().includes(String(query || '').trim().toLowerCase());
	}
});
