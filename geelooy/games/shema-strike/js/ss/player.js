/* B"H — Shema Strike player: procedural chassid instantly, chossid.glb swaps in, side view. */
import * as THREE from '/games/scripts/build/three.module.js';
import { GLTFLoader } from '/games/scripts/jsm/loaders/GLTFLoader.js';

const GLB_URL = '/games/mitzvahWorld/build/generated/assets/d86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48/chossid.glb';

function buildFallbackChassid() {
	const g = new THREE.Group();
	const skin = new THREE.MeshStandardMaterial({ color: 0xe8b88a, roughness: .8 });
	const black = new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: .85 });
	const white = new THREE.MeshStandardMaterial({ color: 0xf2ede0, roughness: .9 });

	const head = new THREE.Mesh(new THREE.SphereGeometry(.22, 12, 10), skin);
	head.position.y = 1.52; g.add(head);
	const beard = new THREE.Mesh(new THREE.ConeGeometry(.13, .3, 8),
		new THREE.MeshStandardMaterial({ color: 0x4a2f1a, roughness: 1 }));
	beard.position.set(.14, 1.34, 0); beard.rotation.z = -Math.PI / 2; g.add(beard);
	const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .22, 12), black);
	hatTop.position.y = 1.78; g.add(hatTop);
	const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(.32, .32, .04, 14), black);
	hatBrim.position.y = 1.68; g.add(hatBrim);
	const coat = new THREE.Mesh(new THREE.CylinderGeometry(.24, .34, .85, 10), black);
	coat.position.y = .95; g.add(coat);
	const shirt = new THREE.Mesh(new THREE.PlaneGeometry(.12, .5), white);
	shirt.position.set(.3, 1.05, 0); shirt.rotation.y = Math.PI / 2; g.add(shirt);

	const legL = new THREE.Group(), legR = new THREE.Group();
	for (const [leg, z] of [[legL, -.11], [legR, .11]]) {
		const thigh = new THREE.Mesh(new THREE.CylinderGeometry(.09, .08, .5, 8), black);
		thigh.position.y = -.25; leg.add(thigh);
		const shoe = new THREE.Mesh(new THREE.BoxGeometry(.3, .1, .14), black);
		shoe.position.set(.06, -.52, 0); leg.add(shoe);
		leg.position.set(0, .62, z);
		g.add(leg);
	}
	const armL = new THREE.Group(), armR = new THREE.Group();
	for (const [arm, z] of [[armL, -.3], [armR, .3]]) {
		const a = new THREE.Mesh(new THREE.CylinderGeometry(.07, .06, .55, 8), black);
		a.position.y = -.27; arm.add(a);
		arm.position.set(0, 1.28, z);
		g.add(arm);
	}
	return { group: g, legL, legR, armL, armR };
}

export function createPlayer(scene, onProgress) {
	const root = new THREE.Group();
	scene.add(root);

	const parts = buildFallbackChassid();
	root.add(parts.group);

	let model = null, mixer = null, glbReady = false;

	(async () => {
		try {
			const loader = new GLTFLoader();
			const gltf = await new Promise((resolve, reject) => {
				const timer = setTimeout(() => reject(new Error('GLB timeout')), 20000);
				loader.load(GLB_URL,
					(g) => { clearTimeout(timer); resolve(g); },
					(e) => { if (e && e.loaded && e.total) { try { onProgress && onProgress(e.loaded / e.total); } catch (_) {} } },
					(err) => { clearTimeout(timer); reject(err); });
			});
			model = gltf.scene;
			const box = new THREE.Box3().setFromObject(model);
			const size = new THREE.Vector3(); box.getSize(size);
			model.scale.setScalar(1.8 / Math.max(size.y, .001));
			root.remove(parts.group);
			root.add(model);
			if (gltf.animations && gltf.animations.length) {
				mixer = new THREE.AnimationMixer(model);
				const clip = gltf.animations.find((a) => /run|walk|move|idle/i.test(a.name)) || gltf.animations[0];
				mixer.clipAction(clip).play();
			}
			glbReady = true;
		} catch (err) {
			console.warn('[shema-strike] GLB unavailable, keeping procedural chassid:', err && err.message);
		}
	})();

	// blob shadow
	const shadow = new THREE.Mesh(
		new THREE.CircleGeometry(.55, 20),
		new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .35, depthWrite: false })
	);
	shadow.rotation.x = -Math.PI / 2;
	scene.add(shadow);

	const state = {
		x: 0, y: 0, vx: 0, vy: 0,
		dir: 0,            // -1, 0, 1 (input)
		facing: 1,         // 1 = right, -1 = left
		grounded: false,
		coyote: 0, jumpBuf: 0,
		invuln: 0,
		strikeCd: 0,
		runPhase: 0,
		groundY: -999,     // y of ground beneath (for shadow)
	};

	const GRAV = -34, JUMP_V = 14, SPEED = 6.8, COYOTE = .12, JBUF = .14;

	function collideAxis(platforms, axis) {
		const PW = .5, PH = 1.7; // player half-width / height
		for (const p of platforms) {
			const px0 = p.x - p.w / 2 - PW, px1 = p.x + p.w / 2 + PW;
			const py0 = p.y - p.h / 2, py1 = p.y + p.h / 2;
			if (state.x < px0 || state.x > px1) continue;
			if (axis === 'x') {
				if (state.y > py0 + .05 && state.y + PH < py1) {
					if (state.vx > 0) state.x = px0; else if (state.vx < 0) state.x = px1;
					state.vx = 0;
				}
			} else {
				if (state.vy <= 0 && state.y >= py1 - .35 && state.y - state.vy * .016 <= py1 + .35) {
					state.y = py1; state.vy = 0; state.grounded = true; state.groundY = py1;
				} else if (state.vy > 0 && state.y + PH >= py0 && state.y + PH <= py1 + .3) {
					state.y = py0 - PH; state.vy = 0;
				}
			}
		}
	}

	return {
		state,
		root,
		get glbReady() { return glbReady; },
		reset(x, y) {
			state.x = x; state.y = y; state.vx = 0; state.vy = 0;
			state.dir = 0; state.facing = 1; state.grounded = false;
			state.coyote = 0; state.jumpBuf = 0; state.invuln = 0; state.strikeCd = 0;
			root.visible = true;
		},
		setMove(d) { state.dir = d; if (d !== 0) state.facing = d; },
		queueJump() { state.jumpBuf = JBUF; },
		tryStrike() {
			if (state.strikeCd > 0) return null;
			state.strikeCd = .45;
			return { x: state.x + state.facing * .8, y: state.y + 1.1, vx: state.facing * 16 };
		},
		hit() {
			if (state.invuln > 0) return false;
			state.invuln = 1.4;
			state.vy = 8; state.grounded = false;
			return true;
		},
		update(dt, platforms) {
			// horizontal
			const targetVx = state.dir * SPEED;
			state.vx += (targetVx - state.vx) * Math.min(1, dt * 14);
			state.x += state.vx * dt;
			state.grounded = false;
			collideAxis(platforms, 'x');

			// vertical
			state.vy += GRAV * dt;
			if (state.vy < -26) state.vy = -26;
			if (state.grounded) state.coyote = COYOTE; else state.coyote -= dt;
			state.jumpBuf -= dt;
			if (state.jumpBuf > 0 && (state.grounded || state.coyote > 0)) {
				state.vy = JUMP_V; state.grounded = false; state.coyote = 0; state.jumpBuf = 0;
			}
			const prevY = state.y;
			state.y += state.vy * dt;
			collideAxis(platforms, 'y');
			if (state.y < -14) { state.y = -14; } // fell — game handles respawn

			if (state.strikeCd > 0) state.strikeCd -= dt;
			if (state.invuln > 0) {
				state.invuln -= dt;
				root.visible = Math.floor(state.invuln * 14) % 2 === 0;
				if (state.invuln <= 0) root.visible = true;
			}

			root.position.set(state.x, state.y, 0);
			// face movement direction (side view)
			const targetRotY = state.facing > 0 ? Math.PI / 2 : -Math.PI / 2;
			let dr = targetRotY - root.rotation.y;
			while (dr > Math.PI) dr -= Math.PI * 2;
			while (dr < -Math.PI) dr += Math.PI * 2;
			root.rotation.y += dr * Math.min(1, dt * 12);

			// run animation
			state.runPhase += dt * (2 + Math.abs(state.vx) * 1.6);
			if (!glbReady) {
				const p = state.runPhase;
				const amp = state.grounded ? Math.min(1, Math.abs(state.vx) / SPEED) : .2;
				parts.legL.rotation.z = Math.sin(p) * .8 * amp;
				parts.legR.rotation.z = Math.sin(p + Math.PI) * .8 * amp;
				parts.armL.rotation.z = Math.sin(p + Math.PI) * .6 * amp;
				parts.armR.rotation.z = Math.sin(p) * .6 * amp;
				parts.group.position.y = state.grounded ? Math.abs(Math.sin(p)) * .08 * amp : 0;
				// strike flash: lean forward briefly
				if (state.strikeCd > .3) parts.group.rotation.z = -.25;
				else parts.group.rotation.z = 0;
			} else if (mixer) {
				mixer.update(dt);
			}

			// shadow
			shadow.position.set(state.x, state.groundY + .03, 0);
			const h = Math.max(0, state.y - state.groundY);
			const s = Math.max(.35, 1 - h * .12);
			shadow.scale.set(s, s, 1);
			shadow.material.opacity = Math.max(.08, .35 - h * .05);
		},
	};
}
