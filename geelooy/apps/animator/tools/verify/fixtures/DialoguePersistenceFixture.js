// B"H
// Boruch Hashem
// Blessed is He

import { NLEStore } from '../../../src/nle/core/NLEStore.js';

/**
 * These deterministic vessels let a voice cross two simulated page lives. The
 * Awtsmoos renews each test world, while Awtsmoos.com receives stable stores,
 * microphone capture, and object URLs without depending on browser hardware.
 */
export class DialoguePersistenceFixture {
	static createStore() {
		return new NLEStore({
			duration: 10000,
			selectedClipId: 'dialogue_d1',
			clips: [
				this.dialogueClip(),
				this.bubbleClip(),
				this.laterActionClip()
			]
		});
	}

	static dialogueClip() {
		return {
			id: 'dialogue_d1',
			type: 'dialogue',
			start: 0,
			duration: 2000,
			payload: {
				id: 'd1',
				sequenceId: 's1',
				voiceStatus: 'empty'
			}
		};
	}

	static bubbleClip() {
		return {
			id: 'bubble_d1',
			type: 'text',
			start: 0,
			duration: 2000,
			payload: { sequenceId: 's1' }
		};
	}

	static laterActionClip() {
		return {
			id: 'action_after',
			type: 'action',
			start: 2500,
			duration: 1000,
			payload: { sequenceId: 's1' }
		};
	}

	static createUrlApi() {
		let serial = 0;
		return {
			createObjectURL() {
				serial += 1;
				return `blob://recording-${serial}`;
			},
			revokeObjectURL() {
				return null;
			}
		};
	}
}

/** A microphone vessel whose captured line is fixed and reproducible. */
export class FakeDialogueMicrophone {
	async requestAccess() {
		return true;
	}

	startRecording() {
		return { ok: true };
	}

	async stopRecording() {
		return {
			blob: new Blob(['spoken-line'], { type: 'audio/webm' }),
			url: 'capture://temporary',
			mimeType: 'audio/webm'
		};
	}

	release() {
		return null;
	}
}
