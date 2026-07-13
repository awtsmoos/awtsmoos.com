//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the edge poison memory vessel in this instant, revealing
 * its focused js ai advanced memory service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Edge poison memory with inward lock.
 *
 * Chapter 239: when the same lip becomes a whirlpool, the AI no longer debates
 * left-right-left-right. It names the edge bitter, locks one inward direction,
 * and walks back toward the platform heart until the loop is broken.
 */
export function updateEdgePoisonMemory(bot, world) {
	bot.aiMind ||= {};
	bot.aiMind.edgePoison ||= freshPoison();
	const memory = bot.aiMind.edgePoison;
	decay(memory);
	const edge = nearestEdge(bot, world);
	const loop = bot.aiMind.positionLoop;
	if (edge && recentlyVisitedSame(memory, edge)) memory.visits++;
	else if (edge) {
		memory.visits = 1;
		memory.lastEdgeX = edge.x;
	}
	if (edge && (memory.visits >= 3 || loop?.edgeBounceFrames > 80)) poison(memory, edge, world);
	memory.blocked = edge
		? poisoned(memory, edge.x) || memory.lockFrames > 0
		: memory.lockFrames > 0;
	memory.escapeDir = lockedEscape(memory, edge, world, bot);
	return { ...memory };
}

/**
 * Reveals the edge poison blocks behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} x The x value entering this behavior.
 */
export function edgePoisonBlocks(bot, x) {
	const memory = bot.aiMind?.edgePoison;
	if (!memory) return false;
	return poisoned(memory, x) || memory.lockFrames > 0;
}

function nearestEdge(bot, world) {
	const p = world.current?.p;
	if (!p) return null;
	const left = p.x;
	const right = p.x + p.w;
	const leftD = Math.abs(bot.x - left);
	const rightD = Math.abs(bot.x - right);
	const x = leftD < rightD ? left : right;
	const side = leftD < rightD ? -1 : 1;
	if (Math.min(leftD, rightD) > 120) return null;
	return { x, side };
}

function recentlyVisitedSame(memory, edge) {
	return Math.abs((memory.lastEdgeX ?? 999999) - edge.x) < 150;
}

function poison(memory, edge, world) {
	const key = edgeKey(edge.x);
	memory.poisoned[key] = 330;
	memory.triggers++;
	memory.visits = 0;
	memory.lockFrames = Math.max(memory.lockFrames || 0, 96);
	memory.lockDir = Math.sign(world.current.safe.center - edge.x || -edge.side || 1) || 1;
}

function lockedEscape(memory, edge, world, bot) {
	if (memory.lockFrames > 0 && memory.lockDir) return memory.lockDir;
	if (edge) return Math.sign(world.current.safe.center - bot.x || -edge.side || 1) || 1;
	return Math.sign(world.current.safe.center - bot.x || 1) || 1;
}

function poisoned(memory, x) {
	return !!memory.poisoned[edgeKey(x)];
}

function decay(memory) {
	memory.lockFrames = Math.max(0, (memory.lockFrames || 0) - 1);
	if (!memory.lockFrames) memory.lockDir = 0;
	for (const key of Object.keys(memory.poisoned)) {
		memory.poisoned[key] = Math.max(0, memory.poisoned[key] - 1);
		if (!memory.poisoned[key]) delete memory.poisoned[key];
	}
}

function edgeKey(x) {
	return String(Math.round(x / 120));
}

function freshPoison() {
	return {
		lastEdgeX: null,
		visits: 0,
		poisoned: {},
		triggers: 0,
		blocked: false,
		escapeDir: 0,
		lockFrames: 0,
		lockDir: 0
	};
}
