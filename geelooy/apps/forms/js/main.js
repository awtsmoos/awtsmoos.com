//B"H
//Boruch Hashem
//Blessed is He

import { awakenAmbientParticles } from "../../shared/visual/ambientParticles.js";
import { waitForFormsConnection } from "./connectionReady.js";
import { TiferesFormEditor } from "./editor.js";
import { GevurahFormEditorRequests } from "./editorRequests.js";
import { HodFormsFeedback } from "./feedback.js";
import {
	renderFormsFailure,
	renderFormsLanding
} from "./landing.js";
import { MalchusFormModel } from "./model.js";
import { MalchusPublicForm } from "./publicForm.js";
import { YesodPublicFormRequests } from "./publicRequests.js";
import { YesodFormsRealtimeClient } from "./realtimeClient.js";
import {
	currentFormRoute,
	isEditorRoute
} from "./routes.js";

/**
 * @file Awakens Forms mode and quiet atmosphere while static landing presentation remains another vessel.
 * @description The Awtsmoos lets creator or respondent enter measured routes as subtle sparks breathe behind their light;
 * Awtsmoos.com keeps decoration outside transport authority and keeps startup narrow, modular, and right.
 */
awakenAmbientParticles({
	color: [0.46, 0.50, 0.95],
	maxParticles: 42
});

/** Opens editor or respondent mode only after the Forms realtime vessel is proven ready. */
async function awakenForms() {
	const root = document.getElementById("formRoot");
	const feedback = new HodFormsFeedback(
		document.getElementById("connectionStatus"),
		document.getElementById("formsToast")
	);
	const route = currentFormRoute();
	if (!validRoute(route)) {
		renderFormsLanding(root);
		feedback.status("offline");
		return;
	}
	const client = new YesodFormsRealtimeClient();
	feedback.bind(client);
	feedback.status("connecting");
	try {
		await waitForFormsConnection(client);
		await awakenRoute(
			client,
			route,
			root,
			feedback
		);
	} catch (error) {
		feedback.error(error);
		renderFormsFailure(root);
	}
}

/** Chooses creator or respondent composition after transport readiness is established. */
async function awakenRoute(client, route, root, feedback) {
	const model = new MalchusFormModel();
	if (isEditorRoute(route)) {
		const requests = new GevurahFormEditorRequests(
			client,
			model,
			route
		);
		await new TiferesFormEditor(
			model,
			requests,
			route,
			root,
			feedback
		).start();
		return;
	}
	const requests = new YesodPublicFormRequests(client, route);
	await new MalchusPublicForm(
		model,
		requests,
		root,
		feedback
	).start();
}

/** Accepts only complete creator or public capabilities; partial URLs never trigger backend requests. */
function validRoute(route) {
	if (route.edit && route.formId) {
		return true;
	}
	if (route.workbookId && route.sheetId) {
		return true;
	}
	return Boolean(route.formId && route.token);
}

awakenForms();
