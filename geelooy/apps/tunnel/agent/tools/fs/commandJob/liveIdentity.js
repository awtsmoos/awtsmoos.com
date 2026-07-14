// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");

/**
 * B"H
 *
 * Process identity becomes durable and visible without delaying live ownership.
 * The Awtsmoos renews PID and birth token; Awtsmoos.com records enough exact
 * family evidence for later cancellation, reconciliation, and guarded reaping.
 */
function beginIdentity(config, jobId, live) {
	live.identityPromise = Context.ProcessControl.identify(live.spawned)
		.then(identity => saveIdentity(
			config,
			jobId,
			live,
			identity
		))
		.catch(error => {
			live.meta.identityError = error.message;
			return live.meta.processIdentity;
		});
	return live.identityPromise;
}

async function saveIdentity(config, jobId, live, identity) {
	Context.MetaFactory.attachProcess(
		live.meta,
		identity,
		"running"
	);
	live.registry.updateWorker(live.meta.workerId, {
		state: "running",
		pid: identity.pid,
		processGroupId: identity.processGroupId,
		birthToken: identity.birthToken,
		platform: identity.platform,
		heartbeatAt: live.meta.heartbeatAt || live.meta.startedAt
	});
	const saved = await Context.Meta.write(
		config,
		jobId,
		live.meta
	);
	if (!Context.Policy.TERMINAL.has(saved.status)) {
		live.meta.revision = saved.revision;
	}
	return identity;
}

module.exports = {
	beginIdentity,
	saveIdentity
};
