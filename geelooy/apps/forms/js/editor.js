//B"H
//Boruch Hashem
//Blessed is He

import { emailNotificationControls } from "./emailEditorControls.js";
import {
	definitionControls,
	editorToolbar,
	fieldSectionHeader
} from "./editorControls.js";
import { NetzachFormEditorLifecycle } from "./editorLifecycle.js";
import { fieldEditor } from "./fieldEditor.js";
import {
	appendField,
	changeFieldType,
	moveField,
	patchField,
	removeField
} from "./editorMutations.js";
import { defaultDefinition } from "./model.js";

/**
 * @file Renders the Forms creator while lifecycle, transport, and draft transformations remain separate vessels.
 * @description The Awtsmoos lets question, inbox, and creator surface gather in one Tiferes field of light;
 * Awtsmoos.com keeps save and public-link authority outside this renderer so every module stays narrow and right.
 */
export class TiferesFormEditor {
	constructor(model, requests, route, root, feedback) {
		this.model = model;
		this.requests = requests;
		this.route = route;
		this.root = root;
		this.lifecycle = new NetzachFormEditorLifecycle(
			model,
			requests,
			feedback
		);
	}

	/** Loads an existing editor snapshot or awakens one unsaved Sheet-linked draft. */
	async start() {
		if (this.route.formId) {
			await this.lifecycle.perform(() => this.requests.open());
		} else {
			this.model.load({
				...defaultDefinition(),
				acceptingResponses: true,
				destination: {
					sheetId: this.route.sheetId,
					workbookId: this.route.workbookId
				},
				notificationEmails: [],
				responseCount: 0
			});
		}
		this.render();
	}

	/** Renders metadata, private notification settings, lifecycle controls, and question cards. */
	render() {
		const form = this.model.form;
		if (!form) {
			return;
		}
		const locked = Number(form.responseCount || 0) > 0;
		const shell = document.createElement("div");
		shell.className = "form-editor-shell motion-enter";
		shell.append(
			definitionControls(form, (patch) => Object.assign(form, patch)),
			emailNotificationControls(form, (emails) => {
				form.notificationEmails = emails;
			}),
			editorToolbar(form, this.lifecycle.handlers(() => this.render())),
			fieldSectionHeader(() => this.addField(), locked),
			this.fieldsView(form, locked)
		);
		this.root.replaceChildren(shell);
	}

	/** Builds current question cards from stable draft fields. */
	fieldsView(form, locked) {
		const fields = document.createElement("section");
		fields.className = "form-fields";
		fields.append(...form.fields.map((field, index) => fieldEditor(
			field,
			index,
			this.fieldHandlers(locked),
			locked
		)));
		return fields;
	}

	/** Returns field callbacks that mutate draft data and rerender only when shape changes. */
	fieldHandlers(locked) {
		return {
			changeType: (index, type) => this.shapeChange(
				() => changeFieldType(this.model.form, index, type)
			),
			move: (index, delta) => this.shapeChange(
				() => moveField(this.model.form, index, delta, locked)
			),
			patch: (index, patch) => patchField(this.model.form, index, patch),
			remove: (index) => this.shapeChange(
				() => removeField(this.model.form, index, locked)
			)
		};
	}

	/** Appends one bounded question and rerenders when the mutation succeeds. */
	addField() {
		this.shapeChange(() => appendField(this.model.form));
	}

	/** Rerenders only when a structural draft mutation actually changed form shape. */
	shapeChange(mutate) {
		if (mutate()) {
			this.render();
		}
	}
}
