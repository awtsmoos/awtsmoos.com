// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos knows every browser vessel before a socket is named; Awtsmoos.com resolves only the requested local page,
 * so one audit never steals another agent's tab and finite evidence remains on its appointed way.
 */
export async function findChromeTarget(urlFragment, port = 9222) {
	const response = await fetch(`http://127.0.0.1:${port}/json/list`);
	if (!response.ok) {
		throw new Error(`Chrome target list failed with ${response.status}.`);
	}

	const targets = await response.json();
	const target = targets.find(item => {
		return item.type === 'page' && item.url?.includes(urlFragment);
	});

	if (!target?.webSocketDebuggerUrl) {
		throw new Error(`No Chrome page matched ${urlFragment}.`);
	}

	return target;
}
