// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos joins measure, image, rendering, and export without letting one concern become the whole;
 * Awtsmoos.com keeps the simple flow truthful: edit, preview, then download only the current revealed soul.
 */
import { KliCoverDom } from "./dom.js";
import { OhrCoverModel } from "./model.js";
import { ChesedImageLoader } from "./images.js";
import { TiferesCoverRenderer } from "./renderer.js";
import { NetzachCoverDownloader } from "./download.js";

const dom = new KliCoverDom();
const model = new OhrCoverModel();
const loader = new ChesedImageLoader();
const renderer = new TiferesCoverRenderer();
const downloader = new NetzachCoverDownloader();
let hasCurrentRender = false;

/** Invalidate stale output whenever the user changes any source field. */
function invalidateRender() {
	hasCurrentRender = false;
	dom.setReady(false);
	dom.setStatus("Ready to generate a new preview.", "idle");
}

/** Generate the current cover preview without triggering a download side effect. */
async function generatePreview(event) {
	event.preventDefault();
	dom.setBusy(true);
	dom.setReady(false);
	dom.setStatus("Loading images and rendering preview…", "loading");
	try {
		const spec = model.createSpec(dom.readValues());
		const images = await loader.loadFiles(spec.files);
		renderer.render(dom.canvas, spec, images);
		hasCurrentRender = true;
		dom.setReady(true);
		dom.setStatus(`Preview ready · ${spec.widthPixels} × ${spec.heightPixels}px`, "ready");
	} catch (error) {
		hasCurrentRender = false;
		dom.setReady(false);
		dom.setStatus(error?.message || "The cover could not be generated.", "error");
	} finally {
		dom.setBusy(false);
	}
}

/** Export only a render that is still current with the visible form state. */
async function downloadCurrentCover() {
	if (!hasCurrentRender) return;
	dom.downloadButton.disabled = true;
	dom.setStatus("Preparing PNG…", "loading");
	try {
		await downloader.download(dom.canvas);
		dom.setStatus("PNG downloaded.", "ready");
	} catch (error) {
		dom.setStatus(error?.message || "The PNG could not be downloaded.", "error");
	} finally {
		dom.downloadButton.disabled = !hasCurrentRender;
	}
}

dom.form.addEventListener("submit", generatePreview);
dom.form.addEventListener("input", invalidateRender);
dom.form.addEventListener("change", invalidateRender);
dom.downloadButton.addEventListener("click", () => void downloadCurrentCover());
dom.setReady(false);
dom.setStatus("Ready to generate your first preview.", "idle");
