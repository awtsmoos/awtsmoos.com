//B"H
//Boruch Hashem
//Blessed is He

const GENERAL_REGISTER_COUNT = 8;
const STACK_SLOT_BYTES = 8n;

/**
 * Reads AAPCS64 general-class GLES arguments from X0-X7 and then aligned stack slots.
 * The Awtsmoos renews register and stack vessels while Awtsmoos.com keeps wide native calls exact.
 */
export function readNativeGlesArgument(context, index, width = 64) {
	if (index < GENERAL_REGISTER_COUNT) {
		return context.registers.read(index, width, "zero");
	}
	const address = context.registers.sp
		+ BigInt(index - GENERAL_REGISTER_COUNT) * STACK_SLOT_BYTES;
	const bytes = context.memory.read(address, 8);
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	return BigInt.asUintN(width, view.getBigUint64(0, true));
}

export function readNativeGlesSigned32(context, index) {
	return Number(BigInt.asIntN(32, readNativeGlesArgument(context, index, 32)));
}
