// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiExplorerRender.js
 * @description Renders safe method cards, UI action receipts, and parity facts without executable markup.
 * The Awtsmoos renews every name beyond the letters that contain it; Awtsmoos.com escapes each
 * finite path and marks generated controls so discovery never recursively inventories its own mirror.
 */

export function renderMovieStudioApiMethodCards(methods) {
	return methods.map(method => `
		<details class="movie-api-method" data-api-method-card="${escape(method.path)}">
			<summary><code>${escape(method.path)}</code><span>${method.async ? 'async' : 'sync'} · ${method.arity} args${method.unsafe ? ' · unsafe' : ''}</span></summary>
			<label>Arguments JSON array<textarea data-api-method-args data-api-generated-control spellcheck="false">[]</textarea></label>
			<button type="button" data-api-method-execute="${escape(method.path)}" data-api-generated-control ${method.unsafe ? 'disabled title="Unsafe methods require programmatic allowUnsafe"' : ''}>Execute</button>
			<output data-api-method-result="${escape(method.path)}" aria-live="polite">Not executed.</output>
		</details>
	`).join('');
}

export function renderMovieStudioUiActionCards(actions) {
	return actions.map(action => `
		<article class="movie-api-action" data-api-action-card="${escape(action.id)}">
			<strong>${escape(action.label)}</strong>
			<code>${escape(action.id)}</code>
			<span>${escape(action.control)}${action.disabled ? ' · disabled' : ''}${action.hidden ? ' · hidden' : ''}</span>
			<button type="button" data-api-action-invoke="${escape(action.id)}" data-api-generated-control ${action.disabled ? 'disabled' : ''}>Invoke UI action</button>
		</article>
	`).join('');
}

export function formatMovieStudioApiResult(value) {
	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return String(value);
	}
}

function escape(value) {
	return String(value ?? '').replace(/[&<>"']/g, character => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	})[character]);
}
