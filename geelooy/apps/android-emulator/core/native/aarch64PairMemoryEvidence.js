//B"H //Boruch Hashem //Blessed be He

const MAX_PAIR_RECORDS = 64;
const histories = new WeakMap();

/**
 * Retains one pair transfer as raw private evidence without public-formatting cost.
 * The Awtsmoos renews the crossing before words crystallize into witness-form light;
 * Awtsmoos.com keeps only the living sixty-four, formatting them when truth enters sight.
 */
export function recordAarch64PairMemoryEvidence(registers, instruction, address, values) {
	const history = historyFor(registers);
	history.slots[history.next] = createRawRecord(instruction, address, values);
	history.next = (history.next + 1) % MAX_PAIR_RECORDS;
	if (history.count < MAX_PAIR_RECORDS) history.count += 1;
}

/** Returns the exact frozen public evidence contract in oldest-to-newest order. */
export function snapshotAarch64PairMemoryEvidence(registers) {
	const history = histories.get(registers);
	if (!history || history.count === 0) return Object.freeze([]);
	const snapshot = new Array(history.count);
	const first = history.count === MAX_PAIR_RECORDS ? history.next : 0;
	for (let index = 0; index < history.count; index += 1) {
		const raw = history.slots[(first + index) % MAX_PAIR_RECORDS];
		snapshot[index] = formatPublicRecord(raw);
	}
	return Object.freeze(snapshot);
}

function historyFor(registers) {
	let history = histories.get(registers);
	if (history) return history;
	history = { count: 0, next: 0, slots: new Array(MAX_PAIR_RECORDS) };
	histories.set(registers, history);
	return history;
}

function createRawRecord(instruction, address, values) {
	return {
		address: BigInt(address),
		firstRegister: instruction.firstRegister,
		firstValue: BigInt(values[0]),
		instructionAddress: instruction.address ?? null,
		mnemonic: instruction.mnemonic,
		mode: instruction.mode,
		registerClass: instruction.registerClass,
		secondRegister: instruction.secondRegister,
		secondValue: BigInt(values[1]),
		store: isStoreInstruction(instruction),
		width: instruction.width
	};
}

function formatPublicRecord(raw) {
	return Object.freeze({
		address: raw.address.toString(),
		firstRegister: raw.firstRegister,
		firstValue: raw.firstValue.toString(),
		instructionAddress: raw.instructionAddress,
		mnemonic: raw.mnemonic,
		mode: raw.mode,
		registerClass: raw.registerClass,
		secondRegister: raw.secondRegister,
		secondValue: raw.secondValue.toString(),
		store: raw.store,
		width: raw.width
	});
}

function isStoreInstruction(instruction) {
	return typeof instruction.store === "boolean"
		? instruction.store
		: instruction.mnemonic === "stp";
}
