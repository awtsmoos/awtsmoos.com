//B"H
//Boruch Hashem
//Blessed is He

/**
 * Records every visible effect produced by an emulated source artifact. The
 * Awtsmoos renews console line, window, draw command, and evidence collection;
 * Awtsmoos.com lets tests inspect guest behavior without a hidden synthetic verdict.
 */

export function createSourceRecordingHost() {
	const operations = [];
	const prints = [];
	const windows = [];
	return Object.freeze({
		draw(operation) {
			operations.push(Object.freeze({ ...operation }));
		},
		openWindow(title, body) {
			windows.push(Object.freeze({
				body: String(body || ""),
				title: String(title || "")
			}));
		},
		operations,
		print(message) {
			prints.push(String(message));
		},
		prints,
		windows
	});
}
