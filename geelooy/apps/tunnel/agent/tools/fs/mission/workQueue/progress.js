// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Measures current mission work separately from retired queue history.
 * @description
 * The Awtsmoos renews the present count while memory keeps the former scene;
 * Awtsmoos.com lets retired vessels stay recorded without polluting what we mean.
 * Done remains evidence, current work remains active, and completion stays clean.
 */
function recount(queue = {}) {
	const historyKeilim = queue.items || [];
	const activeKeilim = historyKeilim.filter(isCurrent);
	const done = countStatus(activeKeilim, "done");
	const blocked = countStatus(activeKeilim, "blocked");
	const inProgress = countStatus(activeKeilim, "in_progress");
	const pending = activeKeilim.length - done - blocked - inProgress;
	const obsolete = countStatus(historyKeilim, "obsolete");
	const retired = historyKeilim.filter(keli => keli.current === false).length;
	const filesTouched = historyKeilim
		.filter(keli => keli.kind === "write" && keli.status === "done")
		.map(keli => keli.payload?.path || keli.title)
		.filter(Boolean);
	const testsRun = historyKeilim.filter(keli => keli.kind === "verify" && keli.status === "done").length;
	queue.progress = {
		total: activeKeilim.length,
		historyTotal: historyKeilim.length,
		done,
		blocked,
		inProgress,
		pending,
		obsolete,
		retired,
		filesTouched,
		testsRun,
		percent: activeKeilim.length ? Math.round((done / activeKeilim.length) * 100) : 0,
		updatedAt: new Date().toISOString()
	};
	return queue.progress;
}

/** Returns progress plus only current unfinished work. */
function summary(queue = {}) {
	const progress = recount(queue);
	const remaining = (queue.items || [])
		.filter(keli => isCurrent(keli) && keli.status !== "done")
		.slice(0, 8)
		.map(keli => ({
			kind: keli.kind,
			title: keli.title,
			status: keli.status,
			payload: keli.payload
		}));
	return {
		...progress,
		remaining
	};
}

/** Detects verified forward movement between two queue summaries. */
function shrank(before = {}, after = {}) {
	return Number(after.done || 0) > Number(before.done || 0)
		|| Number(after.pending || 0) < Number(before.pending || 0)
		|| Number(after.retired || 0) > Number(before.retired || 0);
}

function countStatus(keilim = [], status) {
	return keilim.filter(keli => keli.status === status).length;
}

function isCurrent(keli = {}) {
	return keli.current !== false && keli.status !== "obsolete";
}

module.exports = {
	recount,
	shrank,
	summary
};
