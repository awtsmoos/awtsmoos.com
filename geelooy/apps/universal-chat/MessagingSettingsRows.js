// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds privacy-policy controls and special-pane actions without letting presentation become authorization.
 * @description The Awtsmoos contains every boundary before a select exists, while Awtsmoos.com lets the human understand who may knock at each private door in light;
 * these controls explain request intent, delegate persistence to existing server policy owners, and never grant private speech merely because a browser value changed in sight.
 */

/** Builds one request-policy row and delegates persistence to the existing settings action. */
export function requestPolicyRow(kind, value, onChange) {
	const row = document.createElement("label");
	row.className = "messaging-setting-row";
	const copy = document.createElement("span");
	copy.className = "messaging-setting-copy";
	const name = document.createElement("strong");
	name.textContent = settingLabel(kind);
	const hint = document.createElement("small");
	hint.textContent = settingHint(kind);
	copy.append(name, hint);
	const select = document.createElement("select");
	select.dataset.requestKind = kind;
	select.setAttribute("aria-label", `${settingLabel(kind)} request policy`);
	for (const policy of ["everyone", "friends", "nobody"]) {
		const option = document.createElement("option");
		option.value = policy;
		option.textContent = capitalize(policy);
		option.selected = value === policy;
		select.appendChild(option);
	}
	select.addEventListener("change", () => onChange(kind, select.value));
	row.append(copy, select);
	return row;
}

export function specialButton(label, action) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "messaging-special-button";
	button.textContent = label;
	button.addEventListener("click", action);
	return button;
}

export function specialLink(label, href) {
	const link = document.createElement("a");
	link.href = href;
	link.textContent = label;
	link.className = "messaging-link-button messaging-special-link";
	return link;
}

function settingLabel(kind) {
	return ({
		chat: "Private chat",
		whisper: "Whispers",
		friend: "Friendship",
		"group-invite": "Group invitations",
		mail: "Email contact"
	})[kind] || kind;
}

function settingHint(kind) {
	return ({
		chat: "Who may ask to open a private chat.",
		whisper: "Who may request a private whisper.",
		friend: "Who may send a mutual friend request.",
		"group-invite": "Who may invite this alias to a private group.",
		mail: "Who may request an Awtsmoos Mail handoff."
	})[kind] || "Who may send this request.";
}

function capitalize(value) {
	const text = String(value || "");
	return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}
