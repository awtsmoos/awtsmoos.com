//B"H
//Boruch Hashem
//Blessed is He

import {
	publicFormUrl,
	replaceWithEditorRoute
} from "./routes.js";

/**
 * @file Owns Forms creator persistence, public-link lifecycle, pause state, preview, and token rotation.
 * @description The Awtsmoos lets one saved form become a stable doorway while rendering remains another vessel of light;
 * Awtsmoos.com separates lifecycle from question layout so each module carries one clear and extensible rite.
 */
export class NetzachFormEditorLifecycle {
	constructor(model, requests, feedback) {
		this.model = model;
		this.requests = requests;
		this.feedback = feedback;
	}

	/** Returns toolbar callbacks while the caller supplies the one render continuation. */
	handlers(render) {
		return {
			copyLink: () => this.perform(async () => {
				const form = await this.ensureSaved(render);
				await navigator.clipboard.writeText(publicFormUrl(form));
				this.feedback.message("Public form link copied.");
			}),
			pause: () => this.perform(async () => {
				const form = await this.ensureSaved(render);
				await this.requests.setAcceptingResponses(!form.acceptingResponses);
				render();
			}),
			preview: () => this.perform(async () => {
				const form = await this.ensureSaved(render);
				window.open(publicFormUrl(form), "_blank", "noopener");
			}),
			rotate: () => this.perform(async () => {
				await this.ensureSaved(render);
				await this.requests.rotateToken();
				render();
				this.feedback.message("Public link rotated.");
			}),
			save: () => this.perform(async () => {
				await this.save(render);
				this.feedback.message("Form saved.");
			})
		};
	}

	/** Materializes or updates the form and stabilizes the editor URL after first creation. */
	async save(render) {
		const wasNew = !this.model.form?.id;
		const form = await this.requests.save();
		if (wasNew) {
			replaceWithEditorRoute(form.id);
		}
		render();
		return form;
	}

	/** Ensures lifecycle actions operate on a durable form rather than an unmaterialized draft. */
	async ensureSaved(render) {
		return this.model.form?.id
			? this.model.form
			: await this.save(render);
	}

	/** Routes asynchronous editor failures through one shell-level feedback surface. */
	async perform(operation) {
		try {
			return await operation();
		} catch (error) {
			this.feedback.error(error);
			return null;
		}
	}
}
