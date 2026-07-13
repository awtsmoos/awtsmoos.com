//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the commitment lease vessel in this instant, revealing
 * its focused js ai advanced strategy service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Commitment lease.
 *
 * Chapter 80: a decision receives a little life. The bot may break it for
 * danger or a kill, but not for nervous flickering every frame.
 */
export function updateLease(bot, world, desired) {
	bot.aiMind ||= {};
	const lease = bot.aiMind.commitmentLease;
	if (lease && !breakLease(bot, world, lease)) {
		lease.frames--;
		if (lease.frames > 0) return lease;
	}
	const next = createLease(desired, world);
	bot.aiMind.commitmentLease = next;
	return next;
}

/**
 * Reveals the lease opportunity name behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} lease The lease value entering this behavior.
 * @param {*} fallback The fallback value entering this behavior.
 */
export function leaseOpportunityName(lease, fallback) {
	if (!lease?.active) return fallback;
	if (lease.kind === 'resource') return lease.type === 'item' ? 'ItemChase' : 'ObjectiveChase';
	if (lease.kind === 'cluster') return 'Chase';
	if (lease.kind === 'edge') return 'EdgeGuard';
	return fallback;
}

function createLease(desired, world) {
	if (!desired) return { active: false, frames: 0, kind: 'none' };
	if (desired.name === 'ObjectiveChase')
		return lease('resource', desired.x || world.objective?.x, 80, 'objective');
	if (desired.name === 'ItemChase')
		return lease('resource', desired.x || world.stageItem?.x, 70, 'item');
	if (desired.name === 'LandingIntercept') return lease('trap', world.landing?.x, 44, 'landing');
	if (desired.name === 'EdgeGuard') return lease('edge', world.edgePressure?.standX, 48, 'edge');
	if (world.antiWander?.active) return lease('cluster', world.antiWander.x, 70, 'cluster');
	return { active: false, frames: 0, kind: 'none' };
}

function lease(kind, x, frames, type) {
	return { active: true, kind, x, frames, type };
}
function breakLease(bot, world, lease) {
	if (lease.frames <= 0) return true;
	if (world.threatVision?.panic || bot.damage > 155) return true;
	if (world.combatHeat?.killMode && world.combat?.canHitNow) return true;
	if (
		lease.kind === 'resource' &&
		!world.resourcePing?.active &&
		!world.objective &&
		!world.stageItem
	)
		return true;
	return false;
}
