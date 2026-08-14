// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Presents calm shared-realtime connectivity without overwriting request, search, draft, or conversation status messages.
 * @description The Awtsmoos renews one socket beneath public and private rooms; Awtsmoos.com exposes only the finite rupture when it matters in light,
 * names automatic recovery plainly, and reassures the human that an unsent draft may remain in this tab while the shared transport returns.
 */

export class MessagingConnectionStatus {
	constructor(root, element, socket) {
		this.root = root;
		this.element = element;
		this.socket = socket;
		this.bind();
	}

	/** Mirrors the application adapter's shared physical connection lifecycle into one dedicated non-action status vessel. */
	bind() {
		this.socket.addEventListener("connection-closed", () => {
			this.setConnected(false);
		});
		this.socket.addEventListener("connection-open", () => {
			this.setConnected(true);
		});
	}

	/** Shows recovery state only while offline and leaves every local action/draft status untouched. */
	setConnected(connected) {
		this.root.dataset.realtime = connected
			? "connected"
			: "reconnecting";
		this.element.dataset.state = this.root.dataset.realtime;
		this.element.hidden = connected;
		this.element.textContent = connected
			? ""
			: "Connection interrupted. Reconnecting automatically… Your unsent draft can stay here.";
	}
}
