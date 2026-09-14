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

const __awtsmoosModule_6 = Object.create(null);

const __awtsmoosModule_4 = Object.create(null);

const __awtsmoosModule_8 = Object.create(null);

const __awtsmoosModule_9 = Object.create(null);

const __awtsmoosModule_7 = Object.create(null);

const __awtsmoosModule_1 = Object.create(null);

const __awtsmoosModule_10 = Object.create(null);

const __awtsmoosModule_13 = Object.create(null);

const __awtsmoosModule_14 = Object.create(null);

const __awtsmoosModule_15 = Object.create(null);

const __awtsmoosModule_16 = Object.create(null);

const __awtsmoosModule_18 = Object.create(null);

const __awtsmoosModule_19 = Object.create(null);

const __awtsmoosModule_17 = Object.create(null);

const __awtsmoosModule_20 = Object.create(null);

const __awtsmoosModule_12 = Object.create(null);

const __awtsmoosModule_11 = Object.create(null);

const __awtsmoosModule_25 = Object.create(null);

const __awtsmoosModule_24 = Object.create(null);

const __awtsmoosModule_31 = Object.create(null);

const __awtsmoosModule_32 = Object.create(null);

const __awtsmoosModule_33 = Object.create(null);

const __awtsmoosModule_34 = Object.create(null);

const __awtsmoosModule_30 = Object.create(null);

const __awtsmoosModule_37 = Object.create(null);

const __awtsmoosModule_38 = Object.create(null);

const __awtsmoosModule_36 = Object.create(null);

const __awtsmoosModule_35 = Object.create(null);

const __awtsmoosModule_40 = Object.create(null);

const __awtsmoosModule_39 = Object.create(null);

const __awtsmoosModule_41 = Object.create(null);

const __awtsmoosModule_29 = Object.create(null);

const __awtsmoosModule_42 = Object.create(null);

const __awtsmoosModule_43 = Object.create(null);

const __awtsmoosModule_44 = Object.create(null);

const __awtsmoosModule_28 = Object.create(null);

const __awtsmoosModule_27 = Object.create(null);

const __awtsmoosModule_45 = Object.create(null);

const __awtsmoosModule_46 = Object.create(null);

const __awtsmoosModule_26 = Object.create(null);

const __awtsmoosModule_47 = Object.create(null);

const __awtsmoosModule_52 = Object.create(null);

const __awtsmoosModule_51 = Object.create(null);

const __awtsmoosModule_55 = Object.create(null);

const __awtsmoosModule_56 = Object.create(null);

const __awtsmoosModule_57 = Object.create(null);

const __awtsmoosModule_58 = Object.create(null);

const __awtsmoosModule_54 = Object.create(null);

const __awtsmoosModule_59 = Object.create(null);

const __awtsmoosModule_53 = Object.create(null);

const __awtsmoosModule_60 = Object.create(null);

const __awtsmoosModule_62 = Object.create(null);

const __awtsmoosModule_61 = Object.create(null);

const __awtsmoosModule_63 = Object.create(null);

const __awtsmoosModule_64 = Object.create(null);

const __awtsmoosModule_50 = Object.create(null);

const __awtsmoosModule_69 = Object.create(null);

const __awtsmoosModule_70 = Object.create(null);

const __awtsmoosModule_68 = Object.create(null);

const __awtsmoosModule_67 = Object.create(null);

const __awtsmoosModule_71 = Object.create(null);

const __awtsmoosModule_72 = Object.create(null);

const __awtsmoosModule_66 = Object.create(null);

const __awtsmoosModule_65 = Object.create(null);

const __awtsmoosModule_73 = Object.create(null);

const __awtsmoosModule_49 = Object.create(null);

const __awtsmoosModule_75 = Object.create(null);

const __awtsmoosModule_74 = Object.create(null);

const __awtsmoosModule_48 = Object.create(null);

const __awtsmoosModule_76 = Object.create(null);

const __awtsmoosModule_78 = Object.create(null);

const __awtsmoosModule_80 = Object.create(null);

const __awtsmoosModule_79 = Object.create(null);

const __awtsmoosModule_77 = Object.create(null);

const __awtsmoosModule_82 = Object.create(null);

const __awtsmoosModule_81 = Object.create(null);

const __awtsmoosModule_89 = Object.create(null);

const __awtsmoosModule_88 = Object.create(null);

const __awtsmoosModule_87 = Object.create(null);

const __awtsmoosModule_86 = Object.create(null);

const __awtsmoosModule_90 = Object.create(null);

const __awtsmoosModule_91 = Object.create(null);

const __awtsmoosModule_92 = Object.create(null);

const __awtsmoosModule_93 = Object.create(null);

const __awtsmoosModule_94 = Object.create(null);

const __awtsmoosModule_95 = Object.create(null);

const __awtsmoosModule_97 = Object.create(null);

const __awtsmoosModule_96 = Object.create(null);

const __awtsmoosModule_98 = Object.create(null);

const __awtsmoosModule_99 = Object.create(null);

const __awtsmoosModule_85 = Object.create(null);

const __awtsmoosModule_84 = Object.create(null);

const __awtsmoosModule_83 = Object.create(null);

const __awtsmoosModule_100 = Object.create(null);

const __awtsmoosModule_101 = Object.create(null);

const __awtsmoosModule_102 = Object.create(null);

const __awtsmoosModule_23 = Object.create(null);

const __awtsmoosModule_103 = Object.create(null);

const __awtsmoosModule_104 = Object.create(null);

const __awtsmoosModule_22 = Object.create(null);

const __awtsmoosModule_109 = Object.create(null);

const __awtsmoosModule_110 = Object.create(null);

const __awtsmoosModule_111 = Object.create(null);

const __awtsmoosModule_112 = Object.create(null);

const __awtsmoosModule_108 = Object.create(null);

const __awtsmoosModule_113 = Object.create(null);

const __awtsmoosModule_114 = Object.create(null);

const __awtsmoosModule_107 = Object.create(null);

const __awtsmoosModule_115 = Object.create(null);

const __awtsmoosModule_116 = Object.create(null);

const __awtsmoosModule_117 = Object.create(null);

const __awtsmoosModule_106 = Object.create(null);

const __awtsmoosModule_105 = Object.create(null);

const __awtsmoosModule_122 = Object.create(null);

const __awtsmoosModule_121 = Object.create(null);

const __awtsmoosModule_124 = Object.create(null);

const __awtsmoosModule_123 = Object.create(null);

const __awtsmoosModule_120 = Object.create(null);

const __awtsmoosModule_125 = Object.create(null);

const __awtsmoosModule_119 = Object.create(null);

const __awtsmoosModule_126 = Object.create(null);

const __awtsmoosModule_127 = Object.create(null);

const __awtsmoosModule_130 = Object.create(null);

const __awtsmoosModule_129 = Object.create(null);

const __awtsmoosModule_128 = Object.create(null);

const __awtsmoosModule_132 = Object.create(null);

const __awtsmoosModule_131 = Object.create(null);

const __awtsmoosModule_118 = Object.create(null);

const __awtsmoosModule_21 = Object.create(null);

const __awtsmoosModule_134 = Object.create(null);

const __awtsmoosModule_136 = Object.create(null);

const __awtsmoosModule_137 = Object.create(null);

const __awtsmoosModule_135 = Object.create(null);

const __awtsmoosModule_133 = Object.create(null);

const __awtsmoosModule_139 = Object.create(null);

const __awtsmoosModule_142 = Object.create(null);

const __awtsmoosModule_146 = Object.create(null);

const __awtsmoosModule_145 = Object.create(null);

const __awtsmoosModule_148 = Object.create(null);

const __awtsmoosModule_150 = Object.create(null);

const __awtsmoosModule_149 = Object.create(null);

const __awtsmoosModule_147 = Object.create(null);

const __awtsmoosModule_144 = Object.create(null);

const __awtsmoosModule_143 = Object.create(null);

const __awtsmoosModule_141 = Object.create(null);

const __awtsmoosModule_140 = Object.create(null);

const __awtsmoosModule_151 = Object.create(null);

const __awtsmoosModule_154 = Object.create(null);

const __awtsmoosModule_153 = Object.create(null);

const __awtsmoosModule_155 = Object.create(null);

const __awtsmoosModule_157 = Object.create(null);

const __awtsmoosModule_158 = Object.create(null);

const __awtsmoosModule_159 = Object.create(null);

const __awtsmoosModule_161 = Object.create(null);

const __awtsmoosModule_162 = Object.create(null);

const __awtsmoosModule_160 = Object.create(null);

const __awtsmoosModule_164 = Object.create(null);

const __awtsmoosModule_163 = Object.create(null);

const __awtsmoosModule_166 = Object.create(null);

const __awtsmoosModule_167 = Object.create(null);

const __awtsmoosModule_169 = Object.create(null);

const __awtsmoosModule_168 = Object.create(null);

const __awtsmoosModule_172 = Object.create(null);

const __awtsmoosModule_171 = Object.create(null);

const __awtsmoosModule_170 = Object.create(null);

const __awtsmoosModule_165 = Object.create(null);

const __awtsmoosModule_156 = Object.create(null);

const __awtsmoosModule_152 = Object.create(null);

const __awtsmoosModule_173 = Object.create(null);

const __awtsmoosModule_138 = Object.create(null);

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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/DirectWorldContextQuestAction.js ----
{
	const __exports = __awtsmoosModule_6;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file DirectWorldContextQuestAction.js
	 * @description Owns the legacy Talk, Begin, and Return behavior as one provider beneath the generic direct-action resolver.
	 * The Awtsmoos lets old quest truth remain whole while new deeds join beside it; Awtsmoos.com keeps giver interaction,
	 * remembered offers, and dedicated meadow completion in one focused vessel instead of swelling the global action router.
	 */

	const directActionState = __awtsmoosModule_5.directActionState;
	const HIDDEN_DIRECT_ACTION = __awtsmoosModule_5.HIDDEN_DIRECT_ACTION;

	/** Direct-action provider for the dedicated meadow quest and its primary friendly NPC. */
	class DirectWorldContextQuestAction {
		/** @param {object} runtime Staged MitzvahWorld runtime. */
		constructor(runtime) {
			this.runtime = runtime;
			this.priority = 10;
			this.offeredQuestId = null;
			this.unsubscribeOffer = runtime.bus?.on?.('quest:offer', event => this.captureOffer(event)) || null;
		}

		/** Returns the current quest/NPC deed or hidden state. */
		state() {
			const quest = this.runtime.quest;
			const snapshot = quest?.snapshot?.();
			if (!quest || !snapshot) return HIDDEN_DIRECT_ACTION;
			if (snapshot.status === 'available') return this.availableState(quest);
			if (snapshot.status === 'ready' && this.primaryNpcReady()) {
				return directActionState('return', 'Return', `Return to ${quest.definition.giver.name}`);
			}
			return HIDDEN_DIRECT_ACTION;
		}

		/** Activates exactly the state resolved by this provider. */
		activate(state = this.state()) {
			const actions = {
				begin: () => this.beginQuest(),
				return: () => this.returnQuest(),
				talk: () => this.talkToPrimary()
			};
			return actions[state.kind]?.() ?? false;
		}

		/** Releases offer subscription ownership. */
		destroy() {
			this.unsubscribeOffer?.();
			this.unsubscribeOffer = null;
		}

		availableState(quest) {
			if (this.hasOffer()) {
				return directActionState('begin', 'Begin', `Begin ${quest.definition.name}`);
			}
			return this.primaryNpcReady()
				? directActionState('talk', 'Talk', `Talk to ${quest.definition.giver.name}`)
				: HIDDEN_DIRECT_ACTION;
		}

		hasOffer() {
			return Boolean(this.offeredQuestId && this.offeredQuestId === this.runtime.quest?.definition?.id);
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
			if (!this.hasOffer()) return false;
			this.offeredQuestId = null;
			return this.runtime.quest.accept();
		}

		returnQuest() {
			this.talkToPrimary();
			return this.runtime.quest.complete();
		}
	}

	__exports.DirectWorldContextQuestAction = DirectWorldContextQuestAction;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/DirectWorldContextAction.js ----
{
	const __exports = __awtsmoosModule_4;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file DirectWorldContextAction.js
	 * @description Resolves many contextual-action providers into one truthful direct-play deed by explicit priority.
	 * The Awtsmoos contains every possible action without crowding the traveler with every button; Awtsmoos.com lets
	 * Build, Talk, Begin, Return, Learn, Collect, Open, and future providers compete through one tiny stable contract.
	 */

	const HIDDEN_DIRECT_ACTION = __awtsmoosModule_5.HIDDEN_DIRECT_ACTION;
	const DirectWorldContextQuestAction = __awtsmoosModule_6.DirectWorldContextQuestAction;

	/** Generic direct-world resolver; external providers live in runtime.contextActionProviders. */
	class DirectWorldContextAction {
		/** @param {object} runtime Staged MitzvahWorld runtime. */
		constructor(runtime) {
			this.runtime = runtime;
			this.questProvider = new DirectWorldContextQuestAction(runtime);
		}

		/** Returns the highest-priority visible provider state. */
		state() {
			return this.resolve()?.state || HIDDEN_DIRECT_ACTION;
		}

		/** Activates the same provider/state pair used for presentation. */
		activate() {
			const resolved = this.resolve();
			return resolved?.provider?.activate?.(resolved.state) ?? false;
		}

		/** Releases only providers owned by this resolver. */
		destroy() {
			this.questProvider.destroy();
		}

		/** Finds the first visible provider after deterministic priority ordering. */
		resolve() {
			for (const provider of this.providers()) {
				const state = provider?.state?.() || HIDDEN_DIRECT_ACTION;
				if (state.visible && state.enabled !== false) {
					return Object.freeze({ provider, state });
				}
			}
			return null;
		}

		/** Returns external contextual providers plus the dedicated quest fallback. */
		providers() {
			return [
				...(this.runtime.contextActionProviders || []),
				this.questProvider
			].filter(Boolean).sort((left, right) => {
				return Number(right.priority || 0) - Number(left.priority || 0);
			});
		}
	}

	__exports.DirectWorldContextAction = DirectWorldContextAction;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/input/InputPresentationPolicy.js ----
{
	const __exports = __awtsmoosModule_8;
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
	const __exports = __awtsmoosModule_9;
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
	const __exports = __awtsmoosModule_7;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file ContextActionButton.js
	 * @description Renders one contextual deed and silences its global E shortcut while advanced controls own interaction.
	 * The Awtsmoos reveals action only when purpose reaches the hand, while Awtsmoos.com keeps hidden gameplay from answering beneath an opened inner veil;
	 * one generous touch, one E-key covenant, and one presentation gate preserve simple surface play without accidental advanced-layer travail.
	 */

	const isGameplayInputSuppressed = __awtsmoosModule_8.isGameplayInputSuppressed;
	const isEditableTarget = __awtsmoosModule_9.isEditableTarget;

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
	const ContextActionButton = __awtsmoosModule_7.ContextActionButton;

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
	const __exports = __awtsmoosModule_10;
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
	const __exports = __awtsmoosModule_13;
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
	const __exports = __awtsmoosModule_14;
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
	const __exports = __awtsmoosModule_15;
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
	const __exports = __awtsmoosModule_16;
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
	const __exports = __awtsmoosModule_18;
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
	const __exports = __awtsmoosModule_19;
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
	const __exports = __awtsmoosModule_17;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file WorldMinimapStyle.js
	 * @description Installs the map's safe-area geometry and spectral material vessels exactly once.
	 * The Awtsmoos joins boundary and beauty without confusing their separate names;
	 * Awtsmoos.com composes small readable modules so future maps inherit clarity instead of overlapping frames.
	 */

	const WORLD_MINIMAP_LAYOUT_CSS = __awtsmoosModule_18.WORLD_MINIMAP_LAYOUT_CSS;
	const WORLD_MINIMAP_SURFACE_CSS = __awtsmoosModule_19.WORLD_MINIMAP_SURFACE_CSS;

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
	const __exports = __awtsmoosModule_20;
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
	const __exports = __awtsmoosModule_12;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file WorldMinimap.js
	 * @description Owns compact, expanded, and full-screen quest maps for solo and shared play.
	 * The Awtsmoos renews direction without replacing discovery; Awtsmoos.com redraws only after
	 * movement, unified quest change, peer change, or an explicit remembered viewpoint transition.
	 */

	const bindWorldMinimapControls = __awtsmoosModule_13.bindWorldMinimapControls;
	const updateWorldMinimapControls = __awtsmoosModule_13.updateWorldMinimapControls;
	const projectWorldMinimap = __awtsmoosModule_14.projectWorldMinimap;
	const ensureWorldMinimapQuestSubscription = __awtsmoosModule_15.ensureWorldMinimapQuestSubscription;
	const worldMinimapPeerSignature = __awtsmoosModule_15.worldMinimapPeerSignature;
	const worldMinimapPlayerPosition = __awtsmoosModule_15.worldMinimapPlayerPosition;
	const readWorldMinimapMode = __awtsmoosModule_16.readWorldMinimapMode;
	const writeWorldMinimapMode = __awtsmoosModule_16.writeWorldMinimapMode;
	const installWorldMinimapStyle = __awtsmoosModule_17.installWorldMinimapStyle;
	const createWorldMinimapRoot = __awtsmoosModule_20.createWorldMinimapRoot;
	const renderWorldMinimapMarkers = __awtsmoosModule_20.renderWorldMinimapMarkers;

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
	const __exports = __awtsmoosModule_11;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowBootstrapMinimap.js
	 * @description Mounts the folded real minimap during compact bootstrap play with an injectable test seam.
	 * The Awtsmoos reveals nearby travelers without scattering source scrolls across the road;
	 * Awtsmoos.com preserves immediate mount, diagnostics, refresh, handoff, and exact teardown.
	 */

	const WorldMinimap = __awtsmoosModule_12.WorldMinimap;

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

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/CinematicEnvironmentPresets.js ----
{
	const __exports = __awtsmoosModule_25;
	//B"H
	//Boruch Hashem
	//Blessed be He
	/**
	 * @file CinematicEnvironmentPresets.js
	 * @description Stores readable shared daylight, golden-hour, twilight, and night lighting values.
	 * The Awtsmoos renews every ray before finite presets arise; Awtsmoos.com keeps visual tuning
	 * declarative and separate from environment normalization so every product may share one measured sky.
	 */

	const CINEMATIC_ENVIRONMENT_PRESETS = Object.freeze({
		day: Object.freeze({
			ambient: [0.34, 0.39, 0.46],
			exposure: 1.05,
			fogColor: [0.23, 0.34, 0.43],
			sunColor: [1, 0.91, 0.76],
			sunDirection: [-0.35, 0.78, 0.3]
		}),
		golden: Object.freeze({
			ambient: [0.28, 0.31, 0.38],
			exposure: 1.08,
			fogColor: [0.25, 0.18, 0.17],
			sunColor: [1, 0.66, 0.38],
			sunDirection: [-0.42, 0.38, 0.26]
		}),
		night: Object.freeze({
			ambient: [0.08, 0.11, 0.19],
			exposure: 0.72,
			fogColor: [0.035, 0.055, 0.09],
			sunColor: [0.22, 0.3, 0.5],
			sunDirection: [-0.35, 0.45, 0.25]
		}),
		twilight: Object.freeze({
			ambient: [0.18, 0.22, 0.34],
			exposure: 0.92,
			fogColor: [0.1, 0.12, 0.2],
			sunColor: [0.72, 0.48, 0.54],
			sunDirection: [-0.5, 0.14, 0.18]
		})
	});

	__exports.CINEMATIC_ENVIRONMENT_PRESETS = CINEMATIC_ENVIRONMENT_PRESETS;

}

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/CinematicEnvironment.js ----
{
	const __exports = __awtsmoosModule_24;
	//B"H
	//Boruch Hashem
	//Blessed be He
	/**
	 * @file CinematicEnvironment.js
	 * @description Produces one shared native-renderer environment from cinematic time and lighting intent.
	 * The Awtsmoos renews every ray before finite color; Awtsmoos.com keeps sun, ambient, fog, and exposure
	 * in one reusable contract so game and studio do not light the same world by contradictory laws.
	 */
	const CINEMATIC_ENVIRONMENT_PRESETS = __awtsmoosModule_25.CINEMATIC_ENVIRONMENT_PRESETS;

	/** Creates the compact environment contract consumed by Core's native renderer. */
	function createCinematicEnvironment(options = {}) {
		const preset = CINEMATIC_ENVIRONMENT_PRESETS[normalizeTime(options.timeOfDay)]
			|| CINEMATIC_ENVIRONMENT_PRESETS.golden;
		const intensity = Math.max(0.05, Number(options.intensity ?? 1));
		return {
			ambient: scaleColor(preset.ambient, 0.78 + 0.18 * intensity),
			exposure: Number(options.exposure ?? preset.exposure),
			fogColor: vector3(options.fogColor, preset.fogColor),
			fogFar: Number(options.fogFar ?? 220),
			fogNear: Number(options.fogNear ?? 28),
			sunColor: scaleColor(options.sunColor || preset.sunColor, 0.7 + 0.3 * intensity),
			sunDirection: vector3(options.sunDirection, preset.sunDirection)
		};
	}


	__exports.createCinematicEnvironment = createCinematicEnvironment;
	function normalizeTime(value) {
		const text = String(value || 'golden').toLowerCase();
		if (text.includes('night')) return 'night';
		if (text.includes('twilight') || text.includes('dusk')) return 'twilight';
		if (text.includes('day') || text.includes('noon')) return 'day';
		return 'golden';
	}
	function vector3(value, fallback) {
		if (!Array.isArray(value) || value.length < 3) return [...fallback];
		return value.slice(0, 3).map(Number);
	}
	function scaleColor(values, amount) {
		return values.map(value => Math.max(0, Math.min(1, value * amount)));
	}

}

// ---- libs/awtsmoos-procedural-core/src/runtime/native/tiny-matrix-core.js ----
{
	const __exports = __awtsmoosModule_31;
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

// ---- libs/awtsmoos-procedural-core/src/runtime/native/tiny-transform-math.js ----
{
	const __exports = __awtsmoosModule_32;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-transform-math.js
	 * @description Direct quaternion and TRS composition for animated village forms.
	 * The Awtsmoos turns stillness into movement each instant; Awtsmoos.com composes the
	 * complete local vessel in one pass so no temporary translation or scale matrix is born.
	 */

	const identity = __awtsmoosModule_31.identity;

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

// ---- libs/awtsmoos-procedural-core/src/runtime/native/tiny-camera-math.js ----
{
	const __exports = __awtsmoosModule_33;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-camera-math.js
	 * @description Camera projection and world-point revelation for the mountain village.
	 * The Awtsmoos creates the seer and the seen together; Awtsmoos.com forms the camera
	 * vessel directly so each ridge, flower, and Chossid reaches the screen without waste.
	 */

	const identity = __awtsmoosModule_31.identity;

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

// ---- libs/awtsmoos-procedural-core/src/runtime/native/tiny-interpolation-math.js ----
{
	const __exports = __awtsmoosModule_34;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-interpolation-math.js
	 * @description Smooth array and quaternion transitions for living motion.
	 * The Awtsmoos joins every before and after in one present; Awtsmoos.com gives the
	 * visible traveler a measured path between samples without changing either endpoint.
	 */

	const quatNormalize = __awtsmoosModule_32.quatNormalize;

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

// ---- libs/awtsmoos-procedural-core/src/runtime/native/tiny-math.js ----
{
	const __exports = __awtsmoosModule_30;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-math.js
	 * @description Stable public gateway to focused mathematical vessels.
	 * The Awtsmoos contains every coordinate without confusion; Awtsmoos.com reveals
	 * matrix, transform, camera, and interpolation responsibilities in their proper rooms.
	 */

	__exports.copyMat4 = __awtsmoosModule_31.copyMat4;
	__exports.EPSILON = __awtsmoosModule_31.EPSILON;
	__exports.identity = __awtsmoosModule_31.identity;
	__exports.inverse = __awtsmoosModule_31.inverse;
	__exports.mat4FromArray = __awtsmoosModule_31.mat4FromArray;
	__exports.multiply = __awtsmoosModule_31.multiply;
	__exports.scale = __awtsmoosModule_31.scale;
	__exports.translate = __awtsmoosModule_31.translate;
	__exports.composeTRS = __awtsmoosModule_32.composeTRS;
	__exports.quatMatrix = __awtsmoosModule_32.quatMatrix;
	__exports.quatNormalize = __awtsmoosModule_32.quatNormalize;
	__exports.lookAt = __awtsmoosModule_33.lookAt;
	__exports.perspective = __awtsmoosModule_33.perspective;
	__exports.transformPoint = __awtsmoosModule_33.transformPoint;
	__exports.lerpArray = __awtsmoosModule_34.lerpArray;
	__exports.quatSlerp = __awtsmoosModule_34.quatSlerp;

}

// ---- libs/awtsmoos-procedural-core/src/runtime/native/tiny-transform-matrix.js ----
{
	const __exports = __awtsmoosModule_37;
	// B"H
	// Boruch Hashem
	// Blessed is He
	/**
	 * @file tiny-transform-matrix.js
	 * @description Holds reusable matrix copy, TRS composition, multiplication, and validity laws for native transforms.
	 * The Awtsmoos renews every coordinate while one numerical keli keeps multiplication exact;
	 * Awtsmoos.com lets cache orchestration stay small as matrix craftsmanship lives in its own reflected tract.
	 */

	/** @param {Float32Array} target Target matrix. @param {ArrayLike<number>} source Source matrix. */
	function copyMatrixInto(target, source) {
		for (let index = 0; index < 16; index += 1) {
			target[index] = source[index];
		}
	}


	__exports.copyMatrixInto = copyMatrixInto;
	/** @param {Float32Array} target Target matrix. @param {object} object Native transform object. */
	function composeTrsInto(target, object) {
		const quaternion = normalizedQuaternion(object.quaternion);
		const x2 = quaternion.x + quaternion.x;
		const y2 = quaternion.y + quaternion.y;
		const z2 = quaternion.z + quaternion.z;
		const xx = quaternion.x * x2;
		const xy = quaternion.x * y2;
		const xz = quaternion.x * z2;
		const yy = quaternion.y * y2;
		const yz = quaternion.y * z2;
		const zz = quaternion.z * z2;
		const wx = quaternion.w * x2;
		const wy = quaternion.w * y2;
		const wz = quaternion.w * z2;
		writeRotationScale(
			target,
			object.scale,
			{ xx, xy, xz, yy, yz, zz, wx, wy, wz }
		);
		writeTranslation(target, object.position);
	}


	__exports.composeTrsInto = composeTrsInto;
	/** @param {Float32Array} target Target. @param {Float32Array} left Left matrix. @param {Float32Array} right Right matrix. @returns {Float32Array} */
	function multiplyTransformMatrices(target, left, right) {
		for (let column = 0; column < 4; column += 1) {
			const offset = column * 4;
			for (let row = 0; row < 4; row += 1) {
				target[offset + row] = left[row] * right[offset]
					+ left[row + 4] * right[offset + 1]
					+ left[row + 8] * right[offset + 2]
					+ left[row + 12] * right[offset + 3];
			}
		}
		return target;
	}


	__exports.multiplyTransformMatrices = multiplyTransformMatrices;
	/** @param {ArrayLike<number>|null} matrix Candidate matrix. @returns {boolean} */
	function validTransformMatrix(matrix) {
		return matrix?.length === 16;
	}


	__exports.validTransformMatrix = validTransformMatrix;
	/** @param {object} quaternion Native quaternion. @returns {object} Unit quaternion. */
	function normalizedQuaternion(quaternion) {
		const x = quaternion.x || 0;
		const y = quaternion.y || 0;
		const z = quaternion.z || 0;
		const w = quaternion.w ?? 1;
		const inverseLength = 1 / (Math.hypot(x, y, z, w) || 1);
		return {
			x: x * inverseLength,
			y: y * inverseLength,
			z: z * inverseLength,
			w: w * inverseLength
		};
	}

	/** Writes the 3x3 scaled rotation block. */
	function writeRotationScale(target, scale, values) {
		const { xx, xy, xz, yy, yz, zz, wx, wy, wz } = values;
		target[0] = (1 - yy - zz) * scale.x;
		target[1] = (xy + wz) * scale.x;
		target[2] = (xz - wy) * scale.x;
		target[3] = 0;
		target[4] = (xy - wz) * scale.y;
		target[5] = (1 - xx - zz) * scale.y;
		target[6] = (yz + wx) * scale.y;
		target[7] = 0;
		target[8] = (xz + wy) * scale.z;
		target[9] = (yz - wx) * scale.z;
		target[10] = (1 - xx - yy) * scale.z;
		target[11] = 0;
	}

	/** Writes translation and homogeneous row. */
	function writeTranslation(target, position) {
		target[12] = position.x;
		target[13] = position.y;
		target[14] = position.z;
		target[15] = 1;
	}

}

// ---- libs/awtsmoos-procedural-core/src/runtime/native/tiny-transform-snapshot.js ----
{
	const __exports = __awtsmoosModule_38;
	// B"H
	// Boruch Hashem
	// Blessed is He
	/**
	 * @file tiny-transform-snapshot.js
	 * @description Detects and records native matrix/TRS changes independently from matrix composition.
	 * The Awtsmoos renews every position and rotation while a snapshot remembers only what truly changed;
	 * Awtsmoos.com lets transform caches stay honest without recomputing stable forms across the range.
	 */

	const MATRIX_SNAPSHOT = 1;
	const TRS_SNAPSHOT = 2;

	/** @param {object} object Native scene object. @returns {boolean} Whether local transform inputs changed. */
	function localTransformChanged(object) {
		const snapshot = object._localTransformSnapshot;
		if (object.matrix) {
			if (
				!snapshot
				|| snapshot.length !== 17
				|| snapshot[0] !== MATRIX_SNAPSHOT
			) {
				return true;
			}
			for (let index = 0; index < 16; index += 1) {
				if (snapshot[index + 1] !== object.matrix[index]) {
					return true;
				}
			}
			return false;
		}
		if (
			!snapshot
			|| snapshot.length !== 11
			|| snapshot[0] !== TRS_SNAPSHOT
		) {
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


	__exports.localTransformChanged = localTransformChanged;
	/** @param {object} object Native scene object. */
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


	__exports.captureLocalTransform = captureLocalTransform;
	/** @param {object} object Native scene object. @param {number} length Snapshot length. @returns {Array<number>} */
	function reusableSnapshot(object, length) {
		if (
			!object._localTransformSnapshot
			|| object._localTransformSnapshot.length !== length
		) {
			object._localTransformSnapshot = new Array(length);
		}
		return object._localTransformSnapshot;
	}

}

// ---- libs/awtsmoos-procedural-core/src/runtime/native/tiny-transform-cache.js ----
{
	const __exports = __awtsmoosModule_36;
	// B"H
	// Boruch Hashem
	// Blessed is He
	/**
	 * @file tiny-transform-cache.js
	 * @description Reuses native local/world transform storage while snapshot and matrix craftsmanship live separately.
	 * The Awtsmoos renews every form each instant while stable numerical vessels remember unchanged relations;
	 * Awtsmoos.com lets hierarchy move without needless recomposition, preserving clear revision generations.
	 */

	const identity = __awtsmoosModule_30.identity;
	const copyMatrixInto = __awtsmoosModule_37.copyMatrixInto;
	const composeTrsInto = __awtsmoosModule_37.composeTrsInto;
	const multiplyTransformMatrices = __awtsmoosModule_37.multiplyTransformMatrices;
	const validTransformMatrix = __awtsmoosModule_37.validTransformMatrix;
	const captureLocalTransform = __awtsmoosModule_38.captureLocalTransform;
	const localTransformChanged = __awtsmoosModule_38.localTransformChanged;

	const ROOT_WORLD_MATRIX = identity();


	__exports.ROOT_WORLD_MATRIX = ROOT_WORLD_MATRIX;
	/** @param {object} object Native scene object. @returns {Float32Array} Cached local matrix. */
	function cachedLocalMatrix(object) {
		if (!localTransformChanged(object)) {
			return object._localMatrixCache;
		}
		captureLocalTransform(object);
		object._localMatrixCache ||= new Float32Array(16);
		if (object.matrix) {
			copyMatrixInto(object._localMatrixCache, object.matrix);
		} else {
			composeTrsInto(object._localMatrixCache, object);
		}
		object._localRevision = (object._localRevision || 0) + 1;
		return object._localMatrixCache;
	}


	__exports.cachedLocalMatrix = cachedLocalMatrix;
	/**
	 * Updates cached world transform only when parent/local revision changed.
	 * @param {object} object Native scene object.
	 * @param {Float32Array} parentWorld Parent world matrix.
	 * @param {number|null} parentRevision Explicit parent revision.
	 * @returns {boolean} Whether the world matrix changed.
	 */
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
		updateWorldStorage(object, parentWorld, localMatrix);
		object._worldParentMatrix = parentWorld;
		object._worldParentRevision = inheritedRevision;
		object._worldLocalRevision = localRevision;
		object._worldRevision = (object._worldRevision || 0) + 1;
		return true;
	}


	__exports.updateCachedWorldMatrix = updateCachedWorldMatrix;
	/** @param {object} object Native scene object whose transform cache must be invalidated. */
	function invalidateTransformCache(object) {
		object._localTransformSnapshot = null;
		object._worldParentMatrix = null;
		object._worldParentRevision = -1;
		object._worldLocalRevision = -1;
	}


	__exports.invalidateTransformCache = invalidateTransformCache;
	/** @param {object} object Native scene object. @param {Float32Array} parentWorld Parent matrix. @param {Float32Array} localMatrix Local matrix. */
	function updateWorldStorage(object, parentWorld, localMatrix) {
		if (object.isMesh || !validTransformMatrix(object.matrixWorld)) {
			object.matrixWorld = multiplyTransformMatrices(
				new Float32Array(16),
				parentWorld,
				localMatrix
			);
			return;
		}
		multiplyTransformMatrices(
			object.matrixWorld,
			parentWorld,
			localMatrix
		);
	}

}

// ---- libs/awtsmoos-procedural-core/src/runtime/native/tiny-object3d-base-transform.js ----
{
	const __exports = __awtsmoosModule_35;
	// B"H
	// Boruch Hashem
	// Blessed is He
	/**
	 * @file tiny-object3d-base-transform.js
	 * @description Captures and restores authored native base transforms outside the scene-hierarchy class.
	 * The Awtsmoos renews every pose while a quiet memory keeps the authored vessel near;
	 * Awtsmoos.com lets animation return to its source without burdening hierarchy law with another sphere.
	 */

	const copyMat4 = __awtsmoosModule_30.copyMat4;
	const invalidateTransformCache = __awtsmoosModule_36.invalidateTransformCache;

	/** @param {object} object Native scene object. @returns {object} The same object after capture. */
	function captureBaseTransform(object) {
		object._base = {
			position: object.position.clone(),
			quaternion: object.quaternion.clone(),
			scale: object.scale.clone(),
			matrix: object.matrix
				? copyMat4(object.matrix)
				: null
		};
		return object;
	}


	__exports.captureBaseTransform = captureBaseTransform;
	/** @param {object} object Native scene object whose authored transform should return. */
	function restoreBaseTransform(object) {
		if (!object._base) return;
		object.position.copy(object._base.position);
		object.quaternion.copy(object._base.quaternion);
		object.scale.copy(object._base.scale);
		object.matrix = object._base.matrix
			? copyMat4(object._base.matrix)
			: null;
		invalidateTransformCache(object);
	}

	__exports.restoreBaseTransform = restoreBaseTransform;

}

// ---- libs/awtsmoos-procedural-core/src/runtime/native/tiny-scene-revision.js ----
{
	const __exports = __awtsmoosModule_40;
	// B"H
	// Boruch Hashem
	// Blessed is He
	/**
	 * @file tiny-scene-revision.js
	 * @description Centralizes scene-graph revision propagation for the native procedural runtime.
	 * The Awtsmoos renews parent and child as one tree before a structural change may be counted;
	 * Awtsmoos.com lets one root revision reveal the changed hierarchy without every visitor being mounted.
	 */

	/**
	 * Marks the root scene revision after a structural or visibility change.
	 * @param {object} object Changed native scene node.
	 */
	function markSceneGraphChanged(object) {
		let root = object;
		while (root.parent) {
			root = root.parent;
		}
		root._sceneGraphRevision = Number(root._sceneGraphRevision || 0) + 1;
	}

	__exports.markSceneGraphChanged = markSceneGraphChanged;

}

// ---- libs/awtsmoos-procedural-core/src/runtime/native/tiny-object3d-hierarchy.js ----
{
	const __exports = __awtsmoosModule_39;
	// B"H
	// Boruch Hashem
	// Blessed is He
	/**
	 * @file tiny-object3d-hierarchy.js
	 * @description Owns native child attachment, removal, and preorder traversal apart from transform identity.
	 * The Awtsmoos renews parent and child as one revealed tree before hierarchy can gather in sight;
	 * Awtsmoos.com keeps structural mutation in its own vessel so Object3D may remain a smaller light.
	 */

	const markSceneGraphChanged = __awtsmoosModule_40.markSceneGraphChanged;
	const invalidateTransformCache = __awtsmoosModule_36.invalidateTransformCache;

	/**
	 * Attaches one child beneath a native parent.
	 * @param {object} parent Native parent node.
	 * @param {object} child Native child node.
	 * @returns {object} Parent node.
	 */
	function attachNativeChild(parent, child) {
		if (!child) return parent;
		if (child.parent) {
			child.parent.remove(child);
		}
		child.parent = parent;
		invalidateTransformCache(child);
		parent.children.push(child);
		markSceneGraphChanged(parent);
		return parent;
	}


	__exports.attachNativeChild = attachNativeChild;
	/**
	 * Removes one child from a native parent.
	 * @param {object} parent Native parent node.
	 * @param {object} child Native child node.
	 * @returns {object} Parent node.
	 */
	function removeNativeChild(parent, child) {
		const index = parent.children.indexOf(child);
		if (index < 0) return parent;
		parent.children.splice(index, 1);
		markSceneGraphChanged(parent);
		child.parent = null;
		invalidateTransformCache(child);
		return parent;
	}


	__exports.removeNativeChild = removeNativeChild;
	/**
	 * Visits one native hierarchy in preorder.
	 * @param {object} root Native root node.
	 * @param {Function} visitor Visitor callback.
	 */
	function traverseNativeHierarchy(root, visitor) {
		visitor(root);
		for (const child of root.children) {
			child.traverse(visitor);
		}
	}

	__exports.traverseNativeHierarchy = traverseNativeHierarchy;

}

// ---- libs/awtsmoos-procedural-core/src/runtime/native/tiny-vector.js ----
{
	const __exports = __awtsmoosModule_41;
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

// ---- libs/awtsmoos-procedural-core/src/runtime/native/tiny-object3d.js ----
{
	const __exports = __awtsmoosModule_29;
	// B"H
	// Boruch Hashem
	// Blessed is He
	/**
	 * @file tiny-object3d.js
	 * @description Defines native scene-object identity while hierarchy, revision, pose, and matrix laws live in smaller vessels.
	 * The Awtsmoos renews each object before parent, child, pose, and world transform can join in light;
	 * Awtsmoos.com keeps this base class narrow so deeper structural helpers may guard every separate right.
	 */

	const identity = __awtsmoosModule_30.identity;
	const captureBaseTransform = __awtsmoosModule_35.captureBaseTransform;
	const restoreBaseTransform = __awtsmoosModule_35.restoreBaseTransform;
	const attachNativeChild = __awtsmoosModule_39.attachNativeChild;
	const removeNativeChild = __awtsmoosModule_39.removeNativeChild;
	const traverseNativeHierarchy = __awtsmoosModule_39.traverseNativeHierarchy;
	const markSceneGraphChanged = __awtsmoosModule_40.markSceneGraphChanged;
	const cachedLocalMatrix = __awtsmoosModule_36.cachedLocalMatrix;
	const ROOT_WORLD_MATRIX = __awtsmoosModule_36.ROOT_WORLD_MATRIX;
	const updateCachedWorldMatrix = __awtsmoosModule_36.updateCachedWorldMatrix;
	const Quaternion = __awtsmoosModule_41.Quaternion;
	const Vector3 = __awtsmoosModule_41.Vector3;

	class Object3D {
		/** Creates one native hierarchy node with transform, visibility, and metadata vessels. */
		constructor() {
			this.children = [];
			this.parent = null;
			this.position = new Vector3();
			this.quaternion = new Quaternion();
			this.scale = new Vector3(1, 1, 1);
			this.matrix = null;
			this.matrixWorld = identity();
			this.name = "";
			this._visible = true;
			this._sceneGraphRevision = 0;
			this.userData = {};
			this.isBone = false;
		}

		/** @returns {boolean} Whether this node participates in visible traversal. */
		get visible() {
			return this._visible;
		}

		/** @param {boolean} value New visibility truth. */
		set visible(value) {
			const next = value !== false;
			if (this._visible === next) return;
			this._visible = next;
			markSceneGraphChanged(this);
		}

		/** @param {Object3D} object Child node. @returns {Object3D} This parent. */
		add(object) {
			return attachNativeChild(this, object);
		}

		/** @param {Object3D} object Child node. @returns {Object3D} This parent. */
		remove(object) {
			return removeNativeChild(this, object);
		}

		/** @param {Function} visitor Preorder visitor. */
		traverse(visitor) {
			traverseNativeHierarchy(this, visitor);
		}

		/** @returns {Object3D} This node after capturing its authored base transform. */
		setBaseTransform() {
			return captureBaseTransform(this);
		}

		/** Restores the captured authored base transform when available. */
		resetToBase() {
			restoreBaseTransform(this);
		}

		/** @returns {Float32Array} Cached local transform matrix. */
		localMatrix() {
			return cachedLocalMatrix(this);
		}

		/** @param {Float32Array} parentWorld Parent world matrix. @returns {Float32Array} Updated world matrix. */
		updateWorldMatrix(parentWorld = ROOT_WORLD_MATRIX) {
			updateCachedWorldMatrix(this, parentWorld);
			for (const child of this.children) {
				child.updateWorldMatrix(this.matrixWorld);
			}
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

}

// ---- libs/awtsmoos-procedural-core/src/runtime/native/tiny-mesh-object.js ----
{
	const __exports = __awtsmoosModule_42;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-mesh-object.js
	 * @description Renderable scene-graph vessel joining geometry and material.
	 * The Awtsmoos clothes abstract points in visible form; Awtsmoos.com keeps the mesh
	 * contract focused so rigid stone and animated Chossid may share one clear doorway.
	 */

	const Object3D = __awtsmoosModule_29.Object3D;

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

// ---- libs/awtsmoos-procedural-core/src/runtime/native/tiny-geometry.js ----
{
	const __exports = __awtsmoosModule_43;
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

// ---- libs/awtsmoos-procedural-core/src/runtime/native/tiny-camera.js ----
{
	const __exports = __awtsmoosModule_44;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-camera.js
	 * @description Perspective camera vessel for the mountain-village revelation.
	 * The Awtsmoos creates sight and distance together; Awtsmoos.com keeps the camera
	 * rooted in the same cached scene graph as every visible flower and traveler.
	 */

	const Object3D = __awtsmoosModule_29.Object3D;

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

// ---- libs/awtsmoos-procedural-core/src/runtime/native/tiny-runtime.js ----
{
	const __exports = __awtsmoosModule_28;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-runtime.js
	 * @description Stable public gateway to the focused tiny scene-graph runtime.
	 * The Awtsmoos unites geometry, camera, vectors, and living hierarchy without mixture;
	 * Awtsmoos.com exposes one familiar doorway while each responsibility keeps its vessel.
	 */

	const Bone = __awtsmoosModule_29.Bone;
	const Group = __awtsmoosModule_29.Group;
	const Object3D = __awtsmoosModule_29.Object3D;
	const Scene = __awtsmoosModule_29.Scene;
	const Mesh = __awtsmoosModule_42.Mesh;
	const BufferAttribute = __awtsmoosModule_43.BufferAttribute;
	const BufferGeometry = __awtsmoosModule_43.BufferGeometry;
	const MeshStandardMaterial = __awtsmoosModule_43.MeshStandardMaterial;
	const PerspectiveCamera = __awtsmoosModule_44.PerspectiveCamera;
	const Quaternion = __awtsmoosModule_41.Quaternion;
	const Vector3 = __awtsmoosModule_41.Vector3;

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
	const __awtsmoosDefault_nrjvmr = {
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
	__exports.default = __awtsmoosDefault_nrjvmr;
}

// ---- libs/awtsmoos-procedural-core/src/adapters/native/runtime.js ----
{
	const __exports = __awtsmoosModule_27;
	// B"H
	// Boruch Hashem
	// Blessed is He
	/**
	 * @file runtime.js
	 * @description Exposes the procedural core's own native scene graph, geometry, camera, and transform vessels.
	 * The Awtsmoos renews vector, hierarchy, and mesh before any game may borrow their visible light;
	 * Awtsmoos.com keeps these runtime primitives general, so no reusable law belongs to one game by right.
	 */

	__exports.Bone = __awtsmoosModule_28.Bone;
	__exports.BufferAttribute = __awtsmoosModule_28.BufferAttribute;
	__exports.BufferGeometry = __awtsmoosModule_28.BufferGeometry;
	__exports.Group = __awtsmoosModule_28.Group;
	__exports.Mesh = __awtsmoosModule_28.Mesh;
	__exports.MeshStandardMaterial = __awtsmoosModule_28.MeshStandardMaterial;
	__exports.Object3D = __awtsmoosModule_28.Object3D;
	__exports.PerspectiveCamera = __awtsmoosModule_28.PerspectiveCamera;
	__exports.Quaternion = __awtsmoosModule_28.Quaternion;
	__exports.Scene = __awtsmoosModule_28.Scene;
	__exports.Vector3 = __awtsmoosModule_28.Vector3;
	__exports.resetTreeToBase = __awtsmoosModule_28.resetTreeToBase;

}

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/CinematicSkyGeometry.js ----
{
	const __exports = __awtsmoosModule_45;
	//B"H
	//Boruch Hashem
	//Blessed be He
	/**
	 * @file CinematicSkyGeometry.js
	 * @description Builds portable inward sphere geometry for Core's time-varying physical atmosphere shader.
	 * The Awtsmoos surrounds every camera before vertex and triangle arise; Awtsmoos.com keeps this reusable
	 * sphere generation inside Procedural Core so products request a sky instead of carrying geometry factories.
	 */

	/** Creates portable inward-facing sphere data with bounded quality. */
	function createCinematicSkyGeometry(radius, rings, segments) {
		const positions = [];
		const normals = [];
		const uvs = [];
		const indices = [];
		for (let ring = 0; ring <= rings; ring += 1) {
			appendRing(positions, normals, uvs, radius, ring, rings, segments);
		}
		for (let ring = 0; ring < rings; ring += 1) {
			appendIndices(indices, ring, segments);
		}
		return { indices, normals, positions, uvs };
	}


	__exports.createCinematicSkyGeometry = createCinematicSkyGeometry;
	function appendRing(positions, normals, uvs, radius, ring, rings, segments) {
		const vertical = ring / rings;
		const phi = vertical * Math.PI;
		const y = Math.cos(phi) * radius;
		const horizontalRadius = Math.sin(phi) * radius;
		for (let segment = 0; segment <= segments; segment += 1) {
			const horizontal = segment / segments;
			const angle = horizontal * Math.PI * 2;
			const x = Math.cos(angle) * horizontalRadius;
			const z = Math.sin(angle) * horizontalRadius;
			positions.push(x, y, z);
			normals.push(-x / radius, -y / radius, -z / radius);
			uvs.push(horizontal, 1 - vertical);
		}
	}
	function appendIndices(indices, ring, segments) {
		for (let segment = 0; segment < segments; segment += 1) {
			const first = ring * (segments + 1) + segment;
			const next = first + segments + 1;
			indices.push(first, first + 1, next, first + 1, next + 1, next);
		}
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/NativeGeometryMesh.js ----
{
	const __exports = __awtsmoosModule_46;
	//B"H
	//Boruch Hashem
	//Blessed be He
	/**
	 * @file NativeGeometryMesh.js
	 * @description Materializes portable indexed geometry and hierarchy through Core's native runtime only.
	 * The Awtsmoos renews point, face, color, group, and surface beyond every product adapter; callers provide
	 * portable arrays and semantic metadata while reusable BufferGeometry, Mesh, and Group construction stays here.
	 */
	const BufferAttribute = __awtsmoosModule_27.BufferAttribute;
	const BufferGeometry = __awtsmoosModule_27.BufferGeometry;
	const Group = __awtsmoosModule_27.Group;
	const Mesh = __awtsmoosModule_27.Mesh;

	/**
	 * Create native indexed geometry from portable typed or numeric arrays.
	 * Supported attributes intentionally match the renderer's reusable physical-world contract.
	 */
	function createNativeGeometry(data = {}, options = {}) {
		const geometry = new BufferGeometry();
		setAttribute(geometry, 'position', data.positions, 3);
		setAttribute(geometry, 'normal', data.normals, 3);
		setAttribute(geometry, 'uv', data.uvs, 2);
		setAttribute(geometry, 'color', data.colors, 4);
		setAttribute(geometry, 'joints', data.joints, 4);
		setAttribute(geometry, 'weights', data.weights, 4);
		setAttribute(geometry, 'zone', data.zoneWeights, 4);
		if (data.indices?.length) {
			geometry.setIndex(new BufferAttribute(createIndexArray(data.indices), 1));
		}
		geometry.userData = { ...(options.geometryUserData || {}) };
		return geometry;
	}


	__exports.createNativeGeometry = createNativeGeometry;
	/** Creates geometry that must contain an explicit reusable index stream. */
	function createNativeIndexedGeometry(data = {}, options = {}) {
		if (!data.indices?.length) throw new Error('Core native indexed geometry requires indices.');
		return createNativeGeometry(data, options);
	}


	__exports.createNativeIndexedGeometry = createNativeIndexedGeometry;
	/** Creates one native mesh from portable geometry and a Core-owned material. */
	function createNativeGeometryMesh(data = {}, material, options = {}) {
		const geometry = createNativeIndexedGeometry(data, options);
		return createNativeMeshFromGeometry(geometry, material, options);
	}


	__exports.createNativeGeometryMesh = createNativeGeometryMesh;
	/** Create one native mesh around an already-materialized geometry without product-side constructor ownership. */
	function createNativeMeshFromGeometry(geometry, material, options = {}) {
		if (!geometry) throw new TypeError('Core native mesh requires geometry.');
		const mesh = new Mesh(geometry, material);
		mesh.name = options.name || 'Awtsmoos Core Mesh';
		mesh.frustumCulled = options.frustumCulled !== false;
		mesh.userData = {
			family: options.family || 'core-world-mesh',
			...(options.userData || {})
		};
		applyPosition(mesh, options.position);
		return mesh;
	}


	__exports.createNativeMeshFromGeometry = createNativeMeshFromGeometry;
	/** Creates one reusable native group so product adapters never construct renderer hierarchy directly. */
	function createNativeWorldGroup(options = {}) {
		const group = new Group();
		group.name = options.name || 'Awtsmoos Core World Group';
		group.userData = { ...(options.userData || {}) };
		applyPosition(group, options.position);
		return group;
	}


	__exports.createNativeWorldGroup = createNativeWorldGroup;
	function setAttribute(geometry, name, values, itemSize) {
		if (!values?.length) return;
		const array = values instanceof Float32Array ? values : new Float32Array(values);
		geometry.setAttribute(name, new BufferAttribute(array, itemSize));
	}
	/** Select the smallest safe index width without spreading unbounded arrays onto the call stack. */
	function createIndexArray(values) {
		if (values instanceof Uint16Array || values instanceof Uint32Array) return values;
		let maximum = 0;
		for (const value of values) {
			if (value > maximum) maximum = value;
		}
		return maximum > 65535 ? new Uint32Array(values) : new Uint16Array(values);
	}

	function applyPosition(object, position) {
		if (!position) return;
		object.position.set(
			Number(position.x || 0),
			Number(position.y || 0),
			Number(position.z || 0)
		);
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/CinematicSkyMesh.js ----
{
	const __exports = __awtsmoosModule_26;
	//B"H
	//Boruch Hashem
	//Blessed be He

	/**
	 * @file CinematicSkyMesh.js
	 * @description Gives Core's physical atmosphere policy one shared camera-surrounding native mesh with bounded quality controls.
	 * Procedural atmosphere is valid physical simulation rather than generated replacement material imagery; products may request fidelity,
	 * but Core alone owns the sphere geometry, renderer material, shader-selection metadata, and safe subdivision bounds.
	 */
	const MeshStandardMaterial = __awtsmoosModule_27.MeshStandardMaterial;
	const createCinematicSkyGeometry = __awtsmoosModule_45.createCinematicSkyGeometry;
	const createNativeGeometryMesh = __awtsmoosModule_46.createNativeGeometryMesh;

	/**
	 * Create one Core-owned inward cinematic atmosphere mesh.
	 * @param {object} options Radius, quality tier, optional explicit ring/segment counts, and stable name.
	 * @returns {object} Native atmosphere mesh carrying explicit physical-procedural shader policy.
	 */
	function createCinematicSkyMesh(options = {}) {
		const radius = Math.max(50, Number(options.radius || 420));
		const lowQuality = options.quality === 'low';
		const rings = boundedCount(options.rings, lowQuality ? 12 : 20, 4, 64);
		const segments = boundedCount(options.segments, lowQuality ? 24 : 40, 8, 128);
		const geometry = createCinematicSkyGeometry(radius, rings, segments);
		const material = new MeshStandardMaterial({
			color: [1, 1, 1, 1],
			doubleSided: true,
			name: 'Awtsmoos Core Atmosphere'
		});
		material.texturePolicy = {
			cameraCentered: true,
			generatedTextureAllowed: false,		proceduralShaderAllowed: true,
			proceduralSky: true,
			remoteOnly: false,
			semanticRole: 'world-sky-atmosphere'
		};
		const mesh = createNativeGeometryMesh(geometry, material, {
			family: 'world-sky-atmosphere',
			frustumCulled: false,
			name: options.name || 'Awtsmoos Core Cinematic Sky'
		});
		mesh.userData.renderDistance = Infinity;
		mesh.userData.skyGeometry = { radius, rings, segments };
		return mesh;
	}


	__exports.createCinematicSkyMesh = createCinematicSkyMesh;
	/** Bound compatibility fidelity so malformed authored values cannot create pathological sphere allocations. */
	function boundedCount(value, fallback, minimum, maximum) {
		const count = Math.floor(Number(value ?? fallback));
		return Math.max(minimum, Math.min(maximum, Number.isFinite(count) ? count : fallback));
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/CinematicTerrainEcology.js ----
{
	const __exports = __awtsmoosModule_47;
	//B"H
	//Boruch Hashem
	//Blessed be He
	/**
	 * @file CinematicTerrainEcology.js
	 * @description Derives renderer-neutral ecological weights for shared cinematic terrain.
	 * The Awtsmoos renews meadow, road, moisture, and stone as one earth; Awtsmoos.com keeps
	 * the evidence portable so games choose meaning while Core owns the visual garment.
	 */

	/** Builds four-channel meadow/road/wet/rock weights for each terrain vertex. */
	function createTerrainEcologyWeights(options = {}) {
		const positions = options.positions || [];
		const normals = options.normals || [];
		const explicit = options.zoneWeights || [];
		const waterLevel = finite(options.waterLevel, 0);
		const count = Math.floor(positions.length / 3);
		const output = new Float32Array(count * 4);
		for (let index = 0; index < count; index += 1) {
			const supplied = explicit.slice(index * 4, index * 4 + 4);
			const weight = supplied.length === 4
				? normalize(supplied)
				: derive(positions, normals, index, waterLevel);
			output.set(weight, index * 4);
		}
		return output;
	}


	__exports.createTerrainEcologyWeights = createTerrainEcologyWeights;
	function derive(positions, normals, index, waterLevel) {
		const y = finite(positions[index * 3 + 1], 0);
		const normalY = Math.abs(finite(normals[index * 3 + 1], 1));
		const slope = clamp(1 - normalY);
		const wet = clamp(1 - Math.abs(y - waterLevel) / 6);
		const rock = clamp(
			(slope - 0.22) * 1.7
			+ Math.max(0, y - 32) / 72
		);
		const meadow = clamp(1 - rock - wet * 0.35);
		return normalize([meadow, 0, wet, rock]);
	}
	function normalize(values) {
		const clean = values.map(value => clamp(value));
		const total = clean.reduce((sum, value) => sum + value, 0) || 1;
		return clean.map(value => value / total);
	}
	function clamp(value) {
		return Math.max(0, Math.min(1, finite(value, 0)));
	}
	function finite(value, fallback) {
		const number = Number(value);
		return Number.isFinite(number) ? number : fallback;
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/assets/textures/AwtsmoosDriveTextureTransport.js ----
{
	const __exports = __awtsmoosModule_52;
	// B"H
	// Boruch Hashem
	// Blessed is He
	/**
	 * @file AwtsmoosDriveTextureTransport.js
	 * @description Builds trusted HTTPS URLs beneath the canonical Awtsmoos Drive migration root without game-specific coupling.
	 * The Awtsmoos renews each remote path before a finite image crosses the wire;
	 * Awtsmoos.com keeps one guarded origin, rejecting traversal and model paths before they enter the fire.
	 */

	const AWTSMOOS_DRIVE_TEXTURE_ROOT = "https://awtsmoos.com/sites/firebase_drive_migration/";

	__exports.AWTSMOOS_DRIVE_TEXTURE_ROOT = AWTSMOOS_DRIVE_TEXTURE_ROOT;
	const ROOT = new URL(AWTSMOOS_DRIVE_TEXTURE_ROOT);
	const MODEL_EXTENSION = /\.(?:glb|gltf)$/i;
	const FORBIDDEN_SCHEME = /^(?:blob|data|file|javascript):/i;

	/** @param {string} path Relative migration path. @returns {string} Trusted encoded remote URL. */
	function awtsmoosDriveTexturePathUrl(path) {
		const clean = cleanPath(path);
		if (MODEL_EXTENSION.test(clean)) {
			throw new Error(`Texture transport rejects model path: ${path}`);
		}
		return `${AWTSMOOS_DRIVE_TEXTURE_ROOT}${encodePath(clean)}`;
	}


	__exports.awtsmoosDriveTexturePathUrl = awtsmoosDriveTexturePathUrl;
	/** @param {string} filename Canonical full-resolution filename. @returns {string} */
	function awtsmoosDriveFullTextureUrl(filename) {
		return awtsmoosDriveTexturePathUrl(`full-resolution/${cleanPath(filename)}`);
	}


	__exports.awtsmoosDriveFullTextureUrl = awtsmoosDriveFullTextureUrl;
	/** @param {string} filename Canonical tree filename. @returns {string} */
	function awtsmoosDriveTreeTextureUrl(filename) {
		return awtsmoosDriveTexturePathUrl(`awtsmoos-nature/ilanos/trees/${cleanPath(filename)}`);
	}


	__exports.awtsmoosDriveTreeTextureUrl = awtsmoosDriveTreeTextureUrl;
	/** @param {unknown} value URL candidate. @returns {boolean} Whether the URL belongs to the trusted texture root. */
	function isTrustedAwtsmoosDriveTextureUrl(value) {
		try {
			const parsed = new URL(String(value || ""));
			return parsed.protocol === "https:"
				&& parsed.origin === ROOT.origin
				&& parsed.pathname.startsWith(ROOT.pathname)
				&& !MODEL_EXTENSION.test(parsed.pathname);
		} catch {
			return false;
		}
	}


	__exports.isTrustedAwtsmoosDriveTextureUrl = isTrustedAwtsmoosDriveTextureUrl;
	function cleanPath(path) {
		const clean = String(path || "")
			.trim()
			.replace(/^\/+/, "")
			.replace(/\\/g, "/");
		if (!clean || FORBIDDEN_SCHEME.test(clean) || clean.includes("?") || clean.includes("#")) {
			throw new Error(`Invalid remote texture path: ${path}`);
		}
		if (clean.split("/").some((segment) => !segment || segment === "." || segment === "..")) {
			throw new Error(`Unsafe remote texture path: ${path}`);
		}
		return clean;
	}

	function encodePath(path) {
		return path.split("/").map(encodeURIComponent).join("/");
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/assets/textures/AwtsmoosDriveCatalogLoader.js ----
{
	const __exports = __awtsmoosModule_51;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file AwtsmoosDriveCatalogLoader.js
	 * @description Loads the complete Awtsmoos Drive material and hash inventories without binding discovery to a renderer or game.
	 * The Awtsmoos renews every finite image and every remembered path; Awtsmoos.com reads both catalogs together so aliases, variants, and bytes can share one truthful remote well.
	 */

	const awtsmoosDriveTexturePathUrl = __awtsmoosModule_52.awtsmoosDriveTexturePathUrl;

	const AWTSMOOS_DRIVE_MATERIAL_CATALOG_URL = awtsmoosDriveTexturePathUrl('catalog/materials.json');

	__exports.AWTSMOOS_DRIVE_MATERIAL_CATALOG_URL = AWTSMOOS_DRIVE_MATERIAL_CATALOG_URL;
	const AWTSMOOS_DRIVE_ASSET_INVENTORY_URL = awtsmoosDriveTexturePathUrl('catalog/asset-inventory.json');


	__exports.AWTSMOOS_DRIVE_ASSET_INVENTORY_URL = AWTSMOOS_DRIVE_ASSET_INVENTORY_URL;
	/** Loads both complete catalogs concurrently and validates their public schemas. */
	async function loadAwtsmoosDriveCatalog(fetchFunction = globalThis.fetch) {
		if (typeof fetchFunction !== 'function') {
			throw new TypeError('Awtsmoos Drive catalog loading requires fetch().');
		}
		const [materials, inventory] = await Promise.all([
			fetchJson(fetchFunction, AWTSMOOS_DRIVE_MATERIAL_CATALOG_URL),
			fetchJson(fetchFunction, AWTSMOOS_DRIVE_ASSET_INVENTORY_URL)
		]);
		if (materials?.schema !== 'awtsmoos-material-catalog/v1' || !Array.isArray(materials.records)) {
			throw new Error('Unsupported Awtsmoos Drive material catalog.');
		}
		if (inventory?.schema !== 'awtsmoos-asset-organization/v1' || !Array.isArray(inventory.assets)) {
			throw new Error('Unsupported Awtsmoos Drive asset inventory.');
		}
		return Object.freeze({ inventory, materials });
	}


	__exports.loadAwtsmoosDriveCatalog = loadAwtsmoosDriveCatalog;
	async function fetchJson(fetchFunction, url) {
		const response = await fetchFunction(url, { cache: 'force-cache' });
		if (!response?.ok) {
			throw new Error(`Awtsmoos Drive catalog request failed: ${response?.status || 'unknown'}`);
		}
		return response.json();
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/assets/textures/AwtsmoosDriveTextureSemanticRulesMade.js ----
{
	const __exports = __awtsmoosModule_55;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file AwtsmoosDriveTextureSemanticRulesMade.js
	 * @description Declares overlapping evidence for manufactured, architectural, textile, polymer, and industrial materials.
	 * Awtsmoos.com distinguishes material substance from practical use while excluding known phrase collisions such as volcanic glass and rock wool.
	 */

	const AWTSMOOS_MADE_TEXTURE_RULES = Object.freeze([
		rule(['cast iron'], ['metal', 'industrial', 'construction'], ['cast-ferrous-metal'], ['cast-iron', 'ferrous', 'metal', 'cast-metal']),
		rule(['aluminum', 'aluminium'], ['metal', 'industrial', 'construction'], ['nonferrous-metal'], ['aluminum', 'metal']),
		rule(['steel', 'iron'], ['metal', 'industrial', 'construction'], ['ferrous-metal'], ['ferrous', 'metal']),
		rule(['brass', 'bronze', 'copper'], ['metal', 'industrial', 'craft', 'construction'], ['copper-alloy'], ['metal', 'nonferrous']),
		rule(['silver', 'gold', 'titanium', 'zinc', 'nickel', 'tin', 'lead'], ['metal', 'industrial', 'craft'], ['metal'], ['metallic', 'solid']),
		rule(['galvanized'], ['metal', 'industrial', 'construction'], ['coated-metal'], ['zinc-coated', 'metallic']),
		rule(['corrugated sheet'], ['metal', 'construction', 'industrial'], ['sheet-metal'], ['corrugated', 'formed-metal']),
		rule(['metal mesh', 'woven metal mesh'], ['metal', 'industrial'], ['mesh'], ['woven-metal', 'perforated']),
		rule(['glass'], ['glass', 'architecture', 'construction'], ['glass'], ['transparent-material', 'silicate'], ['obsidian', 'volcanic glass']),
		rule(['ceramic', 'terracotta', 'porcelain'], ['ceramic', 'construction', 'craft'], ['fired-mineral'], ['ceramic', 'mineral-based']),
		rule(['brick', 'masonry', 'mortar', 'adobe', 'rammed earth'], ['construction', 'architecture'], ['masonry'], ['building-material', 'wall-material']),
		rule(['concrete', 'cement'], ['construction', 'architecture', 'industrial'], ['concrete'], ['cementitious', 'mineral-based']),
		rule(['asphalt'], ['construction', 'terrain', 'industrial'], ['paving'], ['road-material', 'bituminous']),
		rule(['rubber', 'latex'], ['polymer', 'industrial'], ['elastomer'], ['flexible', 'polymer']),
		rule(['plastic', 'polymer', 'pvc', 'vinyl', 'acrylic', 'polycarbonate'], ['polymer', 'industrial'], ['plastic'], ['synthetic', 'polymer']),
		rule(['fiberglass'], ['composite', 'industrial', 'construction'], ['fiber-composite'], ['glass-fiber', 'composite']),
		rule(['carbon fiber'], ['composite', 'industrial'], ['carbon-composite'], ['woven-fiber', 'composite']),
		rule(['foam'], ['polymer', 'industrial'], ['foam'], ['porous', 'cellular', 'lightweight']),
		rule(['canvas', 'cotton', 'linen', 'wool', 'denim', 'velvet', 'silk', 'felt'], ['textile', 'craft'], ['fabric'], ['woven', 'fiber', 'cloth'], ['rock wool', 'mineral wool']),
		rule(['knit', 'knitted'], ['textile', 'craft'], ['knit-fabric'], ['knitted', 'looped-fiber', 'fabric', 'textile']),
		rule(['jute', 'burlap', 'hemp'], ['textile', 'craft', 'plant-derived'], ['coarse-fabric'], ['woven', 'fiber', 'natural-fiber']),
		rule(['suede', 'leather'], ['textile', 'craft', 'animal-derived'], ['leather'], ['hide', 'organic', 'flexible']),
		rule(['paper', 'cardboard', 'parchment'], ['paper', 'craft'], ['cellulose-sheet'], ['cellulose', 'fiber', 'sheet']),
		rule(['carpet'], ['textile', 'architecture'], ['carpet'], ['pile', 'fiber', 'flooring']),
		rule(['rope', 'cordage'], ['textile', 'craft'], ['rope'], ['twisted-fiber', 'cordage']),
		rule(['paint'], ['coating', 'construction', 'craft'], ['paint'], ['pigmented', 'coating']),
		rule(['printed circuit', 'circuit board', 'pcb'], ['electronics', 'industrial'], ['circuit-board'], ['electronics', 'manufactured']),
		rule(['scratch', 'fracture network'], ['mask', 'surface-detail'], ['procedural-mask'], ['mask', 'detail-map']),
		rule(['mineral wool', 'rock wool'], ['insulation', 'construction', 'industrial'], ['mineral-fiber'], ['fibrous', 'insulation', 'mineral-fiber', 'thermal-insulation'])
	]);


	__exports.AWTSMOOS_MADE_TEXTURE_RULES = AWTSMOOS_MADE_TEXTURE_RULES;
	/** Builds one immutable semantic rule with optional whole-phrase exclusions. */
	function rule(keywords, categories, subcategories, labels, excludes = []) {
		return Object.freeze({
			categories: Object.freeze(categories),
			excludes: Object.freeze(excludes),
			keywords: Object.freeze(keywords),
			labels: Object.freeze(labels),
			subcategories: Object.freeze(subcategories)
		});
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/assets/textures/AwtsmoosDriveTextureSemanticMatching.js ----
{
	const __exports = __awtsmoosModule_56;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file AwtsmoosDriveTextureSemanticMatching.js
	 * @description Matches semantic material evidence by complete normalized words and phrases.
	 * Awtsmoos.com prevents accidental substring meanings such as tin in keratin, ice in pumice,
	 * or fur in sulfur while still allowing multi-word evidence such as rock wool and carbon black.
	 */

	/**
	 * Returns whether a semantic rule has positive evidence and no explicit exclusion.
	 * @param {string} text Already-normalized semantic source text.
	 * @param {{keywords?: string[], excludes?: string[]}} rule Semantic evidence rule.
	 * @returns {boolean} Whether the rule truthfully applies.
	 */
	function semanticTextureRuleMatches(text, rule = {}) {
		const positive = (rule.keywords || []).some(keyword => semanticPhraseOccurs(text, keyword));
		if (!positive) return false;
		return !(rule.excludes || []).some(exclusion => semanticPhraseOccurs(text, exclusion));
	}


	__exports.semanticTextureRuleMatches = semanticTextureRuleMatches;
	/** Returns whether one complete normalized word or phrase occurs in the source text. */
	function semanticPhraseOccurs(text, phrase) {
		const normalizedText = normalizeSemanticPhrase(text);
		const normalizedPhrase = normalizeSemanticPhrase(phrase);
		if (!normalizedPhrase) return false;
		return ` ${normalizedText} `.includes(` ${normalizedPhrase} `);
	}


	__exports.semanticPhraseOccurs = semanticPhraseOccurs;
	/** Converts arbitrary material text into the classifier's stable word/phrase alphabet. */
	function normalizeSemanticPhrase(value) {
		return String(value || '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	}

	__exports.normalizeSemanticPhrase = normalizeSemanticPhrase;

}

// ---- libs/awtsmoos-procedural-core/src/core/assets/textures/AwtsmoosDriveTextureSemanticRulesNatural.js ----
{
	const __exports = __awtsmoosModule_57;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file AwtsmoosDriveTextureSemanticRulesNatural.js
	 * @description Declares overlapping semantic evidence for natural, geological, botanical, and biological materials.
	 * Awtsmoos.com gives each independent substance precise scientific and practical labels while broad discovery remains possible.
	 */

	const AWTSMOOS_NATURAL_TEXTURE_RULES = Object.freeze([
		rule(['obsidian'], ['geology', 'mineral', 'terrain'], ['volcanic-rock', 'volcanic-glass'], ['obsidian', 'volcanic-glass', 'igneous', 'glassy']),
		rule(['pumice', 'scoria', 'basalt'], ['geology', 'mineral', 'terrain'], ['volcanic-rock', 'igneous-rock'], ['volcanic', 'igneous', 'rock', 'stone']),
		rule(['granite'], ['geology', 'mineral', 'terrain', 'construction'], ['igneous-rock', 'stone'], ['igneous', 'rock', 'stone', 'mineral']),
		rule(['gneiss', 'schist', 'quartzite', 'slate', 'soapstone'], ['geology', 'mineral', 'terrain', 'construction'], ['metamorphic-rock', 'stone'], ['metamorphic', 'rock', 'stone', 'mineral']),
		rule(['shale', 'limestone', 'sandstone', 'travertine', 'chalk', 'flint', 'chert'], ['geology', 'mineral', 'terrain', 'construction'], ['sedimentary-rock', 'stone'], ['sedimentary', 'rock', 'stone', 'mineral']),
		rule(['rock', 'stone', 'bedrock', 'boulder'], ['terrain', 'geology', 'mineral', 'construction'], ['rock', 'stone'], ['rock', 'stone', 'mineral'], ['rock salt', 'rock wool']),
		rule(['quartz', 'gypsum', 'alabaster', 'halite', 'salt', 'sulfur', 'mica', 'talc'], ['geology', 'mineral'], ['crystal', 'mineral'], ['mineral', 'crystalline', 'natural']),
		rule(['pebble', 'gravel', 'scree', 'talus'], ['terrain', 'geology'], ['aggregate', 'loose-rock'], ['stone', 'granular', 'ground']),
		rule(['clay', 'soil', 'earth', 'dirt', 'silt', 'mud', 'humus', 'compost'], ['terrain', 'geology'], ['soil'], ['earth', 'ground', 'natural']),
		rule(['wood ash'], ['particulate', 'plant-derived'], ['combustion-residue'], ['ash', 'powder', 'plant-derived', 'combustion-residue']),
		rule(['sand', 'dust', 'ash'], ['terrain', 'particulate'], ['fine-particles'], ['granular', 'powder', 'particulate'], ['wood ash']),
		rule(['snow', 'ice'], ['terrain', 'water', 'cryosphere'], ['frozen-water'], ['frozen', 'cold', 'natural']),
		rule(['water', 'river', 'lake', 'pond'], ['water', 'terrain'], ['water-surface'], ['liquid', 'water', 'natural']),
		rule(['oil'], ['liquid', 'industrial'], ['oil'], ['viscous', 'liquid', 'lubricant']),
		rule(['moss', 'algae', 'fern', 'foliage', 'leaf', 'leaves', 'grass'], ['vegetation', 'biology'], ['foliage'], ['plant', 'organic', 'living']),
		rule(['flower', 'petal', 'blossom'], ['vegetation', 'biology'], ['flower'], ['plant', 'organic', 'living']),
		rule(['bark', 'cork'], ['vegetation', 'biology', 'wood'], ['bark'], ['plant', 'organic', 'fibrous']),
		rule(['wood', 'timber', 'plywood'], ['wood', 'construction', 'craft'], ['wood-surface'], ['plant-derived', 'fibrous', 'solid'], ['wood ash', 'wood charcoal', 'mineral wool', 'rock wool']),
		rule(['straw', 'hay', 'reed'], ['vegetation', 'biology', 'plant-derived', 'craft'], ['dry-plant-fiber'], ['plant-fiber', 'cellulose', 'dry-fiber', 'natural-fiber']),
		rule(['bone'], ['biology', 'creatures', 'animal-derived'], ['bone'], ['bone', 'animal-derived', 'mineralized', 'organic']),
		rule(['horn'], ['biology', 'creatures', 'animal-derived', 'craft'], ['horn', 'keratin'], ['horn', 'keratin', 'animal-derived', 'organic']),
		rule(['antler'], ['biology', 'creatures', 'animal-derived', 'craft'], ['antler'], ['antler', 'mineralized', 'animal-derived', 'organic']),
		rule(['chitin'], ['biology', 'creatures', 'animal-derived'], ['chitin', 'exoskeleton'], ['chitin', 'exoskeleton', 'animal-derived', 'organic']),
		rule(['scale', 'scales'], ['biology', 'creatures', 'animal-derived'], ['scales'], ['scales', 'keratin', 'animal-derived', 'organic']),
		rule(['feather', 'plumage'], ['biology', 'creatures', 'animal-derived'], ['feather'], ['feather', 'plumage', 'keratin', 'animal-derived']),
		rule(['fur', 'hide', 'skin', 'epidermis'], ['biology', 'creatures', 'animal-derived'], ['animal-skin'], ['skin', 'hide', 'animal-derived', 'organic']),
		rule(['shell', 'nacre', 'pearl'], ['biology', 'mineral', 'animal-derived'], ['biomineral', 'shell'], ['biological', 'mineralized', 'calcium-carbonate', 'natural']),
		rule(['coral'], ['biology', 'mineral'], ['biomineral', 'coral'], ['biological', 'mineralized', 'calcium-carbonate', 'natural']),
		rule(['beeswax'], ['organic', 'craft', 'animal-derived'], ['wax'], ['beeswax', 'wax', 'solid', 'organic']),
		rule(['wax'], ['organic', 'craft'], ['wax'], ['wax', 'solid', 'organic']),
		rule(['resin', 'amber'], ['organic', 'geology', 'craft', 'plant-derived'], ['resin'], ['resinous', 'organic', 'natural', 'plant-derived']),
		rule(['coal', 'graphite'], ['carbon', 'geology', 'industrial'], ['carbon-material'], ['carbon-rich', 'dark', 'geological-carbon']),
		rule(['charcoal', 'soot', 'carbon black'], ['carbon', 'industrial'], ['carbon-material'], ['carbon-rich', 'dark', 'combustion-carbon']),
		rule(['wood charcoal'], ['carbon', 'industrial', 'plant-derived'], ['charcoal'], ['charcoal', 'carbonized-wood', 'plant-derived', 'porous']),
		rule(['bitumen'], ['organic', 'geology', 'carbon', 'industrial'], ['bitumen'], ['hydrocarbon', 'petroleum', 'bituminous', 'solid']),
		rule(['sponge'], ['biology', 'organic'], ['sponge'], ['porous', 'natural', 'biological'])
	]);


	__exports.AWTSMOOS_NATURAL_TEXTURE_RULES = AWTSMOOS_NATURAL_TEXTURE_RULES;
	/** Builds one immutable semantic rule with optional whole-phrase exclusions. */
	function rule(keywords, categories, subcategories, labels, excludes = []) {
		return Object.freeze({
			categories: Object.freeze(categories),
			excludes: Object.freeze(excludes),
			keywords: Object.freeze(keywords),
			labels: Object.freeze(labels),
			subcategories: Object.freeze(subcategories)
		});
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/assets/textures/AwtsmoosDriveTextureSemanticTraits.js ----
{
	const __exports = __awtsmoosModule_58;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file AwtsmoosDriveTextureSemanticTraits.js
	 * @description Extracts material traits that improve AI discovery without pretending a filename is laboratory measurement.
	 * The Awtsmoos gives finite words their bounded usefulness; Awtsmoos.com records only traits explicitly witnessed by names and existing tags.
	 */

	const TRAIT_RULES = Object.freeze([
		trait(['porous', 'pore', 'vesicle', 'foam', 'sponge', 'cork'], ['porous']),
		trait(['woven', 'weave', 'canvas', 'linen', 'cotton', 'denim', 'wool', 'mesh', 'carbon fiber'], ['woven', 'fibrous']),
		trait(['fiber', 'fibrous', 'felt', 'suede', 'velvet', 'mineral wool'], ['fibrous']),
		trait(['crystal', 'crystalline', 'quartz', 'granite', 'salt', 'halite', 'sulfur'], ['crystalline']),
		trait(['smooth', 'glass', 'oil'], ['smooth']),
		trait(['rough', 'gravel', 'rock', 'rust'], ['rough']),
		trait(['matte'], ['matte']),
		trait(['gloss', 'glassy', 'reflective', 'metallic'], ['reflective']),
		trait(['transparent', 'clear glass'], ['transparent']),
		trait(['translucent', 'ice', 'amber', 'resin'], ['translucent']),
		trait(['granular', 'grain', 'sand', 'dust', 'gravel', 'pebble'], ['granular']),
		trait(['layered', 'lamination', 'shale', 'slate', 'plywood'], ['layered']),
		trait(['flexible', 'rubber', 'fabric', 'leather'], ['flexible']),
		trait(['liquid', 'oil', 'water'], ['liquid']),
		trait(['solid'], ['solid']),
		trait(['raw', 'unfinished', 'untreated'], ['raw']),
		trait(['brushed'], ['brushed', 'directional-grain']),
		trait(['corrugated'], ['corrugated']),
		trait(['mesh'], ['perforated', 'mesh']),
		trait(['rust', 'oxide'], ['oxidized']),
		trait(['tileable', 'seamless'], ['seamless'])
	]);

	/** Returns every explicitly suggested surface trait. */
	function awtsmoosDriveTextureTraits(text) {
		const normalized = String(text || '').toLowerCase();
		const traits = [];
		for (const entry of TRAIT_RULES) {
			if (entry.keywords.some(keyword => normalized.includes(keyword))) {
				traits.push(...entry.labels);
			}
		}
		return Object.freeze([...new Set(traits)].sort());
	}


	__exports.awtsmoosDriveTextureTraits = awtsmoosDriveTextureTraits;
	function trait(keywords, labels) {
		return Object.freeze({
			keywords: Object.freeze(keywords),
			labels: Object.freeze(labels)
		});
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/assets/textures/AwtsmoosDriveTextureSemantics.js ----
{
	const __exports = __awtsmoosModule_54;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file AwtsmoosDriveTextureSemantics.js
	 * @description Produces multi-category, multi-label, facet-rich semantic metadata for remote material discovery.
	 * The Awtsmoos is One while a finite surface can truthfully serve geology, architecture, craft,
	 * ecology, and rendering together inside Awtsmoos.com without accidental substring classifications.
	 */

	const AWTSMOOS_MADE_TEXTURE_RULES = __awtsmoosModule_55.AWTSMOOS_MADE_TEXTURE_RULES;
	const semanticTextureRuleMatches = __awtsmoosModule_56.semanticTextureRuleMatches;
	const normalizeSemanticPhrase = __awtsmoosModule_56.normalizeSemanticPhrase;
	const AWTSMOOS_NATURAL_TEXTURE_RULES = __awtsmoosModule_57.AWTSMOOS_NATURAL_TEXTURE_RULES;
	const awtsmoosDriveTextureTraits = __awtsmoosModule_58.awtsmoosDriveTextureTraits;

	const RULES = Object.freeze([
		...AWTSMOOS_NATURAL_TEXTURE_RULES,
		...AWTSMOOS_MADE_TEXTURE_RULES
	]);
	const STOPWORDS = new Set([
		'and', 'with', 'without', 'the', 'pure', 'plain', 'natural', 'generic', 'realistic',
		'subtle', 'fine', 'dense', 'surface', 'material', 'texture', 'extremely', 'visible',
		'microscopic', 'microstructure', 'clean', 'uniform', 'structure', 'variation', 'full',
		'half', 'quarter', 'resolution', 'source', 'awtsmoos', 'nature', 'chai', 'forest',
		'png', 'jpg', 'jpeg', 'webp'
	]);

	/** Returns overlapping semantic metadata instead of forcing one exclusive folder. */
	function classifyAwtsmoosDriveTextureSemantics(record = {}) {
		const text = semanticText(record);
		const matches = RULES.filter(entry => semanticTextureRuleMatches(text, entry));
		const categories = unique(matches.flatMap(entry => entry.categories));
		const subcategories = unique(matches.flatMap(entry => entry.subcategories));
		const traits = awtsmoosDriveTextureTraits(text);
		const labels = unique([
			...(record.tags || []),
			...matches.flatMap(entry => entry.labels),
			...meaningfulTokens(text),
			...traits
		]);
		const primary = primaryAddress(categories, subcategories);
		return Object.freeze({
			categories: Object.freeze(categories),
			category: primary.category,
			facets: Object.freeze({
				categories: Object.freeze(categories),
				labels: Object.freeze(labels),
				subcategories: Object.freeze(subcategories),
				traits
			}),
			labels: Object.freeze(labels),
			subcategories: Object.freeze(subcategories),
			subcategory: primary.subcategory
		});
	}


	__exports.classifyAwtsmoosDriveTextureSemantics = classifyAwtsmoosDriveTextureSemantics;
	/** Builds stable free-text evidence used by both human search and agent ranking. */
	function awtsmoosDriveTextureSemanticText(record = {}) {
		const semantics = classifyAwtsmoosDriveTextureSemantics(record);
		return unique([
			record.name,
			record.path,
			...(record.tags || []),
			...semantics.categories,
			...semantics.subcategories,
			...semantics.labels
		]).join(' ').toLowerCase();
	}


	__exports.awtsmoosDriveTextureSemanticText = awtsmoosDriveTextureSemanticText;
	function primaryAddress(categories, subcategories) {
		return {
			category: categories[0] || 'other',
			subcategory: subcategories[0] || 'uncategorized'
		};
	}

	function semanticText(record) {
		return normalizeSemanticPhrase([
			record.name,
			record.path,
			record.sourceDescription,
			...(record.tags || [])
		].filter(Boolean).join(' '));
	}

	function meaningfulTokens(text) {
		return text.split(' ')
			.filter(token => token.length > 2 && token.length < 28 && !STOPWORDS.has(token))
			.slice(0, 40);
	}

	function unique(values) {
		return [...new Set(values.filter(Boolean))];
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/assets/textures/AwtsmoosDriveTextureTaxonomyLabels.js ----
{
	const __exports = __awtsmoosModule_59;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file AwtsmoosDriveTextureTaxonomyLabels.js
	 * @description Human-readable definitions for semantic material subcategories generated from rule truth.
	 * Awtsmoos.com lets agents inspect an unfamiliar material drawer before selecting an asset from it.
	 */

	const AWTSMOOS_TEXTURE_SUBCATEGORY_DESCRIPTIONS = Object.freeze({
		aggregate: 'Pebbles, gravel, and granular stone aggregate',
		'antler': 'Mineralized antler material',
		'animal-skin': 'Skin, hide, fur, and epidermal surfaces',
		bark: 'Bark and cork plant surfaces',
		biomineral: 'Biologically formed mineral materials',
		bitumen: 'Natural solid bituminous hydrocarbon material',
		bone: 'Mineralized bone material',
		'carbon-composite': 'Carbon-fiber composite reinforcement',
		'carbon-material': 'Coal, graphite, soot, charcoal, and carbon-rich matter',
		carpet: 'Textile carpet pile and flooring',
		'cast-ferrous-metal': 'Cast iron and related cast ferrous metal',
		'cellulose-sheet': 'Paper, cardboard, and parchment sheets',
		charcoal: 'Carbonized wood charcoal',
		chitin: 'Biological chitin material',
		'circuit-board': 'Printed circuit board surfaces',
		'coarse-fabric': 'Jute, burlap, hemp, and coarse plant textiles',
		'coated-metal': 'Coated and galvanized metal',
		'combustion-residue': 'Ash and other fine combustion residue',
		concrete: 'Concrete and cementitious material',
		'copper-alloy': 'Copper, brass, bronze, and related nonferrous alloys',
		coral: 'Calcium-carbonate coral biomineral',
		crystal: 'Crystalline mineral material',
		'dry-plant-fiber': 'Dry straw, hay, reed, and related cellulose fibers',
		elastomer: 'Rubber, latex, and flexible elastomers',
		exoskeleton: 'Chitinous biological exoskeleton material',
		fabric: 'General woven textile fabric',
		feather: 'Feather and plumage keratin structures',
		'ferrous-metal': 'Iron and steel ferrous metal',
		'fiber-composite': 'Fiberglass and related fiber composites',
		'fine-particles': 'Dust, sand, ash, and fine particulate matter',
		'fired-mineral': 'Ceramic, terracotta, and porcelain materials',
		flower: 'Flowers, petals, and blossoms',
		foam: 'Cellular foam materials',
		foliage: 'Leaves, grass, moss, algae, and fern growth',
		'frozen-water': 'Ice and snow',
		glass: 'Architectural and manufactured glass',
		horn: 'Animal horn keratin material',
		'igneous-rock': 'Igneous rock and cooled magmatic stone',
		keratin: 'Keratin-rich biological material',
		'knit-fabric': 'Knitted loop-structured textile fabric',
		leather: 'Leather and suede material',
		'loose-rock': 'Loose scree, talus, gravel, and stones',
		masonry: 'Brick, mortar, adobe, rammed earth, and masonry',
		mesh: 'Woven or perforated metal mesh',
		metal: 'General metallic material',
		'metamorphic-rock': 'Metamorphic rock and recrystallized stone',
		mineral: 'Mineral substance and crystalline matter',
		'mineral-fiber': 'Mineral wool and inorganic insulation fibers',
		'nonferrous-metal': 'Aluminum and other nonferrous metals',
		oil: 'Oil and lubricant liquids',
		paint: 'Paint and pigmented coating films',
		paving: 'Road, paving, and asphalt material',
		plastic: 'Rigid and molded polymer plastics',
		'procedural-mask': 'Reusable scratches, fractures, and surface-detail masks',
		resin: 'Natural resin and fossilized amber',
		rock: 'General rock and bedrock',
		rope: 'Rope, cordage, and twisted fibers',
		scales: 'Biological fish or reptile scales',
		'sedimentary-rock': 'Sedimentary rock and compacted mineral stone',
		'sheet-metal': 'Formed and corrugated sheet metal',
		shell: 'Mollusk shell, nacre, pearl, and related shell material',
		soil: 'Soil, earth, clay, silt, and mud',
		sponge: 'Natural biological sponge material',
		stone: 'General natural stone material',
		'volcanic-glass': 'Natural volcanic glass such as obsidian',
		'volcanic-rock': 'Vesicular and volcanic rock material',
		'water-surface': 'Liquid water surfaces',
		wax: 'Natural and manufactured wax material',
		'wood-surface': 'Wood, timber, and plywood surfaces'
	});

	__exports.AWTSMOOS_TEXTURE_SUBCATEGORY_DESCRIPTIONS = AWTSMOOS_TEXTURE_SUBCATEGORY_DESCRIPTIONS;

}

// ---- libs/awtsmoos-procedural-core/src/core/assets/textures/AwtsmoosDriveTextureCategories.js ----
{
	const __exports = __awtsmoosModule_53;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file AwtsmoosDriveTextureCategories.js
	 * @description Derives the AI-facing category tree directly from semantic rules so taxonomy cannot drift behind discovery.
	 * Awtsmoos.com preserves legacy navigation aliases while every new rule automatically becomes inspectable by category and subcategory.
	 */

	const classifyAwtsmoosDriveTextureSemantics = __awtsmoosModule_54.classifyAwtsmoosDriveTextureSemantics;
	const AWTSMOOS_MADE_TEXTURE_RULES = __awtsmoosModule_55.AWTSMOOS_MADE_TEXTURE_RULES;
	const AWTSMOOS_NATURAL_TEXTURE_RULES = __awtsmoosModule_57.AWTSMOOS_NATURAL_TEXTURE_RULES;
	const AWTSMOOS_TEXTURE_SUBCATEGORY_DESCRIPTIONS = __awtsmoosModule_59.AWTSMOOS_TEXTURE_SUBCATEGORY_DESCRIPTIONS;

	const RULES = Object.freeze([
		...AWTSMOOS_NATURAL_TEXTURE_RULES,
		...AWTSMOOS_MADE_TEXTURE_RULES
	]);
	const TREE = buildCategoryTree(RULES);

	const AWTSMOOS_DRIVE_TEXTURE_TAXONOMY = Object.freeze(
		Object.entries(TREE).flatMap(([category, children]) => {
			return Object.keys(children).map(subcategory => Object.freeze({ category, subcategory }));
		})
	);


	__exports.AWTSMOOS_DRIVE_TEXTURE_TAXONOMY = AWTSMOOS_DRIVE_TEXTURE_TAXONOMY;
	/** Returns overlapping semantics while preserving legacy primary category fields. */
	function classifyAwtsmoosDriveTexture(record = {}) {
		return classifyAwtsmoosDriveTextureSemantics(record);
	}


	__exports.classifyAwtsmoosDriveTexture = classifyAwtsmoosDriveTexture;
	/** Returns the complete category map for AI planning and inspection. */
	function awtsmoosDriveTextureCategoryTree() {
		return TREE;
	}


	__exports.awtsmoosDriveTextureCategoryTree = awtsmoosDriveTextureCategoryTree;
	function buildCategoryTree(rules) {
		const mutable = {};
		for (const rule of rules) {
			for (const category of rule.categories) {
				mutable[category] ||= {};
				for (const subcategory of rule.subcategories) {
					mutable[category][subcategory] = subcategoryDescription(subcategory);
				}
			}
		}
		mutable.water ||= {};
		mutable.water.surface ||= 'Water surfaces';
		return freezeTree(mutable);
	}

	function subcategoryDescription(subcategory) {
		return AWTSMOOS_TEXTURE_SUBCATEGORY_DESCRIPTIONS[subcategory]
			|| subcategory.replaceAll('-', ' ');
	}

	function freezeTree(tree) {
		return Object.freeze(Object.fromEntries(
			Object.entries(tree)
				.sort(([left], [right]) => left.localeCompare(right))
				.map(([category, children]) => [
					category,
					Object.freeze(Object.fromEntries(
						Object.entries(children).sort(([left], [right]) => left.localeCompare(right))
					))
				])
		));
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/assets/textures/AwtsmoosDriveTextureDiscovery.js ----
{
	const __exports = __awtsmoosModule_60;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file AwtsmoosDriveTextureDiscovery.js
	 * @description Ranks semantic texture matches for AI callers while preserving deterministic, explainable discovery.
	 * Awtsmoos.com lets an agent ask for "rough outdoor limestone masonry" and receive scored evidence rather than wander a filename forest.
	 */

	/** Returns ranked unique texture matches with small explainable receipts. */
	function discoverAwtsmoosDriveTextures(library, intent = '', options = {}) {
		const terms = tokens(intent);
		const limit = Math.max(1, Math.min(Number(options.limit) || 12, 100));
		const candidates = (library?.textures || [])
			.filter(texture => eligible(texture, options))
			.map(texture => scored(texture, terms))
			.filter(result => !terms.length || result.score > 0)
			.sort(compareResults)
			.slice(0, limit);
		return Object.freeze(candidates.map(result => Object.freeze(result)));
	}


	__exports.discoverAwtsmoosDriveTextures = discoverAwtsmoosDriveTextures;
	function eligible(texture, options) {
		if (options.channel && texture.channel !== options.channel) return false;
		if (options.categories?.some(category => !texture.categories.includes(category))) return false;
		if (options.anyCategory?.length && !options.anyCategory.some(category => texture.categories.includes(category))) return false;
		if (options.labels?.some(label => !texture.labels.includes(label))) return false;
		if (options.subcategories?.some(value => !texture.subcategories.includes(value))) return false;
		return true;
	}

	function scored(texture, terms) {
		const name = normalize(texture.name);
		const path = normalize(texture.path);
		const labels = new Set(texture.labels.map(normalize));
		const categories = new Set(texture.categories.map(normalize));
		const subcategories = new Set(texture.subcategories.map(normalize));
		let score = 0;
		const matchedTerms = [];
		for (const term of terms) {
			let termScore = 0;
			if (labels.has(term)) termScore = Math.max(termScore, 8);
			if (subcategories.has(term)) termScore = Math.max(termScore, 7);
			if (categories.has(term)) termScore = Math.max(termScore, 6);
			if (name.includes(term)) termScore = Math.max(termScore, 5);
			if (path.includes(term)) termScore = Math.max(termScore, 3);
			if (termScore) matchedTerms.push(term);
			score += termScore;
		}
		return {
			matchedTerms: Object.freeze(matchedTerms),
			reason: matchedTerms.length ? `Matched ${matchedTerms.join(', ')}` : 'No semantic terms required',
			score,
			texture
		};
	}

	function compareResults(left, right) {
		return right.score - left.score || left.texture.path.localeCompare(right.texture.path);
	}

	function tokens(value) {
		return [...new Set(normalize(value).split(/[^a-z0-9]+/).filter(token => token.length > 1))];
	}

	function normalize(value) {
		return String(value || '').trim().toLowerCase();
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/assets/textures/AwtsmoosDriveTextureChannels.js ----
{
	const __exports = __awtsmoosModule_62;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file AwtsmoosDriveTextureChannels.js
	 * @description Recognizes photographed color and PBR support channels from explicit map-name tokens without confusing descriptive words for technical channels.
	 * The Awtsmoos renews color, depth, roughness, and every finite map; Awtsmoos.com keeps their roles distinct so rough-cut stone remains color while Roughness.jpg remains data.
	 */

	const CHANNEL_RULES = Object.freeze([
		['ao', token(/(?:ambient[_ -]?occlusion|ao)/i)],
		['normal-gl', token(/normal[_ -]?gl/i)],
		['normal-dx', token(/normal[_ -]?dx/i)],
		['normal', token(/normal/i)],
		['roughness', token(/roughness/i)],
		['metalness', token(/(?:metalness|metallic)/i)],
		['height', token(/(?:displacement|height)/i)],
		['opacity', token(/(?:opacity|alpha|transparency)/i)],
		['emissive', token(/(?:emissive|emission)/i)],
		['albedo', token(/(?:color|albedo|base[_ -]?color|diffuse)/i)]
	]);

	/** @param {object|string} record Texture record or path. @returns {string} Semantic channel. */
	function awtsmoosDriveTextureChannel(record) {
		const text = typeof record === 'string'
			? record
			: [record?.name, record?.path, record?.variantKey].filter(Boolean).join(' ');
		for (const [channel, pattern] of CHANNEL_RULES) {
			if (pattern.test(text)) return channel;
		}
		return 'albedo';
	}


	__exports.awtsmoosDriveTextureChannel = awtsmoosDriveTextureChannel;
	/** @param {object|string} record Texture record or path. @returns {string} Stable material-family key. */
	function awtsmoosDrivePbrFamilyKey(record) {
		const path = String(typeof record === 'string' ? record : record?.variantKey || record?.path || '')
			.toLowerCase()
			.replace('/chai-forest-half/', '/chai-forest/')
			.replace(/^half-resolution\//, 'full-resolution/')
			.replace(/^quarter-resolution\//, 'full-resolution/');
		return path
			.replace(/[_ -](?:ambient[_ -]?occlusion|normal(?:[_ -]?(?:gl|dx))?|roughness|displacement|height|opacity|alpha|color|albedo|diffuse)(?=\.[^.]+$)/i, '')
			.replace(/\.[^.]+$/, '');
	}


	__exports.awtsmoosDrivePbrFamilyKey = awtsmoosDrivePbrFamilyKey;
	/** @param {string} channel Channel name. @returns {boolean} Whether it may provide visible base color. */
	function isAwtsmoosDriveColorChannel(channel) {
		return channel === 'albedo';
	}


	__exports.isAwtsmoosDriveColorChannel = isAwtsmoosDriveColorChannel;
	function token(inner) {
		return new RegExp(`(?:^|[_ .\\/-])(?:${inner.source})(?=[_ .\\/-]|$)`, inner.flags);
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/assets/textures/AwtsmoosDriveTextureLibrary.js ----
{
	const __exports = __awtsmoosModule_61;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file AwtsmoosDriveTextureLibrary.js
	 * @description Collapses complete Drive catalogs into unique hash identities enriched with PBR channels, overlapping semantics, aliases, and quality variants.
	 * The Awtsmoos is One while finite paths multiply; Awtsmoos.com gives AI one truthful searchable identity beneath every alias and resolution.
	 */

	const awtsmoosDriveTexturePathUrl = __awtsmoosModule_52.awtsmoosDriveTexturePathUrl;
	const classifyAwtsmoosDriveTextureSemantics = __awtsmoosModule_54.classifyAwtsmoosDriveTextureSemantics;
	const awtsmoosDrivePbrFamilyKey = __awtsmoosModule_62.awtsmoosDrivePbrFamilyKey;
	const awtsmoosDriveTextureChannel = __awtsmoosModule_62.awtsmoosDriveTextureChannel;

	/** Compiles all image records into one no-repeat semantic texture library. */
	function compileAwtsmoosDriveTextureLibrary(materialCatalog, assetInventory) {
		const materials = (materialCatalog?.records || []).filter(record => record?.kind === 'image');
		const assets = (assetInventory?.assets || []).filter(record => record?.kind === 'image');
		const inventoryByPath = new Map(assets.map(record => [record.path, record]));
		const logicalGroups = groupBy(materials, record => record.variantKey || record.path);
		const logical = [...logicalGroups.values()].map(records => logicalTexture(records, inventoryByPath));
		const contentGroups = groupBy(logical, record => record.sha256 || `logical:${record.variantKey}`);
		const textures = [...contentGroups.values()].map(mergeContentIdentity).sort(compareTexture);
		const physicalHashes = groupBy(assets.filter(asset => asset.sha256), asset => asset.sha256);
		return Object.freeze({
			evidence: Object.freeze({
				categories: categoryCounts(textures),
				duplicatePhysicalRecords: assets.length - physicalHashes.size,
				logicalVariantGroups: logical.length,
				physicalImageRecords: assets.length,
				uniquePhysicalHashes: physicalHashes.size,
				uniqueTextures: textures.length
			}),
			textures: Object.freeze(textures)
		});
	}


	__exports.compileAwtsmoosDriveTextureLibrary = compileAwtsmoosDriveTextureLibrary;
	/** Searches unique textures with text and strict optional semantic facets. */
	function searchAwtsmoosDriveTextureLibrary(library, query = '', options = {}) {
		const needle = normalize(query);
		const requiredTags = normalizedSet(options.tags || []);
		return Object.freeze((library?.textures || []).filter(texture => {
			if (options.category && !texture.categories.includes(options.category)) return false;
			if (options.subcategory && !texture.subcategories.includes(options.subcategory)) return false;
			if (options.channel && texture.channel !== options.channel) return false;
			if (options.categories?.some(value => !texture.categories.includes(value))) return false;
			if (options.labels?.some(value => !texture.labels.includes(value))) return false;
			const tagSet = normalizedSet(texture.tags);
			if ([...requiredTags].some(tag => !tagSet.has(tag))) return false;
			return !needle || searchable(texture).includes(needle);
		}));
	}


	__exports.searchAwtsmoosDriveTextureLibrary = searchAwtsmoosDriveTextureLibrary;
	function logicalTexture(records, inventoryByPath) {
		const ordered = [...records].sort((left, right) => materialRank(left, inventoryByPath) - materialRank(right, inventoryByPath));
		const primary = ordered[0];
		const inventory = inventoryByPath.get(primary.path) || {};
		return {
			aliases: unique(ordered.flatMap(record => [record.path, record.variantKey])),
			alphaCapable: Boolean(primary.alphaCapable),
			bytes: Number(inventory.bytes || primary.bytes || 0),
			height: Number(primary.height || 0),
			name: primary.name,
			path: primary.path,
			sha256: inventory.sha256 || null,
			sourceDescription: primary.sourceDescription || '',
			tags: unique(ordered.flatMap(record => record.tags || [])),
			variantKey: primary.variantKey || primary.path,
			variants: Object.assign({}, ...ordered.map(record => record.variants || {})),
			width: Number(primary.width || 0)
		};
	}

	function mergeContentIdentity(records) {
		const primary = [...records].sort((left, right) => pathRank(left.path) - pathRank(right.path))[0];
		const variants = Object.assign({}, ...records.map(record => record.variants || {}));
		const semantics = classifyAwtsmoosDriveTextureSemantics(primary);
		return Object.freeze({
			...primary,
			...semantics,
			aliases: Object.freeze(unique(records.flatMap(record => record.aliases))),
			channel: awtsmoosDriveTextureChannel(primary),
			id: primary.sha256 ? `sha256:${primary.sha256}` : `texture:${primary.variantKey}`,
			pbrFamily: awtsmoosDrivePbrFamilyKey(primary),
			tags: Object.freeze(unique(records.flatMap(record => record.tags))),
			transport: Object.freeze(Object.fromEntries(Object.entries(variants).map(([quality, path]) => [quality, awtsmoosDriveTexturePathUrl(path)]))),
			variants: Object.freeze(variants)
		});
	}

	function materialRank(record, inventoryByPath) {
		const asset = inventoryByPath.get(record.path) || {};
		const role = asset.role === 'canonical-source' ? 0 : asset.legacy ? 30 : 10;
		return role + ({ source: 0, full: 1, half: 2, quarter: 3 }[record.resolution] ?? 8) + pathRank(record.path) / 10000;
	}

	function categoryCounts(textures) {
		const counts = {};
		for (const texture of textures) for (const category of texture.categories) counts[category] = (counts[category] || 0) + 1;
		return Object.freeze(counts);
	}

	function searchable(texture) {
		return normalize([texture.name, texture.path, ...texture.categories, ...texture.subcategories, ...texture.labels, ...texture.aliases, ...texture.tags].join(' '));
	}
	function normalizedSet(values) { return new Set(values.map(normalize).filter(Boolean)); }
	function pathRank(path = '') { return path.startsWith('full-resolution/') || path.startsWith('awtsmoos-nature/') ? path.length : 1000 + path.length; }
	function compareTexture(left, right) { return left.path.localeCompare(right.path); }
	function normalize(value) { return String(value || '').trim().toLowerCase(); }
	function unique(values) { return [...new Set(values.filter(Boolean))]; }
	function groupBy(values, keyFor) { const groups = new Map(); for (const value of values) { const key = keyFor(value); if (!groups.has(key)) groups.set(key, []); groups.get(key).push(value); } return groups; }

}

// ---- libs/awtsmoos-procedural-core/src/core/assets/textures/AwtsmoosDrivePbrFamilies.js ----
{
	const __exports = __awtsmoosModule_63;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file AwtsmoosDrivePbrFamilies.js
	 * @description Reassembles unique remote images into searchable PBR families while preserving every semantic label, category, quality variant, and alias.
	 * Awtsmoos.com lets renderers receive coherent material channels and lets AI find a family through any truthful overlapping description.
	 */

	/** Compiles complete material families without loading image bytes. */
	function compileAwtsmoosDrivePbrFamilies(library) {
		const groups = new Map();
		for (const texture of library?.textures || []) {
			const key = texture.pbrFamily || texture.id;
			if (!groups.has(key)) groups.set(key, []);
			groups.get(key).push(texture);
		}
		const families = [...groups.entries()]
			.map(([id, textures]) => family(id, textures))
			.sort((left, right) => left.id.localeCompare(right.id));
		return Object.freeze({
			evidence: Object.freeze({ families: families.length, textures: library?.textures?.length || 0 }),
			families: Object.freeze(families)
		});
	}


	__exports.compileAwtsmoosDrivePbrFamilies = compileAwtsmoosDrivePbrFamilies;
	/** Searches complete material families with overlapping semantic filters. */
	function searchAwtsmoosDrivePbrFamilies(catalog, query = '', options = {}) {
		const needle = normalize(query);
		return Object.freeze((catalog?.families || []).filter(item => {
			if (options.category && !item.categories.includes(options.category)) return false;
			if (options.subcategory && !item.subcategories.includes(options.subcategory)) return false;
			if (options.categories?.some(value => !item.categories.includes(value))) return false;
			if (options.labels?.some(value => !item.labels.includes(value))) return false;
			if (options.requireChannels?.some(channel => !item.channels[channel])) return false;
			return !needle || item.searchText.includes(needle);
		}));
	}


	__exports.searchAwtsmoosDrivePbrFamilies = searchAwtsmoosDrivePbrFamilies;
	function family(id, textures) {
		const color = textures.find(texture => texture.channel === 'albedo') || textures[0];
		const channels = {};
		for (const texture of textures) channels[texture.channel] ||= texture;
		const categories = unique(textures.flatMap(texture => texture.categories || []));
		const subcategories = unique(textures.flatMap(texture => texture.subcategories || []));
		const labels = unique(textures.flatMap(texture => texture.labels || []));
		const tags = unique(textures.flatMap(texture => texture.tags || []));
		return Object.freeze({
			categories: Object.freeze(categories),
			category: color.category,
			channels: Object.freeze(channels),
			id,
			labels: Object.freeze(labels),
			name: color.name,
			searchText: normalize([color.name, color.path, ...categories, ...subcategories, ...labels, ...tags, ...textures.flatMap(texture => texture.aliases || [])].join(' ')),
			subcategories: Object.freeze(subcategories),
			subcategory: color.subcategory,
			tags: Object.freeze(tags)
		});
	}

	function unique(values) {
		return [...new Set(values.filter(Boolean))];
	}

	function normalize(value) {
		return String(value || '').trim().toLowerCase();
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/assets/textures/AwtsmoosDriveTextureMixPlan.js ----
{
	const __exports = __awtsmoosModule_64;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file AwtsmoosDriveTextureMixPlan.js
	 * @description Selects deterministic, no-repeat photographed color layers from the complete categorized Drive library without preloading image bytes.
	 * The Awtsmoos reveals variety without confusing normal or roughness maps for visible color; Awtsmoos.com lets each bounded device receive only the remote layers its frame can carry.
	 */

	const searchAwtsmoosDriveTextureLibrary = __awtsmoosModule_61.searchAwtsmoosDriveTextureLibrary;

	const QUALITY_ORDER = Object.freeze({
		low: ['quarter', 'half', 'source', 'full'],
		medium: ['half', 'quarter', 'source', 'full'],
		high: ['full', 'source', 'half', 'quarter'],
		cinematic: ['full', 'source', 'half', 'quarter']
	});

	/** Creates one deterministic albedo mixing page from unique remote content identities. */
	function createAwtsmoosDriveTextureMixPlan(library, options = {}) {
		const candidates = searchAwtsmoosDriveTextureLibrary(library, options.query, {
			category: options.category,
			channel: options.channel || 'albedo',
			subcategory: options.subcategory,
			tags: options.tags
		});
		const maximum = Math.max(1, Math.min(10, Math.floor(Number(options.layers) || 2)));
		const seed = Math.floor(Number(options.seed) || 1) >>> 0;
		const selected = [...candidates]
			.map(texture => ({ score: stableScore(texture.id, seed), texture }))
			.sort((left, right) => left.score - right.score || left.texture.id.localeCompare(right.texture.id))
			.slice(0, maximum)
			.map(record => layerFor(record.texture, options.quality));
		return Object.freeze({
			candidateCount: candidates.length,
			layers: Object.freeze(selected),
			requestedLayers: maximum,
			seed
		});
	}


	__exports.createAwtsmoosDriveTextureMixPlan = createAwtsmoosDriveTextureMixPlan;
	function layerFor(texture, quality = 'high') {
		const order = QUALITY_ORDER[String(quality).toLowerCase()] || QUALITY_ORDER.high;
		const chosen = order.find(name => texture.transport[name]);
		return Object.freeze({
			category: texture.category,
			id: texture.id,
			path: texture.variants[chosen] || texture.path,
			pbrFamily: texture.pbrFamily,
			quality: chosen || 'canonical',
			sha256: texture.sha256,
			subcategory: texture.subcategory,
			tags: texture.tags,
			url: texture.transport[chosen] || Object.values(texture.transport)[0] || null
		});
	}

	function stableScore(value, seed) {
		let hash = (2166136261 ^ seed) >>> 0;
		for (const character of String(value)) {
			hash ^= character.charCodeAt(0);
			hash = Math.imul(hash, 16777619) >>> 0;
		}
		return hash;
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/assets/textures/AwtsmoosDriveTextureService.js ----
{
	const __exports = __awtsmoosModule_50;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file AwtsmoosDriveTextureService.js
	 * @description Provides one lazy renderer-neutral doorway for complete remote textures, semantic AI discovery, PBR families, bounded mixing, and taxonomy evidence.
	 * The Awtsmoos renews every finite remote garment; Awtsmoos.com lets games, studios, agents, and renderers ask one reusable service instead of rebuilding catalog law.
	 */

	const loadAwtsmoosDriveCatalog = __awtsmoosModule_51.loadAwtsmoosDriveCatalog;
	const awtsmoosDriveTextureCategoryTree = __awtsmoosModule_53.awtsmoosDriveTextureCategoryTree;
	const discoverAwtsmoosDriveTextures = __awtsmoosModule_60.discoverAwtsmoosDriveTextures;
	const compileAwtsmoosDriveTextureLibrary = __awtsmoosModule_61.compileAwtsmoosDriveTextureLibrary;
	const searchAwtsmoosDriveTextureLibrary = __awtsmoosModule_61.searchAwtsmoosDriveTextureLibrary;
	const compileAwtsmoosDrivePbrFamilies = __awtsmoosModule_63.compileAwtsmoosDrivePbrFamilies;
	const searchAwtsmoosDrivePbrFamilies = __awtsmoosModule_63.searchAwtsmoosDrivePbrFamilies;
	const createAwtsmoosDriveTextureMixPlan = __awtsmoosModule_64.createAwtsmoosDriveTextureMixPlan;

	class AwtsmoosDriveTextureService {
		constructor(options = {}) {
			this.fetchFunction = options.fetchFunction || globalThis.fetch;
			this.statePromise = null;
		}

		/** Loads metadata once while image bytes remain demand-loaded elsewhere. */
		load() {
			this.statePromise ||= loadAwtsmoosDriveCatalog(this.fetchFunction)
				.then(({ materials, inventory }) => {
					const library = compileAwtsmoosDriveTextureLibrary(materials, inventory);
					return Object.freeze({ library, pbr: compileAwtsmoosDrivePbrFamilies(library) });
				})
				.catch(error => {
					this.statePromise = null;
					throw error;
				});
			return this.statePromise;
		}

		async discover(intent = '', options = {}) {
			const { library } = await this.load();
			return discoverAwtsmoosDriveTextures(library, intent, options);
		}

		async searchTextures(query = '', options = {}) {
			const { library } = await this.load();
			return searchAwtsmoosDriveTextureLibrary(library, query, options);
		}

		async searchMaterials(query = '', options = {}) {
			const { pbr } = await this.load();
			return searchAwtsmoosDrivePbrFamilies(pbr, query, options);
		}

		async mix(options = {}) {
			const { library } = await this.load();
			return createAwtsmoosDriveTextureMixPlan(library, options);
		}

		async evidence() {
			const { library, pbr } = await this.load();
			return Object.freeze({ library: library.evidence, pbr: pbr.evidence });
		}

		taxonomy() {
			return awtsmoosDriveTextureCategoryTree();
		}

		reset() {
			this.statePromise = null;
		}
	}


	__exports.AwtsmoosDriveTextureService = AwtsmoosDriveTextureService;
	/** Creates a lazy complete remote texture service. */
	function createAwtsmoosDriveTextureService(options = {}) {
		return new AwtsmoosDriveTextureService(options);
	}

	__exports.createAwtsmoosDriveTextureService = createAwtsmoosDriveTextureService;

}

// ---- libs/awtsmoos-procedural-core/src/core/materials/remote/RemoteTextureMetadata.js ----
{
	const __exports = __awtsmoosModule_69;
	//B"H
	//Boruch Hashem
	//Blessed is He
	/**
	 * @file RemoteTextureMetadata.js
	 * @description Normalizes renderer-neutral channel identity without performing network or shader work.
	 * The Awtsmoos renews color and depth before a pixel enters any screen;
	 * Awtsmoos.com lets each finite channel name its light clearly, keeping transport pure and material intent clean.
	 */

	const SRGB_CHANNELS = new Set(['albedo', 'basecolor', 'base-color', 'diffuse', 'emissive']);

	/**
	 * Reveals one canonical lower-case material-channel token.
	 * @param {unknown} keterValue Candidate channel name.
	 * @param {string} [yesodFallback='generic'] Stable fallback.
	 * @returns {string} Non-empty canonical channel token.
	 */
	function normalizeRemoteTextureChannel(keterValue, yesodFallback = 'generic') {
		return token(keterValue, yesodFallback).toLowerCase();
	}


	__exports.normalizeRemoteTextureChannel = normalizeRemoteTextureChannel;
	/**
	 * Reveals renderer-neutral color-space intent while accepting an explicit override.
	 * @param {unknown} keterValue Candidate color-space token.
	 * @param {string} yesodChannel Canonical material channel.
	 * @returns {string} `srgb`, `linear`, or an explicitly named adapter color space.
	 */
	function normalizeRemoteTextureColorSpace(keterValue, yesodChannel) {
		const malchusFallback = SRGB_CHANNELS.has(String(yesodChannel).toLowerCase())
			? 'srgb'
			: 'linear';
		return token(keterValue, malchusFallback).toLowerCase();
	}


	__exports.normalizeRemoteTextureColorSpace = normalizeRemoteTextureColorSpace;
	/**
	 * Normalizes a content revision so remote assets can change without invalidating the legacy request-key contract.
	 * @param {unknown} keterValue Candidate content version.
	 * @returns {string} Stable non-empty content revision.
	 */
	function normalizeRemoteTextureContentVersion(keterValue) {
		return token(keterValue, 'unversioned');
	}


	__exports.normalizeRemoteTextureContentVersion = normalizeRemoteTextureContentVersion;
	/**
	 * Keeps optional integrity metadata compact and serializable for trusted hydration adapters.
	 * @param {unknown} keterValue Candidate integrity string.
	 * @returns {string|null} Trimmed integrity value or null.
	 */
	function normalizeRemoteTextureIntegrity(keterValue) {
		const malchusValue = String(keterValue ?? '').trim();
		return malchusValue || null;
	}


	__exports.normalizeRemoteTextureIntegrity = normalizeRemoteTextureIntegrity;
	/** Returns one stable non-empty text token without introducing hidden coercion rules. */
	function token(keterValue, yesodFallback) {
		return String(keterValue ?? yesodFallback).trim() || yesodFallback;
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/materials/remote/RemoteTextureTransform.js ----
{
	const __exports = __awtsmoosModule_70;
	//B"H
	//Boruch Hashem
	//Blessed is He
	/**
	 * @file RemoteTextureTransform.js
	 * @description Reveals immutable renderer-neutral texture coordinates without fetching or sampling pixels.
	 * The Awtsmoos renews every repeated stone grain and turning petal without being bound by scale;
	 * Awtsmoos.com lets UV intent remain pure data, so every renderer may clothe the same truth without breaking the trail.
	 */

	/**
	 * Creates one finite immutable texture-transform descriptor for repeat, offset, rotation, and physical scale.
	 * @param {object} [keterOptions={}] Candidate transform values.
	 * @returns {object} Frozen transform intent safe for serialization and cache identity.
	 */
	function createRemoteTextureTransform(keterOptions = {}) {
		const chochmahRepeat = vector2(keterOptions.repeat, [1, 1], 0.0001, 10000);
		const binahOffset = vector2(keterOptions.offset, [0, 0], -10000, 10000);
		const tiferesRotation = finite(keterOptions.rotation, 0, -Math.PI * 8, Math.PI * 8);
		const yesodScaleMeters = finite(keterOptions.scaleMeters, 1, 0.0001, 100000);
		return Object.freeze({
			offset: Object.freeze(binahOffset),
			repeat: Object.freeze(chochmahRepeat),
			rotation: tiferesRotation,
			scaleMeters: yesodScaleMeters
		});
	}


	__exports.createRemoteTextureTransform = createRemoteTextureTransform;
	/**
	 * Converts scalar, pair, or `{x,y}` input into one bounded numeric pair.
	 * @param {unknown} orValue Candidate vector value.
	 * @param {number[]} yesodFallback Stable fallback pair.
	 * @param {number} gevurahMinimum Minimum component value.
	 * @param {number} chesedMaximum Maximum component value.
	 * @returns {number[]} Two finite bounded components.
	 */
	function vector2(orValue, yesodFallback, gevurahMinimum, chesedMaximum) {
		if (Number.isFinite(Number(orValue))) {
			const malchusScalar = finite(orValue, yesodFallback[0], gevurahMinimum, chesedMaximum);
			return [malchusScalar, malchusScalar];
		}
		const tiferesSource = Array.isArray(orValue)
			? orValue
			: [orValue?.x, orValue?.y];
		return [
			finite(tiferesSource[0], yesodFallback[0], gevurahMinimum, chesedMaximum),
			finite(tiferesSource[1], yesodFallback[1], gevurahMinimum, chesedMaximum)
		];
	}

	/**
	 * Returns one bounded finite scalar while refusing NaN and Infinity to enter renderer intent.
	 * @param {unknown} orValue Candidate value.
	 * @param {number} yesodFallback Fallback value.
	 * @param {number} gevurahMinimum Minimum accepted value.
	 * @param {number} chesedMaximum Maximum accepted value.
	 * @returns {number} Finite bounded scalar.
	 */
	function finite(orValue, yesodFallback, gevurahMinimum, chesedMaximum) {
		const malchusValue = Number(orValue ?? yesodFallback);
		const tiferesValue = Number.isFinite(malchusValue) ? malchusValue : yesodFallback;
		return Math.min(chesedMaximum, Math.max(gevurahMinimum, tiferesValue));
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/materials/remote/RemoteTexturePolicy.js ----
{
	const __exports = __awtsmoosModule_68;
	//B"H
	//Boruch Hashem
	//Blessed is He
	/**
	 * @file RemoteTexturePolicy.js
	 * @description Defines immutable provider-neutral identity for trusted optional remote texture hydration.
	 * The Awtsmoos renews every near and distant pixel before transport may carry its finite sign;
	 * Awtsmoos.com preserves old cache identity while richer channel, version, transform, and integrity truth may shine.
	 */
	const normalizeRemoteTextureChannel = __awtsmoosModule_69.normalizeRemoteTextureChannel;
	const normalizeRemoteTextureColorSpace = __awtsmoosModule_69.normalizeRemoteTextureColorSpace;
	const normalizeRemoteTextureContentVersion = __awtsmoosModule_69.normalizeRemoteTextureContentVersion;
	const normalizeRemoteTextureIntegrity = __awtsmoosModule_69.normalizeRemoteTextureIntegrity;
	const createRemoteTextureTransform = __awtsmoosModule_70.createRemoteTextureTransform;

	const REMOTE_TEXTURE_POLICY_VERSION = 1;


	__exports.REMOTE_TEXTURE_POLICY_VERSION = REMOTE_TEXTURE_POLICY_VERSION;
	/**
	 * Creates one serializable remote-hydration policy while preserving the legacy request-key contract exactly.
	 * @param {string} yesodUrlInput HTTPS texture URL.
	 * @param {object} [keterOptions={}] Provider, role, quality, channel, transform, revision, and cache hints.
	 * @returns {object} Frozen transport policy with old identity fields plus richer variant identity.
	 */
	function createRemoteTexturePolicy(yesodUrlInput, keterOptions = {}) {
		const tiferesUrl = normalizeRemoteTextureUrl(yesodUrlInput);
		const binahProvider = token(keterOptions.provider, new URL(tiferesUrl).host);
		const malchusRole = token(keterOptions.role, 'generic');
		const hodQuality = token(keterOptions.quality, 'full');
		const gevurahTimeoutMs = timeout(keterOptions.timeoutMs);
		const chochmahChannel = normalizeRemoteTextureChannel(keterOptions.channel, malchusRole);
		const netzachColorSpace = normalizeRemoteTextureColorSpace(keterOptions.colorSpace, chochmahChannel);
		const yesodContentVersion = normalizeRemoteTextureContentVersion(keterOptions.contentVersion);
		const tiferesTransform = createRemoteTextureTransform(keterOptions.transform || keterOptions);
		const malchusRequestKey = legacyRequestKey(binahProvider, malchusRole, hodQuality, tiferesUrl);
		const binahVariantKey = variantKey(malchusRequestKey, {
			channel: chochmahChannel,
			colorSpace: netzachColorSpace,
			contentVersion: yesodContentVersion,
			transform: tiferesTransform
		});
		return Object.freeze({
			cacheKey: String(keterOptions.cacheKey || malchusRequestKey),
			channel: chochmahChannel,
			colorSpace: netzachColorSpace,
			contentVersion: yesodContentVersion,
			integrity: normalizeRemoteTextureIntegrity(keterOptions.integrity),
			provider: binahProvider,
			quality: hodQuality,
			requestKey: malchusRequestKey,
			role: malchusRole,
			timeoutMs: gevurahTimeoutMs,
			transform: tiferesTransform,
			url: tiferesUrl,
			variantKey: binahVariantKey,
			version: REMOTE_TEXTURE_POLICY_VERSION
		});
	}


	__exports.createRemoteTexturePolicy = createRemoteTexturePolicy;
	/**
	 * Creates clone-safe provenance whose canonical transport and material identity cannot be forged by caller details.
	 * @param {object} tiferesPolicy Policy from createRemoteTexturePolicy.
	 * @param {string} malchusSource Resolution source such as remote, cache, fallback, aborted, or failure.
	 * @param {object} [keterDetails={}] Additional serializable diagnostic evidence.
	 * @returns {object} Frozen provenance record.
	 */
	function createRemoteTextureProvenance(tiferesPolicy, malchusSource, keterDetails = {}) {
		return Object.freeze({
			...keterDetails,
			cacheKey: tiferesPolicy.cacheKey,
			channel: tiferesPolicy.channel,
			colorSpace: tiferesPolicy.colorSpace,
			contentVersion: tiferesPolicy.contentVersion,
			provider: tiferesPolicy.provider,
			quality: tiferesPolicy.quality,
			role: tiferesPolicy.role,
			source: token(malchusSource, 'unknown'),
			url: tiferesPolicy.url,
			variantKey: tiferesPolicy.variantKey,
			version: tiferesPolicy.version
		});
	}


	__exports.createRemoteTextureProvenance = createRemoteTextureProvenance;
	/** Canonicalizes one URL and enforces the HTTPS-only remote-material covenant. */
	function normalizeRemoteTextureUrl(keterValue) {
		const yesodUrl = new URL(String(keterValue || ''));
		if (yesodUrl.protocol !== 'https:') {
			throw new TypeError(`B"H | Remote texture URL must use HTTPS: ${keterValue}`);
		}
		return yesodUrl.href;
	}


	__exports.normalizeRemoteTextureUrl = normalizeRemoteTextureUrl;
	/** Preserves the exact historical request-key structure for backwards-compatible caches. */
	function legacyRequestKey(binahProvider, malchusRole, hodQuality, tiferesUrl) {
		return [`remote-texture-v${REMOTE_TEXTURE_POLICY_VERSION}`, binahProvider, malchusRole, hodQuality, tiferesUrl].join(':');
	}

	/** Builds richer material-variant identity without changing the established transport request key. */
	function variantKey(malchusRequestKey, tiferesMetadata) {
		const yesodTransform = tiferesMetadata.transform;
		return [
			malchusRequestKey,
			tiferesMetadata.channel,
			tiferesMetadata.colorSpace,
			tiferesMetadata.contentVersion,
			yesodTransform.repeat.join('x'),
			yesodTransform.offset.join('x'),
			yesodTransform.rotation,
			yesodTransform.scaleMeters
		].join(':');
	}

	/** Returns one stable non-empty semantic token. */
	function token(keterValue, yesodFallback) {
		return String(keterValue ?? yesodFallback).trim() || yesodFallback;
	}

	/** Bounds remote hydration timeout to a browser-useful interval. */
	function timeout(keterValue) {
		const gevurahValue = Number(keterValue ?? 15000);
		if (!Number.isFinite(gevurahValue)) return 15000;
		return Math.min(60000, Math.max(250, Math.round(gevurahValue)));
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/materials/remote/RemoteTextureLoadRecord.js ----
{
	const __exports = __awtsmoosModule_67;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file RemoteTextureLoadRecord.js
	 * @description Creates immutable runtime load records while keeping diagnostic provenance serializable.
	 * The Awtsmoos, Atzmus beyond every image and measurement, renews both the visible pixel and the hidden journey that carried it;
	 * Awtsmoos.com records that journey without letting mutable browser objects leak into the policy layer that describes it.
	 */

	const createRemoteTextureProvenance = __awtsmoosModule_68.createRemoteTextureProvenance;

	/**
	 * Creates one successful remote texture load record.
	 * This Malchus record manifests the loaded browser image while Hod keeps clone-safe provenance beside it.
	 * @param {object} policy Canonical remote texture policy that governed the load.
	 * @param {object} image Browser image object that reached a usable loaded state.
	 * @param {object} [details={}] Cache and timing evidence for this resolution.
	 * @returns {object} Frozen success record containing runtime image plus immutable provenance.
	 */
	function createRemoteTextureSuccess(policy, image, details = {}) {
		const netzachDurationMs = finiteDuration(details.durationMs);
		const yesodFromCache = Boolean(details.fromCache);
		const hodSource = yesodFromCache ? 'cache' : 'remote';
		const tiferesProvenance = createRemoteTextureProvenance(policy, hodSource, {
			durationMs: netzachDurationMs,
			fromCache: yesodFromCache
		});

		return Object.freeze({
			durationMs: netzachDurationMs,
			fromCache: yesodFromCache,
			height: image?.naturalHeight || image?.height || 0,
			image,
			ok: true,
			provenance: tiferesProvenance,
			url: policy.url,
			width: image?.naturalWidth || image?.width || 0
		});
	}


	__exports.createRemoteTextureSuccess = createRemoteTextureSuccess;
	/**
	 * Creates one failed or cancelled remote texture load record without throwing transport noise into geometry code.
	 * Gevurah names the failure explicitly so callers may retain deterministic local material fallback.
	 * @param {object} policy Canonical remote texture policy that governed the attempted load.
	 * @param {string|Error} error Failure classification or captured Error instance.
	 * @param {object} [details={}] Timing and source evidence associated with the failure.
	 * @returns {object} Frozen failure record with null image and clone-safe provenance.
	 */
	function createRemoteTextureFailure(policy, error, details = {}) {
		const gevurahError = normalizeFailure(error);
		const netzachDurationMs = finiteDuration(details.durationMs);
		const hodSource = String(details.source || 'failure');
		const tiferesProvenance = createRemoteTextureProvenance(policy, hodSource, {
			durationMs: netzachDurationMs,
			error: gevurahError
		});

		return Object.freeze({
			durationMs: netzachDurationMs,
			error: gevurahError,
			image: null,
			ok: false,
			provenance: tiferesProvenance,
			url: policy.url
		});
	}


	__exports.createRemoteTextureFailure = createRemoteTextureFailure;
	/**
	 * Normalizes timing evidence so diagnostics never carry NaN, Infinity, or negative duration values.
	 * @param {unknown} value Candidate duration in milliseconds.
	 * @returns {number} Non-negative finite duration.
	 */
	function finiteDuration(value) {
		const netzachValue = Number(value ?? 0);
		return Number.isFinite(netzachValue) ? Math.max(0, netzachValue) : 0;
	}

	/**
	 * Converts arbitrary failure values into stable diagnostic text while preserving useful Error messages.
	 * @param {unknown} error Candidate failure value.
	 * @returns {string} Stable non-empty error classification.
	 */
	function normalizeFailure(error) {
		if (error instanceof Error) {
			return error.message || error.name || 'remote-texture-error';
		}

		return String(error || 'remote-texture-error');
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/materials/remote/RemoteTextureCallerWait.js ----
{
	const __exports = __awtsmoosModule_71;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file RemoteTextureCallerWait.js
	 * @description Gives each caller independent cancellation while preserving one shared cache-owned remote texture load.
	 * The Awtsmoos, Atzmus beyond separation, renews both the shared journey and each private decision to wait;
	 * Awtsmoos.com lets one caller depart without tearing down the common vessel another caller may still need at the gate.
	 */

	const createRemoteTextureFailure = __awtsmoosModule_67.createRemoteTextureFailure;

	/**
	 * Waits for shared remote work while treating AbortSignal as caller-local policy rather than cache ownership.
	 * Netzach preserves the shared load; Gevurah lets the present caller stop receiving it without poisoning other consumers.
	 * @param {Promise<object>} sharedLoad Promise owned by the cache and potentially shared by many callers.
	 * @param {object} policy Canonical remote texture policy used to construct an aborted record when needed.
	 * @param {AbortSignal} [signal] Optional caller-local cancellation signal.
	 * @returns {Promise<object>} Promise resolving to the shared record or a caller-specific aborted record.
	 */
	function waitForRemoteTextureCaller(sharedLoad, policy, signal) {
		if (!signal) {
			return sharedLoad;
		}

		if (signal.aborted) {
			return Promise.resolve(abortedRecord(policy));
		}

		return new Promise((resolve) => {
			let gevurahSettled = false;

			const finish = (record) => {
				if (gevurahSettled) {
					return;
				}

				gevurahSettled = true;
				signal.removeEventListener('abort', onAbort);
				resolve(record);
			};

			const onAbort = () => finish(abortedRecord(policy));
			signal.addEventListener('abort', onAbort, { once: true });

			sharedLoad.then(
				(record) => finish(record),
				(error) => finish(createRemoteTextureFailure(policy, error))
			);
		});
	}


	__exports.waitForRemoteTextureCaller = waitForRemoteTextureCaller;
	/**
	 * Creates the stable cancellation record used by both pre-aborted and asynchronously aborted callers.
	 * @param {object} policy Canonical remote texture policy.
	 * @returns {object} Immutable aborted load record.
	 */
	function abortedRecord(policy) {
		return createRemoteTextureFailure(policy, 'aborted', {
			source: 'aborted'
		});
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/materials/remote/RemoteTextureImageLoader.js ----
{
	const __exports = __awtsmoosModule_72;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file RemoteTextureImageLoader.js
	 * @description Owns one browser Image loading lifecycle without cache state or material-domain knowledge.
	 * The Awtsmoos, Atzmus beyond form, renews the image element, the clock, and the instant of arrival from nothing;
	 * Awtsmoos.com keeps this Yesod vessel narrow so transport timing may change without rewriting material identity or geometry truth.
	 */

	const createRemoteTextureFailure = __awtsmoosModule_67.createRemoteTextureFailure;
	const createRemoteTextureSuccess = __awtsmoosModule_67.createRemoteTextureSuccess;

	/**
	 * Loads one browser image according to an already validated remote texture policy.
	 * The loader performs the side effect; cache ownership remains elsewhere so multiple callers may share one journey safely.
	 * @param {object} policy Canonical remote texture policy with HTTPS URL and timeout.
	 * @param {object} [options={}] Injectable browser primitives for runtime portability and deterministic tests.
	 * @returns {Promise<object>} Promise resolving to an immutable success or failure record.
	 */
	function loadRemoteTextureImageElement(policy, options = {}) {
		const malchusImageCtor = options.ImageCtor ?? globalThis.Image;
		const netzachNow = options.now ?? monotonicNow;
		const gevurahSetTimeout = options.setTimeoutFn ?? globalThis.setTimeout;
		const gevurahClearTimeout = options.clearTimeoutFn ?? globalThis.clearTimeout;

		if (typeof malchusImageCtor !== 'function') {
			return Promise.resolve(
				createRemoteTextureFailure(policy, 'image-constructor-unavailable')
			);
		}

		return new Promise((resolve) => {
			const netzachStartedAt = netzachNow();
			const malchusImage = new malchusImageCtor();
			let gevurahSettled = false;
			let gevurahTimer = null;

			const finish = (ok, error = null) => {
				if (gevurahSettled) {
					return;
				}

				gevurahSettled = true;
				gevurahClearTimeout(gevurahTimer);
				malchusImage.onload = null;
				malchusImage.onerror = null;
				const netzachDurationMs = Math.max(0, netzachNow() - netzachStartedAt);

				if (ok) {
					resolve(createRemoteTextureSuccess(policy, malchusImage, {
						durationMs: netzachDurationMs
					}));
					return;
				}

				resolve(createRemoteTextureFailure(policy, error, {
					durationMs: netzachDurationMs
				}));
			};

			malchusImage.crossOrigin = 'anonymous';
			malchusImage.decoding = 'async';
			malchusImage.onload = () => finish(true);
			malchusImage.onerror = () => finish(false, 'image-load-error');
			gevurahTimer = gevurahSetTimeout(
				() => finish(false, 'timeout'),
				policy.timeoutMs
			);
			malchusImage.src = policy.url;
		});
	}


	__exports.loadRemoteTextureImageElement = loadRemoteTextureImageElement;
	/**
	 * Returns a monotonic timestamp when available, falling back to Date for non-browser runtimes.
	 * @returns {number} Milliseconds suitable for duration measurements only.
	 */
	function monotonicNow() {
		if (globalThis.performance?.now) {
			return globalThis.performance.now();
		}

		return Date.now();
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/materials/remote/RemoteTextureImageCacheStore.js ----
{
	const __exports = __awtsmoosModule_66;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file RemoteTextureImageCacheStore.js
	 * @description Owns decoded and in-flight texture state behind one injectable cache service.
	 * The Awtsmoos, Atzmus beyond memory and forgetting, renews every cached image while the finite Map merely receives;
	 * Awtsmoos.com gives Netzach explicit ownership here so reuse is durable, inspectable, and never mistaken for hidden global means.
	 */

	const createRemoteTextureFailure = __awtsmoosModule_67.createRemoteTextureFailure;
	const createRemoteTextureSuccess = __awtsmoosModule_67.createRemoteTextureSuccess;
	const waitForRemoteTextureCaller = __awtsmoosModule_71.waitForRemoteTextureCaller;
	const loadRemoteTextureImageElement = __awtsmoosModule_72.loadRemoteTextureImageElement;
	const createRemoteTexturePolicy = __awtsmoosModule_68.createRemoteTexturePolicy;

	/**
	 * Owns reusable browser images and in-flight promises while delegating actual image loading to a Yesod adapter.
	 */
	class RemoteTextureImageCache {
		/**
		 * Creates an isolated cache vessel with no module-global mutable state.
		 * @param {object} [options={}] Optional dependencies for browser runtime or deterministic tests.
		 * @param {Function} [options.loader] Async loader receiving one canonical remote texture policy.
		 */
		constructor(options = {}) {
			this.netzachDecoded = new Map();
			this.netzachInflight = new Map();
			this.yesodLoader = options.loader ?? loadRemoteTextureImageElement;
		}

		/**
		 * Resolves one texture with decoded reuse, in-flight deduplication, and caller-local cancellation.
		 * @param {string} url HTTPS texture URL.
		 * @param {object} [options={}] Policy hints plus optional AbortSignal.
		 * @returns {Promise<object>} Immutable success, failure, or caller-specific aborted record.
		 */
		load(url, options = {}) {
			const gevurahPolicy = createRemoteTexturePolicy(url, options);
			const malchusImage = this.netzachDecoded.get(gevurahPolicy.cacheKey);
			if (malchusImage) {
				return Promise.resolve(createRemoteTextureSuccess(gevurahPolicy, malchusImage, {
					fromCache: true
				}));
			}

			const yesodShared = this.netzachInflight.get(gevurahPolicy.cacheKey)
				?? this.beginSharedLoad(gevurahPolicy);
			return waitForRemoteTextureCaller(yesodShared, gevurahPolicy, options.signal);
		}

		/**
		 * Returns a decoded image without starting remote work.
		 * @param {string} url HTTPS texture URL.
		 * @param {object} [options={}] Policy hints used to reconstruct the same cache identity.
		 * @returns {object|null} Cached browser image or null.
		 */
		cached(url, options = {}) {
			const gevurahPolicy = createRemoteTexturePolicy(url, options);
			return this.netzachDecoded.get(gevurahPolicy.cacheKey) ?? null;
		}

		/**
		 * Reports bounded cache diagnostics without leaking mutable Maps.
		 * @returns {object} Frozen decoded/loading counters.
		 */
		stats() {
			return Object.freeze({
				decoded: this.netzachDecoded.size,
				loading: this.netzachInflight.size
			});
		}

		/**
		 * Clears decoded state while allowing already-started shared work to settle normally.
		 * @returns {RemoteTextureImageCache} This cache vessel.
		 */
		clear() {
			this.netzachDecoded.clear();
			return this;
		}

		/**
		 * Starts one shared load and records a successfully decoded image under canonical cache identity.
		 * @param {object} policy Canonical remote texture policy.
		 * @returns {Promise<object>} Shared immutable load-record promise.
		 */
		beginSharedLoad(policy) {
			const yesodPromise = Promise.resolve()
				.then(() => this.yesodLoader(policy))
				.catch((error) => createRemoteTextureFailure(policy, error))
				.then((record) => {
					if (record.ok && record.image) {
						this.netzachDecoded.set(policy.cacheKey, record.image);
					}

					return record;
				})
				.finally(() => this.netzachInflight.delete(policy.cacheKey));

			this.netzachInflight.set(policy.cacheKey, yesodPromise);
			return yesodPromise;
		}
	}

	__exports.RemoteTextureImageCache = RemoteTextureImageCache;

}

// ---- libs/awtsmoos-procedural-core/src/core/materials/RemoteTextureImageCache.js ----
{
	const __exports = __awtsmoosModule_65;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file RemoteTextureImageCache.js
	 * @description Preserves the historic remote texture cache doorway while delegating state ownership to a focused class.
	 * The Awtsmoos, Atzmus beyond doorway and chamber, renews both the public name and every hidden vessel it reaches;
	 * Awtsmoos.com keeps legacy callers stable here while advanced callers may receive their own isolated cache without tangled breaches.
	 */

	const RemoteTextureImageCache = __awtsmoosModule_66.RemoteTextureImageCache;

	__exports.RemoteTextureImageCache = RemoteTextureImageCache;

	const YESOD_DEFAULT_REMOTE_TEXTURE_CACHE = new RemoteTextureImageCache();

	/**
	 * Loads one HTTPS texture through the shared default cache while preserving the long-standing public function contract.
	 * @param {string} url HTTPS texture URL.
	 * @param {object} [options={}] Provider, role, quality, timeout, cache identity, and optional AbortSignal hints.
	 * @returns {Promise<object>} Immutable success, failure, or caller-local aborted load record.
	 */
	function loadRemoteTextureImage(url, options = {}) {
		return YESOD_DEFAULT_REMOTE_TEXTURE_CACHE.load(url, options);
	}


	__exports.loadRemoteTextureImage = loadRemoteTextureImage;
	/**
	 * Returns a decoded image already held by the shared default cache without starting remote work.
	 * @param {string} url HTTPS texture URL whose default policy identity should be checked.
	 * @returns {object|null} Cached browser image or null when the texture has not decoded yet.
	 */
	function cachedRemoteTextureImage(url) {
		return YESOD_DEFAULT_REMOTE_TEXTURE_CACHE.cached(url);
	}


	__exports.cachedRemoteTextureImage = cachedRemoteTextureImage;
	/**
	 * Reports the default cache's bounded counters without exposing mutable cache Maps.
	 * @returns {object} Frozen object containing decoded and loading counts.
	 */
	function remoteTextureImageCacheStats() {
		return YESOD_DEFAULT_REMOTE_TEXTURE_CACHE.stats();
	}

	__exports.remoteTextureImageCacheStats = remoteTextureImageCacheStats;

}

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/CinematicTerrainLayerSpecs.js ----
{
	const __exports = __awtsmoosModule_73;
	//B"H
	//Boruch Hashem
	//Blessed be He
	/**
	 * @file CinematicTerrainLayerSpecs.js
	 * @description Declares six semantic ecological material roles with real Awtsmoos Drive fallback sources.
	 * The Awtsmoos renews earth beyond every label; Awtsmoos.com keeps material intent explicit so semantic
	 * discovery may improve remote selection without changing terrain shader structure or fabricating pixels.
	 */

	const CINEMATIC_TERRAIN_LAYER_SPECS = Object.freeze([
		layer({
			height: [-1000, 150],
			path: 'awtsmoos-nature/chai-forest/textures/ground/grass.jpg',
			query: 'grass',
			role: 'meadow',
			slope: [0, 0.62],
			wetness: 0,
			zones: [1, 0, 0.08, 0.04]
		}),
		layer({
			height: [-1000, 1000],
			path: 'full-resolution/a-well-traveled-compacted-earth-path-in-a-rustic-alpine-village.png',
			query: 'compacted earth path',
			role: 'earth-road',
			slope: [0, 0.8],
			wetness: 0,
			zones: [0.14, 1, 0.08, 0.04]
		}),
		layer({
			height: [-1000, 30],
			path: 'full-resolution/a-shallow-alpine-riverbed-covered-in-naturally-rounded-water-polished-stones.png',
			query: 'riverbed stones',
			role: 'wet-bank',
			slope: [0, 0.8],
			wetness: 1,
			zones: [0.06, 0.08, 1, 0.08]
		}),
		layer({
			height: [-1000, 10000],
			path: 'full-resolution/a-rustic-alpine-cottage-wall-built-from-rough-cut-local-fieldstone.png',
			query: 'mountain rock',
			role: 'mountain-rock',
			slope: [0.34, 1],
			wetness: 0,
			zones: [0.04, 0.02, 0.04, 1]
		}),
		layer({
			height: [-1000, 10000],
			path: 'full-resolution/angular-mountain-gravel.png',
			query: 'mountain gravel',
			role: 'gravel',
			slope: [0.1, 1],
			wetness: 0,
			zones: [0.1, 0.38, 0.1, 0.72]
		}),
		layer({
			height: [35, 10000],
			path: 'full-resolution/compacted-high-altitude-alpine-snow.png',
			query: 'alpine snow',
			role: 'snow',
			slope: [0, 1],
			wetness: 0,
			zones: [0.04, 0, 0.08, 0.84]
		})
	]);


	__exports.CINEMATIC_TERRAIN_LAYER_SPECS = CINEMATIC_TERRAIN_LAYER_SPECS;
	function layer(values) {
		return Object.freeze({
			...values,
			height: Object.freeze(values.height),
			slope: Object.freeze(values.slope),
			zones: Object.freeze(values.zones)
		});
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/CinematicTerrainTextureLayers.js ----
{
	const __exports = __awtsmoosModule_49;
	//B"H
	//Boruch Hashem
	//Blessed be He
	/**
	 * @file CinematicTerrainTextureLayers.js
	 * @description Resolves six ecological terrain garments from real remote Awtsmoos Drive imagery.
	 * The Awtsmoos renews all earth beyond photograph; Awtsmoos.com nevertheless prefers actual
	 * remote material captures and never manufactures a substitute texture unless an API explicitly allows it.
	 */
	const createAwtsmoosDriveTextureService = __awtsmoosModule_50.createAwtsmoosDriveTextureService;
	const awtsmoosDriveTexturePathUrl = __awtsmoosModule_52.awtsmoosDriveTexturePathUrl;
	const loadRemoteTextureImage = __awtsmoosModule_65.loadRemoteTextureImage;
	const CINEMATIC_TERRAIN_LAYER_SPECS = __awtsmoosModule_73.CINEMATIC_TERRAIN_LAYER_SPECS;

	/** Creates layer vessels plus a promise that settles even when the network is unavailable. */
	function createCinematicTerrainTextureLayers(options = {}) {
		const seed = Number(options.seed || 613);
		const service = options.textureService
			|| createAwtsmoosDriveTextureService(options.textureServiceOptions);
		const loader = options.textureLoader || loadRemoteTextureImage;
		const layers = CINEMATIC_TERRAIN_LAYER_SPECS.map(createLayer);
		const ready = Promise.all(layers.map((layer, index) => hydrateLayer(
			layer,
			CINEMATIC_TERRAIN_LAYER_SPECS[index],
			service,
			loader,
			seed + index
		)));
		return { layers, ready };
	}


	__exports.createCinematicTerrainTextureLayers = createCinematicTerrainTextureLayers;
	function createLayer(item, index) {
		return {
			angle: (index % 3) * 0.37,
			height: [...item.height],
			image: null,
			repeat: [5 + index, 5 + index],
			role: item.role,
			slope: [...item.slope],
			strength: 1,
			texturePolicy: {
				generatedTextureAllowed: false,
				remoteOnly: true,
				semanticRole: `terrain.${item.role}`
			},
			textureUrl: awtsmoosDriveTexturePathUrl(item.path),
			wetness: item.wetness,
			zones: [...item.zones]
		};
	}

	async function hydrateLayer(layer, item, service, loader, seed) {
		const candidates = await service.searchTextures(item.query, { limit: 8 }).catch(() => []);
		const candidate = candidates.length ? candidates[Math.abs(seed) % candidates.length] : null;
		if (candidate?.path) layer.textureUrl = awtsmoosDriveTexturePathUrl(candidate.path);
		const record = await Promise.resolve(loader(layer.textureUrl, {
			provider: 'awtsmoos-drive',
			quality: 'full',
			role: layer.role
		})).catch(() => null);
		if (record?.ok && record.image) layer.image = record.image;
		return layer;
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/NativeWorldMaterial.js ----
{
	const __exports = __awtsmoosModule_75;
	//B"H
	//Boruch Hashem
	//Blessed be He

	/**
	 * @file NativeWorldMaterial.js
	 * @description Owns reusable native standard-material construction for remote-first physical world surfaces.
	 * Products may resolve semantic roles and trusted images, but renderer-facing material creation,
	 * physical defaults, layered metadata, and the prohibition on generated replacement imagery belong to Core.
	 */
	const MeshStandardMaterial = __awtsmoosModule_27.MeshStandardMaterial;

	/**
	 * Create one native world material from already-resolved semantic surface evidence.
	 * Callers retain domain-specific selection and trust decisions; this function owns only reusable
	 * renderer materialization and never downloads, paints, synthesizes, or silently substitutes imagery.
	 * @param {object} options Physical factors, remote image references, layer metadata, and texture policy.
	 * @returns {MeshStandardMaterial} Core-owned native material compatible with the shared renderer.
	 */
	function createNativeWorldMaterial(options = {}) {
		const color = normalizeColor(options.color, options.opacity);
		const mapImage = options.mapImage || null;
		const material = new MeshStandardMaterial({
			alphaCutoff: options.alphaCutoff ?? 0.5,
			alphaMode: options.alphaMode || (options.transparent ? 'BLEND' : 'OPAQUE'),
			color,
			doubleSided: Boolean(options.doubleSided),
			name: options.name || 'Awtsmoos Core World Material',
			opacity: options.opacity ?? color[3],
			transparent: Boolean(options.transparent)
		});
		Object.assign(material, surfaceFields(options, mapImage));
		Object.assign(material, layeredFields(options));
		return material;
	}


	__exports.createNativeWorldMaterial = createNativeWorldMaterial;
	/** Preserve renderer-facing physical fields without giving products constructor authority. */
	function surfaceFields(options, mapImage) {
		return {
			alphaToCoverage: options.alphaToCoverage,
			anisotropy: options.anisotropy ?? 3,
			backfaceCull: options.backfaceCull,
			depthWrite: options.depthWrite,
			emissiveStrength: options.emissiveStrength ?? 1.8,
			environmentIntensity: options.environmentIntensity,
			mapImage,
			mapImageFallback: options.mapImageFallback,
			mapRepeat: options.mapRepeat || [1, 1],
			metallicFactor: options.metalness ?? options.metallicFactor ?? 0,
			mixImage: options.mixImage || null,
			mixPatchScale: options.mixPatchScale ?? 0,
			mixPatchSharpness: options.mixPatchSharpness ?? 0.58,
			mixRepeat: options.mixRepeat || options.mapRepeat || [1, 1],
			mixStrength: options.mixStrength ?? 0,
			mixTextureUrl: options.mixTextureUrl || null,
			normalTextureUrl: options.normalTextureUrl || null,
			preferredRole: options.preferredRole || null,
			roughnessFactor: options.roughness ?? options.roughnessFactor ?? 0.72,
			texturePolicy: createTexturePolicy(options, mapImage),
			textureUrl: options.textureUrl || null,
			userData: options.userData
		};
	}

	/** Copy logical layers so mutable renderer hydration never mutates semantic source recipes. */
	function layeredFields(options) {
		if (!Array.isArray(options.textureLayers) || !options.textureLayers.length) return {};
		const layers = options.liveTextureLayers === true
			? options.textureLayers
			: options.textureLayers.map(layer => ({ ...layer }));
		return {
			materialStack: options.materialStack || null,
			textureLayers: layers
		};
	}
	/** Stamp the non-generated-image covenant while retaining caller-authored semantic metadata. */
	function createTexturePolicy(options, mapImage) {
		return {
			...(options.texturePolicy || {}),
			generatedTextureAllowed: false,
			realMapImage: Boolean(mapImage),
			remoteOnly: options.remoteOnly !== false,
			semanticRole: options.semanticRole || options.texturePolicy?.semanticRole || null
		};
	}

	/** Normalize CSS-style hex or numeric RGBA into the native material's explicit four-channel color. */
	function normalizeColor(value = [1, 1, 1, 1], opacity) {
		if (Array.isArray(value)) {
			return [
				Number(value[0] ?? 1),
				Number(value[1] ?? 1),
				Number(value[2] ?? 1),
				Number(opacity ?? value[3] ?? 1)
			];
		}
		const hex = String(value).replace('#', '');
		if (!/^[0-9a-f]{6}$/i.test(hex)) return [1, 1, 1, Number(opacity ?? 1)];
		return [0, 2, 4]
			.map(index => parseInt(hex.slice(index, index + 2), 16) / 255)
			.concat(Number(opacity ?? 1));
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/LayeredTerrainMaterial.js ----
{
	const __exports = __awtsmoosModule_74;
	//B"H
	//Boruch Hashem
	//Blessed be He

	/**
	 * @file LayeredTerrainMaterial.js
	 * @description Owns renderer-facing layered terrain material construction for every Core client.
	 * Products may describe ecological layers, trusted remote images, and semantic mixing vectors, but this Core vessel
	 * creates the native material and keeps terrain shader metadata consistent without manufacturing replacement imagery.
	 */
	const createNativeWorldMaterial = __awtsmoosModule_75.createNativeWorldMaterial;

	/**
	 * Create one Core-owned layered terrain material from renderer-neutral ecological evidence.
	 * @param {object} options Layer sources, physical values, texture policy, and three terrain mixing vectors.
	 * @returns {object} Native shared-renderer terrain material.
	 */
	function createLayeredTerrainMaterial(options = {}) {
		const material = createNativeWorldMaterial({
			anisotropy: options.anisotropy,
			color: options.color || [1, 1, 1, 1],
			mapImage: options.mapImage,
			liveTextureLayers: options.liveTextureLayers === true,
			mapRepeat: options.mapRepeat,
			materialStack: options.materialStack,
			metalness: options.metalness ?? 0,
			mixImage: options.mixImage,
			mixPatchScale: options.mixPatchScale,
			mixPatchSharpness: options.mixPatchSharpness,
			mixRepeat: options.mixRepeat,
			mixStrength: options.mixStrength,
			mixTextureUrl: options.mixTextureUrl,
			name: options.name || 'Awtsmoos Core Layered Terrain',		opacity: options.opacity ?? 1,
			remoteOnly: options.remoteOnly !== false,
			roughness: options.roughness ?? 0.9,
			semanticRole: options.semanticRole || 'terrain.layered',
			textureLayers: options.textureLayers,
			texturePolicy: options.texturePolicy,
			textureUrl: options.textureUrl,
			transparent: Boolean(options.transparent)
		});
		Object.assign(material, {
			terrainMixingA: vector4(options.terrainMixingA, [0.0075, 1.67, 0.015, 0.4]),
			terrainMixingB: vector4(options.terrainMixingB, [90, 240, 4, 0.14]),
			terrainMixingC: vector4(options.terrainMixingC, [0.18, 0.52, 0.72, 0.3])
		});
		return material;
	}


	__exports.createLayeredTerrainMaterial = createLayeredTerrainMaterial;
	/** Copy four-channel renderer vectors so mutable material state cannot mutate source presets. */
	function vector4(value, fallback) {
		const source = Array.isArray(value) && value.length >= 4 ? value : fallback;
		return source.slice(0, 4).map(Number);
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/CinematicTerrainMaterial.js ----
{
	const __exports = __awtsmoosModule_48;
	//B"H
	//Boruch Hashem
	//Blessed be He

	/**
	 * @file CinematicTerrainMaterial.js
	 * @description Binds Core's six remote ecological texture layers through the shared layered-terrain material authority.
	 * The cinematic preset chooses remote semantic garments and readiness, while native material construction and terrain-vector
	 * ownership remain centralized so Studio, MitzvahWorld, and future products cannot grow contradictory terrain renderers.
	 */
	const createCinematicTerrainTextureLayers = __awtsmoosModule_49.createCinematicTerrainTextureLayers;
	const createLayeredTerrainMaterial = __awtsmoosModule_74.createLayeredTerrainMaterial;

	/**
	 * Create the cinematic six-layer terrain material and its asynchronous remote-image readiness promise.
	 * @param {object} options Texture discovery, seed, and hydration dependencies.
	 * @returns {{material: object, ready: Promise}} Shared native material plus bounded hydration readiness.
	 */
	function createCinematicTerrainMaterial(options = {}) {
		const textureState = createCinematicTerrainTextureLayers(options);
		const material = createLayeredTerrainMaterial({
			liveTextureLayers: true,
			name: 'Awtsmoos Core Cinematic Terrain',
			textureLayers: textureState.layers,
			texturePolicy: {
				generatedTextureAllowed: false,
				layerCount: 6,
				remoteOnly: true,
				semanticRole: 'terrain.cinematic.ecological',
				shader: 'terrain-layered-six-source-ecological'
			},
			terrainMixingA: [0.0075, 1.67, 0.015, 0.4],
			terrainMixingB: [90, 240, 4, 0.14],
			terrainMixingC: [0.18, 0.52, 0.72, 0.3]
		});
		return {
			material,
			ready: textureState.ready
		};
	}

	__exports.createCinematicTerrainMaterial = createCinematicTerrainMaterial;

}

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/CinematicTerrainMesh.js ----
{
	const __exports = __awtsmoosModule_76;
	//B"H
	//Boruch Hashem
	//Blessed be He
	/**
	 * @file CinematicTerrainMesh.js
	 * @description Makes portable terrain renderable through Core-owned ecology, geometry, material, and remote-visibility law.
	 * The Awtsmoos raises every valley before game or studio can divide ownership; Awtsmoos.com lets callers
	 * contribute semantic zone evidence while all reusable GPU matter and texture readiness remain inside Procedural Core.
	 */
	const createTerrainEcologyWeights = __awtsmoosModule_47.createTerrainEcologyWeights;
	const createCinematicTerrainMaterial = __awtsmoosModule_48.createCinematicTerrainMaterial;
	const createNativeGeometryMesh = __awtsmoosModule_46.createNativeGeometryMesh;

	/** Materializes a TerrainApi plan as a Core cinematic mesh. */
	function createCinematicTerrainMesh(terrainPlan = {}, options = {}) {
		const geometry = terrainPlan.geometry || terrainPlan.geometryPlan || {};
		return createCinematicTerrainMeshFromGeometry(
			{
				indices: geometry.indices,
				normals: geometry.normals,
				positions: geometry.positions,
				uvs: geometry.uvs
			},
			{
				...options,
				seed: options.seed ?? terrainPlan.seed
			}
		);
	}


	__exports.createCinematicTerrainMesh = createCinematicTerrainMesh;
	/** Materializes caller-supplied portable terrain geometry without giving the caller rendering authority. */
	function createCinematicTerrainMeshFromGeometry(data = {}, options = {}) {
		if (!data.positions?.length || !data.indices?.length) {
			throw new Error('Core cinematic terrain requires portable indexed geometry.');
		}
		const zoneWeights = createTerrainEcologyWeights({
			normals: data.normals,
			positions: data.positions,
			waterLevel: options.waterLevel,
			zoneWeights: options.zoneWeights
		});
		const { material, ready } = createCinematicTerrainMaterial(options);
		const mesh = createNativeGeometryMesh(
			{ ...data, zoneWeights },
			material,
			{
				family: 'cinematic-terrain',
				frustumCulled: options.frustumCulled !== false,
				name: options.name || 'Awtsmoos Core Cinematic Terrain'
			}
		);
		mesh.visible = options.remoteOnly === false;
		mesh.userData.remoteMaterialAuthority = 'awtsmoos-procedural-core';
		mesh.userData.awtsmoosReady = Promise.resolve(ready).then(() => {
			mesh.visible = true;
			return mesh;
		});
		return mesh;
	}

	__exports.createCinematicTerrainMeshFromGeometry = createCinematicTerrainMeshFromGeometry;

}

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/CinematicWaterGeometry.js ----
{
	const __exports = __awtsmoosModule_78;
	//B"H
	//Boruch Hashem
	//Blessed be He
	/**
	 * @file CinematicWaterGeometry.js
	 * @description Creates portable horizontal water-surface geometry for Core physical-water materials.
	 * The Awtsmoos spreads one current across every bounded plane; Awtsmoos.com keeps this generic geometry
	 * inside Core so games express body, level, and size without owning reusable mesh-construction code.
	 */

	/** Creates one indexed horizontal water plane centered on the origin. */
	function createCinematicWaterGeometry(size, height) {
		const halfSize = size / 2;
		return {
			indices: [0, 1, 2, 0, 2, 3],
			normals: [
				0, 1, 0,
				0, 1, 0,
				0, 1, 0,
				0, 1, 0
			],
			positions: [
				-halfSize, height, -halfSize,
				halfSize, height, -halfSize,
				halfSize, height, halfSize,
				-halfSize, height, halfSize
			],
			uvs: [
				0, 0,
				1, 0,
				1, 1,
				0, 1
			]
		};
	}

	__exports.createCinematicWaterGeometry = createCinematicWaterGeometry;

}

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/CinematicWaterProfileValues.js ----
{
	const __exports = __awtsmoosModule_80;
	//B"H
	//Boruch Hashem
	//Blessed be He
	/**
	 * @file CinematicWaterProfileValues.js
	 * @description Stores readable immutable physical values for lake, stream, and cascade water.
	 * The Awtsmoos renews every measured current beyond the finite numbers below; Awtsmoos.com keeps
	 * these values separate from normalization logic so visual tuning remains explicit, modular, and inspectable.
	 */

	const CINEMATIC_WATER_PROFILE_VALUES = Object.freeze({
		lake: Object.freeze({
			deepColor: '#174c5a',
			depthStrength: 0.62,
			edgeFoam: 0.1,
			foamNoiseScale: 0.055,
			foamThreshold: 0.95,
			fresnel: 0.54,
			goldenSunGlint: 0.92,
			macroRipple: 0.06,
			microRipple: 0.014,
			refraction: 0.14,
			shallowColor: '#79b9b2',
			skyStrength: 0.52,
			flow: freezeFlow([
				[0.018, 0.01],
				[-0.011, 0.019],
				[0.009, -0.012],
				[-0.006, -0.008]
			])
		}),
		stream: Object.freeze({
			deepColor: '#175965',
			depthStrength: 0.58,
			edgeFoam: 0.22,
			foamNoiseScale: 0.1,
			foamThreshold: 0.86,
			fresnel: 0.52,
			goldenSunGlint: 0.96,
			macroRipple: 0.09,
			microRipple: 0.021,
			refraction: 0.12,
			shallowColor: '#86c4b5',
			skyStrength: 0.46,
			flow: freezeFlow([
				[0.038, 0.01],
				[-0.021, 0.03],
				[0.026, -0.01],
				[-0.014, -0.022]
			])
		}),
		cascade: Object.freeze({
			deepColor: '#356e74',
			depthStrength: 0.4,
			edgeFoam: 0.44,
			foamNoiseScale: 0.15,
			foamThreshold: 0.82,
			fresnel: 0.42,
			goldenSunGlint: 0.82,
			macroRipple: 0.13,
			microRipple: 0.034,
			refraction: 0.08,
			shallowColor: '#c1e0d2',
			skyStrength: 0.34,
			flow: freezeFlow([
				[0.055, 0.014],
				[-0.03, 0.043],
				[0.036, -0.013],
				[-0.019, -0.033]
			])
		})
	});


	__exports.CINEMATIC_WATER_PROFILE_VALUES = CINEMATIC_WATER_PROFILE_VALUES;
	function freezeFlow(flow) {
		return Object.freeze(flow.map(vector => Object.freeze([...vector])));
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/CinematicWaterProfile.js ----
{
	const __exports = __awtsmoosModule_79;
	//B"H
	//Boruch Hashem
	//Blessed be He
	/**
	 * @file CinematicWaterProfile.js
	 * @description Converts shared visual tuning values into the renderer-neutral physical-water contract.
	 * The Awtsmoos is one current through lake, stream, and cascade; Awtsmoos.com centralizes immutable
	 * depth, foam, reflection, refraction, ripple, and flow truth so clients never duplicate water physics.
	 */
	const CINEMATIC_WATER_PROFILE_VALUES = __awtsmoosModule_80.CINEMATIC_WATER_PROFILE_VALUES;

	/** Returns the immutable physical profile for one water intent. */
	function cinematicWaterProfile(kind = 'lake') {
		return createProfile(CINEMATIC_WATER_PROFILE_VALUES[normalize(kind)]);
	}


	__exports.cinematicWaterProfile = cinematicWaterProfile;
	function createProfile(values) {
		return Object.freeze({
			depth: Object.freeze({
				deepColor: values.deepColor,
				shallowColor: values.shallowColor,
				strength: values.depthStrength
			}),
			flow: values.flow,
			foam: Object.freeze({
				edge: values.edgeFoam,
				noiseScale: values.foamNoiseScale,
				threshold: values.foamThreshold
			}),
			reflection: Object.freeze({
				fresnel: values.fresnel,
				goldenSunGlint: values.goldenSunGlint,
				skyStrength: values.skyStrength
			}),
			refraction: values.refraction,
			ripples: Object.freeze({
				macro: values.macroRipple,
				micro: values.microRipple
			})
		});
	}

	function normalize(kind) {
		if (['river', 'stream'].includes(kind)) return 'stream';
		if (['waterfall', 'foam', 'mist', 'cascade'].includes(kind)) return 'cascade';
		return 'lake';
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/CinematicWaterMesh.js ----
{
	const __exports = __awtsmoosModule_77;
	//B"H
	//Boruch Hashem
	//Blessed be He
	/**
	 * @file CinematicWaterMesh.js
	 * @description Owns shared native water geometry, physical shader policy, and real remote water imagery.
	 * The Awtsmoos renews each wave beyond texture and equation; Awtsmoos.com uses photographed water as
	 * its base garment while shader mathematics supplies motion, depth, reflection, foam, and refraction.
	 */
	const MeshStandardMaterial = __awtsmoosModule_27.MeshStandardMaterial;
	const awtsmoosDriveTexturePathUrl = __awtsmoosModule_52.awtsmoosDriveTexturePathUrl;
	const loadRemoteTextureImage = __awtsmoosModule_65.loadRemoteTextureImage;
	const createNativeGeometryMesh = __awtsmoosModule_46.createNativeGeometryMesh;
	const createCinematicWaterGeometry = __awtsmoosModule_78.createCinematicWaterGeometry;
	const cinematicWaterProfile = __awtsmoosModule_79.cinematicWaterProfile;

	const WATER_PATH = Object.freeze({
		lake: 'full-resolution/lake-water.png',
		stream: 'full-resolution/shallow river water.png',
		waterfall: 'full-resolution/seamless water brighter.png'
	});

	/** Creates one physical water surface using a real remote base image. */
	function createCinematicWaterMesh(options = {}) {
		const variant = normalizeVariant(options.variant || options.body || 'lake');
		const size = Math.max(1, Number(options.size || options.halfSize * 2 || 48));
		const height = Number(options.height ?? options.level ?? 0);
		const material = createWaterMaterial(variant);
		const textureUrl = awtsmoosDriveTexturePathUrl(WATER_PATH[variant] || WATER_PATH.lake);
		material.textureUrl = textureUrl;
		const mesh = createNativeGeometryMesh(
			createCinematicWaterGeometry(size, height),
			material,
			{
				family: `water-${variant}`,
				frustumCulled: false,
				name: `Awtsmoos Core ${variant}`
			}
		);
		mesh.userData.awtsmoosReady = hydrate(
			material,
			textureUrl,
			variant,
			options.textureLoader || loadRemoteTextureImage
		);
		return mesh;
	}


	__exports.createCinematicWaterMesh = createCinematicWaterMesh;
	function createWaterMaterial(variant) {
		const material = new MeshStandardMaterial({
			color: [1, 1, 1, 0.92],
			doubleSided: true,
			name: `Awtsmoos Core ${variant} Water`,
			opacity: 0.92,
			transparent: true
		});
		material.mapImage = null;
		material.texturePolicy = {
			generatedTextureAllowed: false,
			remoteOnly: true,
			semanticRole: `water.${variant}`,
			shader: 'water-physical-remote-albedo',
			waterPhysical: cinematicWaterProfile(variant),
			waterVariant: variant
		};
		return material;
	}
	async function hydrate(material, url, variant, loader) {
		const record = await Promise.resolve(loader(url, {
			provider: 'awtsmoos-drive',
			quality: 'full',
			role: `water.${variant}`
		})).catch(() => null);
		if (record?.ok && record.image) material.mapImage = record.image;
		return material;
	}
	function normalizeVariant(value) {
		if (['river', 'stream'].includes(value)) return 'stream';
		if (['waterfall', 'cascade', 'foam', 'mist'].includes(value)) return 'waterfall';
		return 'lake';
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/LegacyWaterFragmentShader.js ----
{
	const __exports = __awtsmoosModule_82;
	//B"H
	//Boruch Hashem
	//Blessed be He
	/**
	 * @file LegacyWaterFragmentShader.js
	 * @description Preserves the readable historic two-fetch water shader for compatibility-only API consumers.
	 * The Awtsmoos renews water beyond any finite GLSL string; Awtsmoos.com keeps this legacy receipt in Core
	 * so older tools remain compatible without allowing MitzvahWorld to own a second reusable shader implementation.
	 */

	const LEGACY_WATER_FRAGMENT_SHADER = `
	precision highp float;

	uniform sampler2D albedoMap;
	uniform float time;
	uniform vec3 cameraPosition;

	varying vec2 vUv;
	varying vec3 vNormal;
	varying vec3 vWorld;

	vec3 proceduralDetail(vec2 uv) {
		float waveA = sin(uv.x * 11.0 + time * 1.7);
		float waveB = cos(uv.y * 13.0 - time * 1.3);
		return normalize(vec3(waveA * 0.12, 1.0, waveB * 0.12));
	}

	void main() {
		vec2 primaryUv = fract(vUv + vec2(time * 0.01, 0.0));
		vec2 secondaryUv = fract(vUv * 1.7 + vec2(0.0, -time * 0.013));
		vec4 albedoA = texture2D(albedoMap, primaryUv);
		vec4 albedoB = texture2D(albedoMap, secondaryUv);
		vec3 detail = proceduralDetail(vUv);
		vec3 surfaceNormal = normalize(vNormal + detail * 0.16);
		vec3 viewDirection = normalize(cameraPosition - vWorld);
		float facing = max(dot(viewDirection, surfaceNormal), 0.0);
		float fresnel = pow(1.0 - facing, 3.0);
		float crest = max(0.0, 1.0 - detail.y);
		float foam = crest * crest;
		vec3 water = mix(albedoA.rgb, albedoB.rgb, 0.35);
		water = mix(water, vec3(0.35, 0.55, 0.72), fresnel * 0.45);
		gl_FragColor = vec4(water + foam * 0.12, 0.9);
	}
	`;

	__exports.LEGACY_WATER_FRAGMENT_SHADER = LEGACY_WATER_FRAGMENT_SHADER;

}

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/WaterShaderRecipe.js ----
{
	const __exports = __awtsmoosModule_81;
	//B"H
	//Boruch Hashem
	//Blessed be He
	/**
	 * @file WaterShaderRecipe.js
	 * @description Owns reusable physical-water policy and the compatibility two-fetch shader receipt inside Core.
	 * The Awtsmoos renews moving water beyond every game-specific vessel; Awtsmoos.com centralizes bounded
	 * reflection, refraction, foam, procedural normals, and remote albedo semantics for every consumer.
	 */
	const cinematicWaterProfile = __awtsmoosModule_79.cinematicWaterProfile;
	const LEGACY_WATER_FRAGMENT_SHADER = __awtsmoosModule_82.LEGACY_WATER_FRAGMENT_SHADER;

	/** Creates one immutable physical-water recipe with bounded caller overrides. */
	function waterShaderRecipe(kind = 'lake', options = {}) {
		const base = cinematicWaterProfile(kind);
		return Object.freeze({
			depth: Object.freeze({
				deepColor: options.deepColor || base.depth.deepColor,
				shallowColor: options.shallowColor || base.depth.shallowColor,
				strength: bounded(options.depthStrength, base.depth.strength)
			}),
			flow: base.flow,
			foam: Object.freeze({
				edge: bounded(options.edgeFoam, base.foam.edge),
				noiseScale: positive(options.foamNoiseScale, base.foam.noiseScale),
				threshold: bounded(options.foamThreshold, base.foam.threshold)
			}),
			kind: normalizeKind(kind),
			reflection: Object.freeze({
				fresnel: bounded(options.fresnel, base.reflection.fresnel),
				goldenSunGlint: positive(options.goldenSunGlint, base.reflection.goldenSunGlint),
				skyStrength: bounded(options.skyStrength, base.reflection.skyStrength)
			}),
			refraction: bounded(options.refraction, base.refraction),
			ripples: Object.freeze({
				macro: positive(options.macroRipple, base.ripples.macro),
				micro: positive(options.microRipple, base.ripples.micro)
			}),
			shader: 'core-remote-albedo-physical-water'
		});
	}


	__exports.waterShaderRecipe = waterShaderRecipe;
	/** Preserves the historic two-fetch shader receipt without giving a client shader ownership. */
	function createWaterShaderRecipe() {
		return Object.freeze({
			channelPolicy: Object.freeze({
				albedo: 'public-firebase-canonical-color-source',
				foam: 'procedural-wave-crest-mask',
				fresnel: 'view-normal-grazing-angle',
				normal: 'procedural-wave-gradient'
			}),
			fragmentShader: LEGACY_WATER_FRAGMENT_SHADER
		});
	}


	__exports.createWaterShaderRecipe = createWaterShaderRecipe;
	function normalizeKind(kind) {
		if (['river', 'stream'].includes(kind)) return 'stream';
		if (['waterfall', 'foam', 'mist', 'cascade'].includes(kind)) return 'cascade';
		return 'lake';
	}
	function bounded(value, fallback) {
		const number = Number(value);
		return Math.max(0, Math.min(1, Number.isFinite(number) ? number : fallback));
	}
	function positive(value, fallback) {
		const number = Number(value);
		return Math.max(0, Number.isFinite(number) ? number : fallback);
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/reality/RealitySeed.js ----
{
	const __exports = __awtsmoosModule_89;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file RealitySeed.js
	 * @description Normalizes any caller seed into deterministic derived streams for natural variation without hidden global randomness.
	 * The Awtsmoos, Atzmus beyond number and sequence, renews every apparent chance before it can unfold;
	 * Awtsmoos.com lets each finite seed become a transparent keli, so rock, flower, branch, blade, and creature may vary yet repeat with truth.
	 */

	const UINT32_MAX_PLUS_ONE = 4294967296;

	/**
	 * Converts a number, string, or serializable value into one stable unsigned 32-bit seed.
	 * This is the Gevurah boundary for all Reality generation: the same semantic seed always returns the same numeric vessel.
	 * @param {unknown} seedOhr Caller-provided identity, label, number, or serializable value.
	 * @returns {number} Stable unsigned 32-bit seed suitable for deterministic streams.
	 */
	function normalizeRealitySeed(seedOhr = 613) {
		if (Number.isFinite(Number(seedOhr))) {
			return Number(seedOhr) >>> 0;
		}
		const textKli = typeof seedOhr === 'string'
			? seedOhr
			: JSON.stringify(seedOhr ?? 613);
		let hashYesod = 2166136261;
		for (let indexNetzach = 0; indexNetzach < textKli.length; indexNetzach += 1) {
			hashYesod ^= textKli.charCodeAt(indexNetzach);
			hashYesod = Math.imul(hashYesod, 16777619);
		}
		return hashYesod >>> 0;
	}


	__exports.normalizeRealitySeed = normalizeRealitySeed;
	/**
	 * Derives an independent deterministic seed for one named sub-domain without mutating the parent stream.
	 * @param {unknown} seedOhr Parent Reality seed.
	 * @param {string} domainBinah Stable semantic domain such as `rock-fracture` or `flower-position`.
	 * @param {number|string} [indexNetzach=0] Optional child identity inside the domain.
	 * @returns {number} Stable unsigned child seed.
	 */
	function deriveRealitySeed(seedOhr, domainBinah, indexNetzach = 0) {
		return normalizeRealitySeed(`${normalizeRealitySeed(seedOhr)}:${domainBinah}:${indexNetzach}`);
	}


	__exports.deriveRealitySeed = deriveRealitySeed;
	/**
	 * Creates a tiny deterministic random stream whose state belongs only to the returned closure.
	 * @param {unknown} seedOhr Seed normalized before stream creation.
	 * @returns {() => number} Function returning repeatable values in the half-open interval [0, 1).
	 */
	function createRealityRandom(seedOhr) {
		let stateYesod = normalizeRealitySeed(seedOhr) || 0x6d2b79f5;
		return () => {
			stateYesod += 0x6d2b79f5;
			let mixedTiferes = stateYesod;
			mixedTiferes = Math.imul(mixedTiferes ^ mixedTiferes >>> 15, mixedTiferes | 1);
			mixedTiferes ^= mixedTiferes + Math.imul(mixedTiferes ^ mixedTiferes >>> 7, mixedTiferes | 61);
			return ((mixedTiferes ^ mixedTiferes >>> 14) >>> 0) / UINT32_MAX_PLUS_ONE;
		};
	}

	__exports.createRealityRandom = createRealityRandom;

}

// ---- libs/awtsmoos-procedural-core/src/core/terrain/TerrainNoiseField.js ----
{
	const __exports = __awtsmoosModule_88;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file TerrainNoiseField.js
	 * @description Samples deterministic world-space value noise and fractal/ridged variants without chunk-local randomness, preserving seamless borders.
	 * The Awtsmoos renews every coordinate before mountain or valley can rise; Awtsmoos.com lets Chochmah whisper the same seeded value at one world point,
	 * so adjacent terrain chunks meet without seams while octaves weave continental form from a bounded mathematical joint.
	 */

	const normalizeRealitySeed = __awtsmoosModule_89.normalizeRealitySeed;

	/** Deterministic two-dimensional world-space terrain noise sampler. */
	class TerrainNoiseField {
		/**
		 * @param {object} [optionsChesed={}] Seed, frequency, octaves, lacunarity, persistence, and ridge weight.
		 */
		constructor(optionsChesed = {}) {
			this.seed = normalizeRealitySeed(optionsChesed.seed ?? 613);
			this.frequency = positive(optionsChesed.frequency, 0.018);
			this.octaves = boundedInteger(optionsChesed.octaves, 5, 1, 9);
			this.lacunarity = positive(optionsChesed.lacunarity, 2);
			this.persistence = unit(optionsChesed.persistence, 0.5);
			this.ridgeWeight = unit(optionsChesed.ridgeWeight, 0.28);
		}

		/**
		 * Samples blended fractal and ridged noise at one world-space X/Z position.
		 * @param {number} xOhr World X coordinate.
		 * @param {number} zOhr World Z coordinate.
		 * @returns {number} Approximately normalized terrain signal in [-1,1].
		 */
		sample(xOhr, zOhr) {
			let amplitudeChesed = 1;
			let frequencyGevurah = this.frequency;
			let accumulatedOhr = 0;
			let normalizationYesod = 0;
			for (let octaveNetzach = 0; octaveNetzach < this.octaves; octaveNetzach += 1) {
				const valueOhr = valueNoise(
					xOhr * frequencyGevurah,
					zOhr * frequencyGevurah,
					this.seed + octaveNetzach * 1013
				);
				const ridgeOhr = 1 - Math.abs(valueOhr);
				const blendedTiferes = valueOhr * (1 - this.ridgeWeight) + (ridgeOhr * 2 - 1) * this.ridgeWeight;
				accumulatedOhr += blendedTiferes * amplitudeChesed;
				normalizationYesod += amplitudeChesed;
				amplitudeChesed *= this.persistence;
				frequencyGevurah *= this.lacunarity;
			}
			return normalizationYesod > 0 ? accumulatedOhr / normalizationYesod : 0;
		}
	}


	__exports.TerrainNoiseField = TerrainNoiseField;
	/** @returns {number} Smooth interpolated lattice value noise in [-1,1]. */
	function valueNoise(xOhr, zOhr, seedYesod) {
		const x0Hod = Math.floor(xOhr);
		const z0Hod = Math.floor(zOhr);
		const txTiferes = smooth(xOhr - x0Hod);
		const tzTiferes = smooth(zOhr - z0Hod);
		const aOhr = lerp(hashValue(x0Hod, z0Hod, seedYesod), hashValue(x0Hod + 1, z0Hod, seedYesod), txTiferes);
		const bOhr = lerp(hashValue(x0Hod, z0Hod + 1, seedYesod), hashValue(x0Hod + 1, z0Hod + 1, seedYesod), txTiferes);
		return lerp(aOhr, bOhr, tzTiferes);
	}

	/** @returns {number} Deterministic lattice pseudo-random scalar in [-1,1]. */
	function hashValue(xHod, zHod, seedYesod) {
		let hashYesod = Math.imul(xHod ^ seedYesod, 0x45d9f3b);
		hashYesod = Math.imul(hashYesod ^ zHod, 0x45d9f3b);
		hashYesod ^= hashYesod >>> 16;
		return ((hashYesod >>> 0) / 0xffffffff) * 2 - 1;
	}

	/** @returns {number} Quintic-like cubic smoothing for lattice interpolation. */
	function smooth(valueOhr) {
		return valueOhr * valueOhr * (3 - 2 * valueOhr);
	}

	/** @returns {number} Linear interpolation. */
	function lerp(firstOhr, secondOhr, amountTiferes) {
		return firstOhr + (secondOhr - firstOhr) * amountTiferes;
	}

	/** @returns {number} Positive finite scalar or fallback. */
	function positive(valueOhr, fallbackOhr) {
		const numberOhr = Number(valueOhr);
		return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackOhr;
	}

	/** @returns {number} Unit interval scalar. */
	function unit(valueOhr, fallbackOhr) {
		const numberOhr = Number(valueOhr);
		return Math.min(1, Math.max(0, Number.isFinite(numberOhr) ? numberOhr : fallbackOhr));
	}

	/** @returns {number} Integer constrained to inclusive bounds. */
	function boundedInteger(valueOhr, fallbackOhr, minimumGevurah, maximumChesed) {
		const numberOhr = Number(valueOhr);
		return Math.round(Math.min(maximumChesed, Math.max(minimumGevurah, Number.isFinite(numberOhr) ? numberOhr : fallbackOhr)));
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/terrain/TerrainDomainWarp.js ----
{
	const __exports = __awtsmoosModule_87;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file TerrainDomainWarp.js
	 * @description Bends world-space sampling coordinates through low-frequency deterministic fields before higher-detail terrain noise is evaluated.
	 * The Awtsmoos renews direction before ridge and basin seem fixed; Awtsmoos.com lets Chochmah bend the sampling path without tearing the world grid,
	 * so mountains gather into sweeping ranges and valleys meander with broad geological rhythm instead of repeating like tiled arithmetic.
	 */

	const TerrainNoiseField = __awtsmoosModule_88.TerrainNoiseField;

	/** Deterministic two-axis domain-warp sampler composed from independent low-frequency terrain fields. */
	class TerrainDomainWarp {
		/**
		 * @param {object} [optionsChesed={}] Seed, frequency, amplitude, and octave controls.
		 */
		constructor(optionsChesed = {}) {
			this.amplitude = nonnegative(optionsChesed.amplitude, 18);
			this.firstYesod = new TerrainNoiseField({
				frequency: positive(optionsChesed.frequency, 0.004),
				octaves: optionsChesed.octaves ?? 3,
				ridgeWeight: 0,
				seed: optionsChesed.seed ?? 613
			});
			this.secondYesod = new TerrainNoiseField({
				frequency: positive(optionsChesed.frequency, 0.004) * 1.13,
				octaves: optionsChesed.octaves ?? 3,
				ridgeWeight: 0,
				seed: Number(optionsChesed.seed ?? 613) + 7919
			});
		}

		/**
		 * Warps one world-space X/Z coordinate while preserving deterministic chunk-independent sampling.
		 * @param {number} xOhr World X coordinate.
		 * @param {number} zOhr World Z coordinate.
		 * @returns {Readonly<object>} Frozen warped coordinates and offset diagnostics.
		 */
		warp(xOhr, zOhr) {
			const offsetXChesed = this.firstYesod.sample(xOhr, zOhr) * this.amplitude;
			const offsetZGevurah = this.secondYesod.sample(xOhr + 137.2, zOhr - 91.7) * this.amplitude;
			return Object.freeze({
				offsetX: offsetXChesed,
				offsetZ: offsetZGevurah,
				x: xOhr + offsetXChesed,
				z: zOhr + offsetZGevurah
			});
		}
	}


	__exports.TerrainDomainWarp = TerrainDomainWarp;
	/** @returns {number} Positive finite scalar or fallback. */
	function positive(valueOhr, fallbackOhr) {
		const numberOhr = Number(valueOhr);
		return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackOhr;
	}

	/** @returns {number} Nonnegative finite scalar or fallback. */
	function nonnegative(valueOhr, fallbackOhr) {
		const numberOhr = Number(valueOhr);
		return Number.isFinite(numberOhr) && numberOhr >= 0 ? numberOhr : fallbackOhr;
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/terrain/TerrainBaseField.js ----
{
	const __exports = __awtsmoosModule_86;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file TerrainBaseField.js
	 * @description Composes warped fractal terrain with explicit continental, island, mesa, basin, and mountain shaping before erosion begins.
	 * The Awtsmoos renews continent and canyon before rain can carve their face; Awtsmoos.com lets Tiferes combine broad form with seeded detail,
	 * so the first landscape already carries geological intention instead of asking erosion to rescue an undifferentiated noise-filled place.
	 */

	const TerrainDomainWarp = __awtsmoosModule_87.TerrainDomainWarp;
	const TerrainNoiseField = __awtsmoosModule_88.TerrainNoiseField;

	/** Renderer-neutral deterministic base-height authority for world-space terrain sampling. */
	class TerrainBaseField {
		/**
		 * @param {object} [optionsChesed={}] Seed, height scale, sea level, landform profile, noise, and warp options.
		 */
		constructor(optionsChesed = {}) {
			this.heightScale = positive(optionsChesed.heightScale, 42);
			this.seaLevel = finite(optionsChesed.seaLevel, 0);
			this.profile = String(optionsChesed.profile || 'continental');
			this.noiseYesod = new TerrainNoiseField({
				...(optionsChesed.noise || {}),
				octaves: optionsChesed.octaves ?? optionsChesed.noise?.octaves,
				seed: optionsChesed.seed ?? optionsChesed.noise?.seed
			});
			this.warpYesod = new TerrainDomainWarp({
				...(optionsChesed.warp || {}),
				seed: optionsChesed.seed ?? optionsChesed.warp?.seed
			});
			this.center = vector2(optionsChesed.center, [0, 0]);
			this.extent = positive(optionsChesed.extent, 180);
		}

		/**
		 * Samples one raw world-space terrain elevation before erosion and local surface analysis.
		 * @param {number} xOhr World X coordinate.
		 * @param {number} zOhr World Z coordinate.
		 * @returns {number} Elevation in world units.
		 */
		sample(xOhr, zOhr) {
			const warpedBinah = this.warpYesod.warp(xOhr, zOhr);
			const noiseOhr = this.noiseYesod.sample(warpedBinah.x, warpedBinah.z);
			const shapeTiferes = profileShape(
				this.profile,
				xOhr,
				zOhr,
				this.center,
				this.extent,
				noiseOhr
			);
			return this.seaLevel + shapeTiferes * this.heightScale;
		}
	}


	__exports.TerrainBaseField = TerrainBaseField;
	/** @returns {number} Profile-specific normalized landform signal. */
	function profileShape(profileHod, xOhr, zOhr, centerOhr, extentGevurah, noiseOhr) {
		const distanceTiferes = Math.hypot(xOhr - centerOhr[0], zOhr - centerOhr[1]);
		const radialGevurah = Math.min(1, distanceTiferes / extentGevurah);
		if (profileHod === 'island') {
			return noiseOhr * 0.72 + (1 - radialGevurah * radialGevurah) * 0.78 - 0.48;
		}
		if (profileHod === 'mountain') {
			return signedPower(noiseOhr, 0.72) * 1.18 + Math.max(0, noiseOhr) ** 2 * 0.62;
		}
		if (profileHod === 'mesa') {
			const terracedOhr = Math.round(noiseOhr * 5) / 5;
			return noiseOhr * 0.35 + terracedOhr * 0.65;
		}
		if (profileHod === 'basin') {
			return noiseOhr * 0.55 - (1 - radialGevurah) * 0.65;
		}
		return noiseOhr * 0.82 + Math.max(0, 1 - radialGevurah) * 0.18;
	}

	/** @returns {number} Sign-preserving power for sharper mountain relief without biasing negative valleys. */
	function signedPower(valueOhr, exponentTiferes) {
		return Math.sign(valueOhr) * Math.abs(valueOhr) ** exponentTiferes;
	}

	/** @returns {Readonly<Array<number>>} Frozen finite X/Z vector. */
	function vector2(candidateOhr, fallbackOhr) {
		return Object.freeze(Array.isArray(candidateOhr) && candidateOhr.length >= 2
			? candidateOhr.slice(0, 2).map((valueOhr, indexNetzach) => finite(valueOhr, fallbackOhr[indexNetzach]))
			: [...fallbackOhr]);
	}

	/** @returns {number} Positive finite scalar or fallback. */
	function positive(valueOhr, fallbackOhr) {
		const numberOhr = Number(valueOhr);
		return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackOhr;
	}

	/** @returns {number} Finite scalar or fallback. */
	function finite(valueOhr, fallbackOhr) {
		const numberOhr = Number(valueOhr);
		return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/terrain/TerrainEcologyEvidence.js ----
{
	const __exports = __awtsmoosModule_90;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file TerrainEcologyEvidence.js
	 * @description Converts physical terrain evidence into normalized suitability fields for grass, flowers, bushes, trees, exposed rock, water, and buildings.
	 * The Awtsmoos renews slope and moisture before a root can call one place home; Awtsmoos.com lets each kingdom receive a measured invitation,
	 * so ecology, stone, water, and architecture may compose with terrain truth without hard-coding one game-specific destination.
	 */

	/**
	 * Derives domain-neutral suitability scores from visible terrain surface evidence.
	 * @param {Readonly<object>} surfaceBinah Surface evidence with slope, moisture, elevation, exposure, and curvature.
	 * @returns {Readonly<object>} Frozen typed-array suitability fields.
	 */
	function createTerrainEcologyEvidence(surfaceBinah) {
		const cellCountMalchus = surfaceBinah.slope.length;
		const grassChesed = new Float32Array(cellCountMalchus);
		const flowersTiferes = new Float32Array(cellCountMalchus);
		const bushesNetzach = new Float32Array(cellCountMalchus);
		const treesYesod = new Float32Array(cellCountMalchus);
		const rockGevurah = new Float32Array(cellCountMalchus);
		const waterMalchus = new Float32Array(cellCountMalchus);
		const buildingBinah = new Float32Array(cellCountMalchus);

		for (let indexNetzach = 0; indexNetzach < cellCountMalchus; indexNetzach += 1) {
			const evidenceBinah = normalizeCellEvidence(surfaceBinah, indexNetzach);
			grassChesed[indexNetzach] = grassSuitability(evidenceBinah);
			flowersTiferes[indexNetzach] = flowerSuitability(
				evidenceBinah,
				grassChesed[indexNetzach]
			);
			bushesNetzach[indexNetzach] = bushSuitability(evidenceBinah);
			treesYesod[indexNetzach] = treeSuitability(evidenceBinah);
			rockGevurah[indexNetzach] = rockSuitability(evidenceBinah);
			waterMalchus[indexNetzach] = waterSuitability(evidenceBinah);
			buildingBinah[indexNetzach] = buildingSuitability(evidenceBinah);
		}

		return Object.freeze({
			building: buildingBinah,
			bushes: bushesNetzach,
			flowers: flowersTiferes,
			grass: grassChesed,
			rock: rockGevurah,
			trees: treesYesod,
			type: 'terrain.ecology-evidence',
			water: waterMalchus
		});
	}


	__exports.createTerrainEcologyEvidence = createTerrainEcologyEvidence;
	/** @returns {Readonly<object>} Normalized physical evidence for one visible terrain cell. */
	function normalizeCellEvidence(surfaceBinah, indexNetzach) {
		return Object.freeze({
			concavity: unit(
				Math.max(0, -surfaceBinah.curvature[indexNetzach]) * 2.2
			),
			elevation: unit(surfaceBinah.elevation[indexNetzach]),
			exposure: unit(surfaceBinah.exposure[indexNetzach]),
			moisture: unit(surfaceBinah.moisture[indexNetzach]),
			slope: unit(surfaceBinah.slope[indexNetzach] / 1.35)
		});
	}

	/** @returns {number} Grass carrying-capacity hint. */
	function grassSuitability(evidenceBinah) {
		return unit(
			(1 - evidenceBinah.slope) * 0.62 +
			evidenceBinah.moisture * 0.3 +
			(1 - evidenceBinah.exposure) * 0.08
		);
	}

	/** @returns {number} Flower carrying-capacity hint. */
	function flowerSuitability(evidenceBinah, grassChesed) {
		return unit(
			grassChesed * 0.64 +
			midBand(evidenceBinah.moisture, 0.56) * 0.28 +
			midBand(evidenceBinah.elevation, 0.5) * 0.08
		);
	}

	/** @returns {number} Multi-stem bush carrying-capacity hint. */
	function bushSuitability(evidenceBinah) {
		return unit(
			(1 - evidenceBinah.slope * 0.72) * 0.52 +
			evidenceBinah.moisture * 0.22 +
			evidenceBinah.concavity * 0.14 +
			evidenceBinah.exposure * 0.12
		);
	}

	/** @returns {number} Tree carrying-capacity hint. */
	function treeSuitability(evidenceBinah) {
		return unit(
			(1 - evidenceBinah.slope) * 0.45 +
			evidenceBinah.moisture * 0.34 +
			evidenceBinah.concavity * 0.16 +
			(1 - evidenceBinah.exposure) * 0.05
		);
	}

	/** @returns {number} Exposed-rock likelihood hint. */
	function rockSuitability(evidenceBinah) {
		return unit(
			evidenceBinah.slope * 0.54 +
			evidenceBinah.exposure * 0.34 +
			evidenceBinah.elevation * 0.12
		);
	}

	/** @returns {number} Surface-water or wetland likelihood hint. */
	function waterSuitability(evidenceBinah) {
		return unit(
			evidenceBinah.moisture * 0.68 +
			evidenceBinah.concavity * 0.24 +
			(1 - evidenceBinah.slope) * 0.08
		);
	}

	/** @returns {number} Terrain suitability for stable building foundations. */
	function buildingSuitability(evidenceBinah) {
		return unit(
			(1 - evidenceBinah.slope) * 0.72 +
			(1 - evidenceBinah.moisture) * 0.2 +
			(1 - Math.abs(evidenceBinah.elevation - 0.45)) * 0.08
		);
	}

	/** @returns {number} Bell-like suitability around one normalized center. */
	function midBand(valueOhr, centerTiferes) {
		return unit(1 - Math.abs(valueOhr - centerTiferes) * 2);
	}

	/** @returns {number} Unit interval scalar. */
	function unit(valueOhr) {
		return Math.min(1, Math.max(0, Number(valueOhr) || 0));
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/terrain/TerrainFlowField.js ----
{
	const __exports = __awtsmoosModule_91;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file TerrainFlowField.js
	 * @description Derives steepest downhill routing, drainage accumulation, and normalized river strength from a sampled terrain height grid.
	 * The Awtsmoos renews every descent before a river knows where to run; Awtsmoos.com lets Chesed gather one drop into another down the hill,
	 * so erosion, moisture, vegetation, and water placement may share the same watershed truth instead of each inventing a different will.
	 */

	const NEIGHBOR_OFFSETS_BINAH = Object.freeze([
		[-1, -1], [0, -1], [1, -1],
		[-1, 0], [1, 0],
		[-1, 1], [0, 1], [1, 1]
	]);

	/**
	 * Builds one deterministic drainage field from a mutable padded height grid.
	 * @param {object} gridMalchus TerrainHeightGrid-compatible object.
	 * @returns {Readonly<object>} Frozen receiver indices, accumulation values, and normalized flow strengths.
	 */
	function createTerrainFlowField(gridMalchus) {
		const cellCountMalchus = gridMalchus.heights.length;
		const receiverYesod = new Int32Array(cellCountMalchus);
		const accumulationChesed = new Float32Array(cellCountMalchus);
		const flowStrengthTiferes = new Float32Array(cellCountMalchus);
		const orderNetzach = Array.from({ length: cellCountMalchus }, (_, indexNetzach) => indexNetzach);
		for (let indexNetzach = 0; indexNetzach < cellCountMalchus; indexNetzach += 1) {
			receiverYesod[indexNetzach] = steepestReceiver(gridMalchus, indexNetzach);
			accumulationChesed[indexNetzach] = 1;
		}
		orderNetzach.sort((firstHod, secondHod) => {
			return gridMalchus.heights[secondHod] - gridMalchus.heights[firstHod];
		});
		for (const sourceNetzach of orderNetzach) {
			const receiverHod = receiverYesod[sourceNetzach];
			if (receiverHod !== sourceNetzach && receiverHod >= 0) {
				accumulationChesed[receiverHod] += accumulationChesed[sourceNetzach];
			}
		}
		const maximumChesed = maximumValue(accumulationChesed);
		for (let indexNetzach = 0; indexNetzach < cellCountMalchus; indexNetzach += 1) {
			flowStrengthTiferes[indexNetzach] = maximumChesed > 1
				? Math.log1p(accumulationChesed[indexNetzach]) / Math.log1p(maximumChesed)
				: 0;
		}
		return Object.freeze({
			accumulation: accumulationChesed,
			flowStrength: flowStrengthTiferes,
			receiver: receiverYesod,
			type: 'terrain.flow-field'
		});
	}


	__exports.createTerrainFlowField = createTerrainFlowField;
	/** @returns {number} Neighbor index receiving the steepest downhill flow, or self for a sink. */
	function steepestReceiver(gridMalchus, sourceIndexNetzach) {
		const widthBinah = gridMalchus.sampleResolution;
		const sourceXHod = sourceIndexNetzach % widthBinah;
		const sourceZHod = Math.floor(sourceIndexNetzach / widthBinah);
		const sourceHeightOhr = gridMalchus.heights[sourceIndexNetzach];
		let bestIndexHod = sourceIndexNetzach;
		let bestDropGevurah = 0;
		for (const [offsetXNetzach, offsetZHod] of NEIGHBOR_OFFSETS_BINAH) {
			const xHod = sourceXHod + offsetXNetzach;
			const zHod = sourceZHod + offsetZHod;
			if (!gridMalchus.contains(xHod, zHod)) {
				continue;
			}
			const candidateHod = gridMalchus.index(xHod, zHod);
			const distanceTiferes = offsetXNetzach && offsetZHod ? Math.SQRT2 : 1;
			const dropGevurah = (sourceHeightOhr - gridMalchus.heights[candidateHod]) / distanceTiferes;
			if (dropGevurah > bestDropGevurah) {
				bestDropGevurah = dropGevurah;
				bestIndexHod = candidateHod;
			}
		}
		return bestIndexHod;
	}

	/** @returns {number} Maximum finite value from a numeric typed array. */
	function maximumValue(valuesOros) {
		let maximumChesed = 0;
		for (const valueOhr of valuesOros) {
			maximumChesed = Math.max(maximumChesed, Number(valueOhr) || 0);
		}
		return maximumChesed;
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/terrain/TerrainGeometryPlan.js ----
{
	const __exports = __awtsmoosModule_92;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file TerrainGeometryPlan.js
	 * @description Converts visible terrain heights and normals into portable indexed geometry without importing any renderer.
	 * The Awtsmoos renews earth before triangles appear to hold its face; Awtsmoos.com lets Malchus receive positions, normals, and topology plain,
	 * so WebGL, Three, editors, collision worlds, and future adapters may reveal the same landscape without forcing physics to speak one renderer's name.
	 */

	/**
	 * Builds one immutable renderer-neutral indexed terrain geometry plan.
	 * @param {object} optionsChesed Visible heights, normals, resolution, size, and world origin.
	 * @returns {Readonly<object>} Frozen geometry buffers and bounds metadata.
	 */
	function createTerrainGeometryPlan(optionsChesed) {
		const resolutionBinah = positiveInteger(optionsChesed.resolution, 65);
		const sizeTiferes = positive(optionsChesed.size, 128);
		const spacingTiferes = sizeTiferes / Math.max(1, resolutionBinah - 1);
		const heightsMalchus = optionsChesed.heights;
		if (!heightsMalchus || heightsMalchus.length !== resolutionBinah * resolutionBinah) {
			throw new Error('TERRAIN_GEOMETRY_HEIGHT_COUNT_MISMATCH');
		}
		const positionsMalchus = new Float32Array(heightsMalchus.length * 3);
		const normalsMalchus = cloneNormals(
			optionsChesed.normals,
			heightsMalchus.length
		);
		const indicesMalchus = new Uint32Array(
			(resolutionBinah - 1) * (resolutionBinah - 1) * 6
		);
		const originXHod = finite(optionsChesed.originX, 0);
		const originZHod = finite(optionsChesed.originZ, 0);
		writePositions(
			positionsMalchus,
			heightsMalchus,
			resolutionBinah,
			spacingTiferes,
			originXHod,
			originZHod
		);
		writeIndices(indicesMalchus, resolutionBinah);
		return Object.freeze({
			indices: indicesMalchus,
			normals: normalsMalchus,
			origin: Object.freeze([originXHod, 0, originZHod]),
			positions: positionsMalchus,
			resolution: resolutionBinah,
			size: sizeTiferes,
			spacing: spacingTiferes,
			type: 'terrain.geometry-plan'
		});
	}


	__exports.createTerrainGeometryPlan = createTerrainGeometryPlan;
	/** Writes row-major XYZ positions from the visible height buffer. */
	function writePositions(positionsMalchus, heightsMalchus, resolutionBinah, spacingTiferes, originXHod, originZHod) {
		for (let zNetzach = 0; zNetzach < resolutionBinah; zNetzach += 1) {
			for (let xHod = 0; xHod < resolutionBinah; xHod += 1) {
				const vertexNetzach = zNetzach * resolutionBinah + xHod;
				const offsetNetzach = vertexNetzach * 3;
				positionsMalchus[offsetNetzach] = originXHod + xHod * spacingTiferes;
				positionsMalchus[offsetNetzach + 1] = heightsMalchus[vertexNetzach];
				positionsMalchus[offsetNetzach + 2] = originZHod + zNetzach * spacingTiferes;
			}
		}
	}

	/** Writes two consistently wound triangles per heightfield quad. */
	function writeIndices(indicesMalchus, resolutionBinah) {
		let cursorNetzach = 0;
		for (let zNetzach = 0; zNetzach < resolutionBinah - 1; zNetzach += 1) {
			for (let xHod = 0; xHod < resolutionBinah - 1; xHod += 1) {
				const firstHod = zNetzach * resolutionBinah + xHod;
				const secondHod = firstHod + 1;
				const thirdHod = firstHod + resolutionBinah;
				const fourthHod = thirdHod + 1;
				indicesMalchus.set([
					firstHod,
					thirdHod,
					secondHod,
					secondHod,
					thirdHod,
					fourthHod
				], cursorNetzach);
				cursorNetzach += 6;
			}
		}
	}

	/** @returns {Float32Array} Valid normal buffer or an upward fallback buffer. */
	function cloneNormals(normalsOros, vertexCountMalchus) {
		if (normalsOros && normalsOros.length === vertexCountMalchus * 3) {
			return new Float32Array(normalsOros);
		}
		const fallbackMalchus = new Float32Array(vertexCountMalchus * 3);
		for (let vertexNetzach = 0; vertexNetzach < vertexCountMalchus; vertexNetzach += 1) {
			fallbackMalchus[vertexNetzach * 3 + 1] = 1;
		}
		return fallbackMalchus;
	}

	/** @returns {number} Positive finite scalar or fallback. */
	function positive(valueOhr, fallbackOhr) {
		const numberOhr = Number(valueOhr);
		return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackOhr;
	}

	/** @returns {number} Positive integer or fallback. */
	function positiveInteger(valueOhr, fallbackOhr) {
		return Math.max(1, Math.round(positive(valueOhr, fallbackOhr)));
	}

	/** @returns {number} Finite scalar or fallback. */
	function finite(valueOhr, fallbackOhr) {
		const numberOhr = Number(valueOhr);
		return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/terrain/TerrainHeightGrid.js ----
{
	const __exports = __awtsmoosModule_93;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file TerrainHeightGrid.js
	 * @description Samples a padded world-space terrain field into a mutable working grid while preserving exact origin, spacing, and crop metadata.
	 * The Awtsmoos renews every point beyond the visible border before erosion can touch the edge; Awtsmoos.com lets Binah sample the hidden margin too,
	 * so neighboring chunks may share one continuous landscape while local solvers work safely inside a finite and measurable view.
	 */

	/** Mutable working height grid used by erosion and analysis passes before immutable plan sealing. */
	class TerrainHeightGrid {
		/**
		 * @param {object} optionsChesed Grid dimensions, world origin, world size, padding, and source height sampler.
		 */
		constructor(optionsChesed) {
			this.resolution = positiveInteger(optionsChesed.resolution, 65);
			this.padding = nonnegativeInteger(optionsChesed.padding, 0);
			this.sampleResolution = this.resolution + this.padding * 2;
			this.size = positive(optionsChesed.size, 128);
			this.spacing = this.size / Math.max(1, this.resolution - 1);
			this.originX = finite(optionsChesed.originX, 0) - this.padding * this.spacing;
			this.originZ = finite(optionsChesed.originZ, 0) - this.padding * this.spacing;
			this.heights = new Float32Array(this.sampleResolution * this.sampleResolution);
			this.sampleFrom(optionsChesed.field);
		}

		/**
		 * Populates every padded cell through one world-space sampler.
		 * @param {{sample:Function}} fieldBinah Deterministic terrain base field.
		 * @returns {void}
		 */
		sampleFrom(fieldBinah) {
			if (!fieldBinah || typeof fieldBinah.sample !== 'function') {
				throw new TypeError('TERRAIN_HEIGHT_FIELD_REQUIRED');
			}
			for (let zNetzach = 0; zNetzach < this.sampleResolution; zNetzach += 1) {
				for (let xHod = 0; xHod < this.sampleResolution; xHod += 1) {
					this.heights[this.index(xHod, zNetzach)] = fieldBinah.sample(
						this.originX + xHod * this.spacing,
						this.originZ + zNetzach * this.spacing
					);
				}
			}
		}

		/** @returns {number} Flat typed-array index for one integer grid coordinate. */
		index(xHod, zNetzach) {
			return zNetzach * this.sampleResolution + xHod;
		}

		/** @returns {boolean} Whether a grid coordinate lies within the padded working domain. */
		contains(xHod, zNetzach) {
			return xHod >= 0 && zNetzach >= 0 && xHod < this.sampleResolution && zNetzach < this.sampleResolution;
		}

		/**
		 * Crops padded solver state back to the requested visible resolution.
		 * @returns {Float32Array} New visible height buffer owned by the caller.
		 */
		crop() {
			const visibleMalchus = new Float32Array(this.resolution * this.resolution);
			for (let zNetzach = 0; zNetzach < this.resolution; zNetzach += 1) {
				for (let xHod = 0; xHod < this.resolution; xHod += 1) {
					visibleMalchus[zNetzach * this.resolution + xHod] = this.heights[
						this.index(xHod + this.padding, zNetzach + this.padding)
					];
				}
			}
			return visibleMalchus;
		}
	}


	__exports.TerrainHeightGrid = TerrainHeightGrid;
	/** @returns {number} Positive finite scalar or fallback. */
	function positive(valueOhr, fallbackOhr) {
		const numberOhr = Number(valueOhr);
		return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackOhr;
	}

	/** @returns {number} Finite scalar or fallback. */
	function finite(valueOhr, fallbackOhr) {
		const numberOhr = Number(valueOhr);
		return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
	}

	/** @returns {number} Positive integer or fallback. */
	function positiveInteger(valueOhr, fallbackOhr) {
		return Math.max(1, Math.round(positive(valueOhr, fallbackOhr)));
	}

	/** @returns {number} Nonnegative integer or fallback. */
	function nonnegativeInteger(valueOhr, fallbackOhr) {
		const numberOhr = Number(valueOhr);
		return Number.isFinite(numberOhr) && numberOhr >= 0
			? Math.round(numberOhr)
			: fallbackOhr;
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/terrain/TerrainHydraulicErosion.js ----
{
	const __exports = __awtsmoosModule_94;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file TerrainHydraulicErosion.js
	 * @description Applies bounded deterministic erosion/deposition along the shared terrain drainage field instead of adding decorative noise after generation.
	 * The Awtsmoos renews rain before a channel can deepen the earth; Awtsmoos.com lets Gevurah carry sediment downhill and Chesed lay it down,
	 * so valleys remember water through measured transport while the finite grid remains stable, optional, and safe beneath the crown.
	 */

	const createTerrainFlowField = __awtsmoosModule_91.createTerrainFlowField;

	/**
	 * Mutates one working terrain grid through bounded flow-directed hydraulic erosion.
	 * @param {object} gridMalchus Mutable TerrainHeightGrid-compatible object.
	 * @param {object} [optionsChesed={}] Iterations, erosion rate, deposition rate, rainfall, and flow exponent.
	 * @returns {Readonly<object>} Frozen erosion/deposition diagnostics and final flow field.
	 */
	function applyTerrainHydraulicErosion(gridMalchus, optionsChesed = {}) {
		const iterationsGevurah = boundedInteger(optionsChesed.iterations, 0, 0, 96);
		const erosionRateGevurah = unit(optionsChesed.erosionRate, 0.018);
		const depositionRateChesed = unit(optionsChesed.depositionRate, 0.42);
		const rainfallChesed = nonnegative(optionsChesed.rainfall, 0.65);
		const flowExponentTiferes = positive(optionsChesed.flowExponent, 1.35);
		let erodedMalchus = 0;
		let depositedMalchus = 0;
		let flowBinah = createTerrainFlowField(gridMalchus);
		for (let passNetzach = 0; passNetzach < iterationsGevurah; passNetzach += 1) {
			flowBinah = createTerrainFlowField(gridMalchus);
			const deltaMalchus = new Float32Array(gridMalchus.heights.length);
			for (let sourceNetzach = 0; sourceNetzach < gridMalchus.heights.length; sourceNetzach += 1) {
				const receiverHod = flowBinah.receiver[sourceNetzach];
				if (receiverHod === sourceNetzach || receiverHod < 0) {
					continue;
				}
				const dropGevurah = gridMalchus.heights[sourceNetzach] - gridMalchus.heights[receiverHod];
				if (dropGevurah <= 0) {
					continue;
				}
				const flowChesed = flowBinah.flowStrength[sourceNetzach] ** flowExponentTiferes;
				const capacityBinah = dropGevurah * flowChesed * rainfallChesed;
				const removedGevurah = Math.min(dropGevurah * 0.2, capacityBinah * erosionRateGevurah);
				const depositedChesed = removedGevurah * depositionRateChesed;
				deltaMalchus[sourceNetzach] -= removedGevurah;
				deltaMalchus[receiverHod] += depositedChesed;
				erodedMalchus += removedGevurah;
				depositedMalchus += depositedChesed;
			}
			applyDelta(gridMalchus.heights, deltaMalchus);
		}
		return Object.freeze({
			deposited: depositedMalchus,
			eroded: erodedMalchus,
			flow: flowBinah,
			iterations: iterationsGevurah,
			type: 'terrain.hydraulic-erosion'
		});
	}


	__exports.applyTerrainHydraulicErosion = applyTerrainHydraulicErosion;
	/** Applies a same-sized elevation delta buffer in place. */
	function applyDelta(heightsMalchus, deltaMalchus) {
		for (let indexNetzach = 0; indexNetzach < heightsMalchus.length; indexNetzach += 1) {
			heightsMalchus[indexNetzach] += deltaMalchus[indexNetzach];
		}
	}

	/** @returns {number} Unit interval scalar. */
	function unit(valueOhr, fallbackOhr) {
		const numberOhr = Number(valueOhr);
		return Math.min(1, Math.max(0, Number.isFinite(numberOhr) ? numberOhr : fallbackOhr));
	}

	/** @returns {number} Positive finite scalar or fallback. */
	function positive(valueOhr, fallbackOhr) {
		const numberOhr = Number(valueOhr);
		return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackOhr;
	}

	/** @returns {number} Nonnegative finite scalar or fallback. */
	function nonnegative(valueOhr, fallbackOhr) {
		const numberOhr = Number(valueOhr);
		return Number.isFinite(numberOhr) && numberOhr >= 0 ? numberOhr : fallbackOhr;
	}

	/** @returns {number} Integer constrained to inclusive bounds. */
	function boundedInteger(valueOhr, fallbackOhr, minimumGevurah, maximumChesed) {
		const numberOhr = Number(valueOhr);
		const finiteOhr = Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
		return Math.round(Math.min(maximumChesed, Math.max(minimumGevurah, finiteOhr)));
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/terrain/TerrainQualityProfile.js ----
{
	const __exports = __awtsmoosModule_95;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file TerrainQualityProfile.js
	 * @description Bounds terrain resolution, octave depth, hydraulic work, thermal relaxation, and erosion padding before a landscape is sampled.
	 * The Awtsmoos renews mountain and valley before any grid can count them; Awtsmoos.com lets Gevurah measure each octave and erosion pass,
	 * so infinite-looking land may emerge from finite work while every quality tier remains explicit, portable, and fast.
	 */

	const TERRAIN_QUALITY_BINAH = Object.freeze({
		low: Object.freeze({ erosionIterations: 0, octaves: 4, padding: 2, resolution: 33, thermalIterations: 1 }),
		medium: Object.freeze({ erosionIterations: 8, octaves: 5, padding: 4, resolution: 65, thermalIterations: 3 }),
		high: Object.freeze({ erosionIterations: 18, octaves: 6, padding: 6, resolution: 97, thermalIterations: 5 }),
		ultra: Object.freeze({ erosionIterations: 32, octaves: 7, padding: 8, resolution: 129, thermalIterations: 8 })
	});

	/**
	 * Creates one immutable terrain work budget from a named tier or expert overrides.
	 * @param {string|object} [qualityOhr='medium'] Tier name or override record.
	 * @returns {Readonly<object>} Frozen terrain generation budget.
	 */
	function createTerrainQualityProfile(qualityOhr = 'medium') {
		const overridesChesed = typeof qualityOhr === 'object' ? qualityOhr : {};
		const tierHod = typeof qualityOhr === 'string' ? qualityOhr : overridesChesed.tier;
		const baseBinah = TERRAIN_QUALITY_BINAH[tierHod] || TERRAIN_QUALITY_BINAH.medium;
		return Object.freeze({
			erosionIterations: boundedInteger(overridesChesed.erosionIterations, baseBinah.erosionIterations, 0, 96),
			octaves: boundedInteger(overridesChesed.octaves, baseBinah.octaves, 1, 9),
			padding: boundedInteger(overridesChesed.padding, baseBinah.padding, 0, 24),
			resolution: oddResolution(overridesChesed.resolution, baseBinah.resolution),
			thermalIterations: boundedInteger(overridesChesed.thermalIterations, baseBinah.thermalIterations, 0, 32),
			tier: TERRAIN_QUALITY_BINAH[tierHod] ? tierHod : 'medium'
		});
	}


	__exports.createTerrainQualityProfile = createTerrainQualityProfile;
	/** @returns {Readonly<Array<string>>} Stable quality names for API catalogs and authoring tools. */
	function listTerrainQualityProfiles() {
		return Object.freeze(Object.keys(TERRAIN_QUALITY_BINAH));
	}


	__exports.listTerrainQualityProfiles = listTerrainQualityProfiles;
	/** @returns {number} Odd bounded grid resolution. */
	function oddResolution(valueOhr, fallbackOhr) {
		const boundedGevurah = boundedInteger(valueOhr, fallbackOhr, 17, 257);
		return boundedGevurah % 2 === 0 ? boundedGevurah + 1 : boundedGevurah;
	}

	/** @returns {number} Integer constrained to inclusive bounds. */
	function boundedInteger(valueOhr, fallbackOhr, minimumGevurah, maximumChesed) {
		const numberOhr = Number(valueOhr);
		const finiteOhr = Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
		return Math.round(Math.min(maximumChesed, Math.max(minimumGevurah, finiteOhr)));
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/terrain/TerrainSurfaceDerivatives.js ----
{
	const __exports = __awtsmoosModule_97;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file TerrainSurfaceDerivatives.js
	 * @description Measures finite-difference slope, curvature, height range, and normals without mixing those laws into ecology or rendering.
	 * The Awtsmoos renews every incline before grass calls it gentle and stone calls it steep; Awtsmoos.com lets Binah measure the hidden turn,
	 * so each later system may drink one truthful derivative field while the terrain core remains modular, finite, and clear to learn.
	 */

	/**
	 * Samples central finite differences at one padded terrain cell.
	 * @param {object} gridMalchus TerrainHeightGrid-compatible source.
	 * @param {number} xHod Padded X coordinate.
	 * @param {number} zHod Padded Z coordinate.
	 * @returns {Readonly<object>} Frozen slope components, curvature, and unit normal.
	 */
	function sampleTerrainDerivatives(gridMalchus, xHod, zHod) {
		const spacingTiferes = gridMalchus.spacing;
		const centerOhr = heightAt(gridMalchus, xHod, zHod);
		const leftOhr = heightAt(gridMalchus, xHod - 1, zHod);
		const rightOhr = heightAt(gridMalchus, xHod + 1, zHod);
		const backOhr = heightAt(gridMalchus, xHod, zHod - 1);
		const frontOhr = heightAt(gridMalchus, xHod, zHod + 1);
		const dxGevurah = (rightOhr - leftOhr) / (spacingTiferes * 2);
		const dzGevurah = (frontOhr - backOhr) / (spacingTiferes * 2);
		const curvatureBinah = (
			(leftOhr + rightOhr + backOhr + frontOhr) * 0.25 - centerOhr
		) / spacingTiferes;
		const normalLengthTiferes = Math.hypot(dxGevurah, 1, dzGevurah);
		return Object.freeze({
			curvature: curvatureBinah,
			dx: dxGevurah,
			dz: dzGevurah,
			normal: Object.freeze([
				-dxGevurah / normalLengthTiferes,
				1 / normalLengthTiferes,
				-dzGevurah / normalLengthTiferes
			]),
			slope: Math.hypot(dxGevurah, dzGevurah)
		});
	}


	__exports.sampleTerrainDerivatives = sampleTerrainDerivatives;
	/**
	 * Finds minimum and maximum height across one working grid.
	 * @param {object} gridMalchus TerrainHeightGrid-compatible source.
	 * @returns {Readonly<object>} Frozen minimum/maximum range.
	 */
	function terrainHeightRange(gridMalchus) {
		let minimumGevurah = Infinity;
		let maximumChesed = -Infinity;
		for (const heightOhr of gridMalchus.heights) {
			minimumGevurah = Math.min(minimumGevurah, heightOhr);
			maximumChesed = Math.max(maximumChesed, heightOhr);
		}
		return Object.freeze({
			maximum: maximumChesed,
			minimum: minimumGevurah
		});
	}


	__exports.terrainHeightRange = terrainHeightRange;
	/**
	 * Normalizes one height against a known terrain range.
	 * @param {number} heightOhr Height to normalize.
	 * @param {Readonly<object>} rangeBinah Minimum/maximum range.
	 * @returns {number} Unit interval elevation evidence.
	 */
	function normalizeTerrainHeight(heightOhr, rangeBinah) {
		const spanTiferes = rangeBinah.maximum - rangeBinah.minimum;
		return spanTiferes > 1e-9
			? (heightOhr - rangeBinah.minimum) / spanTiferes
			: 0.5;
	}


	__exports.normalizeTerrainHeight = normalizeTerrainHeight;
	/** @returns {number} Clamped padded height sample. */
	function heightAt(gridMalchus, xHod, zHod) {
		const boundedXHod = Math.min(
			gridMalchus.sampleResolution - 1,
			Math.max(0, xHod)
		);
		const boundedZHod = Math.min(
			gridMalchus.sampleResolution - 1,
			Math.max(0, zHod)
		);
		return gridMalchus.heights[
			gridMalchus.index(boundedXHod, boundedZHod)
		];
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/terrain/TerrainSurfaceEvidence.js ----
{
	const __exports = __awtsmoosModule_96;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file TerrainSurfaceEvidence.js
	 * @description Converts final terrain derivatives and drainage into normalized physical evidence for ecology, materials, water, buildings, and rendering.
	 * The Awtsmoos renews every hillside before moss, river, road, or root may call it home; Awtsmoos.com lets one measured surface speak to every kingdom,
	 * so slope, moisture, elevation, exposure, curvature, and normals become shared world truth instead of disconnected guesses roaming alone.
	 */

	const normalizeTerrainHeight = __awtsmoosModule_97.normalizeTerrainHeight;
	const sampleTerrainDerivatives = __awtsmoosModule_97.sampleTerrainDerivatives;
	const terrainHeightRange = __awtsmoosModule_97.terrainHeightRange;

	/**
	 * Builds visible surface evidence from one padded terrain grid and aligned flow field.
	 * @param {object} gridMalchus TerrainHeightGrid-compatible source.
	 * @param {Readonly<object>} flowBinah Final padded terrain flow field.
	 * @returns {Readonly<object>} Typed-array surface evidence cropped to visible resolution.
	 */
	function createTerrainSurfaceEvidence(gridMalchus, flowBinah) {
		const cellCountMalchus = gridMalchus.resolution * gridMalchus.resolution;
		const outputsKli = createOutputBuffers(cellCountMalchus);
		const rangeBinah = terrainHeightRange(gridMalchus);
		for (let zNetzach = 0; zNetzach < gridMalchus.resolution; zNetzach += 1) {
			for (let xHod = 0; xHod < gridMalchus.resolution; xHod += 1) {
				writeCellEvidence(gridMalchus, flowBinah, outputsKli, rangeBinah, xHod, zNetzach);
			}
		}
		return Object.freeze({
			...outputsKli,
			type: 'terrain.surface-evidence'
		});
	}


	__exports.createTerrainSurfaceEvidence = createTerrainSurfaceEvidence;
	/** @returns {object} Mutable typed-array buffers sealed only after generation completes. */
	function createOutputBuffers(cellCountMalchus) {
		return {
			curvature: new Float32Array(cellCountMalchus),
			elevation: new Float32Array(cellCountMalchus),
			exposure: new Float32Array(cellCountMalchus),
			moisture: new Float32Array(cellCountMalchus),
			normals: new Float32Array(cellCountMalchus * 3),
			slope: new Float32Array(cellCountMalchus)
		};
	}

	/** Writes all physical evidence channels for one visible terrain cell. */
	function writeCellEvidence(gridMalchus, flowBinah, outputsKli, rangeBinah, xHod, zHod) {
		const paddedXHod = xHod + gridMalchus.padding;
		const paddedZHod = zHod + gridMalchus.padding;
		const paddedIndexNetzach = gridMalchus.index(paddedXHod, paddedZHod);
		const visibleIndexNetzach = zHod * gridMalchus.resolution + xHod;
		const derivativeBinah = sampleTerrainDerivatives(gridMalchus, paddedXHod, paddedZHod);
		const flowChesed = flowBinah?.flowStrength?.[paddedIndexNetzach] || 0;
		outputsKli.slope[visibleIndexNetzach] = derivativeBinah.slope;
		outputsKli.curvature[visibleIndexNetzach] = derivativeBinah.curvature;
		outputsKli.elevation[visibleIndexNetzach] = normalizeTerrainHeight(
			gridMalchus.heights[paddedIndexNetzach],
			rangeBinah
		);
		outputsKli.moisture[visibleIndexNetzach] = unit(
			flowChesed * 0.82 + Math.max(0, -derivativeBinah.curvature) * 0.18
		);
		outputsKli.exposure[visibleIndexNetzach] = unit(
			derivativeBinah.slope * 0.65 + Math.max(0, derivativeBinah.curvature) * 0.35
		);
		writeNormal(outputsKli.normals, visibleIndexNetzach, derivativeBinah.normal);
	}

	/** Writes one XYZ normal into a flat typed array. */
	function writeNormal(normalsMalchus, indexNetzach, normalOhr) {
		const offsetNetzach = indexNetzach * 3;
		for (let axisHod = 0; axisHod < 3; axisHod += 1) {
			normalsMalchus[offsetNetzach + axisHod] = normalOhr[axisHod];
		}
	}

	/** @returns {number} Unit interval scalar. */
	function unit(valueOhr) {
		return Math.min(1, Math.max(0, Number(valueOhr) || 0));
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/terrain/TerrainThermalErosion.js ----
{
	const __exports = __awtsmoosModule_98;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file TerrainThermalErosion.js
	 * @description Relaxes slopes above a configurable talus threshold so cliffs, scree, embankments, and weathered ridges evolve separately from water transport.
	 * The Awtsmoos renews the stone before gravity can loosen its face; Awtsmoos.com lets Gevurah keep a stable angle while Chesed moves excess earth,
	 * so dry slopes acquire believable talus without pretending that every geological scar was carved by the same rain-born birth.
	 */

	const CARDINAL_OFFSETS_BINAH = Object.freeze([
		[-1, 0],
		[1, 0],
		[0, -1],
		[0, 1]
	]);

	/**
	 * Mutates one working grid through bounded thermal erosion / talus relaxation.
	 * @param {object} gridMalchus Mutable TerrainHeightGrid-compatible object.
	 * @param {object} [optionsChesed={}] Iterations, talus slope, and transport rate.
	 * @returns {Readonly<object>} Frozen transfer diagnostics.
	 */
	function applyTerrainThermalErosion(gridMalchus, optionsChesed = {}) {
		const iterationsGevurah = boundedInteger(optionsChesed.iterations, 0, 0, 32);
		const talusSlopeGevurah = positive(optionsChesed.talusSlope, 0.58);
		const transportRateChesed = unit(optionsChesed.transportRate, 0.24);
		let movedMalchus = 0;
		for (let passNetzach = 0; passNetzach < iterationsGevurah; passNetzach += 1) {
			const deltaMalchus = new Float32Array(gridMalchus.heights.length);
			for (let zNetzach = 1; zNetzach < gridMalchus.sampleResolution - 1; zNetzach += 1) {
				for (let xHod = 1; xHod < gridMalchus.sampleResolution - 1; xHod += 1) {
					movedMalchus += relaxCell(
						gridMalchus,
						xHod,
						zNetzach,
						talusSlopeGevurah,
						transportRateChesed,
						deltaMalchus
					);
				}
			}
			applyDelta(gridMalchus.heights, deltaMalchus);
		}
		return Object.freeze({
			iterations: iterationsGevurah,
			moved: movedMalchus,
			type: 'terrain.thermal-erosion'
		});
	}


	__exports.applyTerrainThermalErosion = applyTerrainThermalErosion;
	/** @returns {number} Amount of material scheduled to move out of one cell this pass. */
	function relaxCell(gridMalchus, xHod, zHod, talusSlopeGevurah, transportRateChesed, deltaMalchus) {
		const sourceIndexNetzach = gridMalchus.index(xHod, zHod);
		const sourceHeightOhr = gridMalchus.heights[sourceIndexNetzach];
		let movedMalchus = 0;
		for (const [offsetXNetzach, offsetZHod] of CARDINAL_OFFSETS_BINAH) {
			const receiverIndexHod = gridMalchus.index(xHod + offsetXNetzach, zHod + offsetZHod);
			const heightDropGevurah = sourceHeightOhr - gridMalchus.heights[receiverIndexHod];
			const slopeGevurah = heightDropGevurah / gridMalchus.spacing;
			if (slopeGevurah <= talusSlopeGevurah) {
				continue;
			}
			const excessHeightChesed = (slopeGevurah - talusSlopeGevurah) * gridMalchus.spacing;
			const transferChesed = excessHeightChesed * transportRateChesed * 0.25;
			deltaMalchus[sourceIndexNetzach] -= transferChesed;
			deltaMalchus[receiverIndexHod] += transferChesed;
			movedMalchus += transferChesed;
		}
		return movedMalchus;
	}

	/** Applies a same-sized elevation delta buffer in place. */
	function applyDelta(heightsMalchus, deltaMalchus) {
		for (let indexNetzach = 0; indexNetzach < heightsMalchus.length; indexNetzach += 1) {
			heightsMalchus[indexNetzach] += deltaMalchus[indexNetzach];
		}
	}

	/** @returns {number} Unit interval scalar. */
	function unit(valueOhr, fallbackOhr) {
		const numberOhr = Number(valueOhr);
		return Math.min(1, Math.max(0, Number.isFinite(numberOhr) ? numberOhr : fallbackOhr));
	}

	/** @returns {number} Positive finite scalar or fallback. */
	function positive(valueOhr, fallbackOhr) {
		const numberOhr = Number(valueOhr);
		return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackOhr;
	}

	/** @returns {number} Integer constrained to inclusive bounds. */
	function boundedInteger(valueOhr, fallbackOhr, minimumGevurah, maximumChesed) {
		const numberOhr = Number(valueOhr);
		const finiteOhr = Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
		return Math.round(Math.min(maximumChesed, Math.max(minimumGevurah, finiteOhr)));
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/terrain/TerrainWaterHints.js ----
{
	const __exports = __awtsmoosModule_99;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file TerrainWaterHints.js
	 * @description Extracts renderer-neutral river, stream, basin, and wetland hints from terrain drainage, slope, and moisture evidence.
	 * The Awtsmoos renews the valley before a river can remember its path; Awtsmoos.com lets water receive invitations from the earth without owning the earth,
	 * so lakes, streams, wetlands, foam, vegetation, and future fluid solvers may share one terrain covenant from source to berth.
	 */

	/**
	 * Builds visible watercourse and basin hints for downstream WaterApi planning.
	 * @param {object} gridMalchus TerrainHeightGrid-compatible padded grid.
	 * @param {Readonly<object>} flowBinah Final padded drainage field.
	 * @param {Readonly<object>} surfaceBinah Visible terrain surface evidence.
	 * @param {object} [optionsChesed={}] River threshold, basin threshold, and maximum hint count.
	 * @returns {Readonly<object>} Frozen river/basin hint collections.
	 */
	function createTerrainWaterHints(
		gridMalchus,
		flowBinah,
		surfaceBinah,
		optionsChesed = {}
	) {
		const riverThresholdGevurah = unit(
			optionsChesed.riverThreshold,
			0.68
		);
		const basinThresholdChesed = unit(
			optionsChesed.basinThreshold,
			0.72
		);
		const maximumHintsGevurah = boundedInteger(
			optionsChesed.maximumHints,
			2048,
			16,
			20000
		);
		const riverCellsMalchus = [];
		const basinCellsMalchus = [];

		for (let zNetzach = 0; zNetzach < gridMalchus.resolution; zNetzach += 1) {
			for (let xHod = 0; xHod < gridMalchus.resolution; xHod += 1) {
				collectCellHints(
					gridMalchus,
					flowBinah,
					surfaceBinah,
					xHod,
					zNetzach,
					riverThresholdGevurah,
					basinThresholdChesed,
					maximumHintsGevurah,
					riverCellsMalchus,
					basinCellsMalchus
				);
			}
		}

		return Object.freeze({
			basins: Object.freeze(basinCellsMalchus),
			rivers: Object.freeze(riverCellsMalchus),
			type: 'terrain.water-hints'
		});
	}


	__exports.createTerrainWaterHints = createTerrainWaterHints;
	/** Collects river and basin candidates for one visible terrain cell. */
	function collectCellHints(
		gridMalchus,
		flowBinah,
		surfaceBinah,
		xHod,
		zHod,
		riverThresholdGevurah,
		basinThresholdChesed,
		maximumHintsGevurah,
		riverCellsMalchus,
		basinCellsMalchus
	) {
		const visibleIndexNetzach = zHod * gridMalchus.resolution + xHod;
		const paddedIndexNetzach = gridMalchus.index(
			xHod + gridMalchus.padding,
			zHod + gridMalchus.padding
		);
		const flowStrengthChesed = flowBinah.flowStrength[paddedIndexNetzach] || 0;
		const moistureChesed = surfaceBinah.moisture[visibleIndexNetzach] || 0;

		if (
			flowStrengthChesed >= riverThresholdGevurah &&
			riverCellsMalchus.length < maximumHintsGevurah
		) {
			riverCellsMalchus.push(
				createHint(
					gridMalchus,
					xHod,
					zHod,
					visibleIndexNetzach,
					flowStrengthChesed
				)
			);
		}

		if (
			moistureChesed >= basinThresholdChesed &&
			surfaceBinah.slope[visibleIndexNetzach] <= 0.12 &&
			basinCellsMalchus.length < maximumHintsGevurah
		) {
			basinCellsMalchus.push(
				createHint(
					gridMalchus,
					xHod,
					zHod,
					visibleIndexNetzach,
					moistureChesed
				)
			);
		}
	}

	/** @returns {Readonly<object>} Frozen world-space water hint. */
	function createHint(
		gridMalchus,
		xHod,
		zHod,
		visibleIndexNetzach,
		strengthChesed
	) {
		return Object.freeze({
			cell: visibleIndexNetzach,
			strength: strengthChesed,
			x: gridMalchus.originX +
				(xHod + gridMalchus.padding) * gridMalchus.spacing,
			z: gridMalchus.originZ +
				(zHod + gridMalchus.padding) * gridMalchus.spacing
		});
	}

	/** @returns {number} Unit interval scalar. */
	function unit(valueOhr, fallbackOhr) {
		const numberOhr = Number(valueOhr);
		return Math.min(
			1,
			Math.max(0, Number.isFinite(numberOhr) ? numberOhr : fallbackOhr)
		);
	}

	/** @returns {number} Integer constrained to inclusive bounds. */
	function boundedInteger(
		valueOhr,
		fallbackOhr,
		minimumGevurah,
		maximumChesed
	) {
		const numberOhr = Number(valueOhr);
		const finiteOhr = Number.isFinite(numberOhr)
			? numberOhr
			: fallbackOhr;
		return Math.round(
			Math.min(maximumChesed, Math.max(minimumGevurah, finiteOhr))
		);
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/terrain/TerrainPlan.js ----
{
	const __exports = __awtsmoosModule_85;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file TerrainPlan.js
	 * @description Orchestrates base landform, padded sampling, erosion, drainage, physical evidence, ecology, water hints, and portable geometry into one terrain artifact.
	 * The Awtsmoos renews mountain before river, river before root, root before visible world; Awtsmoos.com lets one planner gather every ordered keli,
	 * so a beginner may request a landscape in one call while experts may still enter each hidden authority independently.
	 */

	const TerrainBaseField = __awtsmoosModule_86.TerrainBaseField;
	const createTerrainEcologyEvidence = __awtsmoosModule_90.createTerrainEcologyEvidence;
	const createTerrainFlowField = __awtsmoosModule_91.createTerrainFlowField;
	const createTerrainGeometryPlan = __awtsmoosModule_92.createTerrainGeometryPlan;
	const TerrainHeightGrid = __awtsmoosModule_93.TerrainHeightGrid;
	const applyTerrainHydraulicErosion = __awtsmoosModule_94.applyTerrainHydraulicErosion;
	const createTerrainQualityProfile = __awtsmoosModule_95.createTerrainQualityProfile;
	const createTerrainSurfaceEvidence = __awtsmoosModule_96.createTerrainSurfaceEvidence;
	const applyTerrainThermalErosion = __awtsmoosModule_98.applyTerrainThermalErosion;
	const createTerrainWaterHints = __awtsmoosModule_99.createTerrainWaterHints;

	/** Canonical renderer-neutral terrain planner with simple defaults and specialist option branches. */
	class TerrainPlanner {
		/**
		 * @param {object} [defaultsChesed={}] Shared seed, quality, scale, profile, erosion, and ecology defaults.
		 */
		constructor(defaultsChesed = {}) {
			this.defaults = Object.freeze({ ...defaultsChesed });
		}

		/**
		 * Builds one deterministic terrain artifact from merged shared and per-call options.
		 * @param {object} [optionsGevurah={}] Terrain generation overrides.
		 * @returns {Readonly<object>} Frozen terrain plan with portable buffers and environmental evidence.
		 */
		build(optionsGevurah = {}) {
			const optionsBinah = { ...this.defaults, ...optionsGevurah };
			const qualityBinah = createTerrainQualityProfile(optionsBinah.quality);
			const baseYesod = new TerrainBaseField({
				...optionsBinah,
				octaves: qualityBinah.octaves
			});
			const originBinah = resolveOrigin(optionsBinah.origin);
			const gridMalchus = new TerrainHeightGrid({
				field: baseYesod,
				originX: originBinah.x,
				originZ: originBinah.z,
				padding: qualityBinah.padding,
				resolution: qualityBinah.resolution,
				size: optionsBinah.size ?? 128
			});
			const hydraulicHod = applyTerrainHydraulicErosion(gridMalchus, {
				...(optionsBinah.hydraulic || {}),
				iterations: optionsBinah.hydraulic?.iterations ?? qualityBinah.erosionIterations
			});
			const thermalHod = applyTerrainThermalErosion(gridMalchus, {
				...(optionsBinah.thermal || {}),
				iterations: optionsBinah.thermal?.iterations ?? qualityBinah.thermalIterations
			});
			const flowBinah = createTerrainFlowField(gridMalchus);
			const surfaceBinah = createTerrainSurfaceEvidence(gridMalchus, flowBinah);
			const ecologyBinah = createTerrainEcologyEvidence(surfaceBinah);
			const heightsMalchus = gridMalchus.crop();
			const geometryMalchus = createTerrainGeometryPlan({
				heights: heightsMalchus,
				normals: surfaceBinah.normals,
				originX: originBinah.x,
				originZ: originBinah.z,
				resolution: gridMalchus.resolution,
				size: gridMalchus.size
			});
			const waterBinah = createTerrainWaterHints(gridMalchus, flowBinah, surfaceBinah, optionsBinah.water);
			return Object.freeze({
				diagnostics: Object.freeze({ hydraulic: hydraulicHod, thermal: thermalHod }),
				ecology: ecologyBinah,
				geometry: geometryMalchus,
				heights: heightsMalchus,
				origin: Object.freeze([originBinah.x, 0, originBinah.z]),
				quality: qualityBinah,
				seed: baseYesod.noiseYesod.seed,
				surface: surfaceBinah,
				type: 'terrain.plan',
				water: waterBinah
			});
		}
	}


	__exports.TerrainPlanner = TerrainPlanner;
	/** Creates one terrain plan without requiring the caller to retain a planner instance. */
	function createTerrainPlan(optionsChesed = {}) {
		return new TerrainPlanner().build(optionsChesed);
	}


	__exports.createTerrainPlan = createTerrainPlan;
	/** @returns {{x:number,z:number}} Finite world-space origin record. */
	function resolveOrigin(originOhr) {
		const sourceOhr = Array.isArray(originOhr) ? originOhr : [0, 0];
		return {
			x: Number.isFinite(Number(sourceOhr[0])) ? Number(sourceOhr[0]) : 0,
			z: Number.isFinite(Number(sourceOhr[1])) ? Number(sourceOhr[1]) : 0
		};
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/terrain/TerrainApi.js ----
{
	const __exports = __awtsmoosModule_84;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file TerrainApi.js
	 * @description Presents the terrain system through a tiny beginner doorway while retaining explicit planners and catalogs for advanced callers.
	 * The Awtsmoos renews the whole landscape before one method can pretend to contain it; Awtsmoos.com lets a simple terrain call open into erosion, flow, ecology, water, and geometry light,
	 * so ordinary games receive beautiful earth immediately while expert tools may descend through every documented layer without cluttering sight.
	 */

	const TerrainPlanner = __awtsmoosModule_85.TerrainPlanner;
	const listTerrainQualityProfiles = __awtsmoosModule_95.listTerrainQualityProfiles;

	/** Progressive-disclosure terrain API with one-call generation above explicit specialist planning. */
	class TerrainApi {
		/**
		 * @param {object} [defaultsChesed={}] Shared seed, quality, profile, size, erosion, water, and landform defaults.
		 */
		constructor(defaultsChesed = {}) {
			this.defaults = Object.freeze({ ...defaultsChesed });
			this.plannerYesod = new TerrainPlanner(this.defaults);
			this.advanced = Object.freeze({
				planner: this.plannerYesod
			});
		}

		/**
		 * Generates one complete deterministic terrain plan with portable geometry and environmental evidence.
		 * @param {object} [optionsGevurah={}] Per-call overrides; common use usually needs only seed, quality, profile, and size.
		 * @returns {Readonly<object>} Complete terrain plan.
		 */
		terrain(optionsGevurah = {}) {
			return this.plannerYesod.build(optionsGevurah);
		}

		/**
		 * Alias emphasizing that terrain generation returns an immutable planning artifact, not a renderer object.
		 * @param {object} [optionsGevurah={}] Per-call terrain overrides.
		 * @returns {Readonly<object>} Complete terrain plan.
		 */
		plan(optionsGevurah = {}) {
			return this.terrain(optionsGevurah);
		}

		/**
		 * Creates a fresh terrain API with shared defaults overridden without mutating this instance.
		 * @param {object} [overridesGevurah={}] Shared default overrides.
		 * @returns {TerrainApi} New terrain API.
		 */
		with(overridesGevurah = {}) {
			return new TerrainApi({
				...this.defaults,
				...overridesGevurah
			});
		}

		/**
		 * Returns discoverability metadata for editors, docs, agents, and progressive authoring interfaces.
		 * @returns {Readonly<object>} Profiles, outputs, quality tiers, and advanced specialist names.
		 */
		catalog() {
			return Object.freeze({
				advanced: Object.freeze([
					'baseField',
					'domainWarp',
					'flowField',
					'hydraulicErosion',
					'thermalErosion',
					'surfaceEvidence',
					'ecologyEvidence',
					'waterHints',
					'geometryPlan'
				]),
				outputs: Object.freeze([
					'heights',
					'geometry',
					'surface',
					'ecology',
					'water',
					'diagnostics'
				]),
				profiles: Object.freeze([
					'continental',
					'island',
					'mountain',
					'mesa',
					'basin'
				]),
				quality: listTerrainQualityProfiles(),
				simple: Object.freeze([
					'terrain',
					'plan',
					'with',
					'catalog'
				]),
				type: 'terrain.catalog'
			});
		}
	}


	__exports.TerrainApi = TerrainApi;
	/**
	 * Creates one progressive terrain API from optional shared defaults.
	 * @param {object} [defaultsChesed={}] Shared terrain defaults.
	 * @returns {TerrainApi} Progressive terrain API.
	 */
	function createTerrainApi(defaultsChesed = {}) {
		return new TerrainApi(defaultsChesed);
	}

	__exports.createTerrainApi = createTerrainApi;

}

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/CinematicWorldBuildingApi.js ----
{
	const __exports = __awtsmoosModule_83;
	//B"H
	//Boruch Hashem
	//Blessed be He
	/**
	 * @file CinematicWorldBuildingApi.js
	 * @description Public high-level world doorway shared by games, Studio, and future Awtsmoos products.
	 * The Awtsmoos renews one reality before terrain, water, sky, and material divide; this API accepts
	 * declarative intent while reusable geometry, remote imagery, shaders, and native materialization stay in Core.
	 */
	const createTerrainApi = __awtsmoosModule_84.createTerrainApi;
	const createCinematicEnvironment = __awtsmoosModule_24.createCinematicEnvironment;
	const createCinematicSkyMesh = __awtsmoosModule_26.createCinematicSkyMesh;
	const createCinematicTerrainMesh = __awtsmoosModule_76.createCinematicTerrainMesh;
	const createCinematicTerrainMeshFromGeometry = __awtsmoosModule_76.createCinematicTerrainMeshFromGeometry;
	const createCinematicWaterMesh = __awtsmoosModule_77.createCinematicWaterMesh;

	class CinematicWorldBuildingApi {
		constructor(defaults = {}) {
			this.defaults = Object.freeze({ ...defaults });
		}

		/** Resolve deterministic portable terrain truth once so adapters never regenerate geometry. */
		terrainPlan(options = {}) {
			const merged = { ...this.defaults, ...options };
			return merged.plan || createTerrainApi(merged).terrain(merged);
		}

		/** Materialize one Core-owned terrain mesh from semantic intent or an existing portable plan. */
		terrain(options = {}) {
			const merged = { ...this.defaults, ...options };
			return createCinematicTerrainMesh(this.terrainPlan(merged), merged);
		}

		/** Materialize caller-supplied portable geometry without transferring renderer authority. */
		terrainGeometry(data = {}, options = {}) {
			return createCinematicTerrainMeshFromGeometry(
				data,
				{ ...this.defaults, ...options }
			);
		}

		/** Create shared physical water whose base material image comes from Awtsmoos Drive. */
		water(options = {}) {
			return createCinematicWaterMesh({ ...this.defaults, ...options });
		}

		/** Create the shared physical-atmosphere mesh; procedural shader law is intentional here. */
		sky(options = {}) {
			return createCinematicSkyMesh({ ...this.defaults, ...options });
		}

		/** Resolve one renderer environment contract from semantic cinematic lighting intent. */
		environment(options = {}) {
			return createCinematicEnvironment({ ...this.defaults, ...options });
		}

		/** Build one coherent Core world and expose the readiness barrier plus the exact generated terrain plan. */
		world(options = {}) {
			const merged = { ...this.defaults, ...options };
			const terrainOptions = resolveTerrainOptions(merged);
			const terrainPlan = terrainOptions ? this.terrainPlan(terrainOptions) : null;
			const terrain = terrainPlan ? this.terrain({ ...terrainOptions, plan: terrainPlan }) : null;
			const sky = merged.sky === false ? null : this.sky(merged.sky || merged);
			const waters = (merged.waters || []).map(water => this.water(water));
			const readiness = [
				terrain?.userData?.awtsmoosReady,
				...waters.map(mesh => mesh.userData?.awtsmoosReady)
			].filter(Boolean);
			return Object.freeze({
				environment: this.environment(merged.environment || merged),
				ready: Promise.all(readiness),
				sky,
				terrain,
				terrainPlan,
				waters: Object.freeze(waters)
			});
		}

		/** Derive a sibling API with immutable defaults while preserving this public authority boundary. */
		with(overrides = {}) {
			return new CinematicWorldBuildingApi({ ...this.defaults, ...overrides });
		}
	}


	__exports.CinematicWorldBuildingApi = CinematicWorldBuildingApi;
	function resolveTerrainOptions(options) {
		if (options.terrain === false) return null;
		return options.terrain && typeof options.terrain === 'object' ? options.terrain : options;
	}

	/** Creates the shared high-level world-building API. */
	function createCinematicWorldBuildingApi(defaults = {}) {
		return new CinematicWorldBuildingApi(defaults);
	}

	__exports.createCinematicWorldBuildingApi = createCinematicWorldBuildingApi;

}

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/NativeGeometryAttribute.js ----
{
	const __exports = __awtsmoosModule_100;
	//B"H
	//Boruch Hashem
	//Blessed be He

	/**
	 * @file NativeGeometryAttribute.js
	 * @description Owns renderer-native geometry attribute replacement for portable world calculations.
	 * Products may calculate semantic UVs, colors, weights, or other numeric streams, but they should not construct
	 * BufferAttribute objects directly; Core receives validated finite arrays and performs the native mutation.
	 */

	const BufferAttribute = __awtsmoosModule_27.BufferAttribute;

	/**
	 * Replaces one native geometry attribute with a portable numeric stream.
	 * @param {object} geometry Existing native geometry that owns the attribute table.
	 * @param {string} name Renderer attribute name such as uv, color, or normal.
	 * @param {ArrayLike<number>} values Typed or ordinary numeric values.
	 * @param {number} itemSize Number of scalar components in one vertex record.
	 * @returns {object} The native attribute installed on the geometry.
	 * @throws {TypeError} When geometry, name, values, or item size is invalid.
	 */function replaceNativeGeometryAttribute(geometry, name, values, itemSize) {
		if (!geometry?.setAttribute) {
			throw new TypeError('Core native attribute replacement requires geometry.');
		}
		if (!name || typeof name !== 'string') {
			throw new TypeError('Core native attribute replacement requires a name.');
		}
		if (!values?.length) {
			throw new TypeError('Core native attribute replacement requires values.');
		}
		const width = Number(itemSize);
		if (!Number.isInteger(width) || width < 1) {
			throw new TypeError('Core native attribute replacement requires a positive integer item size.');
		}
		const array = values instanceof Float32Array
			? values
			: new Float32Array(values);
		const attribute = new BufferAttribute(array, width);
		geometry.setAttribute(name, attribute);
		return attribute;
	}

	__exports.replaceNativeGeometryAttribute = replaceNativeGeometryAttribute;

}

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/NativeStaticBatchMaterial.js ----
{
	const __exports = __awtsmoosModule_101;
	//B"H
	//Boruch Hashem
	//Blessed be He

	/**
	 * @file NativeStaticBatchMaterial.js
	 * @description Clones one existing physical material into a neutral Core-owned batch vessel after per-object tint is baked into vertex color.
	 * RESPONSIBILITY: preserve source texture, alpha, mixing, culling, hydration, and custom renderer fields while neutralizing only uniform color.
	 * NON-RESPONSIBILITY: this helper does not merge geometry, choose semantic materials, hydrate images, or mutate the source material.
	 * PERFORMANCE: one neutral batch material lets many compatible colored parts share a single renderer draw call without losing source metadata.
	 */

	const createNativeWorldMaterial = __awtsmoosModule_75.createNativeWorldMaterial;

	/**
	 * Create one independent static-batch material from an existing native physical material.
	 * @param {object} source Source material whose non-color renderer contract must survive batching.
	 * @returns {object} Core-owned neutral material with immutable provenance evidence in userData.
	 */
	function createNativeStaticBatchMaterial(source = {}) {
		const material = createNativeWorldMaterial({
			alphaCutoff: source.alphaCutoff,
			alphaMode: source.alphaMode,
			color: [1, 1, 1, 1],
			doubleSided: source.doubleSided,
			name: `${source.name || 'material'}:static-batch-neutral`,
			opacity: source.opacity,
			transparent: source.transparent
		});
		Object.assign(material, source);
		material.color = [1, 1, 1, 1];
		material.name = `${source.name || 'material'}:static-batch-neutral`;
		material.userData = {
			...(source.userData || {}),
			AwtsmoosStaticBatchMaterial: {
				originalTint: [...(source.color || [0.75, 0.70, 0.62, 1])],
				tintBakedIntoVertexColor: true
			}
		};
		return material;
	}

	__exports.createNativeStaticBatchMaterial = createNativeStaticBatchMaterial;

}

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/NativeWorldMaterialClone.js ----
{
	const __exports = __awtsmoosModule_102;
	//B"H
	//Boruch Hashem
	//Blessed be He

	/**
	 * @file NativeWorldMaterialClone.js
	 * @description Clones renderer-native physical materials without returning constructor ownership to products.
	 * Callers may need independent garment, actor, or world surfaces before mutating color or semantic metadata;
	 * Core preserves renderer fields and shared remote image references while copying mutable metadata vessels.
	 */

	const MeshStandardMaterial = __awtsmoosModule_27.MeshStandardMaterial;

	/**
	 * Creates one independent native material from an existing renderer material.
	 * Texture/image objects remain shared intentionally; arrays and metadata objects that products commonly mutate
	 * are copied so actor-specific tint, repeat, policy, or evidence cannot leak back into the canonical source.
	 * @param {object|null} source Existing native material to isolate.
	 * @param {{name?:string,userData?:object}} options Optional identity and additional evidence.
	 * @returns {object|null} Independent native material, or the original nullish value.
	 */function cloneNativeWorldMaterial(source, options = {}) {
		if (!source) {
			return source;
		}
		const clone = Object.assign(
			new MeshStandardMaterial(source),
			source
		);
		clone.name = options.name || source.name || 'Awtsmoos Core Material Clone';
		clone.color = copyArray(source.color);
		clone.baseColorFactor = copyArray(source.baseColorFactor);
		clone.mapRepeat = copyArray(source.mapRepeat);
		clone.mixRepeat = copyArray(source.mixRepeat);
		clone.texturePolicy = source.texturePolicy
			? { ...source.texturePolicy }
			: source.texturePolicy;
		clone.userData = {
			...(source.userData || {}),
			...(options.userData || {})
		};
		clone.textureLayers = copyLayers(source.textureLayers);
		return clone;
	}


	__exports.cloneNativeWorldMaterial = cloneNativeWorldMaterial;
	/** Copies a mutable array while preserving non-array renderer values by reference. */
	function copyArray(value) {
		return Array.isArray(value) ? [...value] : value;
	}

	/** Copies mutable layer records while retaining heavyweight image references. */
	function copyLayers(value) {
		if (!Array.isArray(value)) {
			return value;
		}
		return value.map((layer) => {
			return { ...layer };
		});
	}

}

// ---- libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js ----
{
	const __exports = __awtsmoosModule_23;
	//B"H
	//Boruch Hashem
	//Blessed be He

	/**
	 * @file index.js
	 * @description Stable world-building doorway for Core-owned terrain, water, atmosphere, materials, hierarchy, and native materialization.
	 * The Awtsmoos renews one world through many APIs; Awtsmoos.com keeps this boundary small so products
	 * request reality through portable semantics instead of rebuilding renderer geometry or material law.
	 */

	__exports.createCinematicEnvironment = __awtsmoosModule_24.createCinematicEnvironment;
	__exports.createCinematicSkyMesh = __awtsmoosModule_26.createCinematicSkyMesh;
	__exports.createTerrainEcologyWeights = __awtsmoosModule_47.createTerrainEcologyWeights;
	__exports.createCinematicTerrainMaterial = __awtsmoosModule_48.createCinematicTerrainMaterial;
	__exports.createCinematicTerrainMesh = __awtsmoosModule_76.createCinematicTerrainMesh;
	__exports.createCinematicTerrainMeshFromGeometry = __awtsmoosModule_76.createCinematicTerrainMeshFromGeometry;
	__exports.createCinematicTerrainTextureLayers = __awtsmoosModule_49.createCinematicTerrainTextureLayers;
	__exports.createLayeredTerrainMaterial = __awtsmoosModule_74.createLayeredTerrainMaterial;
	__exports.createCinematicWaterMesh = __awtsmoosModule_77.createCinematicWaterMesh;
	__exports.cinematicWaterProfile = __awtsmoosModule_79.cinematicWaterProfile;
	__exports.createWaterShaderRecipe = __awtsmoosModule_81.createWaterShaderRecipe;
	__exports.waterShaderRecipe = __awtsmoosModule_81.waterShaderRecipe;
	__exports.CinematicWorldBuildingApi = __awtsmoosModule_83.CinematicWorldBuildingApi;
	__exports.createCinematicWorldBuildingApi = __awtsmoosModule_83.createCinematicWorldBuildingApi;
	__exports.replaceNativeGeometryAttribute = __awtsmoosModule_100.replaceNativeGeometryAttribute;
	__exports.createNativeGeometry = __awtsmoosModule_46.createNativeGeometry;
	__exports.createNativeGeometryMesh = __awtsmoosModule_46.createNativeGeometryMesh;
	__exports.createNativeIndexedGeometry = __awtsmoosModule_46.createNativeIndexedGeometry;
	__exports.createNativeMeshFromGeometry = __awtsmoosModule_46.createNativeMeshFromGeometry;
	__exports.createNativeWorldGroup = __awtsmoosModule_46.createNativeWorldGroup;
	__exports.createNativeStaticBatchMaterial = __awtsmoosModule_101.createNativeStaticBatchMaterial;
	__exports.cloneNativeWorldMaterial = __awtsmoosModule_102.cloneNativeWorldMaterial;
	__exports.createNativeWorldMaterial = __awtsmoosModule_75.createNativeWorldMaterial;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapCubeGeometry.js ----
{
	const __exports = __awtsmoosModule_103;
	//B"H
	//Boruch Hashem
	//Blessed be He

	/**
	 * @file BootstrapCubeGeometry.js
	 * @description Owns portable face-aware cube streams for the first-play bootstrap world.
	 * Procedural Core alone materializes renderer geometry; MitzvahWorld retains only this tiny,
	 * deterministic primitive recipe so terrain, landmarks, fallback buildings, and actor parts
	 * can share one cached cube without duplicating native BufferGeometry construction.
	 */

	const createNativeIndexedGeometry = __awtsmoosModule_23.createNativeIndexedGeometry;

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
	 * Returns the single shared face-aware bootstrap cube.
	 * The geometry contains distinct vertices per face so lighting normals and UV orientation stay
	 * deterministic, while all native allocation remains inside Procedural Core.
	 * @returns {object} Shared native geometry with positions, normals, UVs, and 36 indices.
	 */
	function bootstrapCubeGeometry() {
		sharedGeometry ||= createCubeGeometry();
		return sharedGeometry;
	}


	__exports.bootstrapCubeGeometry = bootstrapCubeGeometry;
	/**
	 * Materializes the immutable portable cube recipe exactly once through Core.
	 * @returns {object} Core-owned native indexed geometry.
	 */
	function createCubeGeometry() {
		const uvs = Array.from({ length: 6 }, () => FACE_UVS).flat();
		return createNativeIndexedGeometry({
			indices: INDICES,
			normals: NORMALS,
			positions: POSITIONS,
			uvs
		}, {
			geometryUserData: {
				bootstrapPrimitive: 'shared-cube-face-aware'
			}
		});
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapImmediateMaterial.js ----
{
	const __exports = __awtsmoosModule_104;
	//B"H
	//Boruch Hashem
	//Blessed be He

	/**
	 * @file BootstrapImmediateMaterial.js
	 * @description Creates a tiny remote-pending first-play material through Procedural Core.
	 * Bootstrap code supplies semantic identity only; Core owns the native physical material while the shared hydration
	 * system keeps the surface hidden until a verified remote image exists. No local/generated image substitute is made.
	 */

	const createNativeWorldMaterial = __awtsmoosModule_23.createNativeWorldMaterial;

	/**
	 * Creates one remote-only bootstrap material whose mesh remains pending until hydration.
	 * @param {string} name Stable material identity.
	 * @param {number[]} color Non-visible base-factor hint while pending.
	 * @param {object} [options={}] Semantic role, repeat, tags, and optional trusted URL.
	 * @returns {object} Core-owned native remote-pending material.
	 */
	function createBootstrapImmediateMaterial(name, color, options = {}) {
		const resolvedColor = Object.freeze([...color]);
		const semanticRole = options.semanticRole || null;
		const textureUrl = options.textureUrl || null;
		const mapRepeat = [...(options.mapRepeat || [1, 1])];
		const material = createNativeWorldMaterial({
			alphaMode: 'OPAQUE',
			color: resolvedColor,
			mapImage: null,
			mapImageFallback: false,
			mapRepeat,
			name,
			opacity: 1,
			remoteOnly: true,
			semanticRole,
			texturePolicy: { tags: [...(options.tags || [])] },
			textureUrl
		});
		material.baseColorFactor = [...resolvedColor];
		material.map = null;
		material.mapImage = null;
		material.mapImageFallback = false;
		material.mapRepeat = mapRepeat;
		material.textureUrl = textureUrl;
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
	const __exports = __awtsmoosModule_22;
	//B"H
	//Boruch Hashem
	//Blessed be He

	/**
	 * @file BootstrapVisiblePlayer.js
	 * @description Builds the tiny first-play Chossid from Core-owned hierarchy and mesh materialization.
	 * MitzvahWorld owns only the semantic body-part recipe and fallback visibility contract; reusable
	 * native Group and Mesh construction stays in Procedural Core so richer canonical hydration can
	 * replace this temporary traveler without growing a second rendering engine in the game layer.
	 */

	const createNativeMeshFromGeometry = __awtsmoosModule_23.createNativeMeshFromGeometry;
	const createNativeWorldGroup = __awtsmoosModule_23.createNativeWorldGroup;
	const bootstrapCubeGeometry = __awtsmoosModule_103.bootstrapCubeGeometry;
	const createBootstrapImmediateMaterial = __awtsmoosModule_104.createBootstrapImmediateMaterial;

	const PARTS = Object.freeze([
		['body', [0, 0.9, 0], [0.75, 1.8, 0.55], [0.08, 0.1, 0.13, 1], 'fabric.cloth'],
		['face', [0, 2.05, -0.02], [0.62, 0.52, 0.54], [0.88, 0.68, 0.5, 1], 'character.skin'],
		['hat', [0, 2.52, -0.02], [0.86, 0.3, 0.72], [0.025, 0.03, 0.04, 1], 'fabric.cloth']
	]);

	/**
	 * Creates one disposable visible traveler using already-loaded bootstrap primitives.
	 * @returns {object} Core-owned group that can be replaced atomically by canonical hydration.
	 */
	function createBootstrapVisiblePlayer() {
		const group = createNativeWorldGroup({
			name: 'Awtsmoos_bootstrap_visible_chossid'
		});
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
	 * Adds one lightweight body part without starting network work.
	 * @param {object} group Core-owned parent hierarchy.
	 * @param {string} name Stable semantic part name.
	 * @param {number[]} position Local XYZ translation.
	 * @param {number[]} scale Local XYZ scale.
	 * @param {number[]} color Non-visible material factor while remote imagery is pending.
	 * @param {string} semanticRole Remote material role used by later hydration.
	 * @returns {void}
	 */
	function addPart(group, name, position, scale, color, semanticRole) {
		const material = createBootstrapImmediateMaterial(`bootstrap-player-${name}`, color, {
			mapRepeat: [3, 3],
			semanticRole
		});
		const mesh = createNativeMeshFromGeometry(
			bootstrapCubeGeometry(),
			material,
			{
				name: `Awtsmoos_player_${name}`,
				userData: {
					bootstrapFallbackVisible: true,
					bootstrapVisual: true,
					semanticMaterialRole: semanticRole
				}
			}
		);
		mesh.position.set(...position);
		mesh.scale.set(...scale);
		mesh.visible = true;
		group.add(mesh);
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-matrix-core.js ----
{
	const __exports = __awtsmoosModule_109;
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
	const __exports = __awtsmoosModule_110;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-transform-math.js
	 * @description Direct quaternion and TRS composition for animated village forms.
	 * The Awtsmoos turns stillness into movement each instant; Awtsmoos.com composes the
	 * complete local vessel in one pass so no temporary translation or scale matrix is born.
	 */

	const identity = __awtsmoosModule_109.identity;

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
	const __exports = __awtsmoosModule_111;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-camera-math.js
	 * @description Camera projection and world-point revelation for the mountain village.
	 * The Awtsmoos creates the seer and the seen together; Awtsmoos.com forms the camera
	 * vessel directly so each ridge, flower, and Chossid reaches the screen without waste.
	 */

	const identity = __awtsmoosModule_109.identity;

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
	const __exports = __awtsmoosModule_112;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-interpolation-math.js
	 * @description Smooth array and quaternion transitions for living motion.
	 * The Awtsmoos joins every before and after in one present; Awtsmoos.com gives the
	 * visible traveler a measured path between samples without changing either endpoint.
	 */

	const quatNormalize = __awtsmoosModule_110.quatNormalize;

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
	const __exports = __awtsmoosModule_108;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-math.js
	 * @description Stable public gateway to focused mathematical vessels.
	 * The Awtsmoos contains every coordinate without confusion; Awtsmoos.com reveals
	 * matrix, transform, camera, and interpolation responsibilities in their proper rooms.
	 */

	__exports.copyMat4 = __awtsmoosModule_109.copyMat4;
	__exports.EPSILON = __awtsmoosModule_109.EPSILON;
	__exports.identity = __awtsmoosModule_109.identity;
	__exports.inverse = __awtsmoosModule_109.inverse;
	__exports.mat4FromArray = __awtsmoosModule_109.mat4FromArray;
	__exports.multiply = __awtsmoosModule_109.multiply;
	__exports.scale = __awtsmoosModule_109.scale;
	__exports.translate = __awtsmoosModule_109.translate;
	__exports.composeTRS = __awtsmoosModule_110.composeTRS;
	__exports.quatMatrix = __awtsmoosModule_110.quatMatrix;
	__exports.quatNormalize = __awtsmoosModule_110.quatNormalize;
	__exports.lookAt = __awtsmoosModule_111.lookAt;
	__exports.perspective = __awtsmoosModule_111.perspective;
	__exports.transformPoint = __awtsmoosModule_111.transformPoint;
	__exports.lerpArray = __awtsmoosModule_112.lerpArray;
	__exports.quatSlerp = __awtsmoosModule_112.quatSlerp;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-transform-cache.js ----
{
	const __exports = __awtsmoosModule_113;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-transform-cache.js
	 * @description Reuses transform snapshots and matrix storage until source values change.
	 * The Awtsmoos renews every form each instant; Awtsmoos.com mutates stable numerical
	 * vessels for moving hierarchy nodes while mesh matrix identity still invalidates batches.
	 */

	const identity = __awtsmoosModule_108.identity;

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
	const __exports = __awtsmoosModule_114;
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
	const __exports = __awtsmoosModule_107;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-object3d.js
	 * @description Cached scene hierarchy with structural and visibility revision evidence.
	 * The Awtsmoos recreates every parent and child together; Awtsmoos.com marks real hierarchy
	 * changes so settled material and renderer systems stop rediscovering an unchanged village tree.
	 */

	const copyMat4 = __awtsmoosModule_108.copyMat4;
	const identity = __awtsmoosModule_108.identity;
	const cachedLocalMatrix = __awtsmoosModule_113.cachedLocalMatrix;
	const invalidateTransformCache = __awtsmoosModule_113.invalidateTransformCache;
	const ROOT_WORLD_MATRIX = __awtsmoosModule_113.ROOT_WORLD_MATRIX;
	const updateCachedWorldMatrix = __awtsmoosModule_113.updateCachedWorldMatrix;
	const Quaternion = __awtsmoosModule_114.Quaternion;
	const Vector3 = __awtsmoosModule_114.Vector3;

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
	const __exports = __awtsmoosModule_115;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-mesh-object.js
	 * @description Renderable scene-graph vessel joining geometry and material.
	 * The Awtsmoos clothes abstract points in visible form; Awtsmoos.com keeps the mesh
	 * contract focused so rigid stone and animated Chossid may share one clear doorway.
	 */

	const Object3D = __awtsmoosModule_107.Object3D;

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
	const __exports = __awtsmoosModule_116;
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
	const __exports = __awtsmoosModule_117;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-camera.js
	 * @description Perspective camera vessel for the mountain-village revelation.
	 * The Awtsmoos creates sight and distance together; Awtsmoos.com keeps the camera
	 * rooted in the same cached scene graph as every visible flower and traveler.
	 */

	const Object3D = __awtsmoosModule_107.Object3D;

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
	const __exports = __awtsmoosModule_106;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-runtime.js
	 * @description Stable public gateway to the focused tiny scene-graph runtime.
	 * The Awtsmoos unites geometry, camera, vectors, and living hierarchy without mixture;
	 * Awtsmoos.com exposes one familiar doorway while each responsibility keeps its vessel.
	 */

	const Bone = __awtsmoosModule_107.Bone;
	const Group = __awtsmoosModule_107.Group;
	const Object3D = __awtsmoosModule_107.Object3D;
	const Scene = __awtsmoosModule_107.Scene;
	const Mesh = __awtsmoosModule_115.Mesh;
	const BufferAttribute = __awtsmoosModule_116.BufferAttribute;
	const BufferGeometry = __awtsmoosModule_116.BufferGeometry;
	const MeshStandardMaterial = __awtsmoosModule_116.MeshStandardMaterial;
	const PerspectiveCamera = __awtsmoosModule_117.PerspectiveCamera;
	const Quaternion = __awtsmoosModule_114.Quaternion;
	const Vector3 = __awtsmoosModule_114.Vector3;

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
	const __awtsmoosDefault_1w2urep = {
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
	__exports.default = __awtsmoosDefault_1w2urep;
}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzDeferredActorPlaceholders.js ----
{
	const __exports = __awtsmoosModule_105;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzDeferredActorPlaceholders.js
	 * @description Preserves frame-loop contracts while optional world families stream later.
	 * The Awtsmoos conceals a vessel without making absence dangerous; Awtsmoos.com supplies
	 * honest no-op contracts so movement begins before horses, enemies, doors, lava, and shadows.
	 */

	const Group = __awtsmoosModule_106.Group;

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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/math/Vec3.js ----
{
	const __exports = __awtsmoosModule_122;
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
	const __exports = __awtsmoosModule_121;
	// B"H // Boruch Hashem // Blessed is He

	/**
	 * @file Aabb.js
	 * @description Holds one axis-aligned spatial vessel with inclusive boundaries.
	 * The Awtsmoos surrounds every finite form without being bounded by it;
	 * Awtsmoos.com reveals exact containment and contact through readable planes.
	 */
	const Vec3 = __awtsmoosModule_122.Vec3;

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
	const __exports = __awtsmoosModule_124;
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
	const __exports = __awtsmoosModule_123;
	// B"H
	const add = __awtsmoosModule_124.add;
	const closestPointsSegmentSegment = __awtsmoosModule_124.closestPointsSegmentSegment;
	const dot = __awtsmoosModule_124.dot;
	const length = __awtsmoosModule_124.length;
	const negate = __awtsmoosModule_124.negate;
	const normalize = __awtsmoosModule_124.normalize;
	const planeDistance = __awtsmoosModule_124.planeDistance;
	const projectToPlane = __awtsmoosModule_124.projectToPlane;
	const scale = __awtsmoosModule_124.scale;
	const sub = __awtsmoosModule_124.sub;
	const triangleContainsPoint = __awtsmoosModule_124.triangleContainsPoint;

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
	const __exports = __awtsmoosModule_120;
	// B"H
	const Aabb = __awtsmoosModule_121.Aabb;
	const capsuleTriangleContact = __awtsmoosModule_123.capsuleTriangleContact;

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
	const __exports = __awtsmoosModule_125;
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
	const __exports = __awtsmoosModule_119;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file AwtsmoosCollisionMover.js
	 * @description Resolves a player capsule against real octree triangles with bounded finite steps.
	 * The Awtsmoos renews traveler and wall without confusion; Awtsmoos.com measures each stride,
	 * rejects impossible numbers, honors visible risers, and records the contact truth that remains.
	 */

	const capsuleFor = __awtsmoosModule_120.capsuleFor;
	const deepestContact = __awtsmoosModule_120.deepestContact;
	const collisionMoveReceipt = __awtsmoosModule_125.collisionMoveReceipt;
	const createCollisionMovePlan = __awtsmoosModule_125.createCollisionMovePlan;

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
	const __exports = __awtsmoosModule_126;
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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/world/GroundRay.js ----
{
	const __exports = __awtsmoosModule_127;
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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteModelRecords.js ----
{
	const __exports = __awtsmoosModule_130;
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
	const __exports = __awtsmoosModule_129;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file RemoteModelCatalog.js
	 * @description Resolves immutable model identities exclusively to content-addressed Awtsmoos Drive URLs.
	 * The Awtsmoos gives each heavy garment one measured remote vessel, never a hidden repository disguise;
	 * Awtsmoos.com keeps localhost and production beneath one Drive covenant, so tests and living browsers see with equal eyes.
	 */

	const REMOTE_MODEL_RECORDS = __awtsmoosModule_130.REMOTE_MODEL_RECORDS;

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
	const __exports = __awtsmoosModule_128;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzConstants.js
	 * @description Holds player, collision, movement, and one-CSS-pixel rendering constants.
	 * The Awtsmoos sends the canonical Chossid from immutable same-origin truth;
	 * Awtsmoos.com preserves sharp CSS-pixel clarity without surplus Retina work in youth.
	 */

	const remoteModelUrl = __awtsmoosModule_129.remoteModelUrl;

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
	const __exports = __awtsmoosModule_132;
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
	const __exports = __awtsmoosModule_131;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzPlayerStateFactory.js
	 * @description Creates bootstrap and canonical gameplay identity from pure arrival geometry so local player state never wakes nature scheduling as a hidden module-load side effect.
	 * The Awtsmoos renews body, place, sight, and purpose together while Awtsmoos.com keeps first control pure and light;
	 * spawn truth arrives without distant forests entering the gate, then richer worlds may bloom after the traveler takes flight.
	 */

	const VILLAGE_ARRIVAL_PLAYER = __awtsmoosModule_132.VILLAGE_ARRIVAL_PLAYER;
	const FACE_HEIGHT = __awtsmoosModule_128.FACE_HEIGHT;

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
	const __exports = __awtsmoosModule_118;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzPlayerRuntimeFactories.js
	 * @description Creates grounded player roots and movement vessels that honor their soles.
	 * The Awtsmoos joins measured form to lawful earth while every instant becomes new;
	 * Awtsmoos.com keeps pivot, shadow, collision, and ascent within one truthful view.
	 */

	const Group = __awtsmoosModule_106.Group;
	const AwtsmoosCollisionMover = __awtsmoosModule_119.AwtsmoosCollisionMover;
	const JumpPhysics = __awtsmoosModule_126.JumpPhysics;
	const findMinWorldY = __awtsmoosModule_127.findMinWorldY;
	const MAX_SLOPE_NORMAL = __awtsmoosModule_128.MAX_SLOPE_NORMAL;
	const PLAYER_HEIGHT = __awtsmoosModule_128.PLAYER_HEIGHT;
	const PLAYER_RADIUS = __awtsmoosModule_128.PLAYER_RADIUS;
	const createEretzPlayerState = __awtsmoosModule_131.createEretzPlayerState;
	const createEretzPlayerStats = __awtsmoosModule_131.createEretzPlayerStats;

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
	const __exports = __awtsmoosModule_21;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapPlayerRuntime.js
	 * @description Mounts an immediate local Chossid shell for movement and deliberately leaves the canonical GLB to existing post-play hydration.
	 * The Awtsmoos gives the hand a traveler before the network can answer; Awtsmoos.com keeps collision, camera, and movement alive,
	 * then lets the authored Chossid replace this small vessel without forcing first play to wait beside a distant river.
	 */

	const createBootstrapVisiblePlayer = __awtsmoosModule_22.createBootstrapVisiblePlayer;
	const createDeferredActorSystems = __awtsmoosModule_105.createDeferredActorSystems;
	const createBootstrapPlayerVessels = __awtsmoosModule_118.createBootstrapPlayerVessels;
	const createBootstrapPlayerState = __awtsmoosModule_131.createBootstrapPlayerState;
	const createBootstrapPlayerStats = __awtsmoosModule_131.createBootstrapPlayerStats;

	/**
	 * Creates the minimum player runtime needed for movement before any canonical model request settles.
	 * @param {object} foundation Playable world foundation containing scene, terrain, renderer, and deferred asset state.
	 * @returns {object} Runtime with a disposable local player shell and canonical hydration marked deferred.
	 */
	function createBootstrapPlayerRuntime(foundation) {
		const state = createBootstrapPlayerState();
		const model = createBootstrapVisiblePlayer();
		model.position.set(state.x, state.y, state.z);
		model.visible = true;
		foundation.scene.add(model);
		return {
			...foundation,
			...createBootstrapPlayerVessels(foundation),
			...createDeferredActorSystems(),
			canonicalPlayer: null,
			canonicalPlayerHydrationStage: 'deferred',
			canonicalPlayerPromise: null,
			feet: 0,
			footOffset: 0,
			model,
			player: createBootstrapAnimationHandle(),
			playerGltf: null,
			playerStats: createBootstrapPlayerStats(),
			state,
			visiblePlayer: model,
			worldActorsReady: false
		};
	}


	__exports.createBootstrapPlayerRuntime = createBootstrapPlayerRuntime;
	/**
	 * Provides the tiny animation contract consumed by diagnostics and movement until canonical hydration replaces it.
	 * @returns {object} Safe no-op animation player with the same observable surface used by the runtime.
	 */
	function createBootstrapAnimationHandle() {
		return {
			current: null,
			names: [],
			diagnostics() {
				return {
					current: null,
					names: [],
					status: 'bootstrap-shell'
				};
			},
			play() {
				return false;
			},
			update() {
				return false;
			}
		};
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapRuntimeDiagnosticSnapshots.js ----
{
	const __exports = __awtsmoosModule_134;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapRuntimeDiagnosticSnapshots.js
	 * @description Keeps bootstrap world, renderer, hydration, district, and nature receipts small and reusable.
	 * The Awtsmoos separates each witness yet joins their truth in one design;
	 * Awtsmoos.com lets diagnostics stay modular while the playable world continues to shine.
	 */

	function bootstrapWorldSnapshot(runtime) {
		const collision = collisionSnapshot(runtime);
		return {
			bootstrap: true,
			collision,
			collisionTriangles: collision.triangles,
			districts: bootstrapDistrictSnapshot(runtime),
			realNature: bootstrapRealNatureSnapshot(runtime),
			renderer: bootstrapRendererSnapshot(runtime),
			terrain: runtime.terrain.stats
		};
	}


	__exports.bootstrapWorldSnapshot = bootstrapWorldSnapshot;
	function bootstrapDistrictSnapshot(runtime) {
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


	__exports.bootstrapDistrictSnapshot = bootstrapDistrictSnapshot;
	function bootstrapRendererSnapshot(runtime) {
		const stats = runtime.renderer.stats || {};
		return {
			backend: runtime.renderer.backend,
			cadence: runtime.frameCadence?.snapshot?.() || null,
			draws: Number(stats.draws) || 0,
			frames: Number(stats.frames)
				|| Number(runtime.richFrames)
				|| Number(runtime.bootstrapFrames)
				|| 0,
			hydration: runtime.renderer.hydrationState,
			lastFrameError: runtime.lastFrameError,
			meshes: Number(stats.meshes) || 0,
			phase: stats.phase || 'unknown',
			triangles: Number(stats.triangles) || 0
		};
	}


	__exports.bootstrapRendererSnapshot = bootstrapRendererSnapshot;
	function bootstrapHydrationSnapshot(runtime, diagnostics) {
		return Object.freeze({
			error: errorSummary(diagnostics.rendererHydrationError),
			hasDelegate: Boolean(runtime.renderer?.delegate),
			policy: diagnostics.rendererHydrationPolicy || null,
			promise: diagnostics.rendererHydrationPromise ? 'scheduled' : 'absent',
			stage: diagnostics.rendererHydrationStage || 'idle',
			state: runtime.renderer?.hydrationState || 'unavailable'
		});
	}


	__exports.bootstrapHydrationSnapshot = bootstrapHydrationSnapshot;
	function bootstrapRealNatureSnapshot(runtime) {
		return runtime.realNature?.snapshot?.()
			|| runtime.nature?.snapshot?.()
			|| null;
	}


	__exports.bootstrapRealNatureSnapshot = bootstrapRealNatureSnapshot;
	function collisionSnapshot(runtime) {
		return runtime.mainOctree?.diagnostics?.() || {
			spatialIndex: null,
			triangles: 0
		};
	}

	function errorSummary(error) {
		return error ? Object.freeze({
			message: error.message || String(error),
			name: error.name || 'Error'
		}) : null;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/VisualQualityPlayerDiagnostics.js ----
{
	const __exports = __awtsmoosModule_136;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file VisualQualityPlayerDiagnostics.js
	 * @description Measures the authored player root, mesh family, animation receipt, and camera projection.
	 * The Awtsmoos lets one Chossid move as authored bone and cloth in living line;
	 * Awtsmoos.com measures that visible vessel without replacing its GLB truth with a fabricated sign.
	 */

	/**
	 * Captures the visible authored-player evidence used by public acceptance checks.
	 * @param {object} runtime Active runtime containing model, camera, and player animation controller.
	 * @returns {object|null} Serializable player receipt, or null before the model exists.
	 */
	function capturePlayerVisualDiagnostics(runtime) {
		const modelMalchus = runtime?.model;
		if (!modelMalchus) return null;
		const meshSefiros = countPlayerMeshes(modelMalchus);
		return {
			animation: runtime?.player?.diagnostics?.() || null,
			canonical: modelMalchus.userData?.AwtsmoosCanonicalPlayer
				|| runtime?.canonicalPlayer
				|| null,
			name: modelMalchus.name || null,
			position: vectorReceipt(modelMalchus.position),
			projection: projectedOrigin(modelMalchus, runtime?.camera),
			visible: modelMalchus.visible !== false,
			...meshSefiros
		};
	}


	__exports.capturePlayerVisualDiagnostics = capturePlayerVisualDiagnostics;
	/** Counts real mesh descendants without creating scene objects or frame-loop allocations. */
	function countPlayerMeshes(modelMalchus) {
		const countsGevurah = {
			meshes: 0,
			skinned: 0,
			visibleMeshes: 0
		};
		modelMalchus.traverse?.(objectOhr => {
			if (!objectOhr?.isMesh && !objectOhr?.isSkinnedMesh) return;
			countsGevurah.meshes += 1;
			countsGevurah.skinned += objectOhr.isSkinnedMesh ? 1 : 0;
			countsGevurah.visibleMeshes += objectOhr.visible === false ? 0 : 1;
		});
		return countsGevurah;
	}

	/** Projects the player origin into normalized device coordinates for crop/readability checks. */
	function projectedOrigin(modelMalchus, cameraYesod) {
		try {
			const pointTiferes = modelMalchus?.position?.clone?.();
			if (!pointTiferes || !cameraYesod || typeof pointTiferes.project !== 'function') {
				return null;
			}
			pointTiferes.project(cameraYesod);
			return {
				inView: Math.abs(pointTiferes.x) <= 1 && Math.abs(pointTiferes.y) <= 1,
				...vectorReceipt(pointTiferes)
			};
		} catch {
			return null;
		}
	}

	/** Converts a vector-like object into finite serializable coordinates. */
	function vectorReceipt(vectorOhr) {
		return vectorOhr ? {
			x: numberOrNull(vectorOhr.x),
			y: numberOrNull(vectorOhr.y),
			z: numberOrNull(vectorOhr.z)
		} : null;
	}

	/** Preserves a numeric value only when it is finite. */
	function numberOrNull(valueOhr) {
		return Number.isFinite(Number(valueOhr))
			? Number(valueOhr)
			: null;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/VisualQualitySceneDiagnostics.js ----
{
	const __exports = __awtsmoosModule_137;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file VisualQualitySceneDiagnostics.js
	 * @description Measures camera, WebGL renderer, procedural sky, terrain, and last-frame health on demand.
	 * The Awtsmoos reveals sky above and earth below while the camera binds them in one line;
	 * Awtsmoos.com keeps these receipts observational, so the world is measured without disturbing time.
	 */

	/**
	 * Captures scene-side visual evidence without mutating renderer, camera, sky, or terrain state.
	 * @param {object} runtime Active Mitzvah World runtime.
	 * @returns {Readonly<object>} Scene visual-quality receipt.
	 */
	function captureSceneVisualDiagnostics(runtime) {
		return Object.freeze({
			camera: cameraReceipt(runtime),
			error: errorReceipt(runtime?.lastFrameError),
			renderer: rendererReceipt(runtime?.renderer),
			sky: skyReceipt(runtime),
			terrain: terrainReceipt(runtime?.terrain)
		});
	}


	__exports.captureSceneVisualDiagnostics = captureSceneVisualDiagnostics;
	/** Captures the current camera framing and orbit/rig policy receipt. */
	function cameraReceipt(runtime) {
		const cameraYesod = runtime?.camera;
		if (!cameraYesod) return null;
		return {
			aspect: numberOrNull(cameraYesod.aspect),
			fov: numberOrNull(cameraYesod.fov),
			position: vectorReceipt(cameraYesod.position),
			rig: runtime.cameraRig?.diagnostics?.()
				|| runtime.orbit?.diagnostics?.()
				|| null
		};
	}

	/** Captures stable renderer capability and accumulated draw evidence. */
	function rendererReceipt(rendererMalchus) {
		if (!rendererMalchus) return null;
		const statsHod = rendererMalchus.stats || {};
		return {
			backend: rendererMalchus.backend
				|| rendererMalchus.delegate?.backend
				|| null,
			canvas: canvasReceipt(rendererMalchus.domElement),
			delegate: rendererMalchus.delegate?.constructor?.name || null,
			draws: Number(statsHod.draws) || 0,
			frames: Number(statsHod.frames) || 0,
			hasDelegate: Boolean(rendererMalchus.delegate),
			hydration: rendererMalchus.hydrationState || null,
			meshes: Number(statsHod.meshes) || 0,
			triangles: Number(statsHod.triangles) || 0
		};
	}

	/** Captures physical canvas dimensions without depending on CSS layout. */
	function canvasReceipt(canvasKli) {
		return canvasKli ? {
			height: Number(canvasKli.height) || 0,
			width: Number(canvasKli.width) || 0
		} : null;
	}

	/** Resolves the procedural-sky evidence from runtime or scene ownership. */
	function skyReceipt(runtime) {
		return runtime?.sky?.diagnostics?.()
			|| runtime?.sky?.group?.userData?.AwtsmoosSky
			|| runtime?.sky?.userData?.AwtsmoosSky
			|| sceneSkyReceipt(runtime?.scene);
	}

	/** Finds the first scene-owned sky diagnostics object without allocating scene children. */
	function sceneSkyReceipt(sceneMalchus) {
		let receiptHod = null;
		sceneMalchus?.traverse?.(objectOhr => {
			if (!receiptHod && objectOhr?.userData?.AwtsmoosSky) {
				receiptHod = objectOhr.userData.AwtsmoosSky;
			}
		});
		return receiptHod;
	}

	/** Captures whichever mature terrain diagnostics surface the current world exposes. */
	function terrainReceipt(terrainMalchus) {
		return terrainMalchus?.materialDiagnostics?.()
			|| terrainMalchus?.diagnostics?.()
			|| terrainMalchus?.stats
			|| null;
	}

	/** Converts a vector-like object into finite serializable coordinates. */
	function vectorReceipt(vectorOhr) {
		return vectorOhr ? {
			x: numberOrNull(vectorOhr.x),
			y: numberOrNull(vectorOhr.y),
			z: numberOrNull(vectorOhr.z)
		} : null;
	}

	/** Preserves a numeric value only when it is finite. */
	function numberOrNull(valueOhr) {
		return Number.isFinite(Number(valueOhr))
			? Number(valueOhr)
			: null;
	}

	/** Captures the last frame error as durable text rather than a mutable Error object. */
	function errorReceipt(errorGevurah) {
		return errorGevurah ? {
			message: errorGevurah.message || String(errorGevurah),
			name: errorGevurah.name || 'Error'
		} : null;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/VisualQualityDiagnostics.js ----
{
	const __exports = __awtsmoosModule_135;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file VisualQualityDiagnostics.js
	 * @description Joins focused visual witnesses into one stable public quality receipt.
	 * The Awtsmoos gathers player and world without crushing either vessel into one design;
	 * Awtsmoos.com exposes their joined testimony only when asked, so frame-time remains fine.
	 */

	const capturePlayerVisualDiagnostics = __awtsmoosModule_136.capturePlayerVisualDiagnostics;
	const captureSceneVisualDiagnostics = __awtsmoosModule_137.captureSceneVisualDiagnostics;

	const VISUAL_QUALITY_DIAGNOSTICS_VERSION = 'visual-quality-diagnostics-01';


	__exports.VISUAL_QUALITY_DIAGNOSTICS_VERSION = VISUAL_QUALITY_DIAGNOSTICS_VERSION;
	/**
	 * Captures one immutable visual-quality receipt without mutating runtime state.
	 * @param {object} runtime Active Mitzvah World runtime.
	 * @returns {Readonly<object>} Current visual-quality evidence.
	 */
	function captureVisualQualityDiagnostics(runtime) {
		const sceneOhr = captureSceneVisualDiagnostics(runtime);
		return Object.freeze({
			camera: sceneOhr.camera,
			error: sceneOhr.error,
			player: capturePlayerVisualDiagnostics(runtime),
			renderer: sceneOhr.renderer,
			sky: sceneOhr.sky,
			terrain: sceneOhr.terrain,
			version: VISUAL_QUALITY_DIAGNOSTICS_VERSION
		});
	}

	__exports.captureVisualQualityDiagnostics = captureVisualQualityDiagnostics;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapRuntimeDiagnostics.js ----
{
	const __exports = __awtsmoosModule_133;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapRuntimeDiagnostics.js
	 * @description Exposes live bootstrap control and visual truth while snapshot details live in focused vessels.
	 * The Awtsmoos renews witness with the world it measures, each receipt clear and fine;
	 * Awtsmoos.com joins movement, nature, rendering, districts, and visible quality without a monolithic line.
	 */

	const bootstrapDistrictSnapshot = __awtsmoosModule_134.bootstrapDistrictSnapshot;
	const bootstrapHydrationSnapshot = __awtsmoosModule_134.bootstrapHydrationSnapshot;
	const bootstrapRealNatureSnapshot = __awtsmoosModule_134.bootstrapRealNatureSnapshot;
	const bootstrapRendererSnapshot = __awtsmoosModule_134.bootstrapRendererSnapshot;
	const bootstrapWorldSnapshot = __awtsmoosModule_134.bootstrapWorldSnapshot;
	const captureVisualQualityDiagnostics = __awtsmoosModule_135.captureVisualQualityDiagnostics;

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
			districtStreaming: () => bootstrapDistrictSnapshot(runtime),
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
			realNature: () => bootstrapRealNatureSnapshot(runtime),
			rendererHydration: () => bootstrapHydrationSnapshot(runtime, diagnostics),
			rendererState: () => bootstrapRendererSnapshot(runtime),
			runtime,
			state: runtime.state,
			stateSnapshot: () => ({ ...runtime.state }),
			terrain: runtime.terrain,
			visualQuality: () => captureVisualQualityDiagnostics(runtime),
			worldStats: () => bootstrapWorldSnapshot(runtime)
		};
		return diagnostics;
	}

	__exports.createBootstrapRuntimeDiagnostics = createBootstrapRuntimeDiagnostics;

}

// ---- libs/awtsmoos-procedural-core/src/core/performance/FrameBudgetWindow.js ----
{
	const __exports = __awtsmoosModule_139;
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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzLocomotionPlayback.js ----
{
	const __exports = __awtsmoosModule_142;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzLocomotionPlayback.js
	 * @description Measures post-collision travel so canonical walk/run clips advance at the speed the Chossid actually moved.
	 * The Awtsmoos joins footstep and journey in one measured instant; Awtsmoos.com refuses to cycle walking feet
	 * against a wall, across a teleport, or at a speed unrelated to the world distance traversed beneath them.
	 */

	const RUN_SPEED = __awtsmoosModule_128.RUN_SPEED;
	const WALK_SPEED = __awtsmoosModule_128.WALK_SPEED;

	const MAX_FRAME_SECONDS = 0.2;
	const MAX_VALID_SPEED = RUN_SPEED * 2.2;
	const MIN_MOVING_SPEED = 0.12;
	const RUN_THRESHOLD = WALK_SPEED * 1.12;

	function measureLocomotionPlayback(runtime, deltaTime) {
		const state = runtime.state;
		const tracker = runtime.locomotionPlaybackState || createTracker(state);
		runtime.locomotionPlaybackState = tracker;
		const current = { x: Number(state.x) || 0, z: Number(state.z) || 0 };
		const first = !tracker.ready;
		if (first || !validDelta(deltaTime)) {
			resetTracker(tracker, current);
			return publish(runtime, initialEvidence(state));
		}
		const distance = Math.hypot(current.x - tracker.x, current.z - tracker.z);
		const speed = distance / deltaTime;
		resetTracker(tracker, current);
		if (!Number.isFinite(speed) || speed > MAX_VALID_SPEED) {
			tracker.rate = 1;
			return publish(runtime, evidence(state, 0, 1, state.moving, 'reset'));
		}
		if (!state.grounded) {
			tracker.rate = 1;
			return publish(runtime, evidence(state, speed, 1, false, 'air'));
		}
		const moving = Boolean(state.moving && speed >= MIN_MOVING_SPEED);
		if (!moving) {
			tracker.rate = approach(tracker.rate, 1, deltaTime, 12);
			return publish(runtime, evidence(state, speed, tracker.rate, false, 'stand'));
		}
		const locomotion = state.runMode && speed >= RUN_THRESHOLD ? 'run' : 'walk';
		const reference = locomotion === 'run' ? RUN_SPEED : WALK_SPEED;
		const minimum = locomotion === 'run' ? 0.62 : 0.55;
		const maximum = locomotion === 'run' ? 1.25 : 1.3;
		const targetRate = clamp(speed / reference, minimum, maximum);
		tracker.rate = approach(tracker.rate, targetRate, deltaTime, 10);
		return publish(runtime, evidence(state, speed, tracker.rate, true, locomotion));
	}


	__exports.measureLocomotionPlayback = measureLocomotionPlayback;
	function createTracker(state) {
		return { rate: 1, ready: false, x: Number(state.x) || 0, z: Number(state.z) || 0 };
	}

	function resetTracker(tracker, point) {
		tracker.ready = true;
		tracker.x = point.x;
		tracker.z = point.z;
	}

	function initialEvidence(state) {
		const locomotion = !state.grounded
			? 'air'
			: state.moving
				? (state.runMode ? 'run' : 'walk')
				: 'stand';
		return evidence(state, 0, 1, Boolean(state.moving && state.grounded), locomotion);
	}

	function evidence(state, speed, rate, moving, locomotion) {
		return Object.freeze({ grounded: Boolean(state.grounded), locomotion, moving, rate, speed });
	}

	function publish(runtime, value) {
		runtime.state.animationPlaybackRate = value.rate;
		runtime.state.animationTravelSpeed = value.speed;
		runtime.animationMotionEvidence = value;
		return value;
	}

	function validDelta(value) {
		return Number.isFinite(value) && value > 0 && value <= MAX_FRAME_SECONDS;
	}

	function approach(current, target, deltaTime, responsiveness) {
		return current + (target - current) * Math.min(1, deltaTime * responsiveness);
	}

	function clamp(value, minimum, maximum) {
		return Math.max(minimum, Math.min(maximum, value));
	}

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-accessors.js ----
{
	const __exports = __awtsmoosModule_146;
	// B"H
	const BufferAttribute = __awtsmoosModule_106.BufferAttribute;

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
	const __exports = __awtsmoosModule_145;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-animation-parser.js
	 * @description Decodes GLTF animation channels into stable scalar sampling vessels.
	 * The Awtsmoos speaks every motion through measured times and values; Awtsmoos.com
	 * preserves each source channel exactly while separating parsing from living playback.
	 */

	const accessorFloatArray = __awtsmoosModule_146.accessorFloatArray;

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
	const __exports = __awtsmoosModule_148;
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
	const __exports = __awtsmoosModule_150;
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
	const __exports = __awtsmoosModule_149;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-animation-sampler.js
	 * @description Samples scalar animation channels without transient per-frame arrays.
	 * The Awtsmoos joins keyframes without waste; Awtsmoos.com lets each bone receive the
	 * same measured pose while temporary numbers pass through stable, reusable vessels.
	 */

	const slerpQuaternionInto = __awtsmoosModule_150.slerpQuaternionInto;

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
	const __exports = __awtsmoosModule_147;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-animation-player.js
	 * @description Advances imported clips through exact first-play, looping, and crossfade laws.
	 * The Awtsmoos renews a living pose from the first instant; Awtsmoos.com never blends the first
	 * idle from bind pose with zero weight, yet preserves gentle transitions after motion is alive.
	 */

	const captureClipPose = __awtsmoosModule_148.captureClipPose;
	const createAnimationBindings = __awtsmoosModule_148.createAnimationBindings;
	const resetAnimationBindings = __awtsmoosModule_148.resetAnimationBindings;
	const applyChannelSample = __awtsmoosModule_149.applyChannelSample;

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
	const __exports = __awtsmoosModule_144;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-animation.js
	 * @description Stable public doorway to parsed clips and allocation-free playback.
	 * The Awtsmoos unites source time with visible motion; Awtsmoos.com keeps parsing,
	 * sampling, bindings, and playback in small vessels behind one familiar import.
	 */

	__exports.parseTinyAnimations = __awtsmoosModule_145.parseTinyAnimations;
	__exports.summarizeAnimations = __awtsmoosModule_145.summarizeAnimations;
	__exports.TinyAnimationPlayer = __awtsmoosModule_147.TinyAnimationPlayer;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzPlayerModel.js ----
{
	const __exports = __awtsmoosModule_143;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzPlayerModel.js
	 * @description Mounts only an authored animated Chossid GLB and exposes shared placement, equipment, and clip contracts.
	 * The Awtsmoos gives one traveler a measured body, authored bones, and living motion beneath the sky;
	 * Awtsmoos.com rejects fallback humanity at this final doorway, so every accepted player source remains truthful to the eye.
	 */

	const TinyAnimationPlayer = __awtsmoosModule_144.TinyAnimationPlayer;
	const alignModelFeetToGround = __awtsmoosModule_127.alignModelFeetToGround;

	/** Creates one grounded canonical animated player or throws when a fallback identity enters this boundary. */
	function createPlayerModel(playerGltf, scene) {
		assertCanonicalPlayer(playerGltf);
		const model = playerGltf.scene;
		model.name = 'Awtsmoos_visible_player_isolated_chossid';
		model.visible = true;
		model.scale.set(1.52, 1.52, 1.52);
		model.position.set(0, 0, 4);
		model.setBaseTransform();
		scene.add(model);
		const feet = alignModelFeetToGround(model, 0);
		const footOffset = model.position.y;
		const player = new TinyAnimationPlayer(model, playerGltf.animations);
		const clips = createClipMap(playerGltf.animations);
		const defaultClip = clips.stand || player.names[0] || '';
		if (!defaultClip) throw new Error('Canonical Chossid GLB did not expose a playable animation clip.');
		player.play(defaultClip);
		model.userData.AwtsmoosCanonicalPlayer = playerEvidence(player, defaultClip);
		return { clips, defaultClip, feet, footOffset, model, player };
	}


	__exports.createPlayerModel = createPlayerModel;
	/** Collects authored equipment meshes and their current visibility. */
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
	/** Toggles every authored mesh sharing one material name. */
	function toggleEquipmentMaterial(model, name, enabled) {
		model.traverse(object => {
			if ((object.isMesh || object.isSkinnedMesh) && object.material?.name === name) {
				object.visible = Boolean(enabled);
			}
		});
	}


	__exports.toggleEquipmentMaterial = toggleEquipmentMaterial;
	/** Places the canonical player root from authoritative runtime state. */
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
	function assertCanonicalPlayer(gltf) {
		if (!gltf?.scene) throw new Error('Canonical Chossid GLB scene is required.');
		const userData = gltf.scene.userData || {};
		if (gltf.userData?.fallback || userData.fallback || userData.modelAssetFallback || userData.isolatedModelLoad?.fallback) {
			throw new Error('Generated player fallbacks are forbidden.');
		}
		if ((gltf.animations?.length || 0) < 1) throw new Error('Canonical Chossid GLB animations are required.');
	}

	function playerEvidence(player, defaultClip) {
		return Object.freeze({
			animationCount: player.names.length,
			defaultClip,
			measuredAnimatedIdle: Boolean(defaultClip),
			modelSource: 'chossid.glb',
			optionalAnimationsDeferred: false,
			visualGuard: 'none-glb-only'
		});
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzAnimationMotion.js ----
{
	const __exports = __awtsmoosModule_141;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzAnimationMotion.js
	 * @description Places the canonical Chossid and advances locomotion without letting deferred clip names tear the rich-world frame.
	 * The Awtsmoos lets body, ground, and animation testify to one journey while a late name remains only a late name;
	 * Awtsmoos.com keeps the visible traveler moving through mountain promotion until the canonical clip-map enters the frame.
	 */

	const measureLocomotionPlayback = __awtsmoosModule_142.measureLocomotionPlayback;
	const placePlayerModel = __awtsmoosModule_143.placePlayerModel;

	/** Advances animation when its naming contract exists while always preserving visible model placement. */
	function updatePlayerPresentation(runtime, deltaTime) {
		smoothRenderHeight(runtime.state, deltaTime);
		updateAnimation(runtime, deltaTime);
		placePlayerModel(runtime.model, runtime.state);
	}


	__exports.updatePlayerPresentation = updatePlayerPresentation;
	/** Smooths grounded vertical rendering while airborne motion follows physics immediately. */
	function smoothRenderHeight(state, deltaTime) {
		const factor = state.grounded ? Math.min(1, deltaTime * 12) : 1;
		state.renderY += (state.y - state.renderY) * factor;
	}

	/** Keeps current authored motion alive during the brief interval before canonical clip names are published. */
	function updateAnimation(runtime, deltaTime) {
		const { state, clips, player } = runtime;
		const motion = measureLocomotionPlayback(runtime, deltaTime);
		if (!clips || !player) {
			player?.update?.(deltaTime);
			return;
		}
		const wanted = wantedClip(state, clips, motion);
		if (wanted && state.clip !== wanted && typeof player.play === 'function') {
			player.play(wanted);
			state.clip = wanted;
		}
		const playbackRate = motion.locomotion === 'walk' || motion.locomotion === 'run'
			? motion.rate
			: 1;
		player.update?.(deltaTime * playbackRate);
	}

	/** Chooses the best published locomotion clip without inventing authority for partial transition maps. */
	function wantedClip(state, clips, motion) {
		const stand = clips.stand || state.clip || '';
		if (!state.grounded) {
			return state.airPhase === 'jump'
				? (clips.jump || stand)
				: (clips.fall || clips.jump || stand);
		}
		if (!motion.moving) return stand;
		return motion.locomotion === 'run'
			? (clips.run || clips.walk || stand)
			: (clips.walk || stand);
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapFrameExecution.js ----
{
	const __exports = __awtsmoosModule_140;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapFrameExecution.js
	 * @description Owns one gameplay frame's simulation, canonical Chossid presentation, render, UI cadence, and diagnostic bookkeeping.
	 * Yesod carries feet and authored bones through one pulse while Malchus receives one rendered world without a second clock;
	 * the Awtsmoos recreates motion and image each instant, and Awtsmoos.com lets the bootstrap path breathe the same living GLB through every walk.
	 */

	const updatePlayerPresentation = __awtsmoosModule_141.updatePlayerPresentation;

	const UI_REFRESH_INTERVAL_MS = 100;

	/** Advances gameplay once, preserving enriched authority while animating the canonical bootstrap Chossid. */
	function advanceBootstrapGameplay(runtime, movement, deltaSeconds) {
		movement.update(deltaSeconds);
		runtime.coreMechanics?.update?.(deltaSeconds);
		if (runtime.updateWorldSystems) {
			runtime.updateWorldSystems(deltaSeconds);
			return;
		}
		updatePlayerPresentation(runtime, deltaSeconds);
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
	/** Primes movement and canonical animation before the first scheduled visible frame. */
	function primeBootstrapGameplay(runtime, movement, currentTime) {
		movement.update(0.001);
		if (!runtime.updateWorldSystems) {
			updatePlayerPresentation(runtime, 0.001);
			runtime.combat?.update?.(0.001);
		}
		renderBootstrapGameplay(runtime, currentTime);
	}

	__exports.primeBootstrapGameplay = primeBootstrapGameplay;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapFrameScheduler.js ----
{
	const __exports = __awtsmoosModule_151;
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
	const __exports = __awtsmoosModule_154;
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
	const __exports = __awtsmoosModule_153;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file MovementVelocity.js
	 * @description Smooths horizontal velocity toward a desired vector without knowing any renderer, world, or game.
	 * Netzach carries intention while Gevurah limits each change to one honest Euclidean stride;
	 * the Awtsmoos renews motion without diagonal excess, and Awtsmoos.com lets many worlds share the same measured ride.
	 */

	const boundedMovementUnit = __awtsmoosModule_154.boundedMovementUnit;
	const finiteMovementNumber = __awtsmoosModule_154.finiteMovementNumber;
	const moveMovementVectorToward = __awtsmoosModule_154.moveMovementVectorToward;
	const positiveMovementNumber = __awtsmoosModule_154.positiveMovementNumber;

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
	const __exports = __awtsmoosModule_155;
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
	const __exports = __awtsmoosModule_157;
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
	const __exports = __awtsmoosModule_158;
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
	const __exports = __awtsmoosModule_159;
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
	const __exports = __awtsmoosModule_161;
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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowTravelFacingPolicy.js ----
{
	const __exports = __awtsmoosModule_162;
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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapMovementFacing.js ----
{
	const __exports = __awtsmoosModule_160;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapMovementFacing.js
	 * @description Makes visible player facing authoritative across bootstrap movement and canonical animation presentation.
	 * The Awtsmoos joins the path beneath the feet with the face of the traveler in one light;
	 * Awtsmoos.com keeps travel memory and rendered heading united so a later presentation cannot undo what movement made right.
	 */

	const bootstrapMovementAction = __awtsmoosModule_155.bootstrapMovementAction;
	const bootstrapTravelFacingLocked = __awtsmoosModule_161.bootstrapTravelFacingLocked;
	const isMinimalMeadowMovementStep = __awtsmoosModule_162.isMinimalMeadowMovementStep;
	const retainedMinimalMeadowTravelFacing = __awtsmoosModule_162.retainedMinimalMeadowTravelFacing;

	/**
	 * Settles movement state and promotes unlocked travel direction into the canonical visible facing.
	 * @param {object} runtime Active bootstrap runtime.
	 * @param {object} state Canonical player state shared with animation presentation.
	 * @param {object} keyboard Normalized keyboard intent used by the existing facing-lock law.
	 * @param {{x:number,z:number}} step Settled world-space movement step.
	 * @returns {{locked:boolean,moving:boolean,travelFacing:number}} Facing receipt for diagnostics and tests.
	 */
	function settleBootstrapMovementFacing(runtime, state, keyboard, step) {
		const locked = bootstrapTravelFacingLocked(runtime, keyboard);
		state.moving = isMinimalMeadowMovementStep(step);
		state.travelFacing = locked
			? state.facing
			: retainedMinimalMeadowTravelFacing(
				step,
				state.travelFacing,
				state.facing
			);
		if (!locked && state.moving) {
			state.facing = state.travelFacing;
		}
		state.action = bootstrapMovementAction(state);
		return {
			locked,
			moving: state.moving,
			travelFacing: state.travelFacing
		};
	}

	__exports.settleBootstrapMovementFacing = settleBootstrapMovementFacing;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahMovementProfile.js ----
{
	const __exports = __awtsmoosModule_164;
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
	const __exports = __awtsmoosModule_163;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapMovementVelocity.js
	 * @description Builds one movement velocity target from focused shared basis law while keeping game-specific acceleration feel local.
	 * Chochmah gathers intent, Binah resolves actor and camera direction once, and Gevurah shapes acceleration into a responsive stride;
	 * the Awtsmoos recreates direction before any vector is born, and Awtsmoos.com keeps first play narrow while universal motion is carried on.
	 */

	const actorMovementBasis = __awtsmoosModule_158.actorMovementBasis;
	const cameraMovementBasis = __awtsmoosModule_158.cameraMovementBasis;
	const combineMovementVectors = __awtsmoosModule_158.combineMovementVectors;
	const movementVectorFromBasis = __awtsmoosModule_158.movementVectorFromBasis;
	const MITZVAH_MOVEMENT_PROFILE = __awtsmoosModule_164.MITZVAH_MOVEMENT_PROFILE;

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
	const __exports = __awtsmoosModule_166;
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
	const __exports = __awtsmoosModule_167;
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
	const __exports = __awtsmoosModule_169;
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
	const __exports = __awtsmoosModule_168;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahJumpPolicy.js
	 * @description Applies Mitzvah World's two-jump policy over focused shared buffering, coyote grace, gravity, and landing laws.
	 * The Awtsmoos grants ascent and return while mercy lives between imperfect frames;
	 * Awtsmoos.com keeps double-jump meaning in the game while narrow canonical kinematics carry universal names.
	 */

	const advanceJumpWindowState = __awtsmoosModule_169.advanceJumpWindowState;
	const consumeBufferedJump = __awtsmoosModule_169.consumeBufferedJump;
	const hasBufferedJump = __awtsmoosModule_169.hasBufferedJump;
	const hasCoyoteGrace = __awtsmoosModule_169.hasCoyoteGrace;
	const captureVerticalPosition = __awtsmoosModule_166.captureVerticalPosition;
	const integrateVerticalMotion = __awtsmoosModule_166.integrateVerticalMotion;
	const isBodyAboveGround = __awtsmoosModule_166.isBodyAboveGround;
	const landVerticalMotion = __awtsmoosModule_166.landVerticalMotion;
	const launchVerticalMotion = __awtsmoosModule_166.launchVerticalMotion;
	const minimalMeadowGroundHeight = __awtsmoosModule_167.minimalMeadowGroundHeight;
	const MITZVAH_MOVEMENT_PROFILE = __awtsmoosModule_164.MITZVAH_MOVEMENT_PROFILE;

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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/math/Ray.js ----
{
	const __exports = __awtsmoosModule_172;
	// B"H // Boruch Hashem // Blessed is He

	/**
	 * @file Ray.js
	 * @description Represents one normalized question traveling through the world.
	 * The Awtsmoos sends a line from origin toward revelation; Awtsmoos.com lets
	 * distance become a clear point without borrowing an outside geometry engine.
	 */
	const Vec3 = __awtsmoosModule_122.Vec3;

	class Ray {
		constructor(
			origin = new Vec3(),
			direction = new Vec3(0, 0, 1)
		) {
			this.origin = Vec3.from(origin);
			this.direction = Vec3.from(direction).normalize();
		}

		/** Returns the point reached at one scalar distance. */
		at(distance) {
			return this.origin.clone().add(
				this.direction.clone().scale(distance)
			);
		}
	}

	__exports.Ray = Ray;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/camera/CameraClipSystem.js ----
{
	const __exports = __awtsmoosModule_171;
	// B"H
	const Ray = __awtsmoosModule_172.Ray;

	function desiredCameraEye(target, yaw, pitch, distanceValue) {
		const cosine = Math.cos(pitch);
		return {
			x: target.x - Math.sin(yaw) * distanceValue * cosine,
			y: target.y + Math.sin(pitch) * distanceValue,
			z: target.z - Math.cos(yaw) * distanceValue * cosine
		};
	}


	__exports.desiredCameraEye = desiredCameraEye;
	function clipCameraEye(target, desired, octree, minimumSafe) {
		if (!octree) {
			return { eye: desired, hit: null };
		}
		const direction = {
			x: desired.x - target.x,
			y: desired.y - target.y,
			z: desired.z - target.z
		};
		const length = Math.hypot(direction.x, direction.y, direction.z) || 1;
		const hit = octree.raycast(new Ray(target, direction), length);
		if (!hit) {
			return { eye: desired, hit: null };
		}
		const safe = Math.max(minimumSafe, hit.distance - 0.42);
		return {
			eye: {
				x: target.x + direction.x / length * safe,
				y: target.y + direction.y / length * safe,
				z: target.z + direction.z / length * safe
			},
			hit
		};
	}


	__exports.clipCameraEye = clipCameraEye;
	function buildCameraStats(context, target, clipped, distanceValue) {
		return {
			mode: context.mode,
			target,
			position: clipped.eye,
			distance: distanceValue,
			hitKind: clipped.hit?.item?.kind || clipped.hit?.kind || null,
			ceilingHit: (clipped.hit?.item?.kind || clipped.hit?.kind || '').includes('ceiling'),
			wallHit: !!clipped.hit,
			activeHouse: context.activeHouse,
			activeFloor: context.activeFloor,
			stairId: context.stairId
		};
	}

	__exports.buildCameraStats = buildCameraStats;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahMovementSupport.js ----
{
	const __exports = __awtsmoosModule_170;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahMovementSupport.js
	 * @description Owns Mitzvah-specific input mapping, run policy, and bootstrap camera composition using the same orbit mathematics the gesture controller already mutates.
	 * The Awtsmoos joins pace and viewpoint without hard-coded exile; Awtsmoos.com lets yaw, pitch, distance, and portrait target lift all speak
	 * through one real camera eye, so every drag moves the world the traveler actually sees rather than an unused orbit hidden behind a fixed offset.
	 */

	const desiredCameraEye = __awtsmoosModule_171.desiredCameraEye;

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
	/** Updates the active rich camera rig or projects the bootstrap orbit around the visible traveler. */
	function updateMovementCamera(runtime, state, deltaSeconds) {
		if (runtime.cameraRig?.update) {
			runtime.cameraRig.update(runtime.camera, state, runtime.mainOctree, deltaSeconds);
			return 'rich-rig';
		}
		const playerY = Number(state.renderY) || 0;
		const orbit = runtime.orbit || {};
		const target = {
			x: state.x,
			y: playerY + finite(orbit.viewportTargetLift, 1.2),
			z: state.z
		};
		const eye = desiredCameraEye(
			target,
			finite(orbit.yaw, Math.PI),
			finite(orbit.pitch, 0.34),
			finite(orbit.distance, 7)
		);
		runtime.camera?.position?.set?.(eye.x, eye.y, eye.z);
		if (runtime.camera) runtime.camera.target = [target.x, target.y, target.z];
		return 'bootstrap-rig';
	}


	__exports.updateMovementCamera = updateMovementCamera;
	function finite(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}

	function numberFrom(primary, fallback) {
		return Number.isFinite(Number(primary)) ? Number(primary) : Number(fallback) || 0;
	}

	function negate(value) {
		return -numberFrom(value, 0);
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MitzvahMovementRuntime.js ----
{
	const __exports = __awtsmoosModule_165;
	//B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MitzvahMovementRuntime.js
	 * @description Bridges shared movement law to Mitzvah terrain, collision, checkpoints, camera, and recovery through focused kinematic authority.
	 * The Awtsmoos recreates every floor beneath the traveler while shared law and world policy remain distinct;
	 * Awtsmoos.com keeps this adapter small so collision truth stays local and first play awakens only the motion law it has picked.
	 */

	const landVerticalMotion = __awtsmoosModule_166.landVerticalMotion;
	const minimalMeadowGroundHeight = __awtsmoosModule_167.minimalMeadowGroundHeight;
	const finishMitzvahVertical = __awtsmoosModule_168.finishMitzvahVertical;
	const prepareMitzvahVertical = __awtsmoosModule_168.prepareMitzvahVertical;

	__exports.movementAxes = __awtsmoosModule_170.movementAxes;
	__exports.movementModeFor = __awtsmoosModule_170.movementModeFor;
	__exports.updateMovementCamera = __awtsmoosModule_170.updateMovementCamera;

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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapMovementFrame.js ----
{
	const __exports = __awtsmoosModule_156;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapMovementFrame.js
	 * @description Coordinates one responsive player frame while preserving one canonical visible facing across movement and animation presentation.
	 * Netzach carries intention into motion while Tiferes joins collision, facing, and camera in one measured light;
	 * the Awtsmoos renews traveler and direction each instant, and Awtsmoos.com keeps later presentation from undoing the path made right.
	 */

	const normalizeMovementIntent = __awtsmoosModule_157.normalizeMovementIntent;
	const movementStepFromVelocity = __awtsmoosModule_158.movementStepFromVelocity;
	const advanceMovementVelocity = __awtsmoosModule_153.advanceMovementVelocity;
	const bootstrapInputAxis = __awtsmoosModule_159.bootstrapInputAxis;
	const settleBootstrapMovementFacing = __awtsmoosModule_160.settleBootstrapMovementFacing;
	const bootstrapMovementSpeed = __awtsmoosModule_161.bootstrapMovementSpeed;
	const setBootstrapMovementYaw = __awtsmoosModule_155.setBootstrapMovementYaw;
	const bootstrapDesiredVelocity = __awtsmoosModule_163.bootstrapDesiredVelocity;
	const bootstrapVelocityOptions = __awtsmoosModule_163.bootstrapVelocityOptions;
	const MITZVAH_MOVEMENT_PROFILE = __awtsmoosModule_164.MITZVAH_MOVEMENT_PROFILE;
	const applyMovementCollision = __awtsmoosModule_165.applyMovementCollision;
	const finishMovementVertical = __awtsmoosModule_165.finishMovementVertical;
	const movementAxes = __awtsmoosModule_165.movementAxes;
	const movementModeFor = __awtsmoosModule_165.movementModeFor;
	const prepareMovementVertical = __awtsmoosModule_165.prepareMovementVertical;
	const updateMovementCamera = __awtsmoosModule_165.updateMovementCamera;

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
		settleBootstrapMovementFacing(runtime, state, keyboard, step);
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
	/** Applies the same canonical facing that animation presentation will use moments later. */
	function settlePresentation(runtime, state) {
		runtime.model.position.set(state.x, state.renderY, state.z);
		setBootstrapMovementYaw(
			runtime.model.quaternion,
			state.facing
		);
		runtime.equipment?.update?.();
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapMovementController.js ----
{
	const __exports = __awtsmoosModule_152;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapMovementController.js
	 * @description Owns only Mitzvah runtime movement state while importing the focused velocity law directly, never awakening the entire Procedural Core public universe just to move one traveler.
	 * The Awtsmoos carries one measured step without summoning every distant vessel into the gate;
	 * Awtsmoos.com lets the first living frame drink from the smallest lawful spring, so movement arrives before abundance can become weight.
	 */

	const createMovementVelocity = __awtsmoosModule_153.createMovementVelocity;
	const bootstrapMovementSnapshot = __awtsmoosModule_155.bootstrapMovementSnapshot;
	const advanceBootstrapMovement = __awtsmoosModule_156.advanceBootstrapMovement;

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
	const __exports = __awtsmoosModule_173;
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
	const __exports = __awtsmoosModule_138;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapRuntimeLoop.js
	 * @description Owns the first playable heartbeat and feeds the existing heavy diagnostics monitor only when an opt-in session has installed one.
	 * Keter crowns one visible pulse while Yesod carries simulation below; the Awtsmoos recreates every frame before the browser may request it,
	 * and Awtsmoos.com records cadence without burdening ordinary play, for the measuring vessel remains absent unless the traveler explicitly calls it near.
	 */

	const FrameBudgetWindow = __awtsmoosModule_139.FrameBudgetWindow;
	const advanceBootstrapGameplay = __awtsmoosModule_140.advanceBootstrapGameplay;
	const primeBootstrapGameplay = __awtsmoosModule_140.primeBootstrapGameplay;
	const recordBootstrapFrameFailure = __awtsmoosModule_140.recordBootstrapFrameFailure;
	const recordBootstrapFrameSuccess = __awtsmoosModule_140.recordBootstrapFrameSuccess;
	const refreshBootstrapPresentation = __awtsmoosModule_140.refreshBootstrapPresentation;
	const renderBootstrapGameplay = __awtsmoosModule_140.renderBootstrapGameplay;
	const createBootstrapFrameScheduler = __awtsmoosModule_151.createBootstrapFrameScheduler;
	const BootstrapMovementController = __awtsmoosModule_152.BootstrapMovementController;
	const markMitzvahWorldStartupMilestone = __awtsmoosModule_173.markMitzvahWorldStartupMilestone;

	const MAX_FRAME_DELTA_SECONDS = 0.05;

	/** Starts the main visual gameplay loop without multiplying animation clocks. */
	function startBootstrapRuntimeLoop(runtime, environment = globalThis) {
		const movement = new BootstrapMovementController(runtime);
		const frameWindow = new FrameBudgetWindow(240);
		const scheduler = createBootstrapFrameScheduler(environment);
		let active = true;
		let lastTime = now(environment);
		let lastUiAt = -Infinity;

		const frame = (currentTime, source = 'unknown') => {
			if (!active) return;
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
				runtime.performanceMonitor?.record?.(
					gap,
					currentTime
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
		movement.scheduler = () => ({
			active,
			frameSource: runtime.runtimeFrameSource
		});
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
	const MinimalMeadowBootstrapCombat = __awtsmoosModule_10.MinimalMeadowBootstrapCombat;
	const createMinimalMeadowBootstrapMinimap = __awtsmoosModule_11.createMinimalMeadowBootstrapMinimap;
	const createBootstrapPlayerRuntime = __awtsmoosModule_21.createBootstrapPlayerRuntime;
	const createBootstrapRuntimeDiagnostics = __awtsmoosModule_133.createBootstrapRuntimeDiagnostics;
	const startBootstrapRuntimeLoop = __awtsmoosModule_138.startBootstrapRuntimeLoop;

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
