// B"H
import { dist } from '../math.js';
import { radiusForMass } from '../game/scoring.js';

export function updateBoss(world) {
	const boss = world.director.boss;
	if (boss.status !== 'dormant') return;
	const threshold = world.level.targetMass * world.gameMode.bossAt;
	if (world.gameMode.bossImmediate || world.player.mass >= threshold) activateBoss(world);
}

export function activateBoss(world) {
	const boss = world.director.boss;
	if (boss.status !== 'dormant') return boss;
	const core = chooseCore(world);
	if (!core) return boss;
	const anchors = chooseAnchors(world, core);
	if (!anchors.length) return boss;
	core.bossCore = true;
	core.locked = true;
	core.rare = true;
	for (const anchor of anchors) {
		anchor.bossAnchor = true;
		anchor.rare = true;
	}
	Object.assign(boss, {
		status: 'shielded', name: `Awakened ${core.name}`, coreId: core.id,
		anchorIds: anchors.map(anchor => anchor.id), anchorsRemaining: anchors.length, stage: 1
	});
	world.message = `${boss.name} awakened. Break ${anchors.length} luminous seals.`;
	world.events.push(['boss', 'awakened']);
	return boss;
}

export function recordBossCapture(world, object) {
	const boss = world.director.boss;
	if (boss.status === 'shielded' && object.bossAnchor) weakenShield(world);
	if (boss.status === 'exposed' && object.id === boss.coreId) defeatBoss(world);
}

export function bossText(world) {
	const boss = world.director.boss;
	if (boss.status === 'dormant') return 'LANDMARK DORMANT';
	if (boss.status === 'shielded') return `${boss.name} · ${boss.anchorsRemaining} SEALS`;
	if (boss.status === 'exposed') return `${boss.name} · CORE EXPOSED`;
	return `${boss.name} · REVEALED`;
}

function chooseCore(world) {
	const targetRadius = radiusForMass(world.level.targetMass);
	return world.level.objects
		.filter(object => object.category === 'landmark' && !object.taken && object.r <= targetRadius * 0.7)
		.sort((left, right) => right.mass - left.mass)[0] || null;
}

function chooseAnchors(world, core) {
	return world.level.objects
		.filter(object => !object.taken && object !== core && object.r <= core.r * 0.82 && object.mass >= 10)
		.sort((left, right) => dist(left, core) - dist(right, core))
		.slice(0, 3);
}

function weakenShield(world) {
	const boss = world.director.boss;
	boss.anchorsRemaining = boss.anchorIds.filter(id => !world.level.objects.find(object => object.id === id)?.taken).length;
	if (boss.anchorsRemaining) {
		world.message = `${boss.name}: ${boss.anchorsRemaining} seals remain.`;
		return;
	}
	const core = world.level.objects.find(object => object.id === boss.coreId);
	if (core) core.locked = false;
	boss.status = 'exposed';
	boss.stage = 2;
	world.message = `${boss.name}: the central vessel is exposed.`;
	world.events.push(['boss', 'exposed']);
}

function defeatBoss(world) {
	const boss = world.director.boss;
	boss.status = 'defeated';
	boss.stage = 3;
	world.telemetry.bosses += 1;
	world.score += 5000;
	if (Number.isFinite(world.timeLeft)) world.timeLeft += 12;
	world.message = `${boss.name} descended. Five thousand sparks returned.`;
	world.events.push(['boss', 'defeated']);
}
