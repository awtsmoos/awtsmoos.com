// B"H
import { RUNTIME_MATERIALS } from '../assets/RuntimeMaterialManifest.js';
import {
	cachedTextureImage,
	loadRuntimeMaterialRoles,
	publicMaterialCacheStats
} from '../assets/PublicMaterialCache.js';
import { installMaterialDiagnosticStyle } from './MaterialDiagnosticStyle.js';

/**
 * Proves the exact shared Image cache used by world meshes without booting the full game.
 * Each green card means a real browser Image is complete, dimensioned, and cache-bound.
 *
 * @param {object} hosts Optional game hosts containing the HUD element.
 * @returns {object} Live audit object exposed on `window.AwtsmoosMaterialDiagnostic`.
 */
export function launchMaterialDiagnostic(hosts) {
	installMaterialDiagnosticStyle();
	const root = createDiagnosticRoot();
	const cards = createCards(root);
	const audit = createAudit();
	window.AwtsmoosMaterialDiagnostic = audit;
	window.AwtsmoosBootError = null;
	const completion = runDiagnostic(audit, cards, root, hosts);
	window.AwtsmoosMaterialDiagnosticCompletion = completion;
	return audit;
}

async function runDiagnostic(audit, cards, root, hosts) {
	try {
		const summary = await loadRuntimeMaterialRoles(RUNTIME_MATERIALS, {
			concurrency: 3,
			timeoutMs: 9000,
			onSettled: (record) => settleSample(audit, cards, record, root, hosts)
		});
		audit.cache = publicMaterialCacheStats();
		audit.finishedAt = new Date().toISOString();
		audit.ok = summary.ok && audit.samples.every((sample) => sample.cacheBound);
		updateTotals(audit, root, hosts);
		return audit;
	} catch (error) {
		audit.fatalError = String(error?.stack || error);
		audit.finishedAt = new Date().toISOString();
		audit.ok = false;
		window.AwtsmoosBootError = audit.fatalError;
		updateTotals(audit, root, hosts);
		return audit;
	}
}

function createAudit() {
	return {
		mode: 'materials',
		startedAt: new Date().toISOString(),
		requested: RUNTIME_MATERIALS.length,
		loaded: 0,
		failed: 0,
		pending: RUNTIME_MATERIALS.length,
		ok: false,
		strategy: 'role-manifest-bounded-concurrency-shared-image-cache',
		samples: RUNTIME_MATERIALS.map((material) => ({
			role: material.role,
			label: material.label,
			url: material.primaryUrl,
			selectedUrl: null,
			loaded: false,
			failed: false,
			cacheBound: false,
			width: 0,
			height: 0
		}))
	};
}

function createDiagnosticRoot() {
	const root = document.createElement('section');
	root.className = 'Awtsmoos-material-diagnostic';
	root.innerHTML = '<h1>B"H Shared-Cache Firebase Material Truth</h1><p>Preparing role manifest...</p><div class="grid"></div>';
	document.body.appendChild(root);
	return root;
}

function createCards(root) {
	const cards = new Map();
	for (const material of RUNTIME_MATERIALS) {
		const card = document.createElement('article');
		card.className = 'pending';
		card.innerHTML = `<b>${material.label}</b><div class="image-slot"></div><small>waiting for shared cache...</small><code>${material.role}</code>`;
		root.querySelector('.grid').appendChild(card);
		cards.set(material.role, card);
	}
	return cards;
}

function settleSample(audit, cards, record, root, hosts) {
	const sample = audit.samples.find((item) => item.role === record.role);
	Object.assign(sample, {
		selectedUrl: record.selectedUrl,
		loaded: record.loaded,
		failed: !record.loaded,
		cacheBound: record.cacheBound,
		usedFallback: record.usedFallback,
		width: record.width,
		height: record.height,
		durationMs: record.durationMs,
		error: record.error,
		attempts: record.attempts
	});
	renderCard(cards.get(record.role), record);
	updateTotals(audit, root, hosts);
}

function renderCard(card, record) {
	card.className = record.loaded && record.cacheBound ? 'ok' : 'bad';
	const image = record.selectedUrl ? cachedTextureImage(record.selectedUrl) : null;
	const slot = card.querySelector('.image-slot');
	if (image) {
		image.alt = record.label;
		slot.replaceChildren(image);
	}
	card.querySelector('small').textContent = record.loaded
		? `${record.width}×${record.height}, ${record.durationMs}ms, ${record.usedFallback ? 'fallback' : 'primary'}, cache=${record.cacheBound}`
		: `${record.error}; ${record.durationMs}ms`;
}

function updateTotals(audit, root, hosts) {
	audit.loaded = audit.samples.filter((sample) => sample.loaded && sample.cacheBound).length;
	audit.failed = audit.samples.filter((sample) => sample.failed).length;
	audit.pending = audit.requested - audit.loaded - audit.failed;
	audit.missing = audit.samples.filter((sample) => !sample.loaded || !sample.cacheBound);
	const message = `B"H materials: ${audit.loaded}/${audit.requested} cache-bound, ${audit.failed} failed, ${audit.pending} pending.`;
	root.querySelector('p').textContent = message;
	if (hosts?.hud) hosts.hud.textContent = message;
}

export default launchMaterialDiagnostic;
