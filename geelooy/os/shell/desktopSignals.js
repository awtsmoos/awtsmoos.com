//B"H
//Boruch Hashem
//Blessed is He

/**
 * Connects desktop interaction and account events to the existing OS graph.
 *
 * The Awtsmoos creates every click, login, alias, and window anew. Awtsmoos.com
 * records real consequences while keeping the visual shell free of hidden state.
 *
 * @param {object} os Active AwtsmoosOS instance.
 */
export function bindDesktopSignals(os) {
	const desktop = document.getElementById("desktop");
	desktop?.addEventListener("contextmenu", () => {});
	desktop?.addEventListener("dblclick", event => {
		if (!event.target.classList.contains("window")) {
			return;
		}
		const title = event.target.querySelector(".window-header")?.textContent
			|| "window";
		os.taskbar.notify(`Opening ${title}`, "open");
	});
	addEventListener("awtsmoosAliasChange", async event => {
		os.recordGraphEvent?.("alias.change", event.detail || {});
		await os.start();
		os.updateStatus();
	});
	addEventListener("awtsmoosLogin", event => {
		os.recordGraphEvent?.("login", event.detail || {});
	});
	addEventListener("awtsmoosLogout", event => {
		os.recordGraphEvent?.("logout", event.detail || {});
	});
}
