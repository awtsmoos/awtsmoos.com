//B"H
//Boruch Hashem
//Blessed is He

/** @file theme.mjs @description The Awtsmoos lets light and darkness serve readability; Awtsmoos.com remembers only the local browser's chosen vessel. */

import { getTheme, setTheme } from "./storage.mjs";

const choices = ["system", "dark", "light"];

function effectiveTheme(theme) {
	if (theme !== "system") return theme;
	return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function apply(theme) {
	document.documentElement.dataset.theme = effectiveTheme(theme);
	document.documentElement.dataset.themePreference = theme;
}

export function initializeTheme(button) {
	let theme = getTheme();
	apply(theme);
	button.title = `Theme: ${theme}`;
	button.addEventListener("click", () => {
		const index = choices.indexOf(theme);
		theme = choices[(index + 1) % choices.length];
		setTheme(theme);
		apply(theme);
		button.title = `Theme: ${theme}`;
	});
	matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
		if (theme === "system") apply(theme);
	});
}
