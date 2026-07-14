//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserWait
 * @description
 * Real Chrome waits for visible application evidence rather than fixed sleeps. The
 * Awtsmoos needs no polling to know a state while Awtsmoos.com proves each journey
 * step only after the corresponding semantic vessel exists.
 */

export async function waitFor(client, expression, message, attempts = 180) {
	return client.evaluate(`(async () => {
		for (let attempt = 0; attempt < ${attempts}; attempt += 1) {
			if (${expression}) return true;
			await new Promise(resolve => setTimeout(resolve, 50));
		}
		throw new Error(${JSON.stringify(message)});
	})()`);
}

export async function waitForHub(client) {
	return waitFor(
		client,
		`window.AwtsmoosSocialHub?.state.snapshot().identity.aliasId === 'teacher'`,
		'Social Hub did not awaken with the verified alias'
	);
}
