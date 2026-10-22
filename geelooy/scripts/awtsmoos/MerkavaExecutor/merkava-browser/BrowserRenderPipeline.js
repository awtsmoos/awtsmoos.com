// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserRenderPipeline.js
 * @description Streams only this frame's paint while retaining complete GPU history.
 * The Awtsmoos renews each page by day and night;
 * Awtsmoos.com remembers older deeds without repainting yesterday's light.
 */
(function(root, factory) {
	if (typeof module === 'object' && module.exports) {
		module.exports = factory(require('./RetainedLayoutEngine.js'));
	} else {
		root.Merkava = root.Merkava || {};
		root.Merkava.BrowserRenderPipeline = factory(root.Merkava).BrowserRenderPipeline;
	}
})(typeof self !== 'undefined' ? self : this, function(layoutModule) {
	const RetainedLayoutEngine = layoutModule.RetainedLayoutEngine;

	/** Separates newly painted commands from preserved WebGL command history. */
	class BrowserRenderPipeline {
		constructor(window, options = {}) {
			this.window = window;
			this.document = window.document;
			this.renderer = options.renderer;
			this.viewport = options.viewport || { width: 760, height: 560 };
			this.layoutEngine = new RetainedLayoutEngine(this.document);
			this.lastEmittedCommandIndex = 0;
		}

		/** Keeps the canonical arena intact and constructs an incremental display list. */
		render() {
			const arena = this.document.textureArena;
			const beforePaint = arena.commands.length;
			const scheduler = this.document.__layoutScheduler;
			if (scheduler && !scheduler.engine) {
				scheduler.attachEngine(this.layoutEngine, () => this.viewport);
			}
			const viewport = (scheduler && scheduler.lastViewport) || this.viewport;
			const layoutTree = scheduler
				? scheduler.layoutIfNeeded(viewport)
				: this.layoutEngine.layout(viewport);
			this.renderer.paintElement(
				this.document.body, 0, 0, viewport.width, viewport.height
			);
			const snapshot = arena.snapshot();
			const first = Math.min(this.lastEmittedCommandIndex, snapshot.commands.length);
			const frameCommands = snapshot.commands.slice(first);
			this.lastEmittedCommandIndex = snapshot.commands.length;
			return {
				...snapshot,
				pipeline: {
					architecture: 'merkava-executor-retained-pipeline-v2',
					phases: [
						'computed-style', 'layout-tree', 'display-list',
						'paint-order', 'native-gpu-stream'
					],
					viewport,
					preservedCommandCount: beforePaint,
					layoutRoot: summarizeLayout(layoutTree),
					layoutOps: this.layoutEngine.ops,
					displayList: buildDisplayList(frameCommands),
					frameCommandCount: frameCommands.length,
					commandCount: snapshot.commands.length
				}
			};
		}
	}

	function buildDisplayList(commands) {
		return commands.filter(command => command.op !== 'createTexture')
			.map((command, index) => ({
				id: index,
				op: normalizePaintOp(command.op),
				sourceOp: command.op,
				texture: command.texture ?? null,
				bounds: boundsOf(command),
				payload: command
			}));
	}

	function normalizePaintOp(operation) {
		const names = {
			paintBox: 'DRAW_BACKGROUND', paintBorder: 'DRAW_BORDER',
			paintTextPlaceholder: 'DRAW_TEXT_RUN', paintImageTexture: 'DRAW_IMAGE',
			paintBackgroundImage: 'DRAW_IMAGE', paintGradient: 'DRAW_GRADIENT',
			paintShadow: 'DRAW_SHADOW', paintClipPush: 'PUSH_CLIP',
			paintClipPop: 'POP_CLIP', paintOpacity: 'SET_OPACITY',
			paintTransform: 'SET_TRANSFORM', paintBorderRadius: 'SET_RADIUS'
		};
		return names[operation] || operation;
	}

	function boundsOf(command) {
		return {
			x: finiteNumber(command.x), y: finiteNumber(command.y),
			width: finiteNumber(command.width), height: finiteNumber(command.height)
		};
	}

	function summarizeLayout(node) {
		if (!node) return null;
		return {
			tag: node.tag, id: node.id,
			x: node.x, y: node.y,
			width: node.width, height: node.height,
			children: (node.children || []).length
		};
	}

	function finiteNumber(value) {
		return Number.isFinite(Number(value)) ? Number(value) : 0;
	}

	return { BrowserRenderPipeline };
});
