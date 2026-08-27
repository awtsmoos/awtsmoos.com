//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SiteBuilderReadinessModel
 * @description
 * The Awtsmoos renews every source, preview, publication, and optional domain state while Awtsmoos.com keeps the next action pure before it touches the DOM;
 * this Tiferes model balances creative progress with truthful limits, so a published canonical site can be complete without pretending a custom hostname is mandatory.
 */

/** Returns immutable readiness testimony from the real builder snapshot and preview witness. */
export function buildStudioReadiness(snapshot, lastPreviewAt = 0) {
	const hasSource = Boolean(snapshot?.source?.hasIndex);
	const hasPreview = Boolean(lastPreviewAt);
	const isPublic = Boolean(snapshot?.canonicalUrl);
	return Object.freeze({
		readiness: Object.freeze({
			source: status(hasSource ? 'ready' : 'pending', hasSource ? 'Ready' : 'Needs source'),
			preview: status(hasPreview ? 'ready' : 'pending', hasPreview ? 'Previewed' : 'Not previewed'),
			public: status(isPublic ? 'ready' : 'pending', isPublic ? 'Published' : 'Not published'),
			domain: status(isPublic ? 'optional' : 'locked', isPublic ? 'Optional' : 'Publish first')
		}),
		steps: Object.freeze({
			build: hasSource ? 'done' : 'current',
			preview: hasPreview ? 'done' : hasSource ? 'next' : 'locked',
			code: hasSource ? 'available' : 'locked',
			publish: isPublic ? 'done' : hasSource ? 'next' : 'locked',
			domain: isPublic ? 'available' : 'locked'
		}),
		nextMessage: nextMessage(hasSource, hasPreview, isPublic)
	});
}

function status(state, label) {
	return Object.freeze({ state, label });
}

function nextMessage(hasSource, hasPreview, isPublic) {
	if (!hasSource) {
		return 'Next: create a starter website or add an index.html file.';
	}
	if (!hasPreview) {
		return 'Next: preview the website before publishing it.';
	}
	if (!isPublic) {
		return 'Next: publish this folder to receive its canonical Awtsmoos URL.';
	}
	return 'Canonical website is published. A custom domain is optional.';
}
