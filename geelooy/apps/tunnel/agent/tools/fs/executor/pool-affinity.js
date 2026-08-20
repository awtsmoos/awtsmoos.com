// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns filesystem task/resource affinity while preserving the existing state shape.
 * @description
 * The Awtsmoos lets a resource remember one living worker, yet Awtsmoos.com
 * releases that memory when the worker leaves so no dead vessel owns a future deed.
 */
function asyncTaskId(payload = {}) {
	if (!/^asyncTask(?:Status|Wait|OutputPage|Cancel)$/i.test(String(payload.action || ""))) {
		return "";
	}
	return String(payload.taskId || payload.id || "");
}

function resourceId(payload = {}) {
	if (!/^staticServer(?:Stop|Logs)$/i.test(String(payload.action || ""))) return "";
	return String(payload.serverId || "");
}

function ownerForPayload(state, payload = {}) {
	const taskId = asyncTaskId(payload);
	if (taskId) return liveOwner(state, state.taskOwners.get(taskId), state.taskOwners, taskId);
	const id = resourceId(payload);
	return id ? liveOwner(state, state.resourceOwners.get(id), state.resourceOwners, id) : null;
}

function trackOwners(state, worker, payload = {}, result = {}) {
	const taskId = String(result.taskId || "");
	if (taskId) state.taskOwners.set(taskId, worker);
	if (
		String(result.action || payload.action || "") === "staticServerStart"
		&& result.ok !== false
		&& result.serverId
	) {
		state.resourceOwners.set(String(result.serverId), worker);
	}
	if (
		String(payload.action || "") === "staticServerStop"
		&& result.ok !== false
		&& (result.stopped || result.alreadyStopped)
	) {
		state.resourceOwners.delete(String(payload.serverId || ""));
	}
}

function removeWorkerOwners(state, worker) {
	for (const [taskId, owner] of state.taskOwners) {
		if (owner === worker) state.taskOwners.delete(taskId);
	}
	for (const [resourceIdValue, owner] of state.resourceOwners) {
		if (owner === worker) state.resourceOwners.delete(resourceIdValue);
	}
}

function workerOwnsState(state, worker) {
	for (const owner of state.taskOwners.values()) {
		if (owner === worker) return true;
	}
	for (const owner of state.resourceOwners.values()) {
		if (owner === worker) return true;
	}
	return false;
}

function liveOwner(state, worker, map, key) {
	if (!worker) return null;
	if (state.workers.includes(worker) && !worker.retiring) return worker;
	map.delete(key);
	return null;
}

module.exports = {
	asyncTaskId,
	ownerForPayload,
	removeWorkerOwners,
	resourceId,
	trackOwners,
	workerOwnsState
};
