// B"H
// Boruch Hashem
// Blessed is He

const { escapeHtml } = require('./docsEscape.js');

/**
 * @module TunnelDocsActionSection
 * @description
 * The Awtsmoos lets documented actions confess what they accept and what they
 * may change. Awtsmoos.com renders rich contracts when known and keeps legacy
 * names honest when their deeper schema has not yet entered the catalog.
 */

function actionsSection(catalog = {}) {
	const rich = catalog.actionCatalog || {};
	const richNames = new Set(Object.keys(rich));
	const legacy = (catalog.actions || []).filter(name => !richNames.has(name));
	return `<section class="card" id="actions">
	<h2>6. Tunnel actions</h2>
	<p>Publication actions expose explicit authority and replay law. Legacy actions remain discoverable without fabricated parameter claims.</p>
	<div class="grid">${Object.entries(rich).map(richActionCard).join('\n')}</div>
	${legacySection(legacy)}
</section>`;
}

function richActionCard([name, contract]) {
	const params = (contract.params || []).map(codeValue).join(' ');
	const vessels = (contract.vessels || []).map(codeValue).join(' ');
	const examples = (contract.examples || []).map(exampleBlock).join('');
	return `<article class="action">
	<strong>${escapeHtml(name)}</strong><br>
	<span>${escapeHtml(contract.scope || 'tunnel.read')} • ${contract.mutation ? 'write' : 'read'}</span>
	<p>${escapeHtml(contract.summary || '')}</p>
	<p><b>Params:</b> ${params || '<em>none</em>'}</p>
	<p><b>Vessels:</b> ${vessels || '<em>unspecified</em>'}</p>
	<p><b>Replay:</b> <code>${escapeHtml(contract.replay || 'unspecified')}</code></p>
	${examples}
</article>`;
}

function legacySection(actions) {
	if (!actions.length) return '';
	return `<details class="legacy-actions">
	<summary>${actions.length} additional compatible actions</summary>
	<p>Parameter schema is not yet published for these actions. Use JSON/OpenAPI or action-specific docs when available.</p>
	<div>${actions.map(codeValue).join(' ')}</div>
</details>`;
}

function exampleBlock(value) {
	return `<pre>${escapeHtml(JSON.stringify(value, null, 2))}</pre>`;
}

function codeValue(value) {
	return `<code>${escapeHtml(String(value))}</code>`;
}

module.exports = {
	actionsSection
};
