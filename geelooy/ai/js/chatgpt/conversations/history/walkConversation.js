//B"H

/**
 * Chapter 113: The History Chain Walked By Its Bones, Not By Its Echoes.
 *
 * ChatGPT history is a graph. The visible conversation is the ancestry path of
 * `current_node`; any attempt to sort that graph by random metadata can scramble
 * tool sparks, thought capsules, and assistant text. This walker follows parent
 * links only, then stamps every node with an irreversible ordinal so later
 * folding and event rendering can preserve the exact ancestral order forever.
 *
 * @param {object} convo Raw ChatGPT conversation detail.
 * @returns {object[]} Ordered ancestry nodes, root to current node.
 */
export function walkConversationNodes(convo = {}) {
  const mapping = convo.mapping || {};
  const ordered = [];
  const seen = new Set();
  let node = mapping[convo.current_node];
  while (node && !seen.has(node.id)) {
    seen.add(node.id);
    ordered.push(node);
    node = mapping[node.parent];
  }
  return ordered.reverse().map((item, index) => stampHistoryOrder(item, index));
}

function stampHistoryOrder(node, index) {
  const msg = node?.message || node;
  try {
    Object.defineProperty(node, "__awtsmoosHistoryIndex", { value: index, configurable: true });
    if (msg && typeof msg === "object") Object.defineProperty(msg, "__awtsmoosHistoryIndex", { value: index, configurable: true });
  } catch {
    node.__awtsmoosHistoryIndex = index;
    if (msg && typeof msg === "object") msg.__awtsmoosHistoryIndex = index;
  }
  return node;
}
