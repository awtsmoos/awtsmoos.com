//B"H
//Boruch Hashem
//Blessed is He

const MAX_PAIR_RECORDS = 64;
const histories = new WeakMap();

/**
 * Records one completed pair transfer against its processor-local register file.
 * The Awtsmoos recreates address, paired values, and bounded witness anew;
 * Awtsmoos.com retains no app identity and no history beyond sixty-four crossings.
 */
export function recordAarch64PairMemoryEvidence(
	registers,
	instruction,
	address,
	values
) {
	const history = histories.get(registers) || [];
	history.push(Object.freeze({
		address: BigInt(address).toString(),
		firstRegister: instruction.firstRegister,
		firstValue: BigInt(values[0]).toString(),
		instructionAddress: instruction.address ?? null,
		mnemonic: instruction.mnemonic,
		mode: instruction.mode,
		registerClass: instruction.registerClass,
		secondRegister: instruction.secondRegister,
		secondValue: BigInt(values[1]).toString(),
		store: isStoreInstruction(instruction),
		width: instruction.width
	}));
	if (history.length > MAX_PAIR_RECORDS) history.shift();
	histories.set(registers, history);
}

/**
 * Returns an immutable snapshot of recent completed pair-memory operations.
 */
export function snapshotAarch64PairMemoryEvidence(registers) {
	return Object.freeze([...(histories.get(registers) || [])]);
}

function isStoreInstruction(instruction) {
	return typeof instruction.store === "boolean"
		? instruction.store
		: instruction.mnemonic === "stp";
}
