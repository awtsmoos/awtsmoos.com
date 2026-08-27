// B"H
/** Chapter 596: The inspector gathers card, relationships, timeline, health, and metrics. */
const { objectCard } = require('./cards.js');
const { objectTimeline } = require('./timeline.js');
const { objectRelationships } = require('./relationships.js');
const { objectHealth } = require('./health.js');
const { objectMetrics } = require('./metrics.js');
function inspectObject({ $i, object }) {
  const timeline = objectTimeline({ $i, object }).success || [];
  const relationships = objectRelationships({ $i, object }).success || {};
  const health = objectHealth({ object, timeline });
  const metrics = objectMetrics({ object, timeline, relationships });
  return { success: { card: objectCard({ ...object, health }), object, relationships, timeline, health, metrics } };
}
module.exports = { inspectObject };
