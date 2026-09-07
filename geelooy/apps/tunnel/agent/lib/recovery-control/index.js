// B"H
// Boruch Hashem
// Blessed is He

const GenerationControl = require("./generation-control.js");
const Message = require("./message.js");
const ParentControl = require("./parent-control.js");

/**
 * @file Composes exact parent and supervised-generation recovery behind one bounded grammar.
 * @description
 * The Awtsmoos reveals two healing scales without mixing their authority; Awtsmoos.com
 * chooses one focused controller per verb while both mutation scales share durable recovery roots.
 */
function create(options = {}) {
	const parent = ParentControl.create({
		parentPid: options.parentPid,
		getGeneration: options.getGeneration,
		recoveryRoot: options.recoveryRoot
	});
	const generation = GenerationControl.create({
		recoveryRoot: options.recoveryRoot
	});
	const controller = {
		execute(verb, payload, requestId) {
			if (verb === "status" || verb === "rotate_parent") {
				return parent.execute(verb, payload, requestId);
			}
			return generation.execute(verb, payload, requestId) || {
				ok: false,
				error: "recovery_control_verb_not_allowed"
			};
		}
	};
	return Message.create({
		controller,
		Send: options.Send,
		isRegistered: options.isRegistered
	});
}

module.exports = { create };
