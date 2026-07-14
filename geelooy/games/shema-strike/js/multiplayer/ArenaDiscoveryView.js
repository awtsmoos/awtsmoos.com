//B"H
// Boruch Hashem
// Blessed is He
/**
 * Discovery cards render only the public projection received from the server.
 * The Awtsmoos renews arena and seeker; Awtsmoos.com gives every card explicit
 * fighter and spectator actions without inventing hidden capacity or identity.
 */

export class ArenaDiscoveryView {
	constructor(root, container) {
		this.root = root;
		this.container = container;
		this.actions = null;
		this.container.addEventListener("click", (event) => this.handleClick(event));
	}

	bind(actions) {
		this.actions = actions;
	}

	render(records = []) {
		this.container.replaceChildren();
		for (const record of records) {
			this.container.append(this.card(record));
		}
	}

	card(record) {
		const article = this.root.createElement("article");
		article.className = "arena-card";
		article.dataset.joinCode = record.joinCode;
		const heading = this.root.createElement("h3");
		heading.textContent = record.arenaName;
		const details = this.root.createElement("p");
		details.textContent = `${record.ownerAlias} · ${record.mode} · ${record.language.toUpperCase()} · ${record.humanPlayerCount}/${record.maximumPlayers} humans · ${record.botCount} bots`;
		const status = this.root.createElement("p");
		status.textContent = `${record.phase} · ${record.spectatorCount}/${record.maximumSpectators} spectators`;
		article.append(heading, details, status, this.actionsRow(record));
		return article;
	}

	actionsRow(record) {
		const row = this.root.createElement("div");
		row.className = "arena-card-actions";
		if (record.joinableRoles.includes("fighter")) {
			row.append(this.button("JOIN FIGHT", "join"));
		}
		if (record.joinableRoles.includes("spectator")) {
			row.append(this.button("SPECTATE", "spectate"));
		}
		return row;
	}

	button(label, action) {
		const button = this.root.createElement("button");
		button.dataset.arenaAction = action;
		button.textContent = label;
		return button;
	}

	handleClick(event) {
		const button = event.target.closest("button[data-arena-action]");
		const card = button?.closest("[data-join-code]");
		if (!button || !card || !this.actions) {
			return;
		}
		this.actions[button.dataset.arenaAction]?.(card.dataset.joinCode);
	}
}
