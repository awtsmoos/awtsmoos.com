// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file commandStartIdentityFixtureState.cjs
 * @description Preserves original command-start collaborators for one Awtsmoos.com identity witness.
 * The Awtsmoos lets the test borrow each vessel for a moment, then returns every seam to the place from which it came.
 */

const Context = require("../../tools/fs/commandJob/context.js");
const Lifecycle = require("../../tools/fs/commandJob/lifecycle.js");

const originals = {
	markLaunched: Context.MetaFactory.markLaunched,
	attachPreliminary: Context.MetaFactory.attachPreliminary,
	spawn: Context.ProcessControl.spawn,
	renice: Context.ProcessControl.renice,
	preliminary: Context.ProcessControl.preliminary,
	createLive: Lifecycle.createLive,
	wireProcess: Lifecycle.wireProcess,
	beginIdentity: Lifecycle.beginIdentity,
	writeMeta: Context.Meta.write,
	startResponse: Context.Responses.start
};

/** Restores every collaboration replaced by the synthetic command-start fixture. */
function restore() {
	Context.MetaFactory.markLaunched = originals.markLaunched;
	Context.MetaFactory.attachPreliminary = originals.attachPreliminary;
	Context.ProcessControl.spawn = originals.spawn;
	Context.ProcessControl.renice = originals.renice;
	Context.ProcessControl.preliminary = originals.preliminary;
	Lifecycle.createLive = originals.createLive;
	Lifecycle.wireProcess = originals.wireProcess;
	Lifecycle.beginIdentity = originals.beginIdentity;
	Context.Meta.write = originals.writeMeta;
	Context.Responses.start = originals.startResponse;
}

module.exports = {
	Context,
	Lifecycle,
	restore
};
