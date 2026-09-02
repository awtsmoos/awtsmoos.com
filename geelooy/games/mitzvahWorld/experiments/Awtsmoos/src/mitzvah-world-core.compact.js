//B"H

const __awtsmoosLiveImport = (resolve, name) => {
	const callable = function(...args) {
		const value = resolve()[name];
		if (new.target) return Reflect.construct(value, args, new.target);
		return Reflect.apply(value, this, args);
	};
	return new Proxy(callable, {
		apply(_target, thisArg, args) { return Reflect.apply(resolve()[name], thisArg, args); },
		construct(_target, args, newTarget) { return Reflect.construct(resolve()[name], args, newTarget); },
		get(_target, property) { const value = resolve()[name]; return value?.[property]; },
		set(_target, property, value) { const current = resolve()[name]; current[property] = value; return true; },
		has(_target, property) { const current = resolve()[name]; return property in current; },
		ownKeys() { return Reflect.ownKeys(resolve()[name]); }
	});
};
const __awtsmoosLiveNamespace = (resolve) => new Proxy(Object.create(null), {
	get(_target, property) { return resolve()[property]; },
	set(_target, property, value) { resolve()[property] = value; return true; },
	has(_target, property) { return property in resolve(); },
	ownKeys() { return Reflect.ownKeys(resolve()); },
	getOwnPropertyDescriptor(_target, property) {
		const descriptor = Object.getOwnPropertyDescriptor(resolve(), property);
		return descriptor ? { ...descriptor, configurable: true } : undefined;
	}
});

const __awtsmoosModule_2 = Object.create(null);

const __awtsmoosModule_3 = Object.create(null);

const __awtsmoosModule_5 = Object.create(null);

const __awtsmoosModule_4 = Object.create(null);

const __awtsmoosModule_7 = Object.create(null);

const __awtsmoosModule_8 = Object.create(null);

const __awtsmoosModule_6 = Object.create(null);

const __awtsmoosModule_1 = Object.create(null);

const __awtsmoosModule_9 = Object.create(null);

const __awtsmoosModule_12 = Object.create(null);

const __awtsmoosModule_13 = Object.create(null);

const __awtsmoosModule_14 = Object.create(null);

const __awtsmoosModule_15 = Object.create(null);

const __awtsmoosModule_17 = Object.create(null);

const __awtsmoosModule_18 = Object.create(null);

const __awtsmoosModule_16 = Object.create(null);

const __awtsmoosModule_19 = Object.create(null);

const __awtsmoosModule_11 = Object.create(null);

const __awtsmoosModule_10 = Object.create(null);

const __awtsmoosModule_25 = Object.create(null);

const __awtsmoosModule_26 = Object.create(null);

const __awtsmoosModule_27 = Object.create(null);

const __awtsmoosModule_28 = Object.create(null);

const __awtsmoosModule_24 = Object.create(null);

const __awtsmoosModule_29 = Object.create(null);

const __awtsmoosModule_30 = Object.create(null);

const __awtsmoosModule_23 = Object.create(null);

const __awtsmoosModule_31 = Object.create(null);

const __awtsmoosModule_32 = Object.create(null);

const __awtsmoosModule_33 = Object.create(null);

const __awtsmoosModule_22 = Object.create(null);

const __awtsmoosModule_34 = Object.create(null);

const __awtsmoosModule_35 = Object.create(null);

const __awtsmoosModule_21 = Object.create(null);

const __awtsmoosModule_37 = Object.create(null);

const __awtsmoosModule_36 = Object.create(null);

const __awtsmoosModule_38 = Object.create(null);

const __awtsmoosModule_39 = Object.create(null);

const __awtsmoosModule_43 = Object.create(null);

const __awtsmoosModule_42 = Object.create(null);

const __awtsmoosModule_45 = Object.create(null);

const __awtsmoosModule_47 = Object.create(null);

const __awtsmoosModule_46 = Object.create(null);

const __awtsmoosModule_44 = Object.create(null);

const __awtsmoosModule_41 = Object.create(null);

const __awtsmoosModule_49 = Object.create(null);

const __awtsmoosModule_48 = Object.create(null);

const __awtsmoosModule_40 = Object.create(null);

const __awtsmoosModule_50 = Object.create(null);

const __awtsmoosModule_55 = Object.create(null);

const __awtsmoosModule_54 = Object.create(null);

const __awtsmoosModule_57 = Object.create(null);

const __awtsmoosModule_56 = Object.create(null);

const __awtsmoosModule_53 = Object.create(null);

const __awtsmoosModule_58 = Object.create(null);

const __awtsmoosModule_52 = Object.create(null);

const __awtsmoosModule_59 = Object.create(null);

const __awtsmoosModule_62 = Object.create(null);

const __awtsmoosModule_61 = Object.create(null);

const __awtsmoosModule_60 = Object.create(null);

const __awtsmoosModule_64 = Object.create(null);

const __awtsmoosModule_63 = Object.create(null);

const __awtsmoosModule_51 = Object.create(null);

const __awtsmoosModule_20 = Object.create(null);

const __awtsmoosModule_65 = Object.create(null);

const __awtsmoosModule_67 = Object.create(null);

const __awtsmoosModule_68 = Object.create(null);

const __awtsmoosModule_69 = Object.create(null);

const __awtsmoosModule_72 = Object.create(null);

const __awtsmoosModule_71 = Object.create(null);

const __awtsmoosModule_73 = Object.create(null);

const __awtsmoosModule_75 = Object.create(null);

const __awtsmoosModule_76 = Object.create(null);

const __awtsmoosModule_77 = Object.create(null);

const __awtsmoosModule_78 = Object.create(null);

const __awtsmoosModule_80 = Object.create(null);

const __awtsmoosModule_79 = Object.create(null);

const __awtsmoosModule_82 = Object.create(null);

const __awtsmoosModule_83 = Object.create(null);

const __awtsmoosModule_85 = Object.create(null);

const __awtsmoosModule_84 = Object.create(null);

const __awtsmoosModule_86 = Object.create(null);

const __awtsmoosModule_81 = Object.create(null);

const __awtsmoosModule_87 = Object.create(null);

const __awtsmoosModule_74 = Object.create(null);

const __awtsmoosModule_70 = Object.create(null);

const __awtsmoosModule_88 = Object.create(null);

const __awtsmoosModule_66 = Object.create(null);

const __awtsmoosModule_0 = Object.create(null);

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapJourneyGuide.js ----
{
	const __exports = __awtsmoosModule_2;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapJourneyGuide.js
	 * @description Projects either first-footstep guidance or canonical quest truth into one compact story beat.
	 * The Awtsmoos lets the same small lantern carry dawn, mission, struggle, and return;
	 * Awtsmoos.com replaces tutorial walls with the one true next sentence the traveler has earned.
	 */

	const WALK_REVEAL_DISTANCE = 7;
	const JOURNEY_REVEAL_DISTANCE = 22;

	/** Remembers first position while yielding immediately to canonical quest truth when it appears. */
	class BootstrapJourneyGuide {
		/** @param {object} runtime Immediate or hydrated Mitzvah World runtime. */
		constructor(runtime) {
			this.runtime = runtime;
			this.origin = positionOf(runtime.state);
		}

		/** @returns {{eyebrow:string,objective:string,hint:string}} Current compact narrative beat. */
		describe() {
			const quest = this.runtime.quest;
			const snapshot = quest?.snapshot?.();
			return snapshot
				? questBeat(this.runtime, snapshot)
				: onboardingBeat(this.runtime, this.origin);
		}
	}


	__exports.BootstrapJourneyGuide = BootstrapJourneyGuide;
	function questBeat(runtime, snapshot) {
		const definition = snapshot.definition || runtime.quest?.definition || {};
		const giver = definition.giver || {};
		const story = definition.story || {};
		const beats = {
			active: () => beat(
				definition.name || 'The eastern road',
				snapshot.currentObjective?.description || 'Continue the Shlichus.',
				progressHint(snapshot)
			),
			available: () => availableQuestBeat(runtime, definition, giver, story),
			completed: () => beat(
				'Shlichus fulfilled',
				'The eastern road breathes again.',
				'Measured intention remains with you.'
			),
			ready: () => beat(
				definition.name || 'The eastern road',
				`Return to ${giver.name || 'Reb Mendel'}.`,
				'Bring the recovered vessels home.'
			)
		};
		return beats[snapshot.status]?.() || beats.active();
	}

	function availableQuestBeat(runtime, definition, giver, story) {
		if (runtime.directContextAction?.hasOffer?.()) {
			return beat(
				story.chapter || definition.name || 'A road waits',
				story.opening || 'The eastern road carries an unfamiliar rhythm.',
				`Begin ${definition.name || 'the Shlichus'}.`
			);
		}
		return beat(
			giver.name || 'Reb Mendel the Watchman',
			`Find ${giver.name || 'Reb Mendel'} and hear what changed on the eastern road.`,
			story.purpose || 'The road is waiting for deliberate action.'
		);
	}

	function progressHint(snapshot) {
		const objective = snapshot.currentObjective || {};
		if (Number.isFinite(objective.progress) && Number.isFinite(objective.count)) {
			return `${objective.progress}/${objective.count} · ${phaseLabel(snapshot.phase)}`;
		}
		return phaseLabel(snapshot.phase);
	}

	function phaseLabel(phase) {
		const labels = {
			completed: 'The road is restored',
			defeat: 'Read each threat before acting',
			recovery: 'Recover what remains',
			return: 'Return to Reb Mendel'
		};
		return labels[phase] || 'Follow the road with intention';
	}

	function onboardingBeat(runtime, origin) {
		const state = runtime.state || {};
		const target = runtime.enemies?.selected?.profile?.name;
		if (target) {
			return beat('A presence stirs', `Face ${target} when you are ready.`, 'Stay moving. Act when the opening is clear.');
		}
		const distance = distanceFrom(origin, positionOf(state));
		if (distance >= JOURNEY_REVEAL_DISTANCE) {
			return beat('The valley opens', 'Follow the road toward the homes ahead.', 'Explore freely. The world will answer what you approach.');
		}
		if (distance >= WALK_REVEAL_DISTANCE || state.moving) {
			return beat('The first path', 'Keep toward the cottages beyond the meadow.', 'Move with the floating stick. Jump only when you need it.');
		}
		return beat('The valley wakes', 'Walk forward and find the first home.', 'Touch anywhere in the left movement zone and slide.');
	}

	function beat(eyebrow, objective, hint) {
		return { eyebrow, objective, hint };
	}

	function positionOf(state = {}) {
		return { x: Number(state.x) || 0, z: Number(state.z) || 0 };
	}

	function distanceFrom(origin, position) {
		return Math.hypot(position.x - origin.x, position.z - origin.z);
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapControlsHudView.js ----
{
	const __exports = __awtsmoosModule_3;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapControlsHudView.js
	 * @description Owns only the compact journey-card DOM and marks it as the measured objective zone for direct mobile composition.
	 * The Awtsmoos gives the story a small translucent vessel while Awtsmoos.com gives that vessel one named shore above the road;
	 * words may renew without rebuilding DOM, and layout verification may measure the same objective the player actually beholds.
	 */

	const HUD_ID = 'AwtsmoosBootstrapControls';

	/** Owns the scoped first-play journey card and its three text nodes. */
	class BootstrapControlsHudView {
		/**
		 * @param {HTMLElement} gameRoot Mitzvah World root.
		 * @param {Document} documentValue Active document.
		 */
		constructor(gameRoot, documentValue) {
			this.gameRoot = gameRoot;
			this.document = documentValue;
			this.root = this.findOrCreateRoot();
			this.root.dataset.directHudZone = 'objective';
			this.nodes = this.resolveNodes();
		}

		/**
		 * Renders one story beat without allocating replacement nodes.
		 * @param {{eyebrow:string,hint:string,objective:string}} journey Current journey projection.
		 */
		render(journey) {
			this.nodes.eyebrow.textContent = journey.eyebrow;
			this.nodes.objective.textContent = journey.objective;
			this.nodes.hint.textContent = journey.hint;
		}

		/** Removes the owned card from the game root. */
		destroy() {
			this.root.remove();
		}

		findOrCreateRoot() {
			const existing = this.document.getElementById(HUD_ID);
			if (existing) {
				existing.replaceChildren(...this.createChildren());
				if (existing.parentElement !== this.gameRoot) {
					this.gameRoot.appendChild(existing);
				}
				return existing;
			}
			const root = this.document.createElement('section');
			root.id = HUD_ID;
			root.className = 'Awtsmoos-control-receipt';
			root.setAttribute('aria-live', 'polite');
			root.setAttribute('aria-label', 'Current journey');
			root.append(...this.createChildren());
			this.gameRoot.appendChild(root);
			return root;
		}

		createChildren() {
			return [
				this.storyNode('span', 'storyEyebrow'),
				this.storyNode('strong', 'storyObjective'),
				this.storyNode('small', 'storyHint')
			];
		}

		storyNode(tagName, dataName) {
			const node = this.document.createElement(tagName);
			node.dataset[dataName] = '';
			return node;
		}

		resolveNodes() {
			return {
				eyebrow: this.root.querySelector('[data-story-eyebrow]'),
				hint: this.root.querySelector('[data-story-hint]'),
				objective: this.root.querySelector('[data-story-objective]')
			};
		}
	}

	__exports.BootstrapControlsHudView = BootstrapControlsHudView;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/DirectWorldContextActionState.js ----
{
	const __exports = __awtsmoosModule_5;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file DirectWorldContextActionState.js
	 * @description Defines the tiny immutable vocabulary exposed by direct-world contextual interaction.
	 * The Awtsmoos lets many systems speak through four quiet words instead of a forest of buttons and bars;
	 * Awtsmoos.com keeps hidden, Talk, Begin, and Return as small vessels whose meaning stays stable beneath the stars.
	 */

	const HIDDEN_DIRECT_ACTION = Object.freeze({
		enabled: false,
		hint: '',
		kind: 'hidden',
		label: '',
		visible: false
	});


	__exports.HIDDEN_DIRECT_ACTION = HIDDEN_DIRECT_ACTION;
	/**
	 * Creates one immutable visible direct-world action description.
	 * @param {string} kind Stable action kind.
	 * @param {string} label Short button label.
	 * @param {string} hint Accessible contextual description.
	 * @returns {object} Immutable visible action state.
	 */
	function directActionState(kind, label, hint) {
		return Object.freeze({
			enabled: true,
			hint,
			kind,
			label,
			visible: true
		});
	}

	__exports.directActionState = directActionState;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/DirectWorldContextAction.js ----
{
	const __exports = __awtsmoosModule_4;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file DirectWorldContextAction.js
	 * @description Projects canonical NPC and quest truth into the one meaningful action direct play needs now.
	 * The Awtsmoos gathers hidden systems into a single deed instead of a permanent rail of choice;
	 * Awtsmoos.com lets Talk, Begin, and Return appear only when the living road gives that action a truthful voice.
	 */

	const directActionState = __awtsmoosModule_5.directActionState;
	const HIDDEN_DIRECT_ACTION = __awtsmoosModule_5.HIDDEN_DIRECT_ACTION;

	/** Coordinates existing friendly-NPC interaction and canonical quest transitions. */
	class DirectWorldContextAction {
		/** @param {object} runtime Staged Mitzvah World runtime. */
		constructor(runtime) {
			this.runtime = runtime;
			this.offeredQuestId = null;
			this.unsubscribeOffer = runtime.bus?.on?.('quest:offer', event => {
				this.captureOffer(event);
			}) || null;
		}

		/** @returns {object} The one action currently meaningful to direct play. */
		state() {
			const quest = this.runtime.quest;
			const snapshot = quest?.snapshot?.();
			if (!quest || !snapshot) {
				return HIDDEN_DIRECT_ACTION;
			}
			if (snapshot.status === 'available') {
				return this.availableState(quest);
			}
			if (snapshot.status === 'ready' && this.primaryNpcReady()) {
				return directActionState(
					'return',
					'Return',
					`Return to ${quest.definition.giver.name}`
				);
			}
			return HIDDEN_DIRECT_ACTION;
		}

		/** Activates exactly the currently resolved action. */
		activate() {
			const actions = {
				begin: () => this.beginQuest(),
				return: () => this.returnQuest(),
				talk: () => this.talkToPrimary()
			};
			return actions[this.state().kind]?.() ?? false;
		}

		/** Returns whether the canonical giver made the currently remembered offer. */
		hasOffer() {
			return Boolean(
				this.offeredQuestId
				&& this.offeredQuestId === this.runtime.quest?.definition?.id
			);
		}

		/** Removes event ownership without mutating quest or NPC truth. */
		destroy() {
			this.unsubscribeOffer?.();
			this.unsubscribeOffer = null;
		}

		availableState(quest) {
			if (this.hasOffer()) {
				return directActionState(
					'begin',
					'Begin',
					`Begin ${quest.definition.name}`
				);
			}
			return this.primaryNpcReady()
				? directActionState(
					'talk',
					'Talk',
					`Talk to ${quest.definition.giver.name}`
				)
				: HIDDEN_DIRECT_ACTION;
		}

		captureOffer(event = {}) {
			this.offeredQuestId = event.questId || event.definition?.id || event.id || null;
		}

		primaryNpcReady() {
			return Boolean(this.runtime.friendlyNpcs?.primary?.interactionDecision?.().ok);
		}

		talkToPrimary() {
			const population = this.runtime.friendlyNpcs;
			return population?.interactCandidate?.(population.primary) ?? false;
		}

		beginQuest() {
			if (!this.hasOffer()) {
				return false;
			}
			this.offeredQuestId = null;
			return this.runtime.quest.accept();
		}

		returnQuest() {
			this.talkToPrimary();
			return this.runtime.quest.complete();
		}
	}

	__exports.DirectWorldContextAction = DirectWorldContextAction;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/input/InputPresentationPolicy.js ----
{
	const __exports = __awtsmoosModule_7;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file InputPresentationPolicy.js
	 * @description Keeps global gameplay shortcuts quiet while the retractable advanced-control sheet owns the player's attention.
	 * The Awtsmoos gives every action its appointed moment while Awtsmoos.com prevents a hidden leap or context deed beneath an open control veil;
	 * one document marker separates direct play from advanced adjustment, so keyboard meaning remains clean, deliberate, and never stale.
	 */

	/**
	 * Returns whether the current document presentation temporarily suppresses gameplay shortcuts.
	 * @param {Document|HTMLElement|object} source Document-like or node-like source.
	 * @returns {boolean} True while advanced controls own interaction focus.
	 */
	function isGameplayInputSuppressed(source = globalThis.document) {
		const documentValue = source?.nodeType === 9
			? source
			: source?.ownerDocument || source?.document || globalThis.document;
		return documentValue?.documentElement?.dataset?.awtsmoosAdvancedControls === 'true';
	}

	__exports.isGameplayInputSuppressed = isGameplayInputSuppressed;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/input/InputTargetPolicy.js ----
{
	const __exports = __awtsmoosModule_8;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file InputTargetPolicy.js
	 * @description Names editable and interface targets that must remain outside world-control capture.
	 * The Awtsmoos grants each intention its honest vessel, so typing stays speech and touch stays choice;
	 * Awtsmoos.com keeps movement from swallowing the player's finite, meaningful interface voice.
	 */

	const EDITABLE_SELECTOR = [
		'input',
		'textarea',
		'select',
		'[contenteditable="true"]',
		'[role="textbox"]'
	].join(',');

	const EDITABLE_TAGS = new Set(['INPUT', 'SELECT', 'TEXTAREA']);

	const GAMEPLAY_UI_SELECTOR = [
		'.Awtsmoos-gameplay',
		'.Awtsmoos-inventory-panel',
		'.Awtsmoos-meadow-menu',
		'.Awtsmoos-mobile-joystick',
		'.Awtsmoos-jump-button'
	].join(',');

	/**
	 * Determines whether keyboard text belongs to an editable control.
	 *
	 * @param {EventTarget | null} target Event origin.
	 * @returns {boolean} True when gameplay shortcuts must yield.
	 */
	function isEditableTarget(target) {
		if (EDITABLE_TAGS.has(String(target?.tagName || '').toUpperCase())) {
			return true;
		}
		if (target?.isContentEditable || target?.getAttribute?.('role') === 'textbox') {
			return true;
		}
		return Boolean(target?.closest?.(EDITABLE_SELECTOR));
	}


	__exports.isEditableTarget = isEditableTarget;
	/**
	 * Determines whether pointer intent belongs to an owned interface surface.
	 *
	 * @param {EventTarget | null} target Event origin.
	 * @returns {boolean} True when camera and world movement must yield.
	 */
	function isGameplayUiTarget(target) {
		return Boolean(target?.closest?.(GAMEPLAY_UI_SELECTOR));
	}

	__exports.isGameplayUiTarget = isGameplayUiTarget;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/input/ContextActionButton.js ----
{
	const __exports = __awtsmoosModule_6;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file ContextActionButton.js
	 * @description Renders one contextual deed and silences its global E shortcut while advanced controls own interaction.
	 * The Awtsmoos reveals action only when purpose reaches the hand, while Awtsmoos.com keeps hidden gameplay from answering beneath an opened inner veil;
	 * one generous touch, one E-key covenant, and one presentation gate preserve simple surface play without accidental advanced-layer travail.
	 */

	const isGameplayInputSuppressed = __awtsmoosModule_7.isGameplayInputSuppressed;
	const isEditableTarget = __awtsmoosModule_8.isEditableTarget;

	/** Owns direct-world contextual action presentation and keyboard parity. */
	class ContextActionButton {
		/**
		 * @param {HTMLElement} host Game-root host.
		 * @param {object} contextAction Canonical contextual-action resolver.
		 * @param {Window|object} environment Browser-like environment.
		 */
		constructor(host, contextAction, environment = globalThis) {
			this.host = host;
			this.contextAction = contextAction;
			this.environment = environment;
			this.document = host?.ownerDocument || environment.document;
			this.button = this.createButton();
			this.onClick = () => this.activate();
			this.onKeyDown = event => this.keyDown(event);
			this.button.addEventListener('click', this.onClick);
			this.environment.addEventListener?.('keydown', this.onKeyDown);
			this.host.append(this.button);
			this.refresh();
		}

		/** Resolves and reflects the current world action without rebuilding DOM. */
		refresh() {
			const state = this.contextAction.state();
			this.button.hidden = !state.visible;
			this.button.disabled = !state.enabled;
			this.button.dataset.kind = state.kind;
			this.button.textContent = state.label;
			this.button.setAttribute('aria-label', state.hint || state.label || 'Context action');
			this.button.title = state.hint || '';
			return state;
		}

		/** Activates one action edge and immediately refreshes visible state. */
		activate() {
			const result = this.contextAction.activate();
			this.refresh();
			return result;
		}

		/** Removes listeners and the owned button without touching world state. */
		destroy() {
			this.button.removeEventListener('click', this.onClick);
			this.environment.removeEventListener?.('keydown', this.onKeyDown);
			this.button.remove();
		}

		createButton() {
			const button = this.document.createElement('button');
			button.className = 'Awtsmoos-context-action';
			button.type = 'button';
			button.dataset.directHudZone = 'context';
			button.setAttribute('aria-keyshortcuts', 'E');
			return button;
		}

		keyDown(event) {
			if (
				event.code !== 'KeyE'
				|| event.repeat
				|| isEditableTarget(event.target)
				|| isGameplayInputSuppressed(this.document)
				|| this.button.hidden
			) {
				return;
			}
			event.preventDefault();
			this.activate();
		}
	}

	__exports.ContextActionButton = ContextActionButton;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapControlsHud.js ----
{
	const __exports = __awtsmoosModule_1;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapControlsHud.js
	 * @description Coordinates one compact journey card and one optional contextual action for direct play.
	 * The Awtsmoos joins story and deed without building a wall between the traveler and sky;
	 * Awtsmoos.com keeps the center world untouched while one objective speaks and one useful action draws nigh.
	 */

	const BootstrapJourneyGuide = __awtsmoosModule_2.BootstrapJourneyGuide;
	const BootstrapControlsHudView = __awtsmoosModule_3.BootstrapControlsHudView;
	const DirectWorldContextAction = __awtsmoosModule_4.DirectWorldContextAction;
	const ContextActionButton = __awtsmoosModule_6.ContextActionButton;

	const GAME_ROOT_ID = 'mitzvah-world-root';

	/**
	 * Installs compact first-play story and direct-world contextual interaction.
	 * @param {object} runtime Immediate Mitzvah World runtime.
	 * @param {Document} documentValue Active document.
	 * @returns {object|null} Public HUD controller or null without the game root.
	 */
	function installBootstrapControlsHud(runtime, documentValue = globalThis.document) {
		const gameRoot = documentValue?.getElementById?.(GAME_ROOT_ID);
		if (!gameRoot) {
			return null;
		}
		runtime.bootstrapHud?.destroy?.();
		const environment = documentValue.defaultView || globalThis;
		const view = new BootstrapControlsHudView(gameRoot, documentValue);
		const contextAction = createContextAction(runtime);
		const actionButton = contextAction
			? new ContextActionButton(gameRoot, contextAction, environment)
			: null;
		if (contextAction) {
			runtime.directContextAction = contextAction;
		}
		const guide = new BootstrapJourneyGuide(runtime);
		const controller = createController(
			runtime,
			view,
			guide,
			contextAction,
			actionButton
		);
		runtime.bootstrapHud = controller;
		controller.refresh();
		return controller;
	}


	__exports.installBootstrapControlsHud = installBootstrapControlsHud;
	function createContextAction(runtime) {
		return runtime.options?.presentation === 'direct'
			? new DirectWorldContextAction(runtime)
			: null;
	}

	function createController(runtime, view, guide, contextAction, actionButton) {
		let destroyed = false;
		const controller = {
			actionButton,
			contextAction,
			guide,
			root: view.root,
			refresh() {
				if (destroyed) {
					return;
				}
				view.render(guide.describe());
				actionButton?.refresh?.();
			},
			destroy() {
				if (destroyed) {
					return;
				}
				destroyed = true;
				actionButton?.destroy?.();
				contextAction?.destroy?.();
				view.destroy();
				if (runtime.directContextAction === contextAction) {
					delete runtime.directContextAction;
				}
				if (runtime.bootstrapHud === controller) {
					delete runtime.bootstrapHud;
				}
			}
		};
		return controller;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowBootstrapCombat.js ----
{
	const __exports = __awtsmoosModule_9;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowBootstrapCombat.js
	 * @description Provides responsive actions, elapsed-time cooldowns, stamina truth, cancellation, and diagnostics.
	 * The Awtsmoos gives intention a working vessel before every effect garment descends;
	 * Awtsmoos.com keeps action identity, real time, stamina, cooldown, bus receipts, and replacement explicit.
	 */

	const ACTIONS = Object.freeze({
		'hebrew-fire': Object.freeze({ cooldown: 2.5, stamina: 18 }),
		'letter-light': Object.freeze({ cooldown: 1.85, stamina: 14 }),
		'guarded-thought': Object.freeze({ cooldown: 4.2, stamina: 12 }),
		'waters-of-purification': Object.freeze({ cooldown: 6, stamina: 16 })
	});

	class MinimalMeadowBootstrapCombat {
		constructor(runtime) {
			this.runtime = runtime;
			this.cooldowns = new Map();
			this.lastAction = null;
			this.lastRefresh = nowSeconds();
			this.suspended = false;
			this.unsubscribe = runtime.bus.on('combat:activate', request => {
				this.activate(request?.actionId);
			});
		}

		activate(actionId) {
			this.refresh();
			const action = ACTIONS[actionId];
			if (this.suspended || !action) return this.reject('ACTION_UNAVAILABLE');
			const now = nowSeconds();
			const readyAt = this.cooldowns.get(actionId) || 0;
			if (readyAt > now) return this.reject('ACTION_COOLDOWN');
			if (this.runtime.playerStats.stamina < action.stamina) {
				return this.reject('STAMINA_REQUIRED');
			}
			this.runtime.playerStats.stamina -= action.stamina;
			this.cooldowns.set(actionId, now + action.cooldown);
			this.lastAction = Object.freeze({ actionId, at: now });
			const receipt = Object.freeze({
				accepted: true,
				actionId,
				bootstrap: true,
				cooldown: action.cooldown
			});
			this.runtime.bus.emit('combat:bootstrap-action', receipt);
			return receipt;
		}

		update() {
			this.refresh();
			return this.diagnostics();
		}

		cancel(reason = 'CANCELLED') {
			this.runtime.bus.emit('combat:cancelled', {
				bootstrap: true,
				reason
			});
			return true;
		}

		diagnostics() {
			this.refresh();
			return Object.freeze({
				bootstrap: true,
				lastAction: this.lastAction,
				stamina: this.runtime.playerStats.stamina,
				suspended: this.suspended
			});
		}

		suspend() {
			this.suspended = true;
		}

		resume() {
			this.lastRefresh = nowSeconds();
			this.suspended = false;
		}

		destroy() {
			this.unsubscribe?.();
		}

		refresh() {
			const now = nowSeconds();
			const elapsed = Math.max(0, now - this.lastRefresh);
			this.lastRefresh = now;
			this.runtime.playerStats.stamina = Math.min(
				this.runtime.playerStats.maxStamina,
				this.runtime.playerStats.stamina + elapsed * 12
			);
		}

		reject(reason) {
			const receipt = Object.freeze({ accepted: false, reason });
			this.runtime.bus.emit('combat:rejected', receipt);
			return receipt;
		}
	}


	__exports.MinimalMeadowBootstrapCombat = MinimalMeadowBootstrapCombat;
	function nowSeconds() {
		const milliseconds = globalThis.performance?.now?.() ?? Date.now();
		return milliseconds / 1000;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/ui/WorldMinimapControls.js ----
{
	const __exports = __awtsmoosModule_12;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file WorldMinimapControls.js
	 * @description Binds compact, expanded, full-screen, and escape map transitions.
	 * The Awtsmoos gives one village three measured viewpoints; Awtsmoos.com keeps click,
	 * keyboard, labels, pressed state, and cleanup inside one finite control garment.
	 */

	function bindWorldMinimapControls(owner, documentValue) {
		const click = event => {
			if (event.target.closest('[data-map-expand]')) {
				owner.setMode(owner.mode === 'compact' ? 'expanded' : 'compact');
			}
			if (event.target.closest('[data-map-fullscreen]')) {
				owner.setMode(owner.mode === 'fullscreen' ? 'expanded' : 'fullscreen');
			}
		};
		const keydown = event => {
			if (event.key === 'Escape' && owner.mode === 'fullscreen') {
				owner.setMode('expanded');
			}
		};
		owner.root.addEventListener('click', click);
		documentValue.addEventListener('keydown', keydown);
		return {
			destroy() {
				owner.root.removeEventListener('click', click);
				documentValue.removeEventListener('keydown', keydown);
			}
		};
	}


	__exports.bindWorldMinimapControls = bindWorldMinimapControls;
	function updateWorldMinimapControls(root, mode) {
		const expanded = mode !== 'compact';
		const fullscreen = mode === 'fullscreen';
		const expandButton = root.querySelector('[data-map-expand]');
		const fullscreenButton = root.querySelector('[data-map-fullscreen]');
		expandButton.textContent = expanded ? 'Compact' : 'Expand';
		expandButton.setAttribute('aria-expanded', String(expanded));
		fullscreenButton.textContent = fullscreen ? 'Windowed' : 'Full map';
		fullscreenButton.setAttribute('aria-pressed', String(fullscreen));
	}

	__exports.updateWorldMinimapControls = updateWorldMinimapControls;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/ui/WorldMinimapProjection.js ----
{
	const __exports = __awtsmoosModule_13;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file WorldMinimapProjection.js
	 * @description Projects historical local/quest markers and optional current multiplayer peers.
	 * The Awtsmoos reveals position without replacing discovery; Awtsmoos.com clamps every vessel,
	 * preserves solo truth, and excludes the authoritative local identity from remote-player markers.
	 */

	const WORLD_MINIMAP_RADIUS = 210;


	__exports.WORLD_MINIMAP_RADIUS = WORLD_MINIMAP_RADIUS;
	function projectWorldMinimap(runtime) {
		const questSnapshot = runtime.adventures?.snapshot?.() || {};
		return {
			givers: (questSnapshot.available || [])
				.filter(record => record.definition?.giver?.position)
				.slice(0, 12)
				.map(record => markerRecord(
					'giver',
					record.definition.giver.position,
					record.definition.name,
					'!'
				)),
			objectives: (questSnapshot.active || []).flatMap(record => {
				const objective = record.objectives?.[record.objectiveIndex];
				return objective?.marker
					? [markerRecord('objective', objective.marker, objective.description, '◆')]
					: [];
			}),
			peers: remotePeers(runtime).map(player => markerRecord(
				'peer',
				player.position,
				player.displayName || 'Shared traveler',
				'●'
			)),
			player: markerRecord(
				'player',
				{ x: runtime.state?.x, z: runtime.state?.z },
				'You',
				'▲'
			)
		};
	}


	__exports.projectWorldMinimap = projectWorldMinimap;
	function worldMinimapPercentage(value) {
		const percentage = (Number(value || 0) + WORLD_MINIMAP_RADIUS)
			/ (WORLD_MINIMAP_RADIUS * 2)
			* 100;
		return Math.max(2, Math.min(98, percentage));
	}


	__exports.worldMinimapPercentage = worldMinimapPercentage;
	function markerRecord(kind, position = {}, label, icon) {
		return {
			icon,
			kind,
			label,
			left: worldMinimapPercentage(position.x),
			top: 100 - worldMinimapPercentage(position.z)
		};
	}

	function remotePeers(runtime) {
		const localPlayerId = runtime.state?.multiplayerLocalPlayerId;
		return (runtime.state?.multiplayer?.players || []).filter(player => {
			return player?.id
				&& player.id !== localPlayerId
				&& player.position
				&& player.connected !== false;
		});
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/ui/WorldMinimapRuntime.js ----
{
	const __exports = __awtsmoosModule_14;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file WorldMinimapRuntime.js
	 * @description Derives player position, peer signature, and replaceable quest-store subscription.
	 * The Awtsmoos renews map evidence only when a lawful source changes; Awtsmoos.com keeps
	 * runtime probing, late quest installation, peer movement, and cleanup outside the view owner.
	 */

	function worldMinimapPlayerPosition(runtime) {
		return {
			x: Number(runtime.state?.x || 0),
			z: Number(runtime.state?.z || 0)
		};
	}


	__exports.worldMinimapPlayerPosition = worldMinimapPlayerPosition;
	function worldMinimapPeerSignature(runtime) {
		return JSON.stringify({
			localPlayerId: runtime.state?.multiplayerLocalPlayerId || null,
			players: (runtime.state?.multiplayer?.players || []).map(player => [
				player.id,
				player.position?.x,
				player.position?.z,
				player.connected
			])
		});
	}


	__exports.worldMinimapPeerSignature = worldMinimapPeerSignature;
	function ensureWorldMinimapQuestSubscription(owner) {
		const source = owner.runtime.questStore || owner.runtime.adventures || null;
		if (source === owner.questSource) return false;
		owner.unsubscribeQuest();
		owner.questSource = source;
		owner.unsubscribeQuest = source?.onChange?.(() => owner.render(true)) || (() => {});
		return true;
	}

	__exports.ensureWorldMinimapQuestSubscription = ensureWorldMinimapQuestSubscription;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/ui/WorldMinimapState.js ----
{
	const __exports = __awtsmoosModule_15;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file WorldMinimapState.js
	 * @description Persists compact, expanded, or full-screen village-map preference safely.
	 * The Awtsmoos remembers one finite viewpoint without depending on storage; Awtsmoos.com
	 * preserves legacy expansion while denied, malformed, or absent persistence cannot block play.
	 */

	const MODE_KEY = 'Awtsmoos.mitzvahWorld.minimap.mode.v2';
	const LEGACY_KEY = 'Awtsmoos.mitzvahWorld.minimap.expanded.v1';
	const WORLD_MINIMAP_MODES = Object.freeze([
		'compact',
		'expanded',
		'fullscreen'
	]);


	__exports.WORLD_MINIMAP_MODES = WORLD_MINIMAP_MODES;
	function readWorldMinimapMode(storage) {
		try {
			const mode = storage?.getItem(MODE_KEY);
			if (WORLD_MINIMAP_MODES.includes(mode)) return mode;
			return storage?.getItem(LEGACY_KEY) === 'true' ? 'expanded' : 'compact';
		} catch {
			return 'compact';
		}
	}


	__exports.readWorldMinimapMode = readWorldMinimapMode;
	function writeWorldMinimapMode(storage, mode) {
		const value = WORLD_MINIMAP_MODES.includes(mode) ? mode : 'compact';
		try {
			storage?.setItem(MODE_KEY, value);
			storage?.setItem(LEGACY_KEY, String(value !== 'compact'));
		} catch {
			// The current map remains usable when persistence is denied.
		}
		return value;
	}


	__exports.writeWorldMinimapMode = writeWorldMinimapMode;
	function readWorldMinimapExpanded(storage) {
		return readWorldMinimapMode(storage) !== 'compact';
	}


	__exports.readWorldMinimapExpanded = readWorldMinimapExpanded;
	function writeWorldMinimapExpanded(storage, expanded) {
		return writeWorldMinimapMode(storage, expanded ? 'expanded' : 'compact');
	}

	__exports.writeWorldMinimapExpanded = writeWorldMinimapExpanded;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/ui/WorldMinimapLayoutCss.js ----
{
	const __exports = __awtsmoosModule_17;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file WorldMinimapLayoutCss.js
	 * @description Keeps the compact phone map at the upper-right edge while preserving full-size expanded and fullscreen cartography.
	 * The Awtsmoos folds a wide road into a small instrument without shrinking the hand that touches it;
	 * Awtsmoos.com keeps forty-eight-pixel actions beside a bounded map, then lets expanded space unfold when the traveler requests it.
	 */

	const WORLD_MINIMAP_LAYOUT_CSS = `
		.Awtsmoos-minimap {
			position: fixed;
			top: max(64px, env(safe-area-inset-top));
			right: max(12px, env(safe-area-inset-right));
			bottom: auto;
			z-index: 760;
			width: min(176px, 28vw);
			overflow: hidden;
			border-radius: 18px;
		}

		.Awtsmoos-minimap header {
			display: grid;
			grid-template-columns: 1fr auto;
			align-items: center;
			gap: 6px;
			padding: 7px 8px;
			font-size: 10px;
		}

		.Awtsmoos-map-actions {
			display: flex;
			gap: 4px;
		}

		.Awtsmoos-minimap button {
			min-width: 48px;
			min-height: 48px;
			padding: 8px 10px;
			font-size: 9px;
			touch-action: manipulation;
		}

		.Awtsmoos-minimap[data-mode="expanded"] {
			top: 9vh;
			right: 4vw;
			width: min(620px, 88vw);
			height: min(580px, 78vh);
		}

		.Awtsmoos-minimap[data-mode="fullscreen"] {
			inset: 2vh 2vw;
			width: 96vw;
			height: 96vh;
		}

		@media (max-width: 650px) {
			.Awtsmoos-minimap[data-mode="compact"] {
				top: max(8px, env(safe-area-inset-top));
				right: max(8px, env(safe-area-inset-right));
				width: 112px;
				border-radius: 14px;
			}

			.Awtsmoos-minimap[data-mode="compact"] header {
				grid-template-columns: 1fr;
				gap: 4px;
				padding: 5px;
			}

			.Awtsmoos-minimap[data-mode="compact"] header strong {
				display: none;
			}

			.Awtsmoos-minimap[data-mode="compact"] .Awtsmoos-map-actions {
				display: grid;
				grid-template-columns: repeat(2, 48px);
				gap: 4px;
				justify-content: center;
			}

			.Awtsmoos-minimap[data-mode="compact"] button {
				width: 48px;
				min-width: 48px;
				height: 48px;
				min-height: 48px;
				padding: 0;
				font-size: 0;
			}

			.Awtsmoos-minimap[data-mode="compact"] [data-map-expand]::after {
				content: "+";
				font-size: 20px;
			}

			.Awtsmoos-minimap[data-mode="compact"] [data-map-fullscreen]::after {
				content: "⛶";
				font-size: 17px;
			}

			.Awtsmoos-minimap[data-mode="compact"] .Awtsmoos-map-canvas {
				height: 64px;
				min-height: 64px;
			}
		}
	`;

	__exports.WORLD_MINIMAP_LAYOUT_CSS = WORLD_MINIMAP_LAYOUT_CSS;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/ui/WorldMinimapSurfaceCss.js ----
{
	const __exports = __awtsmoosModule_18;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file WorldMinimapSurfaceCss.js
	 * @description Gives the map layered spectral glass, gradient controls, and a non-flat cartographic field.
	 * The Awtsmoos bends many hues through one finite vessel while no painted slab pretends to be complete;
	 * Awtsmoos.com makes every map surface layered and luminous without adding one remote texture to the loading fleet.
	 */

	const WORLD_MINIMAP_SURFACE_CSS = `
		.Awtsmoos-minimap {
			border: 1px solid rgba(124, 225, 255, .38);
			background:
				radial-gradient(circle at 18% 8%, rgba(57, 224, 255, .23), transparent 43%),
				radial-gradient(circle at 88% 92%, rgba(167, 84, 255, .16), transparent 42%),
				linear-gradient(145deg, rgba(6, 20, 29, .92), rgba(24, 10, 42, .88) 56%, rgba(4, 30, 29, .9));
			box-shadow:
				0 16px 42px rgba(0, 0, 0, .3),
				inset 0 1px rgba(255, 255, 255, .08);
			backdrop-filter: blur(14px) saturate(1.25);
		}

		.Awtsmoos-minimap header {
			background:
				linear-gradient(90deg, rgba(69, 222, 255, .13), rgba(179, 96, 255, .1), transparent);
		}

		.Awtsmoos-minimap button {
			border: 1px solid rgba(159, 225, 255, .38);
			background:
				radial-gradient(circle at 20% 10%, rgba(111, 236, 255, .2), transparent 45%),
				linear-gradient(145deg, rgba(22, 84, 102, .75), rgba(68, 29, 101, .72));
		}

		.Awtsmoos-map-canvas {
			background:
				radial-gradient(ellipse at 30% 62%, rgba(48, 170, 196, .42), transparent 22%),
				radial-gradient(circle at 68% 28%, rgba(155, 109, 216, .2), transparent 26%),
				linear-gradient(135deg, #213f38, #173337 48%, #17253a);
		}

		.Awtsmoos-map-player {
			background:
				radial-gradient(circle at 34% 28%, #f7ffff 0 10%, #66e4ff 22%, #4c72ff 62%, #9b62ff);
			box-shadow: 0 0 10px rgba(85, 223, 255, .8);
		}
	`;

	__exports.WORLD_MINIMAP_SURFACE_CSS = WORLD_MINIMAP_SURFACE_CSS;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/ui/WorldMinimapStyle.js ----
{
	const __exports = __awtsmoosModule_16;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file WorldMinimapStyle.js
	 * @description Installs the map's safe-area geometry and spectral material vessels exactly once.
	 * The Awtsmoos joins boundary and beauty without confusing their separate names;
	 * Awtsmoos.com composes small readable modules so future maps inherit clarity instead of overlapping frames.
	 */

	const WORLD_MINIMAP_LAYOUT_CSS = __awtsmoosModule_17.WORLD_MINIMAP_LAYOUT_CSS;
	const WORLD_MINIMAP_SURFACE_CSS = __awtsmoosModule_18.WORLD_MINIMAP_SURFACE_CSS;

	function installWorldMinimapStyle(documentValue = document) {
		if (documentValue.getElementById('AwtsmoosWorldMinimapStyle')) {
			return;
		}
		const style = documentValue.createElement('style');
		style.id = 'AwtsmoosWorldMinimapStyle';
		style.textContent = `${WORLD_MINIMAP_LAYOUT_CSS}\n${WORLD_MINIMAP_SURFACE_CSS}`;
		(documentValue.head || documentValue.documentElement).append(style);
	}

	__exports.installWorldMinimapStyle = installWorldMinimapStyle;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/ui/WorldMinimapView.js ----
{
	const __exports = __awtsmoosModule_19;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file WorldMinimapView.js
	 * @description Creates three-mode village-map markup and bounded marker elements.
	 * The Awtsmoos gives each coordinate one visible sign; Awtsmoos.com keeps labels text-safe,
	 * controls keyboard-accessible, and local, quest, and peer garments semantically distinct.
	 */

	function createWorldMinimapRoot(documentValue, mode = 'compact') {
		const root = documentValue.createElement('section');
		root.className = 'Awtsmoos-minimap Awtsmoos-gameplay';
		root.dataset.expanded = String(mode !== 'compact');
		root.dataset.mode = mode;
		root.innerHTML = `
			<header>
				<strong>🗺️ Village Map</strong>
				<span class="Awtsmoos-map-actions">
					<button type="button" data-map-expand>Expand</button>
					<button type="button" data-map-fullscreen aria-pressed="false">Full map</button>
				</span>
			</header>
			<div class="Awtsmoos-map-canvas" data-map aria-label="Village quest map"></div>
		`;
		return root;
	}


	__exports.createWorldMinimapRoot = createWorldMinimapRoot;
	function renderWorldMinimapMarkers(documentValue, map, projection) {
		const records = [
			projection.player,
			...projection.givers,
			...projection.objectives,
			...projection.peers
		];
		map.replaceChildren(...records.map(record => markerElement(documentValue, record)));
	}


	__exports.renderWorldMinimapMarkers = renderWorldMinimapMarkers;
	function markerElement(documentValue, record) {
		const element = documentValue.createElement(
			record.kind === 'player' ? 'span' : 'button'
		);
		element.className = record.kind === 'player'
			? 'Awtsmoos-map-player'
			: 'Awtsmoos-map-marker';
		element.dataset.kind = record.kind;
		if (element.tagName === 'BUTTON') element.type = 'button';
		element.textContent = record.icon;
		element.title = record.label;
		element.setAttribute('aria-label', record.label);
		element.style.left = `${record.left}%`;
		element.style.top = `${record.top}%`;
		return element;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/ui/WorldMinimap.js ----
{
	const __exports = __awtsmoosModule_11;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file WorldMinimap.js
	 * @description Owns compact, expanded, and full-screen quest maps for solo and shared play.
	 * The Awtsmoos renews direction without replacing discovery; Awtsmoos.com redraws only after
	 * movement, unified quest change, peer change, or an explicit remembered viewpoint transition.
	 */

	const bindWorldMinimapControls = __awtsmoosModule_12.bindWorldMinimapControls;
	const updateWorldMinimapControls = __awtsmoosModule_12.updateWorldMinimapControls;
	const projectWorldMinimap = __awtsmoosModule_13.projectWorldMinimap;
	const ensureWorldMinimapQuestSubscription = __awtsmoosModule_14.ensureWorldMinimapQuestSubscription;
	const worldMinimapPeerSignature = __awtsmoosModule_14.worldMinimapPeerSignature;
	const worldMinimapPlayerPosition = __awtsmoosModule_14.worldMinimapPlayerPosition;
	const readWorldMinimapMode = __awtsmoosModule_15.readWorldMinimapMode;
	const writeWorldMinimapMode = __awtsmoosModule_15.writeWorldMinimapMode;
	const installWorldMinimapStyle = __awtsmoosModule_16.installWorldMinimapStyle;
	const createWorldMinimapRoot = __awtsmoosModule_19.createWorldMinimapRoot;
	const renderWorldMinimapMarkers = __awtsmoosModule_19.renderWorldMinimapMarkers;

	const MOVEMENT_THRESHOLD = 1.5;

	class WorldMinimap {
		constructor(runtime, documentValue, environment = globalThis) {
			this.runtime = runtime;
			this.documentValue = documentValue;
			this.storage = environment.localStorage;
			this.position = worldMinimapPlayerPosition(runtime);
			this.peerSignature = '';
			this.projectionSignature = '';
			this.questSource = null;
			this.unsubscribeQuest = () => {};
			this.mode = readWorldMinimapMode(this.storage);
			installWorldMinimapStyle(documentValue);
			this.root = createWorldMinimapRoot(documentValue, this.mode);
			documentValue.body.appendChild(this.root);
			this.controls = bindWorldMinimapControls(this, documentValue);
			updateWorldMinimapControls(this.root, this.mode);
			ensureWorldMinimapQuestSubscription(this);
			this.render(true);
		}

		refresh() {
			ensureWorldMinimapQuestSubscription(this);
			const position = worldMinimapPlayerPosition(this.runtime);
			const moved = Math.hypot(
				position.x - this.position.x,
				position.z - this.position.z
			) >= MOVEMENT_THRESHOLD;
			const peers = worldMinimapPeerSignature(this.runtime);
			if (!moved && peers === this.peerSignature) return false;
			this.position = position;
			this.peerSignature = peers;
			this.render();
			return true;
		}

		render(force = false) {
			const projection = projectWorldMinimap(this.runtime);
			const signature = JSON.stringify(projection);
			if (!force && signature === this.projectionSignature) return;
			this.projectionSignature = signature;
			this.peerSignature = worldMinimapPeerSignature(this.runtime);
			renderWorldMinimapMarkers(
				this.documentValue,
				this.root.querySelector('[data-map]'),
				projection
			);
			this.lastProjection = projection;
		}

		setMode(mode) {
			this.mode = writeWorldMinimapMode(this.storage, mode);
			this.root.dataset.mode = this.mode;
			this.root.dataset.expanded = String(this.mode !== 'compact');
			updateWorldMinimapControls(this.root, this.mode);
		}

		setExpanded(expanded) {
			this.setMode(expanded ? 'expanded' : 'compact');
		}

		diagnostics() {
			return {
				expanded: this.mode !== 'compact',
				fullscreen: this.mode === 'fullscreen',
				givers: this.lastProjection?.givers?.length || 0,
				mode: this.mode,
				mounted: this.root.isConnected !== false,
				objectives: this.lastProjection?.objectives?.length || 0,
				peers: this.lastProjection?.peers?.length || 0,
				position: { ...this.position }
			};
		}

		destroy() {
			this.unsubscribeQuest();
			this.controls.destroy();
			this.root.remove();
		}
	}

	__exports.WorldMinimap = WorldMinimap;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowBootstrapMinimap.js ----
{
	const __exports = __awtsmoosModule_10;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowBootstrapMinimap.js
	 * @description Mounts the folded real minimap during compact bootstrap play with an injectable test seam.
	 * The Awtsmoos reveals nearby travelers without scattering source scrolls across the road;
	 * Awtsmoos.com preserves immediate mount, diagnostics, refresh, handoff, and exact teardown.
	 */

	const WorldMinimap = __awtsmoosModule_11.WorldMinimap;

	const WORLD_MINIMAP_URL = new URL(
		'../ui/WorldMinimap.js',
		(( globalThis.location?.origin && globalThis.location.origin !== "null" ? globalThis.location.origin : "https://awtsmoos.local" ) + "/games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowBootstrapMinimap.js")
	).href;

	function createMinimalMeadowBootstrapMinimap(
		runtime,
		documentValue,
		importer = null
	) {
		let active = true;
		let minimap = null;
		let error = null;
		const promise = resolveMinimapClass(importer).then(MinimapClass => {
			if (!active) return null;
			minimap = new MinimapClass(
				runtime,
				documentValue,
				documentValue.defaultView || globalThis
			);
			return minimap;
		}).catch(reason => {
			error = reason;
			runtime.bus?.emit?.('ui:bootstrap-minimap-failed', {
				message: reason?.message || String(reason)
			});
			return null;
		});
		return {
			diagnostics() {
				return Object.freeze({
					error: error?.message || null,
					mounted: Boolean(minimap),
					pending: active && !minimap && !error
				});
			},
			promise,
			refresh() {
				minimap?.refresh?.();
			},
			release() {
				active = false;
				minimap?.destroy?.();
				minimap = null;
			},
			destroy() {
				this.release();
			}
		};
	}


	__exports.createMinimalMeadowBootstrapMinimap = createMinimalMeadowBootstrapMinimap;
	async function resolveMinimapClass(importer) {
		if (!importer) return WorldMinimap;
		const module = await importer(WORLD_MINIMAP_URL);
		return module.WorldMinimap;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-matrix-core.js ----
{
	const __exports = __awtsmoosModule_25;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-matrix-core.js
	 * @description Direct column-major matrix operations for the Mitzvah World.
	 * The Awtsmoos renews every coordinate without waste; Awtsmoos.com forms each matrix
	 * directly so no intermediate vessel stands between intention and visible revelation.
	 */

	const EPSILON = 1e-8;
	__exports.EPSILON = EPSILON;


	function identity() {
		return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
	}


	__exports.identity = identity;
	function copyMat4(source) {
		return new Float32Array(source || identity());
	}


	__exports.copyMat4 = copyMat4;
	function mat4FromArray(source, offset = 0) {
		const result = new Float32Array(16);
		for (let index = 0; index < 16; index += 1) {
			result[index] = Number(source?.[offset + index] ?? (index % 5 === 0 ? 1 : 0));
		}
		return result;
	}


	__exports.mat4FromArray = mat4FromArray;
	function multiply(left, right) {
		const result = new Float32Array(16);
		for (let column = 0; column < 4; column += 1) {
			const offset = column * 4;
			const right0 = right[offset];
			const right1 = right[offset + 1];
			const right2 = right[offset + 2];
			const right3 = right[offset + 3];
			result[offset] = left[0] * right0 + left[4] * right1 + left[8] * right2 + left[12] * right3;
			result[offset + 1] = left[1] * right0 + left[5] * right1 + left[9] * right2 + left[13] * right3;
			result[offset + 2] = left[2] * right0 + left[6] * right1 + left[10] * right2 + left[14] * right3;
			result[offset + 3] = left[3] * right0 + left[7] * right1 + left[11] * right2 + left[15] * right3;
		}
		return result;
	}


	__exports.multiply = multiply;
	function inverse(matrix) {
		const result = new Float32Array(16);
		const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = matrix;
		const b00 = a00 * a11 - a01 * a10;
		const b01 = a00 * a12 - a02 * a10;
		const b02 = a00 * a13 - a03 * a10;
		const b03 = a01 * a12 - a02 * a11;
		const b04 = a01 * a13 - a03 * a11;
		const b05 = a02 * a13 - a03 * a12;
		const b06 = a20 * a31 - a21 * a30;
		const b07 = a20 * a32 - a22 * a30;
		const b08 = a20 * a33 - a23 * a30;
		const b09 = a21 * a32 - a22 * a31;
		const b10 = a21 * a33 - a23 * a31;
		const b11 = a22 * a33 - a23 * a32;
		let determinant = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
		if (Math.abs(determinant) < EPSILON) return identity();
		determinant = 1 / determinant;
		result.set([
			(a11 * b11 - a12 * b10 + a13 * b09) * determinant,
			(-a01 * b11 + a02 * b10 - a03 * b09) * determinant,
			(a31 * b05 - a32 * b04 + a33 * b03) * determinant,
			(-a21 * b05 + a22 * b04 - a23 * b03) * determinant,
			(-a10 * b11 + a12 * b08 - a13 * b07) * determinant,
			(a00 * b11 - a02 * b08 + a03 * b07) * determinant,
			(-a30 * b05 + a32 * b02 - a33 * b01) * determinant,
			(a20 * b05 - a22 * b02 + a23 * b01) * determinant,
			(a10 * b10 - a11 * b08 + a13 * b06) * determinant,
			(-a00 * b10 + a01 * b08 - a03 * b06) * determinant,
			(a30 * b04 - a31 * b02 + a33 * b00) * determinant,
			(-a20 * b04 + a21 * b02 - a23 * b00) * determinant,
			(-a10 * b09 + a11 * b07 - a12 * b06) * determinant,
			(a00 * b09 - a01 * b07 + a02 * b06) * determinant,
			(-a30 * b03 + a31 * b01 - a32 * b00) * determinant,
			(a20 * b03 - a21 * b01 + a22 * b00) * determinant
		]);
		return result;
	}


	__exports.inverse = inverse;
	function translate(x = 0, y = 0, z = 0) {
		const result = identity();
		result[12] = x;
		result[13] = y;
		result[14] = z;
		return result;
	}


	__exports.translate = translate;
	function scale(x = 1, y = 1, z = 1) {
		const result = identity();
		result[0] = x;
		result[5] = y;
		result[10] = z;
		return result;
	}

	__exports.scale = scale;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-transform-math.js ----
{
	const __exports = __awtsmoosModule_26;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-transform-math.js
	 * @description Direct quaternion and TRS composition for animated village forms.
	 * The Awtsmoos turns stillness into movement each instant; Awtsmoos.com composes the
	 * complete local vessel in one pass so no temporary translation or scale matrix is born.
	 */

	const identity = __awtsmoosModule_25.identity;

	function quatNormalize(quaternion) {
		const x = quaternion?.[0] || 0;
		const y = quaternion?.[1] || 0;
		const z = quaternion?.[2] || 0;
		const w = quaternion?.[3] ?? 1;
		const inverseLength = 1 / (Math.hypot(x, y, z, w) || 1);
		return [x * inverseLength, y * inverseLength, z * inverseLength, w * inverseLength];
	}


	__exports.quatNormalize = quatNormalize;
	function quatMatrix(quaternion = [0, 0, 0, 1]) {
		const [x, y, z, w] = quatNormalize(quaternion);
		return composeNormalizedQuaternion(x, y, z, w, 0, 0, 0, 1, 1, 1);
	}


	__exports.quatMatrix = quatMatrix;
	function composeTRS(position, quaternion, scaling) {
		const source = quaternion.toArray ? quaternion.toArray() : quaternion;
		const [x, y, z, w] = quatNormalize(source);
		return composeNormalizedQuaternion(
			x,
			y,
			z,
			w,
			position.x,
			position.y,
			position.z,
			scaling.x,
			scaling.y,
			scaling.z
		);
	}


	__exports.composeTRS = composeTRS;
	function composeNormalizedQuaternion(x, y, z, w, px, py, pz, sx, sy, sz) {
		const x2 = x + x;
		const y2 = y + y;
		const z2 = z + z;
		const xx = x * x2;
		const xy = x * y2;
		const xz = x * z2;
		const yy = y * y2;
		const yz = y * z2;
		const zz = z * z2;
		const wx = w * x2;
		const wy = w * y2;
		const wz = w * z2;
		const result = identity();
		result[0] = (1 - yy - zz) * sx;
		result[1] = (xy + wz) * sx;
		result[2] = (xz - wy) * sx;
		result[4] = (xy - wz) * sy;
		result[5] = (1 - xx - zz) * sy;
		result[6] = (yz + wx) * sy;
		result[8] = (xz + wy) * sz;
		result[9] = (yz - wx) * sz;
		result[10] = (1 - xx - yy) * sz;
		result[12] = px;
		result[13] = py;
		result[14] = pz;
		return result;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-camera-math.js ----
{
	const __exports = __awtsmoosModule_27;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-camera-math.js
	 * @description Camera projection and world-point revelation for the mountain village.
	 * The Awtsmoos creates the seer and the seen together; Awtsmoos.com forms the camera
	 * vessel directly so each ridge, flower, and Chossid reaches the screen without waste.
	 */

	const identity = __awtsmoosModule_25.identity;

	function perspective(fovDegrees, aspect, near, far) {
		const factor = 1 / Math.tan(fovDegrees * Math.PI / 360);
		const depth = 1 / (near - far);
		const result = new Float32Array(16);
		result[0] = factor / aspect;
		result[5] = factor;
		result[10] = (far + near) * depth;
		result[11] = -1;
		result[14] = 2 * far * near * depth;
		return result;
	}


	__exports.perspective = perspective;
	function lookAt(eye, target, up = [0, 1, 0]) {
		const forward = normalize3([
			eye[0] - target[0],
			eye[1] - target[1],
			eye[2] - target[2]
		]);
		const right = normalize3(cross3(up, forward));
		const upward = cross3(forward, right);
		const result = identity();
		result[0] = right[0];
		result[1] = upward[0];
		result[2] = forward[0];
		result[4] = right[1];
		result[5] = upward[1];
		result[6] = forward[1];
		result[8] = right[2];
		result[9] = upward[2];
		result[10] = forward[2];
		result[12] = -dot3(right, eye);
		result[13] = -dot3(upward, eye);
		result[14] = -dot3(forward, eye);
		return result;
	}


	__exports.lookAt = lookAt;
	function transformPoint(matrix, x, y, z) {
		return [
			matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
			matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
			matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]
		];
	}


	__exports.transformPoint = transformPoint;
	function cross3(left, right) {
		return [
			left[1] * right[2] - left[2] * right[1],
			left[2] * right[0] - left[0] * right[2],
			left[0] * right[1] - left[1] * right[0]
		];
	}

	function dot3(left, right) {
		return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
	}

	function normalize3(vector) {
		const inverseLength = 1 / (Math.hypot(vector[0], vector[1], vector[2]) || 1);
		return vector.map(value => value * inverseLength);
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-interpolation-math.js ----
{
	const __exports = __awtsmoosModule_28;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-interpolation-math.js
	 * @description Smooth array and quaternion transitions for living motion.
	 * The Awtsmoos joins every before and after in one present; Awtsmoos.com gives the
	 * visible traveler a measured path between samples without changing either endpoint.
	 */

	const quatNormalize = __awtsmoosModule_26.quatNormalize;

	function quatSlerp(left, right, amount) {
		const [ax, ay, az, aw] = left;
		let [bx, by, bz, bw] = right;
		let cosine = ax * bx + ay * by + az * bz + aw * bw;
		if (cosine < 0) {
			bx = -bx;
			by = -by;
			bz = -bz;
			bw = -bw;
			cosine = -cosine;
		}
		if (cosine > 0.9995) {
			return quatNormalize([
				ax + (bx - ax) * amount,
				ay + (by - ay) * amount,
				az + (bz - az) * amount,
				aw + (bw - aw) * amount
			]);
		}
		const angle = Math.acos(Math.min(1, Math.max(-1, cosine)));
		const sine = Math.sin(angle);
		const leftWeight = Math.sin((1 - amount) * angle) / sine;
		const rightWeight = Math.sin(amount * angle) / sine;
		return [
			ax * leftWeight + bx * rightWeight,
			ay * leftWeight + by * rightWeight,
			az * leftWeight + bz * rightWeight,
			aw * leftWeight + bw * rightWeight
		];
	}


	__exports.quatSlerp = quatSlerp;
	function lerpArray(left, right, amount) {
		return left.map((value, index) => value + (right[index] - value) * amount);
	}

	__exports.lerpArray = lerpArray;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-math.js ----
{
	const __exports = __awtsmoosModule_24;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-math.js
	 * @description Stable public gateway to focused mathematical vessels.
	 * The Awtsmoos contains every coordinate without confusion; Awtsmoos.com reveals
	 * matrix, transform, camera, and interpolation responsibilities in their proper rooms.
	 */

	__exports.copyMat4 = __awtsmoosModule_25.copyMat4;
	__exports.EPSILON = __awtsmoosModule_25.EPSILON;
	__exports.identity = __awtsmoosModule_25.identity;
	__exports.inverse = __awtsmoosModule_25.inverse;
	__exports.mat4FromArray = __awtsmoosModule_25.mat4FromArray;
	__exports.multiply = __awtsmoosModule_25.multiply;
	__exports.scale = __awtsmoosModule_25.scale;
	__exports.translate = __awtsmoosModule_25.translate;
	__exports.composeTRS = __awtsmoosModule_26.composeTRS;
	__exports.quatMatrix = __awtsmoosModule_26.quatMatrix;
	__exports.quatNormalize = __awtsmoosModule_26.quatNormalize;
	__exports.lookAt = __awtsmoosModule_27.lookAt;
	__exports.perspective = __awtsmoosModule_27.perspective;
	__exports.transformPoint = __awtsmoosModule_27.transformPoint;
	__exports.lerpArray = __awtsmoosModule_28.lerpArray;
	__exports.quatSlerp = __awtsmoosModule_28.quatSlerp;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-transform-cache.js ----
{
	const __exports = __awtsmoosModule_29;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-transform-cache.js
	 * @description Reuses transform snapshots and matrix storage until source values change.
	 * The Awtsmoos renews every form each instant; Awtsmoos.com mutates stable numerical
	 * vessels for moving hierarchy nodes while mesh matrix identity still invalidates batches.
	 */

	const identity = __awtsmoosModule_24.identity;

	const MATRIX_SNAPSHOT = 1;
	const TRS_SNAPSHOT = 2;

	const ROOT_WORLD_MATRIX = identity();


	__exports.ROOT_WORLD_MATRIX = ROOT_WORLD_MATRIX;
	function cachedLocalMatrix(object) {
		if (!localTransformChanged(object)) return object._localMatrixCache;
		captureLocalTransform(object);
		object._localMatrixCache ||= new Float32Array(16);
		if (object.matrix) copyMatrixInto(object._localMatrixCache, object.matrix);
		else composeTrsInto(object._localMatrixCache, object);
		object._localRevision = (object._localRevision || 0) + 1;
		return object._localMatrixCache;
	}


	__exports.cachedLocalMatrix = cachedLocalMatrix;
	function updateCachedWorldMatrix(
		object,
		parentWorld = ROOT_WORLD_MATRIX,
		parentRevision = null
	) {
		const localMatrix = cachedLocalMatrix(object);
		const localRevision = object._localRevision || 0;
		const inheritedRevision = parentRevision
			?? object.parent?._worldRevision
			?? 0;
		const unchanged = object._worldParentMatrix === parentWorld
			&& object._worldParentRevision === inheritedRevision
			&& object._worldLocalRevision === localRevision;
		if (unchanged) return false;
		if (object.isMesh || !validMatrix(object.matrixWorld)) {
			object.matrixWorld = multiplyInto(
				new Float32Array(16),
				parentWorld,
				localMatrix
			);
		} else {
			multiplyInto(object.matrixWorld, parentWorld, localMatrix);
		}
		object._worldParentMatrix = parentWorld;
		object._worldParentRevision = inheritedRevision;
		object._worldLocalRevision = localRevision;
		object._worldRevision = (object._worldRevision || 0) + 1;
		return true;
	}


	__exports.updateCachedWorldMatrix = updateCachedWorldMatrix;
	function invalidateTransformCache(object) {
		object._localTransformSnapshot = null;
		object._worldParentMatrix = null;
		object._worldParentRevision = -1;
		object._worldLocalRevision = -1;
	}


	__exports.invalidateTransformCache = invalidateTransformCache;
	function localTransformChanged(object) {
		const snapshot = object._localTransformSnapshot;
		if (object.matrix) {
			if (!snapshot || snapshot.length !== 17 || snapshot[0] !== MATRIX_SNAPSHOT) {
				return true;
			}
			for (let index = 0; index < 16; index += 1) {
				if (snapshot[index + 1] !== object.matrix[index]) return true;
			}
			return false;
		}
		if (!snapshot || snapshot.length !== 11 || snapshot[0] !== TRS_SNAPSHOT) {
			return true;
		}
		return snapshot[1] !== object.position.x
			|| snapshot[2] !== object.position.y
			|| snapshot[3] !== object.position.z
			|| snapshot[4] !== object.quaternion.x
			|| snapshot[5] !== object.quaternion.y
			|| snapshot[6] !== object.quaternion.z
			|| snapshot[7] !== object.quaternion.w
			|| snapshot[8] !== object.scale.x
			|| snapshot[9] !== object.scale.y
			|| snapshot[10] !== object.scale.z;
	}

	function captureLocalTransform(object) {
		if (object.matrix) {
			const snapshot = reusableSnapshot(object, 17);
			snapshot[0] = MATRIX_SNAPSHOT;
			for (let index = 0; index < 16; index += 1) {
				snapshot[index + 1] = object.matrix[index];
			}
			return;
		}
		const snapshot = reusableSnapshot(object, 11);
		snapshot[0] = TRS_SNAPSHOT;
		snapshot[1] = object.position.x;
		snapshot[2] = object.position.y;
		snapshot[3] = object.position.z;
		snapshot[4] = object.quaternion.x;
		snapshot[5] = object.quaternion.y;
		snapshot[6] = object.quaternion.z;
		snapshot[7] = object.quaternion.w;
		snapshot[8] = object.scale.x;
		snapshot[9] = object.scale.y;
		snapshot[10] = object.scale.z;
	}

	function reusableSnapshot(object, length) {
		if (!object._localTransformSnapshot || object._localTransformSnapshot.length !== length) {
			object._localTransformSnapshot = new Array(length);
		}
		return object._localTransformSnapshot;
	}

	function copyMatrixInto(target, source) {
		for (let index = 0; index < 16; index += 1) target[index] = source[index];
	}

	function composeTrsInto(target, object) {
		const quaternion = object.quaternion;
		const x = quaternion.x || 0;
		const y = quaternion.y || 0;
		const z = quaternion.z || 0;
		const w = quaternion.w ?? 1;
		const inverseLength = 1 / (Math.hypot(x, y, z, w) || 1);
		const normalizedX = x * inverseLength;
		const normalizedY = y * inverseLength;
		const normalizedZ = z * inverseLength;
		const normalizedW = w * inverseLength;
		const x2 = normalizedX + normalizedX;
		const y2 = normalizedY + normalizedY;
		const z2 = normalizedZ + normalizedZ;
		const xx = normalizedX * x2;
		const xy = normalizedX * y2;
		const xz = normalizedX * z2;
		const yy = normalizedY * y2;
		const yz = normalizedY * z2;
		const zz = normalizedZ * z2;
		const wx = normalizedW * x2;
		const wy = normalizedW * y2;
		const wz = normalizedW * z2;
		target[0] = (1 - yy - zz) * object.scale.x;
		target[1] = (xy + wz) * object.scale.x;
		target[2] = (xz - wy) * object.scale.x;
		target[3] = 0;
		target[4] = (xy - wz) * object.scale.y;
		target[5] = (1 - xx - zz) * object.scale.y;
		target[6] = (yz + wx) * object.scale.y;
		target[7] = 0;
		target[8] = (xz + wy) * object.scale.z;
		target[9] = (yz - wx) * object.scale.z;
		target[10] = (1 - xx - yy) * object.scale.z;
		target[11] = 0;
		target[12] = object.position.x;
		target[13] = object.position.y;
		target[14] = object.position.z;
		target[15] = 1;
	}

	function multiplyInto(target, left, right) {
		for (let column = 0; column < 4; column += 1) {
			const offset = column * 4;
			const right0 = right[offset];
			const right1 = right[offset + 1];
			const right2 = right[offset + 2];
			const right3 = right[offset + 3];
			target[offset] = left[0] * right0 + left[4] * right1 + left[8] * right2 + left[12] * right3;
			target[offset + 1] = left[1] * right0 + left[5] * right1 + left[9] * right2 + left[13] * right3;
			target[offset + 2] = left[2] * right0 + left[6] * right1 + left[10] * right2 + left[14] * right3;
			target[offset + 3] = left[3] * right0 + left[7] * right1 + left[11] * right2 + left[15] * right3;
		}
		return target;
	}

	function validMatrix(matrix) {
		return matrix?.length === 16;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-vector.js ----
{
	const __exports = __awtsmoosModule_30;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-vector.js
	 * @description Mutable vector and quaternion vessels used throughout the tiny runtime.
	 * The Awtsmoos renews every direction and rotation; Awtsmoos.com gives those values
	 * readable forms whose identity remains stable while their present coordinates change.
	 */

	class Vector3 {
		constructor(x = 0, y = 0, z = 0) {
			this.set(x, y, z);
		}

		set(x = 0, y = 0, z = 0) {
			this.x = x;
			this.y = y;
			this.z = z;
			return this;
		}

		fromArray(values = [0, 0, 0]) {
			return this.set(values[0] || 0, values[1] || 0, values[2] || 0);
		}

		copy(vector) {
			return this.set(vector.x || 0, vector.y || 0, vector.z || 0);
		}

		clone() {
			return new Vector3(this.x, this.y, this.z);
		}

		toArray() {
			return [this.x, this.y, this.z];
		}
	}


	__exports.Vector3 = Vector3;
	class Quaternion {
		constructor(x = 0, y = 0, z = 0, w = 1) {
			this.set(x, y, z, w);
		}

		set(x = 0, y = 0, z = 0, w = 1) {
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
			return this;
		}

		fromArray(values = [0, 0, 0, 1]) {
			return this.set(values[0] || 0, values[1] || 0, values[2] || 0, values[3] ?? 1);
		}

		copy(quaternion) {
			return this.set(
				quaternion.x || 0,
				quaternion.y || 0,
				quaternion.z || 0,
				quaternion.w ?? 1
			);
		}

		clone() {
			return new Quaternion(this.x, this.y, this.z, this.w);
		}

		toArray() {
			return [this.x, this.y, this.z, this.w];
		}
	}

	__exports.Quaternion = Quaternion;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-object3d.js ----
{
	const __exports = __awtsmoosModule_23;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-object3d.js
	 * @description Cached scene hierarchy with structural and visibility revision evidence.
	 * The Awtsmoos recreates every parent and child together; Awtsmoos.com marks real hierarchy
	 * changes so settled material and renderer systems stop rediscovering an unchanged village tree.
	 */

	const copyMat4 = __awtsmoosModule_24.copyMat4;
	const identity = __awtsmoosModule_24.identity;
	const cachedLocalMatrix = __awtsmoosModule_29.cachedLocalMatrix;
	const invalidateTransformCache = __awtsmoosModule_29.invalidateTransformCache;
	const ROOT_WORLD_MATRIX = __awtsmoosModule_29.ROOT_WORLD_MATRIX;
	const updateCachedWorldMatrix = __awtsmoosModule_29.updateCachedWorldMatrix;
	const Quaternion = __awtsmoosModule_30.Quaternion;
	const Vector3 = __awtsmoosModule_30.Vector3;

	class Object3D {
		constructor() {
			this.children = [];
			this.parent = null;
			this.position = new Vector3();
			this.quaternion = new Quaternion();
			this.scale = new Vector3(1, 1, 1);
			this.matrix = null;
			this.matrixWorld = identity();
			this.name = '';
			this._visible = true;
			this._sceneGraphRevision = 0;
			this.userData = {};
			this.isBone = false;
		}

		get visible() {
			return this._visible;
		}

		set visible(value) {
			const next = value !== false;
			if (this._visible === next) return;
			this._visible = next;
			markSceneGraphChanged(this);
		}

		add(object) {
			if (!object) return this;
			if (object.parent) object.parent.remove(object);
			object.parent = this;
			invalidateTransformCache(object);
			this.children.push(object);
			markSceneGraphChanged(this);
			return this;
		}

		remove(object) {
			const index = this.children.indexOf(object);
			if (index < 0) return this;
			this.children.splice(index, 1);
			markSceneGraphChanged(this);
			object.parent = null;
			invalidateTransformCache(object);
			return this;
		}

		traverse(visitor) {
			visitor(this);
			for (const child of this.children) child.traverse(visitor);
		}

		setBaseTransform() {
			this._base = {
				position: this.position.clone(),
				quaternion: this.quaternion.clone(),
				scale: this.scale.clone(),
				matrix: this.matrix ? copyMat4(this.matrix) : null
			};
			return this;
		}

		resetToBase() {
			if (!this._base) return;
			this.position.copy(this._base.position);
			this.quaternion.copy(this._base.quaternion);
			this.scale.copy(this._base.scale);
			this.matrix = this._base.matrix ? copyMat4(this._base.matrix) : null;
			invalidateTransformCache(this);
		}

		localMatrix() {
			return cachedLocalMatrix(this);
		}

		updateWorldMatrix(parentWorld = ROOT_WORLD_MATRIX) {
			updateCachedWorldMatrix(this, parentWorld);
			for (const child of this.children) child.updateWorldMatrix(this.matrixWorld);
			return this.matrixWorld;
		}
	}


	__exports.Object3D = Object3D;
	class Group extends Object3D {
		constructor() {
			super();
			this.isGroup = true;
		}
	}


	__exports.Group = Group;
	class Scene extends Group {
		constructor() {
			super();
			this.isScene = true;
		}
	}


	__exports.Scene = Scene;
	class Bone extends Object3D {
		constructor() {
			super();
			this.isBone = true;
		}
	}


	__exports.Bone = Bone;
	function markSceneGraphChanged(object) {
		let root = object;
		while (root.parent) root = root.parent;
		root._sceneGraphRevision = Number(root._sceneGraphRevision || 0) + 1;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-mesh-object.js ----
{
	const __exports = __awtsmoosModule_31;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-mesh-object.js
	 * @description Renderable scene-graph vessel joining geometry and material.
	 * The Awtsmoos clothes abstract points in visible form; Awtsmoos.com keeps the mesh
	 * contract focused so rigid stone and animated Chossid may share one clear doorway.
	 */

	const Object3D = __awtsmoosModule_23.Object3D;

	class Mesh extends Object3D {
		constructor(geometry = null, material = null) {
			super();
			this.geometry = geometry;
			this.material = material;
			this.isMesh = true;
			this.isSkinnedMesh = false;
			this.skinIndex = null;
			this.skeleton = null;
			this.primitiveMode = 4;
			this.nodeIndex = null;
		}
	}

	__exports.Mesh = Mesh;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-geometry.js ----
{
	const __exports = __awtsmoosModule_32;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-geometry.js
	 * @description Buffer and material vessels shared by imported and procedural forms.
	 * The Awtsmoos gives finite arrays the power to reveal mountains and faces; Awtsmoos.com
	 * keeps geometry, attributes, and garments small, explicit, and reusable.
	 */

	class BufferGeometry {
		constructor() {
			this.attributes = {};
			this.index = null;
			this.mode = 4;
			this.userData = {};
		}

		setAttribute(key, value) {
			this.attributes[key] = value;
			return this;
		}

		setIndex(value) {
			this.index = value;
			return this;
		}
	}


	__exports.BufferGeometry = BufferGeometry;
	class BufferAttribute {
		constructor(array, itemSize, normalized = false, componentType = null) {
			this.array = array;
			this.itemSize = itemSize;
			this.normalized = normalized;
			this.componentType = componentType;
			this.count = Math.floor((array?.length || 0) / itemSize);
		}
	}


	__exports.BufferAttribute = BufferAttribute;
	class MeshStandardMaterial {
		constructor(parameters = {}) {
			const color = parameters.color || [0.74, 0.68, 0.58, 1];
			const opacity = parameters.opacity ?? color[3] ?? 1;
			const alphaMode = parameters.alphaMode || 'OPAQUE';
			const autoTransparent = alphaMode === 'BLEND' || opacity < 1;
			this.name = parameters.name || 'material';
			this.color = color;
			this.opacity = opacity;
			this.alphaMode = alphaMode;
			this.alphaCutoff = parameters.alphaCutoff ?? 0.5;
			this.transparent = parameters.transparent ?? autoTransparent;
			this.doubleSided = parameters.doubleSided === true;
		}
	}

	__exports.MeshStandardMaterial = MeshStandardMaterial;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-camera.js ----
{
	const __exports = __awtsmoosModule_33;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-camera.js
	 * @description Perspective camera vessel for the mountain-village revelation.
	 * The Awtsmoos creates sight and distance together; Awtsmoos.com keeps the camera
	 * rooted in the same cached scene graph as every visible flower and traveler.
	 */

	const Object3D = __awtsmoosModule_23.Object3D;

	class PerspectiveCamera extends Object3D {
		constructor(fov = 45, aspect = 1, near = 0.1, far = 1000) {
			super();
			this.fov = fov;
			this.aspect = aspect;
			this.near = near;
			this.far = far;
		}
	}

	__exports.PerspectiveCamera = PerspectiveCamera;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-runtime.js ----
{
	const __exports = __awtsmoosModule_22;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-runtime.js
	 * @description Stable public gateway to the focused tiny scene-graph runtime.
	 * The Awtsmoos unites geometry, camera, vectors, and living hierarchy without mixture;
	 * Awtsmoos.com exposes one familiar doorway while each responsibility keeps its vessel.
	 */

	const Bone = __awtsmoosModule_23.Bone;
	const Group = __awtsmoosModule_23.Group;
	const Object3D = __awtsmoosModule_23.Object3D;
	const Scene = __awtsmoosModule_23.Scene;
	const Mesh = __awtsmoosModule_31.Mesh;
	const BufferAttribute = __awtsmoosModule_32.BufferAttribute;
	const BufferGeometry = __awtsmoosModule_32.BufferGeometry;
	const MeshStandardMaterial = __awtsmoosModule_32.MeshStandardMaterial;
	const PerspectiveCamera = __awtsmoosModule_33.PerspectiveCamera;
	const Quaternion = __awtsmoosModule_30.Quaternion;
	const Vector3 = __awtsmoosModule_30.Vector3;

	__exports.Bone = Bone;
	__exports.BufferAttribute = BufferAttribute;
	__exports.BufferGeometry = BufferGeometry;
	__exports.Group = Group;
	__exports.Mesh = Mesh;
	__exports.MeshStandardMaterial = MeshStandardMaterial;
	__exports.Object3D = Object3D;
	__exports.PerspectiveCamera = PerspectiveCamera;
	__exports.Quaternion = Quaternion;
	__exports.Scene = Scene;
	__exports.Vector3 = Vector3;

	function resetTreeToBase(root) {
		root.traverse(object => object.resetToBase?.());
	}


	__exports.resetTreeToBase = resetTreeToBase;
	const __awtsmoosDefault_dh813p = {
		Bone,
		BufferAttribute,
		BufferGeometry,
		Group,
		Mesh,
		MeshStandardMaterial,
		Object3D,
		PerspectiveCamera,
		Quaternion,
		Scene,
		Vector3
	};
	__exports.default = __awtsmoosDefault_dh813p;
}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapCubeGeometry.js ----
{
	const __exports = __awtsmoosModule_34;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapCubeGeometry.js
	 * @description Shares one face-aware cube with positions, normals, and UVs across first-play terrain, landmarks, and traveler parts.
	 * The Awtsmoos gives each face a direction and each texture a measured place; Awtsmoos.com reuses one complete vessel,
	 * so grass may repeat across the earth and simple forms may catch light without an allocation race.
	 */

	const BufferAttribute = __awtsmoosModule_22.BufferAttribute;
	const BufferGeometry = __awtsmoosModule_22.BufferGeometry;

	const FACE_UVS = [
		0, 0,
		1, 0,
		1, 1,
		0, 1
	];

	const POSITIONS = [
		-0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
		0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5,
		-0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5,
		0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5,
		-0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
		-0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5
	];

	const NORMALS = [
		0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
		0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
		-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
		1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
		0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
		0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0
	];

	const INDICES = [
		0, 1, 2, 0, 2, 3,
		4, 5, 6, 4, 6, 7,
		8, 9, 10, 8, 10, 11,
		12, 13, 14, 12, 14, 15,
		16, 17, 18, 16, 18, 19,
		20, 21, 22, 20, 22, 23
	];

	let sharedGeometry = null;

	/**
	 * Returns the one cached bootstrap cube used by every lightweight visible object.
	 * @returns {BufferGeometry} Shared geometry with 24 positions, normals, UVs, and 36 indices.
	 */
	function bootstrapCubeGeometry() {
		sharedGeometry ||= createCubeGeometry();
		return sharedGeometry;
	}


	__exports.bootstrapCubeGeometry = bootstrapCubeGeometry;
	/** Creates the face-separated cube so each face owns truthful lighting and texture coordinates. */
	function createCubeGeometry() {
		const geometry = new BufferGeometry();
		const uvs = Array.from({ length: 6 }, () => FACE_UVS).flat();
		geometry.setAttribute('position', new BufferAttribute(new Float32Array(POSITIONS), 3));
		geometry.setAttribute('normal', new BufferAttribute(new Float32Array(NORMALS), 3));
		geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
		geometry.setIndex(new BufferAttribute(new Uint16Array(INDICES), 1));
		geometry.userData.bootstrapPrimitive = 'shared-cube-face-aware';
		return geometry;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapImmediateMaterial.js ----
{
	const __exports = __awtsmoosModule_35;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapImmediateMaterial.js
	 * @description Creates a tiny remote-pending first-play material without importing catalog, cache, resolver, or image machinery.
	 * The Awtsmoos is beyond color and photograph while Awtsmoos.com keeps this first keli hidden from sight;
	 * only after a real remote image descends may the later hydration covenant reveal the material in light.
	 */

	const MeshStandardMaterial = __awtsmoosModule_22.MeshStandardMaterial;

	/**
	 * Creates one remote-only bootstrap material whose mesh must remain hidden until
	 * the shared hydration system binds a genuine decoded image.
	 *
	 * @param {string} name Stable material identity.
	 * @param {number[]} color Non-visible lighting/base-factor hint while pending.
	 * @param {object} [options={}] Remote semantic identity and repeat metadata.
	 * @returns {MeshStandardMaterial} Remote-pending material record.
	 */
	function createBootstrapImmediateMaterial(name, color, options = {}) {
		const resolvedColor = Object.freeze([...color]);
		const semanticRole = options.semanticRole || null;
		const textureUrl = options.textureUrl || null;
		const material = new MeshStandardMaterial({
			alphaMode: 'OPAQUE',
			color: resolvedColor,
			mapImage: null,
			name,
			opacity: 1,
			textureUrl
		});
		material.baseColorFactor = [...resolvedColor];
		material.map = null;
		material.mapImage = null;
		material.mapImageFallback = false;
		material.mapRepeat = [...(options.mapRepeat || [1, 1])];
		material.textureUrl = textureUrl;
		material.texturePolicy = {
			realMapImage: false,
			remoteOnly: true,
			semanticRole,
			tags: [...(options.tags || [])]
		};
		material.vertexColors = false;
		material.userData = {
			bootstrapImmediate: true,
			bootstrapMaterialRecord: {
				label: name,
				remoteOnly: true,
				semanticRole,
				textureUrl,
				vertexColors: false
			}
		};
		return material;
	}

	__exports.createBootstrapImmediateMaterial = createBootstrapImmediateMaterial;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapVisiblePlayer.js ----
{
	const __exports = __awtsmoosModule_21;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapVisiblePlayer.js
	 * @description Creates an immediate three-part Chossid fallback that remains visible until the canonical player garment arrives.
	 * The Awtsmoos reveals the traveler before remote cloth can cross the wire; Awtsmoos.com keeps body, face, and hat truthful in color,
	 * so the first playable moment has a living guide while richer imagery may later rise higher.
	 */

	const Group = __awtsmoosModule_22.Group;
	const Mesh = __awtsmoosModule_22.Mesh;
	const bootstrapCubeGeometry = __awtsmoosModule_34.bootstrapCubeGeometry;
	const createBootstrapImmediateMaterial = __awtsmoosModule_35.createBootstrapImmediateMaterial;

	const PARTS = Object.freeze([
		['body', [0, 0.9, 0], [0.75, 1.8, 0.55], [0.08, 0.1, 0.13, 1], 'fabric.cloth'],
		['face', [0, 2.05, -0.02], [0.62, 0.52, 0.54], [0.88, 0.68, 0.5, 1], 'character.skin'],
		['hat', [0, 2.52, -0.02], [0.86, 0.3, 0.72], [0.025, 0.03, 0.04, 1], 'fabric.cloth']
	]);

	/**
	 * Creates the visible first-play traveler whose simple geometry survives slow or failed remote hydration.
	 * @returns {Group} A visible three-mesh fallback group that canonical hydration may later replace.
	 */
	function createBootstrapVisiblePlayer() {
		const group = new Group();
		group.name = 'Awtsmoos_bootstrap_visible_chossid';
		for (const part of PARTS) {
			addPart(group, ...part);
		}
		group.userData = {
			bootstrapPlayerVisual: true,
			fallbackVisible: true,
			meshCount: PARTS.length,
			remoteOnly: false
		};
		return group;
	}


	__exports.createBootstrapVisiblePlayer = createBootstrapVisiblePlayer;
	/**
	 * Adds one visible solid-color player part as a truthful first-play fallback.
	 * @param {Group} group Parent player group receiving the mesh.
	 * @param {string} name Semantic part name.
	 * @param {number[]} position Local XYZ position.
	 * @param {number[]} scale Local XYZ scale.
	 * @param {number[]} color Immediate RGBA fallback color.
	 * @param {string} semanticRole Material role used by later texture hydration.
	 * @returns {void}
	 */
	function addPart(group, name, position, scale, color, semanticRole) {
		const mesh = new Mesh(
			bootstrapCubeGeometry(),
			createBootstrapImmediateMaterial(`bootstrap-player-${name}`, color, {
				mapRepeat: [3, 3],
				semanticRole
			})
		);
		mesh.name = `Awtsmoos_player_${name}`;
		mesh.position.set(...position);
		mesh.scale.set(...scale);
		mesh.visible = true;
		mesh.userData.bootstrapVisual = true;
		mesh.userData.bootstrapFallbackVisible = true;
		mesh.userData.semanticMaterialRole = semanticRole;
		group.add(mesh);
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/DeferredAppModuleUrl.js ----
{
	const __exports = __awtsmoosModule_37;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file DeferredAppModuleUrl.js
	 * @description Resolves deferred app modules from readable source and compact bundle contexts while preserving authored query identity after one canonical compact flag.
	 * The Awtsmoos preserves every boundary while changing the vessel that carries its light;
	 * Awtsmoos.com places compact truth first, then returns every authored cache key in order, so optional garments remain deferred and every import still reaches its site.
	 */

	/**
	 * Resolves an app-relative deferred module with compact processing and stable query ordering.
	 * @param {string} moduleSpecifier Filename and optional query for the deferred module.
	 * @param {string} executingModuleUrl Current `(( globalThis.location?.origin && globalThis.location.origin !== "null" ? globalThis.location.origin : "https://awtsmoos.local" ) + "/games/mitzvahWorld/experiments/Awtsmoos/src/app/DeferredAppModuleUrl.js")` value.
	 * @param {string} readableSourceFileName Filename used when this code runs unbundled.
	 * @returns {string} Absolute compact-aware URL valid from readable source or the compact entry.
	 */
	function resolveDeferredAppModuleUrl(
		moduleSpecifier,
		executingModuleUrl,
		readableSourceFileName
	) {
		const sourceUrl = new URL(executingModuleUrl);
		const readableSourceSuffix = `/app/${readableSourceFileName}`;
		const appBaseUrl = sourceUrl.pathname.endsWith(readableSourceSuffix)
			? new URL('./', sourceUrl)
			: new URL('./app/', sourceUrl);
		const moduleUrl = new URL(moduleSpecifier, appBaseUrl);
		const authoredQuery = [...moduleUrl.searchParams.entries()]
			.filter(([name]) => name !== 'compact');
		moduleUrl.search = '';
		moduleUrl.searchParams.set('compact', 'true');
		for (const [name, value] of authoredQuery) {
			moduleUrl.searchParams.append(name, value);
		}
		return moduleUrl.href;
	}

	__exports.resolveDeferredAppModuleUrl = resolveDeferredAppModuleUrl;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapCanonicalPlayerHydration.js ----
{
	const __exports = __awtsmoosModule_36;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapCanonicalPlayerHydration.js
	 * @description Keeps canonical-player hydration deferred while preserving its original app-relative URL after CompactJS relocation.
	 * The Awtsmoos carries one living path through readable source and gathered bundle alike;
	 * Awtsmoos.com restores the app doorway before the canonical Chossid descends, so a changed vessel never makes the browser seek light in the wrong site.
	 */

	const resolveDeferredAppModuleUrl = __awtsmoosModule_37.resolveDeferredAppModuleUrl;

	const HYDRATOR_SPECIFIER = 'MinimalMeadowPlayerHydration.js?v=20260820-promise-cycle-01';
	const SOURCE_FILE_NAME = 'BootstrapCanonicalPlayerHydration.js';

	/** Resolves the canonical-player hydrator from readable source or the relocated compact core bundle. */
	function canonicalPlayerHydratorUrl(executingModuleUrl = (( globalThis.location?.origin && globalThis.location.origin !== "null" ? globalThis.location.origin : "https://awtsmoos.local" ) + "/games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapCanonicalPlayerHydration.js")) {
		return resolveDeferredAppModuleUrl(
			HYDRATOR_SPECIFIER,
			executingModuleUrl,
			SOURCE_FILE_NAME
		);
	}


	__exports.canonicalPlayerHydratorUrl = canonicalPlayerHydratorUrl;
	function scheduleBootstrapCanonicalPlayerHydration(
		runtime,
		foundation,
		environment = globalThis,
		dependencies = {}
	) {
		if (runtime.canonicalPlayer?.status === 'ready') {
			return Promise.resolve(runtime.canonicalPlayer);
		}
		if (runtime.canonicalPlayerLaunchPromise) {
			return runtime.canonicalPlayerLaunchPromise;
		}
		const waitForReady = dependencies.waitForReady || waitForControlReady;
		const nextFrame = dependencies.nextFrame || waitForPlayableFrame;
		const hydratorUrl = dependencies.hydratorUrl
			|| canonicalPlayerHydratorUrl();
		const importHydrator = dependencies.importHydrator
			|| (() => import(hydratorUrl));
		runtime.canonicalPlayerHydrationStage = 'waiting-for-control';
		const launchPromise = Promise.resolve(waitForReady(environment))
			.then(() => {
				runtime.canonicalPlayerHydrationStage = 'waiting-for-playable-frame';
				return nextFrame(environment);
			})
			.then(async () => {
				if (runtime.destroyed) return null;
				runtime.canonicalPlayerHydrationStage = 'loading-module';
				const module = await importHydrator();
				runtime.canonicalPlayerHydrationStage = 'loading-canonical-player';
				return module.hydrateMinimalMeadowPlayer(
					runtime,
					environment,
					foundation.playerHydrationDependencies || {}
				);
			})
			.then(result => finalizeStage(runtime, result))
			.catch(error => degradeCanonicalHydration(runtime, environment, error));
		runtime.canonicalPlayerLaunchPromise = launchPromise;
		return launchPromise;
	}


	__exports.scheduleBootstrapCanonicalPlayerHydration = scheduleBootstrapCanonicalPlayerHydration;
	function waitForControlReady(environment) {
		if (!environment?.document && !environment?.AwtsmoosBootPhases) {
			return Promise.resolve();
		}
		if (controlReady(environment)) return Promise.resolve();
		return new Promise(resolve => {
			const poll = () => {
				if (controlReady(environment)) return resolve();
				if (typeof environment.requestAnimationFrame === 'function') {
					environment.requestAnimationFrame(poll);
					return;
				}
				environment.setTimeout?.(poll, 16);
			};
			poll();
		});
	}

	function controlReady(environment) {
		return environment?.AwtsmoosBootPhases?.current === 'ready'
			|| environment?.document?.documentElement?.dataset?.awtsmoosBootPhase === 'ready';
	}

	function waitForPlayableFrame(environment) {
		if (typeof environment?.requestAnimationFrame === 'function') {
			return new Promise(resolve => environment.requestAnimationFrame(() => resolve()));
		}
		return new Promise(resolve => environment?.setTimeout?.(resolve, 0) ?? resolve());
	}

	function finalizeStage(runtime, result) {
		runtime.canonicalPlayerHydrationStage = result
			? 'ready'
			: runtime.destroyed ? 'destroyed' : runtime.canonicalPlayer?.status || 'fallback-visible';
		return result;
	}

	function degradeCanonicalHydration(runtime, environment, error) {
		runtime.canonicalPlayerHydrationError = error?.message || String(error);
		runtime.canonicalPlayerHydrationStage = 'degraded';
		environment.console?.warn?.('[MitzvahWorld] deferred canonical Chossid hydration failed.', error);
		return null;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapPlayerPresentation.js ----
{
	const __exports = __awtsmoosModule_38;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapPlayerPresentation.js
	 * @description Keeps bootstrap Chossid presentation truthful without marking fallback geometry canonical.
	 * The Awtsmoos gives even the temporary vessel dignity, shadow, and motion in measured light;
	 * Awtsmoos.com distinguishes humble first-play form from the real GLB that follows into sight.
	 */

	function prepareBootstrapPlayerMeshes(model) {
		let count = 0;
		model.traverse?.(object => {
			if (!object.isMesh && !object.isSkinnedMesh) return;
			object.castShadow = true;
			object.receiveShadow = true;
			object.visible = true;
			count += 1;
		});
		return count;
	}


	__exports.prepareBootstrapPlayerMeshes = prepareBootstrapPlayerMeshes;
	function isFallbackPlayer(gltf) {
		return gltf?.scene?.userData?.isolatedModelLoad?.fallback === true
			|| gltf?.userData?.fallback === true;
	}


	__exports.isFallbackPlayer = isFallbackPlayer;
	function createBootstrapAnimationHandle(animations, state) {
		return {
			diagnostics: () => ({
				action: state.action,
				animations: animations.length,
				bootstrap: true,
				lifecycle: state.lifecycle
			}),
			names: animations.map(clip => clip.name || ''),
			play() {},
			update() {}
		};
	}

	__exports.createBootstrapAnimationHandle = createBootstrapAnimationHandle;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzDeferredActorPlaceholders.js ----
{
	const __exports = __awtsmoosModule_39;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzDeferredActorPlaceholders.js
	 * @description Preserves frame-loop contracts while optional world families stream later.
	 * The Awtsmoos conceals a vessel without making absence dangerous; Awtsmoos.com supplies
	 * honest no-op contracts so movement begins before horses, enemies, doors, lava, and shadows.
	 */

	const Group = __awtsmoosModule_22.Group;

	function createDeferredActorSystems() {
		const npc = createNpcPlaceholder();
		return {
			doors: [],
			friendlyNpcs: population('friendly', npc),
			horses: animatedFamily('horses'),
			hostileNpcs: hostilePopulation(),
			houseVisibility: visibilityPlaceholder(),
			lava: lavaPlaceholder(),
			npc,
			shadows: shadowPlaceholder(),
			targetCoordinator: { destroy() {}, streaming: true },
			worldMode: worldModePlaceholder()
		};
	}


	__exports.createDeferredActorSystems = createDeferredActorSystems;
	function population(name, primary = null) {
		return {
			actors: [],
			clearAll() {},
			destroy() {},
			group: namedGroup(`Awtsmoos_deferred_${name}`),
			primary,
			stats: () => ({ actors: 0, status: 'streaming' }),
			streamingPlaceholder: true,
			update() {}
		};
	}

	function hostilePopulation() {
		return {
			...population('hostiles'),
			diagnostics: () => ({ active: 0, actors: [], status: 'streaming' }),
			selected: null
		};
	}

	function animatedFamily(name) {
		return {
			group: namedGroup(`Awtsmoos_deferred_${name}`),
			stats: () => ({ count: 0, status: 'streaming' }),
			update() {}
		};
	}

	function createNpcPlaceholder() {
		return {
			clear() {},
			dialogue() {},
			group: namedGroup('Awtsmoos_deferred_primary_npc'),
			profile: { id: 'streaming-primary-npc' },
			selected: false,
			target() {},
			update() {},
			x: 0,
			z: 0
		};
	}

	function lavaPlaceholder() {
		return {
			active: false,
			group: namedGroup('Awtsmoos_deferred_lava'),
			stats: () => ({ active: false, status: 'streaming' }),
			update() {}
		};
	}

	function shadowPlaceholder() {
		return {
			stats: () => ({ method: 'streaming', player: false }),
			update() {}
		};
	}

	function visibilityPlaceholder() {
		return {
			stats: () => ({ status: 'streaming', updates: 0 }),
			update() {}
		};
	}

	function worldModePlaceholder() {
		return {
			enterLava: () => false,
			mode: 'eretz',
			returnEretz: () => false,
			stats: () => ({ mode: 'eretz', status: 'streaming' })
		};
	}

	function namedGroup(name) {
		const group = new Group();
		group.name = name;
		group.visible = false;
		return group;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-accessors.js ----
{
	const __exports = __awtsmoosModule_43;
	// B"H
	const BufferAttribute = __awtsmoosModule_22.BufferAttribute;

	/** Accessors: the hidden letters of GLTF made exact before the body moves. */
	const COMPONENTS={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array};

	__exports.COMPONENTS = COMPONENTS;
	const TYPE_SIZES={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16};

	__exports.TYPE_SIZES = TYPE_SIZES;
	function componentName(t){return ({5120:'BYTE',5121:'UNSIGNED_BYTE',5122:'SHORT',5123:'UNSIGNED_SHORT',5125:'UNSIGNED_INT',5126:'FLOAT'})[t]||String(t);}

	__exports.componentName = componentName;
	function normalizedScale(Ctor){if(Ctor===Int8Array)return 1/127;if(Ctor===Uint8Array)return 1/255;if(Ctor===Int16Array)return 1/32767;if(Ctor===Uint16Array)return 1/65535;return 1;}


	__exports.normalizedScale = normalizedScale;
	function scalar(view,off,Ctor){if(Ctor===Float32Array)return view.getFloat32(off,true);if(Ctor===Uint32Array)return view.getUint32(off,true);if(Ctor===Uint16Array)return view.getUint16(off,true);if(Ctor===Uint8Array)return view.getUint8(off);if(Ctor===Int16Array)return view.getInt16(off,true);return view.getInt8(off);}
	function writeTuple(target,index,values,itemSize){for(let k=0;k<itemSize;k++)target[index*itemSize+k]=values[k]??0;}

	function readAccessor(doc,buffers,index){
	  const a=doc.accessors[index],Ctor=COMPONENTS[a?.componentType],itemSize=TYPE_SIZES[a?.type]||1;if(!a||!Ctor)throw new Error(`Unsupported accessor ${index}`);
	  const normalized=a.normalized===true;let array;
	  if(a.bufferView===undefined){array=new Ctor(a.count*itemSize);}else{
	    const bv=doc.bufferViews[a.bufferView],buffer=buffers[bv.buffer],base=(bv.byteOffset||0)+(a.byteOffset||0),stride=bv.byteStride||Ctor.BYTES_PER_ELEMENT*itemSize;
	    if(stride===Ctor.BYTES_PER_ELEMENT*itemSize){array=new Ctor(buffer,base,a.count*itemSize);}else{array=new Ctor(a.count*itemSize);const view=new DataView(buffer);for(let i=0;i<a.count;i++)for(let k=0;k<itemSize;k++)array[i*itemSize+k]=scalar(view,base+i*stride+k*Ctor.BYTES_PER_ELEMENT,Ctor);}
	  }
	  if(a.sparse){array=new Ctor(array);applySparse(doc,buffers,a,array,itemSize,Ctor);}
	  const attr=new BufferAttribute(array,itemSize,normalized,a.componentType);attr.accessorIndex=index;attr.min=a.min;attr.max=a.max;return attr;
	}


	__exports.readAccessor = readAccessor;
	function applySparse(doc,buffers,a,array,itemSize,Ctor){
	  const s=a.sparse,iv=doc.bufferViews[s.indices.bufferView],vv=doc.bufferViews[s.values.bufferView],ICtor=COMPONENTS[s.indices.componentType];
	  const ib=buffers[iv.buffer],vb=buffers[vv.buffer],iBase=(iv.byteOffset||0)+(s.indices.byteOffset||0),vBase=(vv.byteOffset||0)+(s.values.byteOffset||0);
	  const iView=new DataView(ib),vView=new DataView(vb);for(let n=0;n<s.count;n++){const idx=scalar(iView,iBase+n*ICtor.BYTES_PER_ELEMENT,ICtor),vals=[];for(let k=0;k<itemSize;k++)vals[k]=scalar(vView,vBase+(n*itemSize+k)*Ctor.BYTES_PER_ELEMENT,Ctor);writeTuple(array,idx,vals,itemSize);}
	}

	function accessorFloatArray(attr){
	  const src=attr.array;if(src instanceof Float32Array&&!attr.normalized)return src;const out=new Float32Array(src.length),scale=attr.normalized?normalizedScale(src.constructor):1;
	  for(let i=0;i<src.length;i++){let v=src[i]*scale;if(attr.normalized&&(src instanceof Int8Array||src instanceof Int16Array))v=Math.max(-1,v);out[i]=v;}return out;
	}


	__exports.accessorFloatArray = accessorFloatArray;
	function normalizeWeightsAttribute(attr){
	  const src=accessorFloatArray(attr),out=new Float32Array(src.length),size=attr.itemSize;for(let i=0;i<attr.count;i++){let sum=0;for(let k=0;k<size;k++)sum+=Math.abs(src[i*size+k]||0);if(sum>0){for(let k=0;k<size;k++)out[i*size+k]=(src[i*size+k]||0)/sum;}else out[i*size]=1;}return new BufferAttribute(out,size,false,5126);
	}


	__exports.normalizeWeightsAttribute = normalizeWeightsAttribute;
	function accessorSummary(doc,index){const a=doc.accessors[index];return `${index} ${a.type} ${componentName(a.componentType)} norm=${!!a.normalized} count=${a.count}`;}

	__exports.accessorSummary = accessorSummary;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-parser.js ----
{
	const __exports = __awtsmoosModule_42;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-animation-parser.js
	 * @description Decodes GLTF animation channels into stable scalar sampling vessels.
	 * The Awtsmoos speaks every motion through measured times and values; Awtsmoos.com
	 * preserves each source channel exactly while separating parsing from living playback.
	 */

	const accessorFloatArray = __awtsmoosModule_43.accessorFloatArray;

	const TARGET_SIZE = {
		rotation: 4,
		scale: 3,
		translation: 3,
		weights: 1
	};

	function summarizeAnimations(document) {
		return (document.animations || []).map((animation, index) => ({
			channels: (animation.channels || []).length,
			index,
			name: animation.name || `animation_${index}`,
			paths: [...new Set(
				(animation.channels || [])
					.map(channel => channel.target?.path)
					.filter(Boolean)
			)],
			samplers: (animation.samplers || []).length
		}));
	}


	__exports.summarizeAnimations = summarizeAnimations;
	function parseTinyAnimations(document, accessors, nodeMap) {
		return (document.animations || []).map((animation, index) => (
			parseAnimation(animation, index, accessors, nodeMap)
		));
	}


	__exports.parseTinyAnimations = parseTinyAnimations;
	function parseAnimation(animation, index, accessors, nodeMap) {
		const channels = [];
		let duration = 0;
		for (const sourceChannel of animation.channels || []) {
			const channel = parseChannel(
				sourceChannel,
				animation.samplers || [],
				accessors,
				nodeMap
			);
			if (!channel) {
				continue;
			}
			channels.push(channel);
			duration = Math.max(duration, channel.input[channel.input.length - 1] || 0);
		}
		return {
			channels,
			duration,
			index,
			name: animation.name || `animation_${index}`
		};
	}

	function parseChannel(sourceChannel, samplers, accessors, nodeMap) {
		const sampler = samplers[sourceChannel.sampler];
		const target = sourceChannel.target || {};
		const node = nodeMap.get(target.node);
		const size = TARGET_SIZE[target.path];
		if (!sampler || !node || !size) {
			return null;
		}
		return {
			input: accessorFloatArray(accessors[sampler.input]),
			interpolation: sampler.interpolation || 'LINEAR',
			node,
			nodeIndex: target.node,
			output: accessorFloatArray(accessors[sampler.output]),
			path: target.path,
			size
		};
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-bindings.js ----
{
	const __exports = __awtsmoosModule_45;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-animation-bindings.js
	 * @description Remembers only properties truly governed by imported animation channels.
	 * The Awtsmoos renews the whole tree, yet Awtsmoos.com restores only the animated vessels,
	 * preserving exact bind values without traversing unrelated cottages, garments, or helpers.
	 */

	function createAnimationBindings(clips) {
		const bindingByNode = new Map();
		const bindings = [];
		for (const clip of clips) {
			for (const channel of clip.channels || []) {
				let paths = bindingByNode.get(channel.node);
				if (!paths) {
					paths = new Map();
					bindingByNode.set(channel.node, paths);
				}
				if (paths.has(channel.path)) {
					continue;
				}
				const binding = {
					base: readBaseValue(channel.node, channel.path),
					node: channel.node,
					path: channel.path
				};
				paths.set(channel.path, binding);
				bindings.push(binding);
			}
		}
		return bindings;
	}


	__exports.createAnimationBindings = createAnimationBindings;
	function captureClipPose(clip) {
		const pose = new Map();
		for (const channel of clip?.channels || []) {
			pose.set(channel, readNodeValue(channel.node, channel.path));
		}
		return pose;
	}


	__exports.captureClipPose = captureClipPose;
	function resetAnimationBindings(bindings) {
		for (const binding of bindings) {
			writeNodeValue(binding.node, binding.path, binding.base);
		}
	}


	__exports.resetAnimationBindings = resetAnimationBindings;
	function writeNodeValue(node, path, values) {
		if (path === 'translation') {
			node.position.set(values[0], values[1], values[2]);
			return;
		}
		if (path === 'rotation') {
			node.quaternion.set(values[0], values[1], values[2], values[3]);
			return;
		}
		if (path === 'scale') {
			node.scale.set(values[0], values[1], values[2]);
		}
	}


	__exports.writeNodeValue = writeNodeValue;
	function readBaseValue(node, path) {
		const base = node._base;
		if (path === 'translation') {
			const value = base?.position || node.position;
			return [value.x, value.y, value.z];
		}
		if (path === 'rotation') {
			const value = base?.quaternion || node.quaternion;
			return [value.x, value.y, value.z, value.w];
		}
		if (path === 'scale') {
			const value = base?.scale || node.scale;
			return [value.x, value.y, value.z];
		}
		return [0];
	}

	function readNodeValue(node, path) {
		if (path === 'translation') {
			return [node.position.x, node.position.y, node.position.z];
		}
		if (path === 'rotation') {
			return [node.quaternion.x, node.quaternion.y, node.quaternion.z, node.quaternion.w];
		}
		if (path === 'scale') {
			return [node.scale.x, node.scale.y, node.scale.z];
		}
		return [0];
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-quaternion.js ----
{
	const __exports = __awtsmoosModule_47;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-animation-quaternion.js
	 * @description Writes one normalized quaternion interpolation into a reusable vessel.
	 * The Awtsmoos turns without division; Awtsmoos.com reveals that rotation through a
	 * stable destination whose identity survives every sampled instant.
	 */

	function slerpQuaternionInto(
		output,
		ax,
		ay,
		az,
		aw,
		bx,
		by,
		bz,
		bw,
		amount
	) {
		let cosine = ax * bx + ay * by + az * bz + aw * bw;
		if (cosine < 0) {
			bx = -bx;
			by = -by;
			bz = -bz;
			bw = -bw;
			cosine = -cosine;
		}
		if (cosine > 0.9995) {
			return normalizeInto(
				output,
				ax + (bx - ax) * amount,
				ay + (by - ay) * amount,
				az + (bz - az) * amount,
				aw + (bw - aw) * amount
			);
		}
		const angle = Math.acos(Math.min(1, Math.max(-1, cosine)));
		const sine = Math.sin(angle);
		const leftWeight = Math.sin((1 - amount) * angle) / sine;
		const rightWeight = Math.sin(amount * angle) / sine;
		return normalizeInto(
			output,
			ax * leftWeight + bx * rightWeight,
			ay * leftWeight + by * rightWeight,
			az * leftWeight + bz * rightWeight,
			aw * leftWeight + bw * rightWeight
		);
	}


	__exports.slerpQuaternionInto = slerpQuaternionInto;
	function normalizeInto(output, x, y, z, w) {
		const scale = 1 / Math.max(1e-12, Math.hypot(x, y, z, w));
		output[0] = x * scale;
		output[1] = y * scale;
		output[2] = z * scale;
		output[3] = w * scale;
		return output;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-sampler.js ----
{
	const __exports = __awtsmoosModule_46;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-animation-sampler.js
	 * @description Samples scalar animation channels without transient per-frame arrays.
	 * The Awtsmoos joins keyframes without waste; Awtsmoos.com lets each bone receive the
	 * same measured pose while temporary numbers pass through stable, reusable vessels.
	 */

	const slerpQuaternionInto = __awtsmoosModule_47.slerpQuaternionInto;

	function applyChannelSample(channel, time, fadeFrom, fadeAmount = 1) {
		const span = resolveSpan(channel, time);
		if (channel.path === 'rotation') {
			applyRotation(channel, span, fadeFrom, fadeAmount);
			return;
		}
		if (channel.path === 'translation' || channel.path === 'scale') {
			applyVector(channel, span, fadeFrom, fadeAmount);
		}
	}


	__exports.applyChannelSample = applyChannelSample;
	function applyVector(channel, span, fadeFrom, fadeAmount) {
		const values = channel._sampleScratch || (channel._sampleScratch = new Float64Array(3));
		for (let index = 0; index < 3; index += 1) {
			const sampled = sampleComponent(channel, span, index);
			values[index] = fadeFrom
				? fadeFrom[index] + (sampled - fadeFrom[index]) * fadeAmount
				: sampled;
		}
		const target = channel.path === 'translation'
			? channel.node.position
			: channel.node.scale;
		target.set(values[0], values[1], values[2]);
	}

	function applyRotation(channel, span, fadeFrom, fadeAmount) {
		const output = channel._sampleScratch || (channel._sampleScratch = new Float64Array(4));
		const left = span.left * channel.size;
		const right = span.right * channel.size;
		const source = channel.output;
		if (span.step) {
			for (let index = 0; index < 4; index += 1) {
				output[index] = source[left + index] ?? (index === 3 ? 1 : 0);
			}
		} else {
			slerpQuaternionInto(output,
				source[left] || 0, source[left + 1] || 0,
				source[left + 2] || 0, source[left + 3] ?? 1,
				source[right] || 0, source[right + 1] || 0,
				source[right + 2] || 0, source[right + 3] ?? 1,
				span.amount);
		}
		if (fadeFrom) {
			slerpQuaternionInto(output, ...fadeFrom, ...output, fadeAmount);
		}
		channel.node.quaternion.set(output[0], output[1], output[2], output[3]);
	}

	function sampleComponent(channel, span, componentIndex) {
		const left = span.left * channel.size + componentIndex;
		const valueA = channel.output[left] ?? 0;
		if (span.step) return valueA;
		const right = span.right * channel.size + componentIndex;
		const valueB = channel.output[right] ?? valueA;
		return valueA + (valueB - valueA) * span.amount;
	}

	function resolveSpan(channel, time) {
		const times = channel.input;
		const span = channel._sampleSpan || (channel._sampleSpan = {});
		const last = times.length - 1;
		if (last <= 0 || time <= times[0]) return assignSpan(span, 0, 0, 0, true);
		if (time >= times[last]) return assignSpan(span, last, last, 0, true);
		let low = 0;
		let high = last;
		while (high - low > 1) {
			const middle = (low + high) >> 1;
			if (times[middle] <= time) low = middle;
			else high = middle;
		}
		const amount = (time - times[low]) / Math.max(1e-8, times[high] - times[low]);
		return assignSpan(span, low, high, amount, channel.interpolation === 'STEP');
	}

	function assignSpan(span, left, right, amount, step) {
		span.left = left;
		span.right = right;
		span.amount = amount;
		span.step = step || left === right;
		return span;
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-player.js ----
{
	const __exports = __awtsmoosModule_44;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-animation-player.js
	 * @description Advances imported clips through exact first-play, looping, and crossfade laws.
	 * The Awtsmoos renews a living pose from the first instant; Awtsmoos.com never blends the first
	 * idle from bind pose with zero weight, yet preserves gentle transitions after motion is alive.
	 */

	const captureClipPose = __awtsmoosModule_45.captureClipPose;
	const createAnimationBindings = __awtsmoosModule_45.createAnimationBindings;
	const resetAnimationBindings = __awtsmoosModule_45.resetAnimationBindings;
	const applyChannelSample = __awtsmoosModule_46.applyChannelSample;

	class TinyAnimationPlayer {
		constructor(root, clips = []) {
			this.root = root;
			this.clips = clips;
			this.bindings = createAnimationBindings(clips);
			this.currentIndex = clips.length ? 0 : -1;
			this.time = 0;
			this.playing = true;
			this.bindPose = false;
			this.lastApplied = null;
			this.fadeDuration = 0.18;
			this.fadeTime = 0;
			this.fadePose = null;
		}

		get current() {
			return this.clips[this.currentIndex] || null;
		}

		get names() {
			return this.clips.map(clip => clip.name);
		}

		play(indexOrName) {
			const index = resolveClipIndex(this.clips, indexOrName);
			if (index < 0) return this.current;
			const target = this.clips[index];
			const alreadyApplied = this.lastApplied === target?.name;
			if (index === this.currentIndex && !this.bindPose && alreadyApplied) {
				this.playing = true;
				return this.current;
			}
			const hasAppliedPose = this.lastApplied !== null && this.lastApplied !== 'bind';
			this.fadePose = hasAppliedPose ? captureClipPose(target) : null;
			this.fadeTime = hasAppliedPose ? 0 : this.fadeDuration;
			this.currentIndex = index;
			this.time = 0;
			this.bindPose = false;
			this.playing = true;
			this.apply(0);
			return this.current;
		}

		next() {
			return this.play((this.currentIndex + 1) % Math.max(1, this.clips.length));
		}

		setBindPose(enabled) {
			this.bindPose = Boolean(enabled);
			this.time = 0;
			this.fadePose = null;
			resetAnimationBindings(this.bindings);
			this.lastApplied = this.bindPose ? 'bind' : null;
		}

		update(deltaTime) {
			if (this.bindPose || !this.current) return;
			const delta = Math.max(0, Number(deltaTime) || 0);
			if (this.playing) this.time += delta;
			if (this.fadePose) this.fadeTime += delta;
			const duration = this.current.duration || 1;
			this.apply(duration ? this.time % duration : 0);
		}

		apply(time) {
			const clip = this.current;
			if (!clip) return;
			resetAnimationBindings(this.bindings);
			const fadeAmount = this.fadePose
				? smooth(Math.min(1, this.fadeTime / Math.max(0.001, this.fadeDuration)))
				: 1;
			for (const channel of clip.channels) {
				applyChannelSample(channel, time, this.fadePose?.get(channel), fadeAmount);
			}
			if (this.fadePose && this.fadeTime >= this.fadeDuration) this.fadePose = null;
			this.lastApplied = clip.name;
		}

		diagnostics() {
			const clip = this.current;
			return {
				bindPose: this.bindPose,
				channels: clip?.channels.length || 0,
				clipCount: this.clips.length,
				currentAnimation: clip?.name || null,
				currentIndex: this.currentIndex,
				duration: Number((clip?.duration || 0).toFixed(3)),
				fade: this.fadePose
					? Number((1 - this.fadeTime / this.fadeDuration).toFixed(3))
					: 0,
				playing: this.playing,
				time: Number(this.time.toFixed(3))
			};
		}
	}


	__exports.TinyAnimationPlayer = TinyAnimationPlayer;
	function resolveClipIndex(clips, indexOrName) {
		return typeof indexOrName === 'number'
			? indexOrName
			: clips.findIndex(clip => clip.name === indexOrName);
	}

	function smooth(amount) {
		return amount * amount * (3 - 2 * amount);
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-animation.js ----
{
	const __exports = __awtsmoosModule_41;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-animation.js
	 * @description Stable public doorway to parsed clips and allocation-free playback.
	 * The Awtsmoos unites source time with visible motion; Awtsmoos.com keeps parsing,
	 * sampling, bindings, and playback in small vessels behind one familiar import.
	 */

	__exports.parseTinyAnimations = __awtsmoosModule_42.parseTinyAnimations;
	__exports.summarizeAnimations = __awtsmoosModule_42.summarizeAnimations;
	__exports.TinyAnimationPlayer = __awtsmoosModule_44.TinyAnimationPlayer;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/world/GroundRay.js ----
{
	const __exports = __awtsmoosModule_49;
	// B"H
	/** GroundRay: one beginning ray, so the soles kiss Eretz and do not float. */
	function alignModelFeetToGround(model, groundY = 0) {
	  model.updateWorldMatrix?.();
	  const minY = findMinWorldY(model);
	  if (!Number.isFinite(minY)) return { minY: null, offset: 0 };
	  const offset = groundY - minY;
	  model.position.y += offset;
	  model.setBaseTransform?.();
	  return { minY, offset };
	}


	__exports.alignModelFeetToGround = alignModelFeetToGround;
	function findMinWorldY(root) {
	  let minY = Infinity;
	  root.traverse((object) => {
	    const position = object.geometry?.attributes?.position;
	    const matrix = object.matrixWorld;
	    if (!position || !matrix) return;
	    const array = position.array;
	    for (let i = 0; i < array.length; i += 3) {
	      const y = matrix[1] * array[i] + matrix[5] * array[i + 1] + matrix[9] * array[i + 2] + matrix[13];
	      if (y < minY) minY = y;
	    }
	  });
	  return minY;
	}

	__exports.findMinWorldY = findMinWorldY;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzPlayerModel.js ----
{
	const __exports = __awtsmoosModule_48;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzPlayerModel.js
	 * @description Mounts immediate or canonical Chossid forms behind one replaceable contract.
	 * The Awtsmoos reveals living presence before optional animation; Awtsmoos.com keeps the
	 * same runtime doorway for a local silhouette and a later canonical animated garment.
	 */

	const TinyAnimationPlayer = __awtsmoosModule_41.TinyAnimationPlayer;
	const alignModelFeetToGround = __awtsmoosModule_49.alignModelFeetToGround;

	function createPlayerModel(playerGltf, scene) {
		const model = playerGltf.scene;
		model.name = 'Awtsmoos_visible_player_isolated_chossid';
		model.visible = true;
		model.scale.set(1.52, 1.52, 1.52);
		model.position.set(0, 0, 4);
		model.setBaseTransform();
		scene.add(model);
		const feet = alignModelFeetToGround(model, 0);
		const footOffset = model.position.y;
		const player = new TinyAnimationPlayer(model, playerGltf.animations || []);
		const clips = createClipMap(playerGltf.animations || []);
		const defaultClip = clips.stand || player.names[0] || '';
		if (defaultClip) player.play(defaultClip);
		model.userData.AwtsmoosCanonicalPlayer = playerEvidence(playerGltf, player, defaultClip);
		return { clips, defaultClip, feet, footOffset, model, player };
	}



	__exports.createPlayerModel = createPlayerModel;
	function createEquipment(model) {
		const materials = new Set();
		const meshes = [];
		const visible = {};
		model.traverse(object => {
			if (!object.isMesh && !object.isSkinnedMesh) return;
			const material = object.material?.name || 'material';
			materials.add(material);
			visible[material] = object.visible !== false;
			meshes.push({ name: object.name, material, object });
		});
		return { materials: [...materials], meshes, visible };
	}


	__exports.createEquipment = createEquipment;
	function toggleEquipmentMaterial(model, name, enabled) {
		model.traverse(object => {
			if ((object.isMesh || object.isSkinnedMesh) && object.material?.name === name) {
				object.visible = Boolean(enabled);
			}
		});
	}


	__exports.toggleEquipmentMaterial = toggleEquipmentMaterial;
	function placePlayerModel(model, state) {
		model.position.set(state.x, state.renderY, state.z);
		model.quaternion.set(0, Math.sin(state.facing / 2), 0, Math.cos(state.facing / 2));
	}


	__exports.placePlayerModel = placePlayerModel;
	function faceTarget(state) {
		return { x: state.x, y: state.renderY + state.faceHeight, z: state.z };
	}


	__exports.faceTarget = faceTarget;
	function createClipMap(animations) {
		const clips = animations.map(clip => ({ duration: Number(clip.duration || 0), name: clip.name || '' }));
		const names = clips.map(clip => clip.name);
		const animated = expression => clips.find(clip => expression.test(clip.name) && clip.duration > 0)?.name;
		const named = expression => names.find(name => expression.test(name));
		const stand = animated(/^stand_Armature$/i)
			|| animated(/^stand 2_Armature$/i)
			|| animated(/stand|idle/i)
			|| named(/neutral/i)
			|| names[0]
			|| '';
		const walk = animated(/walk|step|stroll/i) || stand;
		const run = animated(/run|jog/i) || walk;
		const jump = animated(/jump|leap/i) || stand;
		return { fall: animated(/fall|air|drop/i) || jump, jump, run, stand, walk };
	}


	__exports.createClipMap = createClipMap;
	function playerEvidence(gltf, player, defaultClip) {
		const fallback = gltf.scene?.userData?.isolatedModelLoad?.fallback === true;
		return {
			animationCount: player.names.length,
			defaultClip,
			modelSource: fallback ? 'local-procedural-chossid-silhouette' : 'chossid.glb',
			measuredAnimatedIdle: defaultClip === 'stand_Armature',
			optionalAnimationsDeferred: fallback
		};
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowCanonicalAnimation.js ----
{
	const __exports = __awtsmoosModule_40;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowCanonicalAnimation.js
	 * @description Binds every imported Chossid clip to the hydrated skeleton and preserves the authoritative controller explicitly.
	 * The Awtsmoos gives motion and stillness one living vessel; Awtsmoos.com keeps that exact controller reachable across bootstrap,
	 * gameplay composition, Movie Studio, diagnostics, and reproduction so a later compatibility player cannot erase fourteen authored clips.
	 */

	const TinyAnimationPlayer = __awtsmoosModule_41.TinyAnimationPlayer;
	const createClipMap = __awtsmoosModule_48.createClipMap;

	function installCanonicalChossidAnimation(runtime, gltf, visiblePlayer) {
		const animations = gltf.animations || [];
		const player = new TinyAnimationPlayer(visiblePlayer, animations);
		const clips = createClipMap(animations);
		const catalog = createCanonicalChossidAnimationCatalog(animations);
		const defaultClip = clips.stand || player.names[0] || '';
		if (defaultClip) player.play(defaultClip);
		player.update(0);
		runtime.canonicalAnimationPlayer = player;
		runtime.player = player;
		runtime.clips = clips;
		runtime.animationCatalog = catalog;
		runtime.state.clip = defaultClip;
		return { catalog, clips, defaultClip, player };
	}


	__exports.installCanonicalChossidAnimation = installCanonicalChossidAnimation;
	/**
	 * Returns immutable evidence for every animation exported by canonical `chossid.glb`.
	 *
	 * @param {Array<object>} animations Parsed GLB clips.
	 * @returns {ReadonlyArray<object>} Exact-name animation catalog.
	 */
	function createCanonicalChossidAnimationCatalog(animations = []) {
		return Object.freeze(animations.map((clip, index) => Object.freeze({
			channels: Array.isArray(clip?.channels) ? clip.channels.length : 0,
			duration: Number(clip?.duration || 0),
			index,
			name: String(clip?.name || `animation-${index}`),
			pose: Number(clip?.duration || 0) <= 0.0005
		})));
	}

	__exports.createCanonicalChossidAnimationCatalog = createCanonicalChossidAnimationCatalog;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowPlayerMaterialHydrator.js ----
{
	const __exports = __awtsmoosModule_50;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/** Preserves the canonical Chossid's exported shirt, skin, coat, and equipment colors exactly. */
	function hydrateReadablePlayerMaterials(model) {
		const receipt = { assetNativeColors: 0, invalidColors: 0, materialsVisited: 0, textureBound: 0 };
		const visited = new Set();
		model?.traverse?.(node => {
			if (!node.isMesh && !node.isSkinnedMesh) return;
			const materials = Array.isArray(node.material) ? node.material : [node.material];
			for (const material of materials.filter(Boolean)) {
				if (visited.has(material)) continue;
				visited.add(material);
				receipt.materialsVisited += 1;
				const color = material.baseColorFactor || material.color;
				if (!validColor(color)) {
					receipt.invalidColors += 1;
					continue;
				}
				material.userData ||= {};
				material.userData.AwtsmoosChossidMaterial = Object.freeze({
					assetNative: true,
					material: material.name || null,
					source: 'chossid.glb'
				});
				material.needsUpdate = true;
				receipt.assetNativeColors += 1;
			}
		});
		if (receipt.invalidColors) {
			throw new Error(`Canonical Chossid contains ${receipt.invalidColors} invalid material colors.`);
		}
		return Object.freeze(receipt);
	}


	__exports.hydrateReadablePlayerMaterials = hydrateReadablePlayerMaterials;
	function validColor(value) {
		if (Array.isArray(value) || ArrayBuffer.isView(value)) {
			return value.length >= 3 && Array.from(value).slice(0, 4).every(Number.isFinite);
		}
		return Number.isFinite(value?.r) && Number.isFinite(value?.g) && Number.isFinite(value?.b);
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/math/Vec3.js ----
{
	const __exports = __awtsmoosModule_55;
	// B"H // Boruch Hashem // Blessed is He

	/**
	 * @file Vec3.js
	 * @description Provides the mutable three-dimensional vector vessel.
	 * The Awtsmoos draws every finite direction from indivisible oneness;
	 * Awtsmoos.com lets motion appear through clear coordinates without concealment.
	 */
	class Vec3 {
		constructor(x = 0, y = 0, z = 0) {
			this.set(x, y, z);
		}

		/** Replaces every coordinate and returns this mutable vector. */
		set(x = 0, y = 0, z = 0) {
			this.x = x;
			this.y = y;
			this.z = z;
			return this;
		}

		/** Copies coordinates while preserving the original falsy-zero behavior. */
		copy(value = {}) {
			return this.set(value.x || 0, value.y || 0, value.z || 0);
		}

		/** Returns an independent vector with the same coordinates. */
		clone() {
			return new Vec3(this.x, this.y, this.z);
		}

		/** Adds another vector in place. */
		add(value) {
			this.x += value.x;
			this.y += value.y;
			this.z += value.z;
			return this;
		}

		/** Subtracts another vector in place. */
		sub(value) {
			this.x -= value.x;
			this.y -= value.y;
			this.z -= value.z;
			return this;
		}

		/** Multiplies every coordinate by one scalar. */
		scale(scalar) {
			this.x *= scalar;
			this.y *= scalar;
			this.z *= scalar;
			return this;
		}

		/** Returns the Euclidean vector length. */
		length() {
			return Math.hypot(this.x, this.y, this.z);
		}

		/** Normalizes in place while leaving a zero vector unchanged. */
		normalize() {
			const divisor = this.length() || 1;
			return this.scale(1 / divisor);
		}

		/** Returns plain serializable coordinates. */
		toJSON() {
			return {
				x: this.x,
				y: this.y,
				z: this.z
			};
		}

		/** Creates a vector from a vector-like value. */
		static from(value = {}) {
			return new Vec3(value.x || 0, value.y || 0, value.z || 0);
		}
	}

	__exports.Vec3 = Vec3;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/math/Aabb.js ----
{
	const __exports = __awtsmoosModule_54;
	// B"H // Boruch Hashem // Blessed is He

	/**
	 * @file Aabb.js
	 * @description Holds one axis-aligned spatial vessel with inclusive boundaries.
	 * The Awtsmoos surrounds every finite form without being bounded by it;
	 * Awtsmoos.com reveals exact containment and contact through readable planes.
	 */
	const Vec3 = __awtsmoosModule_55.Vec3;

	class Aabb {
		constructor(min = new Vec3(), max = new Vec3()) {
			this.min = Vec3.from(min);
			this.max = Vec3.from(max);
		}

		/** Creates a box from one center and complete size. */
		static centerSize(center, size) {
			const halfSize = Vec3.from(size).scale(0.5);
			return new Aabb(
				Vec3.from(center).sub(halfSize),
				Vec3.from(center).add(halfSize)
			);
		}

		/** Returns an independent box with cloned endpoints. */
		clone() {
			return new Aabb(this.min, this.max);
		}

		/** Returns a new box expanded equally along every axis. */
		expanded(amount) {
			return new Aabb(
				this.min.clone().sub(new Vec3(amount, amount, amount)),
				this.max.clone().add(new Vec3(amount, amount, amount))
			);
		}

		/** Returns whether two closed boxes touch or overlap. */
		intersects(other) {
			return !(
				this.max.x < other.min.x
				|| this.min.x > other.max.x
				|| this.max.y < other.min.y
				|| this.min.y > other.max.y
				|| this.max.z < other.min.z
				|| this.min.z > other.max.z
			);
		}

		/** Returns whether this closed box completely contains another. */
		containsAabb(other) {
			return (
				other.min.x >= this.min.x
				&& other.max.x <= this.max.x
				&& other.min.y >= this.min.y
				&& other.max.y <= this.max.y
				&& other.min.z >= this.min.z
				&& other.max.z <= this.max.z
			);
		}

		/** Returns the midpoint of the box. */
		center() {
			return this.min.clone().add(this.max).scale(0.5);
		}

		/** Returns a plain serializable bounds object. */
		toJSON() {
			return {
				min: this.min.toJSON(),
				max: this.max.toJSON()
			};
		}
	}

	__exports.Aabb = Aabb;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/math/Geometry3D.js ----
{
	const __exports = __awtsmoosModule_57;
	// B"H
	/** Geometry helpers: normals, barycentric tests, and raw capsule math vessels. */
	function v(x = 0, y = 0, z = 0) { return { x, y, z }; }

	__exports.v = v;
	function add(a, b) { return v(a.x + b.x, a.y + b.y, a.z + b.z); }

	__exports.add = add;
	function sub(a, b) { return v(a.x - b.x, a.y - b.y, a.z - b.z); }

	__exports.sub = sub;
	function scale(a, s) { return v(a.x * s, a.y * s, a.z * s); }

	__exports.scale = scale;
	function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }

	__exports.dot = dot;
	function cross(a, b) { return v(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x); }

	__exports.cross = cross;
	function length(a) { return Math.hypot(a.x, a.y, a.z); }

	__exports.length = length;
	function normalize(a) { const n = length(a) || 1; return scale(a, 1 / n); }

	__exports.normalize = normalize;
	function negate(a) { return v(-a.x, -a.y, -a.z); }

	__exports.negate = negate;
	function clamp01(n) { return Math.max(0, Math.min(1, n)); }

	__exports.clamp01 = clamp01;
	function rotateY(p, yaw) { const c = Math.cos(yaw || 0), s = Math.sin(yaw || 0); return v(p.x * c - p.z * s, p.y, p.x * s + p.z * c); }

	__exports.rotateY = rotateY;
	function transformPoint(p, position, yaw = 0) { return add(rotateY(p, yaw), position); }

	__exports.transformPoint = transformPoint;
	function triangleNormal(a, b, c) { return normalize(cross(sub(b, a), sub(c, a))); }

	__exports.triangleNormal = triangleNormal;
	function planeDistance(point, tri) { return dot(sub(point, tri.a), tri.normal); }

	__exports.planeDistance = planeDistance;
	function projectToPlane(point, tri) { return sub(point, scale(tri.normal, planeDistance(point, tri))); }

	__exports.projectToPlane = projectToPlane;
	function triangleContainsPoint(p, tri) {
	  const v0 = sub(tri.c, tri.a), v1 = sub(tri.b, tri.a), v2 = sub(p, tri.a);
	  const d00 = dot(v0, v0), d01 = dot(v0, v1), d02 = dot(v0, v2), d11 = dot(v1, v1), d12 = dot(v1, v2);
	  const inv = 1 / ((d00 * d11 - d01 * d01) || 1);
	  const u = (d11 * d02 - d01 * d12) * inv, w = (d00 * d12 - d01 * d02) * inv;
	  return u >= -0.0001 && w >= -0.0001 && u + w <= 1.0001;
	}

	__exports.triangleContainsPoint = triangleContainsPoint;
	function closestPointOnSegment(p, a, b) { const ab = sub(b, a); return add(a, scale(ab, clamp01(dot(sub(p, a), ab) / (dot(ab, ab) || 1)))); }

	__exports.closestPointOnSegment = closestPointOnSegment;function closestPointsSegmentSegment(a0, a1, b0, b1) {
	  const d1 = sub(a1, a0), d2 = sub(b1, b0), r = sub(a0, b0);
	  const a = dot(d1, d1), e = dot(d2, d2), f = dot(d2, r);
	  let s = 0, t = 0;
	  if (a <= 1e-8 && e <= 1e-8) return [a0, b0];
	  if (a <= 1e-8) t = clamp01(f / e);
	  else {
	    const c = dot(d1, r);
	    if (e <= 1e-8) s = clamp01(-c / a);
	    else { const b = dot(d1, d2), denom = a * e - b * b; s = denom ? clamp01((b * f - c * e) / denom) : 0; t = (b * s + f) / e; if (t < 0) { t = 0; s = clamp01(-c / a); } else if (t > 1) { t = 1; s = clamp01((b - c) / a); } }
	  }
	  return [add(a0, scale(d1, s)), add(b0, scale(d2, t))];
	}
	function rayTriangle(origin, direction, tri, maxDistance = Infinity) {
	  const edge1 = sub(tri.b, tri.a), edge2 = sub(tri.c, tri.a), h = cross(direction, edge2);
	  const det = dot(edge1, h);
	  if (Math.abs(det) < 0.000001) return null;
	  const inv = 1 / det, s = sub(origin, tri.a), u = inv * dot(s, h);
	  if (u < 0 || u > 1) return null;
	  const q = cross(s, edge1), vv = inv * dot(direction, q);
	  if (vv < 0 || u + vv > 1) return null;
	  const t = inv * dot(edge2, q);
	  if (t < 0.001 || t > maxDistance) return null;
	  return { distance: t, point: add(origin, scale(direction, t)), normal: tri.normal, item: tri };
	}
	function minMax(points) {
	  const min = v(Infinity, Infinity, Infinity), max = v(-Infinity, -Infinity, -Infinity);
	  for (const p of points) { min.x = Math.min(min.x, p.x); min.y = Math.min(min.y, p.y); min.z = Math.min(min.z, p.z); max.x = Math.max(max.x, p.x); max.y = Math.max(max.y, p.y); max.z = Math.max(max.z, p.z); }
	  return { min, max };
	}

	__exports.closestPointsSegmentSegment = closestPointsSegmentSegment;
	__exports.rayTriangle = rayTriangle;
	__exports.minMax = minMax;
}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/collision/CapsuleTriangle.js ----
{
	const __exports = __awtsmoosModule_56;
	// B"H
	const add = __awtsmoosModule_57.add;
	const closestPointsSegmentSegment = __awtsmoosModule_57.closestPointsSegmentSegment;
	const dot = __awtsmoosModule_57.dot;
	const length = __awtsmoosModule_57.length;
	const negate = __awtsmoosModule_57.negate;
	const normalize = __awtsmoosModule_57.normalize;
	const planeDistance = __awtsmoosModule_57.planeDistance;
	const projectToPlane = __awtsmoosModule_57.projectToPlane;
	const scale = __awtsmoosModule_57.scale;
	const sub = __awtsmoosModule_57.sub;
	const triangleContainsPoint = __awtsmoosModule_57.triangleContainsPoint;

	/** Capsule-triangle contact: copied as an idea from Octree.js, reborn raw. */
	function capsuleTriangleContact(capsule, tri) {
	  const center = scale(add(capsule.start, capsule.end), 0.5);
	  const facingNormal = dot(sub(center, tri.a), tri.normal) < 0 ? negate(tri.normal) : tri.normal;
	  const planeHit = planeContact(capsule, tri, facingNormal);
	  let best = planeHit;
	  for (const [a, b] of [[tri.a, tri.b], [tri.b, tri.c], [tri.c, tri.a]]) best = deeper(best, edgeContact(capsule, tri, a, b, facingNormal));
	  return best;
	}


	__exports.capsuleTriangleContact = capsuleTriangleContact;
	function planeContact(capsule, tri, normal) {
	  const d1 = dot(sub(capsule.start, tri.a), normal);
	  const d2 = dot(sub(capsule.end, tri.a), normal);
	  const nearest = Math.abs(d1) < Math.abs(d2) ? capsule.start : capsule.end;
	  const dist = Math.abs(Math.abs(d1) < Math.abs(d2) ? d1 : d2);
	  if (dist >= capsule.radius) return null;
	  const projected = projectToPlane(nearest, { ...tri, normal });
	  if (!triangleContainsPoint(projected, tri)) return null;
	  return { normal, depth: capsule.radius - dist + 0.002, kind: tri.kind, point: projected };
	}

	function edgeContact(capsule, tri, a, b, fallbackNormal) {
	  const [p1, p2] = closestPointsSegmentSegment(capsule.start, capsule.end, a, b);
	  const delta = sub(p1, p2), dist = length(delta);
	  if (dist >= capsule.radius) return null;
	  const normal = dist > 0.00001 ? normalize(delta) : fallbackNormal;
	  return { normal, depth: capsule.radius - dist + 0.002, kind: tri.kind, point: p2 };
	}

	function deeper(a, b) { if (!b) return a; if (!a || b.depth > a.depth) return b; return a; }

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/collision/CapsuleCollisionQuery.js ----
{
	const __exports = __awtsmoosModule_53;
	// B"H
	const Aabb = __awtsmoosModule_54.Aabb;
	const capsuleTriangleContact = __awtsmoosModule_56.capsuleTriangleContact;

	function capsuleFor(position, radius, height, footOffset) {
		const base = position.y - footOffset;
		return {
			radius,
			start: { x: position.x, y: base + 0.25, z: position.z },
			end: { x: position.x, y: base + height, z: position.z }
		};
	}


	__exports.capsuleFor = capsuleFor;
	function deepestContact({ octree, capsule, radius, options, accept }) {
		let best = null;
		for (const triangle of candidates(octree, capsule, radius, options)) {
			const hit = capsuleTriangleContact(capsule, triangle);
			if (!hit || !accept(triangle, hit)) continue;
			if (!best || hit.depth > best.depth) best = hit;
		}
		return best;
	}


	__exports.deepestContact = deepestContact;
	function candidates(octree, capsule, radius, options) {
		const bounds = capsuleBounds(capsule, radius);
		const dynamic = (options.dynamicColliders || []).filter((triangle) => (
			triangle.aabb?.intersects?.(bounds)
		));
		return [...octree.query(bounds), ...dynamic];
	}

	function capsuleBounds(capsule, radius) {
		const margin = radius + 0.04;
		return new Aabb(
			{
				x: capsule.start.x - margin,
				y: Math.min(capsule.start.y, capsule.end.y) - margin,
				z: capsule.start.z - margin
			},
			{
				x: capsule.start.x + margin,
				y: Math.max(capsule.start.y, capsule.end.y) + margin,
				z: capsule.start.z + margin
			}
		);
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/collision/CollisionMovePlan.js ----
{
	const __exports = __awtsmoosModule_58;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file CollisionMovePlan.js
	 * @description Converts uncertain input into bounded horizontal substeps and measured receipts.
	 * The Awtsmoos gives motion its possibility while Awtsmoos.com gives each finite stride a limit;
	 * invalid numbers become stillness instead of tearing the Chossid beyond the created world.
	 */

	const DEFAULT_MAXIMUM_STEP = 0.055;

	/** Returns a finite horizontal movement plan suitable for repeated capsule resolution. */
	function createCollisionMovePlan(delta = {}, maximumStep = DEFAULT_MAXIMUM_STEP) {
		const rawX = Number(delta.x);
		const rawZ = Number(delta.z);
		const requested = {
			x: Number.isFinite(rawX) ? rawX : 0,
			z: Number.isFinite(rawZ) ? rawZ : 0
		};
		const stepLimit = finitePositive(maximumStep, DEFAULT_MAXIMUM_STEP);
		const distance = Math.hypot(requested.x, requested.z);
		const substeps = Math.max(1, Math.ceil(distance / stepLimit));
		return {
			distance,
			invalidInput: !Number.isFinite(rawX) || !Number.isFinite(rawZ),
			requested,
			step: { x: requested.x / substeps, z: requested.z / substeps },
			substeps
		};
	}


	__exports.createCollisionMovePlan = createCollisionMovePlan;
	/** Returns immutable evidence of requested and actually applied horizontal motion. */
	function collisionMoveReceipt(plan, start, position) {
		return Object.freeze({
			applied: Object.freeze({
				x: position.x - start.x,
				z: position.z - start.z
			}),
			invalidInput: plan.invalidInput,
			requested: Object.freeze({ ...plan.requested }),
			substeps: plan.substeps
		});
	}


	__exports.collisionMoveReceipt = collisionMoveReceipt;
	function finitePositive(value, fallback) {
		const number = Number(value);
		return Number.isFinite(number) && number > 0 ? number : fallback;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/collision/AwtsmoosCollisionMover.js ----
{
	const __exports = __awtsmoosModule_52;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file AwtsmoosCollisionMover.js
	 * @description Resolves a player capsule against real octree triangles with bounded finite steps.
	 * The Awtsmoos renews traveler and wall without confusion; Awtsmoos.com measures each stride,
	 * rejects impossible numbers, honors visible risers, and records the contact truth that remains.
	 */

	const capsuleFor = __awtsmoosModule_53.capsuleFor;
	const deepestContact = __awtsmoosModule_53.deepestContact;
	const collisionMoveReceipt = __awtsmoosModule_58.collisionMoveReceipt;
	const createCollisionMovePlan = __awtsmoosModule_58.createCollisionMovePlan;

	class AwtsmoosCollisionMover {
		constructor({ octree, radius = 0.38, height = 1.72, footOffset = 0 }) {
			Object.assign(this, { octree, radius, height, footOffset });
			this.lastCeiling = null;
			this.lastMove = null;
			this.resetContacts();
		}
		move(position, delta, options = {}) {
			const plan = createCollisionMovePlan(delta, options.maximumSubstep);
			const start = { x: position.x, z: position.z };
			this.resetContacts();
			for (let index = 0; index < plan.substeps; index += 1) {
				position.x += plan.step.x;
				position.z += plan.step.z;
				this.solve(position, options);
			}
			this.lastMove = collisionMoveReceipt(plan, start, position);
			return {
				contacts: this.lastContacts.length,
				movement: this.lastMove,
				normals: this.lastNormals,
				steppedFaces: this.lastStepFaces
			};
		}
		solve(position, options) {
			for (let pass = 0; pass < 7; pass += 1) {
				const hit = this.deepestWall(this.capsule(position), options);
				if (!hit) return;
				position.x += hit.normal.x * hit.depth;
				position.z += hit.normal.z * hit.depth;
				this.remember(hit);
			}
		}
		resolveCeiling(position, options = {}) {
			let pushed = 0;
			this.lastCeiling = null;
			for (let pass = 0; pass < 4; pass += 1) {
				const hit = this.deepestCeiling(this.capsule(position), options);
				if (!hit) break;
				position.y += Math.min(-0.002, hit.normal.y * hit.depth);
				pushed += hit.depth;
				this.lastCeiling = hit;
			}
			return { depth: pushed, hit: !!this.lastCeiling, kind: this.lastCeiling?.kind || null };
		}
		ceilingHit(position, options = {}) {
			return this.deepestCeiling(this.capsule(position), options);
		}
		deepestWall(capsule, options) {
			return deepestContact({
				accept: (triangle, hit) => this.isBlockingWall(triangle, hit, capsule, options),
				capsule,
				octree: this.octree,
				options,
				radius: this.radius
			});
		}
		deepestCeiling(capsule, options) {
			return deepestContact({
				accept: (triangle, hit) => this.isBlockingCeiling(triangle, hit, capsule),
				capsule,
				octree: this.octree,
				options,
				radius: this.radius
			});
		}
		isBlockingCeiling(triangle, hit, capsule) {
			if (!triangle.solid || triangle.floor || triangle.normal.y > -0.18) return false;
			if (triangle.aabb.max.y < capsule.end.y - 0.46) return false;
			hit.normal = triangle.normal;
			return true;
		}
		isBlockingWall(triangle, hit, capsule, options) {
			const maxSlope = options.maxSlopeNormal ?? 0.72;
			if (!triangle.solid) return false;
			if (triangle.floor && triangle.normal.y >= maxSlope) return false;
			if (triangle.floor && options.blockSteepFloors === false) return false;
			if (Math.abs(hit.normal.y) > 0.76) return false;
			const floorY = options.floorY ?? capsule.start.y - 0.25;
			const stepTop = floorY + (options.maxStepHeight ?? 0);
			if (!triangle.floor && options.grounded && triangle.aabb.max.y <= stepTop + 0.045) {
				this.lastStepFaces.push(triangle.kind);
				return false;
			}
			return true;
		}
		resetContacts() {
			this.lastContacts = [];
			this.lastNormals = [];
			this.lastStepFaces = [];
		}
		remember(hit) {
			this.lastContacts.push(hit.kind);
			this.lastNormals.push({ ...hit.normal, depth: hit.depth });
		}
		capsule(position) {
			return capsuleFor(position, this.radius, this.height, this.footOffset);
		}
	}

	__exports.AwtsmoosCollisionMover = AwtsmoosCollisionMover;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/motion/JumpPhysics.js ----
{
	const __exports = __awtsmoosModule_59;
	// B"H
	/** Jump physics samples only floors reachable from the current feet height. */
	class JumpPhysics{
	  constructor({ground,footOffset,impulse=7.35,gravity=13.25,maxSlopeNormal=.72}){Object.assign(this,{ground,footOffset,impulse,gravity,maxSlopeNormal});}
	  update(state,dt,jumpQueued){
	    const feetY=state.y-this.footOffset;
	    const sample=this.ground.sample(state.x,state.z,{maxY:feetY+.12});
	    const floorY=sample.height+this.footOffset;
	    state.groundKind=sample.kind;state.groundNormal=sample.normal;
	    state.grounded=state.y<=floorY+.06&&state.velY<=.03;
	    if(state.grounded){state.y=floorY;state.velY=0;state.airPhase='ground';}
	    if(jumpQueued&&state.grounded){state.velY=this.impulse;state.grounded=false;state.airPhase='jump';state.jumpClock=0;state.slopeState='jump';}
	    if(!state.grounded)return this.air(state,dt);
	    return this.slide(state,sample,dt);
	  }
	  air(state,dt){
	    state.jumpClock+=dt;state.velY-=this.gravity*dt;state.y+=state.velY*dt;
	    const feetY=state.y-this.footOffset;
	    const floorY=this.ground.heightAt(state.x,state.z,{maxY:feetY+.18})+this.footOffset;
	    state.airPhase=state.velY>=-.25&&state.jumpClock<.46?'jump':'fall';
	    if(state.velY<=0&&state.y<=floorY){state.y=floorY;state.velY=0;state.grounded=true;state.airPhase='ground';}
	    return{slide:null};
	  }
	  slide(state,sample,dt){
	    const n=sample.normal||{x:0,y:1,z:0},steep=n.y<this.maxSlopeNormal&&n.y>.18,mag=Math.hypot(n.x,n.z);
	    state.slopeState=steep?'slide':'walk';
	    if(!steep||mag<.001)return{slide:null};
	    const speed=(this.maxSlopeNormal-n.y)*10+1.1;
	    return{slide:{x:n.x/mag*speed*dt,z:n.z/mag*speed*dt}};
	  }
	}

	__exports.JumpPhysics = JumpPhysics;
}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteModelRecords.js ----
{
	const __exports = __awtsmoosModule_62;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file RemoteModelRecords.js
	 * @description Records byte counts and SHA-256 identities for every active canonical Mitzvah World GLB.
	 * The Awtsmoos gives each finite imported form one immutable name; Awtsmoos.com keeps structural trees
	 * outside this table because every live tree now grows exclusively through the deeper procedural core in `geelooy/libs`.
	 */

	const REMOTE_MODEL_RECORDS = Object.freeze({
		'player/chossid.glb': record(2027368, 'd86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48'),
		'reference-world/Axe_Small.glb': record(48868, 'ea26a8cdf24937ba2cd24148b3c684c59abc5208bef6c96ddca8fb00ed30ddd6'),
		'reference-world/Book.glb': record(11684, '3f6d8148030077aa95b035ca4d7f5ad589483806416fbd9b75546f49b5cce4c1'),
		'reference-world/Bush_Large_Flowers.glb': record(26788, 'cdb6c9e558a3c9b3a42eafbc2f3580767cea8b79be625bfdd41369080b468bf6'),
		'reference-world/Chest_Closed.glb': record(85120, '2ac5715af9015d885338e8c6d4b7fbea47131a253c24944e11f331b907b4d160'),
		'reference-world/Cow.glb': record(370816, '1d513ef5e3cba976405b68621905aa1954b7c7b673f0566bb3ac0135c330af6f'),
		'reference-world/Flower_4_Clump.glb': record(4868, 'ec4c5186b8b33b8095b5e8a4f733cfed1b21e876cf40f0ea9ea14537066592b9'),
		'reference-world/Rat.glb': record(593268, '163afe5bfb722229a814af69dd61e8809e0679e5782c312ad840ac7a599a58a7'),
		'reference-world/Rock_2.glb': record(11144, '10783ce0a1956b1c2c6879f7dba303b39fbe8f92256fe910b270f2f3b5d4e3ac'),
		'reference-world/Scroll.glb': record(52704, '5e8581b1041eeae144e12b12b295eda498a8f9b52218065a7b76307cb1bd4ec9'),
		'reference-world/Sheep.glb': record(293680, '5da91ccae57ada6213ec6818760c37d47f2ce071fad6a5bb7426283439c71319'),
		'reference-world/Shield.glb': record(24056, '1f40b4233612d8a00f1ec4c49d45c3f339af1b000adc10eff5bf36fbd8563f67'),
		'reference-world/Snake.glb': record(240884, 'edb074cc77ddac859245231cf17d5d76d5ec82e888af76a44a4e1b36d713b927'),
		'reference-world/Snake_Angry.glb': record(249908, 'c8f3a3bf3f1510596fd41d2be61aec55b7bd95ec35c4988b6eaf546795aaa128'),
		'reference-world/Spider.glb': record(505420, '541bd562b079790137b23c47304aa6904dbe1969a293cc271e056b25d4eb404a'),
		'reference-world/Sword.glb': record(42640, '034c89782e21e22cfcb4de6e710026647df747e0e54c5a47c2c945f512eaecc2'),
		'reference-world/WoodenStaff.glb': record(12652, '3bfba08a3426be1c873f49a85aef21c3fc670514218b606941d232ab5f2aad16')
	});


	__exports.REMOTE_MODEL_RECORDS = REMOTE_MODEL_RECORDS;
	function record(bytes, sha256) {
		return Object.freeze({ bytes, sha256 });
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteModelCatalog.js ----
{
	const __exports = __awtsmoosModule_61;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file RemoteModelCatalog.js
	 * @description Resolves immutable model identities exclusively to content-addressed Awtsmoos Drive URLs.
	 * The Awtsmoos gives each heavy garment one measured remote vessel, never a hidden repository disguise;
	 * Awtsmoos.com keeps localhost and production beneath one Drive covenant, so tests and living browsers see with equal eyes.
	 */

	const REMOTE_MODEL_RECORDS = __awtsmoosModule_62.REMOTE_MODEL_RECORDS;

	const REMOTE_MODEL_ROOT = 'https://awtsmoos.com/sites/firebase_drive_migration/assets/mitzvah-world/models/';


	__exports.REMOTE_MODEL_ROOT = REMOTE_MODEL_ROOT;
	/**
	 * @description Resolves one semantic model identity into its immutable remote Drive record.
	 * @param {string} relativePath Semantic identity such as `player/chossid.glb`.
	 * @param {object|null} [_locationLike=globalThis.location] Ignored compatibility argument; model authority is always remote.
	 * @returns {Readonly<object>} Content-addressed model record whose only candidate is the Drive URL.
	 */
	function remoteModelRecord(relativePath, _locationLike = globalThis.location) {
		const modelPath = normalizeModelPath(relativePath);
		const record = REMOTE_MODEL_RECORDS[modelPath];
		if (!record) throw new Error(`Unknown model identity: ${relativePath}`);
		const segments = modelPath.split('/');
		const filename = segments.at(-1);
		const folder = segments.slice(0, -1).join('/');
		const hashedPath = [folder, record.sha256, filename].filter(Boolean).join('/');
		const remoteUrl = `${REMOTE_MODEL_ROOT}${encodePath(hashedPath)}`;
		return Object.freeze({
			...record,
			candidates: Object.freeze([remoteUrl]),
			drivePath: `assets/mitzvah-world/models/${hashedPath}`,
			filename,
			path: modelPath,
			remoteUrl,
			source: 'remote',
			url: remoteUrl
		});
	}


	__exports.remoteModelRecord = remoteModelRecord;
	/** @returns {string} Immutable Drive URL for one semantic model identity. */
	function remoteModelUrl(relativePath, _locationLike = globalThis.location) {
		return remoteModelRecord(relativePath, _locationLike).remoteUrl;
	}


	__exports.remoteModelUrl = remoteModelUrl;
	/** @returns {string[]} The sole trusted remote candidate for a known identity or URL. */
	function modelUrlCandidates(value, _locationLike = globalThis.location) {
		const candidate = String(value || '').trim();
		const identity = REMOTE_MODEL_RECORDS[candidate]
			? candidate
			: Object.keys(REMOTE_MODEL_RECORDS).find(path => remoteModelRecord(path).remoteUrl === candidate);
		return identity ? [remoteModelRecord(identity).remoteUrl] : [];
	}


	__exports.modelUrlCandidates = modelUrlCandidates;
	/** @returns {'remote'} Model authority is Drive on every host, including localhost. */
	function modelSourceMode() {
		return 'remote';
	}


	__exports.modelSourceMode = modelSourceMode;
	/** @returns {boolean} True only for an exact immutable URL recorded in the Drive catalog. */
	function isTrustedModelUrl(value) {
		const candidate = String(value || '').trim();
		if (!candidate || candidate.includes('?') || candidate.includes('#')) return false;
		return catalogRecords().some(record => record.remoteUrl === candidate);
	}


	__exports.isTrustedModelUrl = isTrustedModelUrl;
	const isTrustedRemoteModelUrl = isTrustedModelUrl;


	__exports.isTrustedRemoteModelUrl = isTrustedRemoteModelUrl;
	/** @returns {Readonly<object>} Auditable catalog totals and remote-only policy evidence. */
	function remoteModelCatalogEvidence() {
		const records = Object.values(REMOTE_MODEL_RECORDS);
		return Object.freeze({
			bytes: records.reduce((sum, record) => sum + record.bytes, 0),
			models: records.length,
			policy: 'drive-authoritative-remote-only',
			remoteRoot: REMOTE_MODEL_ROOT,
			root: REMOTE_MODEL_ROOT
		});
	}


	__exports.remoteModelCatalogEvidence = remoteModelCatalogEvidence;
	function catalogRecords() {
		return Object.keys(REMOTE_MODEL_RECORDS).map(path => remoteModelRecord(path));
	}

	function normalizeModelPath(value) {
		return String(value || '').replace(/^\/+/, '').replace(/\\/g, '/');
	}

	function encodePath(value) {
		return value.split('/').map(segment => encodeURIComponent(segment)).join('/');
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzConstants.js ----
{
	const __exports = __awtsmoosModule_60;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzConstants.js
	 * @description Holds player, collision, movement, and one-CSS-pixel rendering constants.
	 * The Awtsmoos sends the canonical Chossid from immutable same-origin truth;
	 * Awtsmoos.com preserves sharp CSS-pixel clarity without surplus Retina work in youth.
	 */

	const remoteModelUrl = __awtsmoosModule_61.remoteModelUrl;

	const PLAYER_MODEL_URL = remoteModelUrl('player/chossid.glb');

	__exports.PLAYER_MODEL_URL = PLAYER_MODEL_URL;
	const SIDE_SIGN = -1;

	__exports.SIDE_SIGN = SIDE_SIGN;
	const FACE_HEIGHT = 1.78;

	__exports.FACE_HEIGHT = FACE_HEIGHT;
	const MAX_STEP = 0.96;

	__exports.MAX_STEP = MAX_STEP;
	const STEP_DOWN = 0.72;

	__exports.STEP_DOWN = STEP_DOWN;
	const MAX_SLOPE_NORMAL = 0.72;

	__exports.MAX_SLOPE_NORMAL = MAX_SLOPE_NORMAL;
	const WALK_SPEED = 3.7;

	__exports.WALK_SPEED = WALK_SPEED;
	const RUN_SPEED = 8.85;

	__exports.RUN_SPEED = RUN_SPEED;
	const MAX_RENDER_DPR = 1;

	__exports.MAX_RENDER_DPR = MAX_RENDER_DPR;
	const PLAYER_RADIUS = 0.38;

	__exports.PLAYER_RADIUS = PLAYER_RADIUS;
	const PLAYER_HEIGHT = 1.72;

	__exports.PLAYER_HEIGHT = PLAYER_HEIGHT;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageArrivalSpatialContract.js ----
{
	const __exports = __awtsmoosModule_64;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file VillageArrivalSpatialContract.js
	 * @description Holds pure village arrival geometry with human-scale third-person framing and no runtime side effects.
	 * The Awtsmoos places the traveler inside the world rather than shrinking the soul beneath a distant eye;
	 * Awtsmoos.com keeps the Chossid at authored scale while camera distance and field of view let human presence fill the sky.
	 */

	const VILLAGE_ARRIVAL_PLAYER = Object.freeze({
		facing: Math.PI,
		x: 0,
		z: 104
	});


	__exports.VILLAGE_ARRIVAL_PLAYER = VILLAGE_ARRIVAL_PLAYER;
	const VILLAGE_ARRIVAL_CAMERA = Object.freeze({
		clearingRadius: 15,
		clearingX: 0,
		clearingZ: 113,
		distance: 8.5,
		fov: 56,
		maxDistance: 24,
		minDistance: 2.2,
		pitch: 0.26,
		yaw: 2.86
	});


	__exports.VILLAGE_ARRIVAL_CAMERA = VILLAGE_ARRIVAL_CAMERA;
	const VILLAGE_ARRIVAL_SIGN = Object.freeze({
		x: -7,
		yaw: 0.12,
		z: 96
	});


	__exports.VILLAGE_ARRIVAL_SIGN = VILLAGE_ARRIVAL_SIGN;
	const VILLAGE_ARRIVAL_ENTRANCE = Object.freeze({
		x: 0,
		z: 101
	});


	__exports.VILLAGE_ARRIVAL_ENTRANCE = VILLAGE_ARRIVAL_ENTRANCE;
	const VILLAGE_ARRIVAL_CLEARINGS = Object.freeze([
		Object.freeze({ id: 'arrival-spawn', radius: 16, x: 0, z: 104 }),
		Object.freeze({
			id: 'arrival-camera',
			radius: VILLAGE_ARRIVAL_CAMERA.clearingRadius,
			x: VILLAGE_ARRIVAL_CAMERA.clearingX,
			z: VILLAGE_ARRIVAL_CAMERA.clearingZ
		})
	]);


	__exports.VILLAGE_ARRIVAL_CLEARINGS = VILLAGE_ARRIVAL_CLEARINGS;
	function arrivalPlayerScreenFraction(playerHeight = 1.72) {
		const angularHeight = 2 * Math.atan(
			playerHeight / (2 * VILLAGE_ARRIVAL_CAMERA.distance)
		);
		return angularHeight / radians(VILLAGE_ARRIVAL_CAMERA.fov);
	}


	__exports.arrivalPlayerScreenFraction = arrivalPlayerScreenFraction;
	function radians(degrees) {
		return degrees * Math.PI / 180;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzPlayerStateFactory.js ----
{
	const __exports = __awtsmoosModule_63;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzPlayerStateFactory.js
	 * @description Creates bootstrap and canonical gameplay identity from pure arrival geometry so local player state never wakes nature scheduling as a hidden module-load side effect.
	 * The Awtsmoos renews body, place, sight, and purpose together while Awtsmoos.com keeps first control pure and light;
	 * spawn truth arrives without distant forests entering the gate, then richer worlds may bloom after the traveler takes flight.
	 */

	const VILLAGE_ARRIVAL_PLAYER = __awtsmoosModule_64.VILLAGE_ARRIVAL_PLAYER;
	const FACE_HEIGHT = __awtsmoosModule_60.FACE_HEIGHT;

	const PLAYER_SPAWN = VILLAGE_ARRIVAL_PLAYER;


	__exports.PLAYER_SPAWN = PLAYER_SPAWN;
	function createBootstrapPlayerStats() {
		return {
			armor: 3,
			face: '🎩',
			health: 100,
			level: 1,
			maxHealth: 100,
			name: 'Chossid',
			xp: 0,
			xpMax: 100
		};
	}


	__exports.createBootstrapPlayerStats = createBootstrapPlayerStats;
	function createBootstrapPlayerState() {
		return {
			action: 'idle',
			airPhase: 'ground',
			clip: '',
			collisionEnabled: true,
			contacts: [],
			defeated: false,
			faceHeight: FACE_HEIGHT,
			facing: 0,
			grounded: true,
			inputLocked: false,
			jumpsUsed: 0,
			level: 'meadow',
			lifecycle: 'active',
			moving: false,
			multiplayer: null,
			renderY: 0,
			runMode: false,
			targetingEnabled: true,
			velY: 0,
			x: 0,
			y: 0,
			z: 0
		};
	}


	__exports.createBootstrapPlayerState = createBootstrapPlayerState;
	function createEretzPlayerStats() {
		return {
			face: '🎩',
			health: 100,
			level: 1,
			name: 'Chossid',
			xp: 0,
			xpMax: 100
		};
	}


	__exports.createEretzPlayerStats = createEretzPlayerStats;
	function createEretzPlayerState(initialY, feet, player, spawn = PLAYER_SPAWN) {
		return {
			airPhase: 'ground',
			ceilingHit: null,
			clip: '',
			contacts: [],
			faceHeight: FACE_HEIGHT,
			facing: spawn.facing,
			feet,
			grounded: true,
			jumpClock: 0,
			level: 'eretz',
			moving: false,
			normals: [],
			player,
			renderY: initialY,
			runMode: false,
			slopeState: 'walk',
			stepState: 'flat',
			velY: 0,
			x: spawn.x,
			y: initialY,
			z: spawn.z
		};
	}

	__exports.createEretzPlayerState = createEretzPlayerState;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzPlayerRuntimeFactories.js ----
{
	const __exports = __awtsmoosModule_51;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzPlayerRuntimeFactories.js
	 * @description Creates grounded player roots and movement vessels that honor their soles.
	 * The Awtsmoos joins measured form to lawful earth while every instant becomes new;
	 * Awtsmoos.com keeps pivot, shadow, collision, and ascent within one truthful view.
	 */

	const Group = __awtsmoosModule_22.Group;
	const AwtsmoosCollisionMover = __awtsmoosModule_52.AwtsmoosCollisionMover;
	const JumpPhysics = __awtsmoosModule_59.JumpPhysics;
	const findMinWorldY = __awtsmoosModule_49.findMinWorldY;
	const MAX_SLOPE_NORMAL = __awtsmoosModule_60.MAX_SLOPE_NORMAL;
	const PLAYER_HEIGHT = __awtsmoosModule_60.PLAYER_HEIGHT;
	const PLAYER_RADIUS = __awtsmoosModule_60.PLAYER_RADIUS;
	const createEretzPlayerState = __awtsmoosModule_63.createEretzPlayerState;
	const createEretzPlayerStats = __awtsmoosModule_63.createEretzPlayerStats;

	__exports.createEretzPlayerState = createEretzPlayerState;
	__exports.createEretzPlayerStats = createEretzPlayerStats;

	const CANONICAL_PLAYER_SCALE = 1.52;


	__exports.CANONICAL_PLAYER_SCALE = CANONICAL_PLAYER_SCALE;
	function createGroundedCanonicalPlayer(scene, state) {
		scene.name = 'Awtsmoos_canonical_chossid_glb_scene';
		scene.visible = true;
		scene.position.set(0, 0, 0);
		scene.scale.set(
			CANONICAL_PLAYER_SCALE,
			CANONICAL_PLAYER_SCALE,
			CANONICAL_PLAYER_SCALE
		);
		scene.updateWorldMatrix?.();
		const measuredMinY = findMinWorldY(scene);
		const feetOffset = Number.isFinite(measuredMinY) ? -measuredMinY : 0;
		scene.position.y = feetOffset;
		scene.setBaseTransform?.();
		const model = new Group();
		model.name = 'Awtsmoos_grounded_canonical_chossid';
		model.userData = { canonicalPlayerRoot: true, feetOffset };
		model.position.set(
			state.x || 0,
			state.renderY ?? state.y ?? 0,
			state.z || 0
		);
		model.quaternion.set(
			0,
			Math.sin((state.facing || 0) / 2),
			0,
			Math.cos((state.facing || 0) / 2)
		);
		model.add(scene);
		model.setBaseTransform?.();
		return {
			feet: { measuredMinY, offset: feetOffset },
			model,
			visiblePlayer: scene
		};
	}


	__exports.createGroundedCanonicalPlayer = createGroundedCanonicalPlayer;
	function prepareCanonicalPlayerMeshes(model) {
		let count = 0;
		model.traverse?.(object => {
			if (!object.isMesh && !object.isSkinnedMesh) return;
			object.castShadow = true;
			object.receiveShadow = true;
			object.visible = true;
			object.userData ||= {};
			object.userData.realChossid = true;
			count += 1;
		});
		return count;
	}


	__exports.prepareCanonicalPlayerMeshes = prepareCanonicalPlayerMeshes;
	function createBootstrapPlayerVessels(foundation) {
		const playerModel = { footOffset: 0 };
		const collisionMover = foundation.collisionQuery
			? createEretzMover(foundation, playerModel)
			: null;
		const jumpPhysics = foundation.ground
			? createEretzJumpPhysics(foundation, playerModel)
			: null;
		return {
			collisionMover,
			jumpPhysics,
			mover: collisionMover
		};
	}


	__exports.createBootstrapPlayerVessels = createBootstrapPlayerVessels;
	function createEretzMover(foundation, playerModel) {
		return new AwtsmoosCollisionMover({
			footOffset: playerModel.footOffset,
			height: PLAYER_HEIGHT,
			octree: foundation.collisionQuery,
			radius: PLAYER_RADIUS
		});
	}


	__exports.createEretzMover = createEretzMover;
	function createEretzJumpPhysics(foundation, playerModel) {
		return new JumpPhysics({
			footOffset: playerModel.footOffset,
			ground: foundation.ground,
			maxSlopeNormal: MAX_SLOPE_NORMAL
		});
	}

	__exports.createEretzJumpPhysics = createEretzJumpPhysics;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapPlayerRuntime.js ----
{
	const __exports = __awtsmoosModule_20;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapPlayerRuntime.js
	 * @description Mounts immediate Chossid play and promotes the real grounded GLB just beyond first control.
	 * The Awtsmoos lets a humble local form answer the hand before the authored garment is revealed;
	 * Awtsmoos.com keeps state, collision, camera height, and movement alive while canonical humanity is sealed.
	 */

	const createBootstrapVisiblePlayer = __awtsmoosModule_21.createBootstrapVisiblePlayer;
	const scheduleBootstrapCanonicalPlayerHydration = __awtsmoosModule_36.scheduleBootstrapCanonicalPlayerHydration;
	const createBootstrapAnimationHandle = __awtsmoosModule_38.createBootstrapAnimationHandle;
	const isFallbackPlayer = __awtsmoosModule_38.isFallbackPlayer;
	const prepareBootstrapPlayerMeshes = __awtsmoosModule_38.prepareBootstrapPlayerMeshes;
	const createDeferredActorSystems = __awtsmoosModule_39.createDeferredActorSystems;
	const installCanonicalChossidAnimation = __awtsmoosModule_40.installCanonicalChossidAnimation;
	const hydrateReadablePlayerMaterials = __awtsmoosModule_50.hydrateReadablePlayerMaterials;
	const createBootstrapPlayerVessels = __awtsmoosModule_51.createBootstrapPlayerVessels;
	const prepareCanonicalPlayerMeshes = __awtsmoosModule_51.prepareCanonicalPlayerMeshes;
	const createBootstrapPlayerState = __awtsmoosModule_63.createBootstrapPlayerState;
	const createBootstrapPlayerStats = __awtsmoosModule_63.createBootstrapPlayerStats;

	const CANONICAL_PLAYER_SCALE = 1.52;

	function createBootstrapPlayerRuntime(foundation) {
		const model = foundation.playerGltf.scene;
		const fallback = isFallbackPlayer(foundation.playerGltf);
		model.name ||= 'Awtsmoos_minimal_meadow_player';
		model.position.set(0, 0, 0);
		model.scale?.set?.(
			CANONICAL_PLAYER_SCALE,
			CANONICAL_PLAYER_SCALE,
			CANONICAL_PLAYER_SCALE
		);
		model.visible = true;
		model.setBaseTransform?.();
		let meshCount = fallback
			? prepareBootstrapPlayerMeshes(model)
			: prepareCanonicalPlayerMeshes(model);
		let visiblePlayer = model;
		if (meshCount === 0) {
			visiblePlayer = createBootstrapVisiblePlayer();
			model.add(visiblePlayer);
			meshCount = visiblePlayer.userData.meshCount;
		}
		if (!model.parent) foundation.scene.add(model);
		const state = createBootstrapPlayerState();
		const deferredActors = createDeferredActorSystems();
		const player = createBootstrapAnimationHandle(
			foundation.playerGltf.animations || [],
			state
		);
		const runtime = {
			...foundation,
			...createBootstrapPlayerVessels(foundation),
			...deferredActors,
			feet: 0,
			footOffset: 0,
			model,
			player,
			playerStats: createBootstrapPlayerStats(),
			state,
			visiblePlayer,
			worldActorsReady: false
		};
		startCanonicalPlayer(
			runtime,
			foundation,
			!fallback && visiblePlayer === model,
			meshCount
		);
		return runtime;
	}


	__exports.createBootstrapPlayerRuntime = createBootstrapPlayerRuntime;
	function startCanonicalPlayer(runtime, foundation, alreadyCanonical, meshCount) {
		if (!alreadyCanonical) {
			scheduleBootstrapCanonicalPlayerHydration(
				runtime,
				foundation,
				foundation.environment || globalThis
			);
			return;
		}
		const materials = hydrateReadablePlayerMaterials(runtime.visiblePlayer);
		const animation = installCanonicalChossidAnimation(
			runtime,
			runtime.playerGltf,
			runtime.visiblePlayer
		);
		runtime.canonicalPlayer = Object.freeze({
			animations: runtime.playerGltf.animations?.length || 0,
			defaultClip: animation.defaultClip,
			materials,
			meshes: meshCount,
			scale: CANONICAL_PLAYER_SCALE,
			status: 'ready'
		});
		runtime.canonicalPlayerHydrationStage = 'ready';
		runtime.canonicalPlayerPromise = Promise.resolve(runtime.canonicalPlayer);
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapRuntimeDiagnostics.js ----
{
	const __exports = __awtsmoosModule_65;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapRuntimeDiagnostics.js
	 * @description Exposes live control, rendering, nature, hydration, district, and collision truth during staged play.
	 * The Awtsmoos renews witness with the world it measures; Awtsmoos.com reports the active renderer and living nature
	 * without leaking mutable systems, so bootstrap, promotion, and every richer garment remain inspectable as they change.
	 */

	function createBootstrapRuntimeDiagnostics(
		runtime,
		movement,
		qualityProfile,
		boot
	) {
		const diagnostics = {
			assets: runtime.assets,
			bootPhases: () => boot.snapshot(),
			bootstrap: true,
			bus: runtime.bus,
			districtStreaming: () => districtSnapshot(runtime),
			frameCadence: () => runtime.frameCadence?.snapshot?.() || null,
			ground: runtime.ground,
			groundSampler: runtime.groundSampler,
			input: runtime.input,
			joystick: runtime.joystick,
			mainOctree: runtime.mainOctree,
			movement,
			movementState: () => movement?.snapshot?.() || null,
			player: runtime.player,
			qualityProfile: { ...qualityProfile },
			realNature: () => realNatureSnapshot(runtime),
			rendererHydration: () => hydrationSnapshot(runtime, diagnostics),
			rendererState: () => rendererSnapshot(runtime),
			runtime,
			state: runtime.state,
			stateSnapshot: () => ({ ...runtime.state }),
			terrain: runtime.terrain,
			worldStats: () => worldSnapshot(runtime)
		};
		return diagnostics;
	}


	__exports.createBootstrapRuntimeDiagnostics = createBootstrapRuntimeDiagnostics;
	function worldSnapshot(runtime) {
		const collision = collisionSnapshot(runtime);
		return {
			bootstrap: true,
			collision,
			collisionTriangles: collision.triangles,
			districts: districtSnapshot(runtime),
			realNature: realNatureSnapshot(runtime),
			renderer: rendererSnapshot(runtime),
			terrain: runtime.terrain.stats
		};
	}

	function collisionSnapshot(runtime) {
		return runtime.mainOctree?.diagnostics?.() || {
			spatialIndex: null,
			triangles: 0
		};
	}

	function districtSnapshot(runtime) {
		const state = runtime.districtStreaming;
		return state ? {
			active: Number(state.active) || 0,
			colliders: Number(state.colliders) || 0,
			completed: state.completed,
			finishedAt: state.finishedAt,
			loaded: [...state.loaded],
			meshes: state.meshes,
			released: Number(state.released) || 0,
			startedAt: state.startedAt,
			status: state.status,
			total: state.total,
			triangles: Number(state.triangles) || 0
		} : null;
	}

	function rendererSnapshot(runtime) {
		const stats = runtime.renderer.stats || {};
		return {
			backend: runtime.renderer.backend,
			cadence: runtime.frameCadence?.snapshot?.() || null,
			draws: Number(stats.draws) || 0,
			frames: Number(stats.frames) || Number(runtime.richFrames) || Number(runtime.bootstrapFrames) || 0,
			hydration: runtime.renderer.hydrationState,
			lastFrameError: runtime.lastFrameError,
			meshes: Number(stats.meshes) || 0,
			phase: stats.phase || 'unknown',
			triangles: Number(stats.triangles) || 0
		};
	}

	function hydrationSnapshot(runtime, diagnostics) {
		return Object.freeze({
			error: errorSummary(diagnostics.rendererHydrationError),
			hasDelegate: Boolean(runtime.renderer?.delegate),
			policy: diagnostics.rendererHydrationPolicy || null,
			promise: diagnostics.rendererHydrationPromise ? 'scheduled' : 'absent',
			stage: diagnostics.rendererHydrationStage || 'idle',
			state: runtime.renderer?.hydrationState || 'unavailable'
		});
	}

	function realNatureSnapshot(runtime) {
		return runtime.realNature?.snapshot?.()
			|| runtime.nature?.snapshot?.()
			|| null;
	}

	function errorSummary(error) {
		return error ? Object.freeze({
			message: error.message || String(error),
			name: error.name || 'Error'
		}) : null;
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/performance/FrameBudgetWindow.js ----
{
	const __exports = __awtsmoosModule_67;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file FrameBudgetWindow.js
	 * @description Keeps bounded frame evidence with constant-time writes and clone-safe statistical views.
	 * Netzach remembers enough rhythm to reveal pressure while Gevurah forbids history from growing without end;
	 * the Awtsmoos recreates every interval before measurement can name it, and Awtsmoos.com keeps the vessel light in time.
	 */

	const HARD_FRAME_MS = 17;

	class FrameBudgetWindow {
		/** @param {number} capacity Maximum retained foreground frame intervals. */
		constructor(capacity = 360) {
			this.capacity = Math.max(30, Math.floor(capacity));
			this.samples = [];
			this.cursor = 0;
		}

		/**
		 * Records one active-frame interval without shifting the retained array.
		 * @param {number} intervalMs Foreground frame interval in milliseconds.
		 */
		add(intervalMs) {
			const value = Number(intervalMs);
			if (!Number.isFinite(value) || value <= 0 || value > 1000) {
				return;
			}
			if (this.samples.length < this.capacity) {
				this.samples.push(value);
				return;
			}
			this.samples[this.cursor] = value;
			this.cursor = (this.cursor + 1) % this.capacity;
		}

		/** Clears retained evidence without reallocating the window object. */
		clear() {
			this.samples.length = 0;
			this.cursor = 0;
		}

		/** @returns {object} Clone-safe frame-rate and percentile evidence. */
		view() {
			if (!this.samples.length) {
				return emptyView();
			}
			const sorted = [...this.samples].sort((first, second) => first - second);
			const averageMs = average(this.samples);
			const hardMisses = this.samples.reduce((count, value) => {
				return count + (value > HARD_FRAME_MS ? 1 : 0);
			}, 0);
			return {
				samples: this.samples.length,
				averageMs,
				averageFps: fps(averageMs),
				p95Ms: percentile(sorted, 0.95),
				maxMs: sorted[sorted.length - 1],
				onePercentLowFps: fps(percentile(sorted, 0.99)),
				pointOnePercentLowFps: fps(percentile(sorted, 0.999)),
				hardMissRate: hardMisses / this.samples.length,
				hardFrameMs: HARD_FRAME_MS
			};
		}

		/** @returns {object} Compatibility alias for diagnostics that prefer snapshot terminology. */
		snapshot() {
			return this.view();
		}
	}


	__exports.FrameBudgetWindow = FrameBudgetWindow;
	function average(values) {
		return values.reduce((sum, value) => sum + value, 0) / values.length;
	}

	function percentile(sorted, ratio) {
		const index = Math.min(
			sorted.length - 1,
			Math.max(0, Math.ceil(sorted.length * ratio) - 1)
		);
		return sorted[index];
	}

	function fps(intervalMs) {
		return intervalMs > 0 ? 1000 / intervalMs : 0;
	}

	function emptyView() {
		return {
			samples: 0,
			averageMs: 0,
			averageFps: 0,
			p95Ms: 0,
			maxMs: 0,
			onePercentLowFps: 0,
			pointOnePercentLowFps: 0,
			hardMissRate: 0,
			hardFrameMs: HARD_FRAME_MS
		};
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapFrameExecution.js ----
{
	const __exports = __awtsmoosModule_68;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapFrameExecution.js
	 * @description Owns one gameplay frame's simulation, render, presentation cadence, and diagnostic bookkeeping.
	 * Yesod routes the living frame while Malchus receives one rendered world, never a duplicate combat pulse in disguise;
	 * the Awtsmoos recreates simulation and image each instant, and Awtsmoos.com keeps every phase explicit before the eyes.
	 */

	const UI_REFRESH_INTERVAL_MS = 100;

	/** Advances gameplay exactly once through the authoritative enriched or bootstrap path. */
	function advanceBootstrapGameplay(runtime, movement, deltaSeconds) {
		movement.update(deltaSeconds);
		runtime.coreMechanics?.update?.(deltaSeconds);
		if (runtime.updateWorldSystems) {
			runtime.updateWorldSystems(deltaSeconds);
			return;
		}
		runtime.combat?.update?.(deltaSeconds);
	}


	__exports.advanceBootstrapGameplay = advanceBootstrapGameplay;
	/** Submits the settled world state to the renderer. */
	function renderBootstrapGameplay(runtime, currentTime) {
		runtime.renderer.setInteractor(
			runtime.state,
			currentTime / 1000
		);
		runtime.renderer.render(
			runtime.scene,
			runtime.camera
		);
	}


	__exports.renderBootstrapGameplay = renderBootstrapGameplay;
	/** Refreshes HUD/minimap at a presentation cadence rather than every display frame. */
	function refreshBootstrapPresentation(
		runtime,
		currentTime,
		lastUiAt
	) {
		if (currentTime - lastUiAt < UI_REFRESH_INTERVAL_MS) {
			return lastUiAt;
		}
		runtime.bootstrapHud?.refresh?.();
		runtime.bootstrapMinimap?.refresh?.();
		return currentTime;
	}


	__exports.refreshBootstrapPresentation = refreshBootstrapPresentation;
	/** Records one successful visible frame without allocating another diagnostics object. */
	function recordBootstrapFrameSuccess(runtime, currentTime, source) {
		runtime.bootstrapFrames += 1;
		if (runtime.updateWorldSystems) {
			runtime.enrichedFrames += 1;
		}
		runtime.lastFrameAt = currentTime;
		runtime.runtimeFrameSource = source;
		runtime.lastFrameError = null;
	}


	__exports.recordBootstrapFrameSuccess = recordBootstrapFrameSuccess;
	/** Publishes one frame failure without letting the visual heartbeat die. */
	function recordBootstrapFrameFailure(runtime, environment, error) {
		runtime.lastFrameError = error?.stack || String(error);
		environment.AwtsmoosError = runtime.lastFrameError;
	}


	__exports.recordBootstrapFrameFailure = recordBootstrapFrameFailure;
	/** Primes visible movement/combat state before the first scheduled animation frame. */
	function primeBootstrapGameplay(runtime, movement, currentTime) {
		movement.update(0.001);
		if (!runtime.updateWorldSystems) {
			runtime.combat?.update?.(0.001);
		}
		renderBootstrapGameplay(runtime, currentTime);
	}

	__exports.primeBootstrapGameplay = primeBootstrapGameplay;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapFrameScheduler.js ----
{
	const __exports = __awtsmoosModule_69;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapFrameScheduler.js
	 * @description Owns one display-synchronized gameplay pulse without racing a timer against every animation frame.
	 * Netzach carries the visible rhythm while Gevurah permits a timer only when the browser offers no animation-frame vessel;
	 * the Awtsmoos recreates every pulse before time can count it, and Awtsmoos.com keeps the hot path quiet and level.
	 */

	class BootstrapFrameScheduler {
		/**
		 * @param {object} environment Browser-like scheduling environment.
		 * @param {number} fallbackMs Timer delay used only when requestAnimationFrame is unavailable.
		 */
		constructor(environment = globalThis, fallbackMs = 40) {
			this.environment = environment;
			this.fallbackMs = Math.max(8, Number(fallbackMs) || 40);
			this.requestFrame = environment.requestAnimationFrame?.bind(environment) || null;
			this.cancelFrame = environment.cancelAnimationFrame?.bind(environment) || null;
			this.scheduleTimer = environment.setTimeout?.bind(environment)
				|| globalThis.setTimeout?.bind(globalThis)
				|| null;
			this.cancelTimer = environment.clearTimeout?.bind(environment)
				|| globalThis.clearTimeout?.bind(globalThis)
				|| null;
			this.callback = null;
			this.pendingId = null;
			this.pendingKind = null;
			this.onAnimationFrame = timestamp => {
				this.flush(timestamp, 'animation-frame');
			};
			this.onTimer = () => {
				this.flush(this.now(), 'timer-fallback');
			};
		}

		/**
		 * Schedules one future gameplay pulse and returns this stable cancellable handle.
		 * @param {(timestamp:number, source:string)=>void} callback Frame callback.
		 * @returns {BootstrapFrameScheduler} Stable scheduler handle.
		 */
		schedule(callback) {
			this.callback = callback;
			if (this.pendingId !== null) {
				return this;
			}
			if (this.requestFrame) {
				this.pendingKind = 'animation-frame';
				this.pendingId = this.requestFrame(this.onAnimationFrame);
				return this;
			}
			if (this.scheduleTimer) {
				this.pendingKind = 'timer-fallback';
				this.pendingId = this.scheduleTimer(this.onTimer, this.fallbackMs);
				return this;
			}
			throw new Error('MitzvahWorld requires requestAnimationFrame or setTimeout scheduling.');
		}

		/** Cancels the single pending pulse and clears its retained callback. */
		cancel() {
			if (this.pendingId !== null) {
				if (this.pendingKind === 'animation-frame') {
					this.cancelFrame?.(this.pendingId);
				} else {
					this.cancelTimer?.(this.pendingId);
				}
			}
			this.callback = null;
			this.pendingId = null;
			this.pendingKind = null;
		}

		flush(timestamp, source) {
			const callback = this.callback;
			this.callback = null;
			this.pendingId = null;
			this.pendingKind = null;
			if (callback) {
				callback(timestamp, source);
			}
		}

		now() {
			return this.environment.performance?.now?.() ?? Date.now();
		}
	}


	__exports.BootstrapFrameScheduler = BootstrapFrameScheduler;
	/** @returns {BootstrapFrameScheduler} One stable main-game scheduler. */
	function createBootstrapFrameScheduler(environment = globalThis, fallbackMs = 40) {
		return new BootstrapFrameScheduler(environment, fallbackMs);
	}

	__exports.createBootstrapFrameScheduler = createBootstrapFrameScheduler;

}

// ---- libs/awtsmoos-procedural-core/src/core/movement/MovementVelocityMath.js ----
{
	const __exports = __awtsmoosModule_72;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file MovementVelocityMath.js
	 * @description Keeps reusable horizontal velocity arithmetic finite, bounded, and independent of heading.
	 * Gevurah gives the finite rate while Tiferes keeps every compass direction sharing one measured fate;
	 * the Awtsmoos renews each vector without diagonal excess, and Awtsmoos.com carries that honest motion law from world to world in grace.
	 */

	/**
	 * @description Converts arbitrary numeric movement input into a finite number.
	 * @param {*} value Candidate numeric value.
	 * @param {number} fallback Finite fallback used when conversion fails.
	 * @returns {number} Finite numeric value.
	 */
	function finiteMovementNumber(value, fallback = 0) {
		const numericValue = Number(value);

		return Number.isFinite(numericValue)
			? numericValue
			: fallback;
	}


	__exports.finiteMovementNumber = finiteMovementNumber;
	/**
	 * @description Resolves a strictly positive movement option or its positive fallback.
	 * @param {*} value Candidate positive numeric value.
	 * @param {number} fallback Positive fallback value.
	 * @returns {number} Strictly positive movement number.
	 */
	function positiveMovementNumber(value, fallback) {
		const resolved = finiteMovementNumber(value);

		return resolved > 0
			? resolved
			: fallback;
	}


	__exports.positiveMovementNumber = positiveMovementNumber;
	/**
	 * @description Clamps a movement control factor into the inclusive zero-to-one interval.
	 * @param {*} value Candidate control factor.
	 * @param {number} fallback Fallback control factor.
	 * @returns {number} Bounded control factor.
	 */
	function boundedMovementUnit(value, fallback) {
		const resolved = finiteMovementNumber(value, fallback);
		return Math.max(0, Math.min(1, resolved));
	}


	__exports.boundedMovementUnit = boundedMovementUnit;
	/**
	 * @description Moves a two-dimensional velocity toward its target using one Euclidean change budget.
	 * @param {{x?:number,z?:number}} current Current horizontal velocity.
	 * @param {{x?:number,z?:number}} target Desired horizontal velocity.
	 * @param {number} maximumChange Maximum allowed Euclidean velocity change.
	 * @returns {{x:number,z:number}} New velocity no farther than the requested change budget.
	 */
	function moveMovementVectorToward(current, target, maximumChange) {
		const currentX = finiteMovementNumber(current?.x);
		const currentZ = finiteMovementNumber(current?.z);
		const targetX = finiteMovementNumber(target?.x);
		const targetZ = finiteMovementNumber(target?.z);
		const differenceX = targetX - currentX;
		const differenceZ = targetZ - currentZ;
		const differenceLength = Math.hypot(differenceX, differenceZ);
		const boundedChange = Math.max(0, finiteMovementNumber(maximumChange));

		if (differenceLength === 0 || differenceLength <= boundedChange) {
			return {
				x: targetX,
				z: targetZ
			};
		}

		if (boundedChange === 0) {
			return {
				x: currentX,
				z: currentZ
			};
		}

		const changeRatio = boundedChange / differenceLength;
		return {
			x: currentX + differenceX * changeRatio,
			z: currentZ + differenceZ * changeRatio
		};
	}

	__exports.moveMovementVectorToward = moveMovementVectorToward;

}

// ---- libs/awtsmoos-procedural-core/src/core/movement/MovementVelocity.js ----
{
	const __exports = __awtsmoosModule_71;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file MovementVelocity.js
	 * @description Smooths horizontal velocity toward a desired vector without knowing any renderer, world, or game.
	 * Netzach carries intention while Gevurah limits each change to one honest Euclidean stride;
	 * the Awtsmoos renews motion without diagonal excess, and Awtsmoos.com lets many worlds share the same measured ride.
	 */

	const boundedMovementUnit = __awtsmoosModule_72.boundedMovementUnit;
	const finiteMovementNumber = __awtsmoosModule_72.finiteMovementNumber;
	const moveMovementVectorToward = __awtsmoosModule_72.moveMovementVectorToward;
	const positiveMovementNumber = __awtsmoosModule_72.positiveMovementNumber;

	/**
	 * @description Creates a fresh horizontal velocity record.
	 * @param {object} initial Optional initial vector.
	 * @returns {{x:number,z:number}} Finite horizontal velocity.
	 */
	function createMovementVelocity(initial = {}) {
		return {
			x: finiteMovementNumber(initial.x),
			z: finiteMovementNumber(initial.z)
		};
	}


	__exports.createMovementVelocity = createMovementVelocity;
	/**
	 * @description Advances horizontal velocity toward its target with one frame-rate-stable Euclidean change budget.
	 * @param {object} current Current velocity.
	 * @param {object} target Desired velocity.
	 * @param {number} deltaSeconds Frame duration in seconds.
	 * @param {object} options Acceleration, deceleration, grounded, airControl, and maxDeltaSeconds.
	 * @returns {{x:number,z:number}} New velocity record.
	 */
	function advanceMovementVelocity(current, target, deltaSeconds, options = {}) {
		const delta = Math.min(
			Math.max(0, finiteMovementNumber(deltaSeconds)),
			positiveMovementNumber(options.maxDeltaSeconds, 0.05)
		);
		const currentVector = createMovementVelocity(current);
		const targetVector = createMovementVelocity(target);
		const targetLength = Math.hypot(targetVector.x, targetVector.z);
		const currentLength = Math.hypot(currentVector.x, currentVector.z);
		const gainingSpeed = targetLength > currentLength + 0.0001;
		const baseRate = gainingSpeed
			? positiveMovementNumber(options.acceleration, 18)
			: positiveMovementNumber(options.deceleration, 24);
		const control = options.grounded === false
			? boundedMovementUnit(options.airControl, 0.48)
			: 1;
		const maximumChange = baseRate * control * delta;

		return moveMovementVectorToward(
			currentVector,
			targetVector,
			maximumChange
		);
	}


	__exports.advanceMovementVelocity = advanceMovementVelocity;
	/**
	 * @description Returns whether a velocity has meaningful horizontal magnitude.
	 * @param {object} velocity Horizontal velocity record.
	 * @param {number} epsilon Minimum meaningful magnitude.
	 * @returns {boolean} Whether the velocity is moving.
	 */
	function hasMovementVelocity(velocity, epsilon = 0.00001) {
		return Math.hypot(
			finiteMovementNumber(velocity?.x),
			finiteMovementNumber(velocity?.z)
		) > Math.max(0, finiteMovementNumber(epsilon));
	}

	__exports.hasMovementVelocity = hasMovementVelocity;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapMovementControllerSupport.js ----
{
	const __exports = __awtsmoosModule_73;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapMovementControllerSupport.js
	 * @description Owns movement action, yaw, and finite diagnostics outside frame orchestration.
	 * The Awtsmoos lets one journey produce many measured receipts; Awtsmoos.com keeps
	 * animation identity and snapshot formatting separate from collision and camera progression.
	 */

	function bootstrapMovementAction(state) {
		if (!state.grounded) return state.airPhase;
		if (!state.moving) return 'idle';
		return state.runMode ? 'run' : 'walk';
	}


	__exports.bootstrapMovementAction = bootstrapMovementAction;
	function setBootstrapMovementYaw(quaternion, yaw) {
		quaternion.set(
			0,
			Math.sin(yaw / 2),
			0,
			Math.cos(yaw / 2)
		);
	}


	__exports.setBootstrapMovementYaw = setBootstrapMovementYaw;
	function bootstrapMovementSnapshot(owner) {
		const mode = owner.lastIntent.movementMode || {};
		const state = owner.runtime.state;
		return {
			cameraMode: owner.lastIntent.cameraMode || 'bootstrap-rig',
			distance: owner.distance,
			effectiveMode: mode.effectiveMode || 'walk',
			frames: owner.frames,
			intent: owner.lastIntent,
			jumpsUsed: state.jumpsUsed,
			position: { x: state.x, y: state.y, z: state.z },
			runMode: state.runMode,
			selectedMode: mode.selectedMode || 'walk',
			travelFacing: state.travelFacing
		};
	}

	__exports.bootstrapMovementSnapshot = bootstrapMovementSnapshot;

}

// ---- libs/awtsmoos-procedural-core/src/core/movement/MovementIntent.js ----
{
	const __exports = __awtsmoosModule_75;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MovementIntent.js
	 * @description Normalizes renderer-free movement intentions into one bounded semantic record.
	 * The Awtsmoos renews every direction before the traveler chooses where to go;
	 * Awtsmoos.com keeps forward, strafe, and turn inside one clear vessel so every world may share the flow.
	 */

	/**
	 * Normalizes one movement axis record while preventing diagonal speed inflation.
	 * @param {object} axis Raw movement axes.
	 * @returns {{forward:number, strafe:number, turn:number}} Bounded semantic intent.
	 */
	function normalizeMovementIntent(axis = {}) {
		const forward = boundedAxis(axis.forward);
		const strafe = boundedAxis(axis.strafe);
		const length = Math.hypot(forward, strafe);
		const scale = length > 1 ? 1 / length : 1;

		return {
			forward: forward * scale,
			strafe: strafe * scale,
			turn: boundedAxis(axis.turn)
		};
	}


	__exports.normalizeMovementIntent = normalizeMovementIntent;
	/**
	 * Returns whether translational movement is materially requested.
	 * @param {object} intent Normalized or raw semantic intent.
	 * @param {number} epsilon Minimum meaningful magnitude.
	 * @returns {boolean} True when forward or strafe exceeds the threshold.
	 */
	function hasMovementIntent(intent = {}, epsilon = 0.00001) {
		return Math.hypot(finite(intent.forward), finite(intent.strafe)) > Math.max(0, epsilon);
	}


	__exports.hasMovementIntent = hasMovementIntent;
	/**
	 * Converts any finite numeric value into a -1..1 axis.
	 * @param {*} value Candidate numeric value.
	 * @returns {number} Bounded axis value.
	 */
	function boundedAxis(value) {
		return Math.max(-1, Math.min(1, finite(value)));
	}


	__exports.boundedAxis = boundedAxis;
	function finite(value) {
		return Number.isFinite(Number(value)) ? Number(value) : 0;
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/movement/MovementStep.js ----
{
	const __exports = __awtsmoosModule_76;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MovementStep.js
	 * @description Converts semantic movement intent into renderer-neutral world vectors and bounded steps.
	 * The Awtsmoos recreates every basis before distance is measured in space;
	 * Awtsmoos.com keeps actor-facing and camera-facing motion under one lawful interface of grace.
	 */

	/**
	 * Creates a horizontal basis from an actor-facing yaw.
	 * @param {number} facing Facing angle in radians.
	 * @returns {{forward:{x:number,z:number}, right:{x:number,z:number}}} Horizontal basis.
	 */
	function actorMovementBasis(facing = 0) {
		const forward = {
			x: Math.sin(finite(facing)),
			z: Math.cos(finite(facing))
		};

		return {
			forward,
			right: { x: forward.z, z: -forward.x }
		};
	}


	__exports.actorMovementBasis = actorMovementBasis;
	/**
	 * Creates a horizontal basis from a camera target and position, falling back to actor yaw.
	 * @param {object} camera Camera-like record.
	 * @param {number} fallbackFacing Fallback actor yaw.
	 * @returns {{forward:{x:number,z:number}, right:{x:number,z:number}}} Camera-relative basis.
	 */
	function cameraMovementBasis(camera, fallbackFacing = 0) {
		const target = camera?.target;
		const targetX = Array.isArray(target) ? target[0] : target?.x;
		const targetZ = Array.isArray(target) ? target[2] : target?.z;
		const dx = finite(targetX) - finite(camera?.position?.x);
		const dz = finite(targetZ) - finite(camera?.position?.z);
		const length = Math.hypot(dx, dz);
		const forward = length > 0.0001
			? { x: dx / length, z: dz / length }
			: actorMovementBasis(fallbackFacing).forward;

		return {
			forward,
			right: { x: -forward.z, z: forward.x }
		};
	}


	__exports.cameraMovementBasis = cameraMovementBasis;
	/**
	 * Converts intent plus a horizontal basis into a velocity-like vector of the requested magnitude.
	 * @param {object} basis Horizontal forward/right basis.
	 * @param {object} intent Normalized movement intent.
	 * @param {number} magnitude Desired units per second or units per step.
	 * @returns {{x:number,z:number}} Horizontal vector.
	 */
	function movementVectorFromBasis(basis, intent = {}, magnitude = 0) {
		const amount = Math.max(0, finite(magnitude));
		return {
			x: (finite(basis?.forward?.x) * finite(intent.forward)
				+ finite(basis?.right?.x) * finite(intent.strafe)) * amount,
			z: (finite(basis?.forward?.z) * finite(intent.forward)
				+ finite(basis?.right?.z) * finite(intent.strafe)) * amount
		};
	}


	__exports.movementVectorFromBasis = movementVectorFromBasis;
	/** Combines movement vectors without letting stacked input sources exceed the strongest source. */
	function combineMovementVectors(...vectors) {
		const total = vectors.reduce((sum, vector) => ({
			x: sum.x + finite(vector?.x),
			z: sum.z + finite(vector?.z)
		}), { x: 0, z: 0 });
		const limit = Math.max(0, ...vectors.map(vector => Math.hypot(finite(vector?.x), finite(vector?.z))));
		const length = Math.hypot(total.x, total.z);

		if (limit > 0 && length > limit) {
			const scale = limit / length;
			return { x: total.x * scale, z: total.z * scale };
		}

		return total;
	}


	__exports.combineMovementVectors = combineMovementVectors;
	/** Converts a horizontal velocity into a collision-ready displacement step. */
	function movementStepFromVelocity(velocity, deltaSeconds) {
		const delta = Math.max(0, finite(deltaSeconds));
		return { x: finite(velocity?.x) * delta, y: 0, z: finite(velocity?.z) * delta };
	}


	__exports.movementStepFromVelocity = movementStepFromVelocity;
	/** Returns travel-facing yaw from a horizontal vector. */
	function movementVectorFacing(vector, fallbackFacing = 0) {
		return Math.hypot(finite(vector?.x), finite(vector?.z)) > 0.00001
			? Math.atan2(finite(vector?.x), finite(vector?.z))
			: finite(fallbackFacing);
	}


	__exports.movementVectorFacing = movementVectorFacing;
	function finite(value) {
		return Number.isFinite(Number(value)) ? Number(value) : 0;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapInputAxis.js ----
{
	const __exports = __awtsmoosModule_77;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapInputAxis.js
	 * @description Joins every bootstrap joystick source into one bounded canonical movement axis without erasing intent.
	 * The Awtsmoos gathers many streams without making one vessel deny another's flow;
	 * Awtsmoos.com lets keyboard, tests, gamepads, and the floating thumb all point where the traveler should go.
	 */

	/**
	 * Creates the canonical bootstrap movement axis without mutating any input source.
	 * @param {object} runtime Immediate Mitzvah World runtime.
	 * @returns {object} Keyboard, pointer, and merged joystick movement values.
	 */
	function bootstrapInputAxis(runtime) {
		const baseAxis = runtime.input?.axis?.() || {};
		const baseVector = baseJoystickVector(baseAxis);
		const touchVector = touchJoystickVector(runtime.joystick?.vector);
		const joystick = normalizedSum(baseVector, touchVector);
		return {
			...baseAxis,
			joystickForward: canonicalZero(-joystick.y),
			joystickMagnitude: canonicalZero(Math.min(1, Math.hypot(joystick.x, joystick.y))),
			joystickStrafe: canonicalZero(joystick.x),
			joystickX: canonicalZero(joystick.x),
			joystickY: canonicalZero(joystick.y)
		};
	}


	__exports.bootstrapInputAxis = bootstrapInputAxis;
	/** Preserves joystick values already published by the canonical input axis. */
	function baseJoystickVector(axis) {
		return {
			x: finiteAxis(axis.joystickX ?? axis.joystickStrafe),
			y: finiteAxis(axis.joystickY ?? -finiteAxis(axis.joystickForward))
		};
	}

	/** Reads the floating touch joystick when the immediate runtime owns one. */
	function touchJoystickVector(vector = {}) {
		return {
			x: finiteAxis(vector.x),
			y: finiteAxis(vector.y)
		};
	}

	/** Adds compatible joystick vessels and keeps diagonals inside the unit circle. */
	function normalizedSum(first, second) {
		const x = first.x + second.x;
		const y = first.y + second.y;
		const magnitude = Math.hypot(x, y);
		if (magnitude <= 1 || magnitude === 0) {
			return { x, y };
		}
		return {
			x: x / magnitude,
			y: y / magnitude
		};
	}

	/** Keeps malformed input from leaking NaN or infinity into movement. */
	function finiteAxis(value) {
		const numeric = Number(value);
		if (!Number.isFinite(numeric)) {
			return 0;
		}
		return Math.max(-1, Math.min(1, numeric));
	}

	/** Removes signed zero so public movement state has one stable representation of rest. */
	function canonicalZero(value) {
		return Object.is(value, -0) ? 0 : value;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapMovementPace.js ----
{
	const __exports = __awtsmoosModule_78;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapMovementPace.js
	 * @description Resolves walk, run, Kavanah preparation pace, and retained travel-facing policy.
	 * The Awtsmoos lets intention carry weight without turning deliberate prayer into immobility;
	 * Awtsmoos.com composes mode, reward tradeoff, strafing, camera lock, and facing law explicitly.
	 */

	const RUN_SPEED = 7.2;
	const WALK_SPEED = 4.2;

	function bootstrapMovementSpeed(runtime, movementMode) {
		const base = movementMode.effectiveMode === 'run'
			? RUN_SPEED
			: WALK_SPEED;
		if (!runtime.combat?.kavanah?.active) return base;
		const multiplier = Math.max(
			0.45,
			Math.min(
				1,
				Number(runtime.playerStats?.kavanahMovementMultiplier || 1)
			)
		);
		return base * multiplier;
	}


	__exports.bootstrapMovementSpeed = bootstrapMovementSpeed;
	function bootstrapTravelFacingLocked(runtime, keyboard) {
		if (runtime.cameraRig?.locksPlayerFacing?.()) return true;
		return Math.abs(keyboard.strafe) > 0.001
			&& Math.abs(keyboard.forward) < 0.001;
	}

	__exports.bootstrapTravelFacingLocked = bootstrapTravelFacingLocked;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahMovementProfile.js ----
{
	const __exports = __awtsmoosModule_80;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahMovementProfile.js
	 * @description Keeps Mitzvah World's authored control feel as data while Procedural Core owns reusable movement law.
	 * Chesed grants a generous edge-jump window while Gevurah sharpens stopping and turning into a responsive stride;
	 * the Awtsmoos recreates each footfall before momentum can arise, and Awtsmoos.com keeps this story's taste outside shared physics.
	 */

	const MITZVAH_MOVEMENT_PROFILE = Object.freeze({
		airControl: 0.6,
		coyoteSeconds: 0.12,
		deceleration: 48,
		gravity: 21,
		jumpBufferSeconds: 0.14,
		jumpSpeeds: Object.freeze([9.2, 8.1]),
		landingClearance: 0.035,
		maxDeltaSeconds: 0.05,
		runAcceleration: 46,
		turnSpeed: 2.8,
		walkAcceleration: 38
	});

	__exports.MITZVAH_MOVEMENT_PROFILE = MITZVAH_MOVEMENT_PROFILE;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapMovementVelocity.js ----
{
	const __exports = __awtsmoosModule_79;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapMovementVelocity.js
	 * @description Builds one movement velocity target from focused shared basis law while keeping game-specific acceleration feel local.
	 * Chochmah gathers intent, Binah resolves actor and camera direction once, and Gevurah shapes acceleration into a responsive stride;
	 * the Awtsmoos recreates direction before any vector is born, and Awtsmoos.com keeps first play narrow while universal motion is carried on.
	 */

	const actorMovementBasis = __awtsmoosModule_76.actorMovementBasis;
	const cameraMovementBasis = __awtsmoosModule_76.cameraMovementBasis;
	const combineMovementVectors = __awtsmoosModule_76.combineMovementVectors;
	const movementVectorFromBasis = __awtsmoosModule_76.movementVectorFromBasis;
	const MITZVAH_MOVEMENT_PROFILE = __awtsmoosModule_80.MITZVAH_MOVEMENT_PROFILE;

	/**
	 * Builds the desired horizontal velocity while calculating the camera basis only once.
	 * @param {object} runtime Active game runtime.
	 * @param {object} state Canonical player state.
	 * @param {object} keyboard Normalized actor-relative input.
	 * @param {object} joystick Normalized camera-relative joystick input.
	 * @param {object} mouse Normalized camera-relative mouse input.
	 * @param {number} speed Authored movement speed.
	 * @returns {{x:number,z:number}} Desired horizontal velocity.
	 */
	function bootstrapDesiredVelocity(
		runtime,
		state,
		keyboard,
		joystick,
		mouse,
		speed
	) {
		const actorBasis = actorMovementBasis(state.facing);
		const cameraBasis = cameraMovementBasis(
			runtime.camera,
			state.facing
		);
		return combineMovementVectors(
			movementVectorFromBasis(actorBasis, keyboard, speed),
			movementVectorFromBasis(cameraBasis, joystick, speed),
			movementVectorFromBasis(cameraBasis, mouse, speed)
		);
	}


	__exports.bootstrapDesiredVelocity = bootstrapDesiredVelocity;
	/** @returns {object} Game-authored acceleration options consumed by shared Core velocity law. */
	function bootstrapVelocityOptions(state) {
		return {
			acceleration: state.runMode
				? MITZVAH_MOVEMENT_PROFILE.runAcceleration
				: MITZVAH_MOVEMENT_PROFILE.walkAcceleration,
			airControl: MITZVAH_MOVEMENT_PROFILE.airControl,
			deceleration: MITZVAH_MOVEMENT_PROFILE.deceleration,
			grounded: state.grounded !== false,
			maxDeltaSeconds: MITZVAH_MOVEMENT_PROFILE.maxDeltaSeconds
		};
	}

	__exports.bootstrapVelocityOptions = bootstrapVelocityOptions;

}

// ---- libs/awtsmoos-procedural-core/src/core/movement/VerticalKinematics.js ----
{
	const __exports = __awtsmoosModule_82;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file VerticalKinematics.js
	 * @description Supplies game-neutral vertical launch, gravity, airborne integration, and landing transitions.
	 * The Awtsmoos renews ascent and descent from the same source beyond above and below;
	 * Awtsmoos.com keeps the arithmetic pure so each game may choose its own jump story while sharing one physical flow.
	 */

	/**
	 * Captures the current finite vertical position before a frame advances.
	 * @param {object} state Mutable body state.
	 * @returns {number} Captured previous height.
	 */
	function captureVerticalPosition(state) {
		const previous = finite(state.renderY, state.y);
		state.previousRenderY = previous;
		return previous;
	}


	__exports.captureVerticalPosition = captureVerticalPosition;
	/**
	 * Launches a body upward without deciding whether the game permits the jump.
	 * @param {object} state Mutable body state.
	 * @param {number} speed Positive launch speed.
	 * @param {string} phase Game-facing airborne phase label.
	 * @returns {object} Mutated body state.
	 */
	function launchVerticalMotion(state, speed, phase = 'rising') {
		state.grounded = false;
		state.velY = Math.max(0, finite(speed));
		state.airPhase = phase;
		return state;
	}


	__exports.launchVerticalMotion = launchVerticalMotion;
	/**
	 * Integrates gravity and vertical position for one bounded frame.
	 * @param {object} state Mutable body state.
	 * @param {number} deltaSeconds Frame duration in seconds.
	 * @param {number} gravity Positive downward acceleration.
	 * @returns {object} Mutated body state.
	 */
	function integrateVerticalMotion(state, deltaSeconds, gravity = 21) {
		if (state.grounded) {
			return state;
		}
		const delta = Math.min(Math.max(0, finite(deltaSeconds)), 0.1);
		state.velY = finite(state.velY) - Math.max(0, finite(gravity)) * delta;
		state.renderY = finite(state.renderY, state.y) + state.velY * delta;
		state.y = state.renderY;
		if (state.velY < 0) {
			state.airPhase = 'falling';
		}
		return state;
	}


	__exports.integrateVerticalMotion = integrateVerticalMotion;
	/**
	 * Lands a body on an authoritative finite ground height.
	 * @param {object} state Mutable body state.
	 * @param {number} groundY Authoritative ground height.
	 * @returns {object} Mutated grounded state.
	 */
	function landVerticalMotion(state, groundY) {
		const ground = finite(groundY);
		state.renderY = ground;
		state.y = ground;
		state.groundY = ground;
		state.velY = 0;
		state.grounded = true;
		state.airPhase = 'ground';
		return state;
	}


	__exports.landVerticalMotion = landVerticalMotion;
	/** Returns whether the body remains clearly above its authoritative ground. */
	function isBodyAboveGround(state, groundY, clearance = 0.035) {
		return !state.grounded
			&& finite(state.renderY, state.y) > finite(groundY) + Math.max(0, finite(clearance));
	}


	__exports.isBodyAboveGround = isBodyAboveGround;
	function finite(primary, fallback = 0) {
		if (Number.isFinite(Number(primary))) {
			return Number(primary);
		}
		return Number.isFinite(Number(fallback)) ? Number(fallback) : 0;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowGroundSupport.js ----
{
	const __exports = __awtsmoosModule_83;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowGroundSupport.js
	 * @description Resolves terrain and all exact house supports through one vertical authority.
	 * The Awtsmoos sustains meadow, threshold, room, tread, and landing without confusion;
	 * Awtsmoos.com always prefers a valid interior floor above terrain and records its source.
	 */

	function minimalMeadowGroundHeight(
		runtime, x, z, currentY, previousY = currentY
	) {
		return minimalMeadowGroundReceipt(runtime, x, z, currentY, previousY).height;
	}


	__exports.minimalMeadowGroundHeight = minimalMeadowGroundHeight;
	function minimalMeadowGroundReceipt(
		runtime, x, z, currentY, previousY = currentY
	) {
		const terrain = Number(runtime.terrain?.heightAt?.(x, z)) || 0;
		const support = runtime.houses?.supportReceiptAt?.(
			x, z, currentY, previousY
		) || legacySupport(runtime, x, z, currentY);
		const supported = Number.isFinite(support?.height) && support.height >= terrain;
		return {
			height: supported ? support.height : terrain,
			profileId: supported ? support.profileId : null,
			source: supported ? support.kind : 'terrain',
			support: supported ? support.height : null,
			terrain
		};
	}


	__exports.minimalMeadowGroundReceipt = minimalMeadowGroundReceipt;
	function legacySupport(runtime, x, z, currentY) {
		const height = runtime.houses?.stairHeightAt?.(x, z, currentY);
		return Number.isFinite(height)
			? { height, kind: 'discrete-stair-tread', profileId: null }
			: null;
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/movement/JumpWindowState.js ----
{
	const __exports = __awtsmoosModule_85;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file JumpWindowState.js
	 * @description Tracks renderer-free jump buffering and coyote grace without owning any game's jump count or event policy.
	 * The Awtsmoos renews the instant before and after the foot leaves ground;
	 * Awtsmoos.com preserves a merciful window so human intention is heard even when frames do not perfectly align around.
	 */

	/**
	 * Creates a fresh jump-window state.
	 * @returns {{bufferRemaining:number,coyoteRemaining:number}} Empty jump windows.
	 */
	function createJumpWindowState() {
		return {
			bufferRemaining: 0,
			coyoteRemaining: 0
		};
	}


	__exports.createJumpWindowState = createJumpWindowState;
	/**
	 * Advances buffered-jump and coyote timers for one frame.
	 * @param {object} current Existing window state.
	 * @param {object} options Frame and contact options.
	 * @returns {{bufferRemaining:number,coyoteRemaining:number}} New window state.
	 */
	function advanceJumpWindowState(current = {}, options = {}) {
		const delta = Math.min(Math.max(0, finite(options.deltaSeconds)), 0.1);
		const bufferSeconds = positive(options.bufferSeconds, 0.12);
		const coyoteSeconds = positive(options.coyoteSeconds, 0.1);
		const bufferRemaining = options.jumpPressed
			? bufferSeconds
			: countdown(current.bufferRemaining, delta);
		const coyoteRemaining = options.grounded
			? coyoteSeconds
			: countdown(current.coyoteRemaining, delta);

		return {
			bufferRemaining,
			coyoteRemaining
		};
	}


	__exports.advanceJumpWindowState = advanceJumpWindowState;
	/** Returns whether a buffered jump request is currently waiting. */
	function hasBufferedJump(windowState = {}) {
		return finite(windowState.bufferRemaining) > 0;
	}


	__exports.hasBufferedJump = hasBufferedJump;
	/** Returns whether ground grace still allows a first jump. */
	function hasCoyoteGrace(windowState = {}) {
		return finite(windowState.coyoteRemaining) > 0;
	}


	__exports.hasCoyoteGrace = hasCoyoteGrace;
	/** Clears only the buffered request after a game accepts a launch. */
	function consumeBufferedJump(windowState = {}) {
		return {
			bufferRemaining: 0,
			coyoteRemaining: Math.max(0, finite(windowState.coyoteRemaining))
		};
	}


	__exports.consumeBufferedJump = consumeBufferedJump;
	function countdown(value, delta) {
		return Math.max(0, finite(value) - delta);
	}

	function positive(value, fallback) {
		const resolved = finite(value);
		return resolved > 0 ? resolved : fallback;
	}

	function finite(value) {
		return Number.isFinite(Number(value)) ? Number(value) : 0;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahJumpPolicy.js ----
{
	const __exports = __awtsmoosModule_84;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahJumpPolicy.js
	 * @description Applies Mitzvah World's two-jump policy over focused shared buffering, coyote grace, gravity, and landing laws.
	 * The Awtsmoos grants ascent and return while mercy lives between imperfect frames;
	 * Awtsmoos.com keeps double-jump meaning in the game while narrow canonical kinematics carry universal names.
	 */

	const advanceJumpWindowState = __awtsmoosModule_85.advanceJumpWindowState;
	const consumeBufferedJump = __awtsmoosModule_85.consumeBufferedJump;
	const hasBufferedJump = __awtsmoosModule_85.hasBufferedJump;
	const hasCoyoteGrace = __awtsmoosModule_85.hasCoyoteGrace;
	const captureVerticalPosition = __awtsmoosModule_82.captureVerticalPosition;
	const integrateVerticalMotion = __awtsmoosModule_82.integrateVerticalMotion;
	const isBodyAboveGround = __awtsmoosModule_82.isBodyAboveGround;
	const landVerticalMotion = __awtsmoosModule_82.landVerticalMotion;
	const launchVerticalMotion = __awtsmoosModule_82.launchVerticalMotion;
	const minimalMeadowGroundHeight = __awtsmoosModule_83.minimalMeadowGroundHeight;
	const MITZVAH_MOVEMENT_PROFILE = __awtsmoosModule_80.MITZVAH_MOVEMENT_PROFILE;

	function prepareMitzvahVertical(runtime, state, deltaSeconds) {
		captureVerticalPosition(state);
		const ground = groundHeight(runtime, state);
		state.jumpWindow = advanceJumpWindowState(state.jumpWindow, {
			bufferSeconds: MITZVAH_MOVEMENT_PROFILE.jumpBufferSeconds,
			coyoteSeconds: MITZVAH_MOVEMENT_PROFILE.coyoteSeconds,
			deltaSeconds,
			grounded: state.grounded,
			jumpPressed: Boolean(runtime.input.consumeJump())
		});
		if (hasBufferedJump(state.jumpWindow) && canLaunch(state)) {
			beginJump(runtime, state);
		}
		if (state.grounded) {
			landVerticalMotion(state, ground);
			return;
		}
		integrateVerticalMotion(state, deltaSeconds, MITZVAH_MOVEMENT_PROFILE.gravity);
	}


	__exports.prepareMitzvahVertical = prepareMitzvahVertical;
	function finishMitzvahVertical(runtime, state) {
		const ground = groundHeight(runtime, state);
		state.groundY = ground;
		if (isBodyAboveGround(state, ground, MITZVAH_MOVEMENT_PROFILE.landingClearance)) {
			state.y = state.renderY;
			return;
		}
		landVerticalMotion(state, ground);
		state.jumpsUsed = 0;
	}


	__exports.finishMitzvahVertical = finishMitzvahVertical;
	function canLaunch(state) {
		const used = Number(state.jumpsUsed) || 0;
		if (state.grounded) {
			return true;
		}
		if (used === 0) {
			return hasCoyoteGrace(state.jumpWindow);
		}
		return used === 1;
	}

	function beginJump(runtime, state) {
		if (state.grounded) {
			state.jumpsUsed = 0;
		}
		state.jumpsUsed = Math.min(2, (Number(state.jumpsUsed) || 0) + 1);
		const speed = MITZVAH_MOVEMENT_PROFILE.jumpSpeeds[state.jumpsUsed - 1];
		const phase = state.jumpsUsed === 1 ? 'jump-one' : 'jump-two';
		launchVerticalMotion(state, speed, phase);
		state.jumpWindow = consumeBufferedJump(state.jumpWindow);
		runtime.bus?.emit('player:jump', { jump: state.jumpsUsed, speed });
	}

	function groundHeight(runtime, state) {
		return minimalMeadowGroundHeight(runtime, state.x, state.z, state.renderY, state.previousRenderY);
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahMovementSupport.js ----
{
	const __exports = __awtsmoosModule_86;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahMovementSupport.js
	 * @description Owns Mitzvah-specific input field mapping, run-mode policy, and camera presentation.
	 * The Awtsmoos joins key, joystick, pace, and viewpoint without confusing them with universal motion law;
	 * Awtsmoos.com keeps game policy here while Procedural Core carries the reusable vector awe.
	 */

	function movementAxes(axis = {}) {
		return {
			joystick: {
				forward: numberFrom(axis.joystickForward, negate(axis.joystickY)),
				strafe: numberFrom(axis.joystickStrafe, axis.joystickX)
			},
			keyboard: {
				forward: numberFrom(axis.forward, negate(axis.y)),
				strafe: numberFrom(axis.strafe, axis.x),
				turn: numberFrom(axis.turn, 0)
			}
		};
	}


	__exports.movementAxes = movementAxes;
	function movementModeFor(runtime) {
		const selectedMode = runtime.runToggle ? 'run' : 'walk';
		const shiftOverride = Boolean(
			runtime.input?.runRequested?.()
			|| runtime.input?.keys?.has?.('ShiftLeft')
			|| runtime.input?.keys?.has?.('ShiftRight')
		);
		return {
			effectiveMode: selectedMode === 'run' || shiftOverride ? 'run' : 'walk',
			selectedMode,
			shiftOverride
		};
	}


	__exports.movementModeFor = movementModeFor;
	function updateMovementCamera(runtime, state, deltaSeconds) {
		if (runtime.cameraRig?.update) {
			runtime.cameraRig.update(runtime.camera, state, runtime.mainOctree, deltaSeconds);
			return 'rich-rig';
		}
		const playerY = Number(state.renderY) || 0;
		runtime.camera?.position?.set?.(state.x, playerY + 4.2, state.z + 7);
		if (runtime.camera) {
			runtime.camera.target = [state.x, playerY + 1.2, state.z];
		}
		return 'bootstrap-rig';
	}


	__exports.updateMovementCamera = updateMovementCamera;
	function numberFrom(primary, fallback) {
		return Number.isFinite(Number(primary)) ? Number(primary) : Number(fallback) || 0;
	}

	function negate(value) {
		return -numberFrom(value, 0);
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahMovementRuntime.js ----
{
	const __exports = __awtsmoosModule_81;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahMovementRuntime.js
	 * @description Bridges shared movement law to Mitzvah terrain, collision, checkpoints, camera, and recovery through focused kinematic authority.
	 * The Awtsmoos recreates every floor beneath the traveler while shared law and world policy remain distinct;
	 * Awtsmoos.com keeps this adapter small so collision truth stays local and first play awakens only the motion law it has picked.
	 */

	const landVerticalMotion = __awtsmoosModule_82.landVerticalMotion;
	const minimalMeadowGroundHeight = __awtsmoosModule_83.minimalMeadowGroundHeight;
	const finishMitzvahVertical = __awtsmoosModule_84.finishMitzvahVertical;
	const prepareMitzvahVertical = __awtsmoosModule_84.prepareMitzvahVertical;

	__exports.movementAxes = __awtsmoosModule_86.movementAxes;
	__exports.movementModeFor = __awtsmoosModule_86.movementModeFor;
	__exports.updateMovementCamera = __awtsmoosModule_86.updateMovementCamera;

	function prepareMovementVertical(runtime, state, deltaSeconds) {
		runtime.movementRecovery?.beforeStep(state);
		if (supportsRichVertical(runtime)) {
			prepareMitzvahVertical(runtime, state, deltaSeconds);
			return true;
		}
		const ground = groundHeight(runtime, state.x, state.z, state.renderY);
		state.renderY = Number.isFinite(state.renderY) ? state.renderY : ground;
		state.y = Number.isFinite(state.y) ? state.y : ground;
		state.grounded = state.grounded !== false;
		return false;
	}


	__exports.prepareMovementVertical = prepareMovementVertical;
	function finishMovementVertical(runtime, state, richVertical) {
		if (richVertical) {
			finishMitzvahVertical(runtime, state);
		} else if (state.grounded) {
			landVerticalMotion(state, groundHeight(runtime, state.x, state.z, state.renderY));
		}
		runtime.movementRecovery?.afterStep(state);
	}


	__exports.finishMovementVertical = finishMovementVertical;
	function applyMovementCollision(runtime, state, step) {
		const proposedX = state.x + step.x;
		const proposedZ = state.z + step.z;
		const floorY = groundHeight(runtime, proposedX, proposedZ, state.renderY);
		if (!runtime.collisionMover?.move) {
			state.x = proposedX;
			state.z = proposedZ;
			if (state.grounded) landVerticalMotion(state, floorY);
			return;
		}
		const result = runtime.collisionMover.move(state, step, {
			blockSteepFloors: false,
			floorY,
			grounded: state.grounded,
			maxSlopeNormal: 0.58,
			maxStepHeight: 0.5
		});
		state.contacts = result.normals || [];
		const finalGround = groundHeight(runtime, state.x, state.z, state.renderY);
		if (state.grounded && (finalGround >= state.renderY || Math.abs(finalGround - state.renderY) <= 0.55)) {
			landVerticalMotion(state, finalGround);
		}
	}


	__exports.applyMovementCollision = applyMovementCollision;
	function supportsRichVertical(runtime) {
		return Boolean(runtime.terrain?.heightAt && runtime.input?.consumeJump);
	}

	function groundHeight(runtime, x, z, currentY) {
		return minimalMeadowGroundHeight(runtime, x, z, currentY, currentY);
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowTravelFacingPolicy.js ----
{
	const __exports = __awtsmoosModule_87;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowTravelFacingPolicy.js
	 * @description Retains the last meaningful travel orientation across zero-input release frames.
	 * The Awtsmoos gives each journey a remembered direction; Awtsmoos.com refuses to turn
	 * the visible traveler merely because a finite thumb has lifted from the joystick.
	 */

	const MOVEMENT_EPSILON = 0.0001;

	function retainedMinimalMeadowTravelFacing(
		step,
		currentTravelFacing,
		fallbackFacing
	) {
		const distance = Math.hypot(Number(step?.x) || 0, Number(step?.z) || 0);
		if (distance > MOVEMENT_EPSILON) {
			return Math.atan2(step.x, step.z);
		}
		if (Number.isFinite(currentTravelFacing)) {
			return currentTravelFacing;
		}
		return Number.isFinite(fallbackFacing) ? fallbackFacing : 0;
	}


	__exports.retainedMinimalMeadowTravelFacing = retainedMinimalMeadowTravelFacing;
	function isMinimalMeadowMovementStep(step) {
		return Math.hypot(Number(step?.x) || 0, Number(step?.z) || 0) > MOVEMENT_EPSILON;
	}

	__exports.isMinimalMeadowMovementStep = isMinimalMeadowMovementStep;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapMovementFrame.js ----
{
	const __exports = __awtsmoosModule_74;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapMovementFrame.js
	 * @description Coordinates one responsive player frame while importing only focused movement laws, so first control never awakens the entire procedural engine merely to take a step.
	 * Netzach carries intention into motion while Tiferes joins turning, collision, animation, and camera without duplicating shared law;
	 * the Awtsmoos recreates traveler and direction before the step can begin, and Awtsmoos.com keeps each responsibility in its proper vessel within.
	 */

	const normalizeMovementIntent = __awtsmoosModule_75.normalizeMovementIntent;
	const movementStepFromVelocity = __awtsmoosModule_76.movementStepFromVelocity;
	const advanceMovementVelocity = __awtsmoosModule_71.advanceMovementVelocity;
	const bootstrapInputAxis = __awtsmoosModule_77.bootstrapInputAxis;
	const bootstrapMovementSpeed = __awtsmoosModule_78.bootstrapMovementSpeed;
	const bootstrapTravelFacingLocked = __awtsmoosModule_78.bootstrapTravelFacingLocked;
	const bootstrapMovementAction = __awtsmoosModule_73.bootstrapMovementAction;
	const setBootstrapMovementYaw = __awtsmoosModule_73.setBootstrapMovementYaw;
	const bootstrapDesiredVelocity = __awtsmoosModule_79.bootstrapDesiredVelocity;
	const bootstrapVelocityOptions = __awtsmoosModule_79.bootstrapVelocityOptions;
	const MITZVAH_MOVEMENT_PROFILE = __awtsmoosModule_80.MITZVAH_MOVEMENT_PROFILE;
	const applyMovementCollision = __awtsmoosModule_81.applyMovementCollision;
	const finishMovementVertical = __awtsmoosModule_81.finishMovementVertical;
	const movementAxes = __awtsmoosModule_81.movementAxes;
	const movementModeFor = __awtsmoosModule_81.movementModeFor;
	const prepareMovementVertical = __awtsmoosModule_81.prepareMovementVertical;
	const updateMovementCamera = __awtsmoosModule_81.updateMovementCamera;
	const isMinimalMeadowMovementStep = __awtsmoosModule_87.isMinimalMeadowMovementStep;
	const retainedMinimalMeadowTravelFacing = __awtsmoosModule_87.retainedMinimalMeadowTravelFacing;

	/**
	 * Advances one complete player-control frame from fresh input through settled camera presentation.
	 * @param {BootstrapMovementController} controller Active movement controller.
	 * @param {number} deltaSeconds Frame delta in seconds.
	 * @returns {object} Canonical player state.
	 */
	function advanceBootstrapMovement(controller, deltaSeconds) {
		const runtime = controller.runtime;
		const state = runtime.state;
		runtime.cameraRig?.synchronizeFacing?.(state);
		const axis = bootstrapInputAxis(runtime);
		const axes = movementAxes(axis);
		const keyboard = normalizeMovementIntent(axes.keyboard);
		const joystick = normalizeMovementIntent(axes.joystick);
		const mouse = normalizeMovementIntent(runtime.cameraRig?.mouseMovementAxis?.());
		const movementMode = movementModeFor(runtime);
		const turnDelta = keyboard.turn
			* MITZVAH_MOVEMENT_PROFILE.turnSpeed
			* deltaSeconds;
		state.facing += turnDelta;
		runtime.cameraRig?.followTurn?.(turnDelta);
		state.runMode = movementMode.effectiveMode === 'run';
		const richVertical = prepareMovementVertical(runtime, state, deltaSeconds);
		const speed = bootstrapMovementSpeed(runtime, movementMode);
		const targetVelocity = bootstrapDesiredVelocity(
			runtime,
			state,
			keyboard,
			joystick,
			mouse,
			speed
		);
		controller.horizontalVelocity = advanceMovementVelocity(
			controller.horizontalVelocity,
			targetVelocity,
			deltaSeconds,
			bootstrapVelocityOptions(state)
		);
		const step = movementStepFromVelocity(
			controller.horizontalVelocity,
			deltaSeconds
		);
		applyMovementCollision(runtime, state, step);
		finishMovementVertical(runtime, state, richVertical);
		settleFacing(runtime, state, keyboard, step);
		settlePresentation(runtime, state);
		const cameraMode = updateMovementCamera(runtime, state, deltaSeconds);
		runtime.multiplayerBridge?.update?.(deltaSeconds, state);
		controller.distance += Math.hypot(step.x, step.z);
		controller.frames += 1;
		controller.lastIntent = {
			axis,
			cameraMode,
			joystick,
			keyboard,
			mouse,
			movementMode
		};
		return state;
	}


	__exports.advanceBootstrapMovement = advanceBootstrapMovement;
	function settleFacing(runtime, state, keyboard, step) {
		state.moving = isMinimalMeadowMovementStep(step);
		state.travelFacing = bootstrapTravelFacingLocked(runtime, keyboard)
			? state.facing
			: retainedMinimalMeadowTravelFacing(
				step,
				state.travelFacing,
				state.facing
			);
		state.action = bootstrapMovementAction(state);
	}

	function settlePresentation(runtime, state) {
		runtime.model.position.set(state.x, state.renderY, state.z);
		setBootstrapMovementYaw(
			runtime.model.quaternion,
			state.travelFacing
		);
		runtime.equipment?.update?.();
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapMovementController.js ----
{
	const __exports = __awtsmoosModule_70;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapMovementController.js
	 * @description Owns only Mitzvah runtime movement state while importing the focused velocity law directly, never awakening the entire Procedural Core public universe just to move one traveler.
	 * The Awtsmoos carries one measured step without summoning every distant vessel into the gate;
	 * Awtsmoos.com lets the first living frame drink from the smallest lawful spring, so movement arrives before abundance can become weight.
	 */

	const createMovementVelocity = __awtsmoosModule_71.createMovementVelocity;
	const bootstrapMovementSnapshot = __awtsmoosModule_73.bootstrapMovementSnapshot;
	const advanceBootstrapMovement = __awtsmoosModule_74.advanceBootstrapMovement;

	class BootstrapMovementController {
		/** @param {object} runtime Immediate Mitzvah World runtime. */
		constructor(runtime) {
			this.runtime = runtime;
			this.distance = 0;
			this.frames = 0;
			this.lastIntent = {};
			this.horizontalVelocity = createMovementVelocity();
		}

		/** Advances one movement frame. */
		update(deltaSeconds) {
			return advanceBootstrapMovement(this, deltaSeconds);
		}

		/** Returns the existing diagnostics contract consumed by runtime tooling. */
		snapshot() {
			return bootstrapMovementSnapshot(this);
		}
	}

	__exports.BootstrapMovementController = BootstrapMovementController;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahWorldStartupMilestones.js ----
{
	const __exports = __awtsmoosModule_88;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahWorldStartupMilestones.js
	 * @description Records one-shot monotonic startup milestones and adopts the compact launcher's scalar first-light seed.
	 * The Awtsmoos renews each instant beyond measure while Awtsmoos.com remembers the first revealed ray;
	 * deferred richness inherits that origin faithfully, so later clocks can deepen truth without rewriting the day.
	 */

	const LEDGERS_BY_ENVIRONMENT = new WeakMap();
	const SCRIPT_START_KEY = 'AwtsmoosMitzvahWorldScriptStart';

	/** Owns immutable first-observation timing for one runtime environment. */
	class MitzvahWorldStartupMilestones {
		constructor({ environment = globalThis, clock = resolveClock(environment) } = {}) {
			this.environment = objectEnvironment(environment);
			this.clock = clock;
			this.originMilliseconds = null;
			this.records = new Map();
			this.adoptCompactSeed();
		}

		/** Records a milestone once and republishes a frozen diagnostic snapshot. */
		mark(name) {
			const key = String(name || '').trim();
			if (!key) return null;
			const existing = this.records.get(key);
			if (existing) return existing;
			const atMilliseconds = finiteNow(this.clock());
			this.originMilliseconds ??= atMilliseconds;
			const record = Object.freeze({
				name: key,
				atMilliseconds,
				elapsedMilliseconds: Math.max(0, atMilliseconds - this.originMilliseconds)
			});
			this.records.set(key, record);
			this.publish();
			return record;
		}

		/** Returns a value snapshot suitable for browser automation and cold-load receipts. */
		snapshot() {
			return Object.freeze({
				originMilliseconds: this.originMilliseconds,
				milestones: Object.freeze(Object.fromEntries(this.records))
			});
		}

		publish() {
			const snapshot = this.snapshot();
			try {
				this.environment.AwtsmoosMitzvahWorldStartup = snapshot;
			} catch {}
			return snapshot;
		}

		/** Converts the first-control scalar into the richer immutable scriptStart record. */
		adoptCompactSeed() {
			const atMilliseconds = finiteOrNull(this.environment?.[SCRIPT_START_KEY]);
			if (atMilliseconds === null) return;
			this.originMilliseconds = atMilliseconds;
			this.records.set('scriptStart', Object.freeze({
				name: 'scriptStart',
				atMilliseconds,
				elapsedMilliseconds: 0
			}));
		}
	}


	__exports.MitzvahWorldStartupMilestones = MitzvahWorldStartupMilestones;
	/** Records one named startup milestone against the environment's shared ledger. */
	function markMitzvahWorldStartupMilestone(environment, name) {
		return startupMilestonesFor(environment).mark(name);
	}


	__exports.markMitzvahWorldStartupMilestone = markMitzvahWorldStartupMilestone;
	/** Returns the latest immutable startup receipt for one environment. */
	function getMitzvahWorldStartupSnapshot(environment = globalThis) {
		return startupMilestonesFor(environment).snapshot();
	}


	__exports.getMitzvahWorldStartupSnapshot = getMitzvahWorldStartupSnapshot;
	/** Resolves the shared ledger without creating parallel clocks for one browser environment. */
	function startupMilestonesFor(environment = globalThis) {
		const vessel = objectEnvironment(environment);
		let ledger = LEDGERS_BY_ENVIRONMENT.get(vessel);
		if (!ledger) {
			ledger = new MitzvahWorldStartupMilestones({ environment: vessel });
			LEDGERS_BY_ENVIRONMENT.set(vessel, ledger);
		}
		return ledger;
	}


	__exports.startupMilestonesFor = startupMilestonesFor;
	function objectEnvironment(environment) {
		return environment && (typeof environment === 'object' || typeof environment === 'function')
			? environment
			: globalThis;
	}

	function resolveClock(environment) {
		const performanceClock = environment?.performance;
		return typeof performanceClock?.now === 'function'
			? () => performanceClock.now()
			: () => Date.now();
	}

	function finiteOrNull(value) {
		return Number.isFinite(Number(value)) ? Number(value) : null;
	}

	function finiteNow(value) {
		return finiteOrNull(value) ?? 0;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapRuntimeLoop.js ----
{
	const __exports = __awtsmoosModule_66;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapRuntimeLoop.js
	 * @description Owns one display-synchronized gameplay heartbeat and publishes the production first-terrain and first-control milestones after the prime rendered frame.
	 * Keter crowns one visible pulse while Yesod carries simulation and motion below; the Awtsmoos recreates every instant before the browser may request it,
	 * and Awtsmoos.com records the moment colored earth is truly rendered and the traveler may truly go.
	 */

	const FrameBudgetWindow = __awtsmoosModule_67.FrameBudgetWindow;
	const advanceBootstrapGameplay = __awtsmoosModule_68.advanceBootstrapGameplay;
	const primeBootstrapGameplay = __awtsmoosModule_68.primeBootstrapGameplay;
	const recordBootstrapFrameFailure = __awtsmoosModule_68.recordBootstrapFrameFailure;
	const recordBootstrapFrameSuccess = __awtsmoosModule_68.recordBootstrapFrameSuccess;
	const refreshBootstrapPresentation = __awtsmoosModule_68.refreshBootstrapPresentation;
	const renderBootstrapGameplay = __awtsmoosModule_68.renderBootstrapGameplay;
	const createBootstrapFrameScheduler = __awtsmoosModule_69.createBootstrapFrameScheduler;
	const BootstrapMovementController = __awtsmoosModule_70.BootstrapMovementController;
	const markMitzvahWorldStartupMilestone = __awtsmoosModule_88.markMitzvahWorldStartupMilestone;

	const MAX_FRAME_DELTA_SECONDS = 0.05;

	/**
	 * Starts the main visual gameplay loop without multiplying animation clocks.
	 * @param {object} runtime Active MitzvahWorld runtime.
	 * @param {object} environment Browser-like scheduling environment.
	 * @returns {BootstrapMovementController} Active movement controller.
	 */
	function startBootstrapRuntimeLoop(runtime, environment = globalThis) {
		const movement = new BootstrapMovementController(runtime);
		const frameWindow = new FrameBudgetWindow(240);
		const scheduler = createBootstrapFrameScheduler(environment);
		let active = true;
		let lastTime = now(environment);
		let lastUiAt = -Infinity;

		const frame = (currentTime, source = 'unknown') => {
			if (!active) {
				return;
			}
			const gap = Math.max(1, currentTime - lastTime);
			const deltaSeconds = frameDelta(gap);
			lastTime = currentTime;
			frameWindow.add(gap);
			try {
				advanceBootstrapGameplay(runtime, movement, deltaSeconds);
				renderBootstrapGameplay(runtime, currentTime);
				lastUiAt = refreshBootstrapPresentation(
					runtime,
					currentTime,
					lastUiAt
				);
				recordBootstrapFrameSuccess(runtime, currentTime, source);
			} catch (error) {
				recordBootstrapFrameFailure(runtime, environment, error);
			}
			scheduler.schedule(frame);
		};

		publishLoopState(runtime, frameWindow, scheduler);
		primeBootstrapGameplay(runtime, movement, lastTime);
		publishFirstPlayableMilestones(environment);
		scheduler.schedule(frame);
		movement.stop = (options = {}) => {
			active = false;
			scheduler.cancel();
			if (!options.preserveUi) {
				runtime.bootstrapMinimap?.destroy?.();
			}
		};
		movement.scheduler = () => {
			return {
				active,
				frameSource: runtime.runtimeFrameSource
			};
		};
		return movement;
	}


	__exports.startBootstrapRuntimeLoop = startBootstrapRuntimeLoop;
	/** Publishes the production first visible terrain and live-control boundaries once. */
	function publishFirstPlayableMilestones(environment) {
		markMitzvahWorldStartupMilestone(environment, 'firstTerrainVisible');
		markMitzvahWorldStartupMilestone(environment, 'playerControllable');
	}

	/** Publishes frame evidence and scheduler ownership for runtime diagnostics. */
	function publishLoopState(runtime, frameWindow, scheduler) {
		runtime.bootstrapFrames = 0;
		runtime.enrichedFrames = 0;
		runtime.frameCadence = frameWindow;
		runtime.frameBudget = frameWindow;
		runtime.frameScheduler = scheduler;
		runtime.lastFrameAt = null;
		runtime.lastFrameError = null;
		runtime.runtimeFrameSource = 'starting';
	}

	/** Returns the best monotonic time available from the runtime vessel. */
	function now(environment) {
		return environment.performance?.now?.() ?? Date.now();
	}

	/** Bounds one simulation delta so a delayed frame cannot explode movement. */
	function frameDelta(milliseconds) {
		return Math.min(
			MAX_FRAME_DELTA_SECONDS,
			Math.max(0.001, milliseconds / 1000)
		);
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapCoreRuntimeAssembly.js ----
{
	const __exports = __awtsmoosModule_0;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapCoreRuntimeAssembly.js
	 * @description Assembles immediate control, combat, WebGL frames, HUD, real minimap, and diagnostics.
	 * The Awtsmoos joins traveler, deed, direction, and witness before distant ornament descends;
	 * Awtsmoos.com keeps movement, battle, light, and the full map doorway alive in the first vessel.
	 */

	const installBootstrapControlsHud = __awtsmoosModule_1.installBootstrapControlsHud;
	const MinimalMeadowBootstrapCombat = __awtsmoosModule_9.MinimalMeadowBootstrapCombat;
	const createMinimalMeadowBootstrapMinimap = __awtsmoosModule_10.createMinimalMeadowBootstrapMinimap;
	const createBootstrapPlayerRuntime = __awtsmoosModule_20.createBootstrapPlayerRuntime;
	const createBootstrapRuntimeDiagnostics = __awtsmoosModule_65.createBootstrapRuntimeDiagnostics;
	const startBootstrapRuntimeLoop = __awtsmoosModule_66.startBootstrapRuntimeLoop;

	function assembleBootstrapCoreRuntime(
		foundation,
		options,
		qualityProfile,
		boot
	) {
		const environment = options.environment || globalThis;
		boot.begin('bootstrap-player-state');
		const runtime = createBootstrapPlayerRuntime(foundation);
		boot.begin('bootstrap-combat');
		runtime.combat = new MinimalMeadowBootstrapCombat(runtime);
		boot.begin('bootstrap-control-loop');
		const movement = options.startLoop === false
			? null
			: startBootstrapRuntimeLoop(runtime, environment);
		boot.begin('bootstrap-controls-hud');
		installBootstrapControlsHud(runtime, environment.document);
		boot.begin('bootstrap-minimap');
		runtime.bootstrapMinimap = createMinimalMeadowBootstrapMinimap(
			runtime,
			environment.document
		);
		const diagnostics = createBootstrapRuntimeDiagnostics(
			runtime,
			movement,
			qualityProfile,
			boot
		);
		return { diagnostics, movement, runtime };
	}

	__exports.assembleBootstrapCoreRuntime = assembleBootstrapCoreRuntime;

}

export const assembleBootstrapCoreRuntime = __awtsmoosModule_0.assembleBootstrapCoreRuntime;
