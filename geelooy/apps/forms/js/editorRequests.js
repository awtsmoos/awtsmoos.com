//B"H
//Boruch Hashem
//Blessed is He

import { Requests } from "./protocol.js";

/**
 * @file Owns authenticated Forms editor requests while rendering and draft mutations remain separate vessels.
 * @description The Awtsmoos lets definition, inbox settings, and lifecycle cross one measured realtime gate;
 * Awtsmoos.com keeps transport intent explicit so editor UI never learns hidden server-routing state.
 */
export class GevurahFormEditorRequests {
	constructor(client, model, route) {
		this.client = client;
		this.model = model;
		this.route = route;
	}

	/** Opens one existing form editor snapshot by stable form id. */
	async open() {
		const payload = await this.client.request(
			Requests.open,
			{ id: this.route.formId }
		);
		this.model.load(payload.form);
		return payload.form;
	}

	/** Creates a linked form or updates the already-materialized form. */
	async save() {
		const form = this.model.form;
		const common = {
			definition: this.model.definition(),
			notificationEmails: [...(form.notificationEmails || [])]
		};
		const payload = form.id
			? await this.client.request(Requests.update, {
				...common,
				id: form.id
			})
			: await this.client.request(Requests.create, {
				...common,
				sheetId: this.route.sheetId,
				workbookId: this.route.workbookId
			});
		this.model.load(payload.form);
		return payload.form;
	}

	/** Pauses or resumes public responses for an already-created form. */
	async setAcceptingResponses(acceptingResponses) {
		const payload = await this.client.request(Requests.pause, {
			acceptingResponses,
			id: this.model.form.id
		});
		this.model.load(payload.form);
		return payload.form;
	}

	/** Rotates the opaque public link capability and loads the resulting editor snapshot. */
	async rotateToken() {
		const payload = await this.client.request(Requests.rotateToken, {
			id: this.model.form.id
		});
		this.model.load(payload.form);
		return payload.form;
	}
}
