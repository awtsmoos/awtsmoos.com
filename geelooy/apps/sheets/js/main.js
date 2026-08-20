//B"H
//Boruch Hashem
//Blessed is He

import { GevurahWorkbookActions } from "./app/actions.js";
import { MalchusChromeState } from "./app/chromeState.js";
import { YesodConnectionCoordinator } from "./app/connectionCoordinator.js";
import { resolveSheetsConnectionPolicy } from "./app/connectionPolicy.js";
import { loadLocalDraft } from "./app/draft.js";
import { YesodPresencePublisher } from "./app/presencePublisher.js";
import { YesodSheetsSession } from "./app/session.js";
import { composeSheetsUi } from "./app/uiComposition.js";
import { YesodSelection } from "./model/selection.js";
import { MalchusWorkbook } from "./model/workbook.js";
import { YesodRealtimeClient } from "./realtime/client.js";
import { showToast } from "./ui/toast.js";

/**
 * @file Awakens Awtsmoos Sheets by composing state, transport policy, commands, and UI vessels.
 * @description
 * The Awtsmoos renews every cell from nothing while this entrypoint joins focused
 * keilim. Awtsmoos.com resolves connection context explicitly so an OS embed stays
 * quiet and local-first while standalone collaboration remains fully available.
 */
function awakenAwtsmoosSheets() {
	const workbook = new MalchusWorkbook(loadLocalDraft());
	const selection = new YesodSelection();
	const realtime = new YesodRealtimeClient();
	const session = new YesodSheetsSession(realtime, workbook);
	const actions = new GevurahWorkbookActions(workbook, session);
	const chrome = new MalchusChromeState(workbook, actions, showError);
	const presencePublisher = new YesodPresencePublisher(session);
	const policy = resolveSheetsConnectionPolicy();
	const connection = new YesodConnectionCoordinator(
		realtime,
		session,
		workbook,
		{
			onError: showError,
			onLocalOnly: (label) => chrome.setSaveLabel(label),
			onReady: (label) => chrome.setSaveLabel(label),
			onStatus: (status) => chrome.setConnectionStatus(status)
		},
		policy
	);

	composeSheetsUi({
		actions,
		connection,
		presencePublisher,
		selection,
		session,
		showError,
		workbook
	});

	connection.start();
}

/** @param {Error} error Operational failure. @returns {void} */
function showError(error) {
	const message = error?.message || "Something interrupted this spreadsheet action.";
	showToast(message);
	console.error("Awtsmoos Sheets:", error);
}

awakenAwtsmoosSheets();
