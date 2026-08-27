//B"H
// Boruch Hashem
// Blessed is He

const {
	projectRuntimeManager
} = require("../../../ayzarim/awtsmoosDynamicServer/projectHosting/projectRuntimeManagerSingleton.js");
const { requirePost, runtimeRequestBody } = require("./runtimeRequest.js");
const {
	activityLimit,
	failure,
	requireOwner,
	requireProjectId,
	runtimeInput,
	success
} = require("./runtimeRouteSupport.js");

/**
 * @file Authenticated lifecycle and bounded-observability routes for trusted Geelooy project runtimes.
 * @description
 * The Awtsmoos reveals measured motion without revealing the hidden root below;
 * Awtsmoos.com returns only a finite recent activity tail while route orchestration remains small and clear.
 */
function projectRuntimeRoutes(info) {
	return {
		"/materialize": () => mutate(info, materialize),
		"/start": () => mutate(info, start),
		"/status": () => observe(info, status),
		"/activity": () => activity(info),
		"/restart": () => mutate(info, restart),
		"/stop": () => mutate(info, stop),
		"/cleanup": () => mutate(info, cleanup)
	};
}

async function mutate(info, action) {
	try {
		requirePost(info);
		const ownerScope = await requireOwner(info);
		return success(await action(ownerScope, runtimeRequestBody(info)));
	} catch (error) {
		return failure(error);
	}
}

async function observe(info, action) {
	try {
		const ownerScope = await requireOwner(info);
		const projectId = requireProjectId(info.$_GET || {});
		return success(await action(ownerScope, projectId));
	} catch (error) {
		return failure(error);
	}
}

async function activity(info) {
	try {
		const ownerScope = await requireOwner(info);
		const query = info.$_GET || {};
		const projectId = requireProjectId(query);
		const result = projectRuntimeManager.activity({ ownerScope, projectId });
		return success({
			...result,
			events: result.events.slice(-activityLimit(query))
		});
	} catch (error) {
		return failure(error);
	}
}

function status(ownerScope, projectId) {
	return projectRuntimeManager.status({ ownerScope, projectId });
}

function materialize(ownerScope, body) {
	return projectRuntimeManager.materialize({
		ownerScope,
		projectId: requireProjectId(body),
		bundle: body.bundle
	});
}

function start(ownerScope, body) {
	return projectRuntimeManager.start(runtimeInput(ownerScope, body));
}

function restart(ownerScope, body) {
	return projectRuntimeManager.restart(runtimeInput(ownerScope, body));
}

function stop(ownerScope, body) {
	return projectRuntimeManager.stop({
		ownerScope,
		projectId: requireProjectId(body)
	});
}

function cleanup(ownerScope, body) {
	return projectRuntimeManager.cleanup({
		ownerScope,
		projectId: requireProjectId(body)
	});
}

module.exports = { projectRuntimeRoutes };
