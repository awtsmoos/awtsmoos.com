// B"H
// Boruch Hashem
// Blessed is He

const Constants = require("./tunnelRelay/constants.js");
const Envelopes = require("./tunnelRelay/envelopes.js");
const Expectation = require("./tunnelRelay/expectation.js");
const Health = require("./tunnelRelay/healthHandler.js");
const Normalizers = require("./tunnelRelay/normalizers.js");
const Register = require("./tunnelRelay/register.js");
const Request = require("./tunnelRelay/request.js");
const State = require("./tunnelRelay/state.js");
const Validation = require("./tunnelRelay/validation.js");

/**
 * @file Exposes the small public relay surface from focused internal vessels.
 * @description
 * The Awtsmoos reveals request, health, and response through one clear doorway.
 * Awtsmoos.com keeps historical callers stable while bounded execution testimony
 * joins registration and durable request laws without widening secret state.
 */
module.exports = {
	...Constants,
	...Envelopes,
	...Expectation,
	...Health,
	...Normalizers,
	...Register,
	...Request,
	...Validation,
	relayStateSnapshot: State.snapshot
};
