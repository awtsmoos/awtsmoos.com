//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Coordinates prompt style and provider UI while delegating imported-document life to a smaller vessel.
 * The Awtsmoos lets one commentary chamber divide into prompt, document, and voice without dividing its truth;
 * Awtsmoos.com keeps each module small enough that a future agent can trace the light from click to move and proof.
 */
import { buildCommentaryPrompt } from "../commentary/commentaryPrompt.js";
import { commentaryPromptPresetList, getCommentaryPromptPreset } from "../commentary/commentaryPromptPresets.js";
import { CommentaryDocumentVessel } from "./commentaryDocumentVessel.js";
import { initializeCommentaryPanel, updateTtsProviderView } from "./commentaryPanelView.js";
import { copyCommentaryPrompt } from "./commentaryPromptActions.js";

export class CommentaryController {
	constructor(refs, controller) {
		this.refs = refs;
		this.controller = controller;
		this.documents = new CommentaryDocumentVessel(
			refs,
			controller,
			message => this.status(message)
		);
		this.initializePreset();
		this.bind();
		initializeCommentaryPanel(refs);
		this.updateGame();
	}

	initializePreset() {
		const options = commentaryPromptPresetList().map(
			item => new Option(`${item.name} · ${item.description}`, item.id)
		);
		this.refs.commentaryPreset.replaceChildren(...options);
		this.refs.commentaryPreset.value = "coach";
		if (!this.refs.commentaryInstructions.value.trim()) {
			this.refs.commentaryInstructions.value = getCommentaryPromptPreset("coach").instructions;
		}
	}

	bind() {
		const refs = this.refs;
		refs.commentaryPreset.addEventListener("change", () => this.applyPreset());
		refs.commentaryFormat.addEventListener("change", () => this.updateGame());
		refs.commentaryInstructions.addEventListener("input", () => this.updateGame());
		refs.commentaryPromptCopy.addEventListener("click", () => copyCommentaryPrompt(refs, message => this.status(message)));
		refs.commentaryValidate.addEventListener("click", () => this.documents.validate());
		refs.commentaryImport.addEventListener("click", () => this.documents.import());
		refs.commentaryClear.addEventListener("click", () => this.documents.clear());
		refs.commentaryList.addEventListener("click", event => this.documents.jump(event));
		refs.commentaryExportJson.addEventListener("click", () => this.documents.export("json"));
		refs.commentaryExportPgn.addEventListener("click", () => this.documents.export("pgn"));
		refs.commentaryExportSidecar.addEventListener("click", () => this.documents.export("sidecar"));
		refs.ttsProvider.addEventListener("change", () => updateTtsProviderView(refs));
		refs.speakCurrent.addEventListener("click", () => this.documents.speakCurrent());
		refs.speakAll.addEventListener("click", () => this.documents.speakAll());
		refs.speakStop.addEventListener("click", () => this.stop());
	}

	applyPreset() {
		const preset = getCommentaryPromptPreset(this.refs.commentaryPreset.value);
		if (preset.id !== "custom") {
			this.refs.commentaryInstructions.value = preset.instructions;
		}
		this.updateGame();
		this.status(`${preset.name} directions ready. Copy the prompt into any AI agent.`);
	}

	updateGame() {
		this.refs.commentaryPrompt.value = buildCommentaryPrompt(
			this.refs.pgn.value,
			this.refs.commentaryInstructions.value,
			this.refs.commentaryFormat.value
		);
	}

	syncCurrent(ply) {
		this.documents.syncCurrent(ply);
	}

	stop() {
		this.documents.stop();
	}

	status(message) {
		this.refs.commentaryStatus.textContent = message;
	}
}
