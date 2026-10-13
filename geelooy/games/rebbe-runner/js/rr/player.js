/* B"H — The runner: procedural chassid instantly, GLB chossid swaps in when ready. */
import * as THREE from '/games/scripts/build/three.module.js';
import { GLTFLoader } from '/games/scripts/jsm/loaders/GLTFLoader.js';
import {
	loadWardrobe,
	applyWardrobe,
	applyWardrobeToFallback,
	subscribeWardrobe
} from '/games/scripts/wardrobe/ChossidWardrobe.js';

const GLB_URL = '/games/mitzvahWorld/build/generated/assets/d86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48/chossid.glb';

function tagSlot(material, slot) {
	material.userData = material.userData || {};
	material.userData.wardrobeSlot = slot;
	return material;
}

function buildFallbackChassid() {
	// Stylized chassid from primitives: black hat, head, beard, coat, legs.
	const g = new THREE.Group();
	const skin = tagSlot(new THREE.MeshStandardMaterial({ color: 0xe8b88a, roughness: .8 }), 'skin');
	const black = tagSlot(new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: .85 }), 'jacket');
	const hatBlack = tagSlot(new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: .85 }), 'tophat');
	const white = tagSlot(new THREE.MeshStandardMaterial({ color: 0xf2ede0, roughness: .9 }), 'shirt');
	const pantsBlack = tagSlot(new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: .85 }), 'pants');
	const shoeBlack = tagSlot(new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: .85 }), 'shoes');
	const beardMat = tagSlot(new THREE.MeshStandardMaterial({ color: 0x4a2f1a, roughness: 1 }), 'hair');

	const head = new THREE.Mesh(new THREE.SphereGeometry(.22, 12, 10), skin);
	head.position.y = 1.52; g.add(head);
	const beard = new THREE.Mesh(new THREE.ConeGeometry(.13, .3, 8), beardMat);
	beard.position.set(0, 1.34, .14); g.add(beard);
	const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .22, 12), hatBlack);
	hatTop.position.y = 1.78; g.add(hatTop);
	const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(.32, .32, .04, 14), hatBlack);
	hatBrim.position.y = 1.68; g.add(hatBrim);
	const coat = new THREE.Mesh(new THREE.CylinderGeometry(.24, .34, .85, 10), black);
	coat.position.y = .95; g.add(coat);
	const shirt = new THREE.Mesh(new THREE.PlaneGeometry(.12, .5), white);
	shirt.position.set(0, 1.05, .3); g.add(shirt);

	const legL = new THREE.Group(), legR = new THREE.Group();
	for (const [leg, x] of [[legL, -.13], [legR, .13]]) {
		const thigh = new THREE.Mesh(new THREE.CylinderGeometry(.09, .08, .5, 8), pantsBlack);
		thigh.position.y = -.25; leg.add(thigh);
		const shoe = new THREE.Mesh(new THREE.BoxGeometry(.14, .1, .3), shoeBlack);
		shoe.position.set(0, -.52, .06); leg.add(shoe);
		leg.position.set(x, .62, 0);
		g.add(leg);
	}
	const armL = new THREE.Group(), armR = new THREE.Group();
	for (const [arm, x] of [[armL, -.32], [armR, .32]]) {
		const a = new THREE.Mesh(new THREE.CylinderGeometry(.07, .06, .55, 8), black);
		a.position.y = -.27; arm.add(a);
		arm.position.set(x, 1.28, 0);
		g.add(arm);
	}
	return { group: g, legL, legR, armL, armR, procedural: true };
}

export function createPlayer(scene, onProgress) {
	const root = new THREE.Group();
	scene.add(root);

	// Procedural chassid shows INSTANTLY — no waiting on network.
	const parts = buildFallbackChassid();
	root.add(parts.group);
	// B"H — unified wardrobe: the fallback wears the user's look too.
	applyWardrobeToFallback(parts);

	let model = null;
	let mixer = null;
	let glbReady = false;

	// Live wardrobe updates: re-apply to whichever body is showing.
	const unsubscribeWardrobe = subscribeWardrobe((cfg) => {
		try {
			if (model) applyWardrobe(model, cfg);
			else applyWardrobeToFallback(parts, cfg);
		} catch (_) { /* never breaks gameplay */ }
	});

	// GLB upgrades the character in the background when it arrives.
	(async () => {
		try {
			const loader = new GLTFLoader();
			const gltf = await new Promise((resolve, reject) => {
				const timer = setTimeout(() => reject(new Error('GLB load timeout')), 20000);
				loader.load(GLB_URL, (g) => { clearTimeout(timer); resolve(g); }, (e) => {
					if (e && e.loaded && e.total) { try { onProgress && onProgress(e.loaded / e.total); } catch (_) {} }
				}, (err) => { clearTimeout(timer); reject(err); });
			});
			model = gltf.scene;
			// B"H — unified wardrobe: the GLB wears the user's saved look on boot.
			applyWardrobe(model, loadWardrobe());
			const box = new THREE.Box3().setFromObject(model);
			const size = new THREE.Vector3(); box.getSize(size);
			model.scale.setScalar(1.8 / Math.max(size.y, .001));
			model.rotation.y = Math.PI; // face away from camera
			root.remove(parts.group);
			root.add(model);
			if (gltf.animations && gltf.animations.length) {
				mixer = new THREE.AnimationMixer(model);
				const clip = gltf.animations.find(a => /run|walk|move/i.test(a.name)) || gltf.animations[0];
				mixer.clipAction(clip).play();
			}
			glbReady = true;
		} catch (err) {
			console.warn('[rebbe-runner] GLB unavailable, keeping procedural chassid:', err && err.message);
		}
	})();

	// blob shadow
	const shadow = new THREE.Mesh(
		new THREE.CircleGeometry(.55, 20),
		new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .35, depthWrite: false })
	);
	shadow.rotation.x = -Math.PI / 2;
	shadow.position.y = .02;
	scene.add(shadow);

	const state = {
		lane: 0,            // -1, 0, 1
		x: 0,
		y: 0, vy: 0,
		sliding: 0,         // slide timer
		jumping: false,
		runPhase: 0,
		invuln: 0,
	};

	const LANE_X = [-2.2, 0, 2.2];

	return {
		state,
		root,
		get glbReady() { return glbReady; },
		/** Re-applies the current wardrobe (e.g. after returning to the game). */
		refreshWardrobe() {
			try {
				const cfg = loadWardrobe();
				if (model) applyWardrobe(model, cfg);
				else applyWardrobeToFallback(parts, cfg);
			} catch (_) { /* never breaks gameplay */ }
		},
		/** Cleans up the wardrobe subscription. */
		destroy() {
			try { if (unsubscribeWardrobe) unsubscribeWardrobe(); } catch (_) { /* ignore */ }
		},
		reset() {
			state.lane = 0; state.x = 0; state.y = 0; state.vy = 0;
			state.sliding = 0; state.jumping = false; state.invuln = 0;
			root.position.set(0, 0, 0);
			root.rotation.set(0, 0, 0);
			root.scale.set(1, 1, 1);
			root.visible = true;
		},
		moveLane(dir) {
			state.lane = Math.max(-1, Math.min(1, state.lane + dir));
		},
		jump() {
			if (state.jumping || state.sliding > 0) return false;
			state.jumping = true; state.vy = 7.2;
			return true;
		},
		slide() {
			if (state.jumping) { state.vy = Math.min(state.vy, -9); } // slam down
			if (state.sliding > 0) return false;
			state.sliding = .75;
			return true;
		},
		hit() {
			state.invuln = 1.6;
		},
		update(dt) {
			// lane glide
			const targetX = LANE_X[state.lane + 1];
			state.x += (targetX - state.x) * Math.min(1, dt * 12);
			root.position.x = state.x;
			root.rotation.z = THREE.MathUtils.clamp((targetX - state.x) * -.18, -.3, .3);

			// jump physics
			if (state.jumping) {
				state.vy -= 22 * dt;
				state.y += state.vy * dt;
				if (state.y <= 0) { state.y = 0; state.jumping = false; state.vy = 0; }
			}
			if (state.sliding > 0) state.sliding -= dt;
			if (state.invuln > 0) {
				state.invuln -= dt;
				root.visible = Math.floor(state.invuln * 12) % 2 === 0;
				if (state.invuln <= 0) root.visible = true;
			}

			root.position.y = state.y;
			// slide pose
			const targetScaleY = state.sliding > 0 ? .55 : 1;
			root.scale.y += (targetScaleY - root.scale.y) * Math.min(1, dt * 14);
			if (state.sliding > 0) root.rotation.x = .35; else root.rotation.x *= .8;

			// run animation
			state.runPhase += dt * 11;
			if (!glbReady) {
				const p = state.runPhase;
				const amp = state.jumping ? .15 : 1;
				parts.legL.rotation.x = Math.sin(p) * .85 * amp;
				parts.legR.rotation.x = Math.sin(p + Math.PI) * .85 * amp;
				parts.armL.rotation.x = Math.sin(p + Math.PI) * .7 * amp;
				parts.armR.rotation.x = Math.sin(p) * .7 * amp;
				parts.group.position.y = Math.abs(Math.sin(p)) * .09 * amp;
			} else if (mixer) {
				mixer.update(dt);
				root.position.y = state.y + Math.abs(Math.sin(state.runPhase)) * .06;
			} else if (model) {
				root.position.y = state.y + Math.abs(Math.sin(state.runPhase)) * .07;
			}

			// shadow follows x, shrinks with height
			shadow.position.x = state.x;
			const shScale = Math.max(.4, 1 - state.y * .18);
			shadow.scale.set(shScale, shScale, 1);
			shadow.material.opacity = Math.max(.12, .35 - state.y * .07);
		}
	};
}
