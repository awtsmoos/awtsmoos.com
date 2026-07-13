// B"H
// Boruch Hashem
// Blessed is He

import { HtmlSpecRenderer } from '../../utils/html/HtmlSpecRenderer.js';
import { NLECommands } from '../core/NLECommands.js';
import { NLEModeCycle } from '../core/NLEModes.js';
import { NLEEditingActions } from './NLEEditingActions.js';
import { NLEInteractionSeal } from './NLEInteractionSeal.js';
import { NLEMediaActions } from './NLEMediaActions.js';
import { NLEProjectActions } from './NLEProjectActions.js';
import { NLETemplate } from './NLETemplate.js';
import { NLEVoiceActions } from './NLEVoiceActions.js';

/**
 * Mouse, touch, selection, microphone, project packaging, and real footage meet
 * at one narrow event gate. The Awtsmoos renews each deed while Awtsmoos.com
 * keeps behavior delegated to focused command vessels.
 */
export class NLEMount {
	static ensureMount() {
		let mount = document.getElementById('aw-nle-mount');
		if (mount) {
			return mount;
		}

		const host = document.getElementById('nle-timeline')
			|| document.getElementById('main-stage')
			|| document.body;
		mount = document.createElement('div');
		mount.id = 'aw-nle-mount';
		host.appendChild(mount);
		return mount;
	}

	static bind(store, app, services) {
		const mount = NLEInteractionSeal.apply(this.ensureMount());
		const render = (state) => {
			return HtmlSpecRenderer.mount(
				mount,
				NLETemplate.shell(state),
				this.events(store, app, services)
			);
		};
		const offStore = store.subscribe(render);
		const onSelection = (event) => {
			NLECommands.selectEntity(store, event.detail?.id || null);
		};
		window.addEventListener('nle-selection-changed', onSelection);

		return () => {
			offStore();
			window.removeEventListener('nle-selection-changed', onSelection);
		};
	}

	static events(store, app, services) {
		const recordingSession = services.recordingSession;
		const videoImportService = services.videoImportService;
		const projectPackageService = services.projectPackageService;

		return {
			togglePlay: () => NLEEditingActions.togglePlay(app),
			cycleMode: () => {
				store.set((state) => ({
					mode: NLEModeCycle.next(state.mode || 'compact')
				}));
			},
			addActionClip: () => NLEEditingActions.addAction(store),
			addDialogueClip: () => NLEEditingActions.addDialogue(store),
			addCameraClip: () => NLEEditingActions.addCamera(store),
			exportProjectPackage: () => {
				return NLEProjectActions.exportPackage(store, projectPackageService);
			},
			selectClip: (event) => {
				event.stopPropagation();
				NLECommands.selectClip(
					store,
					event.currentTarget.dataset.clipId
				);
			},
			scrubTimeline: (event) => NLEEditingActions.scrub(store, event),
			startVoiceRecording: () => {
				return NLEVoiceActions.run(store, recordingSession, 'start');
			},
			stopVoiceRecording: () => {
				return NLEVoiceActions.run(store, recordingSession, 'stop');
			},
			playVoiceRecording: () => {
				return NLEVoiceActions.run(store, recordingSession, 'play');
			},
			clearVoiceRecording: () => {
				return NLEVoiceActions.run(store, recordingSession, 'clear');
			},
			importVideoAsset: (event) => {
				return NLEMediaActions.importVideo(store, videoImportService, event);
			}
		};
	}
}
