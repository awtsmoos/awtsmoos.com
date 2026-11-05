// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahNpcDialogue.js
 * @description Friendly-NPC dialogue vessel for MitzvahWorld. Registers named NPCs (by
 * default the live `FriendlyNpcPopulation` actors already streaming in the world),
 * triggers each NPC's next line when the player walks within speaking radius, builds a
 * deterministic timed speech plan through the procedural core's Medaber authority
 * (`speech()` / `speechGates()` — explicit gate requests, no inferred phonemes), and
 * shows subtitles through a minimal DOM overlay owned by this module. The overlay is
 * the subtitle path: the movie-maker subtitle renderers are project-scoped and not
 * reachable from live gameplay. Proximity greetings are subtitle-only and never fire
 * quest or combat events; player-initiated dialogue keeps flowing through the game's
 * own `actor.dialogue()` bus events, which this module also subtitles via Medaber.
 */

import { createMedaberAuthority } from '../../../../../../libs/awtsmoos-procedural-core/src/core/medaber/index.js';

const DEFAULT_SPEAK_RADIUS = 4.0;
const DEFAULT_COOLDOWN_MS = 30000;
const MIN_SUBTITLE_MS = 2400;
const MAX_WORDS_PER_PLAN = 48;

/** Deterministic 32-bit string hash for word→gate mapping. */
function hashWord(word) {
	let hash = 2166136261;
	for (let i = 0; i < word.length; i++) {
		hash ^= word.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

function asPosition(value) {
	if (!value) return null;
	if (Array.isArray(value) && value.length >= 2) {
		return { x: Number(value[0]) || 0, y: Number(value[2] !== undefined ? value[1] : 0) || 0, z: Number(value[2] !== undefined ? value[2] : value[1]) || 0 };
	}
	if (typeof value.x === 'number' || typeof value.z === 'number') {
		return { x: Number(value.x) || 0, y: Number(value.y) || 0, z: Number(value.z) || 0 };
	}
	return null;
}

function planarDistance(a, b) {
	const dx = (a?.x || 0) - (b?.x || 0);
	const dz = (a?.z || 0) - (b?.z || 0);
	return Math.hypot(dx, dz);
}

function normalizeLines(lines) {
	if (!Array.isArray(lines)) return [];
	return lines
		.map(line => {
			if (typeof line === 'string') return { mood: 'greeting', text: line };
			if (line && typeof line.text === 'string') {
				return { mood: String(line.mood || 'greeting'), text: line.text };
			}
			return null;
		})
		.filter(Boolean);
}

function nowMs() {
	try {
		return globalThis.performance?.now?.() ?? Date.now();
	} catch {
		return Date.now();
	}
}

export class MitzvahNpcDialogue {
	/**
	 * @param {object} [options={}]
	 * @param {number} [options.radius] Default speaking radius in meters.
	 * @param {number} [options.cooldownMs] Per-NPC cooldown between automatic lines.
	 * @param {Function} [options.playerPosition] () => {x,y,z} provider.
	 * @param {Function} [options.npcPositions] () => {id:{x,y,z}} provider.
	 * @param {Document} [options.document] DOM document for the subtitle overlay.
	 */
	constructor(options = {}) {
		this.medaber = createMedaberAuthority();
		this.gateCount = this.medaber.speechGates().length || 8;
		this.registry = new Map();
		this.defaultRadius = Number(options.radius) > 0 ? Number(options.radius) : DEFAULT_SPEAK_RADIUS;
		this.defaultCooldownMs = Number(options.cooldownMs) > 0 ? Number(options.cooldownMs) : DEFAULT_COOLDOWN_MS;
		this.playerPositionProvider = typeof options.playerPosition === 'function' ? options.playerPosition : null;
		this.npcPositionsProvider = typeof options.npcPositions === 'function' ? options.npcPositions : null;
		this.document = options.document || globalThis.document || null;
		this.subtitleEl = null;
		this.subtitleNameEl = null;
		this.subtitleTextEl = null;
		this.hideTimer = 0;
		this.active = null;
	}

	/**
	 * Registers one NPC voice.
	 * @param {string} id Stable NPC identity.
	 * @param {object} [config={}] {name, lines:[{text,mood}|string], position|getPosition, radius, cooldownMs, actor}
	 */
	registerNpc(id, config = {}) {
		const key = String(id || '').trim();
		if (!key) throw new Error('MitzvahNpcDialogue.registerNpc requires a non-empty id.');
		const entry = {
			id: key,
			name: String(config.name || key),
			lines: normalizeLines(config.lines),
			lineIndex: 0,
			position: config.position ? asPosition(config.position) : null,
			getPosition: typeof config.getPosition === 'function' ? config.getPosition : null,
			radius: Number(config.radius) > 0 ? Number(config.radius) : this.defaultRadius,
			cooldownMs: Number(config.cooldownMs) > 0 ? Number(config.cooldownMs) : this.defaultCooldownMs,
			lastSpokeAt: 0,
			lastPlan: null,
			actor: config.actor || null
		};
		this.registry.set(key, entry);
		return entry;
	}

	/** Removes one registered NPC voice. */
	unregisterNpc(id) {
		return this.registry.delete(String(id));
	}

	/**
	 * Speaks one NPC's next (or indexed) line: builds the Medaber timed speech plan
	 * from the line's word cadence and shows the subtitle for the plan's duration.
	 */
	speak(id, lineIndex) {
		const entry = this.registry.get(String(id));
		if (!entry || entry.lines.length === 0) return null;
		const index = Number.isInteger(lineIndex)
			? ((lineIndex % entry.lines.length) + entry.lines.length) % entry.lines.length
			: entry.lineIndex % entry.lines.length;
		const line = entry.lines[index];
		entry.lineIndex = index + 1;
		const plan = this.medaber.speech(this.gateSequenceFor(line.text));
		entry.lastSpokeAt = nowMs();
		entry.lastPlan = plan;
		this.active = { id: entry.id, name: entry.name, text: line.text, mood: line.mood, plan };
		this.showSubtitle(entry.name, line.text, line.mood, plan.durationMs);
		return Object.freeze({
			id: entry.id,
			name: entry.name,
			text: line.text,
			mood: line.mood,
			plan
		});
	}

	/**
	 * Per-frame driver: greets from the nearest in-radius NPC whose cooldown expired.
	 * Subtitle-only — never fires quest/combat events.
	 * @param {{x,y,z}} [playerPosition] Overrides the configured provider.
	 * @param {object} [npcPositions] {id:{x,y,z}} overrides per-NPC positions.
	 */
	update(playerPosition, npcPositions) {
		try {
			this.rescanActors();
			const player = asPosition(playerPosition) || this.readPlayerPosition();
			if (!player) return null;
			const overrides = npcPositions || this.readNpcPositions();
			const now = nowMs();
			let nearest = null;
			let nearestDistance = Infinity;
			for (const entry of this.registry.values()) {
				if (entry.lines.length === 0) continue;
				if (entry.lastSpokeAt > 0 && now - entry.lastSpokeAt < entry.cooldownMs) continue;
				const position = (overrides && asPosition(overrides[entry.id]))
					|| this.readEntryPosition(entry);
				if (!position) continue;
				const distance = planarDistance(player, position);
				if (distance <= entry.radius && distance < nearestDistance) {
					nearest = entry;
					nearestDistance = distance;
				}
			}
			if (!nearest) return null;
			return this.speak(nearest.id);
		} catch {
			return null;
		}
	}

	/** Hides the subtitle overlay immediately. */
	dismiss() {
		try {
			if (this.hideTimer) {
				clearTimeout(this.hideTimer);
				this.hideTimer = 0;
			}
			if (this.subtitleEl) this.subtitleEl.style.display = 'none';
			this.active = null;
		} catch { /* overlay is best-effort */ }
		return this;
	}

	/**
	 * Handles a game `npc:dialogue` bus payload (from the real `NpcChossid.dialogue()`
	 * flow): builds the Medaber plan for the spoken text and subtitles it.
	 */
	onBusDialogue(payload) {
		try {
			const text = payload?.dialogueText;
			if (typeof text !== 'string' || !text.trim()) return null;
			const id = String(payload?.npcId || payload?.id || payload?.profile?.id || 'npc');
			let entry = this.registry.get(id);
			if (!entry) {
				entry = this.registerNpc(id, {
					name: payload?.name || payload?.profile?.name || id,
					lines: [{ text, mood: payload?.dialogueMode || 'greeting' }]
				});
				entry.lineIndex = 1;
			}
			const plan = this.medaber.speech(this.gateSequenceFor(text));
			entry.lastSpokeAt = nowMs();
			entry.lastPlan = plan;
			this.active = { id: entry.id, name: entry.name, text, mood: payload?.dialogueMode || 'greeting', plan };
			this.showSubtitle(entry.name, text, payload?.dialogueMode || 'greeting', plan.durationMs);
			return this.active;
		} catch {
			return null;
		}
	}

	/** Re-scans a bound actor list so NPCs that stream in late still get voices. */
	rescanActors() {
		try {
			if (typeof this.actorScanner === 'function') this.actorScanner(this);
		} catch { /* scanning is best-effort */ }
	}

	/** Maps a line of text to explicit Medaber gate requests (word cadence, no phoneme inference). */
	gateSequenceFor(text) {
		const words = String(text || '').split(/\s+/).filter(Boolean).slice(0, MAX_WORDS_PER_PLAN);
		return words.map(word => ({
			gate: hashWord(word.toLowerCase()) % this.gateCount,
			durationMs: 110 + Math.min(260, word.length * 24)
		}));
	}

	readPlayerPosition() {
		try {
			return this.playerPositionProvider ? asPosition(this.playerPositionProvider()) : null;
		} catch {
			return null;
		}
	}

	readNpcPositions() {
		try {
			return this.npcPositionsProvider ? this.npcPositionsProvider() : null;
		} catch {
			return null;
		}
	}

	readEntryPosition(entry) {
		try {
			if (entry.getPosition) {
				const fromGetter = asPosition(entry.getPosition());
				if (fromGetter) return fromGetter;
			}
		} catch { /* fall through */ }
		return entry.position;
	}

	showSubtitle(name, text, mood, durationMs) {
		try {
			const el = this.ensureSubtitle();
			if (!el) return;
			this.subtitleNameEl.textContent = name;
			this.subtitleTextEl.textContent = text;
			el.dataset.mood = String(mood || 'greeting');
			el.style.display = 'block';
			if (this.hideTimer) clearTimeout(this.hideTimer);
			this.hideTimer = setTimeout(() => {
				el.style.display = 'none';
				this.hideTimer = 0;
				this.active = null;
			}, Math.max(MIN_SUBTITLE_MS, Number(durationMs) || 0));
		} catch { /* overlay is best-effort */ }
	}

	ensureSubtitle() {
		if (this.subtitleEl) return this.subtitleEl;
		try {
			const document = this.document;
			if (!document?.createElement || !document?.body) return null;
			const el = document.createElement('div');
			el.className = 'mitzvah-npc-subtitle';
			el.setAttribute('dir', 'auto');
			el.setAttribute('aria-live', 'polite');
			el.style.cssText = [
				'position:fixed', 'left:50%', 'bottom:11%', 'transform:translateX(-50%)',
				'max-width:min(640px,88vw)', 'padding:10px 18px 12px', 'border-radius:12px',
				'background:rgba(12,10,6,0.78)', 'border:1px solid rgba(255,216,115,0.35)',
				'color:#fdf6e3', 'font:15px/1.5 system-ui,sans-serif', 'text-align:center',
				'z-index:2147483000', 'display:none', 'pointer-events:none',
				'box-shadow:0 6px 24px rgba(0,0,0,0.45)'
			].join(';');
			const nameEl = document.createElement('div');
			nameEl.className = 'mitzvah-npc-subtitle-name';
			nameEl.style.cssText = 'color:#ffd873;font-weight:700;font-size:13px;letter-spacing:0.04em;margin-bottom:2px';
			const textEl = document.createElement('div');
			textEl.className = 'mitzvah-npc-subtitle-text';
			el.appendChild(nameEl);
			el.appendChild(textEl);
			document.body.appendChild(el);
			this.subtitleEl = el;
			this.subtitleNameEl = nameEl;
			this.subtitleTextEl = textEl;
			return el;
		} catch {
			return null;
		}
	}

	/** Read-only snapshot for diagnostics and tests. */
	diagnostics() {
		return Object.freeze({
			active: this.active ? { id: this.active.id, name: this.active.name } : null,
			gateCount: this.gateCount,
			registered: this.registry.size
		});
	}
}

function readPlayerPosition(runtime) {
	if (!runtime) return null;
	const candidates = [
		runtime.model?.position,
		runtime.state?.position,
		runtime.player?.position,
		runtime.state
	];
	for (const candidate of candidates) {
		const position = asPosition(candidate);
		if (position) return position;
	}
	return null;
}

function readNpcPositions(runtime) {
	const actors = runtime?.friendlyNpcs?.actors;
	if (!Array.isArray(actors)) return null;
	const positions = {};
	for (const actor of actors) {
		const id = actor?.profile?.id;
		if (!id) continue;
		const fromGroup = asPosition(actor?.group?.position);
		const fromWorld = (typeof actor?.worldX === 'number')
			? { x: actor.worldX, y: Number(actor.worldY) || 0, z: actor.worldZ || 0 }
			: null;
		const position = fromGroup || fromWorld || asPosition({ x: actor?.x, z: actor?.z });
		if (position) positions[id] = position;
	}
	return positions;
}

function profileLines(profile) {
	const dialogue = profile?.dialogue;
	if (!dialogue || typeof dialogue !== 'object') return [];
	const modes = Array.isArray(profile?.dialogueModes) && profile.dialogueModes.length > 0
		? profile.dialogueModes
		: Object.keys(dialogue);
	return modes
		.map(mode => typeof dialogue[mode] === 'string'
			? { mood: String(mode), text: dialogue[mode] }
			: null)
		.filter(Boolean);
}

function registerPopulationActors(dialogue, runtime) {
	const actors = runtime?.friendlyNpcs?.actors;
	if (!Array.isArray(actors)) return 0;
	let registered = 0;
	for (const actor of actors) {
		const profile = actor?.profile;
		if (!profile?.id || dialogue.registry.has(String(profile.id))) continue;
		dialogue.registerNpc(String(profile.id), {
			name: profile.name || String(profile.id),
			lines: profileLines(profile),
			getPosition: () => {
				const fromGroup = asPosition(actor?.group?.position);
				if (fromGroup) return fromGroup;
				if (typeof actor?.worldX === 'number') {
					return { x: actor.worldX, y: Number(actor.worldY) || 0, z: actor.worldZ || 0 };
				}
				return null;
			},
			radius: Number(profile.interactionRadius) > 0 ? Number(profile.interactionRadius) : undefined,
			actor
		});
		registered += 1;
	}
	return registered;
}

/**
 * Attaches one NPC dialogue vessel to a game runtime.
 * @param {object} [gameContext={}] Carries `runtime`; optional `document`,
 * `playerPosition`, `npcPositions`, `radius`, `cooldownMs`, `defaultLines`.
 * @returns {{dialogue, register, speak, update, dismiss}} Dialogue controls.
 */
export function attachNpcDialogue(gameContext = {}) {
	const runtime = gameContext.runtime || null;
	const dialogue = new MitzvahNpcDialogue({
		cooldownMs: gameContext.cooldownMs,
		document: gameContext.document,
		npcPositions: gameContext.npcPositions || (() => readNpcPositions(runtime)),
		playerPosition: gameContext.playerPosition || (() => readPlayerPosition(runtime)),
		radius: gameContext.radius
	});
	dialogue.actorScanner = handle => registerPopulationActors(handle, runtime);
	registerPopulationActors(dialogue, runtime);
	if (Array.isArray(gameContext.defaultLines)) {
		for (const preset of gameContext.defaultLines) {
			try {
				if (preset?.id && !dialogue.registry.has(String(preset.id))) {
					dialogue.registerNpc(preset.id, preset);
				}
			} catch { /* presets are best-effort */ }
		}
	}
	try {
		runtime?.bus?.on?.('npc:dialogue', payload => dialogue.onBusDialogue(payload));
	} catch { /* bus is optional */ }
	try {
		runtime?.bus?.on?.('npc:clear', () => dialogue.dismiss());
	} catch { /* bus is optional */ }
	if (runtime) {
		runtime.mitzvahNpcDialogue = dialogue;
	}
	return Object.freeze({
		dialogue,
		register: (id, config) => dialogue.registerNpc(id, config),
		speak: (id, lineIndex) => dialogue.speak(id, lineIndex),
		update: (playerPosition, npcPositions) => dialogue.update(playerPosition, npcPositions),
		dismiss: () => dialogue.dismiss(),
		diagnostics: () => dialogue.diagnostics()
	});
}

export default MitzvahNpcDialogue;
