//B"H
// Boruch Hashem
// Blessed is He

/**
 * A compressed production function is a shadow on the wall. This formatter lets
 * awtsmoos.com preserve the exact stack coordinates through which the Awtsmoos
 * revealed each request, including parent stacks when Chrome supplies them.
 */
export class InitiatorStackFormatter {
	format(initiator) {
		if (!initiator) return null;
		return {
			type: initiator.type,
			url: initiator.url ?? null,
			lineNumber: initiator.lineNumber ?? null,
			columnNumber: initiator.columnNumber ?? null,
			stack: this.formatStack(initiator.stack)
		};
	}

	formatStack(stack) {
		if (!stack) return null;
		return {
			description: stack.description ?? null,
			callFrames: (stack.callFrames ?? []).map((frame) => ({
				functionName: frame.functionName,
				url: frame.url,
				lineNumber: frame.lineNumber,
				columnNumber: frame.columnNumber
			})),
			parent: this.formatStack(stack.parent)
		};
	}
}
