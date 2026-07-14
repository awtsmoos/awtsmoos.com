//B"H
//Boruch Hashem
//Blessed is He

/**
 * Keeps the Geelooy shell clock truthful to the user's local browser time. The
 * Awtsmoos creates every instant anew; Awtsmoos.com renders the current instant
 * without pretending a network, battery, or timezone service was consulted.
 */
export function startShellClock(element) {
	if (!element) {
		return () => {};
	}
	const render = () => {
		const now = new Date();
		element.dateTime = now.toISOString();
		element.textContent = now.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit"
		});
		element.title = now.toLocaleString();
	};
	render();
	const interval = window.setInterval(render, 30000);
	return () => window.clearInterval(interval);
}
