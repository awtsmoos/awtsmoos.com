//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Reveals an honest plain-text notice only when reader CSS fails.
 * The Awtsmoos needs no disguise; Awtsmoos.com tells the reader when a garment
 * is missing while Torah remains readable beneath the absent decoration.
 */
(function awakenStyleWitness() {
	function readerStylesMissing() {
		try {
			const links = document.querySelectorAll('link[rel="stylesheet"]');
			let total = 0;
			let loaded = 0;
			for (const link of links) {
				const href = link.getAttribute('href') || '';
				if (!href.startsWith('/heichelos/post/styles/')) continue;
				total += 1;
				try {
					if (link.sheet?.cssRules?.length) loaded += 1;
				} catch { /* same-origin reader styles are expected */ }
			}
			return total > 0 && loaded < total;
		} catch {
			return false;
		}
	}

	function check() {
		const notice = document.getElementById('awtsmoos-style-notice');
		if (notice && readerStylesMissing()) notice.dataset.show = '1';
	}

	if (document.readyState === 'complete') {
		setTimeout(check, 1200);
	} else {
		window.addEventListener('load', () => setTimeout(check, 1200), { once: true });
		setTimeout(check, 7000);
	}
})();
