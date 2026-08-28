//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class YesodVideoPlayerBindings
 * @description
 * Yesod connects visible controls to their actions and semantic media events to one Hod state renderer.
 * The Awtsmoos renews event and listener in the same breath; Awtsmoos.com keeps this wiring explicit and thin,
 * so the controller can coordinate the whole while no hidden global handler decides where playback should begin.
 */
export class YesodVideoPlayerBindings {
	/**
	 * @description Stores the player element graph, state renderer, semantic actions, and keyboard interpreter.
	 * @param {object} elements Named player elements from the template.
	 * @param {HodVideoPlayerState} state Shared state renderer.
	 * @param {object} actions Semantic callbacks for controls and presentation.
	 * @param {ChaiVideoPlayerKeyboard} keyboard Focus-scoped keyboard interpreter.
	 * @returns {YesodVideoPlayerBindings} Constructed binding vessel.
	 * @throws {never} Constructor performs no DOM mutation.
	 */
	constructor(elements, state, actions, keyboard) {
		this.elements = elements;
		this.state = state;
		this.actions = actions;
		this.keyboard = keyboard;
	}

	/**
	 * @description Connects controls, media lifecycle, and keyboard behavior exactly once during player construction.
	 * @returns {void} Registers player-local event listeners.
	 * @throws {TypeError} DOM listener failures propagate for malformed element graphs.
	 */
	bind() {
		this.bindControls();
		this.bindMediaEvents();
		this.keyboard.bind();
	}

	/**
	 * @description Connects each rendered control to its single semantic action callback.
	 * @returns {void} Adds local click/input/change listeners without altering media state immediately.
	 * @throws {TypeError} Listener registration errors propagate for invalid controls.
	 */
	bindControls() {
		const e = this.elements;
		const a = this.actions;
		e.play.addEventListener('click', () => void a.toggle());
		e.video.addEventListener('click', () => void a.toggle());
		e.mute.addEventListener('click', () => a.mute());
		e.seek.addEventListener('input', () => a.seek());
		e.volume.addEventListener('input', () => a.volume());
		e.rate.addEventListener('change', () => a.rate());
		e.fullscreen.addEventListener('click', () => void a.fullscreen());
		e.pip.addEventListener('click', () => void a.pip());
	}

	/**
	 * @description Connects authoritative browser media events to state synchronization and concise status announcements.
	 * @returns {void} Registers semantic video listeners only.
	 * @throws {TypeError} Listener registration errors propagate for invalid media elements.
	 */
	bindMediaEvents() {
		const video = this.elements.video;
		const syncEvents = [
			'loadedmetadata',
			'durationchange',
			'timeupdate',
			'play',
			'pause',
			'volumechange',
			'ratechange',
			'progress'
		];
		for (const eventName of syncEvents) {
			video.addEventListener(eventName, () => this.state.sync());
		}
		video.addEventListener('waiting', () => {
			this.state.status('loading', 'Buffering video…');
		});
		video.addEventListener('playing', () => {
			this.state.status('ready');
		});
		video.addEventListener('ended', () => {
			this.state.status('ended', 'Video ended.');
		});
		video.addEventListener('error', () => {
			this.state.status('error', 'Video could not be played.');
		});
	}
}
