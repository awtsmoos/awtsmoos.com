// Offscreen document for the Shliach Browser Link (Unrestricted only).
//
// Service workers cannot call URL.createObjectURL (it is not defined in
// their global scope), so the service worker sends the HAR JSON here over
// a port and this hidden document — which is a normal document context —
// creates the Blob URL and starts the download.

chrome.runtime.onConnect.addListener((port) => {
	if (port.name !== "offscreen-download") return;
	port.onMessage.addListener(async (msg) => {
		try {
			const blob = new Blob([msg.json], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			try {
				await chrome.downloads.download({ url, filename: msg.filename, saveAs: false });
			} finally {
				setTimeout(() => URL.revokeObjectURL(url), 10000);
			}
			port.postMessage({ ok: true, filename: msg.filename });
		} catch (e) {
			port.postMessage({ ok: false, error: String((e && e.message) || e) });
		}
	});
});
