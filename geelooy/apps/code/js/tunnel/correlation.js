// B"H
/**
 * Chapter 103: The request wore a crown no mission could remove.
 * Identity is copied first and restored last, while continuation walks beside it.
 */
const KEYS = Object.freeze([
  'requestId', 'id', 'action', 'actualAction', 'jobId',
  'correlationId', 'clientRequestId', 'controlRequestId',
  'vessel', 'workspaceId', 'path', 'p'
]);

export function captureIdentity(payload = {}) {
  const action = payload.action || payload.actualAction || 'list';
  const got = { action, actualAction: action };
  for (const key of KEYS) if (payload[key] !== undefined) got[key] = payload[key];
  return got;
}

export function preserveIdentity(payload = {}, result = {}) {
  const id = captureIdentity(payload);
  return {
    ...result,
    ...id,
    action: id.action,
    actualAction: id.actualAction || id.action,
    mission: result.mission || payload.mission || payload.missionStatus || null
  };
}
