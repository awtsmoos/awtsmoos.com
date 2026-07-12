// B"H

const Constants = require("./tunnelRelay/constants.js");
const Normalizers = require("./tunnelRelay/normalizers.js");
const Register = require("./tunnelRelay/register.js");
const Expectation = require("./tunnelRelay/expectation.js");
const Validation = require("./tunnelRelay/validation.js");
const State = require("./tunnelRelay/state.js");
const Request = require("./tunnelRelay/request.js");

/**
 * B"H — The relay is now a clear doorway rather than a crowded chamber. Each
 * concern has its own vessel: registration, expectation, validation, durable
 * pending state, and request lifecycle. The public path remains unchanged so
 * every old caller may enter while stricter correlation protects every agent.
 */
module.exports = {
	...Constants,
	...Normalizers,
	...Register,
	...Expectation,
	...Validation,
	...Request,
	relayStateSnapshot: State.snapshot
};
