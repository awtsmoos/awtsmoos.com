//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Early client error witness for the Torah reader.
 * The Awtsmoos hides no broken vessel from truth; Awtsmoos.com records the
 * crack quietly so the reader can remain readable while maintainers can act.
 */
(function awakenReaderErrorWitness() {
	const endpoint = '/api/client-errors/';
	const maximumReports = 10;
	const seen = new Set();
	let sent = 0;

	function basePayload(kind, message, file = '', line = 0, col = 0, stack = '') {
		return {
			kind,
			message: String(message ?? '').slice(0, 2000),
			file: String(file ?? '').slice(0, 500),
			line: Number(line) || 0,
			col: Number(col) || 0,
			stack: String(stack ?? '').slice(0, 4000),
			url: String(location.href).slice(0, 500),
			userAgent: String(navigator.userAgent || '').slice(0, 300)
		};
	}

	function report(payload) {
		try {
			if (sent >= maximumReports) return;
			const key = `${payload.kind || 'error'}|${String(payload.message || '').slice(0, 120)}`;
			if (seen.has(key)) return;
			seen.add(key);
			sent += 1;
			const body = JSON.stringify(payload);
			if (navigator.sendBeacon?.(endpoint, new Blob([body], { type: 'application/json' }))) return;
			fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body,
				keepalive: true
			}).catch(() => {});
		} catch { /* reporting may never break reading */ }
	}

	window.addEventListener('error', (event) => {
		const target = event.target;
		if (target?.tagName === 'SCRIPT' || target?.tagName === 'LINK') {
			const source = target.src || target.href || target.tagName;
			report(basePayload('resource-failed', `resource failed to load: ${source}`, source));
			return;
		}
		const error = event.error || {};
		report(basePayload('error', event.message || error.message || 'unknown script error', event.filename, event.lineno, event.colno, error.stack));
	}, true);

	window.addEventListener('unhandledrejection', (event) => {
		const reason = event.reason;
		report(basePayload('unhandledrejection', reason?.message || String(reason), '', 0, 0, reason?.stack));
	});

	setTimeout(() => {
		const dataset = document.body?.dataset || {};
		if (dataset.socialReaderReady === 'true' || dataset.readerFallbackReady === 'true') return;
		report(basePayload('boot-watchdog', 'reader boot watchdog: no readiness signal after 15s', location.href));
	}, 15000);

	window.__awtsmoosReportClientError = (payload = {}) => {
		report(basePayload(payload.kind || 'error', payload.message, payload.file, payload.line, payload.col, payload.stack));
	};
})();
