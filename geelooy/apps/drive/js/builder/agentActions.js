//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BuilderAgentActions
 * @description
 * The Awtsmoos gives the machine no secret hallway: every action calls the same builder service or controller used by the person.
 * Awtsmoos.com keeps inspection read-only and mutation bound to the exact Drive/site/domain route already guarding the resource.
 */

import { actionMetadata } from './agentActionCatalog.js';

export function createAgentActionRunner(service, code, preview) {
	const handlers = createHandlers(service, code, preview);
	return async function invoke(name, input = {}) {
		const metadata = actionMetadata(name);
		if (!metadata || !handlers[name]) throw actionError('SITE_AGENT_ACTION_UNKNOWN', `Unknown builder action: ${name}`);
		return { metadata, data: await handlers[name](input) };
	};
}

function createHandlers(service, code, preview) {
	return {
		'site.project.describe': () => service.describe(),
		'site.project.collect': () => service.collect(),
		'site.project.setBrief': input => service.setProjectBrief(input),
		'site.files.list': async () => (await service.collect()).source,
		'site.files.read': input => service.readFile(input.path),
		'site.files.write': input => service.writeFile(input.path, input.content),
		'site.files.create': input => service.createFile(input.path, input.content),
		'site.code.open': input => code.open(input.path, { force: Boolean(input.force) }),
		'site.code.inspect': () => code.inspect(),
		'site.code.updateCurrent': input => code.save(input),
		'site.preview.open': () => preview.open(),
		'site.preview.refresh': () => preview.refresh(),
		'site.preview.status': () => preview.status(),
		'site.publish.plan': input => service.publishPlan(input),
		'site.publish.apply': input => service.publishApply(input),
		'site.publish.status': () => service.publishPlan(),
		'site.domain.plan': input => service.domainPlan(input.hostname),
		'site.domain.claim': input => service.claimDomain(input),
		'site.domain.verify': input => service.verifyDomain(input.hostname),
		'site.domain.activate': input => service.activateDomain(input.hostname),
		'site.domain.remove': input => service.removeDomain(input.hostname),
		'site.domain.instructions': input => service.domainPlan(input.hostname),
		'site.nameservers.plan': input => service.nameserverPlan(input)
	};
}

function actionError(code, message) {
	const error = new Error(message);
	error.code = code;
	return error;
}
