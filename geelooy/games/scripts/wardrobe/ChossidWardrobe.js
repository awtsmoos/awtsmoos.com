//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ChossidWardrobe.js
 * @description The ONE unified Chossid character customization system for every Awtsmoos game.
 * Change the wardrobe in any game and it updates across ALL games instantly.
 *
 * Works with both THREE.js GLTF scenes and the native procedural-core scene graph:
 * - THREE materials: material.color.set('#hex')
 * - Native materials: material.color = [r, g, b, a]
 *
 * Persistence: localStorage (per-user on device) + cross-tab sync via
 * `storage` events and BroadcastChannel, so every open game updates live.
 *
 * GLB material slots (from chossid.glb d86fd328...):
 *   skin, pants, shirt, shoes, lips, hair, glasses-frame, glasses-glass,
 *   eye-color, pupil, eye-white, tophat, yamulka, jacket, jacket.001,
 *   outer-shirt, teffilinStrap, teffilinBayis, teffilinShin
 * GLB toggle nodes: top-hat, yarmalka, glass-left/right, glasses-eye-left/right,
 *   teffilinRoshTitura, shinLeft/shinRight, teffilinArmBayis, tefillinArmTitura,
 *   tzitis, beard
 */

export const WARDROBE_KEY = "awtsmoos.chossid.wardrobe.v1";
export const WARDROBE_CHANNEL = "awtsmoos-chossid-wardrobe";
export const WARDROBE_EVENT = "awtsmoos:wardrobe-change";

/** Maps wardrobe color keys to GLB material names. */
export const MATERIAL_SLOTS = Object.freeze({
	jacket: ["jacket", "jacket.001"],
	pants: ["pants"],
	shirt: ["shirt", "outer-shirt"],
	shoes: ["shoes"],
	tophat: ["tophat"],
	yamulka: ["yamulka"],
	skin: ["skin"],
	hair: ["hair"],
	eyes: ["eye-color"],
	glassesFrame: ["glasses-frame"],
	lips: ["lips"]
});

/** Maps wardrobe toggle keys to GLB node names. */
export const NODE_TOGGLES = Object.freeze({
	hat: {
		tophat: ["top-hat"],
		yamulka: ["yarmalka"],
		none: []
	},
	glasses: ["glass-left", "glass-right", "glasses-eye-left", "glasses-eye-right"],
	tefillin: [
		"teffilinRoshTitura",
		"shinLeft",
		"shinRight",
		"teffilinArmBayis",
		"tefillinArmTitura"
	],
	tzitzis: ["tzitis"],
	beard: ["beard", "mustache"]
});

export const WARDROBE_DEFAULTS = Object.freeze({
	version: 1,
	colors: Object.freeze({
		jacket: "#1b1b22",
		pants: "#1b1b22",
		shirt: "#f5f0e6",
		shoes: "#0d0d10",
		tophat: "#141419",
		yamulka: "#141419",
		skin: "#d9a06f",
		hair: "#4a2f1a",
		eyes: "#0e7dff",
		glassesFrame: "#1c2733",
		lips: "#a66a63"
	}),
	hat: "tophat",
	glasses: true,
	tefillin: false,
	tzitzis: true,
	beard: true
});

/** Curated palettes for the wardrobe UI. */
export const WARDROBE_PALETTES = Object.freeze({
	coat: ["#1b1b22", "#2b2118", "#3d2b1f", "#4a4a55", "#5c1a1a", "#1a3a5c", "#0f2e1f", "#6b5a2a"],
	pants: ["#1b1b22", "#2b2b33", "#3d2b1f", "#4a4a55", "#0f2e1f", "#1a3a5c"],
	shirt: ["#f5f0e6", "#ffffff", "#e8dcc8", "#d4e4f5", "#f0d4d4", "#1b1b22"],
	shoes: ["#0d0d10", "#2b2118", "#4a2f1a", "#1b1b22", "#5c1a1a"],
	hat: ["#141419", "#1b1b22", "#2b2118", "#3d2b1f", "#0f2e1f", "#1a3a5c", "#5c1a1a", "#6b5a2a"],
	skin: ["#f0c8a0", "#d9a06f", "#b57e4e", "#8a5a34", "#6b4226"],
	hair: ["#1a1a1a", "#4a2f1a", "#6b4a2a", "#8a6a4a", "#a0a0a0", "#d4d4d4"],
	eyes: ["#0e7dff", "#2e8b57", "#8b4513", "#4a2f1a", "#1a1a1a", "#6a0dad"],
	glasses: ["#1c2733", "#0d0d10", "#4a2f1a", "#6b5a2a", "#8a8a8a"],
	lips: ["#a66a63", "#c08078", "#8a4a44", "#d4a098"]
});

export const HAT_STYLES = Object.freeze([
	{ id: "tophat", label: "Top Hat", description: "Classic tall black hat" },
	{ id: "yamulka", label: "Yarmulka", description: "Skullcap" },
	{ id: "none", label: "No Hat", description: "Bare head" }
]);

const _subscribers = new Set();
let _channel = null;
let _listening = false;

function getChannel() {
	try {
		if (typeof BroadcastChannel === "undefined") return null;
		if (!_channel) _channel = new BroadcastChannel(WARDROBE_CHANNEL);
		return _channel;
	} catch (_) {
		return null;
	}
}

function ensureListening() {
	if (_listening) return;
	_listening = true;
	try {
		if (typeof window !== "undefined") {
			window.addEventListener("storage", (event) => {
				if (event.key === WARDROBE_KEY && event.newValue) {
					try {
						notifyLocal(JSON.parse(event.newValue));
					} catch (_) { /* malformed, ignore */ }
				}
			});
		}
	} catch (_) { /* no window */ }
	const channel = getChannel();
	if (channel) {
		channel.onmessage = (event) => {
			if (event && event.data) notifyLocal(event.data);
		};
	}
}

function notifyLocal(cfg) {
	for (const cb of _subscribers) {
		try { cb(cfg); } catch (_) { /* subscriber error isolated */ }
	}
}

/** Loads the wardrobe, merging over defaults so new slots appear gracefully. */
export function loadWardrobe() {
	let stored = null;
	try {
		const raw = typeof localStorage !== "undefined"
			? localStorage.getItem(WARDROBE_KEY)
			: null;
		if (raw) stored = JSON.parse(raw);
	} catch (_) { stored = null; }
	const merged = {
		version: 1,
		colors: { ...WARDROBE_DEFAULTS.colors, ...(stored && stored.colors ? stored.colors : {}) },
		hat: stored && typeof stored.hat === "string" ? stored.hat : WARDROBE_DEFAULTS.hat,
		glasses: stored && typeof stored.glasses === "boolean" ? stored.glasses : WARDROBE_DEFAULTS.glasses,
		tefillin: stored && typeof stored.tefillin === "boolean" ? stored.tefillin : WARDROBE_DEFAULTS.tefillin,
		tzitzis: stored && typeof stored.tzitzis === "boolean" ? stored.tzitzis : WARDROBE_DEFAULTS.tzitzis,
		beard: stored && typeof stored.beard === "boolean" ? stored.beard : WARDROBE_DEFAULTS.beard
	};
	return merged;
}

/**
 * Saves the wardrobe: localStorage + cross-tab broadcast + window event.
 * Every open game receives the update and re-applies it live.
 */
export function saveWardrobe(patch) {
	const current = loadWardrobe();
	const next = {
		version: 1,
		colors: { ...current.colors, ...(patch.colors || {}) },
		hat: patch.hat !== undefined ? patch.hat : current.hat,
		glasses: patch.glasses !== undefined ? patch.glasses : current.glasses,
		tefillin: patch.tefillin !== undefined ? patch.tefillin : current.tefillin,
		tzitzis: patch.tzitzis !== undefined ? patch.tzitzis : current.tzitzis,
		beard: patch.beard !== undefined ? patch.beard : current.beard
	};
	try {
		if (typeof localStorage !== "undefined") {
			localStorage.setItem(WARDROBE_KEY, JSON.stringify(next));
		}
	} catch (_) { /* storage unavailable */ }
	const channel = getChannel();
	if (channel) {
		try { channel.postMessage(next); } catch (_) { /* ignore */ }
	}
	try {
		if (typeof window !== "undefined") {
			window.dispatchEvent(new CustomEvent(WARDROBE_EVENT, { detail: next }));
		}
	} catch (_) { /* no window */ }
	notifyLocal(next);
	return next;
}

/** Resets the wardrobe to defaults and broadcasts. */
export function resetWardrobe() {
	try {
		if (typeof localStorage !== "undefined") localStorage.removeItem(WARDROBE_KEY);
	} catch (_) { /* ignore */ }
	return saveWardrobe({});
}

/**
 * Subscribes to wardrobe changes. Returns an unsubscribe function.
 * Fires for changes made in any tab/game.
 */
export function subscribeWardrobe(callback) {
	ensureListening();
	_subscribers.add(callback);
	try {
		if (typeof window !== "undefined") {
			const handler = (event) => { if (event.detail) callback(event.detail); };
			window.addEventListener(WARDROBE_EVENT, handler);
			return () => {
				_subscribers.delete(callback);
				window.removeEventListener(WARDROBE_EVENT, handler);
			};
		}
	} catch (_) { /* no window */ }
	return () => { _subscribers.delete(callback); };
}

/** Converts a CSS hex color to a 0-1 [r, g, b] array for the native runtime. */
export function hexToRgbArray(hex) {
	const clean = String(hex || "").replace("#", "");
	const full = clean.length === 3
		? clean.split("").map((c) => c + c).join("")
		: clean;
	const num = parseInt(full.slice(0, 6), 16);
	if (Number.isNaN(num)) return [0.1, 0.1, 0.1];
	return [
		((num >> 16) & 255) / 255,
		((num >> 8) & 255) / 255,
		(num & 255) / 255
	];
}

/** Applies one color to one material, handling both THREE and native runtimes. */
function applyColorToMaterial(material, hex) {
	if (!material) return;
	try {
		if (material.color && typeof material.color.set === "function") {
			// THREE.js: Color.set accepts CSS hex strings.
			material.color.set(hex);
		} else if (Array.isArray(material.color)) {
			// Native runtime: color is an [r, g, b, a] array.
			const rgb = hexToRgbArray(hex);
			const alpha = material.color[3] !== undefined ? material.color[3] : 1;
			material.color[0] = rgb[0];
			material.color[1] = rgb[1];
			material.color[2] = rgb[2];
			material.color[3] = alpha;
		} else if (material.color && typeof material.color === "object") {
			// Plain {r, g, b} object.
			const rgb = hexToRgbArray(hex);
			material.color.r = rgb[0];
			material.color.g = rgb[1];
			material.color.b = rgb[2];
		}
		if (typeof material.needsUpdate !== "undefined") material.needsUpdate = true;
	} catch (_) { /* one bad material never breaks the wardrobe */ }
}

function collectMaterials(root) {
	const byName = new Map();
	const collectFromNode = (node) => {
		if (!node) return;
		const mats = node.material
			? (Array.isArray(node.material) ? node.material : [node.material])
			: [];
		for (const mat of mats) {
			if (mat && mat.name && !byName.has(mat.name)) byName.set(mat.name, mat);
		}
	};
	if (root && typeof root.traverse === "function") {
		root.traverse(collectFromNode);
		return byName;
	}
	// Fallback: manual recursion for scene graphs without traverse().
	const visit = (node) => {
		if (!node) return;
		collectFromNode(node);
		const children = node.children || [];
		for (const child of children) visit(child);
	};
	visit(root);
	return byName;
}

function collectNodes(root) {
	const byName = new Map();
	const visit = (node) => {
		if (!node) return;
		if (node.name && !byName.has(node.name)) byName.set(node.name, node);
		const children = node.children || [];
		for (const child of children) visit(child);
	};
	if (root && typeof root.traverse === "function") {
		root.traverse((node) => {
			if (node && node.name && !byName.has(node.name)) byName.set(node.name, node);
		});
	} else {
		visit(root);
	}
	return byName;
}

/**
 * Applies the wardrobe to any chossid scene root (THREE or native).
 * Recolors named materials and toggles named accessory nodes.
 * Safe to call repeatedly; never throws.
 *
 * @param {object} root Scene/group containing the chossid model.
 * @param {object} [wardrobe] Wardrobe config; defaults to loadWardrobe().
 * @returns {object} Summary of what was applied.
 */
export function applyWardrobe(root, wardrobe) {
	const cfg = wardrobe || loadWardrobe();
	const applied = { colors: 0, toggles: 0 };
	if (!root) return applied;
	try {
		const materials = collectMaterials(root);
		for (const [slot, materialNames] of Object.entries(MATERIAL_SLOTS)) {
			const hex = cfg.colors && cfg.colors[slot];
			if (!hex) continue;
			for (const name of materialNames) {
				const mat = materials.get(name);
				if (mat) {
					applyColorToMaterial(mat, hex);
					applied.colors += 1;
				}
			}
		}
		const nodes = collectNodes(root);
		// Hat: exactly one of tophat / yamulka / none is visible.
		const hatChoice = cfg.hat || "tophat";
		for (const [style, nodeNames] of Object.entries(NODE_TOGGLES.hat)) {
			for (const name of nodeNames) {
				const node = nodes.get(name);
				if (node) {
					node.visible = style === hatChoice;
					applied.toggles += 1;
				}
			}
		}
		// Boolean accessory toggles.
		for (const key of ["glasses", "tefillin", "tzitzis", "beard"]) {
			const visible = cfg[key] !== false;
			for (const name of NODE_TOGGLES[key]) {
				const node = nodes.get(name);
				if (node) {
					node.visible = visible;
					applied.toggles += 1;
				}
			}
		}
	} catch (_) { /* wardrobe never breaks gameplay */ }
	return applied;
}

/**
 * Applies wardrobe colors to a procedural (primitive-built) fallback chassid,
 * like the ones in rebbe-runner and shema-strike before the GLB arrives.
 * The fallback builder tags its materials via userData.wardrobeSlot.
 *
 * @param {object} parts The fallback parts object from buildFallbackChassid().
 * @param {object} [wardrobe] Wardrobe config; defaults to loadWardrobe().
 */
export function applyWardrobeToFallback(parts, wardrobe) {
	const cfg = wardrobe || loadWardrobe();
	if (!parts || !parts.group) return;
	try {
		parts.group.traverse((node) => {
			const slot = node && node.material && node.material.userData
				? node.material.userData.wardrobeSlot
				: null;
			const hex = slot && cfg.colors ? cfg.colors[slot] : null;
			if (hex) applyColorToMaterial(node.material, hex);
		});
	} catch (_) { /* never breaks gameplay */ }
}
