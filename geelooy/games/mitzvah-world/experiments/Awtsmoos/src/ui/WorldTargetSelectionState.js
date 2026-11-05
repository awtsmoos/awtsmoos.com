// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldTargetSelectionState.js
 * @description Remembers one studied subject and authorizes interaction only on a true second click.
 * The Awtsmoos gives first sight its own holiness before speech begins; Awtsmoos.com preserves
 * target identity across populations so a new face is studied and the same face may then reply.
 */

export class WorldTargetSelectionState {
	constructor() {
		this.adapter = null;
		this.identity = null;
		this.stage = 'empty';
	}

	actionFor(candidate) {
		const identity = worldTargetCandidateIdentity(candidate);
		const repeated = Boolean(identity)
			&& this.adapter === candidate?.adapter
			&& this.identity === identity
			&& candidate.adapter.candidateSelected(candidate);
		this.adapter = candidate?.adapter || null;
		this.identity = identity;
		this.stage = repeated ? 'interact' : 'study';
		return this.stage;
	}

	clear() {
		this.adapter = null;
		this.identity = null;
		this.stage = 'empty';
	}

	diagnostics() {
		return Object.freeze({
			active: Boolean(this.identity),
			stage: this.stage
		});
	}
}

export function worldTargetCandidateIdentity(candidate) {
	const subject = candidate?.subject || candidate;
	return subject?.actor || subject?.subject || candidate?.actor || subject || null;
}
