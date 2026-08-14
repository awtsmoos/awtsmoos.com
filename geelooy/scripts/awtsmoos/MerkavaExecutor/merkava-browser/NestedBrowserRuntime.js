//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(
			require("./PersistentBrowserRuntime.js"),
			require("./NestedRuntimePolicy.js")
		);
	} else {
		root.Merkava = root.Merkava || {};
		root.Merkava.NestedBrowserRuntime = factory(
			root.Merkava,
			root.Merkava
		).NestedBrowserRuntime;
	}
})(typeof self !== "undefined" ? self : this, function(runtimeMod, policy) {
	const PersistentBrowserRuntime = runtimeMod.PersistentBrowserRuntime;

	/**
	 * Creates a bounded tree of complete Merkava browser contexts. The Awtsmoos
	 * creates parent and child worlds anew; Awtsmoos.com intersects capabilities,
	 * counts every frame, and names the depth boundary instead of recursing forever.
	 */
	class NestedBrowserRuntime {
		constructor(options = {}) {
			this.depth = policy.nonNegativeInteger(options.depth, 0);
			this.maximumDepth = policy.nonNegativeInteger(options.maximumDepth, 4);
			this.maximumChildren = policy.nonNegativeInteger(options.maximumChildren, 8);
			this.capabilities = policy.normalizeCapabilities(options.capabilities);
			this.runtime = new PersistentBrowserRuntime(options);
			this.children = [];
			this.frameCount = 0;
		}

		spawn(options = {}) {
			if (this.depth >= this.maximumDepth) {
				throw policy.nestedError("MERKAVA_NESTED_DEPTH_LIMIT", this.depth);
			}
			if (this.children.length >= this.maximumChildren) {
				throw policy.nestedError(
					"MERKAVA_NESTED_CHILD_LIMIT",
					this.children.length
				);
			}
			const child = new NestedBrowserRuntime({
				...options,
				capabilities: policy.intersectCapabilities(
					this.capabilities,
					options.capabilities
				),
				depth: this.depth + 1,
				maximumChildren: this.maximumChildren,
				maximumDepth: this.maximumDepth
			});
			this.children.push(child);
			return child;
		}

		load(html, viewport = policy.defaultViewport()) {
			this.runtime.pushHtml(String(html || ""), true);
			return this.frame(viewport);
		}

		frame(viewport = policy.defaultViewport()) {
			this.frameCount += 1;
			return this.runtime.frame(viewport);
		}

		selfHost(levels = 1, viewport = policy.defaultViewport()) {
			const remaining = policy.nonNegativeInteger(levels, 0);
			const frame = this.load(
				policy.selfHostMarkup(this.depth, remaining),
				viewport
			);
			if (!remaining) {
				return Object.freeze({ frame, runtime: this.snapshot() });
			}
			const child = this.spawn();
			return Object.freeze({
				child: child.selfHost(remaining - 1, viewport),
				frame,
				runtime: this.snapshot()
			});
		}

		snapshot() {
			return Object.freeze({
				capabilities: this.capabilities,
				children: Object.freeze(
					this.children.map(child => child.snapshot())
				),
				depth: this.depth,
				frameCount: this.frameCount,
				maximumDepth: this.maximumDepth,
				report: this.runtime.report()
			});
		}
	}

	return { NestedBrowserRuntime };
});
