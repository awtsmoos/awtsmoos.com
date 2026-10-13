/* B"H — Shema Strike world: parallax sky, textured platforms, gate, sparks, enemies. */
import * as THREE from '/games/scripts/build/three.module.js';

function canvasTex(w, h, draw) {
	const c = document.createElement('canvas');
	c.width = w; c.height = h;
	draw(c.getContext('2d'), w, h);
	const t = new THREE.CanvasTexture(c);
	t.colorSpace = THREE.SRGBColorSpace;
	return t;
}

function stoneTexture() {
	return canvasTex(128, 128, (g, w, h) => {
		g.fillStyle = '#3a4a68'; g.fillRect(0, 0, w, h);
		const bh = 21, bw = 32;
		for (let y = 0; y < h; y += bh) {
			const off = ((y / bh) | 0) % 2 ? bw / 2 : 0;
			for (let x = -bw; x < w + bw; x += bw) {
				const v = .82 + Math.random() * .36;
				const r = 74 * v | 0, gg = 94 * v | 0, b = 132 * v | 0;
				g.fillStyle = `rgb(${r},${gg},${b})`;
				g.fillRect(x + off + 1, y + 1, bw - 2, bh - 2);
			}
		}
		g.fillStyle = 'rgba(217,169,78,.16)';
		g.fillRect(0, 0, w, 6);
	});
}

function grassTexture() {
	return canvasTex(128, 32, (g, w, h) => {
		const grad = g.createLinearGradient(0, 0, 0, h);
		grad.addColorStop(0, '#7fca5f'); grad.addColorStop(1, '#3f7a33');
		g.fillStyle = grad; g.fillRect(0, 0, w, h);
		g.strokeStyle = '#2c5a24'; g.lineWidth = 2;
		for (let x = 4; x < w; x += 8) {
			g.beginPath(); g.moveTo(x, h); g.lineTo(x + 2, 4 + Math.random() * 8); g.stroke();
		}
	});
}

function sparkTexture() {
	return canvasTex(64, 64, (g, w, h) => {
		const grad = g.createRadialGradient(32, 32, 2, 32, 32, 30);
		grad.addColorStop(0, '#fffbe8'); grad.addColorStop(.4, '#f2d38a'); grad.addColorStop(1, 'rgba(217,169,78,0)');
		g.fillStyle = grad; g.fillRect(0, 0, w, h);
	});
}

export function createWorld(scene) {
	// --- sky gradient ---
	const skyTex = canvasTex(16, 256, (g, w, h) => {
		const grad = g.createLinearGradient(0, 0, 0, h);
		grad.addColorStop(0, '#060b1c');
		grad.addColorStop(.55, '#12264a');
		grad.addColorStop(.8, '#3a3a6e');
		grad.addColorStop(1, '#8a5a3a');
		g.fillStyle = grad; g.fillRect(0, 0, w, h);
	});
	const sky = new THREE.Mesh(
		new THREE.PlaneGeometry(400, 120),
		new THREE.MeshBasicMaterial({ map: skyTex, depthWrite: false })
	);
	sky.position.set(0, 20, -60);
	scene.add(sky);

	// --- stars ---
	const starGeo = new THREE.BufferGeometry();
	const starPos = [];
	for (let i = 0; i < 320; i++) {
		starPos.push((Math.random() - .5) * 360, 4 + Math.random() * 70, -55 - Math.random() * 4);
	}
	starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
	const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
		color: 0xf2e8c8, size: .55, sizeAttenuation: true, transparent: true, opacity: .9, depthWrite: false,
	}));
	scene.add(stars);

	// --- moon ---
	const moon = new THREE.Mesh(
		new THREE.CircleGeometry(4, 24),
		new THREE.MeshBasicMaterial({ color: 0xf5edd6, depthWrite: false })
	);
	moon.position.set(-30, 42, -58);
	scene.add(moon);
	const moonGlow = new THREE.Mesh(
		new THREE.CircleGeometry(6.5, 24),
		new THREE.MeshBasicMaterial({ color: 0xf2d38a, transparent: true, opacity: .18, depthWrite: false })
	);
	moonGlow.position.copy(moon.position).z = -57.9;
	scene.add(moonGlow);

	// --- parallax hill layers ---
	function hillLayer(color, z, yBase, amp, seed) {
		const pts = [];
		for (let x = -200; x <= 200; x += 8) {
			const y = yBase + Math.sin(x * .05 + seed) * amp + Math.sin(x * .13 + seed * 2) * amp * .4;
			pts.push(new THREE.Vector2(x, y));
		}
		pts.push(new THREE.Vector2(200, -30), new THREE.Vector2(-200, -30));
		const shape = new THREE.Shape(pts);
		const m = new THREE.Mesh(new THREE.ShapeGeometry(shape),
			new THREE.MeshBasicMaterial({ color, depthWrite: false }));
		m.position.z = z;
		scene.add(m);
		return m;
	}
	const hillsFar = hillLayer(0x1a2440, -40, 2, 7, 1.7);
	const hillsNear = hillLayer(0x14203a, -26, -2, 5, 4.2);

	// --- distant temple silhouette ---
	const templeTex = canvasTex(256, 128, (g, w, h) => {
		g.clearRect(0, 0, w, h);
		g.fillStyle = '#0e1830';
		g.fillRect(20, 60, 216, 68);          // main hall
		g.fillRect(100, 20, 56, 44);          // upper chamber
		for (let x = 34; x < 220; x += 24) {  // columns
			g.fillRect(x, 78, 10, 50);
		}
		g.fillStyle = '#d9a94e';              // golden glow windows
		for (let x = 40; x < 220; x += 36) {
			g.fillRect(x, 88, 12, 18);
		}
	});
	const temple = new THREE.Mesh(
		new THREE.PlaneGeometry(40, 20),
		new THREE.MeshBasicMaterial({ map: templeTex, transparent: true, depthWrite: false })
	);
	temple.position.set(60, 6, -45);
	scene.add(temple);

	// --- lights ---
	scene.add(new THREE.AmbientLight(0x8fa0c8, 1.15));
	const key = new THREE.DirectionalLight(0xf2d38a, 1.1);
	key.position.set(6, 12, 8);
	scene.add(key);
	const rim = new THREE.DirectionalLight(0x57d0c4, .5);
	rim.position.set(-8, 6, -6);
	scene.add(rim);

	const stoneTex = stoneTexture();
	stoneTex.wrapS = stoneTex.wrapT = THREE.RepeatWrapping;
	const grassTex = grassTexture();
	grassTex.wrapS = THREE.RepeatWrapping;
	const sparkTex = sparkTexture();

	const stoneMat = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: .9 });
	const grassMat = new THREE.MeshStandardMaterial({ map: grassTex, roughness: .95 });

	function makePlatform(p) {
		const grp = new THREE.Group();
		const body = new THREE.Mesh(new THREE.BoxGeometry(p.w, p.h, 3), stoneMat.clone());
		body.material.map = stoneTex.clone();
		body.material.map.needsUpdate = true;
		body.material.map.repeat.set(Math.max(1, p.w / 3), Math.max(1, p.h / 2));
		body.position.y = -p.h / 2;
		grp.add(body);
		const top = new THREE.Mesh(new THREE.PlaneGeometry(p.w, 3), grassMat.clone());
		top.material.map = grassTex.clone();
		top.material.map.needsUpdate = true;
		top.material.map.repeat.set(Math.max(1, p.w / 4), 1);
		top.rotation.x = -Math.PI / 2;
		top.position.y = .02;
		grp.add(top);
		grp.position.set(p.x, p.y, 0);
		scene.add(grp);
		return grp;
	}

	function makeGate(x, y) {
		// stone arch gate — the level goal
		const grp = new THREE.Group();
		const mat = new THREE.MeshStandardMaterial({ color: 0x8a7a5c, roughness: .85 });
		for (const s of [-1, 1]) {
			const pillar = new THREE.Mesh(new THREE.BoxGeometry(.8, 5, 1.2), mat);
			pillar.position.set(s * 1.6, 2.5, 0);
			grp.add(pillar);
		}
		const lintel = new THREE.Mesh(new THREE.BoxGeometry(4.4, .9, 1.2), mat);
		lintel.position.y = 5.2;
		grp.add(lintel);
		const glowTex = canvasTex(64, 128, (g, w, h) => {
			const grad = g.createLinearGradient(0, 0, 0, h);
			grad.addColorStop(0, 'rgba(242,211,138,.85)');
			grad.addColorStop(1, 'rgba(242,211,138,.05)');
			g.fillStyle = grad; g.fillRect(0, 0, w, h);
		});
		const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 4.6),
			new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
		glow.position.y = 2.4;
		grp.add(glow);
		grp.position.set(x, y, 0);
		scene.add(grp);
		return grp;
	}

	function makeSpark(x, y) {
		const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTex, transparent: true, depthWrite: false }));
		s.scale.set(1.1, 1.1, 1);
		s.position.set(x, y, .5);
		s.userData = { baseY: y, phase: Math.random() * Math.PI * 2, taken: false };
		scene.add(s);
		return s;
	}

	function makeEnemy(x, y, range, speed) {
		const grp = new THREE.Group();
		const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1226, roughness: 1 });
		const body = new THREE.Mesh(new THREE.SphereGeometry(.55, 12, 10), bodyMat);
		body.position.y = .55; grp.add(body);
		const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff4d4d });
		for (const s of [-1, 1]) {
			const eye = new THREE.Mesh(new THREE.SphereGeometry(.09, 8, 6), eyeMat);
			eye.position.set(s * .18, .68, .42); grp.add(eye);
		}
		// shadowy wisps
		const wisp = new THREE.Mesh(new THREE.ConeGeometry(.4, 1, 8),
			new THREE.MeshStandardMaterial({ color: 0x241a38, transparent: true, opacity: .7, roughness: 1 }));
		wisp.position.y = -.1; wisp.rotation.x = Math.PI; grp.add(wisp);
		grp.position.set(x, y, 0);
		scene.add(grp);
		return { grp, x0: x, range, speed, phase: Math.random() * 6, alive: true, y0: y };
	}

	function makeBolt() {
		// Shema strike projectile — golden light bolt
		const boltTex = canvasTex(64, 32, (g, w, h) => {
			const grad = g.createLinearGradient(0, 0, w, 0);
			grad.addColorStop(0, 'rgba(242,211,138,0)');
			grad.addColorStop(.5, '#fff3c8');
			grad.addColorStop(1, 'rgba(242,211,138,0)');
			g.fillStyle = grad;
			g.beginPath(); g.ellipse(32, 16, 30, 9, 0, 0, Math.PI * 2); g.fill();
		});
		const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: boltTex, transparent: true, depthWrite: false }));
		s.scale.set(2.2, 1.1, 1);
		return s;
	}

	return {
		makePlatform, makeGate, makeSpark, makeEnemy, makeBolt,
		update(dt, camX, t) {
			// gentle parallax drift
			sky.position.x = camX * .92;
			stars.position.x = camX * .9;
			moon.position.x = -30 + camX * .88;
			moonGlow.position.x = moon.position.x;
			hillsFar.position.x = camX * .25;
			hillsNear.position.x = camX * .5;
			temple.position.x = 60 + camX * .15;
			stars.material.opacity = .75 + Math.sin(t * 1.7) * .15;
		},
		clearLevel(list) {
			for (const o of list) scene.remove(o);
			list.length = 0;
		},
	};
}
