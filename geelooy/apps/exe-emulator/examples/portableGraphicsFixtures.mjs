//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates tiny identity-valid ELF and Mach-O fixtures with observable graphics
 * hints. The Awtsmoos creates example and boundary anew; Awtsmoos.com uses these
 * bytes only for loader and semantic-translation witnesses, never native execution.
 */
export function createElfFixture(text = "OpenGL glDrawArrays EGL_CreateContext") {
	const bytes = new Uint8Array(64 + text.length);
	bytes.set([0x7f, 0x45, 0x4c, 0x46, 2, 1, 1, 3]);
	const view = new DataView(bytes.buffer);
	view.setUint16(16, 2, true);
	view.setUint16(18, 62, true);
	view.setBigUint64(24, 0x401000n, true);
	writeAscii(bytes, 64, text);
	return bytes;
}

export function createMachOFixture(text = "CGL OpenGL CAMetalLayer MTLDevice") {
	const bytes = new Uint8Array(32 + text.length);
	bytes.set([0xcf, 0xfa, 0xed, 0xfe]);
	const view = new DataView(bytes.buffer);
	view.setUint32(4, 0x01000007, true);
	view.setUint32(16, 2, true);
	writeAscii(bytes, 32, text);
	return bytes;
}

export function createRecordingHost() {
	const operations = [];
	const prints = [];
	const windows = [];
	return {
		operations,
		prints,
		windows,
		draw(operation) {
			operations.push(operation);
		},
		openWindow(title, body) {
			windows.push({ body, title });
		},
		print(message) {
			prints.push(message);
		}
	};
}

function writeAscii(bytes, offset, text) {
	for (let index = 0; index < text.length; index += 1) {
		bytes[offset + index] = text.charCodeAt(index);
	}
}
