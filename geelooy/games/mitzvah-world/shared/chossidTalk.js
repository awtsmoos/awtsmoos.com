// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chossidTalk.js
 * @description Talking mouth for the canonical Chossid: a jaw pivot hinged at
 * the jaw joint drives the rigid `teeth` (+ `choytem`/chin) meshes so the mouth
 * opens and the teeth show. Includes a syllable-driven `speak()` and a tiny
 * phoneme→viseme map for lip-sync exploration.
 */

import * as THREE from "three";

/** Jaw drop (world units) at full open. */
const JAW_DROP = 0.075;

/** Phoneme classes → jaw openness 0..1 (lip-sync exploration). */
const VISEME_MAP = [
	{ re: /[aAoO0]/, open: 1.0, name: "open" }, // wide vowels
	{ re: /[eE]/, open: 0.55, name: "half" }, // mid vowels
	{ re: /[iIuU]/, open: 0.3, name: "narrow" }, // narrow vowels
	{ re: /[mMbBpP]/, open: 0.02, name: "closed" }, // bilabials: lips together
	{ re: /[fFvV]/, open: 0.18, name: "bite" }, // labiodentals
	{ re: /[lLnNdDtTsSzZ]/, open: 0.35, name: "tip" }, // tongue-tip sounds
	{ re: /[wW]/, open: 0.22, name: "round" }, // rounded
	{ re: /[rR]/, open: 0.4, name: "half" },
	{ re: /[gGkKhH]/, open: 0.5, name: "half" },
	{ re: /[yY]/, open: 0.3, name: "narrow" },
];

/**
 * Attaches a talking-mouth rig to a variant's nodes.
 *
 * The base face is a closed surface, so the visible mouth is a canvas-textured
 * "mouth card" floating just off the face at the mouth line: dark interior,
 * upper/lower teeth, and tongue, redrawn per openness. Underneath, the real
 * 3D teeth + chin (choytem) meshes translate down in head-bone space (direction
 * solved from the bone's world orientation, so "down" is truly world-down),
 * and the 3D lips thin — so the motion is physical, not just a texture swap.
 * @param {{head: THREE.Object3D, teeth: THREE.Object3D, choytem: THREE.Object3D, lips?: THREE.Object3D}} nodes
 * @returns {{setOpen: (amount:number)=>void, getOpen: ()=>number}|null}
 */
export function attachTalk(nodes) {
	if (!nodes || !nodes.head || !nodes.teeth) return null;
	const head = nodes.head;
	head.updateWorldMatrix(true, false);

	// Head-bone-local direction for world-down (and world-forward).
	const q = new THREE.Quaternion();
	head.getWorldQuaternion(q).invert();
	const localDown = new THREE.Vector3(0, -1, 0).applyQuaternion(q);
	const localForward = new THREE.Vector3(0, 0, 1).applyQuaternion(q);

	// Base local positions.
	const teethBase = nodes.teeth.position.clone();
	const chinBase = nodes.choytem ? nodes.choytem.position.clone() : null;
	const lips = nodes.lips || null;
	const lipsBase = lips ? lips.position.clone() : null;
	const lipsScaleBase = lips ? lips.scale.clone() : null;

	// --- Mouth card ---------------------------------------------------------
	const CW = 128, CH = 128;
	const canvas = document.createElement("canvas");
	canvas.width = CW; canvas.height = CH;
	const ctx = canvas.getContext("2d");
	const tex = new THREE.CanvasTexture(canvas);
	tex.colorSpace = THREE.SRGBColorSpace;

	function drawMouth(open) {
		ctx.clearRect(0, 0, CW, CH);
		if (open < 0.03) return;
		const cx = CW / 2, cy = CH / 2;
		const w = 72, h = 14 + open * 62;
		ctx.fillStyle = "#2e0a0a";
		ctx.beginPath();
		ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
		ctx.fill();
		const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, w / 2);
		g.addColorStop(0, "rgba(0,0,0,0.6)");
		g.addColorStop(1, "rgba(0,0,0,0)");
		ctx.fillStyle = g;
		ctx.beginPath(); ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.fill();
		const th = Math.min(30, 10 + open * 22);
		ctx.fillStyle = "#f7f4ec";
		ctx.fillRect(cx - w / 2 + 4, cy - h / 2, w - 8, th);
		ctx.strokeStyle = "rgba(120,110,100,0.7)";
		ctx.lineWidth = 1.5;
		for (let i = 1; i < 6; i++) {
			const x = cx - w / 2 + 4 + ((w - 8) / 6) * i;
			ctx.beginPath(); ctx.moveTo(x, cy - h / 2); ctx.lineTo(x, cy - h / 2 + th); ctx.stroke();
		}
		ctx.fillStyle = "rgba(255,255,255,0.35)";
		ctx.fillRect(cx - w / 2 + 4, cy - h / 2, w - 8, 3);
		if (open > 0.5) {
			const lh = (open - 0.5) * 30;
			ctx.fillStyle = "#efe9dc";
			ctx.fillRect(cx - w / 2 + 8, cy + h / 2 - lh, w - 16, lh);
		}
		if (open > 0.3) {
			ctx.fillStyle = "#b45a5a";
			ctx.beginPath();
			ctx.ellipse(cx, cy + h / 2 - 10, w / 3.5, 12 + open * 8, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = "rgba(255,255,255,0.18)";
			ctx.beginPath();
			ctx.ellipse(cx - 6, cy + h / 2 - 12, w / 8, 5, -0.3, 0, Math.PI * 2);
			ctx.fill();
		}
		tex.needsUpdate = true;
	}

	// Card placement: teeth world -> head-local, then nudge forward off the face.
	const teethWorld = new THREE.Vector3();
	nodes.teeth.getWorldPosition(teethWorld);
	const cardLocal = head.worldToLocal(teethWorld.clone());
	// Push forward along head-local forward until clear of the face surface.
	cardLocal.addScaledVector(localForward, 0.03);
	cardLocal.addScaledVector(localDown, -0.002); // tiny up nudge

	const cardMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
	const card = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.11), cardMat);
	card.name = "awtsmoosMouthCard";
	card.position.copy(cardLocal);
	card.renderOrder = 5;
	head.add(card);
	// Face the card along head-local forward.
	card.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), localForward.clone().normalize());
	card.visible = false;

	let current = -1;
	function setOpen(amount) {
		amount = Math.max(0, Math.min(1, amount));
		if (Math.abs(amount - current) < 0.004) return;
		current = amount;
		// Physical jaw: drop the real teeth/chin straight down.
		nodes.teeth.position.copy(teethBase).addScaledVector(localDown, current * JAW_DROP);
		if (nodes.choytem && chinBase) {
			nodes.choytem.position.copy(chinBase).addScaledVector(localDown, current * JAW_DROP * 0.9);
		}
		// Mouth card on/off.
		card.visible = current > 0.03;
		if (card.visible) drawMouth(current);
		// Lips thin and tuck as the card takes over.
		if (lips && lipsBase) {
			lips.position.copy(lipsBase).addScaledVector(localDown, current * JAW_DROP * 0.45);
			const k = 1 - current * 0.55;
			lips.scale.set(lipsScaleBase.x, lipsScaleBase.y * k, lipsScaleBase.z);
			lips.visible = current < 0.75;
		}
	}
	setOpen(0);
	return { setOpen, getOpen: () => current };
}

/** Splits text into syllable-ish chunks (vowel-group heuristic). */
export function syllablesOf(text) {
	const chunks =
		String(text || "").match(/[^aeiouAEIOU\s]*[aeiouAEIOU]+[^aeiouAEIOU\s]*/g) ||
		[];
	return chunks.length ? chunks : [String(text || "")];
}

/** Returns the viseme openness for one syllable (uses its stressed vowel). */
export function visemeFor(syllable) {
	const vowel = (String(syllable).match(/[aeiouAEIOU]/) || ["e"])[0];
	for (const v of VISEME_MAP) {
		if (v.re.test(vowel)) return v;
	}
	return { open: 0.45, name: "half" };
}

/**
 * Speaks text through the jaw: each syllable opens/closes the mouth with an
 * ease, shaped by the viseme map. Teeth show on open vowels.
 * @param {{setOpen:(n:number)=>void}} talk
 * @param {string} text
 * @param {object} [opts]
 * @param {number} [opts.syllableMs=150]
 * @param {(syllable:string, index:number)=>void} [opts.onSyllable]
 * @returns {Promise<void>} resolves when the line is finished
 */
export function speak(talk, text, opts = {}) {
	const { syllableMs = 150, onSyllable = null } = opts;
	const syls = syllablesOf(text);
	return new Promise((resolve) => {
		let i = 0;
		let raf = 0;
		const step = () => {
			if (i >= syls.length) {
				talk.setOpen(0);
				resolve();
				return;
			}
			const syl = syls[i];
			const v = visemeFor(syl);
			if (onSyllable) {
				try {
					onSyllable(syl, i);
				} catch {}
			}
			const t0 = performance.now();
			const dur = Math.max(90, syllableMs * (0.7 + 0.3 * v.open));
			const tick = () => {
				const t = Math.min(1, (performance.now() - t0) / dur);
				// Open fast, close with ease: sin curve.
				talk.setOpen(v.open * Math.sin(Math.PI * t));
				if (t < 1) {
					raf = requestAnimationFrame(tick);
				} else {
					i++;
					raf = requestAnimationFrame(step);
				}
			};
			tick();
		};
		step();
		// Safety: never trap the caller.
		setTimeout(() => {
			cancelAnimationFrame(raf);
			talk.setOpen(0);
			resolve();
		}, syls.length * (syllableMs + 60) + 500);
	});
}

/**
 * Continuous talking loop (for dialogue scenes). Call the returned stop().
 * @param {{setOpen:(n:number)=>void}} talk
 * @param {object} [opts]
 */
export function startTalking(talk, opts = {}) {
	const { baseMs = 130 } = opts;
	let stopped = false;
	let raf = 0;
	const phonemes = "aeioumbeolr".split("");
	const loop = () => {
		if (stopped) return;
		const v = visemeFor(phonemes[(Math.random() * phonemes.length) | 0]);
		const t0 = performance.now();
		const dur = baseMs * (0.8 + Math.random() * 0.5);
		const tick = () => {
			if (stopped) return;
			const t = Math.min(1, (performance.now() - t0) / dur);
			talk.setOpen(v.open * Math.sin(Math.PI * t));
			if (t < 1) raf = requestAnimationFrame(tick);
			else raf = requestAnimationFrame(loop);
		};
		tick();
	};
	loop();
	return () => {
		stopped = true;
		cancelAnimationFrame(raf);
		talk.setOpen(0);
	};
}
