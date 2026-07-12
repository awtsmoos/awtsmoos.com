// B"H

const Serial = require("./keyedSerial.js");
const Policy = require("./policy.js");

function run(config, payload, operation) {
	return Serial.run(Policy.transactionKey(config, payload), operation);
}

module.exports = {
	...Policy,
	run,
	snapshot: Serial.snapshot,
	resetForTests: Serial.resetForTests
};
