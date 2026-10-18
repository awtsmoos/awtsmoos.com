// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file commandStartIdentityFixture.cjs
 * @description Builds the synthetic command-start identity collaborators for Awtsmoos.com.
 * The Awtsmoos lets a child reveal birth before custody leaves the gate;
 * this fixture shapes that measured story while restore state lives in its separate crate.
 */

const assert = require("node:assert/strict");
const State = require("./commandStartIdentityFixtureState.cjs");

const { Context, Lifecycle } = State;

/** Creates one synthetic process before its verified birth token exists. */
function syntheticProcess() {
	return {
		pid: 4321,
		pgid: 4321
	};
}

/** Preserves the production renice seam without performing a synthetic side effect. */
function ignoreRenice() {
	return undefined;
}

/** Creates the preliminary process identity captured immediately after spawn. */
function preliminaryIdentity() {
	return {
		pid: 4321,
		pgid: 4321,
		birthToken: ""
	};
}

/** Creates the in-memory live command vessel used by the ordering witness. */
function createLive(config, payload, jobId, spawned, meta) {
	return {
		config,
		payload,
		jobId,
		spawned,
		meta
	};
}

/** Installs deterministic collaborators and returns the ordering ledger. */
function install() {
	const order = [];

	Context.MetaFactory.markLaunched = meta => {
		meta.status = "spawning";
		order.push("launched");
	};
	Context.ProcessControl.spawn = syntheticProcess;
	Context.ProcessControl.renice = ignoreRenice;
	Context.ProcessControl.preliminary = preliminaryIdentity;
	Context.MetaFactory.attachPreliminary = (meta, identity) => {
		meta.processIdentity = identity;
		order.push("preliminary");
	};
	Lifecycle.createLive = createLive;
	Lifecycle.wireProcess = () => {
		order.push("wired");
	};
	Lifecycle.beginIdentity = async (config, jobId, live) => {
		order.push("identity-started");
		await new Promise(resolve => {
			setTimeout(resolve, 20);
		});
		live.meta.processIdentity = {
			pid: 4321,
			pgid: 4321,
			birthToken: "born:4321"
		};
		order.push("identity-settled");
	};
	Context.Meta.write = async (config, jobId, meta) => {
		assert.equal(meta.processIdentity.birthToken, "born:4321");
		order.push("persisted");
		return {
			status: "running",
			revision: 7
		};
	};
	Context.Responses.start = (jobId, body) => {
		assert.equal(body.meta.processIdentity.birthToken, "born:4321");
		order.push("receipt");
		return {
			jobId,
			...body
		};
	};

	return order;
}

/** Creates the command metadata consumed by the launcher witness. */
function meta() {
	return {
		jobId: "job-awtsmoos-identity",
		command: "echo B'H",
		cwd: "/tmp",
		shell: "/bin/sh",
		timeoutMs: 1000,
		storage: {
			backend: "memory"
		}
	};
}

module.exports = {
	install,
	meta,
	restore: State.restore
};
