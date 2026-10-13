/* B"H — Brooklyn street: brownstones, shul, kosher shops. Recycled segments. */
import * as THREE from '/games/scripts/build/three.module.js';

const SEG_LEN = 24;      // length of one street segment
const SEG_COUNT = 8;     // segments alive at once
const ROAD_W = 8.4;

function canvasTex(w, h, draw) {
	const c = document.createElement('canvas');
	c.width = w; c.height = h;
	draw(c.getContext('2d'), w, h);
	const t = new THREE.CanvasTexture(c);
	t.colorSpace = THREE.SRGBColorSpace;
	return t;
}

function brickTexture(base, mortar) {
	return canvasTex(128, 128, (g, w, h) => {
		g.fillStyle = mortar; g.fillRect(0, 0, w, h);
		const bh = 16, bw = 32;
		for (let y = 0; y < h; y += bh) {
			const off = (y / bh) % 2 ? bw / 2 : 0;
			for (let x = -bw; x < w + bw; x += bw) {
				const v = 0.9 + Math.random() * 0.2;
				g.fillStyle = `rgb(${base[0]*v|0},${base[1]*v|0},${base[2]*v|0})`;
				g.fillRect(x + off + 1, y + 1, bw - 2, bh - 2);
			}
		}
	});
}

function windowsTexture(base, litRatio) {
	return canvasTex(128, 128, (g, w, h) => {
		g.fillStyle = base; g.fillRect(0, 0, w, h);
		for (let y = 8; y < h; y += 32) {
			for (let x = 10; x < w; x += 32) {
				const lit = Math.random() < litRatio;
				g.fillStyle = lit ? '#ffd98a' : '#1a2438';
				g.fillRect(x, y, 18, 22);
				g.fillStyle = 'rgba(255,255,255,.15)';
				g.fillRect(x, y, 18, 4);
			}
		}
	});
}

function signTexture(text, bg, fg) {
	return canvasTex(256, 64, (g, w, h) => {
		g.fillStyle = bg; g.fillRect(0, 0, w, h);
		g.strokeStyle = fg; g.lineWidth = 4; g.strokeRect(4, 4, w - 8, h - 8);
		g.fillStyle = fg; g.font = 'bold 30px system-ui, sans-serif';
		g.textAlign = 'center'; g.textBaseline = 'middle';
		g.fillText(text, w / 2, h / 2 + 1);
	});
}

function starOfDavid(g, cx, cy, r, color) {
	g.strokeStyle = color; g.lineWidth = 3;
	for (const flip of [0, 1]) {
		g.beginPath();
		for (let i = 0; i <= 3; i++) {
			const a = -Math.PI / 2 + flip * Math.PI + i * (Math.PI * 2 / 3);
			const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
			i ? g.lineTo(x, y) : g.moveTo(x, y);
		}
		g.closePath(); g.stroke();
	}
}

function shulTexture() {
	return canvasTex(128, 160, (g, w, h) => {
		g.fillStyle = '#d8c9a3'; g.fillRect(0, 0, w, h);
		// arched windows
		for (const x of [24, 64, 104]) {
			g.fillStyle = '#2a3a5c';
			g.beginPath(); g.arc(x, 70, 12, Math.PI, 0); g.fill();
			g.fillRect(x - 12, 70, 24, 50);
			g.fillStyle = 'rgba(255,220,150,.5)';
			g.fillRect(x - 8, 78, 16, 40);
		}
		// door
		g.fillStyle = '#5a3d1e'; g.fillRect(48, 128, 32, 32);
		starOfDavid(g, 64, 22, 12, '#8a6d1f');
	});
}

function makeBuilding(kind, texLib) {
	const grp = new THREE.Group();
	const W = 7 + Math.random() * 3, H = 9 + Math.random() * 5, D = 8;
	let facade;
	if (kind === 'brownstone') {
		facade = new THREE.MeshStandardMaterial({ map: windowsTexture('#6b4a35', 0.35), roughness: .9 });
	} else if (kind === 'shul') {
		facade = new THREE.MeshStandardMaterial({ map: shulTexture(), roughness: .85 });
	} else { // shop
		facade = new THREE.MeshStandardMaterial({ map: windowsTexture('#7a6a55', 0.5), roughness: .9 });
	}
	const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), facade);
	body.position.y = H / 2;
	grp.add(body);
	// cornice
	const cornice = new THREE.Mesh(
		new THREE.BoxGeometry(W + .6, .5, D + .6),
		new THREE.MeshStandardMaterial({ color: 0x3a2c20, roughness: .9 })
	);
	cornice.position.y = H + .25;
	grp.add(cornice);
	if (kind === 'shop') {
		const signs = texLib.signs;
		const sign = new THREE.Mesh(
			new THREE.PlaneGeometry(W * .8, 1.1),
			new THREE.MeshBasicMaterial({ map: signs[(Math.random() * signs.length) | 0] })
		);
		sign.position.set(0, 3.4, D / 2 + .06);
		grp.add(sign);
		// awning
		const awning = new THREE.Mesh(
			new THREE.BoxGeometry(W * .8, .25, 1.6),
			new THREE.MeshStandardMaterial({ color: 0x274a68, roughness: .8 })
		);
		awning.position.set(0, 2.6, D / 2 + .8);
		grp.add(awning);
	}
	if (kind === 'shul') {
		const dome = new THREE.Mesh(
			new THREE.SphereGeometry(1.6, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
			new THREE.MeshStandardMaterial({ color: 0x8a6d1f, roughness: .5, metalness: .4 })
		);
		dome.position.y = H + .5;
		grp.add(dome);
	}
	// stoop for brownstone
	if (kind === 'brownstone') {
		const stoop = new THREE.Mesh(
			new THREE.BoxGeometry(2.2, 1.2, 2.4),
			new THREE.MeshStandardMaterial({ color: 0x54402e, roughness: .95 })
		);
		stoop.position.set(-W / 4, .6, D / 2 + 1.1);
		grp.add(stoop);
	}
	return grp;
}

function makeTree() {
	const grp = new THREE.Group();
	const trunk = new THREE.Mesh(
		new THREE.CylinderGeometry(.22, .3, 2.6, 7),
		new THREE.MeshStandardMaterial({ color: 0x5a3d24, roughness: 1 })
	);
	trunk.position.y = 1.3;
	grp.add(trunk);
	const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e6b34, roughness: 1 });
	for (let i = 0; i < 3; i++) {
		const s = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1 - i * .18, 1), leafMat);
		s.position.set((Math.random() - .5) * .8, 2.8 + i * .9, (Math.random() - .5) * .8);
		grp.add(s);
	}
	return grp;
}

function makeLamp() {
	const grp = new THREE.Group();
	const pole = new THREE.Mesh(
		new THREE.CylinderGeometry(.09, .12, 5.2, 6),
		new THREE.MeshStandardMaterial({ color: 0x222a35, roughness: .7, metalness: .5 })
	);
	pole.position.y = 2.6;
	grp.add(pole);
	const bulb = new THREE.Mesh(
		new THREE.SphereGeometry(.32, 10, 8),
		new THREE.MeshBasicMaterial({ color: 0xffd98a })
	);
	bulb.position.y = 5.3;
	grp.add(bulb);
	const glow = new THREE.Sprite(new THREE.SpriteMaterial({
		map: canvasTex(64, 64, (g) => {
			const gr = g.createRadialGradient(32, 32, 2, 32, 32, 30);
			gr.addColorStop(0, 'rgba(255,215,140,.85)');
			gr.addColorStop(1, 'rgba(255,215,140,0)');
			g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
		}),
		transparent: true, depthWrite: false
	}));
	glow.scale.set(4, 4, 1);
	glow.position.y = 5.3;
	grp.add(glow);
	return grp;
}

export function createWorld(scene) {
	// sky + fog + lights
	scene.background = new THREE.Color(0x0d1830);
	scene.fog = new THREE.Fog(0x0d1830, 30, 95);
	const hemi = new THREE.HemisphereLight(0x8fa8d8, 0x2a2118, 0.9);
	scene.add(hemi);
	const sun = new THREE.DirectionalLight(0xffe0b0, 1.1);
	sun.position.set(-6, 14, 6);
	scene.add(sun);

	// stars
	{
		const n = 220, pos = new Float32Array(n * 3);
		for (let i = 0; i < n; i++) {
			pos[i * 3] = (Math.random() - .5) * 220;
			pos[i * 3 + 1] = 25 + Math.random() * 70;
			pos[i * 3 + 2] = -40 - Math.random() * 120;
		}
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
		scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xcdd8ff, size: .5 })));
	}

	// road
	const roadTex = canvasTex(256, 256, (g, w, h) => {
		g.fillStyle = '#232a36'; g.fillRect(0, 0, w, h);
		g.fillStyle = '#d9a94e';
		for (let y = 0; y < h; y += 64) g.fillRect(w / 2 - 3, y, 6, 34);
	});
	roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping;
	roadTex.repeat.set(1, 14);
	const road = new THREE.Mesh(
		new THREE.PlaneGeometry(ROAD_W, SEG_LEN * SEG_COUNT),
		new THREE.MeshStandardMaterial({ map: roadTex, roughness: .95 })
	);
	road.rotation.x = -Math.PI / 2;
	road.position.z = -SEG_LEN * SEG_COUNT / 2 + 10;
	scene.add(road);

	// sidewalks
	const walkMat = new THREE.MeshStandardMaterial({ color: 0x3d4451, roughness: 1 });
	for (const side of [-1, 1]) {
		const walk = new THREE.Mesh(new THREE.PlaneGeometry(4.4, SEG_LEN * SEG_COUNT), walkMat);
		walk.rotation.x = -Math.PI / 2;
		walk.position.set(side * (ROAD_W / 2 + 2.2), .01, -SEG_LEN * SEG_COUNT / 2 + 10);
		scene.add(walk);
	}

	// texture library for signs
	const texLib = {
		signs: [
			signTexture('KOSHER PIZZA', '#123a5c', '#ffd98a'),
			signTexture('BAKERY', '#5c2e12', '#ffe9c4'),
			signTexture('SEFORIM', '#1e3a24', '#d9f2c4'),
			signTexture('JUDAICA', '#3a1e4c', '#ecd4ff'),
		]
	};

	// recycled building segments
	const kinds = ['brownstone', 'brownstone', 'shop', 'brownstone', 'shul', 'shop', 'brownstone'];
	const segments = [];
	for (let i = 0; i < SEG_COUNT; i++) {
		const seg = new THREE.Group();
		for (const side of [-1, 1]) {
			const kind = kinds[(Math.random() * kinds.length) | 0];
			const b = makeBuilding(kind, texLib);
			b.position.set(side * (ROAD_W / 2 + 2.2 + 4.2), 0, (Math.random() - .5) * 6);
			b.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
			seg.add(b);
		}
		// trees + lamps along sidewalk
		for (const side of [-1, 1]) {
			if (Math.random() < .7) {
				const t = makeTree();
				t.position.set(side * (ROAD_W / 2 + 3.6), 0, (Math.random() - .5) * SEG_LEN);
				seg.add(t);
			}
			const lamp = makeLamp();
			lamp.position.set(side * (ROAD_W / 2 + 1.1), 0, (Math.random() - .5) * SEG_LEN);
			seg.add(lamp);
		}
		seg.position.z = 10 - i * SEG_LEN;
		scene.add(seg);
		segments.push(seg);
	}

	return {
		update(dt, speed) {
			const dz = speed * dt;
			for (const seg of segments) {
				seg.position.z += dz;
				if (seg.position.z > 10 + SEG_LEN) {
					seg.position.z -= SEG_LEN * SEG_COUNT;
					// re-randomize building kinds for variety
					seg.children.forEach(() => {});
				}
			}
			roadTex.offset.y -= dz / (SEG_LEN * SEG_COUNT) * 14;
		}
	};
}
