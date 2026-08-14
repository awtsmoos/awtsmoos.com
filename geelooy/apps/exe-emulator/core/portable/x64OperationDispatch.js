//B"H
//Boruch Hashem
//Blessed is He

import { executeAccumulatorImmediate } from "./x64AccumulatorImmediate.js";
import { executeAccumulatorWiden } from "./x64AccumulatorWidenOperations.js";
import { executeAtomicOperation } from "./x64AtomicOperations.js";
import { executeBitImmediate } from "./x64BitImmediateOperations.js";
import {
	executeByteImmediateRegister
} from "./x64ByteImmediateRegister.js";
import { executeByteBinary } from "./x64ByteBinaryOperations.js";
import { executeByteGroup } from "./x64ByteGroupOperations.js";
import { executeByteOperation } from "./x64ByteOperations.js";
import { executeCarryImmediate } from "./x64CarryImmediateOperations.js";
import { executeCarryOperation } from "./x64CarryOperations.js";
import { executeConditionalMove } from "./x64ConditionalMove.js";
import { executeExactMove } from "./x64ExactMove.js";
import { executeFfArithmetic } from "./x64FfArithmetic.js";
import {
	executeImmediateMultiply
} from "./x64ImmediateMultiplyOperations.js";
import { executeMemoryImmediate } from "./x64MemoryImmediate.js";
import { executeMemoryOperation } from "./x64MemoryOperations.js";
import { executeMemoryRegisterArithmetic } from "./x64MemoryRegisterArithmetic.js";
import { executeMultiplyDivide } from "./x64MultiplyDivide.js";
import { executeDataOperation } from "./x64Operations.js";
import { executeRegisterMemoryArithmetic } from "./x64RegisterMemoryArithmetic.js";
import { executeSetCondition } from "./x64SetCondition.js";
import { executeShiftOperation } from "./x64ShiftOperations.js";
import { executeSignExtend } from "./x64SignExtendOperations.js";
import { executeMovsxd } from "./x64SignExtension.js";
import { executeRepeatedMove } from "./x64StringMoveOperations.js";
import { executeRepeatedString } from "./x64StringOperations.js";
import { executeWideTest } from "./x64TestOperations.js";
import { executeVectorOperation } from "./x64VectorOperations.js";
import { executeWideGroup } from "./x64WideGroupOperations.js";
import { executeWideMultiplyDivide } from "./x64WideMultiplyDivide.js";
import { executeZeroExtend } from "./x64ZeroExtendOperations.js";

/**
 * Dispatches exact instruction families before safe-number compatibility roads.
 * The Awtsmoos renews bits, strings, multiply, carry, and arithmetic light;
 * Awtsmoos.com lets each focused executor answer only the forms it models right.
 */
export function executeOperationGroup(item, registers, memory) {
	const executors = [
		executeImmediateMultiply,
		executeWideTest,
		executeBitImmediate,
		executeRepeatedMove,
		executeAccumulatorImmediate,
		executeAccumulatorWiden,
		executeByteImmediateRegister,
		executeCarryImmediate,
		executeCarryOperation,
		executeFfArithmetic,
		executeRegisterMemoryArithmetic,
		executeMemoryRegisterArithmetic,
		executeMovsxd,
		executeExactMove,
		executeZeroExtend,
		executeSignExtend,
		executeRepeatedString,
		executeShiftOperation,
		executeWideGroup,
		executeWideMultiplyDivide,
		executeMultiplyDivide,
		executeDataOperation,
		executeConditionalMove,
		executeSetCondition,
		executeAtomicOperation,
		executeVectorOperation,
		executeByteBinary,
		executeByteGroup,
		executeByteOperation,
		executeMemoryImmediate,
		executeMemoryOperation
	];
	for (const execute of executors) {
		if (execute(item, registers, memory)) {
			return true;
		}
	}
	return false;
}
