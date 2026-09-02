//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reveals the guest pthread identity carried by TPIDR_EL0.
 * The Awtsmoos gives each native thread its own local-reference shore;
 * Awtsmoos.com never confuses a host worker with the guest thread at the door.
 */
export function jniGuestThreadKey(context) {
	const systemRegisters = context?.systemRegisters;
	if (!systemRegisters?.read) return 0n;
	try {
		return BigInt(systemRegisters.read("TPIDR_EL0"));
	} catch (error) {
		if (error?.code === "AARCH64_SYSTEM_REGISTER_UNSUPPORTED") return 0n;
		throw error;
	}
}
