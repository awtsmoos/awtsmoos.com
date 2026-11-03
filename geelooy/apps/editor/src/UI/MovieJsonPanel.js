// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Movie JSON panel gives the Mitzvah World Animator the data doorway it was
 * missing: the scene can leave as an Editor scene document or as a canonical
 * awtsmoos-movie-v1 movie, and both can come back in — by paste or by file — with
 * every failure (parse errors included) stated in the panel instead of swallowed.
 * The scene also autosaves to versioned local storage on every change and is
 * restored on the next boot when the stage starts empty. Honest preview level:
 * this panel exports FOR the studio renderers (Awtsmoos Studio / Animator dock
 * play canonical movies); it does not embed a canonical renderer of its own.
 */
import { HTML } from "../Core/HTML.js";
import { BasePanel } from "./BasePanel.js";
import { parseSceneDocument } from "../Movie/EditorSceneDocument.js";
import { applySceneDocument, buildSceneDocument } from "../Movie/EditorSceneIO.js";
import { canonicalMovieToSceneDocument, sceneDocumentToCanonicalMovie } from "../Movie/CanonicalMovieExport.js";
import { EditorSceneStore } from "../Movie/EditorSceneStore.js";

/** Movie JSON import/export + scene persistence panel. */
export class MovieJsonPanel extends BasePanel {
	/**
	 * @param {object} ohrEmitter Existing editor event emitter.
	 * @param {object} olamObjectManager Existing scene-object service.
	 * @param {object} netzachTimelineManager Existing animation/timeline service.
	 * @param {object} yesodSceneManager Existing scene service (background + scene root).
	 */
	constructor(ohrEmitter, olamObjectManager, netzachTimelineManager, yesodSceneManager) {
		super("movie-json-panel", "Movie JSON", ohrEmitter, { initialCollapsed: true });
		this.objectManager = olamObjectManager;
		this.timelineManager = netzachTimelineManager;
		this.sceneManager = yesodSceneManager;
		this.store = new EditorSceneStore();
		this.autosaveTimer = null;
		this.restoring = false;
		this.buildPanel();
		this.bindAutosave();
		this.restoreSavedScene();
	}

	/** Reveal the textarea, action row, file input, and status line. */
	buildPanel() {
		this.textarea = HTML.create({
			tag: "textarea",
			class: "movie-json-text",
			attrs: {
				rows: "10",
				spellcheck: "false",
				autocomplete: "off",
				"aria-label": "Scene or canonical movie JSON",
				placeholder: "Export fills this with JSON. Paste a scene document or a canonical awtsmoos-movie-v1 movie here and choose Import."
			},
			style: { width: "100%", boxSizing: "border-box" }
		});
		this.fileInput = HTML.create({
			tag: "input",
			attrs: { type: "file", accept: ".json,application/json", "aria-label": "Open a JSON file" },
			style: { display: "none" },
			on: { change: ohrEvent => this.importFromFile(ohrEvent) }
		});
		const kelimActions = [
			["Export scene JSON", () => this.exportSceneJson()],
			["Export canonical movie", () => this.exportCanonicalMovie()],
			["Import", () => this.importFromText()],
			["Open file…", () => this.fileInput.click()],
			["Download", () => this.downloadText()],
			["Copy", () => this.copyText()],
			["Clear saved scene", () => this.clearSaved()]
		];
		const kliActionRow = HTML.create({
			tag: "div",
			class: "movie-json-actions",
			style: { display: "flex", flexWrap: "wrap", gap: "6px", margin: "8px 0" },
			children: kelimActions.map(([shemLabel, shaliachAction]) => ({
				tag: "button",
				text: shemLabel,
				attrs: { type: "button" },
				on: { click: shaliachAction }
			}))
		});
		this.statusNode = HTML.create({
			tag: "p",
			class: "movie-json-status",
			attrs: { role: "status" },
			text: "Scene JSON, canonical movie JSON, autosave, and restore live here."
		});
		this.setContent([this.textarea, kliActionRow, this.fileInput, this.statusNode]);
	}

	/** Autosave the scene document shortly after any scene or timeline change. */
	bindAutosave() {
		const shaliachSchedule = () => {
			if (this.restoring) {
				return;
			}
			clearTimeout(this.autosaveTimer);
			this.autosaveTimer = setTimeout(() => {
				const ohrDocument = this.currentDocument();
				if (ohrDocument && this.store.save(ohrDocument)) {
					this.setStatus(`Autosaved scene (${ohrDocument.objects.length} top-level objects).`);
				}
			}, 800);
		};
		this.eventEmitter.on("sceneGraphChanged", shaliachSchedule);
		this.eventEmitter.on("timelineDataChanged", shaliachSchedule);
	}

	/** Restore the autosaved scene when the stage starts empty. */
	restoreSavedScene() {
		const ohrStored = this.store.load();
		if (!ohrStored || this.objectManager.getAllObjects().length > 0) {
			return;
		}
		try {
			const ohrDocument = parseSceneDocument(ohrStored);
			this.restoring = true;
			const ohrReport = applySceneDocument(ohrDocument, this.managers());
			this.setStatus(`Restored autosaved scene "${ohrDocument.name}": ${ohrReport.created} objects, ${ohrReport.keyframes} keyframes.`);
		} catch (error) {
			this.setStatus(`Saved scene could not be restored: ${error.message}`);
		} finally {
			this.restoring = false;
		}
	}

	/** Fill the textarea with the current Editor scene document and autosave it. */
	exportSceneJson() {
		const ohrDocument = this.currentDocument();
		if (!ohrDocument) {
			return;
		}
		this.textarea.value = JSON.stringify(ohrDocument, null, 2);
		this.store.save(ohrDocument);
		const misparKeyframes = ohrDocument.layers.reduce(
			(misparTotal, kliLayer) => misparTotal + kliLayer.tracks.reduce(
				(misparTrackTotal, kliTrack) => misparTrackTotal + kliTrack.keyframes.length, 0),
			0
		);
		this.setStatus(`Scene exported: ${ohrDocument.objects.length} top-level objects, ${misparKeyframes} keyframes. The same document is autosaved locally.`);
	}

	/** Fill the textarea with the canonical awtsmoos-movie-v1 form of the scene. */
	exportCanonicalMovie() {
		const ohrDocument = this.currentDocument();
		if (!ohrDocument) {
			return;
		}
		const { movie, report } = sceneDocumentToCanonicalMovie(ohrDocument);
		this.textarea.value = JSON.stringify(movie, null, 2);
		const shemSidecar = report.sidecarTracks
			? ` ${report.sidecarTracks} track(s) ride in content.editorTracks (no canonical transform channel).`
			: "";
		this.setStatus(`Canonical movie exported: ${report.objects} model3d layers, ${report.layersWithTracks} animated.${shemSidecar} Playback preview happens in Awtsmoos Studio / the Animator dock — this panel exports for the studio.`);
	}

	/** Import whatever JSON the textarea currently holds (scene document or canonical movie). */
	importFromText() {
		const shemText = this.textarea.value.trim();
		if (!shemText) {
			this.setStatus("Nothing to import: the text area is empty.");
			return;
		}
		let ohrParsed;
		try {
			ohrParsed = JSON.parse(shemText);
		} catch (error) {
			this.setStatus(`JSON parse error: ${error.message}`);
			return;
		}
		this.importParsed(ohrParsed);
	}

	/** Read a chosen JSON file and import it through the same path as pasted text. */
	async importFromFile(ohrEvent) {
		const kliFile = ohrEvent.target.files?.[0];
		ohrEvent.target.value = "";
		if (!kliFile) {
			return;
		}
		try {
			const shemText = await kliFile.text();
			this.textarea.value = shemText;
			this.importFromText();
		} catch (error) {
			this.setStatus(`Could not read that file: ${error.message}`);
		}
	}

	/** Route a parsed document to the scene importer or the canonical-movie translator. */
	importParsed(ohrParsed) {
		try {
			if (ohrParsed?.protocol === "awtsmoos-movie-v1") {
				const { document: ohrDocument, report } = canonicalMovieToSceneDocument(ohrParsed);
				const ohrApplied = applySceneDocument(ohrDocument, this.managers());
				const shemSkipped = report.skippedLayers
					? ` Skipped ${report.skippedLayers} non-model3d layer(s): ${report.skippedKinds.join(", ")}.`
					: "";
				this.setStatus(`Canonical movie imported: ${ohrApplied.created} objects, ${ohrApplied.keyframes} keyframes.${shemSkipped}`);
				return;
			}
			const ohrDocument = parseSceneDocument(ohrParsed);
			const ohrReport = applySceneDocument(ohrDocument, this.managers());
			const shemPlaceholders = ohrReport.placeholders
				? ` ${ohrReport.placeholders} object(s) use placeholder geometry (recorded geometry could not be rebuilt).`
				: "";
			this.setStatus(`Scene imported: ${ohrReport.created} objects, ${ohrReport.keyframes} keyframes.${shemPlaceholders}`);
		} catch (error) {
			this.setStatus(`Import failed: ${error.message}`);
		}
	}

	/** Download the textarea contents as a JSON file. */
	downloadText() {
		const shemText = this.textarea.value;
		if (!shemText.trim()) {
			this.setStatus("Nothing to download yet: export first.");
			return;
		}
		let shemFileName = "scene.json";
		try {
			const ohrParsed = JSON.parse(shemText);
			shemFileName = ohrParsed?.protocol === "awtsmoos-movie-v1" ? "movie.json" : "scene.json";
		} catch {
			/* download the raw text under the scene name */
		}
		const kliBlob = new Blob([shemText], { type: "application/json" });
		const kliLink = document.createElement("a");
		kliLink.href = URL.createObjectURL(kliBlob);
		kliLink.download = shemFileName;
		kliLink.click();
		URL.revokeObjectURL(kliLink.href);
		this.setStatus(`Downloaded ${shemFileName}.`);
	}

	/** Copy the textarea contents to the clipboard. */
	async copyText() {
		if (!this.textarea.value.trim()) {
			this.setStatus("Nothing to copy yet: export first.");
			return;
		}
		try {
			await navigator.clipboard.writeText(this.textarea.value);
			this.setStatus("JSON copied to the clipboard.");
		} catch {
			this.textarea.select();
			this.setStatus("Clipboard was unavailable; the JSON is selected so it can be copied manually.");
		}
	}

	/** Remove the autosaved scene document. */
	clearSaved() {
		this.store.clear();
		this.setStatus("Saved scene cleared. The live scene is unchanged.");
	}

	/** @returns {object|null} Current scene document, with failures stated in the panel. */
	currentDocument() {
		try {
			return buildSceneDocument({ ...this.managers(), name: this.sceneName() });
		} catch (error) {
			this.setStatus(`Could not read the current scene: ${error.message}`);
			return null;
		}
	}

	/** @returns {string} A stable scene name: the stored document's name, or the default. */
	sceneName() {
		return this.store.load()?.name || "Untitled Scene";
	}

	/** @returns {object} Manager bundle expected by the scene IO seam. */
	managers() {
		return {
			objectManager: this.objectManager,
			timelineManager: this.timelineManager,
			sceneManager: this.sceneManager,
			eventEmitter: this.eventEmitter
		};
	}

	/** @param {string} shemMessage New status text. */
	setStatus(shemMessage) {
		this.statusNode.textContent = shemMessage;
	}
}
