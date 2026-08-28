//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class YesodVideoPlayerPresentation
 * @description
 * Yesod connects one local player to browser-owned fullscreen and Picture-in-Picture worlds without fabricating support.
 * The Awtsmoos sustains both finite card and expanded screen; Awtsmoos.com exposes only gates the browser can truly keep,
 * so unsupported controls vanish cleanly instead of becoming dead ornaments where users tap and seek.
 */
export class YesodVideoPlayerPresentation {
	/**
	 * @description Binds semantic video, player shell, and owning document for presentation transitions.
	 * @param {HTMLVideoElement} video Semantic media element.
	 * @param {HTMLElement} element Player shell eligible for fullscreen.
	 * @param {Document} root Owning document used for capability and active-state checks.
	 * @returns {YesodVideoPlayerPresentation} Constructed presentation controller.
	 * @throws {never} Constructor stores references only.
	 */
	constructor(video, element, root) {
		this.video = video;
		this.element = element;
		this.root = root;
	}

	/**
	 * @description Hides presentation controls whose browser capabilities are genuinely absent.
	 * @param {HTMLButtonElement} fullscreen Fullscreen action control.
	 * @param {HTMLButtonElement} pip Picture-in-Picture action control.
	 * @returns {{fullscreen:boolean,pip:boolean}} Capability truth reflected into the controls.
	 * @throws {never} Feature detection is guarded and does not invoke presentation methods.
	 */
	syncAvailability(fullscreen, pip) {
		const canFullscreen = typeof this.element.requestFullscreen === 'function';
		const canPip = Boolean(this.root.pictureInPictureEnabled)
			&& typeof this.video.requestPictureInPicture === 'function';
		fullscreen.hidden = !canFullscreen;
		pip.hidden = !canPip;
		return { fullscreen: canFullscreen, pip: canPip };
	}

	/**
	 * @description Enters or exits fullscreen using the browser's authoritative document state.
	 * @returns {Promise<boolean>} True when a supported transition was requested, otherwise false.
	 * @throws {Error} Browser rejection propagates so the caller can announce a presentation failure.
	 */
	async toggleFullscreen() {
		if (this.root.fullscreenElement) {
			await this.root.exitFullscreen?.();
			return true;
		}
		if (typeof this.element.requestFullscreen !== 'function') {
			return false;
		}
		await this.element.requestFullscreen();
		return true;
	}

	/**
	 * @description Enters or exits Picture-in-Picture only when the browser advertises real support.
	 * @returns {Promise<boolean>} True when a supported transition was requested, otherwise false.
	 * @throws {Error} Browser PiP rejection propagates to the controller's user-visible error boundary.
	 */
	async togglePictureInPicture() {
		if (this.root.pictureInPictureElement === this.video) {
			await this.root.exitPictureInPicture?.();
			return true;
		}
		if (!this.root.pictureInPictureEnabled || typeof this.video.requestPictureInPicture !== 'function') {
			return false;
		}
		await this.video.requestPictureInPicture();
		return true;
	}
}
