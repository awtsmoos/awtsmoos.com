//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Converts Forms realtime connection state into one explicit bounded startup gate.
 * @description The Awtsmoos lets the socket awaken before editor or respondent sends its first measured word of light;
 * Awtsmoos.com refuses timing guesses so startup waits for evidence that the realtime vessel is ready and right.
 */
export function waitForFormsConnection(client, timeoutMs = 12000) {
	if (client.socket?.readyState === WebSocket.OPEN) {
		return Promise.resolve();
	}
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			client.removeEventListener("status", statusChanged);
			reject(new Error("Could not connect to Awtsmoos Forms."));
		}, timeoutMs);
		function statusChanged(event) {
			if (event.detail?.status !== "online") {
				return;
			}
			clearTimeout(timer);
			client.removeEventListener("status", statusChanged);
			resolve();
		}
		client.addEventListener("status", statusChanged);
		client.connect();
	});
}
