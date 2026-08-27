//B"H
//Boruch Hashem
//Blessed is He

import { addressesInRange } from "../model/coordinates.js";

/**
 * @file Renders collaborator presence and translates selections into grid decoration.
 * @description The Awtsmoos reveals many hands without erasing the one shared page;
 * Awtsmoos.com gives each present soul a gentle mark, whether signed in or guest upon the stage.
 */
export class ChesedPresenceView {
	constructor(workbook, grid) {
		this.workbook = workbook;
		this.grid = grid;
		this.root = document.getElementById("presenceStrip");
		this.members = [];
	}

	/** Replaces current presence from one server-authoritative room snapshot. */
	update(members = []) {
		this.members = Array.isArray(members) ? members : [];
		this.renderAvatars();
		this.renderSelections();
	}

	/** Paints compact collaborator initials with full labels available as titles. */
	renderAvatars() {
		const fragment = document.createDocumentFragment();
		for (const member of this.members.slice(0, 6)) {
			const avatar = document.createElement("div");
			avatar.className = "presence-avatar";
			avatar.title = member.label || "Collaborator";
			avatar.textContent = initials(member.label || "Guest");
			fragment.append(avatar);
		}
		this.root.replaceChildren(fragment);
	}

	/** Converts same-sheet collaborator ranges into the grid renderer's address format. */
	renderSelections() {
		const selections = [];
		for (const member of this.members) {
			const selection = member.selection;
			if (!selection || selection.sheetId !== this.workbook.activeSheetId) {
				continue;
			}
			selections.push({
				addresses: addressesInRange(selection.anchor, selection.focus, 500)
			});
		}
		this.grid.setRemoteSelections(selections);
	}
}

/** Produces a tiny two-character presence mark without exposing account identifiers. */
function initials(label) {
	return String(label || "G")
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() || "")
		.join("")
		.slice(0, 2) || "G";
}
