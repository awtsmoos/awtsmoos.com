// B"H
// Boruch Hashem
// Blessed is He
/** @module AliasStudioPreview — a future identity casts a truthful shadow
 * before it is saved: name, address, and description in one living preview. */
import { setAliasStudioStatus } from './actions.js';

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

/**
 * B"H round 3: when update mode arrives without bootstrap values, fetch the
 * account's alias details and hydrate from the matching record. Round 4:
 * the stand-down needed BOTH fields — bootstrap name alone suppressed the
 * fetch, so About never filled. Hydrate whenever either field is missing.
 */
export async function hydrateAliasFieldsFromServer(refs, config, preview) {
	if (!config.isUpdate || !config.alias) return;
	if (config.details?.name && config.details?.description) return;
	const record = await fetchOwnedAliasRecord(config.alias);
	if (!record) {
		setAliasStudioStatus(refs.status, 'error',
			'Current values could not be loaded. Check your connection before saving.');
		return;
	}
	hydrateAliasFields(refs, { ...config, details: record });
	preview?.render();
	// B"H 2026-11-20 round 5: a synthetic profile payload means the
	// server's identity read failed under load — the description very
	// likely exists but could not be fetched. Never leave that as a
	// silent empty About (round-5 recheck: name filled, About empty,
	// no message); say plainly that it did not load.
	if (record.descriptionUnresolved && !refs.description?.value) {
		setAliasStudioStatus(refs.status, 'error',
			'Your name loaded, but the current description could not be loaded. Check your connection before saving.');
	}
}

/** Reads the public description, retrying transient synthetic payloads. */
async function fetchPublicDescription(alias) {
	for (let attempt = 0; attempt < 3; attempt += 1) {
		if (attempt > 0) await new Promise(resolve => setTimeout(resolve, 1200 * attempt));
		const profileResponse = await fetch(`/api/social/profile/${encodeURIComponent(alias)}`, { credentials: 'include' }).catch(() => null);
		const payload = await profileResponse?.json().catch(() => null);
		const data = payload && payload.ok && 'data' in payload ? payload.data : payload && 'success' in payload ? payload.success : payload;
		if (data && !data.synthetic) {
			return { description: data?.alias?.description || data?.profile?.bio || '', unresolved: false };
		}
	}
	return { description: '', unresolved: true };
}

async function fetchOwnedAliasRecord(alias) {
	for (let attempt = 0; attempt < 2; attempt += 1) {
		try {
			const controller = new AbortController();
			const timer = setTimeout(() => controller.abort(), 20000);
			const response = await fetch('/api/social/aliases/details', { credentials: 'include', signal: controller.signal });
			clearTimeout(timer);
			const data = await response.json().catch(() => null);
			const list = Array.isArray(data) ? data : Array.isArray(data?.success) ? data.success : [];
			const found = list.find(item => String(item?.id || item?.aliasId || '') === alias);
			if (!found) return null;
			const record = { name: found.name || found.displayName || '', description: found.description || found.bio || '' };
			// B"H round 4: this per-user mirror carries name + aliasId only;
			// About lives in the alias info record the public profile renders.
			// B"H round 5: the profile endpoint answers with a SYNTHETIC
			// identity (empty description) whenever its identity read fails
			// under load — a transient state, verified against the live
			// endpoint. Retry it like the details leg above; only a
			// non-synthetic payload proves anything about the description.
			if (!record.description) {
				const merged = await fetchPublicDescription(alias);
				record.description = merged.description;
				if (merged.unresolved) record.descriptionUnresolved = true;
			}
			return record;
		} catch {
			if (attempt === 0) await new Promise(resolve => setTimeout(resolve, 1200));
		}
	}
	return null;
}

/** Collapses the secondary preview on narrow screens to reduce vertical travel. */
export function applyPreviewDisclosure(refs) {
	if (!refs.previewDetails) return;
	const narrow = window.matchMedia('(max-width: 46rem)').matches;
	refs.previewDetails.open = !narrow;
}

function renderAliasPreview(refs, config, suggestedId) {
	const name = refs.name?.value.trim() || 'Your alias name';
	const description = refs.description?.value.trim()
		|| 'A concise description will appear here.';
	const typedId = refs.aliasId?.value.trim();
	const handle = typedId || suggestedId || config.alias || 'generated-address';
	if (refs.previewName) refs.previewName.textContent = name;
	if (refs.previewHandle) refs.previewHandle.textContent = `@${handle}`;
	if (refs.previewDescription) refs.previewDescription.textContent = description;
	if (refs.previewAvatar) refs.previewAvatar.textContent = firstGlyph(name);
	if (refs.descriptionCount) {
		const count = refs.description?.value.length || 0;
		refs.descriptionCount.textContent = `${count} characters`;
	}
}

function firstGlyph(value) {
	const glyph = Array.from(String(value).trim())[0];
	return glyph ? glyph.toUpperCase() : 'א';
}
