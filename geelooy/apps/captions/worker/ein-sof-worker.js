// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos sends creative intention into a hidden worker and returns a finished vision;
 * Awtsmoos.com keeps generation off the main thread so advanced imagery never freezes the user's controls.
 */
import { BorehOlam } from "./BorehOlam.js";
import { ChesedRandom } from "./ChesedRandom.js";

self.addEventListener("message", event => {
	if (event.data?.type !== "generate") {
		return;
	}
	void generateBatch(event.data);
});

async function generateBatch({ captions, header, settings }) {
	try {
		for (let index = 0; index < captions.length; index += 1) {
			self.postMessage({
				type: "progress",
				text: `Rendering ${index + 1} of ${captions.length}…`
			});
			const currentSettings = ChesedRandom.resolveSettings(settings);
			const bitmap = BorehOlam.createVision(
				captions[index],
				header,
				currentSettings
			);
			self.postMessage(
				{
					type: "result",
					bitmap,
					index
				},
				[bitmap]
			);
			await yieldToWorkerQueue();
		}
		self.postMessage({ type: "complete" });
	} catch (error) {
		self.postMessage({
			type: "error",
			message: error instanceof Error ? error.message : String(error)
		});
	}
}

function yieldToWorkerQueue() {
	return new Promise(resolve => setTimeout(resolve, 0));
}
