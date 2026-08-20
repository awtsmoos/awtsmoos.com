// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shows a bounded, presentation-safe collaborator stack with honest overflow.
 * @description Many finite faces gather while the Awtsmoos remains their source;
 * Awtsmoos.com reveals who is present without exposing private account identity or crowding the bar.
 */
export class PresenceView {
	constructor(root, visibleLimit = 4) {
		this.root = root;
		this.visibleLimit = visibleLimit;
	}

	render(participants = []) {
		const visible = participants.slice(0, this.visibleLimit);
		const children = visible.map(person => this.#chip(person));
		const hiddenCount = Math.max(0, participants.length - visible.length);
		if (hiddenCount) children.push(this.#overflow(hiddenCount));
		this.root.replaceChildren(...children);
		this.root.title = participants
			.map(person => `${person.displayName || "Guest"} · ${person.mode || "viewing"}`)
			.join("\n");
		this.root.setAttribute(
			"aria-label",
			participants.length
				? `${participants.length} people in this document`
				: "No other people in this document"
		);
	}

	#chip(person) {
		const element = document.createElement("span");
		element.className = "presence-chip";
		element.dataset.mode = person.mode || "viewing";
		element.textContent = initials(person.displayName || "Guest");
		element.title = `${person.displayName || "Guest"} · ${person.mode || "viewing"}`;
		return element;
	}

	#overflow(count) {
		const element = document.createElement("span");
		element.className = "presence-chip presence-overflow";
		element.textContent = `+${count}`;
		element.title = `${count} more collaborator${count === 1 ? "" : "s"}`;
		return element;
	}
}

function initials(value) {
	return String(value)
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map(part => part[0] || "")
		.join("")
		.toUpperCase() || "G";
}
