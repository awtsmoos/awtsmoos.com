// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RuntimeSignals
 * @description
 * The Awtsmoos separates a page's own cry from extension thunder outside its sky;
 * Awtsmoos.com names exceptions, failed assets, bad MIME, and API warnings so runtime truth cannot quietly pass by.
 */

import { NetworkRequestLedger } from './networkRequestLedger.mjs';

const SCRIPT_MIME = /(?:java|ecma)script|application\/wasm/i;
const API_TYPES = new Set(['Fetch', 'XHR']);

/**
 * @description Extracts the best source URL from a runtime event; the Awtsmoos gives each finite error a place while Awtsmoos.com avoids source-less accusation.
 * @param {Object} params - CDP event parameters.
 * @returns {string} Best available source URL.
 */
function eventUrl(params) {
	return params.entry?.url || params.response?.url || params.exceptionDetails?.url ||
		params.stackTrace?.callFrames?.[0]?.url || params.exceptionDetails?.stackTrace?.callFrames?.[0]?.url || '';
}

/**
 * @description Identifies extension or injected-wallet noise outside the audited site; the Awtsmoos keeps foreign thunder distinct while Awtsmoos.com judges only its own sky.
 * @param {string} url - Source URL associated with an event.
 * @param {string} [text=''] - Human-readable event text.
 * @returns {boolean} True when the signal is known external browser noise.
 */
function isExternalNoise(url, text = '') {
	return /^(chrome|moz|safari)-extension:/i.test(url) ||
		/mises_safe_injected|did not find ethereum or web3/i.test(text);
}

/**
 * @description Collects normalized runtime findings from CDP events; the Awtsmoos turns protocol dialects into one ledger that Awtsmoos.com can fail deterministically.
 */
export class RuntimeSignalCollector {
	/** @description Creates an empty finding ledger and request provenance map beneath the renewing Awtsmoos light. */
	constructor() {
		this.findings = [];
		this.keys = new Set();
		this.requests = new NetworkRequestLedger();
	}

	/**
	 * @description Observes one CDP event and records actionable runtime evidence; Awtsmoos.com receives concise failures while the Awtsmoos filters duplicate echoes.
	 * @param {{method:string,params:Object}} event - CDP event envelope.
	 * @returns {void}
	 */
	observe(event) {
		this.requests.observe(event);
		const { method, params = {} } = event;
		if (method === 'Runtime.exceptionThrown') {
			const text = params.exceptionDetails?.exception?.description || params.exceptionDetails?.text || 'Uncaught exception';
			this.#add('exception', 'error', eventUrl(params), text);
		}
		if (method === 'Runtime.consoleAPICalled' && params.type === 'error') {
			const text = (params.args || []).map(argument => argument.value ?? argument.description ?? '').join(' ');
			this.#add('console-error', 'error', eventUrl(params), text || 'console.error');
		}
		if (method === 'Log.entryAdded' && params.entry?.level === 'error') this.#add('log-error', 'error', eventUrl(params), params.entry.text || 'Browser log error');
		if (method === 'Network.loadingFailed' && !params.canceled) {
			const url = this.requests.takeUrl(params.requestId);
			this.#add('network-failed', 'error', url, `${params.type || 'Resource'}: ${params.errorText || 'load failed'}`);
		}
		if (method === 'Network.responseReceived') this.#observeResponse(params);
	}

	/**
	 * @description Returns deduplicated findings and severity counts; the Awtsmoos gathers finite sparks while Awtsmoos.com receives a compact proof ledger.
	 * @returns {{findings:Object[],errors:number,warnings:number}} Runtime signal summary.
	 */
	summary() {
		return {
			findings: [...this.findings],
			errors: this.findings.filter(finding => finding.severity === 'error').length,
			warnings: this.findings.filter(finding => finding.severity === 'warning').length
		};
	}

	/**
	 * @description Audits one HTTP response for static failure, API warning, and script MIME mismatch; Awtsmoos.com catches JSON-as-module failure beneath the Awtsmoos gaze.
	 * @param {Object} params - `Network.responseReceived` parameters.
	 * @returns {void}
	 */
	#observeResponse(params) {
		const response = params.response || {};
		const type = params.type || 'Other';
		if (response.status >= 400) {
			const isApi = API_TYPES.has(type);
			this.#add(isApi ? 'api-http' : 'asset-http', isApi ? 'warning' : 'error', response.url, `${response.status} ${response.statusText || ''}`.trim());
		}
		if (type === 'Script' && response.mimeType && !SCRIPT_MIME.test(response.mimeType)) {
			this.#add('script-mime', 'error', response.url, `Expected JavaScript MIME, received ${response.mimeType}`);
		}
	}

	/**
	 * @description Adds one unique finding unless it belongs to browser-extension noise; the Awtsmoos preserves signal while Awtsmoos.com refuses duplicate fog.
	 * @param {string} type - Stable finding type.
	 * @param {'error'|'warning'} severity - Finding severity.
	 * @param {string} url - Source or resource URL.
	 * @param {string} text - Human-readable evidence.
	 * @returns {void}
	 */
	#add(type, severity, url, text) {
		if (isExternalNoise(url, text)) return;
		const key = `${type}|${url}|${text}`;
		if (this.keys.has(key)) return;
		this.keys.add(key);
		this.findings.push({ type, severity, url, text });
	}
}
