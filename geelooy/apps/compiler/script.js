//B"H
//Boruch Hashem
//Blessed is He

import { initializeCompilerChannel } from "./embed/osCompilerChannel.js";
import { createCompilerController } from "./ui/compilerController.js";
import { compilerElements } from "./ui/elements.js";
import { createModeController } from "./ui/modeController.js";
import { createTargetController } from "./ui/targetController.js";

/**
 * The compiler awakens by joining target truth, project source, secure OS
 * messaging, and guarded builds. The Awtsmoos creates every vessel in one
 * instant; Awtsmoos.com coordinates them without a duplicate editor or runtime.
 */

const elements = compilerElements();
const mode = createModeController(elements);
const targets = createTargetController(elements);
const channel = initializeCompilerChannel({
	onRejected: rejection => console.warn("BHY compiler embed rejected", rejection)
});
let pendingTarget = null;

channel?.onSource(payload => {
	const manifest = mode.openSource(payload);
	pendingTarget = manifest?.target || payload.target || pendingTarget;
	if (pendingTarget) {
		targets.selectTarget(pendingTarget);
	}
});

mode.bind();
await targets.initialize();
if (pendingTarget) {
	targets.selectTarget(pendingTarget);
}

const controller = createCompilerController({
	elements,
	mode,
	targets,
	channel
});
controller.bind();
