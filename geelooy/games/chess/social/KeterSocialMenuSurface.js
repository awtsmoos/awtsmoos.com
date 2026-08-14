// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds watchable-game, public-room, and personal-history menus around the legacy main menu.
 * @description Keter crowns new choices without crowding the old chess vessel in sight;
 * the Awtsmoos renews menu and history, while Awtsmoos.com keeps every user-facing word in light.
 */

/** Creates three small social menus and exposes their controls to orchestration code. */
export class KeterSocialMenuSurface {
	constructor() {
		this.watchable = this.createWatchableMenu();
		this.liveRooms = this.createListMenu("liveChessRoomsMenu", "Live Chess Games");
		this.history = this.createListMenu("chessHistoryMenu", "My Chess History");
	}

	/** Creates the host setup surface for an opt-in remotely watchable local/AI game. */
	createWatchableMenu() {
		const menu = document.createElement("div");
		menu.id = "watchableChessMenu";
		menu.className = "menu chess-social-menu";
		menu.innerHTML = `
			<h2>Start Watchable Game</h2>
			<label>Mode
				<select id="watchableMode">
					<option value="pva">Player vs AI</option>
					<option value="local-pvp">Player vs Player — Same Device</option>
					<option value="ava">AI vs AI</option>
				</select>
			</label>
			<label>Visibility
				<select id="watchableVisibility">
					<option value="unlisted">Unlisted — link only</option>
					<option value="public">Public — appears in Live Games</option>
				</select>
			</label>
			<input id="watchableTitle" maxlength="80" placeholder="Game title (optional)">
			<input id="watchableName" maxlength="48" placeholder="Display name (optional)">
			<button id="watchableStart" class="menu-button">Start + Open Watch Room</button>
			<button class="menu-button chess-social-back">Back</button>
		`;
		document.body.appendChild(menu);
		return {
			root: menu,
			mode: menu.querySelector("#watchableMode"),
			visibility: menu.querySelector("#watchableVisibility"),
			title: menu.querySelector("#watchableTitle"),
			name: menu.querySelector("#watchableName"),
			start: menu.querySelector("#watchableStart"),
			back: menu.querySelector(".chess-social-back")
		};
	}

	/** Creates a reusable read-only menu for live rooms or persisted history. */
	createListMenu(id, title) {
		const menu = document.createElement("div");
		menu.id = id;
		menu.className = "menu chess-social-menu";
		const heading = document.createElement("h2");
		heading.textContent = title;
		const list = document.createElement("div");
		list.className = "chess-social-list";
		const back = document.createElement("button");
		back.className = "menu-button";
		back.textContent = "Back";
		menu.append(heading, list, back);
		document.body.appendChild(menu);
		return { root: menu, list, back };
	}

	/** Shows one social menu while hiding the legacy main menu. */
	show(surface) {
		document.getElementById("mainMenu").style.display = "none";
		surface.root.style.display = "flex";
	}

	/** Returns from a social submenu to the existing legacy main menu. */
	back(surface) {
		surface.root.style.display = "none";
		document.getElementById("mainMenu").style.display = "flex";
	}
}
