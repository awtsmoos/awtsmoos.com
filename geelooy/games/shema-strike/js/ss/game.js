/* B"H — Shema Strike: 2.5D side-view platformer. chossid hero, sparks, shadows, gates. */
import * as THREE from '/games/scripts/build/three.module.js';
import { createWorld } from './world.js';
import { createPlayer } from './player.js';
import { bindInput } from './input.js';
import { LEVELS } from './levels.js';

const $ = (id) => document.getElementById(id);
const KILL_Y = -12;

export function startGame(env) {
	const { canvas, loadingFill, setTip } = env;
	const setLoad = (p) => { try { if (loadingFill) loadingFill.style.width = `${Math.round(p * 100)}%`; } catch (_) {} };

	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
	renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
	const scene = new THREE.Scene();
	scene.fog = new THREE.Fog(0x0b1426, 30, 90);

	// SIDE-VIEW camera: locked to the x/y plane, follows the hero.
	const camera = new THREE.PerspectiveCamera(50, 1, .1, 200);
	camera.position.set(0, 3, 13);

	setLoad(.25); setTip('Raising the sky…');
	const world = createWorld(scene);
	setLoad(.5); setTip('Waking the chossid…');
	const player = createPlayer(scene, (p) => setLoad(.6 + p * .35));
	setLoad(.95);

	// --- level state ---
	let levelIdx = 0;
	let platforms = [], platformMeshes = [];
	let sparks = [], enemies = [], bolts = [];
	let gate = null, gateX = 0;
	let running = false, paused = false, done = false;
	let health = 100, sparkCount = 0, totalSparks = 0;
	let camX = 0;
	let elapsed = 0;

	// --- audio (tiny, no assets) ---
	let AC = null;
	function beep(freq, dur, type = 'sine', vol = .1) {
		try {
			AC = AC || new (window.AudioContext || window.webkitAudioContext)();
			const o = AC.createOscillator(), g = AC.createGain();
			o.type = type; o.frequency.value = freq;
			g.gain.setValueAtTime(vol, AC.currentTime);
			g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + dur);
			o.connect(g); g.connect(AC.destination);
			o.start(); o.stop(AC.currentTime + dur);
		} catch (e) { /* silent */ }
	}

	// --- HUD ---
	const hud = {
		health: $('ss-health'), level: $('ss-level-name'), sparks: $('ss-sparks'),
		render() {
			this.health.style.width = Math.max(0, health) + '%';
			this.sparks.textContent = sparkCount;
		},
	};

	function flash() {
		const f = $('ss-flash');
		f.classList.add('on');
		setTimeout(() => f.classList.remove('on'), 120);
	}

	function showCard(title, sub, opts) {
		$('ss-card-title').textContent = title;
		$('ss-card-sub').textContent = sub;
		$('ss-final-sparks').textContent = sparkCount;
		$('ss-final-level').textContent = levelIdx + 1;
		$('ss-primary').hidden = !!opts.hidePrimary;
		$('ss-resume').hidden = !opts.showResume;
		$('ss-next').hidden = !opts.showNext;
		if (opts.showNext) $('ss-primary').hidden = true;
		$('ss-overlay').hidden = false;
		$('ss-controls').hidden = true;
	}

	function gameOver() {
		done = true; running = false;
		beep(140, .5, 'sawtooth', .12);
		showCard('The Light Fades', 'Baruch Hashem — strike again with kavanah.', {});
	}

	function levelComplete() {
		done = true; running = false;
		beep(660, .15); setTimeout(() => beep(880, .15), 120); setTimeout(() => beep(1320, .3), 240);
		const last = levelIdx >= LEVELS.length - 1;
		showCard(
			last ? 'All Gates Awakened!' : 'Gate Complete',
			last ? 'The Shema echoes through every gate.' : LEVELS[levelIdx + 1].sub,
			last ? {} : { showNext: true }
		);
	}

	function loadLevel(i) {
		levelIdx = i;
		const L = LEVELS[i];
		world.clearLevel(platformMeshes);
		world.clearLevel(sparks);
		world.clearLevel(bolts);
		for (const e of enemies) scene.remove(e.grp);
		enemies = [];
		if (gate) scene.remove(gate);

		platforms = L.platforms;
		for (const p of L.platforms) platformMeshes.push(world.makePlatform(p));
		for (const s of L.sparks) sparks.push(world.makeSpark(s.x, s.y));
		for (const e of L.enemies) enemies.push(world.makeEnemy(e.x, e.y, e.range, e.speed));
		gate = world.makeGate(L.goal.x, L.goal.y);
		gateX = L.goal.x;
		player.reset(L.spawn.x, L.spawn.y);
		health = 100; done = false;
		camX = player.state.x;
		$('ss-level-name').textContent = L.name;
		hud.render();
	}

	function resetRun() {
		sparkCount = 0; totalSparks = 0;
		loadLevel(0);
	}

	function strike() {
		if (!running || paused || done) return;
		const s = player.tryStrike();
		if (!s) return;
		const bolt = world.makeBolt();
		bolt.position.set(s.x, s.y, .6);
		bolt.userData = { vx: s.vx, life: 1.2 };
		scene.add(bolt);
		bolts.push(bolt);
		beep(1200, .08, 'square', .06);
	}

	function respawn() {
		const L = LEVELS[levelIdx];
		player.reset(L.spawn.x, L.spawn.y);
		health = Math.max(health, 40);
		flash();
	}

	function collide() {
		const px = player.state.x, py = player.state.y;

		// fell out of the world
		if (py <= KILL_Y) {
			health -= 15;
			if (health <= 0) { health = 0; hud.render(); gameOver(); return; }
			respawn(); hud.render();
			return;
		}

		// enemies vs player
		if (player.state.invuln <= 0) {
			for (const e of enemies) {
				if (!e.alive) continue;
				const ex = e.grp.position.x, ey = e.grp.position.y;
				if (Math.abs(ex - px) < .9 && Math.abs(ey - (py + .8)) < 1.2) {
					if (player.hit()) {
						health -= 22; flash(); beep(160, .25, 'sawtooth', .14);
						hud.render();
						if (health <= 0) { health = 0; hud.render(); gameOver(); return; }
					}
					break;
				}
			}
		}

		// bolts vs enemies
		for (let i = bolts.length - 1; i >= 0; i--) {
			const b = bolts[i];
			for (const e of enemies) {
				if (!e.alive) continue;
				const ex = e.grp.position.x, ey = e.grp.position.y;
				if (Math.abs(ex - b.position.x) < 1 && Math.abs(ey + .6 - b.position.y) < 1.2) {
					e.alive = false;
					scene.remove(e.grp);
					scene.remove(b); bolts.splice(i, 1);
					sparkCount += 2; totalSparks += 2;
					health = Math.min(100, health + 4);
					beep(520, .12, 'triangle', .1); setTimeout(() => beep(780, .12, 'triangle', .08), 70);
					hud.render();
					break;
				}
			}
		}

		// sparks
		for (let i = sparks.length - 1; i >= 0; i--) {
			const s = sparks[i];
			if (s.userData.taken) continue;
			if (Math.abs(s.position.x - px) < 1 && Math.abs(s.position.y - (py + .9)) < 1.3) {
				s.userData.taken = true;
				scene.remove(s); sparks.splice(i, 1);
				sparkCount++; totalSparks++;
				health = Math.min(100, health + 3);
				beep(880, .1, 'sine', .09); setTimeout(() => beep(1174, .12, 'sine', .07), 55);
				hud.render();
			}
		}

		// goal gate
		if (Math.abs(gateX - px) < 1.6 && py < 6) {
			levelComplete();
		}
	}

	function resize() {
		const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
	}
	addEventListener('resize', resize); resize();

	bindInput(player, strike, {
		onPause: () => togglePause(),
		onFirstGesture: () => { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} },
	});

	function togglePause(force) {
		if (done || !running) return;
		paused = force !== undefined ? force : !paused;
		if (paused) {
			showCard('Paused', 'The gate waits for your return.', { showResume: true, hidePrimary: true });
		} else {
			$('ss-overlay').hidden = true;
			$('ss-controls').hidden = false;
		}
	}
	$('ss-pause').addEventListener('click', () => togglePause());
	$('ss-resume').addEventListener('click', () => togglePause(false));
	$('ss-primary').addEventListener('click', () => {
		$('ss-overlay').hidden = true;
		resetRun(); running = true; paused = false; done = false;
		$('ss-controls').hidden = false;
	});
	$('ss-next').addEventListener('click', () => {
		$('ss-overlay').hidden = true;
		loadLevel(Math.min(levelIdx + 1, LEVELS.length - 1));
		running = true; paused = false; done = false;
		$('ss-controls').hidden = false;
	});

	setLoad(1);

	let last = performance.now();
	function loop(now) {
		requestAnimationFrame(loop);
		const dt = Math.min(.05, (now - last) / 1000);
		last = now;
		elapsed += dt;

		if (running && !paused && !done) {
			player.update(dt, platforms);
			collide();

			// enemies patrol
			for (const e of enemies) {
				if (!e.alive) continue;
				e.phase += dt * e.speed;
				e.grp.position.x = e.x0 + Math.sin(e.phase) * (e.range / 2);
				e.grp.position.y = e.y0 + Math.abs(Math.sin(e.phase * 2)) * .25;
			}
			// sparks float
			for (const s of sparks) {
				s.position.y = s.userData.baseY + Math.sin(elapsed * 2.4 + s.userData.phase) * .3;
				s.material.rotation += dt * 1.5;
			}
			// bolts fly
			for (let i = bolts.length - 1; i >= 0; i--) {
				const b = bolts[i];
				b.position.x += b.userData.vx * dt;
				b.userData.life -= dt;
				if (b.userData.life <= 0) { scene.remove(b); bolts.splice(i, 1); }
			}
		}

		// side-view camera follows the hero
		const targetX = player.state.x + player.state.facing * 1.6;
		camX += (targetX - camX) * Math.min(1, dt * 5);
		const targetY = 3 + Math.max(0, player.state.y) * .35;
		camera.position.x += (camX - camera.position.x) * Math.min(1, dt * 5);
		camera.position.y += (targetY - camera.position.y) * Math.min(1, dt * 3);
		camera.lookAt(camera.position.x, camera.position.y - .5, 0);

		world.update(dt, camX, elapsed);
		renderer.render(scene, camera);
	}

	hud.render();
	resetRun();
	requestAnimationFrame(loop);

	return {
		begin() {
			resetRun();
			running = true; paused = false; done = false;
			$('ss-hud').hidden = false;
			$('ss-controls').hidden = false;
		},
	};
}
