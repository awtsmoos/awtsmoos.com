//B"H
export function rankFeedItems(items = [], weights = {}) {
  const w = { semantic: 1, trust: 0.7, recency: 0.2, ...weights };
  return [...(Array.isArray(items) ? items : [])]
    .map(item => ({ ...item, score: scoreFeedItem(item, w) }))
    .sort((a, b) => b.score - a.score);
}

export function scoreFeedItem(item = {}, weights = {}) {
  return Number(item.semanticScore || 0) * weights.semantic
    + Number(item.trustScore || 0) * weights.trust
    + Number(item.recencyScore || 0) * weights.recency;
}
