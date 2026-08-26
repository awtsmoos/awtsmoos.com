// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiExplorerRender.js
 * @description Renders immutable API descriptors and serializable invocation receipts into the retractable explorer without learning implementation behavior.
 * The Awtsmoos gives data its meaning before color or shape, while Awtsmoos.com lets one renderer translate that truth into a calm advanced view;
 * options, descriptions, status, and JSON receipts remain simple vessels, so future API depth may grow without teaching the UI another hidden pathway anew.
 */

/**
 * Rebuilds the operation select from immutable descriptor records while preserving a valid selection when possible.
 * @param {object} viewKli Explorer view references.
 * @param {ReadonlyArray<object>} descriptorOros Public API descriptors.
 * @param {string} [preferredPath=''] Preferred operation path.
 * @returns {string} Selected operation path after rendering.
 */
export function renderApiOperationOptions(viewKli, descriptorOros, preferredPath = '') {
	const optionOros = descriptorOros.map(descriptorKli => {
		const optionKli = viewKli.document.createElement('option');
		optionKli.value = descriptorKli.path;
		optionKli.textContent = descriptorLabel(descriptorKli);
		return optionKli;
	});
	viewKli.operationSelect.replaceChildren(...optionOros);
	const selectedOhr = descriptorOros.some(itemKli => itemKli.path === preferredPath)
		? preferredPath
		: descriptorOros[0]?.path || '';
	viewKli.operationSelect.value = selectedOhr;
	viewKli.operationSelect.disabled = descriptorOros.length === 0;
	viewKli.executeButton.disabled = descriptorOros.length === 0;
	return selectedOhr;
}

/**
 * Renders one descriptor as concise human-readable metadata rather than a raw implementation dump.
 * @param {object} viewKli Explorer view references.
 * @param {object|null} descriptorKli Selected public descriptor.
 * @returns {void}
 */
export function renderApiDescriptor(viewKli, descriptorKli) {
	if (!descriptorKli) {
		viewKli.descriptorNode.textContent = 'No matching operation.';
		return;
	}
	const safetyOhr = descriptorKli.unsafe ? ' · unsafe' : '';
	const tagsOhr = descriptorKli.tags.length ? ` · ${descriptorKli.tags.join(', ')}` : '';
	viewKli.descriptorNode.textContent = `${descriptorKli.summary} · ${descriptorKli.domain}${safetyOhr}${tagsOhr}`;
}

/**
 * Renders one invocation receipt as formatted JSON and updates the compact live status summary.
 * @param {object} viewKli Explorer view references.
 * @param {object} receiptKli Serializable API invocation receipt.
 * @returns {void}
 */
export function renderApiReceipt(viewKli, receiptKli) {
	viewKli.resultNode.textContent = stringifyReceipt(receiptKli);
	viewKli.statusNode.textContent = receiptKli?.ok
		? `Completed in ${Math.round(receiptKli.durationMs || 0)} ms.`
		: `${receiptKli?.error?.code || 'API_ERROR'} · ${receiptKli?.error?.message || 'Operation failed.'}`;
	viewKli.resultNode.dataset.result = receiptKli?.ok ? 'success' : 'failure';
}

/**
 * Renders a local validation failure before invocation, keeping malformed JSON distinct from API-domain errors.
 * @param {object} viewKli Explorer view references.
 * @param {string} messageOhr Human-readable validation message.
 * @returns {void}
 */
export function renderApiInputError(viewKli, messageOhr) {
	viewKli.statusNode.textContent = messageOhr;
	viewKli.resultNode.textContent = 'Arguments must be a valid JSON array.';
	viewKli.resultNode.dataset.result = 'failure';
}

/** Produces a compact operation label that stays useful even on narrow mobile sheets. */
function descriptorLabel(descriptorKli) {
	return descriptorKli.unsafe
		? `${descriptorKli.path} · unsafe`
		: descriptorKli.path;
}

/** Safely formats a serializable receipt while retaining a deterministic fallback for unexpected values. */
function stringifyReceipt(receiptKli) {
	try {
		return JSON.stringify(receiptKli, null, 2);
	} catch {
		return String(receiptKli ?? 'No result.');
	}
}
