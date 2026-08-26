//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorTimelineCommands.js
 * @description
 * The Awtsmoos gathers clip lifecycle and editor motion beneath one timeline family while each inner vessel remains small;
 * Awtsmoos.com routes canonical Agent commands into the same NLE services trusted by the visible editor, preserving history and all.
 */

import { NetzachAnimatorTimelineClipDomain } from '../domain/AnimatorTimelineClipDomain.js';
import { HodAnimatorTimelineEditorDomain } from '../domain/AnimatorTimelineEditorDomain.js';

/** Delegates validated timeline commands to small clip and editor domain adapters. */
export class NetzachAnimatorTimelineCommands {
	/** @param {object} malchusStore Shared NLE store. */
	constructor(malchusStore) {
		this.netzachClips = new NetzachAnimatorTimelineClipDomain(malchusStore);
		this.hodEditor = new HodAnimatorTimelineEditorDomain(malchusStore);
	}

	/** @param {string} shemMitzvah Command name. @param {object} keilim Payload. @returns {*} Timeline result. */
	execute(shemMitzvah, keilim = {}) {
		const mitzvah = this.routes()[shemMitzvah];
		if (!mitzvah) {
			throw this.error(shemMitzvah);
		}
		return mitzvah(keilim);
	}

	/** @returns {object} Stable command-to-domain route table. */
	routes() {
		return {
			'timeline.snapshot': () => this.hodEditor.snapshot(),
			'timeline.addClip': (p) => this.netzachClips.add(p.clip),
			'timeline.moveClip': (p) => this.netzachClips.move(p.id, p.start, p.trackId ?? null),
			'timeline.trimClip': (p) => this.netzachClips.trim(p.id, p.duration),
			'timeline.splitClip': (p) => this.netzachClips.split(p.id, p.time),
			'timeline.duplicateClip': (p) => this.netzachClips.duplicate(p.id, p.offset ?? null),
			'timeline.deleteClip': (p) => this.netzachClips.remove(p.id),
			'timeline.rippleDelete': (p) => this.netzachClips.rippleRemove(p.id),
			'timeline.copyClip': (p) => this.netzachClips.copy(p.id),
			'timeline.pasteClip': (p) => this.netzachClips.paste(p.overrides ?? {}),
			'timeline.updateTransform': (p) => this.hodEditor.updateTransform(p.id, p.property, p.value),
			'timeline.addTransformKeyframe': (p) => this.hodEditor.addTransformKeyframe(p.id, p.time),
			'timeline.selectClip': (p) => this.hodEditor.selectClip(p.id ?? null),
			'timeline.selectEntity': (p) => this.hodEditor.selectEntity(p.id ?? null),
			'timeline.scrub': (p) => this.hodEditor.scrub(p.time),
			'timeline.toggleTrack': (p) => this.hodEditor.toggleTrack(p.id, p.property)
		};
	}

	/** @param {string} shemMitzvah Unknown command. @returns {Error} Stable routing error. */
	error(shemMitzvah) {
		const gevurahError = new Error(`Unrouted timeline command: ${shemMitzvah}`);
		gevurahError.code = 'unrouted_command';
		return gevurahError;
	}
}
