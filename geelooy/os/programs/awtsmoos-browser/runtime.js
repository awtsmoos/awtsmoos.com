//B"H
//Boruch Hashem
//Blessed is He

import { paintMerkavaFrame } from "./canvasRenderer.js";
import { loadMerkavaBrowserRuntime } from "./merkavaLoader.js";

/**
 * Drives one visible nested Merkava browser without iframe or host evaluation. The
 * Awtsmoos creates markup, virtual document, layout, paint ledger, and host replay
 * anew; Awtsmoos.com reports every unsupported JavaScript road explicitly.
 */
export async function createBrowserController(surface, options = {}) {
	const Merkava = await loadMerkavaBrowserRuntime();
	let runtime = createRuntime(Merkava, options);

	function render(markup = surface.editor.value) {
		const viewport = viewportFor(surface);
		const frame = runtime.load(markup, viewport);
		const paint = paintMerkavaFrame(frame, surface);
		surface.metrics.textContent = JSON.stringify(report(runtime, paint), null, 2);
		return { frame, paint };
	}

	function selfHost(depth = Number(surface.depth.value || 0)) {
		runtime = createRuntime(Merkava, { ...options, maximumDepth: depth });
		const result = runtime.selfHost(depth, viewportFor(surface));
		const paint = paintMerkavaFrame(result.frame, surface);
		surface.metrics.textContent = JSON.stringify({
			...report(runtime, paint),
			selfHostDepth: depth,
			tree: runtime.snapshot()
		}, null, 2);
		return result;
	}

	function resize() {
		return render(surface.editor.value);
	}

	return Object.freeze({ render, resize, selfHost });
}

export function defaultGuestMarkup() {
	return `<main style="background:#07111f;color:#e8ffff;padding:28px">
<h1 style="color:#7dd3fc">Merkava Fusion DOM</h1>
<p>Guest HTML and CSS are parsed, laid out, and painted without an iframe.</p>
<section style="background:#10283c;border:2px solid #38bdf8;padding:18px">
<h2>Nested browser vessel</h2>
<p>Use Self-host to create bounded recursive browser contexts.</p>
<canvas width="420" height="150"></canvas>
</section>
</main>`;
}

function createRuntime(Merkava, options) {
	return new Merkava.NestedBrowserRuntime({
		capabilities: {
			filesystem: false,
			network: false,
			storage: true,
			webgl: true,
			workers: true
		},
		maximumDepth: Number(options.maximumDepth || 4),
		seed: Number(options.seed || 0x41575453)
	});
}

function viewportFor(surface) {
	return {
		height: Math.max(240, surface.stage.clientHeight || 560),
		width: Math.max(320, surface.stage.clientWidth || 760)
	};
}

function report(runtime, paint) {
	const snapshot = runtime.snapshot();
	return Object.freeze({
		capabilities: snapshot.capabilities,
		children: snapshot.children.length,
		depth: snapshot.depth,
		frames: snapshot.frameCount,
		javascript: "merkava-bytecode-not-yet-connected",
		paint
	});
}
