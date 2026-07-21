// B"H

import { createDataBlockArtifact } from "../../artifact/createDataBlockArtifact.js";
import { createTypedGraph } from "./createTypedGraph.js";

/** Embeds a typed graph inside the existing immutable `node_graph` datablock vessel. */
export function createTypedGraphDataBlock(graphInput, options = {}) {
	const graph = graphInput?.graphSchema === "awtsmoos.typed-graph"
		? graphInput
		: createTypedGraph(graphInput);
	return createDataBlockArtifact({
		id: options.id ?? graph.name,
		kind: "node_graph",
		name: options.name ?? graph.name,
		data: { typedGraph: graph },
		metadata: {
			...(options.metadata ?? {}),
			typedGraphHash: graph.contentHash,
			typedGraphVersion: graph.version
		}
	});
}
