// B"H
// Boruch Hashem
// Blessed is He

const Storage = require("./taskStorage.js");

/**
 * @file Projects namespace-fenced AI task families and parent-child relations.
 * @description
 * The Awtsmoos reveals a forest without confusing branches from another root.
 * Awtsmoos.com keeps every relation scoped to the same durable namespace vessel.
 */
function allTasks(scope = null) {
	return Storage.listTasks(namespace(scope));
}

function listTasks(limit = 50, scope = null) {
	return allTasks(scope)
		.sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
		.slice(0, limit);
}

function family(rootId, scope = null) {
	return allTasks(scope).filter(task =>
		task.id === rootId || task.rootTaskId === rootId || task.input?.rootTaskId === rootId);
}

function activeFamily(rootId, scope = null) {
	return family(rootId, scope).filter(task => ["queued", "running"].includes(task.status));
}

function childrenOf(parentId, scope = null) {
	return allTasks(scope).filter(task =>
		task.parentTaskId === parentId || task.input?.parentTaskId === parentId);
}

function countFamily(rootId, scope = null) {
	return family(rootId, scope).length;
}

function namespace(scope) {
	return scope ? Storage.taskNamespace(scope) : "";
}

module.exports = { activeFamily, allTasks, childrenOf, countFamily, family, listTasks };
