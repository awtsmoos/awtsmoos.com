// B"H
/**
 * @module ProfileGraphPreview
 * @description Chapter 442: The social graph is rendered as visible nodes and
 * edges before it becomes a full celestial canvas.
 */

import { el, clean, emptyCard } from "../dom.js";

export function graphPreview(graph = {}) {
    const nodes = graph.nodes || [];
    const edges = graph.edges || [];
    const wrap = el("section", { className: "profile-graph-preview" }, [
        el("header", { html: `<h2>Social Graph</h2><p>${nodes.length} nodes · ${edges.length} edges</p>` })
    ]);
    if (!nodes.length) return el("section", { className: "profile-graph-preview" }, [emptyCard("No graph nodes yet.")]);
    const cloud = el("div", { className: "profile-graph-cloud" });
    nodes.slice(0, 48).forEach(node => cloud.appendChild(el("span", { className: `graph-node ${clean(node.type)}`, text: clean(node.label || node.id) })));
    const edgeList = el("div", { className: "profile-graph-edges" });
    edges.slice(0, 30).forEach(edge => edgeList.appendChild(el("p", { text: `${edge.from} → ${edge.to} · ${edge.kind}` })));
    wrap.append(cloud, edgeList);
    return wrap;
}
