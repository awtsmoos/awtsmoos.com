//B"H
//Boruch Hashem
//Blessed is He

/**
 * Emits structured portable-C branches and loops. The Awtsmoos creates entrance,
 * condition, repetition, and departure anew; Awtsmoos.com records every break and
 * continue destination explicitly rather than relying on host-language control flow.
 */
export function emitPortableCControl(
	node,
	context,
	emitStatement,
	emitExpression
) {
	if (node.kind === "if") {
		emitIf(node, context, emitStatement, emitExpression);
		return true;
	}
	if (node.kind === "while") {
		emitWhile(node, context, emitStatement, emitExpression);
		return true;
	}
	if (node.kind === "doWhile") {
		emitDoWhile(node, context, emitStatement, emitExpression);
		return true;
	}
	if (node.kind === "for") {
		emitFor(node, context, emitStatement, emitExpression);
		return true;
	}
	return false;
}

function emitIf(node, context, emitStatement, emitExpression) {
	const elseLabel = context.labels.next("if_else");
	const endLabel = context.labels.next("if_end");
	emitExpression(node.condition, context);
	context.emit("CMP RAX, 0", `JE ${node.elseBlock ? elseLabel : endLabel}`);
	emitStatement(node.thenBlock, context);
	if (node.elseBlock) {
		context.emit(`JMP ${endLabel}`, `${elseLabel}:`);
		emitStatement(node.elseBlock, context);
	}
	context.emit(`${endLabel}:`);
}

function emitWhile(node, context, emitStatement, emitExpression) {
	const conditionLabel = context.labels.next("while_condition");
	const endLabel = context.labels.next("while_end");
	context.emit(`${conditionLabel}:`);
	emitExpression(node.condition, context);
	context.emit("CMP RAX, 0", `JE ${endLabel}`);
	withLoop(context, endLabel, conditionLabel, () => {
		emitStatement(node.body, context);
	});
	context.emit(`JMP ${conditionLabel}`, `${endLabel}:`);
}

function emitDoWhile(node, context, emitStatement, emitExpression) {
	const bodyLabel = context.labels.next("do_body");
	const conditionLabel = context.labels.next("do_condition");
	const endLabel = context.labels.next("do_end");
	context.emit(`${bodyLabel}:`);
	withLoop(context, endLabel, conditionLabel, () => {
		emitStatement(node.body, context);
	});
	context.emit(`${conditionLabel}:`);
	emitExpression(node.condition, context);
	context.emit("CMP RAX, 0", `JNE ${bodyLabel}`, `${endLabel}:`);
}

function emitFor(node, context, emitStatement, emitExpression) {
	const conditionLabel = context.labels.next("for_condition");
	const stepLabel = context.labels.next("for_step");
	const endLabel = context.labels.next("for_end");
	if (node.initializer) emitStatement(node.initializer, context);
	context.emit(`${conditionLabel}:`);
	if (node.condition) {
		emitExpression(node.condition, context);
		context.emit("CMP RAX, 0", `JE ${endLabel}`);
	}
	withLoop(context, endLabel, stepLabel, () => {
		emitStatement(node.body, context);
	});
	context.emit(`${stepLabel}:`);
	if (node.step) emitExpression(node.step, context);
	context.emit(`JMP ${conditionLabel}`, `${endLabel}:`);
}

function withLoop(context, breakLabel, continueLabel, callback) {
	context.loops.push(Object.freeze({ breakLabel, continueLabel }));
	try {
		callback();
	} finally {
		context.loops.pop();
	}
}
