//B"H
//Boruch Hashem
//Blessed be He

const { decodeNativeWebV4 } = require("./NativeWebV4Decoder.js");

/**
 * Executes native web v4 bytecode in the reference JS runtime.
 * The native C runtime consumes the same instruction model and test vectors.
 * @param {Buffer|Uint8Array} input Native web v4 bytes.
 * @returns {object} Mutable execution state and event trigger.
 */
function runNativeWebV4(input) {
	const program = decodeNativeWebV4(input);
	const nodes = new Map();
	const styles = [];
	const events = new Map();
	for (const instruction of program.ops) {
		if (instruction.op === "END") {
			break;
		}
		if (instruction.op === "CREATE_NODE") {
			nodes.set(instruction.handle, createNode(instruction));
			continue;
		}
		if (instruction.op === "SET_ATTR") {
			const node = nodes.get(instruction.handle);
			if (node) {
				node.attributes[instruction.name] = instruction.value;
			}
			continue;
		}
		if (instruction.op === "SET_STYLE" || instruction.op === "SET_STYLE_HANDLE") {
			styles.push(instruction);
			continue;
		}
		if (instruction.op === "BIND_TEXT_EVENT") {
			events.set(eventKey(instruction.targetHandle, instruction.event), instruction);
		}
	}
	return {
		events,
		nodes,
		program,
		styles,
		trigger(targetHandle, eventName) {
			return triggerEvent(nodes, events, targetHandle, eventName);
		}
	};
}

function createNode(instruction) {
	return {
		attributes: {},
		handle: instruction.handle,
		id: instruction.id,
		parentHandle: instruction.parentHandle,
		tag: instruction.tag,
		text: instruction.text
	};
}
function triggerEvent(nodes, events, targetHandle, eventName) {
	const event = events.get(eventKey(targetHandle, eventName));
	if (!event) {
		return false;
	}
	const target = nodes.get(event.actionTargetHandle);
	if (!target) {
		return false;
	}
	target.text = event.value;
	return true;
}

function eventKey(targetHandle, eventName) {
	return `${targetHandle}:${String(eventName || "").toLowerCase()}`;
}

module.exports = { runNativeWebV4 };
