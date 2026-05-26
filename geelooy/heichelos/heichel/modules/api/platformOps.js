//B"H
/**
 * @module PlatformOpsAPI
 * @description
 * Thin browser vessels for social-platform operations that already exist on
 * the server: moderation, migrations, federation, media, relationships,
 * analytics, jobs, and permission compilation.
 */
import { AwtsmoosRequest, BASE_API_URL } from './base.js';

const api = path => `${BASE_API_URL}${path.replace(/^\/+/, '')}`;
const body = value => new URLSearchParams(value);
const json = value => JSON.stringify(value ?? {});

export const platformOps = {
  moderationQueues: () => AwtsmoosRequest.fetch(api('mod/queues')),
  moderationReport: ({ target, actor, reason }) => AwtsmoosRequest.post(api('mod/reports'), body({ target: json(target), actor, reason })),
  moderationAction: ({ target, actor, reason }) => AwtsmoosRequest.post(api('mod/actions'), body({ target: json(target), actor, reason })),
  moderationEscalate: ({ target, actor, reason }) => AwtsmoosRequest.post(api('mod/escalations'), body({ target: json(target), actor, reason })),
  migrationDryRun: ({ heichelId, seriesId = 'root' }) => AwtsmoosRequest.fetch(api(`migrations/posts/v2/dryRun?${new URLSearchParams({ heichelId, seriesId })}`)),
  migrationRun: ({ heichelId, seriesId = 'root', limit = 100 }) => AwtsmoosRequest.post(api('migrations/posts/v2/run'), body({ heichelId, seriesId, limit })),
  federationImport: ({ remoteHeichel, signedPayload }) => AwtsmoosRequest.post(api('federation/import'), body({ remoteHeichel, signedPayload: json(signedPayload) })),
  mediaRegister: ({ mediaId, aliasId, metadata = {} }) => AwtsmoosRequest.post(api('media/register'), body({ mediaId, aliasId, metadata: json(metadata) })),
  mediaAttach: ({ mediaId, entity = {} }) => AwtsmoosRequest.post(api('media/attach'), body({ mediaId, entity: json(entity) })),
  listRelationships: ({ aliasId, type = '' }) => AwtsmoosRequest.fetch(api(`relationships/${encodeURIComponent(aliasId)}?${new URLSearchParams({ type })}`)),
  setRelationship: ({ aliasId, type, target }) => AwtsmoosRequest.post(api(`relationships/${encodeURIComponent(aliasId)}/${encodeURIComponent(type)}/${encodeURIComponent(target)}`), body({})),
  recordMetric: ({ name, value = 1, tags = {} }) => AwtsmoosRequest.post(api('analytics/metric'), body({ name, value, tags: json(tags) })),
  enqueueJob: ({ type, payload = {}, runAt = Date.now() }) => AwtsmoosRequest.post(api('jobs/enqueue'), body({ type, payload: json(payload), runAt })),
  runJobs: ({ limit = 10 } = {}) => AwtsmoosRequest.post(api('jobs/run'), body({ limit })),
  compilePermissions: ({ subject, resource, rules = [] }) => AwtsmoosRequest.post(api('permissions/compile'), body({ subject, resource, rules: json(rules) }))
};
