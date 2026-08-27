//B"H
//Boruch Hashem
//Blessed is He

import { buildVideoPlayer } from './VideoPlayerTemplate.js';
import { HodVideoPlayerState } from './VideoPlayerState.js';
import { YesodVideoPlayerPresentation } from './VideoPlayerPresentation.js';
import { ChaiVideoPlayerKeyboard } from './VideoPlayerKeyboard.js';
import { ChesedVideoTransportActions } from './ChesedVideoTransportActions.js';
import { GevurahVideoAudioRateActions } from './GevurahVideoAudioRateActions.js';
import { YesodVideoPlayerBindings } from './VideoPlayerBindings.js';

/**
 * @class TiferesVideoPlayerController
 * @description
 * Tiferes harmonizes semantic video, transport, sound, keyboard, presentation, and state without owning each detail.
 * The Awtsmoos renews every frame and every collaborator as one event; Awtsmoos.com lets this coordinator stay clear and bright,
 * so richer playback grows through composition rather than one controller swelling until architecture disappears from sight.
 */
export class TiferesVideoPlayerController {
	/**
	 * @description Creates one reusable Social Hub player and composes its focused behavioral vessels.
	 * @param {Document} [root=document] Owning browser document used for DOM and presentation capabilities.
	 * @returns {TiferesVideoPlayerController} Ready controller exposing `element`, `video`, and `setSource`.
	 * @throws {TypeError} DOM-construction errors propagate when the supplied root cannot build elements.
	 */
	constructor(root = document) {
		this.root = root;
		this.elements = buildVideoPlayer(root);
		this.element = this.elements.element;
		this.video = this.elements.video;
		this.state = new HodVideoPlayerState(this.elements);
		this.transport = new ChesedVideoTransportActions(this.video, this.elements, this.state);
		this.audioRate = new GevurahVideoAudioRateActions(this.video, this.elements, this.state);
		this.presentation = new YesodVideoPlayerPresentation(this.video, this.element, root);
		this.keyboard = new ChaiVideoPlayerKeyboard(this.element, this.keyboardActions());
		this.bindings = new YesodVideoPlayerBindings(this.elements, this.state, this.controlActions(), this.keyboard);
		this.bindings.bind();
		this.presentation.syncAvailability(this.elements.fullscreen, this.elements.pip);
		this.state.status('empty');
		this.state.sync();
	}

	/**
	 * @description Assigns one local or canonical source and returns the player to deterministic loading or empty state.
	 * @param {string} [url=''] Browser-readable media URL, including a local object URL.
	 * @returns {void} Pauses prior media, replaces the source, reloads metadata, and refreshes controls.
	 * @throws {never} Browser source failures surface asynchronously through the semantic media error event.
	 */
	setSource(url = '') {
		this.video.pause();
		this.video.removeAttribute('src');
		if (url) {
			this.video.src = String(url);
		}
		this.video.load();
		this.elements.seek.value = '0';
		this.state.status(url ? 'loading' : 'empty', url ? 'Loading video…' : '');
		this.state.sync();
	}

	/**
	 * @description Exposes semantic callbacks for visible controls without leaking collaborators into the binding layer.
	 * @returns {object} Transport, sound, rate, fullscreen, and PiP callbacks.
	 * @throws {never} Callback assembly performs no media operation until invocation.
	 */
	controlActions() {
		return {
			toggle: () => this.transport.toggle(),
			mute: () => this.audioRate.toggleMute(),
			seek: () => this.transport.seekNormalized(),
			volume: () => this.audioRate.setVolume(),
			rate: () => this.audioRate.setPlaybackRate(),
			fullscreen: () => this.togglePresentation('fullscreen'),
			pip: () => this.togglePresentation('pip')
		};
	}

	/**
	 * @description Exposes focus-scoped keyboard callbacks with signed seek deltas preserved explicitly.
	 * @returns {object} Keyboard action vocabulary consumed by `ChaiVideoPlayerKeyboard`.
	 * @throws {never} Callback assembly performs no action until a supported key is pressed.
	 */
	keyboardActions() {
		return {
			toggle: () => this.transport.toggle(),
			seekBy: (seconds) => this.transport.seekBy(seconds),
			mute: () => this.audioRate.toggleMute(),
			fullscreen: () => this.togglePresentation('fullscreen'),
			pip: () => this.togglePresentation('pip')
		};
	}

	/**
	 * @description Invokes one capability-tested browser presentation transition and communicates rejection visibly.
	 * @param {'fullscreen'|'pip'} kind Requested presentation mode.
	 * @returns {Promise<boolean>} True when a supported transition succeeds, otherwise false.
	 * @throws {never} Browser presentation rejection is translated into player status.
	 */
	async togglePresentation(kind) {
		try {
			if (kind === 'pip') {
				return await this.presentation.togglePictureInPicture();
			}
			return await this.presentation.toggleFullscreen();
		} catch {
			this.state.status('error', 'That presentation mode is unavailable right now.');
			return false;
		}
	}
}
