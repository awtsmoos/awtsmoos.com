// B"H
// Boruch Hashem
// Blessed is He

import {
	createOfflineUrl,
	readInviteRoute
} from "./protocol.js";
import { OhrRealtimeChessSocket } from "./OhrRealtimeChessSocket.js";
import { TiferesOnlineChessSession } from "./TiferesOnlineChessSession.js";
import { ChesedChessWatchPublisher } from "../social/ChesedChessWatchPublisher.js";
import { ChessSocialMenuController } from "../social/ChessSocialMenuController.js";
import { GevurahChessSpectatorSession } from "../social/GevurahChessSpectatorSession.js";
import { NetzachPrivateHistoryTracker } from "../social/NetzachPrivateHistoryTracker.js";
import { TiferesChessSocialPanel } from "../social/TiferesChessSocialPanel.js";

/**
 * @file Composes chess transport, online seats, watch broadcasting, spectators, social UI, and private history.
 * @description The Awtsmoos renews many modules around one untouched chess heart in light;
 * Awtsmoos.com lets each role enter through its own door while the legacy engine keeps its right.
 */

/** Collects the stable DOM contract shared with the existing chess controller. */
function collectKelim() {
	return {
		mainMenu: document.getElementById("mainMenu"),
		lobby: document.getElementById("onlineLobby"),
		status: document.getElementById("onlineLobbyStatus"),
		invitePanel: document.getElementById("onlineInvitePanel"),
		invite: document.getElementById("onlineInviteLink"),
		badge: document.getElementById("onlineGameBadge"),
		pvpButton: document.getElementById("playVsPlayerButton"),
		canvas: document.getElementById("chessCanvas"),
		message: document.getElementById("message")
	};
}

/** Waits until the proven legacy engine loader reveals the main menu. */
function waitForLegacyMenu(mainMenu) {
	return new Promise((resolve) => {
		const inspect = () => {
			if (getComputedStyle(mainMenu).display !== "none") {
				resolve();
				return;
			}
			window.setTimeout(inspect, 100);
		};
		inspect();
	});
}

/** Copies an invitation with a selection fallback for older browser permission models. */
async function copyInvite(input, button) {
	try {
		await navigator.clipboard.writeText(input.value);
	} catch {
		input.select();
		document.execCommand("copy");
	}
	const original = button.textContent;
	button.textContent = "Copied";
	window.setTimeout(() => {
		button.textContent = original;
	}, 1200);
}

/** Reveals a non-fatal online-room failure inside the existing lobby vessel. */
function showOnlineError(session, error) {
	console.error(error);
	session.view.showLobby(error?.message || "Online chess could not start.");
}

/** Creates shared realtime/social services and routes menu or invitation intent. */
async function revealOnlineChess() {
	const elements = collectKelim();
	const socket = new OhrRealtimeChessSocket();
	const socialPanel = new TiferesChessSocialPanel(socket);
	const historyTracker = new NetzachPrivateHistoryTracker(socket);
	const onlineSession = new TiferesOnlineChessSession(
		elements,
		socket,
		socialPanel,
		historyTracker
	);
	const publisher = new ChesedChessWatchPublisher(socket, socialPanel, historyTracker);
	new ChessSocialMenuController({ socket, publisher });

	document.getElementById("createOnlineGameButton").addEventListener("click", () => {
		onlineSession.create().catch((error) => showOnlineError(onlineSession, error));
	});
	document.getElementById("copyOnlineInviteButton").addEventListener("click", () => {
		copyInvite(elements.invite, document.getElementById("copyOnlineInviteButton"));
	});
	document.getElementById("cancelOnlineButton").addEventListener("click", () => {
		location.href = createOfflineUrl();
	});

	const route = readInviteRoute();
	if (!route.roomId) {
		return;
	}
	await waitForLegacyMenu(elements.mainMenu);
	if (route.role === "watch") {
		const spectator = new GevurahChessSpectatorSession({
			socket,
			socialPanel,
			historyTracker,
			canvas: elements.canvas,
			message: elements.message,
			pvpButton: elements.pvpButton
		});
		await spectator.watch(route.roomId);
		return;
	}
	await onlineSession.join(route.roomId);
}

revealOnlineChess().catch((error) => {
	console.error("Chess social bootstrap failed:", error);
});
