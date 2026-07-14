//B"H
//Boruch Hashem
//Blessed is He

/**
 * The cooperative guardian carries three server-owned phases into the shared road.
 * The Awtsmoos renews warning and force together; Awtsmoos.com derives every public
 * phase from remaining health and never accepts boss state from a client packet.
 */

function createCoopBoss(playerCount, locationId) {
	const maxHealth = 700 + Math.max(2, playerCount) * 220;
	return {
		id: `coop-boss-${locationId}`,
		name: cooperativeBossName(locationId),
		x: 3600,
		y: 620,
		vx: 0,
		health: maxHealth,
		maxHealth,
		phase: 1,
		attackCooldown: 30,
		active: false,
		dead: false
	};
}

function updateCoopBossPhase(boss) {
	if (!boss || boss.dead) return 0;
	const ratio = boss.health / boss.maxHealth;
	boss.phase = ratio <= 0.33 ? 3 : ratio <= 0.66 ? 2 : 1;
	return boss.phase;
}

function publicCoopBoss(boss) {
	if (!boss) return null;
	return {
		id: boss.id,
		name: boss.name,
		x: rounded(boss.x),
		y: rounded(boss.y),
		health: rounded(boss.health),
		maxHealth: boss.maxHealth,
		phase: boss.phase,
		active: boss.active,
		dead: boss.dead
	};
}

function cooperativeBossName(locationId) {
	const names = {
		'crown-ruins': 'The Dust Warden',
		'foundation-engine': 'The Foundation Heart',
		'palace-reflections': 'The Mirror Regent',
		'endless-causeway': 'The Unyielding Champion',
		'heart-sanctum': 'The Heart Conductor',
		'furnace-depths': 'The Furnace Judge',
		'bridge-light': 'The Bridge Seraph',
		'tower-forms': 'The Prime Architect',
		'wisdom-rift': 'The Rift Sage',
		'throne-road': 'The Throne of Unity'
	};
	return names[locationId] || 'The Road Guardian';
}

function rounded(value) {
	return Math.round(Number(value || 0) * 10) / 10;
}

module.exports = {
	createCoopBoss,
	publicCoopBoss,
	updateCoopBossPhase
};
