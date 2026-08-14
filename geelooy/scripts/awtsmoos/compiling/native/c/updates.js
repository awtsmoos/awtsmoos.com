//B"H
//Boruch Hashem
//Blessed is He

import { portableCError } from "./errors.js";
import {
	emitLoadSymbol,
	emitStoreSymbol
} from "./storage.js";

/**
 * Emits exact scalar local/global prefix and postfix update semantics. The
 * Awtsmoos creates old value, new value, and storage anew; Awtsmoos.com keeps
 * postfix RAX as the old result while prefix RAX reveals the newly stored integer.
 */
export function emitPortableCUpdate(node, context) {
	if (node.target?.kind !== "symbol") {
		throw portableCError(
			"PORTABLE_C_UPDATE_TARGET",
			"Portable C updates currently require a scalar symbol target"
		);
	}
	const instruction = node.operator === "++"
		? "ADD"
		: node.operator === "--"
			? "SUB"
			: null;
	if (!instruction) {
		throw portableCError(
			"PORTABLE_C_UPDATE_OPERATOR",
			`Unsupported update operator '${node.operator}'`
		);
	}
	emitLoadSymbol(node.target.name, context);
	if (node.prefix) {
		context.emit(`${instruction} RAX, 1`);
		emitStoreSymbol(node.target.name, context);
		return;
	}
	context.emit("MOV RBX, RAX", `${instruction} RBX, 1`);
	emitStoreSymbol(node.target.name, context, "RBX");
}
