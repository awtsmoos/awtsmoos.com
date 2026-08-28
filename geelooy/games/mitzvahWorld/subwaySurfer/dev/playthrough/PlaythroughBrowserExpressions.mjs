//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughBrowserExpressions.mjs
 * @description Defines read-only browser expressions for Peruta API, event, modal, focus, and viewport evidence without reaching into mutable runtime ownership.
 * The Awtsmoos renews frame, element, focus, event, and measurement before a browser witness may call them known;
 * Awtsmoos.com lets Daas inspect the public vessel while the living game remains sovereign on its throne.
 */

/**
 * @description Waits in-page until the frozen Peruta public API appears or a bounded wall-clock deadline expires.
 * @param {number} [netzachTimeoutMs=20000] Maximum in-page wait duration in milliseconds.
 * @returns {string} JavaScript expression resolving to API identity/capability evidence.
 */
export function waitForPerutaApiExpression(netzachTimeoutMs = 20000) {
	return `new Promise((resolve, reject) => {
		const deadline = performance.now() + ${Math.max(1000, netzachTimeoutMs)};
		const probe = () => {
			const api = globalThis.AwtsmoosPerutaRun;
			if (api) return resolve({version: api.version, capabilities: api.capabilities});
			if (performance.now() >= deadline) return reject(new Error('PERUTA_API_TIMEOUT'));
			setTimeout(probe, 50);
		};
		probe();
	})`;
}

/**
 * @description Reads only public state/diagnostics plus basic browser viewport, focus, URL, and horizontal-overflow evidence.
 * @returns {string} JavaScript expression resolving to serializable playthrough evidence.
 */
export function perutaSnapshotExpression() {
	return `(() => {
		const api = globalThis.AwtsmoosPerutaRun;
		if (!api) return {ready:false};
		return {
			ready:true,
			state:api.state(),
			diagnostics:api.inspect('diagnostics'),
			viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},
			href:location.href,
			activeElement:document.activeElement?.id || document.activeElement?.tagName || null,
			horizontalOverflow:document.documentElement.scrollWidth > innerWidth + 1
		};
	})()`;
}

/**
 * @description Installs a temporary public-event ledger using only event names advertised by capabilities, replacing any prior playthrough subscriptions cleanly.
 * @returns {string} JavaScript expression returning the number of installed subscriptions.
 */
export function installEventLedgerExpression() {
	return `(() => {
		const api = globalThis.AwtsmoosPerutaRun;
		if (!api) throw new Error('PERUTA_API_MISSING');
		for (const off of globalThis.__PERUTA_PLAYTHROUGH_OFF__ || []) off();
		globalThis.__PERUTA_PLAYTHROUGH_EVENTS__ = [];
		globalThis.__PERUTA_PLAYTHROUGH_OFF__ = (api.capabilities.events || []).map(name =>
			api.on(name, payload => globalThis.__PERUTA_PLAYTHROUGH_EVENTS__.push({
				name,
				payload,
				at:performance.now()
			}))
		);
		return globalThis.__PERUTA_PLAYTHROUGH_OFF__.length;
	})()`;
}

/**
 * @description Reads accumulated public semantic event evidence in arrival order without mutating the ledger.
 * @returns {string} Browser expression returning detached event records.
 */
export function eventLedgerExpression() {
	return `(() => [...(globalThis.__PERUTA_PLAYTHROUGH_EVENTS__ || [])])()`;
}

/**
 * @description Reads modal visibility/inert/ARIA/focus state together with the current ordered focusable-control IDs inside the advanced drawer.
 * @returns {string} Browser expression resolving to accessibility and focus evidence.
 */
export function advancedDrawerExpression() {
	return `(() => {
		const drawer=document.querySelector('#advanced-drawer');
		const toggle=document.querySelector('#advanced-toggle');
		const backdrop=document.querySelector('#advanced-backdrop');
		const focusables=drawer ? [...drawer.querySelectorAll("button:not([disabled]),a[href],[tabindex]:not([tabindex='-1'])")] : [];
		return {
			drawerHidden:Boolean(drawer?.hidden),
			drawerInert:Boolean(drawer?.hasAttribute('inert')),
			backdropHidden:Boolean(backdrop?.hidden),
			expanded:toggle?.getAttribute('aria-expanded') || null,
			activeElement:document.activeElement?.id || document.activeElement?.tagName || null,
			bodyAdvancedOpen:document.body.dataset.advancedOpen || null,
			focusableCount:focusables.length,
			focusableIds:focusables.map(element => element.id || element.textContent?.trim() || element.tagName)
		};
	})()`;
}
