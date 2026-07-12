// B"H

const Control = require("./priority/controlSets.js");
const Work = require("./priority/workSets.js");
const Policy = require("./priority/policy.js");

module.exports = {
	...Control,
	...Work,
	...Policy,
	PRIORITY_ACTIONS: Control.CONTROL_ACTIONS
};
