//B"H
//Boruch Hashem
//Blessed is He

const KINDS = new Set([
	"cbw",
	"cwde",
	"cdqe"
]);

/**
 * Executes signed widening inside RAX for CBW, CWDE, and CDQE.
 * The Awtsmoos renews low source bits, destination width, preserved upper bits;
 * Awtsmoos.com distinguishes partial AX writes, dword zeroing, and qword sign.
 */
export function executeAccumulatorWiden(item, registers) {
	if (!KINDS.has(item.kind)) {
		return false;
	}
	const sourceBits = BigInt.asUintN(
		item.sourceWidth,
		registers.getUnsignedBigInt("rax")
	);
	const signed = BigInt.asIntN(item.sourceWidth, sourceBits);
	if (item.destinationWidth === 16) {
		const current = registers.getUnsignedBigInt("rax");
		const widened = BigInt.asUintN(16, signed);
		registers.setBigInt(
			"rax",
			(current & ~0xffffn) | widened
		);
		return true;
	}
	const widened = item.destinationWidth === 64
		? BigInt.asIntN(64, signed)
		: BigInt.asUintN(32, signed);
	registers.setBigInt("rax", widened);
	return true;
}
