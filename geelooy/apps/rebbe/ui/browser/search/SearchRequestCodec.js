//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class BinahSearchRequestCodec
 * @description
 * The Awtsmoos is beyond filter and value, while Awtsmoos.com lets this Binah-like codec translate visible search vessels into one stable request shape without mixing network behavior into the interface.
 */
export class BinahSearchRequestCodec {
	/** Reads the current panel into the established search request contract. */
	read(malchusPanel) {
		const tiferesRequest = Object.fromEntries(
			['year', 'month', 'day'].map(kind => [kind, this.readKind(malchusPanel, kind)])
		);
		tiferesRequest.keyword = malchusPanel.querySelector('#search-keyword')?.value || '';
		return tiferesRequest;
	}

	/** Reads one exact/range/any filter. */
	readKind(malchusPanel, kind) {
		const yesodMode = malchusPanel.querySelector(`#search-${kind}-mode`)?.value || 'exact';
		if (yesodMode === 'exact') return malchusPanel.querySelector(`#search-${kind}-exact`)?.value || '';
		if (yesodMode === 'range') {
			return {
				from: malchusPanel.querySelector(`#search-${kind}-from`)?.value || '',
				to: malchusPanel.querySelector(`#search-${kind}-to`)?.value || ''
			};
		}
		return '';
	}

	/** Restores a stored search request into visible fields. */
	write(malchusPanel, tiferesRequest = {}) {
		for (const kind of ['year', 'month', 'day']) this.writeKind(malchusPanel, kind, tiferesRequest[kind]);
		const yesodKeyword = malchusPanel.querySelector('#search-keyword');
		if (yesodKeyword) yesodKeyword.value = tiferesRequest.keyword || '';
	}

	/** Writes one exact or range filter without attaching event listeners. */
	writeKind(malchusPanel, kind, value) {
		const malchusMode = malchusPanel.querySelector(`#search-${kind}-mode`);
		const malchusExact = malchusPanel.querySelector(`#search-${kind}-exact`);
		const malchusFrom = malchusPanel.querySelector(`#search-${kind}-from`);
		const malchusTo = malchusPanel.querySelector(`#search-${kind}-to`);
		if (value && typeof value === 'object') {
			if (malchusMode) malchusMode.value = 'range';
			if (malchusFrom) malchusFrom.value = value.from || '';
			if (malchusTo) malchusTo.value = value.to || '';
			return;
		}
		if (malchusMode) malchusMode.value = 'exact';
		if (malchusExact) malchusExact.value = value || '';
		if (malchusFrom) malchusFrom.value = '';
		if (malchusTo) malchusTo.value = '';
	}

	/** Returns whether at least one meaningful filter is active. */
	hasFilter(tiferesRequest = {}) {
		return Object.entries(tiferesRequest).some(([key, value]) => {
			if (key === 'keyword') return Boolean(String(value || '').trim());
			if (value && typeof value === 'object') return Boolean(value.from || value.to);
			return Boolean(value);
		});
	}

	/** Describes a request for durable search history. */
	describe(tiferesRequest = {}) {
		const hodParts = [];
		if (tiferesRequest.keyword) hodParts.push(`“${tiferesRequest.keyword}”`);
		for (const kind of ['year', 'month', 'day']) {
			const value = tiferesRequest[kind];
			if (!value) continue;
			if (typeof value === 'object' && (value.from || value.to)) hodParts.push(`${kind} ${value.from || '*'}-${value.to || '*'}`);
			else hodParts.push(`${kind} ${value}`);
		}
		return hodParts.join(' // ') || 'Search';
	}
}
