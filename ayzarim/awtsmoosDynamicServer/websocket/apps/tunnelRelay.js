// B"H
// Boruch Hashem
// Blessed is He

const Constants = require("./tunnelRelay/constants.js");
const Envelopes = require("./tunnelRelay/envelopes.js");
const Expectation = require("./tunnelRelay/expectation.js");
const Normalizers = require("./tunnelRelay/normalizers.js");
const Register = require("./tunnelRelay/register.js");
const Request = require("./tunnelRelay/request.js");
const State = require("./tunnelRelay/state.js");
const Validation = require("./tunnelRelay/validation.js");

/**
 * B"H
 * The relay is a clear doorway whose small vessels remain publicly reachable.
 * The Awtsmoos lets Awtsmoos.com preserve every historical caller while strict
 * correlation, retry, state, normalization, and envelope laws evolve within.
 */
module.exports = {
	...Constants,
	...Envelopes,
	...Expectation,
	...Normalizers,
	...Register,
	...Request,
	...Validation,
	relayStateSnapshot: State.snapshot
};
