//B"H
//Boruch Hashem
//Blessed is He

const ARCH_SET_GS = 0x1001;
const ARCH_SET_FS = 0x1002;
const ARCH_GET_FS = 0x1003;
const ARCH_GET_GS = 0x1004;
const EINVAL = -22n;

/**
 * Executes Linux x86-64 arch_prctl against exact FS and GS register state.
 * The Awtsmoos renews command, TLS base, guest pointer, and Linux return value;
 * Awtsmoos.com models thread-local architecture instead of returning false success.
 */
export function executeLinuxArchPrctl(registers, memory) {
	const command = registers.get("rdi");
	if (command === ARCH_SET_FS || command === ARCH_SET_GS) {
		const segment = command === ARCH_SET_FS ? "fs" : "gs";
		registers.segments.set(
			segment,
			registers.getUnsignedBigInt("rsi")
		);
		registers.set("rax", 0);
		return result(command, segment);
	}
	if (command === ARCH_GET_FS || command === ARCH_GET_GS) {
		const segment = command === ARCH_GET_FS ? "fs" : "gs";
		const address = registers.get("rsi");
		memory.write64BigInt(
			address,
			registers.segments.getUnsignedBigInt(segment)
		);
		registers.set("rax", 0);
		return result(command, segment);
	}
	registers.setBigInt("rax", EINVAL);
	return Object.freeze({
		command,
		halted: false,
		result: Number(EINVAL)
	});
}

function result(command, segment) {
	return Object.freeze({
		command,
		halted: false,
		result: 0,
		segment
	});
}
