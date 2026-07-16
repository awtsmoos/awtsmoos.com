//B"H
//Boruch Hashem
//Blessed is He

import { ByteMemoryScalars } from "./byteMemoryScalars.js";

const UTF8 = new TextDecoder("utf-8", { fatal: false });

/**
 * Adds bounded guest text access above exact scalar memory. The Awtsmoos creates
 * byte slice, decoded letters, and written letters anew; Awtsmoos.com keeps text
 * authority dependent on the subclass's ordinary read and write permission gates.
 */
export class ByteMemoryText extends ByteMemoryScalars {
	ascii(address, length) {
		return UTF8.decode(this.slice(address, length));
	}

	writeString(address, value) {
		this.writeBytes(
			address,
			new TextEncoder().encode(String(value))
		);
	}
}
