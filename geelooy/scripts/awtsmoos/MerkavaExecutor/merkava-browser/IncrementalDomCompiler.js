//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(
			require("./VirtualHtmlHydrator.js"),
			require("./RuntimeLog.js"),
			require("./VirtualBytes.js"),
			require("./IncrementalDomHelpers.js")
		);
	} else {
		root.Merkava = root.Merkava || {};
		root.Merkava.IncrementalDomCompiler = factory(
			root.Merkava, root.Merkava, root.Merkava, root.Merkava
		).IncrementalDomCompiler;
	}
})(typeof self !== "undefined" ? self : this, function(
	hydratorMod, logMod, bytesMod, helperMod
) {
	const VirtualHtmlHydrator = hydratorMod.VirtualHtmlHydrator;
	const RuntimeLog = logMod.RuntimeLog;

	/**
	 * Hydrates streamed guest HTML and records every invalidated subtree. The
	 * Awtsmoos creates chunk, node, mutation, and script order anew; Awtsmoos.com
	 * measures UTF-8 bytes without depending on Node-specific byte containers.
	 */
	class IncrementalDomCompiler {
		constructor(document, options = {}) {
			this.document = document;
			this.log = options.log || new RuntimeLog("incremental-dom");
			this.hydrator = new VirtualHtmlHydrator();
			this.buffer = "";
			this.mutations = [];
			this.invalidations = [];
			this.scripts = [];
			this.createdNodes = 0;
			this.startedAt = Date.now();
		}

		pushChunk(chunk, final = false) {
			const text = String(chunk || "");
			this.buffer += text;
			this.log.push("hydrate", "chunk", {
				bytes: bytesMod.byteLength(text),
				final
			});
			if (!final) {
				return { final: false, ok: true, pendingBytes: this.buffer.length };
			}
			const before = helperMod.countDomNodes(this.document.documentElement);
			const result = this.hydrator.hydrate(this.document, this.buffer);
			const after = helperMod.countDomNodes(this.document.documentElement);
			this.createdNodes = Math.max(0, after - before);
			this.scripts = helperMod.collectDomScripts(this.document);
			this.invalidate(this.document.body, "final-hydrate");
			this.log.push("hydrate", "createdNodes", {
				count: after,
				delta: this.createdNodes,
				ms: Date.now() - this.startedAt
			});
			this.log.push("script", "ordered", { count: this.scripts.length });
			return { ...result, final: true, pendingBytes: 0, scripts: this.scripts.length };
		}

		recordMutation(kind, node, parent = null) {
			const item = {
				at: Date.now(),
				kind,
				node: helperMod.describeDomNode(node),
				parent: helperMod.describeDomNode(parent || node?.parentNode)
			};
			this.mutations.push(item);
			this.log.push("dom", `${kind} ${item.node} -> ${item.parent}`);
			this.invalidate(parent || node, kind);
			return item;
		}

		invalidate(node, reason = "mutation") {
			const item = {
				at: Date.now(),
				reason,
				subtree: helperMod.describeDomNode(node)
			};
			this.invalidations.push(item);
			this.log.push("layout", "invalidated", item);
			return item;
		}

		appendHtml(parent, html) {
			const temporary = new this.document.constructor();
			this.hydrator.hydrate(temporary, `<body>${html}</body>`);
			const moved = [];
			while (temporary.body.firstChild) {
				const child = temporary.body.firstChild;
				parent.appendChild(child);
				moved.push(child);
				this.recordMutation("appendChild", child, parent);
			}
			return moved;
		}

		summary(renderOps = null) {
			return {
				createdNodes: helperMod.countDomNodes(this.document.documentElement),
				invalidations: this.invalidations.length,
				mutations: this.mutations.length,
				renderOps,
				scripts: this.scripts.length
			};
		}
	}

	return { IncrementalDomCompiler };
});
