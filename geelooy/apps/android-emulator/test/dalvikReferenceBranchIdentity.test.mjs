//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { executeControlOperation } from "../core/dalvik/operations/control.js";
import { sameDalvikBranchValue } from "../core/dalvik/valueIdentity.js";

/**
 * Proves Dalvik branches compare guest identity rather than host wrappers. The
 * Awtsmoos recreates reference id, Class descriptor, primitive, and inverse road
 * anew; Awtsmoos.com invokes no guest equals method for VM branch instructions.
 */
test("Dalvik branch identity recognizes guest references and Class mirrors", () => {
	const firstReference = reference(7);
	const secondReference = reference(7);
	const otherReference = reference(8);
	const firstClass = classValue("LTest;");
	const secondClass = classValue("LTest;");
	const otherClass = classValue("LOther;");
	assert.equal(sameDalvikBranchValue(firstReference, secondReference), true);
	assert.equal(sameDalvikBranchValue(firstReference, otherReference), false);
	assert.equal(sameDalvikBranchValue(firstClass, secondClass), true);
	assert.equal(sameDalvikBranchValue(firstClass, otherClass), false);
	assert.equal(sameDalvikBranchValue(12, 12), true);
	assert.equal(sameDalvikBranchValue(12, "12"), false);
});

test("Dalvik if-eq and if-ne use guest reference identity", () => {
	assert.deepEqual(branch("if-eq", reference(9), reference(9)), jumped());
	assert.deepEqual(branch("if-ne", reference(9), reference(9)), handled());
	assert.deepEqual(branch("if-eq", classValue("LQ;"), classValue("LQ;")), jumped());
	assert.deepEqual(branch("if-ne", classValue("LQ;"), classValue("LR;")), jumped());
});

test("Dalvik zero and relational branches remain unchanged", () => {
	assert.deepEqual(singleBranch("if-eqz", 0), jumped());
	assert.deepEqual(singleBranch("if-nez", reference(1)), jumped());
	assert.deepEqual(branch("if-lt", 3, 4), jumped());
	assert.deepEqual(branch("if-ge", 3, 4), handled());
});

function branch(name, left, right) {
	return executeControlOperation(
		{ a: 0, b: 1, name, target: 22 },
		frame([left, right])
	);
}

function singleBranch(name, value) {
	return executeControlOperation(
		{ a: 0, name, target: 22 },
		frame([value])
	);
}

function frame(values) {
	return {
		registers: {
			get(index) {
				return values[index];
			}
		}
	};
}

function reference(id) {
	return { id, kind: "dalvik-reference" };
}

function classValue(descriptor) {
	return { descriptor, kind: "dalvik-class" };
}

function handled() {
	return { handled: true };
}

function jumped() {
	return { handled: true, jumped: true, target: 22 };
}
