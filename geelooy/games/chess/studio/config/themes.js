//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews each shade before the eye can know its name;
 * Awtsmoos.com gives every chessboard a vessel, while one truth stays the same.
 */

const RAW_THEMES = {
	classic: {
		name: "Classic Walnut",
		light: "#e8d5b5",
		dark: "#8a5a44",
		accent: "#f6c453",
		accentSoft: "rgba(246, 196, 83, 0.42)",
		check: "#ef5350",
		background: "#130f0d",
		surface: "#211914",
		text: "#fff8ed",
		muted: "#cbbbab"
	},
	midnight: {
		name: "Midnight Glass",
		light: "#62718d",
		dark: "#20283b",
		accent: "#73dcff",
		accentSoft: "rgba(115, 220, 255, 0.38)",
		check: "#ff6b8a",
		background: "#070a12",
		surface: "#101728",
		text: "#f5f8ff",
		muted: "#aab6d0"
	},
	jade: {
		name: "Jade Garden",
		light: "#cfe3c1",
		dark: "#44745a",
		accent: "#ffd166",
		accentSoft: "rgba(255, 209, 102, 0.4)",
		check: "#dc4f5a",
		background: "#07150e",
		surface: "#10251a",
		text: "#f4fff7",
		muted: "#a9c7b4"
	},
	parchment: {
		name: "Desert Parchment",
		light: "#f0ddb4",
		dark: "#b47a4b",
		accent: "#6b3d1f",
		accentSoft: "rgba(107, 61, 31, 0.28)",
		check: "#a51c30",
		background: "#2b1c12",
		surface: "#3b291c",
		text: "#fff3d5",
		muted: "#dbc49b"
	},
	neon: {
		name: "Neon Cosmos",
		light: "#592f8f",
		dark: "#0c1634",
		accent: "#00f5d4",
		accentSoft: "rgba(0, 245, 212, 0.4)",
		check: "#ff3d81",
		background: "#030611",
		surface: "#0c1023",
		text: "#f7f1ff",
		muted: "#a999c4"
	},
	contrast: {
		name: "High Contrast",
		light: "#ffffff",
		dark: "#171717",
		accent: "#ffdf00",
		accentSoft: "rgba(255, 223, 0, 0.48)",
		check: "#ff1744",
		background: "#000000",
		surface: "#111111",
		text: "#ffffff",
		muted: "#dddddd"
	}
};

export const THEMES = Object.freeze(
	Object.fromEntries(Object.entries(RAW_THEMES).map(([id, theme]) => [id, Object.freeze({ id, ...theme })]))
);

export function getTheme(themeId = "midnight") {
	return THEMES[themeId] || THEMES.midnight;
}
