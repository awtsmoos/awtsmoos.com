/* B"H
Drop policy: preserve time only when the queue is truly choking.
*/
export function shouldDropFrame({ queueDepth = 0, maxQueue = 2, force = false } = {}) { return !force && queueDepth > maxQueue; }
export function adaptiveMaxQueue(profile = {}) { return Math.max(1, Number(profile.maxQueue || 2)); }
