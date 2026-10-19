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

const __awtsmoosModule_1 = Object.create(null);

const __awtsmoosModule_6 = Object.create(null);

const __awtsmoosModule_7 = Object.create(null);

const __awtsmoosModule_5 = Object.create(null);

const __awtsmoosModule_4 = Object.create(null);

const __awtsmoosModule_3 = Object.create(null);

const __awtsmoosModule_8 = Object.create(null);

const __awtsmoosModule_10 = Object.create(null);

const __awtsmoosModule_11 = Object.create(null);

const __awtsmoosModule_9 = Object.create(null);

const __awtsmoosModule_13 = Object.create(null);

const __awtsmoosModule_14 = Object.create(null);

const __awtsmoosModule_12 = Object.create(null);

const __awtsmoosModule_2 = Object.create(null);

const __awtsmoosModule_17 = Object.create(null);

const __awtsmoosModule_18 = Object.create(null);

const __awtsmoosModule_19 = Object.create(null);

const __awtsmoosModule_16 = Object.create(null);

const __awtsmoosModule_21 = Object.create(null);

const __awtsmoosModule_22 = Object.create(null);

const __awtsmoosModule_20 = Object.create(null);

const __awtsmoosModule_23 = Object.create(null);

const __awtsmoosModule_24 = Object.create(null);

const __awtsmoosModule_26 = Object.create(null);

const __awtsmoosModule_25 = Object.create(null);

const __awtsmoosModule_15 = Object.create(null);

const __awtsmoosModule_28 = Object.create(null);

const __awtsmoosModule_33 = Object.create(null);

const __awtsmoosModule_32 = Object.create(null);

const __awtsmoosModule_31 = Object.create(null);

const __awtsmoosModule_34 = Object.create(null);

const __awtsmoosModule_35 = Object.create(null);

const __awtsmoosModule_43 = Object.create(null);

const __awtsmoosModule_44 = Object.create(null);

const __awtsmoosModule_45 = Object.create(null);

const __awtsmoosModule_46 = Object.create(null);

const __awtsmoosModule_42 = Object.create(null);

const __awtsmoosModule_47 = Object.create(null);

const __awtsmoosModule_48 = Object.create(null);

const __awtsmoosModule_41 = Object.create(null);

const __awtsmoosModule_49 = Object.create(null);

const __awtsmoosModule_50 = Object.create(null);

const __awtsmoosModule_51 = Object.create(null);

const __awtsmoosModule_40 = Object.create(null);

const __awtsmoosModule_39 = Object.create(null);

const __awtsmoosModule_38 = Object.create(null);

const __awtsmoosModule_53 = Object.create(null);

const __awtsmoosModule_55 = Object.create(null);

const __awtsmoosModule_54 = Object.create(null);

const __awtsmoosModule_52 = Object.create(null);

const __awtsmoosModule_37 = Object.create(null);

const __awtsmoosModule_56 = Object.create(null);

const __awtsmoosModule_57 = Object.create(null);

const __awtsmoosModule_58 = Object.create(null);

const __awtsmoosModule_36 = Object.create(null);

const __awtsmoosModule_30 = Object.create(null);

const __awtsmoosModule_29 = Object.create(null);

const __awtsmoosModule_59 = Object.create(null);

const __awtsmoosModule_27 = Object.create(null);

const __awtsmoosModule_61 = Object.create(null);

const __awtsmoosModule_63 = Object.create(null);

const __awtsmoosModule_64 = Object.create(null);

const __awtsmoosModule_62 = Object.create(null);

const __awtsmoosModule_60 = Object.create(null);

const __awtsmoosModule_65 = Object.create(null);

const __awtsmoosModule_66 = Object.create(null);

const __awtsmoosModule_69 = Object.create(null);

const __awtsmoosModule_70 = Object.create(null);

const __awtsmoosModule_71 = Object.create(null);

const __awtsmoosModule_72 = Object.create(null);

const __awtsmoosModule_74 = Object.create(null);

const __awtsmoosModule_75 = Object.create(null);

const __awtsmoosModule_73 = Object.create(null);

const __awtsmoosModule_76 = Object.create(null);

const __awtsmoosModule_68 = Object.create(null);

const __awtsmoosModule_67 = Object.create(null);

const __awtsmoosModule_77 = Object.create(null);

const __awtsmoosModule_0 = Object.create(null);

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/ui/AwtsmoosEventBus.js ----
{
	const __exports = __awtsmoosModule_1;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file AwtsmoosEventBus.js
	 * @description Carries small gameplay intentions between buttons, runtime systems, and diagnostics.
	 * RESPONSIBILITY: subscribe, unsubscribe, emit, and retain a bounded recent event history.
	 * NON-RESPONSIBILITY: this bus does not interpret events or own gameplay state.
	 * ARCHITECTURE: Yesod transmits intent while Malchus receives it in concrete runtime systems.
	 * OROS AND KEILIM: intention is ohr; event names, details, and listeners are finite keilim.
	 * The Awtsmoos creates sender, message, and receiver anew; Awtsmoos.com keeps those vessels
	 * readable so camera switches and every other command remain inspectable rather than compressed.
	 */

	const HISTORY_LIMIT = 24;

	class AwtsmoosEventBus {
		constructor() {
			this.listeners = new Map();
			this.history = [];
		}

		on(type, listener) {
			const listeners = this.listeners.get(type) || [];
			listeners.push(listener);
			this.listeners.set(type, listeners);
			return () => this.off(type, listener);
		}

		off(type, listener) {
			const listeners = this.listeners.get(type) || [];
			this.listeners.set(
				type,
				listeners.filter(candidate => candidate !== listener)
			);
		}

		emit(type, detail = {}) {
			this.history.unshift({
				at: currentTime(),
				detail,
				type
			});
			this.history.length = Math.min(HISTORY_LIMIT, this.history.length);
			for (const listener of this.listeners.get(type) || []) {
				listener(detail);
			}
			if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
				window.dispatchEvent(new CustomEvent(`Awtsmoos:${type}`, { detail }));
			}
		}
	}


	__exports.AwtsmoosEventBus = AwtsmoosEventBus;
	function currentTime() {
		return typeof performance !== 'undefined'
			? performance.now()
			: Date.now();
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalHouseArchetypes.js ----
{
	const __exports = __awtsmoosModule_6;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file CanonicalHouseArchetypes.js
	 * @description Defines varied, slope-aware architectural families for H10-H27.
	 */

	const FORMER_BASE_VOLUME = 7.6 * 5.9 * 5.5;
	const PLAYER_REFERENCE_VOLUME = 0.61;

	const ARCHETYPES = Object.freeze({
		'family-house': preset(14.6, 11.4, 2, 3.25, 4.2, ['entry', 'kitchen-dining', 'living-room', 'bedroom', 'study']),
		'guest-house': preset(17.2, 12.8, 2, 3.35, 4.8, ['entry', 'communal-room', 'kitchen-dining', 'guest-bedroom', 'guest-bedroom', 'Torah-library']),
		'hillside-split-level': preset(12.8, 10.2, 2, 3.15, 3.8, ['entry', 'living-room', 'kitchen-dining', 'bedroom', 'storage-room']),
		'merchant-shop': preset(13.8, 10.8, 2, 3.3, 4.1, ['shop', 'storage-room', 'kitchen-dining', 'living-room', 'bedroom']),
		'small-stone-cottage': preset(11.4, 9.2, 1, 3.45, 3.3, ['entry', 'living-room', 'kitchen-dining', 'bedroom']),
		'workshop-barn': preset(15.6, 12.2, 1, 3.9, 3.7, ['workshop', 'storage-room', 'kitchen-dining', 'study'])
	});

	function canonicalHouseArchitecture(archetype, variant = 0) {
		const source = ARCHETYPES[archetype];
		if (!source) throw new Error(`Unknown canonical house archetype: ${archetype}`);
		const safeVariant = Math.abs(Math.trunc(Number(variant) || 0));
		const width = source.width + safeVariant % 3 * 0.55;
		const depth = source.depth + safeVariant % 2 * 0.45;
		const storyHeight = source.storyHeight + safeVariant % 2 * 0.08;
		const wallHeight = source.stories * storyHeight;
		const volume = width * depth * wallHeight;
		return Object.freeze({
			archetype,
			balcony: source.stories > 1 && safeVariant % 3 !== 1,
			chimney: archetype !== 'workshop-barn' || safeVariant % 2 === 0,
			depth,
			expansionRatio: volume / FORMER_BASE_VOLUME,
			foundationStyle: safeVariant % 2 ? 'stepped-stone' : 'retaining-plinth',
			gardenType: ['herbs', 'flowers', 'orchard-edge'][safeVariant % 3],
			minimumExpansion: 1,
			porch: archetype !== 'hillside-split-level' || safeVariant % 2 === 0,
			roofMaterial: safeVariant % 3 === 2 ? 'clay-tile' : 'slate',
			roofRise: source.roofRise + safeVariant % 3 * 0.22,
			roomTypes: Object.freeze([...source.roomTypes]),
			stories: source.stories,
			storyHeight,
			volume,
			volumeRatio: volume / PLAYER_REFERENCE_VOLUME,
			wallHeight,
			width,
			windowPattern: ['paired', 'irregular', 'deep-set'][safeVariant % 3]
		});
	}


	__exports.canonicalHouseArchitecture = canonicalHouseArchitecture;
	function canonicalHouseArchetypes() {
		return Object.keys(ARCHETYPES);
	}


	__exports.canonicalHouseArchetypes = canonicalHouseArchetypes;
	function preset(width, depth, stories, storyHeight, roofRise, roomTypes) {
		return Object.freeze({ depth, roofRise, roomTypes: Object.freeze(roomTypes), stories, storyHeight, width });
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageHouseEntryPolicy.js ----
{
	const __exports = __awtsmoosModule_7;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file VillageHouseEntryPolicy.js
	 * @description Derives one deterministic facade-to-path approach from real cottage dimensions.
	 * The Awtsmoos leads every dwelling from inner room to outer road in measured grace;
	 * Awtsmoos.com keeps threshold, drainage, opening, and yaw aligned to one architectural face.
	 */

	const FACADE_RATIO = 0.515;
	const FACADE_OVERLAP = 0.18;
	const BASE_APPROACH_LENGTH = 3.4;

	function canonicalHouseEntry(architecture, variant = 0) {
		const safeVariant = Math.abs(Math.trunc(Number(variant) || 0));
		const facadeZ = architecture.depth * FACADE_RATIO;
		const length = BASE_APPROACH_LENGTH + safeVariant % 3 * 0.18;
		const width = Math.max(
			2.2,
			Math.min(3.6, architecture.width * 0.22)
		);
		const innerZ = facadeZ - FACADE_OVERLAP;
		const outerZ = innerZ + length;
		return Object.freeze({
			centerZ: (innerZ + outerZ) / 2,
			drainageZ: outerZ + 0.24,
			facadeZ,
			innerZ,
			length,
			outerZ,
			width
		});
	}


	__exports.canonicalHouseEntry = canonicalHouseEntry;
	function houseEntryWorldPoint(house, localZ) {
		const cosine = Math.cos(house.yaw);
		const sine = Math.sin(house.yaw);
		return Object.freeze({
			x: house.x + localZ * sine,
			z: house.z + localZ * cosine
		});
	}


	__exports.houseEntryWorldPoint = houseEntryWorldPoint;
	function houseEntryEvidence(house) {
		const entry = house.entry || canonicalHouseEntry(house, house.variant);
		return Object.freeze({
			facade: houseEntryWorldPoint(house, entry.facadeZ),
			houseId: house.id,
			inner: houseEntryWorldPoint(house, entry.innerZ),
			outer: houseEntryWorldPoint(house, entry.outerZ),
			yaw: house.yaw
		});
	}

	__exports.houseEntryEvidence = houseEntryEvidence;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillageHouses.js ----
{
	const __exports = __awtsmoosModule_5;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file CanonicalVillageHouses.js
	 * @description Gives H10-H27 stable sites, distinct programs, and measured entry approaches.
	 * The Awtsmoos seats every home upon one appointed place and opens its face toward the road;
	 * Awtsmoos.com preserves immutable architecture and entry truth before any renderer bears the load.
	 */

	const canonicalHouseArchitecture = __awtsmoosModule_6.canonicalHouseArchitecture;
	const canonicalHouseEntry = __awtsmoosModule_7.canonicalHouseEntry;

	const CANONICAL_VILLAGE_HOUSES = Object.freeze([
		house('H10', 'arrival-meadow', 'small-stone-cottage', -50, 116, 1.3, 0),
		house('H11', 'arrival-meadow', 'family-house', 54, 106, -1.24, 1),
		house('H12', 'beis-chabad-terrace', 'guest-house', -102, 78, 0.62, 2),
		house('H13', 'beis-chabad-terrace', 'hillside-split-level', -64, 80, -0.48, 3),
		house('H14', 'market-quarter', 'merchant-shop', -88, 34, 0.82, 4),
		house('H15', 'market-quarter', 'merchant-shop', -48, 48, -0.72, 5),
		house('H16', 'market-quarter', 'workshop-barn', -43, 8, 2.46, 6),
		house('H17', 'shul-terrace', 'family-house', -105, -38, 0.68, 7),
		house('H18', 'shul-terrace', 'small-stone-cottage', -62, -62, -0.64, 8),
		house('H19', 'upper-residential', 'hillside-split-level', -40, -103, 0.54, 9),
		house('H20', 'upper-residential', 'family-house', 3, -70, -0.46, 10),
		house('H21', 'north-slope-residential', 'hillside-split-level', 23, -118, 0.38, 11),
		house('H22', 'north-slope-residential', 'family-house', 68, -94, -0.52, 12),
		house('H23', 'east-bank-homes', 'small-stone-cottage', 81, -14, 2.72, 13),
		house('H24', 'east-bank-homes', 'family-house', 106, 28, -2.56, 14),
		house('H25', 'waterfall-portal', 'hillside-split-level', 114, -72, 2.92, 15),
		house('H26', 'farm-terraces', 'workshop-barn', 112, 76, -2.44, 16),
		house('H27', 'riverfront-gardens', 'guest-house', -16, 76, 1.18, 17)
	]);


	__exports.CANONICAL_VILLAGE_HOUSES = CANONICAL_VILLAGE_HOUSES;
	const CANONICAL_HOUSES_BY_ID = Object.freeze(Object.fromEntries(
		CANONICAL_VILLAGE_HOUSES.map(definition => [definition.id, definition])
	));


	__exports.CANONICAL_HOUSES_BY_ID = CANONICAL_HOUSES_BY_ID;
	function minimumCanonicalHouseDistance() {
		let minimum = Infinity;
		for (let first = 0; first < CANONICAL_VILLAGE_HOUSES.length; first += 1) {
			for (let second = first + 1; second < CANONICAL_VILLAGE_HOUSES.length; second += 1) {
				const a = CANONICAL_VILLAGE_HOUSES[first];
				const b = CANONICAL_VILLAGE_HOUSES[second];
				minimum = Math.min(minimum, Math.hypot(a.x - b.x, a.z - b.z));
			}
		}
		return minimum;
	}


	__exports.minimumCanonicalHouseDistance = minimumCanonicalHouseDistance;
	function house(id, districtId, archetype, x, z, yaw, variant) {
		const architecture = canonicalHouseArchitecture(archetype, variant);
		return Object.freeze({
			...architecture,
			districtId,
			entry: canonicalHouseEntry(architecture, variant),
			id,
			number: id,
			variant,
			x,
			yaw,
			z
		});
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapJourneyDestination.js ----
{
	const __exports = __awtsmoosModule_4;
	// B"H
	// Boruch Hashem
	// Blessed is He

	const CANONICAL_HOUSES_BY_ID = __awtsmoosModule_5.CANONICAL_HOUSES_BY_ID;

	/**
	 * @file BootstrapJourneyDestination.js
	 * @description Turns canonical village coordinates into one tiny, truthful compass receipt for first arrival.
	 * The Awtsmoos appoints every home its measured place; Awtsmoos.com lets the traveler see a real direction and distance
	 * instead of hearing about invisible cottages without any spatial answer to the simple human question: where?
	 */

	const FIRST_HOME = CANONICAL_HOUSES_BY_ID.H11;
	const DIRECTIONS = Object.freeze([
		['N', '↑'], ['NE', '↗'], ['E', '→'], ['SE', '↘'],
		['S', '↓'], ['SW', '↙'], ['W', '←'], ['NW', '↖']
	]);

	/** Returns the first real arrival-home navigation receipt from current player position. */
	function firstHomeDestination(state = {}) {
		const x = Number(state.x) || 0;
		const z = Number(state.z) || 0;
		const dx = FIRST_HOME.x - x;
		const dz = FIRST_HOME.z - z;
		const distance = Math.hypot(dx, dz);
		const direction = compassDirection(dx, dz);
		return Object.freeze({
			arrow: direction.arrow,
			direction: direction.label,
			distance: Math.round(distance),
			id: FIRST_HOME.id,
			label: 'first family home',
			x: FIRST_HOME.x,
			z: FIRST_HOME.z
		});
	}


	__exports.firstHomeDestination = firstHomeDestination;
	/** Formats one compact mobile-safe destination line for the journey card. */
	function firstHomeDestinationText(state = {}) {
		const destination = firstHomeDestination(state);
		return `${destination.arrow} ${destination.id} family home · ${destination.distance}m ${destination.direction}`;
	}


	__exports.firstHomeDestinationText = firstHomeDestinationText;
	function compassDirection(dx, dz) {
		const angle = Math.atan2(dx, -dz);
		const normalized = (angle + Math.PI * 2) % (Math.PI * 2);
		const index = Math.round(normalized / (Math.PI / 4)) % 8;
		const [label, arrow] = DIRECTIONS[index];
		return { arrow, label };
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapJourneyGuide.js ----
{
	const __exports = __awtsmoosModule_3;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapJourneyGuide.js
	 * @description Projects first-footstep navigation or canonical quest truth into one compact story beat.
	 * The Awtsmoos appoints both story and place; Awtsmoos.com therefore gives the traveler not only words about distant homes,
	 * but one measured arrow and distance to a real canonical family home until a truer quest or danger takes priority.
	 */

	const firstHomeDestinationText = __awtsmoosModule_4.firstHomeDestinationText;

	const WALK_REVEAL_DISTANCE = 7;
	const JOURNEY_REVEAL_DISTANCE = 22;

	class BootstrapJourneyGuide {
		constructor(runtime) {
			this.runtime = runtime;
			this.origin = positionOf(runtime.state);
		}

		describe() {
			const snapshot = this.runtime.quest?.snapshot?.();
			return snapshot ? questBeat(this.runtime, snapshot) : onboardingBeat(this.runtime, this.origin);
		}
	}


	__exports.BootstrapJourneyGuide = BootstrapJourneyGuide;
	function questBeat(runtime, snapshot) {
		const definition = snapshot.definition || runtime.quest?.definition || {};
		const giver = definition.giver || {};
		const story = definition.story || {};
		const beats = {
			active: () => beat(definition.name || 'The eastern road', snapshot.currentObjective?.description || 'Continue the Shlichus.', progressHint(snapshot)),
			available: () => availableQuestBeat(runtime, definition, giver, story),
			completed: () => beat('Shlichus fulfilled', 'The eastern road breathes again.', 'Measured intention remains with you.'),
			ready: () => beat(definition.name || 'The eastern road', `Return to ${giver.name || 'Reb Mendel'}.`, 'Bring the recovered vessels home.')
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
		if (target) return beat('A presence stirs', `Face ${target} when you are ready.`, 'Stay moving. Act when the opening is clear.');
		const distance = distanceFrom(origin, positionOf(state));
		const destination = firstHomeDestinationText(state);
		if (distance >= JOURNEY_REVEAL_DISTANCE) {
			return beat('The valley opens', 'Reach H11, the first family home.', destination);
		}
		if (distance >= WALK_REVEAL_DISTANCE || state.moving) {
			return beat('The first path', 'Stay on the road toward H11.', destination);
		}
		return beat('The valley wakes', 'Head to the first family home.', `${destination} · Move with the left stick.`);
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
	const __exports = __awtsmoosModule_8;
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
	const __exports = __awtsmoosModule_10;
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
	const __exports = __awtsmoosModule_11;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file DirectWorldContextQuestAction.js
	 * @description Owns the legacy Talk, Begin, and Return behavior as one provider beneath the generic direct-action resolver.
	 * The Awtsmoos lets old quest truth remain whole while new deeds join beside it; Awtsmoos.com keeps giver interaction,
	 * remembered offers, and dedicated meadow completion in one focused vessel instead of swelling the global action router.
	 */

	const directActionState = __awtsmoosModule_10.directActionState;
	const HIDDEN_DIRECT_ACTION = __awtsmoosModule_10.HIDDEN_DIRECT_ACTION;

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
	const __exports = __awtsmoosModule_9;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file DirectWorldContextAction.js
	 * @description Resolves many contextual-action providers into one truthful direct-play deed by explicit priority.
	 * The Awtsmoos contains every possible action without crowding the traveler with every button; Awtsmoos.com lets
	 * Build, Talk, Begin, Return, Learn, Collect, Open, and future providers compete through one tiny stable contract.
	 */

	const HIDDEN_DIRECT_ACTION = __awtsmoosModule_10.HIDDEN_DIRECT_ACTION;
	const DirectWorldContextQuestAction = __awtsmoosModule_11.DirectWorldContextQuestAction;

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
	const __exports = __awtsmoosModule_13;
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
	const __exports = __awtsmoosModule_14;
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
	const __exports = __awtsmoosModule_12;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file ContextActionButton.js
	 * @description Renders one contextual deed and silences its global E shortcut while advanced controls own interaction.
	 * The Awtsmoos reveals action only when purpose reaches the hand, while Awtsmoos.com keeps hidden gameplay from answering beneath an opened inner veil;
	 * one generous touch, one E-key covenant, and one presentation gate preserve simple surface play without accidental advanced-layer travail.
	 */

	const isGameplayInputSuppressed = __awtsmoosModule_13.isGameplayInputSuppressed;
	const isEditableTarget = __awtsmoosModule_14.isEditableTarget;

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
	const __exports = __awtsmoosModule_2;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapControlsHud.js
	 * @description Coordinates one compact journey card and one optional contextual action for direct play.
	 * The Awtsmoos joins story and deed without building a wall between the traveler and sky;
	 * Awtsmoos.com keeps the center world untouched while one objective speaks and one useful action draws nigh.
	 */

	const BootstrapJourneyGuide = __awtsmoosModule_3.BootstrapJourneyGuide;
	const BootstrapControlsHudView = __awtsmoosModule_8.BootstrapControlsHudView;
	const DirectWorldContextAction = __awtsmoosModule_9.DirectWorldContextAction;
	const ContextActionButton = __awtsmoosModule_12.ContextActionButton;

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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowGameplaySaveData.js ----
{
	const __exports = __awtsmoosModule_17;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowGameplaySaveData.js
	 * @description Normalizes stable position, checkpoint, stats, and plain JSON data for gameplay saves.
	 * The Awtsmoos is never contained by numbers or records; Awtsmoos.com keeps only
	 * finite coordinates, bounded resources, plain objects, and one lawful checkpoint witness.
	 */

	function minimalMeadowSaveCheckpoint(runtime) {
		return minimalMeadowSavePosition(
			runtime.movementRecovery?.diagnostics?.().safe
				|| runtime.playerDefeatState?.checkpoint
				|| runtime.state
		);
	}


	__exports.minimalMeadowSaveCheckpoint = minimalMeadowSaveCheckpoint;
	function minimalMeadowSavePosition(value = {}) {
		const position = {
			facing: finite(value.facing),
			x: finite(value.x),
			y: finite(value.y ?? value.renderY),
			z: finite(value.z)
		};
		return Object.values(position).every(Number.isFinite) ? position : null;
	}


	__exports.minimalMeadowSavePosition = minimalMeadowSavePosition;
	function minimalMeadowSaveStats(value = {}) {
		return {
			health: nonnegative(value.health),
			maxHealth: positive(value.maxHealth, 100),
			maxStamina: positive(value.maxStamina, 100),
			stamina: nonnegative(value.stamina)
		};
	}


	__exports.minimalMeadowSaveStats = minimalMeadowSaveStats;
	function minimalMeadowPlainSaveData(value) {
		return value && typeof value === 'object'
			? JSON.parse(JSON.stringify(value))
			: null;
	}


	__exports.minimalMeadowPlainSaveData = minimalMeadowPlainSaveData;
	function finite(value) {
		return Number(value);
	}

	function nonnegative(value) {
		return Math.max(0, Number(value) || 0);
	}

	function positive(value, fallback) {
		const number = Number(value);
		return Number.isFinite(number) && number > 0 ? number : fallback;
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowGameplaySaveSchema.js ----
{
	const __exports = __awtsmoosModule_18;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowGameplaySaveSchema.js
	 * @description Creates, validates, migrates, and applies one plain-data gameplay snapshot.
	 * The Awtsmoos renews every state without becoming stored; Awtsmoos.com keeps
	 * movement, resources, inventory, consumables, loot claims, and vertical memory stable.
	 */

	const minimalMeadowPlainSaveData = __awtsmoosModule_17.minimalMeadowPlainSaveData;
	const minimalMeadowSaveCheckpoint = __awtsmoosModule_17.minimalMeadowSaveCheckpoint;
	const minimalMeadowSavePosition = __awtsmoosModule_17.minimalMeadowSavePosition;
	const minimalMeadowSaveStats = __awtsmoosModule_17.minimalMeadowSaveStats;

	const MINIMAL_MEADOW_GAMEPLAY_SAVE_VERSION = 1;


	__exports.MINIMAL_MEADOW_GAMEPLAY_SAVE_VERSION = MINIMAL_MEADOW_GAMEPLAY_SAVE_VERSION;
	function createMinimalMeadowGameplaySave(runtime, coreMechanics) {
		return Object.freeze({
			checkpoint: minimalMeadowSaveCheckpoint(runtime),
			consumable: coreMechanics.consumables.snapshot(),
			inventory: runtime.inventory?.serializableState?.()
				|| runtime.inventory?.snapshot?.()
				|| null,
			loot: coreMechanics.loot.snapshot(),
			position: minimalMeadowSavePosition(runtime.state),
			savedAt: new Date().toISOString(),
			stats: minimalMeadowSaveStats(runtime.playerStats),
			verticalSlice: runtime.verticalSlice?.snapshot?.() || null,
			version: MINIMAL_MEADOW_GAMEPLAY_SAVE_VERSION
		});
	}


	__exports.createMinimalMeadowGameplaySave = createMinimalMeadowGameplaySave;
	function migrateMinimalMeadowGameplaySave(value) {
		if (!value || typeof value !== 'object') return null;
		if (Number(value.version || 0) !== MINIMAL_MEADOW_GAMEPLAY_SAVE_VERSION) return null;
		const position = minimalMeadowSavePosition(value.position);
		const stats = minimalMeadowSaveStats(value.stats);
		if (!position || !stats) return null;
		return Object.freeze({
			checkpoint: minimalMeadowSavePosition(value.checkpoint) || position,
			consumable: minimalMeadowPlainSaveData(value.consumable),
			inventory: minimalMeadowPlainSaveData(value.inventory),
			loot: minimalMeadowPlainSaveData(value.loot),
			position,
			savedAt: String(value.savedAt || ''),
			stats,
			verticalSlice: minimalMeadowPlainSaveData(value.verticalSlice),
			version: MINIMAL_MEADOW_GAMEPLAY_SAVE_VERSION
		});
	}


	__exports.migrateMinimalMeadowGameplaySave = migrateMinimalMeadowGameplaySave;
	function applyMinimalMeadowGameplaySave(runtime, coreMechanics, save, mode = 'full') {
		if (!save) return false;
		if (save.inventory) runtime.inventory?.restore?.(save.inventory);
		coreMechanics.consumables.restore(save.consumable || {});
		coreMechanics.loot.restore(save.loot || {});
		if (mode === 'handoff') return true;
		Object.assign(runtime.playerStats, save.stats);
		Object.assign(runtime.state, save.position, {
			groundY: save.position.y,
			grounded: true,
			renderY: save.position.y,
			velY: 0
		});
		runtime.model?.position?.set?.(
			save.position.x,
			save.position.y,
			save.position.z
		);
		runtime.movementRecovery?.checkpoint?.(save.checkpoint);
		runtime.bus?.emit?.('profile:state', { ...runtime.playerStats });
		return true;
	}

	__exports.applyMinimalMeadowGameplaySave = applyMinimalMeadowGameplaySave;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowGameplaySaveStorage.js ----
{
	const __exports = __awtsmoosModule_19;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowGameplaySaveStorage.js
	 * @description Reads current and backup gameplay records and writes one validated JSON snapshot at a time.
	 * The Awtsmoos is never contained by memory; Awtsmoos.com keeps finite continuity through
	 * current, previous, corruption fallback, parse truth, and explicit storage failure receipts.
	 */

	const migrateMinimalMeadowGameplaySave = __awtsmoosModule_18.migrateMinimalMeadowGameplaySave;

	const CURRENT_KEY = 'awtsmoos.mitzvah-world.gameplay.v1';
	const BACKUP_KEY = 'awtsmoos.mitzvah-world.gameplay.backup.v1';

	function loadMinimalMeadowGameplaySave(storage) {
		const current = parseRecord(storage?.getItem?.(CURRENT_KEY));
		if (current) return Object.freeze({ record: current, source: 'current' });
		const backup = parseRecord(storage?.getItem?.(BACKUP_KEY));
		return Object.freeze({
			record: backup,
			source: backup ? 'backup' : 'empty'
		});
	}


	__exports.loadMinimalMeadowGameplaySave = loadMinimalMeadowGameplaySave;
	function storeMinimalMeadowGameplaySave(storage, record) {
		if (!storage?.setItem) return false;
		const previous = storage.getItem?.(CURRENT_KEY);
		try {
			if (previous) storage.setItem(BACKUP_KEY, previous);
			storage.setItem(CURRENT_KEY, JSON.stringify(record));
			return true;
		} catch {
			return false;
		}
	}


	__exports.storeMinimalMeadowGameplaySave = storeMinimalMeadowGameplaySave;
	function clearMinimalMeadowGameplaySave(storage) {
		storage?.removeItem?.(CURRENT_KEY);
		storage?.removeItem?.(BACKUP_KEY);
	}


	__exports.clearMinimalMeadowGameplaySave = clearMinimalMeadowGameplaySave;
	function parseRecord(value) {
		if (!value) return null;
		try {
			return migrateMinimalMeadowGameplaySave(JSON.parse(value));
		} catch {
			return null;
		}
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapGameplayContinuity.js ----
{
	const __exports = __awtsmoosModule_16;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file BootstrapGameplayContinuity.js
	 * @description Persists only Blank Meadow first-control state without constructing rich mechanics.
	 * The Awtsmoos renews the traveler without being stored; Awtsmoos.com preserves the finite trail,
	 * carrying position, checkpoint, stats, and inventory while leaving richer saved vessels undisturbed.
	 */

	const minimalMeadowSaveCheckpoint = __awtsmoosModule_17.minimalMeadowSaveCheckpoint;
	const minimalMeadowSavePosition = __awtsmoosModule_17.minimalMeadowSavePosition;
	const minimalMeadowSaveStats = __awtsmoosModule_17.minimalMeadowSaveStats;
	const MINIMAL_MEADOW_GAMEPLAY_SAVE_VERSION = __awtsmoosModule_18.MINIMAL_MEADOW_GAMEPLAY_SAVE_VERSION;
	const loadMinimalMeadowGameplaySave = __awtsmoosModule_19.loadMinimalMeadowGameplaySave;
	const storeMinimalMeadowGameplaySave = __awtsmoosModule_19.storeMinimalMeadowGameplaySave;

	class BootstrapGameplayContinuity {
		constructor(runtime, environment = globalThis) {
			this.runtime = runtime;
			this.storage = environment?.localStorage;
			const loaded = loadMinimalMeadowGameplaySave(this.storage);
			this.record = loaded.record;
			this.source = loaded.source;
			this.lastSave = null;
			this.restore();
			this.stopInventory = runtime.inventory?.onChange?.(() => this.save('inventory')) || null;
			this.stopRecovery = runtime.bus?.on?.('movement:recovered', () => this.save('recovery')) || null;
		}

		restore() {
			if (!this.record) return false;
			const { checkpoint, inventory, position, stats } = this.record;
			if (inventory) this.runtime.inventory?.restore?.(inventory);
			Object.assign(this.runtime.playerStats || {}, stats || {});
			Object.assign(this.runtime.state, position, {
				groundY: position.y,
				grounded: true,
				renderY: position.y,
				velY: 0
			});
			this.runtime.model?.position?.set?.(position.x, position.y, position.z);
			this.runtime.movementRecovery?.checkpoint?.(checkpoint || position);
			this.runtime.bus?.emit?.('profile:state', { ...this.runtime.playerStats });
			return true;
		}

		save(reason = 'state-change') {
			const preserved = this.record || {};
			const record = Object.freeze({
				checkpoint: minimalMeadowSaveCheckpoint(this.runtime),
				consumable: preserved.consumable || null,
				inventory: this.runtime.inventory?.serializableState?.() || null,
				loot: preserved.loot || null,
				position: minimalMeadowSavePosition(this.runtime.state),
				savedAt: new Date().toISOString(),
				stats: minimalMeadowSaveStats(this.runtime.playerStats),
				verticalSlice: preserved.verticalSlice || null,
				version: MINIMAL_MEADOW_GAMEPLAY_SAVE_VERSION
			});
			const stored = storeMinimalMeadowGameplaySave(this.storage, record);
			if (stored) this.record = record;
			this.lastSave = Object.freeze({ reason, savedAt: record.savedAt, stored });
			return stored;
		}

		diagnostics() {
			return Object.freeze({
				lastSave: this.lastSave,
				restored: Boolean(this.record),
				source: this.source
			});
		}

		destroy() {
			this.stopInventory?.();
			this.stopRecovery?.();
		}
	}

	__exports.BootstrapGameplayContinuity = BootstrapGameplayContinuity;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowTeachingQuestRuntime.js ----
{
	const __exports = __awtsmoosModule_21;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowTeachingQuestRuntime.js
	 * @description Teaches the vertical-slice grammar through actual combat events rather than chores.
	 * The Awtsmoos lets observation become knowledge and knowledge become deliberate deed;
	 * Awtsmoos.com makes sentinel, scribe, reaction, support, and boss mastery one readable road.
	 */

	const STEPS = Object.freeze([
		'observe-sentinel',
		'open-sentinel-guard',
		'observe-scribe-cast',
		'counter-scribe',
		'trigger-reaction',
		'use-stabilizing-cleanse',
		'reach-kedem-concealment',
		'defeat-kedem-warden',
		'claim-measured-intent'
	]);

	class MinimalMeadowTeachingQuestRuntime {
		constructor(runtime, saved = {}) {
			this.runtime = runtime;
			this.completed = Boolean(saved.completed);
			this.index = Math.max(0, Math.min(STEPS.length, Number(saved.index || 0)));
			this.unsubscribers = this.bind();
		}

		bind() {
			return [
				this.runtime.bus.on('enemy:alert', event => this.matchEnemy(event, 'warden', 0)),
				this.runtime.bus.on('combat:posture', event => this.matchReason(event, 'broken', 1)),
				this.runtime.bus.on('enemy:cast', event => this.matchEnemy(event, 'cantor', 2)),
				this.runtime.bus.on('enemy:cast-interrupted', () => this.advance(3)),
				this.runtime.bus.on('combat:reaction', event => this.matchReaction(event, 4)),
				this.runtime.bus.on('combat:cleanse', () => this.advance(5)),
				this.runtime.bus.on('boss:phase', event => this.matchPhase(event, 3, 6)),
				this.runtime.bus.on('boss:defeated', () => this.advance(7)),
				this.runtime.bus.on('reward:granted', () => this.advance(8))
			];
		}

		matchEnemy(event = {}, archetype, step) {
			const value = event.archetype || event.profile?.archetype || event.enemy?.archetype;
			if (value === archetype) this.advance(step);
		}

		matchReason(event = {}, reason, step) {
			if (event.reason === reason) this.advance(step);
		}

		matchReaction(event = {}, step) {
			if (event.id && event.id !== 'none') this.advance(step);
		}

		matchPhase(event = {}, phase, step) {
			if (Number(event.phase) >= phase) this.advance(step);
		}

		advance(expectedIndex) {
			if (this.completed || this.index !== expectedIndex) return this.snapshot();
			this.index += 1;
			this.completed = this.index >= STEPS.length;
			const snapshot = this.snapshot();
			this.runtime.bus.emit(this.completed ? 'teaching-quest:completed' : 'teaching-quest:advanced', snapshot);
			return snapshot;
		}

		snapshot() {
			return Object.freeze({
				completed: this.completed,
				index: this.index,
				nextStep: this.completed ? null : STEPS[this.index],
				progress: Number((this.index / STEPS.length).toFixed(3)),
				steps: STEPS
			});
		}

		destroy() {
			for (const unsubscribe of this.unsubscribers) unsubscribe();
		}
	}

	__exports.MinimalMeadowTeachingQuestRuntime = MinimalMeadowTeachingQuestRuntime;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowVerticalSlicePersistence.js ----
{
	const __exports = __awtsmoosModule_22;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowVerticalSlicePersistence.js
	 * @description Saves and migrates boss, quest, insight, reward, recovery, and accessibility state.
	 * The Awtsmoos renews memory without making yesterday sovereign over today; Awtsmoos.com
	 * validates every bounded field, exposes corruption, and preserves exact-once claims on return.
	 */

	const STORAGE_KEY = 'awtsmoos.mitzvah-world.vertical-slice.v1';
	const SCHEMA_VERSION = 2;

	class MinimalMeadowVerticalSlicePersistence {
		constructor(environment = globalThis) {
			this.storage = environment.localStorage || null;
		}

		load() {
			if (!this.storage) return initialState('storage-unavailable');
			try {
				const parsed = JSON.parse(
					this.storage.getItem(STORAGE_KEY) || 'null'
				);
				return migrate(parsed);
			} catch (error) {
				return initialState(error?.message || 'corrupt-record');
			}
		}

		save(state = {}) {
			const record = serializable(state);
			if (!this.storage) return record;
			try {
				this.storage.setItem(STORAGE_KEY, JSON.stringify(record));
			} catch (error) {
				return {
					...record,
					saveError: error?.message || String(error)
				};
			}
			return record;
		}

		clear() {
			this.storage?.removeItem?.(STORAGE_KEY);
		}
	}


	__exports.MinimalMeadowVerticalSlicePersistence = MinimalMeadowVerticalSlicePersistence;
	function migrate(value) {
		if (!value || typeof value !== 'object') {
			return initialState('missing-record');
		}
		return serializable({
			accessibility: value.accessibility,
			boss: value.boss,
			claims: value.claims,
			daas: value.daas,
			quest: value.quest,
			recovery: value.recovery,
			reward: value.reward
		});
	}

	function serializable(value = {}) {
		return {
			accessibility: plain(value.accessibility),
			boss: plain(value.boss),
			claims: uniqueStrings(value.claims),
			daas: plain(value.daas),
			quest: plain(value.quest),
			recovery: plain(value.recovery),
			reward: plain(value.reward),
			savedAt: Date.now(),
			schemaVersion: SCHEMA_VERSION
		};
	}

	function initialState(loadError = null) {
		return {
			accessibility: {},
			boss: {},
			claims: [],
			daas: {},
			loadError,
			quest: {},
			recovery: {},
			reward: {},
			schemaVersion: SCHEMA_VERSION
		};
	}

	function plain(value) {
		return value && typeof value === 'object'
			? JSON.parse(JSON.stringify(value))
			: {};
	}

	function uniqueStrings(value) {
		return Array.isArray(value)
			? [...new Set(value.filter(item => typeof item === 'string'))]
			: [];
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapVerticalSliceContinuity.js ----
{
	const __exports = __awtsmoosModule_20;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file BootstrapVerticalSliceContinuity.js
	 * @description Restores and persists the real Blank Meadow teaching quest without rich boss systems.
	 * The Awtsmoos is beyond every remembered step; Awtsmoos.com carries one honest finite thread,
	 * preserving unowned boss, Daas, reward, claim, and accessibility vessels while quest and recovery proceed.
	 */

	const MinimalMeadowTeachingQuestRuntime = __awtsmoosModule_21.MinimalMeadowTeachingQuestRuntime;
	const MinimalMeadowVerticalSlicePersistence = __awtsmoosModule_22.MinimalMeadowVerticalSlicePersistence;

	class BootstrapVerticalSliceContinuity {
		constructor(runtime, environment = globalThis) {
			this.runtime = runtime;
			this.persistence = new MinimalMeadowVerticalSlicePersistence(environment);
			this.record = this.persistence.load();
			this.lastSave = null;
			runtime.teachingQuest = new MinimalMeadowTeachingQuestRuntime(
				runtime,
				this.record.quest
			);
			this.stopAdvanced = runtime.bus?.on?.(
				'teaching-quest:advanced',
				() => this.save('quest-advanced')
			) || null;
			this.stopCompleted = runtime.bus?.on?.(
				'teaching-quest:completed',
				() => this.save('quest-completed')
			) || null;
			this.stopRecovery = runtime.bus?.on?.(
				'movement:recovered',
				() => this.save('recovery')
			) || null;
		}

		save(reason = 'state-change') {
			const record = this.persistence.save({
				...this.record,
				quest: this.runtime.teachingQuest?.snapshot?.() || this.record.quest,
				recovery: this.runtime.movementRecovery?.diagnostics?.()
					|| this.record.recovery
			});
			this.record = record;
			this.lastSave = Object.freeze({
				reason,
				saveError: record.saveError || null,
				savedAt: record.savedAt
			});
			return !record.saveError;
		}

		diagnostics() {
			return Object.freeze({
				lastSave: this.lastSave,
				loadError: this.record.loadError || null,
				quest: this.runtime.teachingQuest?.snapshot?.() || null,
				recovery: this.runtime.movementRecovery?.diagnostics?.() || null
			});
		}

		destroy() {
			this.stopAdvanced?.();
			this.stopCompleted?.();
			this.stopRecovery?.();
			this.runtime.teachingQuest?.destroy?.();
		}
	}

	__exports.BootstrapVerticalSliceContinuity = BootstrapVerticalSliceContinuity;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowBootstrapInventory.js ----
{
	const __exports = __awtsmoosModule_23;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowBootstrapInventory.js
	 * @description Provides a small transactional inventory until the rich catalog store upgrades it.
	 * The Awtsmoos gives possession a truthful finite vessel before distant catalogs arrive;
	 * Awtsmoos.com preserves quantities, equipment, listeners, snapshots, and exact replacement state.
	 */

	class MinimalMeadowBootstrapInventory {
		constructor() {
			this.items = {};
			this.equipment = {};
			this.listeners = new Set();
			this.bootstrap = true;
		}

		onChange(listener) {
			this.listeners.add(listener);
			return () => this.listeners.delete(listener);
		}

		add(itemId, quantity = 1) {
			this.items[itemId] = this.quantity(itemId)
				+ Math.max(0, Number(quantity) || 0);
			return this.publish();
		}

		remove(itemId, quantity = 1) {
			this.items[itemId] = Math.max(
				0,
				this.quantity(itemId) - Math.max(0, Number(quantity) || 0)
			);
			return this.publish();
		}

		quantity(itemId) {
			return Number(this.items[itemId] || 0);
		}

		owns(itemId) {
			return this.quantity(itemId) > 0;
		}

		equip(itemId, slot = 'hand') {
			if (!this.owns(itemId)) this.add(itemId, 1);
			this.equipment[slot] = itemId;
			return this.publish();
		}

		unequip(slot) {
			delete this.equipment[slot];
			return this.publish();
		}

		restore(saved = {}) {
			this.items = { ...(saved.items || {}) };
			this.equipment = { ...(saved.equipment || {}) };
			return this.publish();
		}

		snapshot() {
			return Object.freeze({
				appearance: Object.freeze({}),
				equipment: Object.freeze({ ...this.equipment }),
				items: Object.freeze({ ...this.items })
			});
		}

		serializableState() {
			return JSON.parse(JSON.stringify(this.snapshot()));
		}

		publish() {
			const snapshot = this.snapshot();
			for (const listener of this.listeners) listener(snapshot);
			return snapshot;
		}
	}

	__exports.MinimalMeadowBootstrapInventory = MinimalMeadowBootstrapInventory;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowBootstrapWorldState.js ----
{
	const __exports = __awtsmoosModule_24;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowBootstrapWorldState.js
	 * @description Provides small quest, recovery, and streaming vessels before rich world systems upgrade them.
	 * The Awtsmoos lets purpose, return, and locality remain truthful at first control;
	 * Awtsmoos.com keeps every facade functional, inspectable, replaceable, and free of fabricated progress.
	 */

	class MinimalMeadowBootstrapQuestStore {
		constructor(runtime) {
			this.runtime = runtime;
			this.events = [];
			this.listeners = new Set();
			this.unsubscribe = runtime.bus.on('quest:event', event => {
				this.record(event);
			});
		}

		record(event = {}) {
			this.events.push(Object.freeze({ ...event }));
			this.events = this.events.slice(-32);
			return this.publish();
		}

		onChange(listener) {
			this.listeners.add(listener);
			return () => this.listeners.delete(listener);
		}

		publish() {
			const snapshot = this.snapshot();
			for (const listener of this.listeners) listener(snapshot);
			return snapshot;
		}

		snapshot() {
			return Object.freeze({
				bootstrap: true,
				events: Object.freeze([...this.events]),
				ready: true
			});
		}

		destroy() {
			this.unsubscribe?.();
			this.listeners.clear();
		}
	}


	__exports.MinimalMeadowBootstrapQuestStore = MinimalMeadowBootstrapQuestStore;
	class MinimalMeadowBootstrapRecovery {
		constructor(runtime) {
			this.runtime = runtime;
			this.count = 0;
		}

		unstuck() {
			this.count += 1;
			return this.runtime.movementRecovery?.unstuck?.(
				this.runtime.state
			) || false;
		}

		returnCheckpoint() {
			this.count += 1;
			return this.runtime.movementRecovery?.returnToCheckpoint?.(
				this.runtime.state
			) || false;
		}

		diagnostics() {
			return Object.freeze({
				bootstrap: true,
				count: this.count
			});
		}

		destroy() {}
	}


	__exports.MinimalMeadowBootstrapRecovery = MinimalMeadowBootstrapRecovery;
	class MinimalMeadowBootstrapStreaming {
		constructor() {
			this.activeCells = new Set(['0:0']);
			this.regionId = 'lower-meadow';
		}

		update(position = {}) {
			const x = Math.floor(Number(position.x || 0) / 64);
			const z = Math.floor(Number(position.z || 0) / 64);
			this.activeCells = new Set([`${x}:${z}`]);
			return this.diagnostics();
		}

		diagnostics() {
			return Object.freeze({
				activeCells: Object.freeze([...this.activeCells]),
				bootstrap: true,
				regionId: this.regionId
			});
		}
	}

	__exports.MinimalMeadowBootstrapStreaming = MinimalMeadowBootstrapStreaming;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowGroundSupport.js ----
{
	const __exports = __awtsmoosModule_26;
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
		const baseHeight = supported ? support.height : terrain;
		// Obstacle courses (Stream 3): a mounted course engine may contribute a
		// platform or moving platform as the authoritative ground. It only speaks
		// inside its own region and never snaps a player up through a platform.
		const course = runtime.courseEngine?.groundReceipt?.(x, z, currentY, previousY);
		if (course && Number.isFinite(course.height) && course.height >= baseHeight - 0.001) {
			return {
				height: course.height,
				profileId: course.profileId || null,
				source: course.kind || 'course',
				support: course.height,
				terrain
			};
		}
		return {
			height: baseHeight,
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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowMovementRecovery.js ----
{
	const __exports = __awtsmoosModule_25;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowMovementRecovery.js
	 * @description Recovers the traveler relative to the actual local walkable support instead of one meaningless global abyss number.
	 * The Awtsmoos sustains each foot upon the earth beneath it; Awtsmoos.com remembers only lawful grounded footing
	 * and restores a traveler as soon as visible position sinks materially beneath terrain, threshold, room, tread, or landing.
	 */

	const minimalMeadowGroundReceipt = __awtsmoosModule_26.minimalMeadowGroundReceipt;

	const WORLD_LIMIT = 510;
	const BELOW_SUPPORT_TOLERANCE = 1.25;
	const SAFE_SUPPORT_TOLERANCE = 0.8;

	class MinimalMeadowMovementRecovery {
		constructor(runtime, state) {
			this.runtime = runtime;
			this.safe = snapshot(state, supportHeight(runtime, state));
			this.recoveries = 0;
			this.lastReason = null;
		}

		beforeStep(state) {
			const reason = recoveryReason(this.runtime, state);
			return reason ? this.restore(state, reason) : false;
		}

		afterStep(state) {
			const reason = recoveryReason(this.runtime, state);
			if (reason) return this.restore(state, reason);
			if (safeFooting(this.runtime, state)) this.checkpoint(state);
			return false;
		}

		checkpoint(state) {
			this.safe = snapshot(state, supportHeight(this.runtime, state));
			return this.safe;
		}

		unstuck(state) {
			return this.restore(state, 'unstuck-command');
		}

		returnToCheckpoint(state) {
			return this.restore(state, 'checkpoint-command');
		}

		restore(state, reason = 'movement-recovery') {
			Object.assign(state, {
				facing: this.safe.facing,
				groundY: this.safe.y,
				grounded: true,
				renderY: this.safe.y,
				travelFacing: this.safe.facing,
				velY: 0,
				x: this.safe.x,
				y: this.safe.y,
				z: this.safe.z
			});
			this.runtime.model?.position?.set?.(this.safe.x, this.safe.y, this.safe.z);
			this.runtime.cameraRig?.update?.(this.runtime.camera, state, this.runtime.mainOctree, 0);
			this.runtime.expansion?.streaming?.recover?.(new Error(reason), this.safe);
			this.recoveries += 1;
			this.lastReason = reason;
			this.runtime.bus?.emit?.('movement:recovered', this.diagnostics());
			return true;
		}

		diagnostics() {
			return Object.freeze({ lastReason: this.lastReason, recoveries: this.recoveries, safe: { ...this.safe } });
		}
	}


	__exports.MinimalMeadowMovementRecovery = MinimalMeadowMovementRecovery;
	function recoveryReason(runtime, state) {
		if (![state.x, state.y, state.z, state.renderY].every(Number.isFinite)) return 'nonfinite-position';
		if (Math.abs(state.x) > WORLD_LIMIT || Math.abs(state.z) > WORLD_LIMIT) return 'outside-world-bounds';
		const support = supportHeight(runtime, state);
		if (Number.isFinite(support) && state.renderY < support - BELOW_SUPPORT_TOLERANCE) return 'below-walkable-ground';
		return null;
	}

	function safeFooting(runtime, state) {
		if (!state.grounded || !withinWorld(state)) return false;
		const support = supportHeight(runtime, state);
		return Number.isFinite(support) && Math.abs(state.renderY - support) <= SAFE_SUPPORT_TOLERANCE;
	}

	function withinWorld(state) {
		return [state.x, state.renderY, state.z].every(Number.isFinite)
			&& Math.abs(state.x) <= WORLD_LIMIT
			&& Math.abs(state.z) <= WORLD_LIMIT;
	}

	function supportHeight(runtime, state) {
		return minimalMeadowGroundReceipt(runtime, state.x, state.z, state.renderY, state.previousRenderY ?? state.renderY).height;
	}

	function snapshot(state, support) {
		return Object.freeze({
			facing: Number(state.facing || 0),
			x: Number(state.x || 0),
			y: Number.isFinite(support) ? support : Number(state.renderY ?? state.y ?? 0),
			z: Number(state.z || 0)
		});
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapCoreStateSystems.js ----
{
	const __exports = __awtsmoosModule_15;
	//B"H
	//Boruch Hashem
	//Blessed is He

	/**
	 * @file BootstrapCoreStateSystems.js
	 * @description Installs only the state vessels Blank Meadow needs before richer world systems exist.
	 * The Awtsmoos creates the traveler anew while continuity crosses the finite seam; Awtsmoos.com
	 * binds recovery, inventory, quest, and lawful storage without awakening combat from another dream.
	 */

	const AwtsmoosEventBus = __awtsmoosModule_1.AwtsmoosEventBus;
	const BootstrapGameplayContinuity = __awtsmoosModule_16.BootstrapGameplayContinuity;
	const BootstrapVerticalSliceContinuity = __awtsmoosModule_20.BootstrapVerticalSliceContinuity;
	const MinimalMeadowBootstrapInventory = __awtsmoosModule_23.MinimalMeadowBootstrapInventory;
	const MinimalMeadowBootstrapRecovery = __awtsmoosModule_24.MinimalMeadowBootstrapRecovery;
	const MinimalMeadowMovementRecovery = __awtsmoosModule_25.MinimalMeadowMovementRecovery;

	const BLANK_MEADOW_ID = 'blank-meadow';

	function installBootstrapCoreStateSystems(runtime, environment = globalThis) {
		if (runtime?.worldExperience?.id !== BLANK_MEADOW_ID) return null;
		if (runtime.bootstrapCoreStateSystems) return runtime.bootstrapCoreStateSystems;

		runtime.bus ||= new AwtsmoosEventBus();
		runtime.inventory ||= new MinimalMeadowBootstrapInventory();
		runtime.inventoryStore = runtime.inventory;
		runtime.movementRecovery ||= new MinimalMeadowMovementRecovery(runtime, runtime.state);
		runtime.recovery ||= new MinimalMeadowBootstrapRecovery(runtime);
		runtime.bootstrapGameplayContinuity ||= new BootstrapGameplayContinuity(
			runtime,
			environment
		);
		runtime.bootstrapVerticalSliceContinuity ||= new BootstrapVerticalSliceContinuity(
			runtime,
			environment
		);

		runtime.bootstrapCoreStateSystems = Object.freeze({
			gameplay: runtime.bootstrapGameplayContinuity,
			inventory: runtime.inventory,
			recovery: runtime.recovery,
			teachingQuest: runtime.teachingQuest,
			verticalSlice: runtime.bootstrapVerticalSliceContinuity
		});
		return runtime.bootstrapCoreStateSystems;
	}

	__exports.installBootstrapCoreStateSystems = installBootstrapCoreStateSystems;

}

// ---- libs/awtsmoos-procedural-core/src/core/performance/FrameBudgetWindow.js ----
{
	const __exports = __awtsmoosModule_28;
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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteModelRecords.js ----
{
	const __exports = __awtsmoosModule_33;
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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/assets/ReleaseModelCatalog.js ----
{
	const __exports = __awtsmoosModule_32;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file ReleaseModelCatalog.js
	 * @description Defines exact content-addressed same-release model URLs without weakening the remote Drive authority catalog.
	 * The Awtsmoos gives one authored form two guarded roads whose identity is one immutable hash;
	 * Awtsmoos.com lets the release-owned road run locally only when semantic model, SHA-256 folder, and filename all perfectly match.
	 */

	const REMOTE_MODEL_RECORDS = __awtsmoosModule_33.REMOTE_MODEL_RECORDS;

	const PLAYER_IDENTITY = 'player/chossid.glb';

	/**
	 * Release-local model root resolved against this module's real URL (not a hardcoded
	 * absolute path), so source, compact bundles, https:, and file: all agree.
	 * This module lives at <game>/experiments/Awtsmoos/src/assets/; models live at <game>/build/generated/assets/.
	 */
	function releaseModelRoot() {
		return new URL('../../../../build/generated/assets/', (( globalThis.location?.protocol === "file:" ? (import.meta.url.lastIndexOf("/games/mitzvahWorld/") > 8 ? import.meta.url.slice(0, import.meta.url.lastIndexOf("/games/mitzvahWorld/")) : "https://awtsmoos.local") : (/^(https?):\/\//.test(globalThis.location?.origin || "") ? globalThis.location.origin : "https://awtsmoos.local") ) + "/games/mitzvahWorld/experiments/Awtsmoos/src/assets/ReleaseModelCatalog.js")).href;
	}

	/** Returns the exact hash-addressed packaged URL for the canonical Chossid. */
	function canonicalChossidReleaseUrl() {
		const record = REMOTE_MODEL_RECORDS[PLAYER_IDENTITY];
		return `${releaseModelRoot()}${record.sha256}/chossid.glb`;
	}


	__exports.canonicalChossidReleaseUrl = canonicalChossidReleaseUrl;
	/** Accepts only a catalog-derived release-owned content-addressed model URL. */
	function isTrustedReleaseModelUrl(value) {
		const candidate = String(value || '').trim();
		if (!candidate || candidate.includes('?') || candidate.includes('#')) return false;
		return candidate === canonicalChossidReleaseUrl();
	}


	__exports.isTrustedReleaseModelUrl = isTrustedReleaseModelUrl;
	/** Returns auditable release-model identity without replacing remote authority. */
	function releaseModelEvidence() {
		const record = REMOTE_MODEL_RECORDS[PLAYER_IDENTITY];
		return Object.freeze({
			bytes: record.bytes,
			identity: PLAYER_IDENTITY,
			policy: 'release-local-content-addressed-exact-only',
			sha256: record.sha256,
			url: canonicalChossidReleaseUrl()
		});
	}

	__exports.releaseModelEvidence = releaseModelEvidence;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzConstants.js ----
{
	const __exports = __awtsmoosModule_31;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzConstants.js
	 * @description Holds player, collision, movement, and one-CSS-pixel rendering constants while deriving the player URL from release trust law.
	 * The Awtsmoos gives the canonical Chossid one exact hash-addressed local vessel whose authored bytes remain unchanged;
	 * Awtsmoos.com keeps fast first play beneath the same immutable identity rather than copying a mutable path into another range.
	 */

	const canonicalChossidReleaseUrl = __awtsmoosModule_32.canonicalChossidReleaseUrl;

	const PLAYER_MODEL_URL = canonicalChossidReleaseUrl();

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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzLocomotionStride.js ----
{
	const __exports = __awtsmoosModule_34;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzLocomotionStride.js
	 * @description Stride-phase locomotion presentation for the canonical Chossid.
	 * Advances one stride phase strictly proportional to measured world distance (no
	 * foot sliding), derives footstep events at each half-cycle for future audio,
	 * and computes presentation-only vertical bob, lateral roll, and smoothed visual
	 * facing. Physics state is never touched: callers apply the returned pose to the
	 * visible model after authoritative placement.
	 */

	const TAU = Math.PI * 2;
	const STRIDE_SMOOTH_RATE = 10;
	const WEIGHT_EASE_RATE = 8;
	const LABEL_DEBOUNCE_SECONDS = 0.18;
	const MAX_FOOTSTEP_EVENTS = 32;
	const WALK_BOB_AMPLITUDE = 0.028;
	const RUN_BOB_AMPLITUDE = 0.045;
	const WALK_ROLL_AMPLITUDE = 0.025;
	const RUN_ROLL_AMPLITUDE = 0.04;

	/** Creates one fresh stride presentation state. */
	function createLocomotionStride() {
		return {
			bobY: 0,
			cycleDistance: 0,
			footstepEvents: [],
			labelTimer: 0,
			phase: 0,
			roll: 0,
			smoothedLocomotion: 'stand',
			stepIndex: 0,
			strideWeight: 0,
			visualYaw: null
		};
	}


	__exports.createLocomotionStride = createLocomotionStride;
	/**
	 * Advances stride presentation from measured locomotion.
	 * @param {object} stride Mutable stride state from createLocomotionStride.
	 * @param {object} input { deltaTime, moving, locomotion, speed, referenceSpeed,
	 *   clipDuration, facing } — speed is measured world m/s, clipDuration the seconds
	 *   per full walk/run clip cycle at rate 1, referenceSpeed the authored m/s the
	 *   clip was timed against.
	 * @returns {object} The same stride state.
	 */
	function advanceLocomotionStride(stride, input = {}) {
		const dt = sanitizeDelta(input.deltaTime);
		const locomotion = input.locomotion || 'stand';
		const active = Boolean(input.moving)
			&& (locomotion === 'walk' || locomotion === 'run')
			&& dt > 0;
		debounceLocomotionLabel(stride, locomotion, dt);
		const referenceSpeed = Number(input.referenceSpeed) > 0 ? Number(input.referenceSpeed) : 1;
		const clipDuration = Number(input.clipDuration) > 0 ? Number(input.clipDuration) : 1;
		const cycleDistance = Math.max(1e-6, referenceSpeed * clipDuration);
		stride.cycleDistance = cycleDistance;
		if (active) {
			const distance = Math.max(0, Number(input.speed) || 0) * dt;
			advancePhase(stride, (distance / cycleDistance) * TAU, locomotion, Number(input.speed) || 0);
		}
		stride.strideWeight = approach(stride.strideWeight, active ? 1 : 0, dt, WEIGHT_EASE_RATE);
		const running = locomotion === 'run';
		const bobAmplitude = running ? RUN_BOB_AMPLITUDE : WALK_BOB_AMPLITUDE;
		const rollAmplitude = running ? RUN_ROLL_AMPLITUDE : WALK_ROLL_AMPLITUDE;
		stride.bobY = -(bobAmplitude / 2) * Math.cos(2 * stride.phase) * stride.strideWeight;
		stride.roll = rollAmplitude * Math.sin(stride.phase) * stride.strideWeight;
		if (stride.visualYaw === null || !Number.isFinite(stride.visualYaw)) {
			stride.visualYaw = Number(input.facing) || 0;
		} else {
			stride.visualYaw = approachAngle(stride.visualYaw, Number(input.facing) || 0, dt, STRIDE_SMOOTH_RATE);
		}
		return stride;
	}

	/** Returns and clears pending footstep events for future audio triggers. */
	function drainLocomotionFootsteps(stride) {
		if (!stride || stride.footstepEvents.length === 0) return [];
		const events = stride.footstepEvents.slice();
		stride.footstepEvents.length = 0;
		return events;
	}

	/**
	 * Applies the stride pose to the visible model after authoritative placement.
	 * Presentation-only: state.renderY / state.facing are read, never written.
	 */
	function applyLocomotionStridePresentation(model, state, stride) {
		if (!model || !stride) return;
		model.position.y = state.renderY + (stride.bobY || 0);
		const yaw = Number.isFinite(stride.visualYaw) ? stride.visualYaw : state.facing;
		const sy = Math.sin(yaw / 2);
		const cy = Math.cos(yaw / 2);
		const sr = Math.sin((stride.roll || 0) / 2);
		const cr = Math.cos((stride.roll || 0) / 2);
		model.quaternion.set(sy * sr, sy * cr, cy * sr, cy * cr);
	}

	function advancePhase(stride, delta, locomotion, speed) {
		if (!(delta > 0)) return;
		const before = stride.phase;
		const after = before + delta;
		const crossed = Math.floor(after / Math.PI) - Math.floor(before / Math.PI);
		for (let i = 0; i < crossed; i++) {
			stride.stepIndex += 1;
			stride.footstepEvents.push(Object.freeze({
				locomotion,
				phase: stride.stepIndex * Math.PI,
				speed,
				stepIndex: stride.stepIndex
			}));
			if (stride.footstepEvents.length > MAX_FOOTSTEP_EVENTS) stride.footstepEvents.shift();
		}
		stride.phase = after % TAU;
	}

	function debounceLocomotionLabel(stride, locomotion, dt) {
		if (locomotion === stride.smoothedLocomotion) {
			stride.labelTimer = 0;
			return;
		}
		// Stopping is instant (feet must plant the moment travel ends); only
		// walk/run/air transitions debounce so the label cannot flutter.
		if (locomotion === 'stand' || locomotion === 'reset') {
			stride.smoothedLocomotion = locomotion;
			stride.labelTimer = 0;
			return;
		}
		stride.labelTimer += dt;
		if (stride.labelTimer >= LABEL_DEBOUNCE_SECONDS) {
			stride.smoothedLocomotion = locomotion;
			stride.labelTimer = 0;
		}
	}

	function sanitizeDelta(value) {
		const dt = Number(value);
		if (!Number.isFinite(dt) || dt <= 0) return 0;
		return Math.min(dt, 0.2);
	}

	function approach(current, target, deltaTime, responsiveness) {
		return current + (target - current) * Math.min(1, deltaTime * responsiveness);
	}

	function approachAngle(current, target, deltaTime, rate) {
		let delta = (target - current) % TAU;
		if (delta > Math.PI) delta -= TAU;
		if (delta < -Math.PI) delta += TAU;
		const maxStep = rate * deltaTime;
		if (Math.abs(delta) <= maxStep) return target;
		return current + Math.sign(delta) * maxStep;
	}

	__exports.advanceLocomotionStride = advanceLocomotionStride;
	__exports.drainLocomotionFootsteps = drainLocomotionFootsteps;
	__exports.applyLocomotionStridePresentation = applyLocomotionStridePresentation;
}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzLocomotionPlayback.js ----
{
	const __exports = __awtsmoosModule_35;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzLocomotionPlayback.js
	 * @description Measures post-collision travel so canonical walk/run clips advance at the speed the Chossid actually moved.
	 * The Awtsmoos joins footstep and journey in one measured instant; Awtsmoos.com refuses to cycle walking feet
	 * against a wall, across a teleport, or at a speed unrelated to the world distance traversed beneath them.
	 */

	const RUN_SPEED = __awtsmoosModule_31.RUN_SPEED;
	const WALK_SPEED = __awtsmoosModule_31.WALK_SPEED;

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

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-matrix-core.js ----
{
	const __exports = __awtsmoosModule_43;
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
	const __exports = __awtsmoosModule_44;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-transform-math.js
	 * @description Direct quaternion and TRS composition for animated village forms.
	 * The Awtsmoos turns stillness into movement each instant; Awtsmoos.com composes the
	 * complete local vessel in one pass so no temporary translation or scale matrix is born.
	 */

	const identity = __awtsmoosModule_43.identity;

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
	const __exports = __awtsmoosModule_45;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-camera-math.js
	 * @description Camera projection and world-point revelation for the mountain village.
	 * The Awtsmoos creates the seer and the seen together; Awtsmoos.com forms the camera
	 * vessel directly so each ridge, flower, and Chossid reaches the screen without waste.
	 */

	const identity = __awtsmoosModule_43.identity;

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
	const __exports = __awtsmoosModule_46;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-interpolation-math.js
	 * @description Smooth array and quaternion transitions for living motion.
	 * The Awtsmoos joins every before and after in one present; Awtsmoos.com gives the
	 * visible traveler a measured path between samples without changing either endpoint.
	 */

	const quatNormalize = __awtsmoosModule_44.quatNormalize;

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
	const __exports = __awtsmoosModule_42;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-math.js
	 * @description Stable public gateway to focused mathematical vessels.
	 * The Awtsmoos contains every coordinate without confusion; Awtsmoos.com reveals
	 * matrix, transform, camera, and interpolation responsibilities in their proper rooms.
	 */

	__exports.copyMat4 = __awtsmoosModule_43.copyMat4;
	__exports.EPSILON = __awtsmoosModule_43.EPSILON;
	__exports.identity = __awtsmoosModule_43.identity;
	__exports.inverse = __awtsmoosModule_43.inverse;
	__exports.mat4FromArray = __awtsmoosModule_43.mat4FromArray;
	__exports.multiply = __awtsmoosModule_43.multiply;
	__exports.scale = __awtsmoosModule_43.scale;
	__exports.translate = __awtsmoosModule_43.translate;
	__exports.composeTRS = __awtsmoosModule_44.composeTRS;
	__exports.quatMatrix = __awtsmoosModule_44.quatMatrix;
	__exports.quatNormalize = __awtsmoosModule_44.quatNormalize;
	__exports.lookAt = __awtsmoosModule_45.lookAt;
	__exports.perspective = __awtsmoosModule_45.perspective;
	__exports.transformPoint = __awtsmoosModule_45.transformPoint;
	__exports.lerpArray = __awtsmoosModule_46.lerpArray;
	__exports.quatSlerp = __awtsmoosModule_46.quatSlerp;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-transform-cache.js ----
{
	const __exports = __awtsmoosModule_47;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-transform-cache.js
	 * @description Reuses transform snapshots and matrix storage until source values change.
	 * The Awtsmoos renews every form each instant; Awtsmoos.com mutates stable numerical
	 * vessels for moving hierarchy nodes while mesh matrix identity still invalidates batches.
	 */

	const identity = __awtsmoosModule_42.identity;

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
	const __exports = __awtsmoosModule_48;
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
	const __exports = __awtsmoosModule_41;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-object3d.js
	 * @description Cached scene hierarchy with structural and visibility revision evidence.
	 * The Awtsmoos recreates every parent and child together; Awtsmoos.com marks real hierarchy
	 * changes so settled material and renderer systems stop rediscovering an unchanged village tree.
	 */

	const copyMat4 = __awtsmoosModule_42.copyMat4;
	const identity = __awtsmoosModule_42.identity;
	const cachedLocalMatrix = __awtsmoosModule_47.cachedLocalMatrix;
	const invalidateTransformCache = __awtsmoosModule_47.invalidateTransformCache;
	const ROOT_WORLD_MATRIX = __awtsmoosModule_47.ROOT_WORLD_MATRIX;
	const updateCachedWorldMatrix = __awtsmoosModule_47.updateCachedWorldMatrix;
	const Quaternion = __awtsmoosModule_48.Quaternion;
	const Vector3 = __awtsmoosModule_48.Vector3;

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
	const __exports = __awtsmoosModule_49;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-mesh-object.js
	 * @description Renderable scene-graph vessel joining geometry and material.
	 * The Awtsmoos clothes abstract points in visible form; Awtsmoos.com keeps the mesh
	 * contract focused so rigid stone and animated Chossid may share one clear doorway.
	 */

	const Object3D = __awtsmoosModule_41.Object3D;

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
	const __exports = __awtsmoosModule_50;
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
			const color = normalizeMaterialColor(parameters.color);
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
	/**
	 * B"H: normalizes a material color to an [r,g,b,a] array with 0-1 components.
	 * Accepts arrays (used as-is), hex numbers (0xRRGGBB), and CSS hex strings ('#RRGGBB').
	 * Falls back to the warm default when the input is missing or unrecognized.
	 */
	function normalizeMaterialColor(input) {
		const fallback = [0.74, 0.68, 0.58, 1];
		if (input == null) return fallback.slice();
		if (Array.isArray(input)) {
			return [
				Number(input[0]) ?? fallback[0],
				Number(input[1]) ?? fallback[1],
				Number(input[2]) ?? fallback[2],
				Number(input[3] ?? 1)
			];
		}
		if (typeof input === 'number' && Number.isFinite(input)) {
			const v = Math.floor(input);
			return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255, 1];
		}
		if (typeof input === 'string') {
			const m = input.trim().match(/^#?([0-9a-fA-F]{6})$/);
			if (m) {
				const v = parseInt(m[1], 16);
				return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255, 1];
			}
		}
		return fallback.slice();
	}

	__exports.normalizeMaterialColor = normalizeMaterialColor;

}

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-camera.js ----
{
	const __exports = __awtsmoosModule_51;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-camera.js
	 * @description Perspective camera vessel for the mountain-village revelation.
	 * The Awtsmoos creates sight and distance together; Awtsmoos.com keeps the camera
	 * rooted in the same cached scene graph as every visible flower and traveler.
	 */

	const Object3D = __awtsmoosModule_41.Object3D;

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
	const __exports = __awtsmoosModule_40;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-runtime.js
	 * @description Stable public gateway to the focused tiny scene-graph runtime.
	 * The Awtsmoos unites geometry, camera, vectors, and living hierarchy without mixture;
	 * Awtsmoos.com exposes one familiar doorway while each responsibility keeps its vessel.
	 */

	const Bone = __awtsmoosModule_41.Bone;
	const Group = __awtsmoosModule_41.Group;
	const Object3D = __awtsmoosModule_41.Object3D;
	const Scene = __awtsmoosModule_41.Scene;
	const Mesh = __awtsmoosModule_49.Mesh;
	const BufferAttribute = __awtsmoosModule_50.BufferAttribute;
	const BufferGeometry = __awtsmoosModule_50.BufferGeometry;
	const MeshStandardMaterial = __awtsmoosModule_50.MeshStandardMaterial;
	const PerspectiveCamera = __awtsmoosModule_51.PerspectiveCamera;
	const Quaternion = __awtsmoosModule_48.Quaternion;
	const Vector3 = __awtsmoosModule_48.Vector3;

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

// ---- games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-accessors.js ----
{
	const __exports = __awtsmoosModule_39;
	// B"H
	const BufferAttribute = __awtsmoosModule_40.BufferAttribute;

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
	const __exports = __awtsmoosModule_38;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-animation-parser.js
	 * @description Decodes GLTF animation channels into stable scalar sampling vessels.
	 * The Awtsmoos speaks every motion through measured times and values; Awtsmoos.com
	 * preserves each source channel exactly while separating parsing from living playback.
	 */

	const accessorFloatArray = __awtsmoosModule_39.accessorFloatArray;

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
	const __exports = __awtsmoosModule_53;
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
	const __exports = __awtsmoosModule_55;
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
	const __exports = __awtsmoosModule_54;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-animation-sampler.js
	 * @description Samples scalar animation channels without transient per-frame arrays.
	 * The Awtsmoos joins keyframes without waste; Awtsmoos.com lets each bone receive the
	 * same measured pose while temporary numbers pass through stable, reusable vessels.
	 */

	const slerpQuaternionInto = __awtsmoosModule_55.slerpQuaternionInto;

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
	const __exports = __awtsmoosModule_52;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-animation-player.js
	 * @description Advances imported clips through exact first-play, looping, and crossfade laws.
	 * The Awtsmoos renews a living pose from the first instant; Awtsmoos.com never blends the first
	 * idle from bind pose with zero weight, yet preserves gentle transitions after motion is alive.
	 */

	const captureClipPose = __awtsmoosModule_53.captureClipPose;
	const createAnimationBindings = __awtsmoosModule_53.createAnimationBindings;
	const resetAnimationBindings = __awtsmoosModule_53.resetAnimationBindings;
	const applyChannelSample = __awtsmoosModule_54.applyChannelSample;

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
	const __exports = __awtsmoosModule_37;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file tiny-animation.js
	 * @description Stable public doorway to parsed clips and allocation-free playback.
	 * The Awtsmoos unites source time with visible motion; Awtsmoos.com keeps parsing,
	 * sampling, bindings, and playback in small vessels behind one familiar import.
	 */

	__exports.parseTinyAnimations = __awtsmoosModule_38.parseTinyAnimations;
	__exports.summarizeAnimations = __awtsmoosModule_38.summarizeAnimations;
	__exports.TinyAnimationPlayer = __awtsmoosModule_52.TinyAnimationPlayer;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/world/GroundRay.js ----
{
	const __exports = __awtsmoosModule_56;
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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/CharacterVariants.js ----
{
	const __exports = __awtsmoosModule_57;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file CharacterVariants.js
	 * @description One canonical Chossid, many characters. Yaakov's rule: the same
	 * base model (chossid.glb) wears every identity — beard or clean-shaven,
	 * mustache or bare lip, glasses or clear eyes, tophat or yamulka or bare head,
	 * black coat or modern jacket, tefillin or plain. Plus a realism material pass
	 * that lifts the whole figure beyond flat game-asset looks.
	 *
	 * Node names below are the LOADED scene node names (GLTFLoader uses node names,
	 * not mesh names): Cube005 = long beard, mustache, top-hat, yarmalka, teeth.
	 */

	const NODES = Object.freeze({
		beard: 'Cube005',
		mustache: 'mustache',
		hair: 'hairPlaceholder',
		browLeft: 'eyeBrowLeft',
		browRight: 'eyeBrowRight',
		topHat: 'top-hat',
		yamulka: 'yarmalka',
		teeth: 'teeth'
	});


	__exports.NODES = NODES;
	const MATERIALS = Object.freeze({
		glassesFrame: 'glasses-frame',
		glassesGlass: 'glasses-glass',
		tefillinStrap: 'teffilinStrap',
		tefillinBayis: 'teffilinBayis',
		tefillinShin: 'teffilinShin',
		jacket: 'jacket',
		jacketAlt: 'jacket.001',
		shirt: 'shirt',
		outerShirt: 'outer-shirt',
		pants: 'pants',
		shoes: 'shoes',
		skin: 'skin',
		hair: 'hair',
		lips: 'lips',
		gums: 'gums',
		tophat: 'tophat',
		yamulka: 'yamulka',
		eyeWhite: 'eye-white',
		eyeColor: 'eye-color',
		pupil: 'pupil'
	});


	__exports.MATERIALS = MATERIALS;
	const TEFILLIN_MATS = [MATERIALS.tefillinStrap, MATERIALS.tefillinBayis, MATERIALS.tefillinShin];
	const GLASS_MATS = [MATERIALS.glassesFrame, MATERIALS.glassesGlass];

	/** Four launch characters on the same bones. */
	const VARIANTS = Object.freeze({
		classic: Object.freeze({
			label: 'Classic Chossid',
			beard: true, mustache: true, glasses: false, hat: 'tophat', tefillin: false,
			outfit: Object.freeze({ jacket: 0x161616, shirt: 0xf2f2f2, pants: 0x1b1b1b, shoes: 0x0c0c0c, hat: 0x101010 })
		}),
		scholar: Object.freeze({
			label: 'Scholar',
			beard: true, mustache: true, glasses: true, hat: 'yamulka', tefillin: true,
			outfit: Object.freeze({ jacket: 0x1e1a14, shirt: 0xf6f1e7, pants: 0x232323, shoes: 0x111111, hat: 0x0d0d0d })
		}),
		modern: Object.freeze({
			label: 'Modern',
			beard: false, mustache: true, glasses: true, hat: 'yamulka', tefillin: false,
			outfit: Object.freeze({ jacket: 0x1f2a44, shirt: 0xe8edf5, pants: 0x2a2f3a, shoes: 0x14161c, hat: 0x101418 })
		}),
		casual: Object.freeze({
			label: 'Casual',
			beard: false, mustache: false, glasses: false, hat: 'none', tefillin: false,
			outfit: Object.freeze({ jacket: 0x3a3f4a, shirt: 0xdfe6ee, pants: 0x333a45, shoes: 0x1a1c22, hat: 0x101010 })
		})
	});


	__exports.VARIANTS = VARIANTS;
	function eachMesh(model, fn) {
		model.traverse(object => {
			if (object.isMesh || object.isSkinnedMesh) fn(object);
		});
	}

	function setNodeVisible(model, name, visible) {
		eachMesh(model, object => {
			if (object.name === name) object.visible = visible !== false;
		});
	}

	function setMaterialVisible(model, materialName, visible) {
		eachMesh(model, object => {
			if (object.material && object.material.name === materialName) {
				object.visible = visible !== false;
			}
		});
	}

	/** Beard on/off. The long beard is its own node, so the face stays intact. */
	function setBeard(model, on) {
		setNodeVisible(model, NODES.beard, on);
		return Boolean(on);
	}


	__exports.setBeard = setBeard;
	/** Mustache on/off (independent of the beard). */
	function setMustache(model, on) {
		setNodeVisible(model, NODES.mustache, on);
		return Boolean(on);
	}


	__exports.setMustache = setMustache;
	/** Glasses on/off (frames + lenses together). */
	function setGlasses(model, on) {
		for (const mat of GLASS_MATS) setMaterialVisible(model, mat, on);
		return Boolean(on);
	}


	__exports.setGlasses = setGlasses;
	/** Hat: 'tophat' | 'yamulka' | 'none'. */
	function setHat(model, which) {
		setNodeVisible(model, NODES.topHat, which === 'tophat');
		setNodeVisible(model, NODES.yamulka, which === 'yamulka');
		return which;
	}


	__exports.setHat = setHat;
	/** Tefillin (straps + boxes + shin) on/off. */
	function setTefillin(model, on) {
		for (const mat of TEFILLIN_MATS) setMaterialVisible(model, mat, on);
		return Boolean(on);
	}


	__exports.setTefillin = setTefillin;
	/**
	 * Recolors the outfit. Clones materials first so one character's clothes never
	 * bleed into another instance sharing the GLB.
	 */
	function setOutfit(model, outfit = {}) {
		const targets = {
			[MATERIALS.jacket]: outfit.jacket,
			[MATERIALS.jacketAlt]: outfit.jacket,
			[MATERIALS.shirt]: outfit.shirt,
			[MATERIALS.outerShirt]: outfit.shirt,
			[MATERIALS.pants]: outfit.pants,
			[MATERIALS.shoes]: outfit.shoes,
			[MATERIALS.tophat]: outfit.hat,
			[MATERIALS.yamulka]: outfit.hat
		};
		eachMesh(model, object => {
			const name = object.material && object.material.name;
			if (name && targets[name] !== undefined) {
				if (!object.userData.AwtsmoosVariantCloned) {
					object.material = object.material.clone();
					object.userData.AwtsmoosVariantCloned = true;
				}
				object.material.color.setHex(targets[name]);
				object.material.needsUpdate = true;
			}
		});
	}


	__exports.setOutfit = setOutfit;
	/**
	 * Realism pass: lifts the flat authored materials into believable PBR without
	 * touching geometry. Skin gets soft sheen, hair gets deep matte, eyes get wet
	 * gloss, teeth get enamel white, fabric gets cloth roughness. Also repairs the
	 * teeth node, which ships with no material.
	 */
	function enhanceRealism(model) {
		const tweaks = {
			[MATERIALS.skin]: { roughness: 0.55, metalness: 0.0 },
			[MATERIALS.hair]: { roughness: 0.9, metalness: 0.0 },
			[MATERIALS.lips]: { roughness: 0.45, metalness: 0.0 },
			[MATERIALS.gums]: { roughness: 0.5, metalness: 0.0 },
			[MATERIALS.jacket]: { roughness: 0.95, metalness: 0.0 },
			[MATERIALS.jacketAlt]: { roughness: 0.95, metalness: 0.0 },
			[MATERIALS.shirt]: { roughness: 0.9, metalness: 0.0 },
			[MATERIALS.outerShirt]: { roughness: 0.9, metalness: 0.0 },
			[MATERIALS.pants]: { roughness: 0.9, metalness: 0.0 },
			[MATERIALS.shoes]: { roughness: 0.35, metalness: 0.1 },
			[MATERIALS.eyeWhite]: { roughness: 0.25, metalness: 0.0 },
			[MATERIALS.eyeColor]: { roughness: 0.15, metalness: 0.0 },
			[MATERIALS.pupil]: { roughness: 0.1, metalness: 0.0 },
			[MATERIALS.glassesFrame]: { roughness: 0.3, metalness: 0.6 },
			[MATERIALS.glassesGlass]: { roughness: 0.05, metalness: 0.0, transparent: true, opacity: 0.28 },
			[MATERIALS.tophat]: { roughness: 0.7, metalness: 0.0 },
			[MATERIALS.yamulka]: { roughness: 0.85, metalness: 0.0 },
			[MATERIALS.tefillinBayis]: { roughness: 0.4, metalness: 0.05 },
			[MATERIALS.tefillinStrap]: { roughness: 0.8, metalness: 0.0 }
		};
		eachMesh(model, object => {
			const mat = object.material;
			if (!mat) return;
			// Repair the teeth: authored with no material at all.
			if (object.name === NODES.teeth && !mat.name) {
				object.material = makeTeethMaterial(object);
				return;
			}
			const tweak = tweaks[mat.name];
			if (!tweak) return;
			if (tweak.roughness !== undefined && 'roughness' in mat) mat.roughness = tweak.roughness;
			if (tweak.metalness !== undefined && 'metalness' in mat) mat.metalness = tweak.metalness;
			if (tweak.transparent !== undefined) mat.transparent = tweak.transparent;
			if (tweak.opacity !== undefined) mat.opacity = tweak.opacity;
			mat.needsUpdate = true;
		});
		// Gentle proportion rescue: the authored tophat ships oversized and swallows
		// the face at gameplay distance. A slight scale keeps the silhouette honest.
		eachMesh(model, object => {
			if (object.name === NODES.topHat && !object.userData.AwtsmoosHatRescaled) {
				object.scale.multiplyScalar(0.88);
				object.userData.AwtsmoosHatRescaled = true;
			}
		});
	}


	__exports.enhanceRealism = enhanceRealism;
	function makeTeethMaterial(referenceObject) {
		// The teeth ship with an unnamed default material; give them enamel.
		let base = null;
		const root = referenceObject.parent;
		if (root && root.traverse) {
			root.traverse(o => {
				if (!base && o.material && o.material.name === MATERIALS.gums) base = o.material;
			});
		}
		const mat = base ? base.clone() : newObjectMaterial(referenceObject);
		try {
			if (mat.color && mat.color.setHex) mat.color.setHex(0xf7f3e8);
			if ('roughness' in mat) mat.roughness = 0.22;
			if ('metalness' in mat) mat.metalness = 0.0;
			mat.name = 'teeth';
			mat.needsUpdate = true;
		} catch { /* keep best effort */ }
		return mat;
	}

	function newObjectMaterial(referenceObject) {
		// Last resort: reuse the constructor of any sibling material.
		let ctor = null;
		const root = referenceObject.parent;
		if (root && root.traverse) {
			root.traverse(o => {
				if (!ctor && o.material && o.material.constructor && o.material.color) {
					ctor = o.material.constructor;
				}
			});
		}
		return ctor ? new ctor({ color: 0xf7f3e8 }) : { color: { setHex() {} }, needsUpdate: false };
	}

	/** Applies a full named variant in one call. Returns the resolved variant. */
	function applyVariant(model, name) {
		const variant = VARIANTS[name] || VARIANTS.classic;
		setBeard(model, variant.beard);
		setMustache(model, variant.mustache);
		setGlasses(model, variant.glasses);
		setHat(model, variant.hat);
		setTefillin(model, variant.tefillin);
		setOutfit(model, variant.outfit);
		model.userData.AwtsmoosVariant = name;
		return variant;
	}


	__exports.applyVariant = applyVariant;
	/** Lists available variant names. */
	function variantNames() {
		return Object.keys(VARIANTS);
	}


	__exports.variantNames = variantNames;
	/**
	 * Quality pass 2 — pushes the model beyond flat game-asset looks.
	 * - Beard: narrows the traffic-cone silhouette, natural auburn color.
	 * - Eyes: adds catchlights for living eyes.
	 * - Skin: upgrades to physical material with sheen for lifelike response.
	 * All runtime-only; the authored GLB is never modified.
	 */
	function refineFeatures(model, THREE) {
		// Beard: the authored beard ships as a wide cone; narrow + reshape it.
		eachMesh(model, object => {
			if (object.name === NODES.beard && !object.userData.AwtsmoosBeardRefined) {
				object.scale.set(0.72, 0.92, 0.78);
				object.userData.AwtsmoosBeardRefined = true;
			}
			if (object.material && object.material.name === MATERIALS.hair) {
				if (!object.userData.AwtsmoosHairRecolored) {
					if (!object.userData.AwtsmoosVariantCloned) {
						object.material = object.material.clone();
						object.userData.AwtsmoosVariantCloned = true;
					}
					// Natural auburn instead of traffic-cone orange.
					object.material.color.setHex(0x8a4a1e);
					object.material.needsUpdate = true;
					object.userData.AwtsmoosHairRecolored = true;
				}
			}
		});
		// Eye catchlights: tiny bright spheres parented in front of each pupil.
		const eyeTargets = [];
		eachMesh(model, object => {
			if (object.material && object.material.name === MATERIALS.pupil) eyeTargets.push(object);
		});
		for (const pupil of eyeTargets) {
			if (pupil.userData.AwtsmoosCatchlight) continue;
			const geo = new THREE.SphereGeometry(0.012, 8, 8);
			const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
			const dot = new THREE.Mesh(geo, mat);
			// Place slightly forward and up from the pupil center.
			const bb = new THREE.Box3().setFromObject(pupil);
			const c = bb.getCenter(new THREE.Vector3());
			pupil.parent.worldToLocal(c);
			dot.position.copy(c);
			dot.position.z += 0.035;
			dot.position.y += 0.012;
			dot.userData.AwtsmoosCatchlight = true;
			pupil.userData.AwtsmoosCatchlight = true;
			pupil.parent.add(dot);
		}
		// Skin: physical material with sheen for a lifelike response.
		eachMesh(model, object => {
			const mat = object.material;
			if (mat && mat.name === MATERIALS.skin && !object.userData.AwtsmoosSkinUpgraded) {
				if (!object.userData.AwtsmoosVariantCloned) {
					object.material = object.material.clone();
					object.userData.AwtsmoosVariantCloned = true;
				}
				const m = object.material;
				try {
					if (THREE.MeshPhysicalMaterial && !(m instanceof THREE.MeshPhysicalMaterial)) {
						const phys = new THREE.MeshPhysicalMaterial({
							color: m.color ? m.color.clone() : new THREE.Color(0xd9a066),
							roughness: 0.5, metalness: 0.0,
							sheen: 0.5, sheenRoughness: 0.6,
							sheenColor: new THREE.Color(0xffd9b0)
						});
						phys.name = MATERIALS.skin;
						object.material = phys;
					} else {
						if ('sheen' in m) { m.sheen = 0.5; m.sheenRoughness = 0.6; }
					}
					m.needsUpdate = true;
				} catch { /* keep best effort */ }
				object.userData.AwtsmoosSkinUpgraded = true;
			}
		});
	}

	__exports.refineFeatures = refineFeatures;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/TalkingMouth.js ----
{
	const __exports = __awtsmoosModule_58;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file TalkingMouth.js
	 * @description A mouth that talks. The canonical Chossid GLB ships two authored
	 * mouth morphs — "O" (open round) and "S" (teeth-pressed sibilant) — plus real
	 * teeth geometry. This driver turns text into living lip-sync: every character
	 * of speech becomes a viseme, visemes become morph weights, and the mouth moves
	 * with the words. Jaw motion comes free: the O morph carries the lower face.
	 *
	 * Usage:
	 *   const talker = speakText(model, "Shalom aleichem!");
	 *   // ...in the render loop: talker.update(nowSeconds); when done: talker.stop()
	 */

	const MORPH_O = 'O';
	const MORPH_S = 'S';

	/** Character → [openWeight, sibilantWeight]. Tuned by mouth shape, not IPA. */
	function visemeFor(ch) {
		const c = ch.toLowerCase();
		if ('aouou'.includes(c)) return [0.95, 0.0];          // open vowels → O
		if ('eiy'.includes(c)) return [0.55, 0.25];           // spread vowels → half O
		if ('sz'.includes(c) || c === 'x') return [0.08, 0.9]; // sibilants → S teeth
		if ('fv'.includes(c)) return [0.25, 0.55];           // labiodental → teeth+lip
		if ('mbp'.includes(c)) return [0.0, 0.0];            // bilabials → closed
		if ('lr'.includes(c)) return [0.35, 0.3];            // liquids → mid
		if ('tdn'.includes(c)) return [0.3, 0.45];           // alveolars → teeth
		if ('kghj'.includes(c)) return [0.5, 0.1];           // velars/glottals → open
		if (c === ' ' || c === '\n') return [0.0, 0.0];      // pauses → rest
		if (',;:.!?—-'.includes(c)) return [0.12, 0.0];       // punctuation → near rest
		return [0.4, 0.2];                                   // default murmur
	}

	function setMorph(model, name, value) {
		let count = 0;
		model.traverse(object => {
			if ((object.isMesh || object.isSkinnedMesh) && object.morphTargetDictionary) {
				const i = object.morphTargetDictionary[name];
				if (i !== undefined) {
					object.morphTargetInfluences[i] = Math.max(0, Math.min(1, value));
					count++;
				}
			}
		});
		return count;
	}

	/**
	 * Speaks text through the model's mouth. Returns a controller; call update(t)
	 * every frame with seconds. CPS = characters per second (speech rate).
	 */
	function speakText(model, text, opts = {}) {
		const cps = opts.cps || 11;
		const chars = String(text || '').split('');
		const plan = chars.map(visemeFor);
		const duration = Math.max(0.4, chars.length / cps) + 0.35;
		let stopped = false;
		let lastO = -1, lastS = -1;

		function poseAt(t) {
			if (t <= 0 || t >= duration) return [0, 0];
			const idx = Math.min(plan.length - 1, Math.floor(t * cps));
			const frac = (t * cps) - Math.floor(t * cps);
			const [o0, s0] = plan[idx];
			const [o1, s1] = plan[Math.min(plan.length - 1, idx + 1)] || [0, 0];
			// Smoothstep between visemes so the mouth glides instead of snapping.
			const k = frac * frac * (3 - 2 * frac);
			return [o0 + (o1 - o0) * k, s0 + (s1 - s0) * k];
		}

		return {
			duration,
			update(t) {
				if (stopped) return false;
				const [o, s] = poseAt(t);
				if (Math.abs(o - lastO) > 0.004) { setMorph(model, MORPH_O, o); lastO = o; }
				if (Math.abs(s - lastS) > 0.004) { setMorph(model, MORPH_S, s); lastS = s; }
				if (t >= duration) { this.stop(); return false; }
				return true;
			},
			stop() {
				stopped = true;
				setMorph(model, MORPH_O, 0);
				setMorph(model, MORPH_S, 0);
			}
		};
	}


	__exports.speakText = speakText;
	/** Instantly sets an open-mouth pose (0..1). Useful for gasps and singing. */
	function setMouthOpen(model, amount) {
		setMorph(model, MORPH_O, amount);
		setMorph(model, MORPH_S, 0);
	}


	__exports.setMouthOpen = setMouthOpen;
	/** Closes the mouth fully. */
	function closeMouth(model) {
		setMorph(model, MORPH_O, 0);
		setMorph(model, MORPH_S, 0);
	}


	__exports.closeMouth = closeMouth;
	/** True when the model exposes the authored talk morphs. */
	function canTalk(model) {
		let found = 0;
		model.traverse(object => {
			if ((object.isMesh || object.isSkinnedMesh) && object.morphTargetDictionary) {
				if (MORPH_O in object.morphTargetDictionary) found++;
			}
		});
		return found > 0;
	}

	__exports.canTalk = canTalk;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzPlayerModel.js ----
{
	const __exports = __awtsmoosModule_36;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzPlayerModel.js
	 * @description Mounts only an authored animated Chossid GLB and exposes shared placement, equipment, and clip contracts.
	 * The Awtsmoos gives one traveler a measured body, authored bones, and living motion beneath the sky;
	 * Awtsmoos.com rejects fallback humanity at this final doorway, so every accepted player source remains truthful to the eye.
	 */

	const TinyAnimationPlayer = __awtsmoosModule_37.TinyAnimationPlayer;
	const alignModelFeetToGround = __awtsmoosModule_56.alignModelFeetToGround;
	const applyVariant = __awtsmoosModule_57.applyVariant;
	const enhanceRealism = __awtsmoosModule_57.enhanceRealism;
	const variantNames = __awtsmoosModule_57.variantNames;
	const VARIANTS = __awtsmoosModule_57.VARIANTS;
	const canTalk = __awtsmoosModule_58.canTalk;
	const closeMouth = __awtsmoosModule_58.closeMouth;
	const setMouthOpen = __awtsmoosModule_58.setMouthOpen;
	const speakText = __awtsmoosModule_58.speakText;

	/** Creates one grounded canonical animated player or throws when a fallback identity enters this boundary. */
	function createPlayerModel(playerGltf, scene) {
		assertCanonicalPlayer(playerGltf);
		const model = playerGltf.scene;
		model.name = 'Awtsmoos_visible_player_isolated_chossid';
		model.visible = true;
		model.scale.set(1.52, 1.52, 1.52);
		model.position.set(0, 0, 4);
		model.setBaseTransform();
		// B"H: one base model, many characters. Realism first, then the default identity.
		enhanceRealism(model);
		applyVariant(model, 'classic');
		scene.add(model);
		const feet = alignModelFeetToGround(model, 0);
		const footOffset = model.position.y;
		const player = new TinyAnimationPlayer(model, playerGltf.animations);
		const clips = createClipMap(playerGltf.animations);
		const defaultClip = clips.stand || player.names[0] || '';
		if (!defaultClip) throw new Error('Canonical Chossid GLB did not expose a playable animation clip.');
		player.play(defaultClip);
		model.userData.AwtsmoosCanonicalPlayer = playerEvidence(player, defaultClip);
		// B"H: the living character API — variants, realism, and a talking mouth.
		model.userData.AwtsmoosCharacter = Object.freeze({
			variantNames,
			variants: VARIANTS,
			applyVariant: name => applyVariant(model, name),
			enhanceRealism: () => enhanceRealism(model),
			canTalk: () => canTalk(model),
			speak: (text, opts) => speakText(model, text, opts),
			setMouthOpen: amount => setMouthOpen(model, amount),
			closeMouth: () => closeMouth(model)
		});
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
	const __exports = __awtsmoosModule_30;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file EretzAnimationMotion.js
	 * @description Places the canonical Chossid and advances locomotion without letting deferred clip names tear the rich-world frame.
	 * The Awtsmoos lets body, ground, and animation testify to one journey while a late name remains only a late name;
	 * Awtsmoos.com keeps the visible traveler moving through mountain promotion until the canonical clip-map enters the frame.
	 */

	const RUN_SPEED = __awtsmoosModule_31.RUN_SPEED;
	const WALK_SPEED = __awtsmoosModule_31.WALK_SPEED;
	const advanceLocomotionStride = __awtsmoosModule_34.advanceLocomotionStride;
	const applyLocomotionStridePresentation = __awtsmoosModule_34.applyLocomotionStridePresentation;
	const createLocomotionStride = __awtsmoosModule_34.createLocomotionStride;
	const measureLocomotionPlayback = __awtsmoosModule_35.measureLocomotionPlayback;
	const placePlayerModel = __awtsmoosModule_36.placePlayerModel;

	/** Advances animation when its naming contract exists while always preserving visible model placement. */
	function updatePlayerPresentation(runtime, deltaTime) {
		smoothRenderHeight(runtime.state, deltaTime);
		updateAnimation(runtime, deltaTime);
		placePlayerModel(runtime.model, runtime.state);
		applyLocomotionStridePresentation(runtime.model, runtime.state, runtime.locomotionStrideState);
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
		const stride = runtime.locomotionStrideState
			|| (runtime.locomotionStrideState = createLocomotionStride());
		advanceLocomotionStride(stride, {
			clipDuration: strideClipDuration(player, clips, motion.locomotion),
			deltaTime,
			facing: state.facing,
			locomotion: motion.locomotion,
			moving: motion.moving,
			referenceSpeed: motion.locomotion === 'run' ? RUN_SPEED : WALK_SPEED,
			speed: motion.speed
		});
		if (!clips || !player) {
			player?.update?.(deltaTime);
			return;
		}
		const wanted = wantedClip(state, clips, motion, stride);
		if (wanted && state.clip !== wanted && typeof player.play === 'function') {
			player.play(wanted);
			state.clip = wanted;
		}
		const playbackRate = motion.locomotion === 'walk' || motion.locomotion === 'run'
			? motion.rate
			: 1;
		player.update?.(deltaTime * playbackRate);
	}

	/** Resolves the authored clip-cycle duration so stride phase stays synchronized to visible feet. */
	function strideClipDuration(player, clips, locomotion) {
		const name = locomotion === 'run' ? clips?.run : clips?.walk;
		const match = player?.clips?.find?.(clip => clip?.name === name);
		const duration = Number(match?.duration);
		return Number.isFinite(duration) && duration > 0 ? duration : 1;
	}

	/** Chooses the best published locomotion clip with a debounced label so walk/run cannot flutter at the boundary. */
	function wantedClip(state, clips, motion, stride) {
		const stand = clips.stand || state.clip || '';
		if (!state.grounded) {
			return state.airPhase === 'jump'
				? (clips.jump || stand)
				: (clips.fall || clips.jump || stand);
		}
		const locomotion = stride?.smoothedLocomotion || motion.locomotion;
		if (locomotion !== 'walk' && locomotion !== 'run') return stand;
		return locomotion === 'run'
			? (clips.run || clips.walk || stand)
			: (clips.walk || stand);
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapFrameExecution.js ----
{
	const __exports = __awtsmoosModule_29;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapFrameExecution.js
	 * @description Owns one gameplay frame's simulation, canonical Chossid presentation, render, UI cadence, and diagnostic bookkeeping.
	 * Yesod carries feet and authored bones through one pulse while Malchus receives one rendered world without a second clock;
	 * the Awtsmoos recreates motion and image each instant, and Awtsmoos.com lets the bootstrap path breathe the same living GLB through every walk.
	 */

	const updatePlayerPresentation = __awtsmoosModule_30.updatePlayerPresentation;

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
		// B"H Track C: optional per-frame vessels (particles, NPC dialogue). Each
		// guarded line keeps a missing or failing vessel from ever breaking the frame.
		try { runtime.mitzvahParticleLayer?.update?.(runtime); } catch {}
		try { runtime.mitzvahNpcDialogue?.update?.(); } catch {}
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
	const __exports = __awtsmoosModule_59;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapFrameScheduler.js
	 * @description Owns one exact-once gameplay pulse with rAF cadence and a bounded timer liveness watchdog.
	 * Netzach prefers the visible browser rhythm while Gevurah keeps one quiet lamp burning when that rhythm is withheld;
	 * the Awtsmoos recreates every pulse before either clock can claim independence, and Awtsmoos.com lets only the first messenger enter.
	 */

	class BootstrapFrameScheduler {
		/**
		 * @param {object} environment Browser-like scheduling environment.
		 * @param {number} fallbackMs Maximum wait before the timer watchdog advances a suspended rAF frame.
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
			this.watchdogId = null;
			this.onAnimationFrame = timestamp => this.flush(timestamp, 'animation-frame');
			this.onWatchdog = () => this.flush(this.now(), 'timer-watchdog');
			this.onTimerFallback = () => this.flush(this.now(), 'timer-fallback');
		}

		/**
		 * Schedules one future gameplay pulse and returns this stable cancellable handle.
		 * @param {(timestamp:number, source:string)=>void} callback Frame callback.
		 * @returns {BootstrapFrameScheduler} Stable scheduler handle.
		 */
		schedule(callback) {
			this.callback = callback;
			if (this.pendingId !== null || this.watchdogId !== null) return this;
			if (this.requestFrame) {
				this.pendingKind = 'animation-frame';
				this.pendingId = this.requestFrame(this.onAnimationFrame);
				if (this.scheduleTimer) {
					this.watchdogId = this.scheduleTimer(this.onWatchdog, this.fallbackMs);
				}
				return this;
			}
			if (this.scheduleTimer) {
				this.pendingKind = 'timer-fallback';
				this.pendingId = this.scheduleTimer(this.onTimerFallback, this.fallbackMs);
				return this;
			}
			throw new Error('MitzvahWorld requires requestAnimationFrame or setTimeout scheduling.');
		}

		/** Cancels every clock belonging to the single pending pulse. */
		cancel() {
			this.callback = null;
			this.clearClocks();
		}

		flush(timestamp, source) {
			const callback = this.callback;
			this.callback = null;
			this.clearClocks();
			if (callback) callback(timestamp, source);
		}

		clearClocks() {
			const pendingId = this.pendingId;
			const pendingKind = this.pendingKind;
			const watchdogId = this.watchdogId;
			this.pendingId = null;
			this.pendingKind = null;
			this.watchdogId = null;
			if (pendingId !== null) {
				if (pendingKind === 'animation-frame') this.cancelFrame?.(pendingId);
				else this.cancelTimer?.(pendingId);
			}
			if (watchdogId !== null) this.cancelTimer?.(watchdogId);
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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapHydratedRuntimeLoop.js ----
{
	const __exports = __awtsmoosModule_27;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapHydratedRuntimeLoop.js
	 * @description Replaces the temporary essential heartbeat with the full animation, world-system, HUD, and performance cadence on the existing movement controller.
	 * The Awtsmoos does not create a second traveler when richer rhythm arrives;
	 * Awtsmoos.com keeps the same feet and movement vessel while one fuller scheduler takes the frame and the tiny first-play clock retires.
	 */

	const FrameBudgetWindow = __awtsmoosModule_28.FrameBudgetWindow;
	const advanceBootstrapGameplay = __awtsmoosModule_29.advanceBootstrapGameplay;
	const recordBootstrapFrameFailure = __awtsmoosModule_29.recordBootstrapFrameFailure;
	const recordBootstrapFrameSuccess = __awtsmoosModule_29.recordBootstrapFrameSuccess;
	const refreshBootstrapPresentation = __awtsmoosModule_29.refreshBootstrapPresentation;
	const renderBootstrapGameplay = __awtsmoosModule_29.renderBootstrapGameplay;
	const createBootstrapFrameScheduler = __awtsmoosModule_59.createBootstrapFrameScheduler;

	const MAX_FRAME_DELTA_SECONDS = 0.05;

	/** Starts the full ongoing loop around an already-created movement controller and atomically retires the essential loop. */
	function startBootstrapHydratedRuntimeLoop(runtime, movement, environment = globalThis) {
		const frameWindow = new FrameBudgetWindow(240);
		const scheduler = createBootstrapFrameScheduler(environment);
		let active = true;
		let lastTime = now(environment);
		let lastUiAt = -Infinity;

		const frame = (currentTime, source = 'unknown') => {
			if (!active) return;
			const gap = Math.max(1, currentTime - lastTime);
			const deltaSeconds = Math.min(MAX_FRAME_DELTA_SECONDS, Math.max(0.001, gap / 1000));
			lastTime = currentTime;
			frameWindow.add(gap);
			try {
				advanceBootstrapGameplay(runtime, movement, deltaSeconds);
				renderBootstrapGameplay(runtime, currentTime);
				lastUiAt = refreshBootstrapPresentation(runtime, currentTime, lastUiAt);
				runtime.performanceMonitor?.record?.(gap, currentTime);
				recordBootstrapFrameSuccess(runtime, currentTime, source);
			} catch (error) {
				recordBootstrapFrameFailure(runtime, environment, error);
			}
			scheduler.schedule(frame);
		};

		runtime.essentialMovementLoop?.stop?.();
		runtime.frameCadence = frameWindow;
		runtime.frameBudget = frameWindow;
		runtime.frameScheduler = scheduler;
		runtime.runtimeFrameSource = 'hydrated-starting';
		scheduler.schedule(frame);
		movement.stop = (options = {}) => {
			active = false;
			scheduler.cancel();
			if (!options.preserveUi) runtime.bootstrapMinimap?.destroy?.();
		};
		movement.scheduler = () => Object.freeze({ active, frameSource: runtime.runtimeFrameSource });
		return movement;
	}


	__exports.startBootstrapHydratedRuntimeLoop = startBootstrapHydratedRuntimeLoop;
	function now(environment) {
		return environment?.performance?.now?.() ?? Date.now();
	}

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapRuntimeDiagnosticSnapshots.js ----
{
	const __exports = __awtsmoosModule_61;
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
	const __exports = __awtsmoosModule_63;
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
	const __exports = __awtsmoosModule_64;
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
	const __exports = __awtsmoosModule_62;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file VisualQualityDiagnostics.js
	 * @description Joins focused visual witnesses into one stable public quality receipt.
	 * The Awtsmoos gathers player and world without crushing either vessel into one design;
	 * Awtsmoos.com exposes their joined testimony only when asked, so frame-time remains fine.
	 */

	const capturePlayerVisualDiagnostics = __awtsmoosModule_63.capturePlayerVisualDiagnostics;
	const captureSceneVisualDiagnostics = __awtsmoosModule_64.captureSceneVisualDiagnostics;

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
	const __exports = __awtsmoosModule_60;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapRuntimeDiagnostics.js
	 * @description Exposes live bootstrap control and visual truth while snapshot details live in focused vessels.
	 * The Awtsmoos renews witness with the world it measures, each receipt clear and fine;
	 * Awtsmoos.com joins movement, nature, rendering, districts, and visible quality without a monolithic line.
	 */

	const bootstrapDistrictSnapshot = __awtsmoosModule_61.bootstrapDistrictSnapshot;
	const bootstrapHydrationSnapshot = __awtsmoosModule_61.bootstrapHydrationSnapshot;
	const bootstrapRealNatureSnapshot = __awtsmoosModule_61.bootstrapRealNatureSnapshot;
	const bootstrapRendererSnapshot = __awtsmoosModule_61.bootstrapRendererSnapshot;
	const bootstrapWorldSnapshot = __awtsmoosModule_61.bootstrapWorldSnapshot;
	const captureVisualQualityDiagnostics = __awtsmoosModule_62.captureVisualQualityDiagnostics;

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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowCanonicalAnimation.js ----
{
	const __exports = __awtsmoosModule_65;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowCanonicalAnimation.js
	 * @description Binds every imported Chossid clip while publishing the grounded world model as the authoritative animation-player root.
	 * The Awtsmoos gives inner bones and outer travel one ordered living vessel; Awtsmoos.com keeps the moving root truthful across bootstrap,
	 * gameplay composition, Movie Studio, diagnostics, and reproduction while direct clip channels continue animating the authored GLB within.
	 */

	const TinyAnimationPlayer = __awtsmoosModule_37.TinyAnimationPlayer;
	const createClipMap = __awtsmoosModule_36.createClipMap;

	/**
	 * Installs the canonical animation controller on the movable outer player root.
	 *
	 * @param {object} runtime Canonical player runtime with an installed grounded model.
	 * @param {object} gltf Parsed canonical Chossid GLTF.
	 * @returns {object} Installed animation catalog, clips, default clip, and player.
	 */
	function installCanonicalChossidAnimation(runtime, gltf) {
		const canonicalRoot = runtime.model;
		if (!canonicalRoot) {
			throw new Error('Canonical Chossid animation requires runtime.model.');
		}
		const animations = gltf.animations || [];
		const player = new TinyAnimationPlayer(canonicalRoot, animations);
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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowBootstrapCombat.js ----
{
	const __exports = __awtsmoosModule_66;
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
	const __exports = __awtsmoosModule_69;
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
	const __exports = __awtsmoosModule_70;
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
	const __exports = __awtsmoosModule_71;
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
	const __exports = __awtsmoosModule_72;
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
	const __exports = __awtsmoosModule_74;
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
	const __exports = __awtsmoosModule_75;
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
	const __exports = __awtsmoosModule_73;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file WorldMinimapStyle.js
	 * @description Installs the map's safe-area geometry and spectral material vessels exactly once.
	 * The Awtsmoos joins boundary and beauty without confusing their separate names;
	 * Awtsmoos.com composes small readable modules so future maps inherit clarity instead of overlapping frames.
	 */

	const WORLD_MINIMAP_LAYOUT_CSS = __awtsmoosModule_74.WORLD_MINIMAP_LAYOUT_CSS;
	const WORLD_MINIMAP_SURFACE_CSS = __awtsmoosModule_75.WORLD_MINIMAP_SURFACE_CSS;

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
	const __exports = __awtsmoosModule_76;
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
	const __exports = __awtsmoosModule_68;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file WorldMinimap.js
	 * @description Owns compact, expanded, and full-screen quest maps for solo and shared play.
	 * The Awtsmoos renews direction without replacing discovery; Awtsmoos.com redraws only after
	 * movement, unified quest change, peer change, or an explicit remembered viewpoint transition.
	 */

	const bindWorldMinimapControls = __awtsmoosModule_69.bindWorldMinimapControls;
	const updateWorldMinimapControls = __awtsmoosModule_69.updateWorldMinimapControls;
	const projectWorldMinimap = __awtsmoosModule_70.projectWorldMinimap;
	const ensureWorldMinimapQuestSubscription = __awtsmoosModule_71.ensureWorldMinimapQuestSubscription;
	const worldMinimapPeerSignature = __awtsmoosModule_71.worldMinimapPeerSignature;
	const worldMinimapPlayerPosition = __awtsmoosModule_71.worldMinimapPlayerPosition;
	const readWorldMinimapMode = __awtsmoosModule_72.readWorldMinimapMode;
	const writeWorldMinimapMode = __awtsmoosModule_72.writeWorldMinimapMode;
	const installWorldMinimapStyle = __awtsmoosModule_73.installWorldMinimapStyle;
	const createWorldMinimapRoot = __awtsmoosModule_76.createWorldMinimapRoot;
	const renderWorldMinimapMarkers = __awtsmoosModule_76.renderWorldMinimapMarkers;

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
	const __exports = __awtsmoosModule_67;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file MinimalMeadowBootstrapMinimap.js
	 * @description Mounts the folded real minimap during compact bootstrap play with an injectable test seam.
	 * The Awtsmoos reveals nearby travelers without scattering source scrolls across the road;
	 * Awtsmoos.com preserves immediate mount, diagnostics, refresh, handoff, and exact teardown.
	 */

	const WorldMinimap = __awtsmoosModule_68.WorldMinimap;

	const WORLD_MINIMAP_URL = new URL(
		'../ui/WorldMinimap.js',
		(( globalThis.location?.protocol === "file:" ? (import.meta.url.lastIndexOf("/games/mitzvahWorld/") > 8 ? import.meta.url.slice(0, import.meta.url.lastIndexOf("/games/mitzvahWorld/")) : "https://awtsmoos.local") : (/^(https?):\/\//.test(globalThis.location?.origin || "") ? globalThis.location.origin : "https://awtsmoos.local") ) + "/games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowBootstrapMinimap.js")
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

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzWorldFeaturePolicy.js ----
{
	const __exports = __awtsmoosModule_77;
	//B"H
	//Boruch Hashem
	//Blessed be He

	/**
	 * @file EretzWorldFeaturePolicy.js
	 * @description Gives runtime code one doorway for immutable selected-world feature decisions.
	 * Legacy callers remain rich by default, while official manifests can explicitly disable any optional system.
	 */

	/**
	 * Resolves whether a named feature is enabled for the selected world.
	 * @param {object} options Runtime options carrying worldExperience.
	 * @param {string} feature Boolean feature key.
	 * @param {boolean} legacyDefault Behavior for callers without an official manifest.
	 * @returns {boolean} The authoritative feature decision.
	 */
	function eretzWorldFeatureEnabled(options, feature, legacyDefault = true) {
		const experience = options?.worldExperience;
		if (experience && typeof experience[feature] === 'boolean') {
			return experience[feature];
		}
		return legacyDefault;
	}


	__exports.eretzWorldFeatureEnabled = eretzWorldFeatureEnabled;
	/** Publishes the immutable selected experience on the live runtime for diagnostics and consumers. */
	function attachEretzWorldExperience(runtime, options) {
		runtime.worldExperience = options?.worldExperience || null;
		return runtime.worldExperience;
	}

	__exports.attachEretzWorldExperience = attachEretzWorldExperience;

}

// ---- games/mitzvahWorld/experiments/Awtsmoos/src/app/BootstrapPostControlHydration.js ----
{
	const __exports = __awtsmoosModule_0;
	// B"H
	// Boruch Hashem
	// Blessed is He

	/**
	 * @file BootstrapPostControlHydration.js
	 * @description Hydrates animation, full cadence, continuity, combat, HUD, minimap, and rich diagnostics onto the already-movable canonical runtime.
	 * The Awtsmoos clothes the traveler after the traveler already stands and moves;
	 * Awtsmoos.com adds rhythm and instruments to the same grounded root, then marks that authored body canonically ready so no later loader mistakes revelation for absence.
	 */

	const AwtsmoosEventBus = __awtsmoosModule_1.AwtsmoosEventBus;
	const installBootstrapControlsHud = __awtsmoosModule_2.installBootstrapControlsHud;
	const installBootstrapCoreStateSystems = __awtsmoosModule_15.installBootstrapCoreStateSystems;
	const startBootstrapHydratedRuntimeLoop = __awtsmoosModule_27.startBootstrapHydratedRuntimeLoop;
	const createBootstrapRuntimeDiagnostics = __awtsmoosModule_60.createBootstrapRuntimeDiagnostics;
	const installCanonicalChossidAnimation = __awtsmoosModule_65.installCanonicalChossidAnimation;
	const MinimalMeadowBootstrapCombat = __awtsmoosModule_66.MinimalMeadowBootstrapCombat;
	const createMinimalMeadowBootstrapMinimap = __awtsmoosModule_67.createMinimalMeadowBootstrapMinimap;
	const eretzWorldFeatureEnabled = __awtsmoosModule_77.eretzWorldFeatureEnabled;

	const BLANK_MEADOW_ID = 'blank-meadow';

	/** Upgrades one proven first-control runtime in place and preserves its movement identity. */
	function hydrateBootstrapPostControl(core, options, qualityProfile, boot) {
		const { runtime, movement } = core;
		const environment = options.environment || globalThis;
		boot.begin('post-control-animation');
		hydrateAnimation(runtime);
		runtime.bus ||= new AwtsmoosEventBus();
		if (runtime.worldExperience?.id === BLANK_MEADOW_ID) {
			installBootstrapCoreStateSystems(runtime, environment);
		}
		if (eretzWorldFeatureEnabled(options, 'bootstrapCombat')) {
			runtime.combat = new MinimalMeadowBootstrapCombat(runtime);
		}
		startBootstrapHydratedRuntimeLoop(runtime, movement, environment);
		boot.begin('post-control-ui');
		installBootstrapControlsHud(runtime, environment.document);
		if (eretzWorldFeatureEnabled(options, 'bootstrapMinimap')) {
			runtime.bootstrapMinimap = createMinimalMeadowBootstrapMinimap(runtime, environment.document);
		}
		const richDiagnostics = createBootstrapRuntimeDiagnostics(runtime, movement, qualityProfile, boot);
		Object.assign(core.diagnostics, richDiagnostics);
		core.diagnostics.worldExperience = runtime.worldExperience;
		runtime.postControlHydrated = true;
		return core;
	}


	__exports.hydrateBootstrapPostControl = hydrateBootstrapPostControl;
	/** Hydrates authored clips on the movable canonical root while retaining detailed stage evidence. */
	function hydrateAnimation(runtime) {
		if (runtime.canonicalAnimationPlayer) return;
		const gltf = runtime.playerGltf;
		const installed = installCanonicalChossidAnimation(runtime, gltf);
		runtime.canonicalPlayerHydrationStage = 'animated';
		runtime.canonicalPlayer = Object.freeze({
			...runtime.canonicalPlayer,
			animations: installed.catalog.length,
			status: 'ready'
		});
	}

}

export const hydrateBootstrapPostControl = __awtsmoosModule_0.hydrateBootstrapPostControl;
