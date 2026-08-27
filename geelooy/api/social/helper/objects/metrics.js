// B"H
/** Chapter 595: Object metrics compress relationships, activity, and tags. */
function objectMetrics({ object, timeline = [], relationships = {} }) {
  return { events: timeline.length, tags: (object.tags || []).length, explicitRelationships: (object.relationships || []).length, inboundRelationships: (relationships.inbound || []).length, score: timeline.length + (object.tags || []).length + ((relationships.inbound || []).length * 2) };
}
module.exports = { objectMetrics };
