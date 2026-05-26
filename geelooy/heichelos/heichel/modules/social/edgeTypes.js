//B"H
/**
 * Canonical social graph edge vocabulary.
 * Keeps UI, moderation, embeddings, feeds and AI reasoning aligned.
 */
export const EDGE_TYPES = Object.freeze({
  SUPPORTS: 'supports',
  CONTRADICTS: 'contradicts',
  EXTENDS: 'extends',
  QUESTIONS: 'questions',
  SUMMARIZES: 'summarizes',
  CITES: 'cites',
  RESPONDS_TO: 'responds_to',
  INSPIRED_BY: 'inspired_by',
  DUPLICATES: 'duplicates',
  FORKS: 'forks',
  QUOTES: 'quotes',
  CLARIFIES: 'clarifies'
});

export function isEdgeType(value) {
  return Object.values(EDGE_TYPES).includes(value);
}
