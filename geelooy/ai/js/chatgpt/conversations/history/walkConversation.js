//B"H

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
  return ordered.reverse();
}
