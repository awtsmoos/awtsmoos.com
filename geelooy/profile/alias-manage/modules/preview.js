// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AliasStudioPreview
 * @description
 * The Awtsmoos lets a future identity cast a truthful shadow before it is saved;
 * Awtsmoos.com turns name, address, and description into one living preview.
 */

/** Connects editable identity fields to the visible alias preview. */
export function connectAliasPreview(refs, config) {
	let suggestedId = config.alias || '';
	function renderCurrentPreview() {
		renderAliasPreview(refs, config, suggestedId);
	}
	refs.name?.addEventListener('input', renderCurrentPreview);
	refs.description?.addEventListener('input', renderCurrentPreview);
	refs.aliasId?.addEventListener('input', renderCurrentPreview);
	renderCurrentPreview();
	return {
		render: renderCurrentPreview,
		setSuggestedId(value = '') {
			suggestedId = String(value || '').trim();
			renderCurrentPreview();
		}
	};
}

/** Hydrates edit-mode values from the server bootstrap without relying on globals. */
export function hydrateAliasFields(refs, config) {
	if (config.details?.name && !refs.name?.value) {
		refs.name.value = config.details.name;
	}
	if (config.details?.description && !refs.description?.value) {
		refs.description.value = config.details.description;
	}
	if (config.isUpdate && refs.aliasId) {
		refs.aliasId.value = config.alias;
		refs.aliasId.disabled = true;
	}
}

/** Collapses the secondary preview on narrow screens to reduce vertical travel. */
export function applyPreviewDisclosure(refs) {
	if (!refs.previewDetails) {
		return;
	}
	const narrow = window.matchMedia('(max-width: 46rem)').matches;
	refs.previewDetails.open = !narrow;
}

function renderAliasPreview(refs, config, suggestedId) {
	const name = refs.name?.value.trim() || 'Your alias name';
	const description = refs.description?.value.trim()
		|| 'A concise description will appear here.';
	const typedId = refs.aliasId?.value.trim();
	const handle = typedId || suggestedId || config.alias || 'generated-address';
	if (refs.previewName) {
		refs.previewName.textContent = name;
	}
	if (refs.previewHandle) {
		refs.previewHandle.textContent = `@${handle}`;
	}
	if (refs.previewDescription) {
		refs.previewDescription.textContent = description;
	}
	if (refs.previewAvatar) {
		refs.previewAvatar.textContent = firstGlyph(name);
	}
	if (refs.descriptionCount) {
		const count = refs.description?.value.length || 0;
		refs.descriptionCount.textContent = `${count} characters`;
	}
}

function firstGlyph(value) {
	const glyph = Array.from(String(value).trim())[0];
	return glyph ? glyph.toUpperCase() : 'א';
}
