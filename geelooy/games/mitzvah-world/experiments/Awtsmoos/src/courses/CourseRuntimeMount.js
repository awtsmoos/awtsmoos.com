// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CourseRuntimeMount.js
 * @description Browser glue between the Eretz runtime and the course system.
 * Reads `?course=<id>`, mounts one CourseEngine as `runtime.courseEngine`
 * (the movement frame and ground receipt already consult it), builds course
 * meshes into `runtime.scene`, and owns the HUD plus the menu card.
 * Course state is per-player and local-only: the multiplayer bridge keeps
 * replicating every avatar, so other runners stay visible in courses.
 * The Awtsmoos opens a doorway to the race without moving the meadow.
 */

import {
	createNativeMeshFromGeometry,
	createNativeWorldGroup,
	createNativeWorldMaterial
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { bootstrapCubeGeometry } from '../app/BootstrapCubeGeometry.js';
import { CourseEngine, staticPlatformBox } from './CourseEngine.js';
import { COURSE_DEFINITIONS, courseDefinitionById } from './courseDefinitions.js';
import { moverBoxAt, sweeperAngleAt } from './moverMath.js';

const SURFACE_COLORS = Object.freeze({
	grass: [0.27, 0.56, 0.27],
	stone: [0.5, 0.5, 0.54],
	wood: [0.56, 0.39, 0.23],
	ice: [0.6, 0.83, 0.94]
});
const GOLD = [1.0, 0.78, 0.28];
const HAZARD_RED = [0.78, 0.16, 0.16];
const WATER = [0.16, 0.36, 0.62];
const CHECKPOINT_GATE_HEIGHT = 3;

function surfaceMaterial(surface) {
	const color = SURFACE_COLORS[surface] || SURFACE_COLORS.grass;
	return createNativeWorldMaterial({ color, name: `course-surface-${surface}` });
}

function goldMaterial(name) {
	const material = createNativeWorldMaterial({ color: GOLD, name });
	material.emissiveColor = [...GOLD];
	material.emissiveStrength = 0.9;
	return material;
}

function hazardMaterial() {
	const material = createNativeWorldMaterial({ color: HAZARD_RED, name: 'course-hazard' });
	material.emissiveColor = [...HAZARD_RED];
	material.emissiveStrength = 0.7;
	return material;
}

function boxMesh(material, w, h, d, x, yCenter, z, name) {
	const mesh = createNativeMeshFromGeometry(bootstrapCubeGeometry(), material, {
		name: name || 'course-box'
	});
	mesh.scale.set(w, h, d);
	mesh.position.set(x, yCenter, z);
	return mesh;
}

function formatMs(ms) {
	const totalSeconds = Math.max(0, ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = Math.floor(totalSeconds % 60);
	const tenths = Math.floor((totalSeconds % 1) * 10);
	return `${minutes}:${String(seconds).padStart(2, '0')}.${tenths}`;
}

/**
 * Mounts a course into a live runtime. Safe to call once per course.
 * @param {object} runtime Eretz runtime (needs state + scene).
 * @param {object} environment Browser-like environment.
 * @param {string} courseId Course id from `?course=`.
 * @returns {object} Mount receipt with `unmount()`.
 */
export function mountCourseRuntime(runtime, environment, courseId) {
	const def = courseDefinitionById(courseId);
	if (!def) return { ok: false, reason: 'unknown-course' };
	if (!runtime || !runtime.state) return { ok: false, reason: 'no-player-state' };
	if (runtime.courseEngine?.active) unmountCourseRuntime(runtime);

	const engine = new CourseEngine(def);
	const documentValue = environment.document || globalThis.document;
	const group = createNativeWorldGroup({ name: `course-${def.id}` });
	const visuals = { movers: [], sweepers: [], coins: [] };

	buildCourseMeshes(def, group, visuals);
	if (runtime.scene?.add) runtime.scene.add(group);

	const hud = buildCourseHud(documentValue, def, runtime, engine);
	engine.onEvent = (type, data) => onCourseEvent(hud, engine, type, data);
	engine.onFrameVisuals = dt => syncCourseVisuals(engine, visuals, dt, hud);

	runtime.courseEngine = engine;
	engine.activate(runtime.state);

	const onVisibility = () => {
		engine.paused = Boolean(documentValue.hidden);
	};
	documentValue.addEventListener?.('visibilitychange', onVisibility);

	const receipt = {
		ok: true,
		courseId: def.id,
		engine,
		unmount: () => {
			documentValue.removeEventListener?.('visibilitychange', onVisibility);
			unmountCourseRuntime(runtime, hud, group);
		}
	};
	runtime.courseUnmount = receipt.unmount;
	return receipt;
}

function unmountCourseRuntime(runtime, hud, group) {
	if (runtime.courseEngine) {
		try { runtime.courseEngine.deactivate(); } catch (error) { /* noop */ }
		runtime.courseEngine = null;
	}
	if (group && runtime.scene?.remove) {
		try { runtime.scene.remove(group); } catch (error) { /* noop */ }
	}
	if (hud?.root?.remove) hud.root.remove();
	runtime.courseUnmount = null;
}

function buildCourseMeshes(def, group, visuals) {
	const materials = {};
	const materialFor = surface => (materials[surface] ||= surfaceMaterial(surface));
	for (const platform of def.platforms) {
		const thickness = Number(platform.thickness) > 0 ? Number(platform.thickness) : 1;
		let material = materialFor(platform.surface);
		if (platform.visualOnly) {
			material = createNativeWorldMaterial({
				color: WATER, name: 'course-water', transparent: true, opacity: 0.78
			});
		}
		group.add(boxMesh(
			material, platform.w, thickness, platform.d,
			platform.x, platform.top - thickness / 2, platform.z,
			`course-platform-${platform.surface}`
		));
	}
	for (const mover of def.movers) {
		const thickness = Number(mover.thickness) > 0 ? Number(mover.thickness) : 1;
		const mesh = boxMesh(
			materialFor(mover.surface), mover.w, thickness, mover.d,
			0, 0, 0, `course-mover-${mover.id}`
		);
		const box = moverBoxAt(mover, 0);
		mesh.position.set(
			(box.minX + box.maxX) / 2,
			(box.minY + box.maxY) / 2,
			(box.minZ + box.maxZ) / 2
		);
		group.add(mesh);
		visuals.movers.push({ def: mover, mesh });
	}
	const armMaterial = hazardMaterial();
	for (const hazard of def.hazards) {
		const pivot = createNativeWorldGroup({ name: 'course-sweeper' });
		pivot.position.set(hazard.center.x, 0, hazard.center.z);
		const arm = boxMesh(
			armMaterial, hazard.armWidth, hazard.armHeight, hazard.armLength,
			0, hazard.center.y, hazard.armLength / 2, 'course-sweeper-arm'
		);
		const post = boxMesh(
			armMaterial, 0.6, hazard.center.y, 0.6,
			0, hazard.center.y / 2, 0, 'course-sweeper-post'
		);
		pivot.add(post);
		pivot.add(arm);
		group.add(pivot);
		visuals.sweepers.push({ def: hazard, pivot });
	}
	const gateMaterial = goldMaterial('course-checkpoint');
	for (const checkpoint of def.checkpoints) {
		group.add(checkpointGate(gateMaterial, checkpoint, CHECKPOINT_GATE_HEIGHT));
	}
	const finishMaterial = goldMaterial('course-finish');
	group.add(checkpointGate(finishMaterial, def.finish, CHECKPOINT_GATE_HEIGHT + 1.5));
	const coinMaterial = goldMaterial('course-coin');
	def.coins.forEach((coin, index) => {
		const mesh = boxMesh(coinMaterial, 0.55, 0.55, 0.55, coin.x, coin.y, coin.z, `course-coin-${index}`);
		group.add(mesh);
		visuals.coins.push({ mesh, index });
	});
}

function checkpointGate(material, point, height) {
	const gate = createNativeWorldGroup({ name: 'course-gate' });
	const radius = Number(point.radius) || 3;
	const y = Number(point.y ?? 0);
	const postHeight = height;
	const left = boxMesh(material, 0.5, postHeight, 0.5, point.x - radius, y + postHeight / 2, point.z, 'course-gate-post');
	const right = boxMesh(material, 0.5, postHeight, 0.5, point.x + radius, y + postHeight / 2, point.z, 'course-gate-post');
	const bar = boxMesh(material, radius * 2 + 0.5, 0.5, 0.5, point.x, y + postHeight, point.z, 'course-gate-bar');
	gate.add(left);
	gate.add(right);
	gate.add(bar);
	return gate;
}

function syncCourseVisuals(engine, visuals, dt, hud) {
	for (const { def, mesh } of visuals.movers) {
		const live = engine.movers.find(m => m.def.id === def.id);
		const box = live ? live.boxNow : moverBoxAt(def, engine.courseTime);
		mesh.position.set(
			(box.minX + box.maxX) / 2,
			(box.minY + box.maxY) / 2,
			(box.minZ + box.maxZ) / 2
		);
	}
	for (const { def, pivot } of visuals.sweepers) {
		// sweeperAngleAt measures from +Z toward +X; the arm mesh extends +Z.
		pivot.rotation.y = sweeperAngleAt(def, engine.courseTime);
	}
	for (const { mesh, index } of visuals.coins) {
		if (engine.collectedCoins.has(index)) {
			mesh.visible = false;
			continue;
		}
		mesh.visible = true;
		mesh.rotation.y += dt * 2.4;
	}
	updateHudTimer(hud, engine);
}

function buildCourseHud(documentValue, def, runtime, engine) {
	const root = documentValue.createElement('div');
	root.id = 'courseHud';
	root.className = 'mw-course-hud';
	root.setAttribute('role', 'status');
	root.setAttribute('aria-live', 'polite');
	root.innerHTML = `
		<div class="mw-course-hud-title"></div>
		<div class="mw-course-hud-timer">0:00.0</div>
		<div class="mw-course-hud-row mw-course-hud-progress"></div>
		<div class="mw-course-hud-row mw-course-hud-records"></div>
		<div class="mw-course-hud-status"></div>
		<div class="mw-course-hud-actions">
			<button type="button" class="mw-course-hud-button" data-course-restart>Restart run</button>
			<button type="button" class="mw-course-hud-button mw-course-hud-button-quiet" data-course-exit>Exit course</button>
		</div>`;
	root.querySelector('.mw-course-hud-title').textContent = def.name;
	const host = documentValue.getElementById('hud') || documentValue.body;
	host.appendChild(root);
	const hud = {
		root,
		timer: root.querySelector('.mw-course-hud-timer'),
		progress: root.querySelector('.mw-course-hud-progress'),
		records: root.querySelector('.mw-course-hud-records'),
		status: root.querySelector('.mw-course-hud-status'),
		statusTimer: 0
	};
	root.querySelector('[data-course-restart]').addEventListener('click', () => {
		if (runtime.courseEngine) runtime.courseEngine.restart(runtime.state);
	});
	root.querySelector('[data-course-exit]').addEventListener('click', () => {
		const locationValue = runtime.options?.environment?.location || globalThis.location;
		const url = new URL(locationValue.href);
		url.searchParams.delete('course');
		locationValue.href = url.toString();
	});
	return hud;
}

function updateHudTimer(hud, engine) {
	if (!hud) return;
	const snapshot = engine.snapshot();
	hud.timer.textContent = formatMs(snapshot.courseTimeMs);
	hud.progress.textContent =
		`Checkpoint ${snapshot.checkpointIndex}/${snapshot.checkpointTotal} · Coins ${snapshot.coins}/${snapshot.coinTotal}`;
	const best = snapshot.bestMs === null ? '—' : formatMs(snapshot.bestMs);
	hud.records.textContent = `Best ${best} · Par ${formatMs(snapshot.parSeconds * 1000)}`;
}

function onCourseEvent(hud, engine, type, data) {
	if (!hud) return;
	updateHudTimer(hud, engine);
	const messages = {
		checkpoint: `Checkpoint ${data.checkpointIndex}/${data.total}!`,
		coin: `Coin ${data.coins}/${data.total}`,
		hazard: 'Sweeper hit — back to the checkpoint!',
		respawn: data.reason === 'fall' ? 'Fell — back to the checkpoint!' : '',
		finish: data.isBest
			? `Finished in ${formatMs(data.finalMs)} — new best!`
			: `Finished in ${formatMs(data.finalMs)}!`,
		start: 'Run started — good luck!',
		restart: 'Run restarted.'
	};
	const message = messages[type];
	if (!message) return;
	hud.status.textContent = message;
	hud.status.dataset.visible = 'true';
	clearTimeout(hud.statusTimer);
	hud.statusTimer = setTimeout(() => {
		hud.status.dataset.visible = 'false';
	}, 2600);
}

/**
 * Installs the course menu card once. Safe to call on every boot; it renders
 * nothing when the host element is absent.
 */
export function installCourseMenuCard(documentValue, environment) {
	if (!documentValue || documentValue.getElementById('courseMenuCard')) return;
	const host = documentValue.getElementById('meadowMenu');
	if (!host) return;
	const card = documentValue.createElement('section');
	card.id = 'courseMenuCard';
	card.className = 'mw-course-menu';
	card.setAttribute('aria-label', 'Obstacle courses');
	const list = COURSE_DEFINITIONS.map(def => {
		const params = new URLSearchParams(environment.location?.search || '');
		params.set('course', def.id);
		const href = `${environment.location?.pathname || ''}?${params.toString()}`;
		return `<li><a class="mw-course-menu-link" href="${href}">
			<span class="mw-course-menu-name">${escapeHtml(def.name)}</span>
			<span class="mw-course-menu-meta">${def.difficulty} · par ${formatMs(def.parSeconds * 1000)}</span>
			<span class="mw-course-menu-desc">${escapeHtml(def.description)}</span>
		</a></li>`;
	}).join('');
	card.innerHTML = `<h2 class="mw-course-menu-title">Obstacle Courses</h2>
		<p class="mw-course-menu-sub">Race checkpoints, ride movers, dodge sweepers.</p>
		<ul class="mw-course-menu-list">${list}</ul>`;
	host.appendChild(card);
}

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** Reads `?course=` from the environment. */
export function requestedCourseId(environment) {
	try {
		return new URLSearchParams(environment.location?.search || '').get('course');
	} catch (error) {
		return null;
	}
}
