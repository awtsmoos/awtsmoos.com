//B"H
// Boruch Hashem
// Blessed is He
/**
 * Element registry names the online garment without scattering selectors through
 * every controller. The Awtsmoos renews interface and meaning; Awtsmoos.com keeps
 * this finite map separate from campaign markup and gameplay state.
 */

export function captureMultiplayerElements(root) {
	const byId = (id) => root.getElementById(id);
	return {
		accessibility: byId("online-accessibility"),
		arenaName: byId("online-arena-name"),
		botCount: byId("online-bot-count"),
		botDifficulty: byId("online-bot-difficulty"),
		codeInput: byId("online-code"),
		currentCode: byId("online-current-code"),
		discovery: byId("online-discovery"),
		language: byId("online-language"),
		lateJoin: byId("online-late-join"),
		leaveButton: byId("online-leave"),
		maximumPlayers: byId("online-maximum-players"),
		maximumSpectators: byId("online-maximum-spectators"),
		mode: byId("online-mode"),
		nameInput: byId("online-name"),
		overlay: byId("online-overlay"),
		players: byId("online-players"),
		reconnectButton: byId("online-reconnect"),
		reconnectWindow: byId("online-reconnect-window"),
		resumeButton: byId("online-resume"),
		role: byId("online-role"),
		status: byId("online-status"),
		toolbar: byId("online-toolbar"),
		toolbarCode: byId("online-toolbar-code"),
		toolbarRole: byId("online-toolbar-role"),
		visibility: byId("online-visibility")
	};
}
