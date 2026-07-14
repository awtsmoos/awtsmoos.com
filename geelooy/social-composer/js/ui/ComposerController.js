//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ComposerController
 * @description
 * Identity, destination, editor, media, preview, publication plan, drafts, and
 * execution gather without becoming one monolith. The Awtsmoos gives their unity;
 * Awtsmoos.com redraws only the vessels affected by each transparent state change.
 */

import { renderMetrics } from './ComposerMetrics.js';

export class ComposerController {
	constructor(options) {
		Object.assign(this, options);
	}

	initialize() {
		this.fields.bind();
		this.questionFields.bind();
		this.destinationPanel.initialize();
		this.planView.bind();
		this.bindButtons();
		this.state.addEventListener('change', event => this.changed(event.detail));
		if (!this.workflow.restoreLocal()) this.renderAll(this.state.snapshot());
		this.bindShortcuts();
		void this.aliasPanel.initialize();
	}

	changed({ reason, snapshot }) {
		this.workflow.saveLocal(false);
		this.fields.render(snapshot);
		this.questionFields.render(snapshot);
		this.destinationPanel.render(snapshot);
		this.planView.render(snapshot);
		this.preview.render(snapshot);
		renderMetrics(document, snapshot);
		if (structuralReason(reason)) this.renderEditors(snapshot);
	}

	renderAll(snapshot) {
		this.fields.render(snapshot);
		this.questionFields.render(snapshot);
		this.destinationPanel.render(snapshot);
		this.planView.render(snapshot);
		this.renderEditors(snapshot);
		this.preview.render(snapshot);
		renderMetrics(document, snapshot);
	}

	renderEditors(snapshot) {
		this.blockEditor.render(
			document.getElementById('rootBlocks'),
			snapshot.rootBlocks,
			{ kind: 'root' }
		);
		this.mediaPanel.render(
			document.getElementById('rootMedia'),
			snapshot.rootAttachments,
			{ kind: 'root' }
		);
		this.sectionEditor.render(
			document.getElementById('sectionList'),
			snapshot.sections
		);
	}

	bindButtons() {
		document.getElementById('addSectionButton').addEventListener('click', () => {
			this.actions.addSection();
		});
		document.getElementById('saveLocalButton').addEventListener('click', () => {
			this.workflow.saveLocal(true);
		});
		document.getElementById('saveServerButton').addEventListener('click', () => {
			void this.workflow.saveServer();
		});
		document.getElementById('publishButton').addEventListener('click', () => {
			void this.workflow.publish();
		});
		document.getElementById('previewButton').addEventListener('click', () => {
			document.body.classList.toggle('previewFocused');
		});
		document.getElementById('clearDraftButton').addEventListener('click', () => {
			this.localDrafts.clear(this.state.snapshot());
			this.status.show('Saved local draft cleared. Current text remains open.', 'success');
		});
	}

	bindShortcuts() {
		window.addEventListener('keydown', event => {
			if (!(event.ctrlKey || event.metaKey)) return;
			if (event.key.toLowerCase() === 's') {
				event.preventDefault();
				this.workflow.saveLocal(true);
			}
			if (event.key === 'Enter') {
				event.preventDefault();
				void this.workflow.publish();
			}
		});
	}
}

function structuralReason(reason) {
	return reason === 'replace'
		|| /^block:(add|remove|move|type)$/.test(reason)
		|| /^section:(add|remove|move)$/.test(reason)
		|| /^subsection:(add|remove)$/.test(reason)
		|| /^attachments:(add|remove|status)$/.test(reason);
}

export {
	structuralReason
};
