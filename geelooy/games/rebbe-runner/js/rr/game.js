/* B"H — Rebbe Runner game: 3 lanes, Torah scrolls, Brooklyn obstacles. */
import * as THREE from '/games/scripts/build/three.module.js';
import { createWorld } from './world.js';
import { createPlayer } from './player.js';
import { bindInput } from './input.js';

const LANE_X = [-2.2, 0, 2.2];
const SPAWN_Z = -95;
const KILL_Z = 14;

const $ = (id) => document.getElementById(id);

function torahTexture() {
	const c = document.createElement('canvas'); c.width = 64; c.height = 64;
	const g = c.getContext('2d');
	g.fillStyle = '#f2e3b3'; g.fillRect(0, 0, 64, 64);
	g.strokeStyle = '#b89b5e'; g.lineWidth = 2;
	for (let y = 8; y < 64; y += 10) { g.beginPath(); g.moveTo(6, y); g.lineTo(58, y); g.stroke(); }
	const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
	return t;
}

function bannerTexture() {
	const c = document.createElement('canvas'); c.width = 256; c.height = 64;
	const g = c.getContext('2d');
	g.fillStyle = '#12233f'; g.fillRect(0, 0, 256, 64);
	g.strokeStyle = '#d9a94e'; g.lineWidth = 4; g.strokeRect(4, 4, 248, 56);
	g.fillStyle = '#f2d38a'; g.font = 'bold 26px system-ui, sans-serif';
	g.textAlign = 'center'; g.textBaseline = 'middle';
	g.fillText('SHABBAT SHALOM', 128, 34);
	const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
	return t;
}

function makeTorah() {
	const grp = new THREE.Group();
	const scroll = new THREE.Mesh(
		new THREE.CylinderGeometry(.16, .16, .5, 10),
		new THREE.MeshStandardMaterial({ map: torahTexture(), roughness: .7 })
	);
	scroll.rotation.z = Math.PI / 2;
	grp.add(scroll);
	const wood = new THREE.MeshStandardMaterial({ color: 0x5a3d1e, roughness: .8 });
	for (const s of [-1, 1]) {
		const h = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .72, 8), wood);
		h.rotation.z = Math.PI / 2; h.position.x = s * .3;
		grp.add(h);
		const knob = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6),
			new THREE.MeshStandardMaterial({ color: 0xd9a94e, metalness: .6, roughness: .4 }));
		knob.position.x = s * .42;
		grp.add(knob);
	}
	grp.position.y = 1.0;
	grp.userData.spin = Math.random() * Math.PI * 2;
	return grp;
}

function makeStall() {
	// Market stall — JUMP over it.
	const grp = new THREE.Group();
	const wood = new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: .9 });
	const table = new THREE.Mesh(new THREE.BoxGeometry(1.7, .5, 1.1), wood);
	table.position.y = .55; grp.add(table);
	for (const sx of [-0.75, 0.75]) for (const sz of [-0.45, 0.45]) {
		const leg = new THREE.Mesh(new THREE.BoxGeometry(.12, .55, .12), wood);
		leg.position.set(sx, .27, sz); grp.add(leg);
	}
	const awn = new THREE.Mesh(new THREE.BoxGeometry(1.9, .08, 1.4),
		new THREE.MeshStandardMaterial({ color: 0x274a68, roughness: .8 }));
	awn.position.y = 1.15; grp.add(awn);
	// fruit crates on top
	for (let i = 0; i < 3; i++) {
		const crate = new THREE.Mesh(new THREE.BoxGeometry(.4, .28, .4),
			new THREE.MeshStandardMaterial({ color: [0xc46a3a, 0x7fae4c, 0xd9a94e][i], roughness: .9 }));
		crate.position.set(-.5 + i * .5, .95, (i % 2 ? .2 : -.2));
		grp.add(crate);
	}
	grp.userData.kind = 'stall';
	return grp;
}

function makeBanner(tex) {
	// Overhead banner — SLIDE under it.
	const grp = new THREE.Group();
	const poleMat = new THREE.MeshStandardMaterial({ color: 0x2a3340, roughness: .6, metalness: .4 });
	for (const s of [-1, 1]) {
		const pole = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 2.6, 6), poleMat);
		pole.position.set(s * 1.05, 1.3, 0); grp.add(pole);
	}
	const cloth = new THREE.Mesh(new THREE.PlaneGeometry(2.0, .55),
		new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
	cloth.position.y = 1.85; grp.add(cloth);
	grp.userData.kind = 'banner';
	return grp;
}

function makeVan() {
	// Delivery van — DODGE (full lane block).
	const grp = new THREE.Group();
	const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe8e4da, roughness: .6 });
	const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.7, 3.6), bodyMat);
	body.position.y = 1.15; grp.add(body);
	const cab = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.0, 1.2),
		new THREE.MeshStandardMaterial({ color: 0x3a5a7a, roughness: .4, metalness: .3 }));
	cab.position.set(0, .9, 2.1); grp.add(cab);
	const wheelMat = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: .9 });
	for (const sx of [-.95, .95]) for (const sz of [-1.2, 1.2]) {
		const w = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .24, 12), wheelMat);
		w.rotation.z = Math.PI / 2; w.position.set(sx, .34, sz); grp.add(w);
	}
	// plain kosher marking (no secular branding)
	const c = document.createElement('canvas'); c.width = 128; c.height = 64;
	const g = c.getContext('2d');
	g.fillStyle = '#e8e4da'; g.fillRect(0, 0, 128, 64);
	g.fillStyle = '#274a68'; g.font = 'bold 22px system-ui'; g.textAlign = 'center';
	g.fillText('KOSHER', 64, 40);
	const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
	const decal = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .7), new THREE.MeshBasicMaterial({ map: t }));
	decal.position.set(0, 1.3, -1.81); decal.rotation.y = Math.PI; grp.add(decal);
	grp.userData.kind = 'van';
	return grp;
}

export async function startGame(env) {
	const { canvas, loadingFill, setTip } = env;
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
	renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(62, 1, .1, 220);
	camera.position.set(0, 4.4, 8.2);

	const world = createWorld(scene);
	const setLoad = (p) => { if (loadingFill) loadingFill.style.width = `${Math.round(p * 100)}%`; };
	setLoad(.15); setTip('Loading the chossid…');
	const player = await createPlayer(scene, (p) => setLoad(.15 + p * .55));
	setLoad(.75); setTip('Building Brooklyn…');
	await new Promise(r => setTimeout(r, 30));
	setLoad(1);

	const bannerTex = bannerTexture();
	const torahs = [];
	const obstacles = [];
	let running = false, paused = false, over = false;
	let speed = 11, dist = 0, score = 0, torahCount = 0, hearts = 3;
	let best = +(localStorage.getItem('rr_best') || 0);
	let spawnIn = 30; // distance until next pattern
	let elapsed = 0;

	// --- audio (tiny, no assets) ---
	let AC = null;
	function beep(freq, dur, type = 'sine', vol = .12) {
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
		score: $('rr-score'), best: $('rr-best'), hearts: $('rr-hearts'), torah: $('rr-torah'),
		render() {
			this.score.textContent = String(Math.floor(score)).padStart(5, '0');
			this.best.textContent = String(Math.floor(Math.max(best, score))).padStart(5, '0');
			this.hearts.textContent = '♥'.repeat(hearts) + '♡'.repeat(Math.max(0, 3 - hearts));
			this.torah.textContent = torahCount;
		}
	};

	function flash() {
		const f = $('rr-flash');
		f.classList.add('on');
		setTimeout(() => f.classList.remove('on'), 120);
	}

	function gameOver() {
		over = true; running = false;
		if (score > best) { best = Math.floor(score); localStorage.setItem('rr_best', best); }
		$('rr-card-title').textContent = 'Run Complete';
		$('rr-card-sub').textContent = 'Baruch Hashem — run again with kavanah.';
		$('rr-final-score').textContent = Math.floor(score);
		$('rr-final-torah').textContent = torahCount;
		$('rr-final-dist').textContent = Math.floor(dist) + 'm';
		$('rr-primary').textContent = 'Run Again';
		$('rr-resume').hidden = true;
		$('rr-overlay').hidden = false;
		$('rr-controls').hidden = true;
	}

	function reset() {
		for (const o of obstacles) scene.remove(o);
		for (const t of torahs) scene.remove(t);
		obstacles.length = 0; torahs.length = 0;
		player.reset();
		speed = 11; dist = 0; score = 0; torahCount = 0; hearts = 3;
		spawnIn = 30; elapsed = 0; over = false;
		hud.render();
	}

	function spawnPattern() {
		// Always leave at least one lane passable.
		const lanes = [-1, 0, 1].sort(() => Math.random() - .5);
		const blockedCount = Math.random() < .55 ? 2 : 1;
		const blocked = lanes.slice(0, blockedCount);
		const free = lanes.slice(blockedCount);
		for (const lane of blocked) {
			const r = Math.random();
			const obj = r < .4 ? makeStall() : r < .7 ? makeBanner(bannerTex) : makeVan();
			obj.position.set(LANE_X[lane + 1], 0, SPAWN_Z - Math.random() * 6);
			scene.add(obj); obstacles.push(obj);
		}
		// Torah arc in a free lane
		const tLane = free[(Math.random() * free.length) | 0];
		const n = 3 + ((Math.random() * 3) | 0);
		const arcJump = Math.random() < .35;
		for (let i = 0; i < n; i++) {
			const t = makeTorah();
			t.position.set(LANE_X[tLane + 1], arcJump ? 1.0 + Math.sin((i / (n - 1)) * Math.PI) * 1.1 : 1.0, SPAWN_Z - 8 - i * 2.2);
			scene.add(t); torahs.push(t);
		}
	}

	function collide() {
		const px = player.state.x, py = player.state.y;
		const sliding = player.state.sliding > 0;
		if (player.state.invuln > 0) return;
		for (let i = obstacles.length - 1; i >= 0; i--) {
			const o = obstacles[i];
			if (Math.abs(o.position.z) > .8 || Math.abs(o.position.x - px) > 1.0) continue;
			const kind = o.userData.kind;
			let hit = false;
			if (kind === 'stall') hit = py < .7;
			else if (kind === 'banner') hit = !sliding;
			else if (kind === 'van') hit = true;
			if (hit) {
				hearts--; player.hit(); flash(); beep(160, .25, 'sawtooth', .15);
				scene.remove(o); obstacles.splice(i, 1);
				hud.render();
				if (hearts <= 0) { gameOver(); return; }
			}
		}
		for (let i = torahs.length - 1; i >= 0; i--) {
			const t = torahs[i];
			if (Math.abs(t.position.z) > 1.0 || Math.abs(t.position.x - px) > 1.0) continue;
			if (Math.abs(t.position.y - (py + 1.0)) > 1.3) continue;
			scene.remove(t); torahs.splice(i, 1);
			torahCount++; score += 50; beep(880, .12, 'sine', .1);
			setTimeout(() => beep(1320, .1, 'sine', .08), 60);
			hud.render();
		}
	}

	function resize() {
		const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
	}
	addEventListener('resize', resize); resize();

	bindInput(player, {
		onPause: () => togglePause(),
		onFirstGesture: () => { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
	});

	function togglePause(force) {
		if (over || !running) return;
		paused = force !== undefined ? force : !paused;
		$('rr-card-title').textContent = 'Paused';
		$('rr-card-sub').textContent = 'Catch your breath.';
		$('rr-final-score').textContent = Math.floor(score);
		$('rr-final-torah').textContent = torahCount;
		$('rr-final-dist').textContent = Math.floor(dist) + 'm';
		$('rr-primary').textContent = 'Restart Run';
		$('rr-resume').hidden = false;
		$('rr-overlay').hidden = !paused;
	}
	$('rr-pause').addEventListener('click', () => togglePause());
	$('rr-resume').addEventListener('click', () => togglePause(false));
	$('rr-primary').addEventListener('click', () => {
		$('rr-overlay').hidden = true;
		reset(); running = true; paused = false;
		$('rr-controls').hidden = false;
	});

	let last = performance.now();
	function loop(now) {
		requestAnimationFrame(loop);
		const dt = Math.min(.05, (now - last) / 1000);
		last = now;
		if (!running || paused || over) { renderer.render(scene, camera); return; }
		elapsed += dt;
		speed = Math.min(26, 11 + elapsed * .22);
		const dz = speed * dt;
		dist += dz; score += dz * 1.2;

		world.update(dt, speed);
		player.update(dt);

		spawnIn -= dz;
		if (spawnIn <= 0) { spawnPattern(); spawnIn = 260 / speed * (14 + Math.random() * 8); }

		for (let i = obstacles.length - 1; i >= 0; i--) {
			const o = obstacles[i];
			o.position.z += dz;
			if (o.position.z > KILL_Z) { scene.remove(o); obstacles.splice(i, 1); }
		}
		for (let i = torahs.length - 1; i >= 0; i--) {
			const t = torahs[i];
			t.position.z += dz;
			t.userData.spin += dt * 3;
			t.rotation.y = t.userData.spin;
			if (t.position.z > KILL_Z) { scene.remove(t); torahs.splice(i, 1); }
		}
		collide();

		// camera follows lane slightly
		camera.position.x += (player.state.x * .35 - camera.position.x) * Math.min(1, dt * 6);
		camera.lookAt(camera.position.x * .5, 1.6, -8);

		if ((elapsed * 2 | 0) % 2 === 0) hud.render();
		renderer.render(scene, camera);
	}

	hud.render();
	reset();
	requestAnimationFrame(loop);

	return {
		begin() {
			reset();
			running = true; paused = false; over = false;
			$('rr-hud').hidden = false;
			$('rr-controls').hidden = false;
		}
	};
}
