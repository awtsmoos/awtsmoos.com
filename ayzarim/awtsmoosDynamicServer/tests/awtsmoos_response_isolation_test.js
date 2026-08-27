// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file awtsmoos_response_isolation_test.js
 * @chapter Two Interleaved Dynamic Requests Must Retain Two Distinct Template Vessels
 * @description
 * Constructs two response engines around different request identities, then executes
 * the same delayed dynamic route concurrently. The historical module globals caused
 * both results to use the last constructor; instance-owned dependencies preserve A/B.
 */

const assert = require('node:assert/strict');
const fs = require('fs');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const AwtsmoosResponse = require('../awtsmoosResponse.js');

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-response-isolation-'));
const derech = path.join(directory, '_awtsmoos.derech.js');
const filePath = path.join(directory, 'query');

fs.writeFileSync(derech, `// B"H
module.exports = async function dynamicRequest(template) {
	await new Promise(resolve => setTimeout(resolve, template.delay));
	await template.use({
		'/query': async () => ({ requestId: template.requestId })
	});
};
`);

function generator(requestId, delay) {
	return {
		dependencies: {
			request: {
				isAwtsmoosFileStatusRequest: false,
				requestId
			}
		},
		async getTemplateObject(options) {
			return {
				...options,
				requestId,
				delay
			};
		}
	};
}

function response(requestId, delay) {
	return new AwtsmoosResponse({
		path,
		fs: fsp,
		awtsMoosification: '_awtsmoos.derech.js',
		templateObjectGenerator: generator(requestId, delay)
	});
}

async function request(owner) {
	const result = await owner.doAwtsmooses({
		foundAwtsmooses: [directory],
		filePath
	});
	assert.equal(result.c, true);
	assert.equal(result.error, undefined);
	return JSON.parse(result.responseInfo.actualResponse.content).requestId;
}

async function main() {
	const first = response('request-A', 25);
	const second = response('request-B', 1);
	assert.notEqual(first.dependencies, second.dependencies);
	assert.notEqual(
		first.dependencies.templateObjectGenerator,
		second.dependencies.templateObjectGenerator
	);
	const [firstId, secondId] = await Promise.all([
		request(first),
		request(second)
	]);
	assert.equal(firstId, 'request-A');
	assert.equal(secondId, 'request-B');
	console.log('awtsmoos_response_isolation_test passed');
}

main()
	.finally(() => fs.rmSync(directory, { recursive: true, force: true }))
	.catch(error => {
		console.error(error);
		process.exitCode = 1;
	});
