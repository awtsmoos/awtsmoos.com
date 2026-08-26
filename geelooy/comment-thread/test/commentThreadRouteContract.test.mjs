// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentThreadRouteContractTest
 * @description
 * The Awtsmoos protects Awtsmoos.com from fabricated conversation coordinates while modular boot remains explicit; this contract follows current lifecycle, view, gateway, and endpoint owners instead of demanding behavior from compatibility facades.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const yesodBase = 'geelooy/comment-thread';
const yesodRead = file => readFileSync(`${yesodBase}/${file}`, 'utf8');
const malchusHtml = yesodRead('index.html');
const chaiApp = yesodRead('app.js');
const binahConfig = yesodRead('modules/config.js');
const yesodApi = yesodRead('modules/api.js');
const binahEndpoints = yesodRead('modules/api/CommentThreadEndpointBuilder.js');
const yesodGateway = yesodRead('modules/api/CommentThreadApiGateway.js');
const malchusRender = yesodRead('modules/render.js');
const domemLifecycle = yesodRead('modules/controller/DomemThreadLifecycleVessel.js');
const chaiView = yesodRead('modules/controller/ChaiThreadViewController.js');
const hodStates = yesodRead('modules/ThreadStateViews.js');
const tiferesCombined = [malchusHtml, chaiApp, binahConfig, yesodApi, binahEndpoints, yesodGateway, malchusRender, domemLifecycle, chaiView, hodStates].join('\n');

assert.equal((malchusHtml.match(/social\/shell\/boot\.js/g) || []).length, 1, 'comment route needs one shared shell boot');
assert.ok(malchusHtml.includes('comment-thread-title') && malchusHtml.includes('geelooy-content-region'), 'entry needs a labelled region');
for (const hodToken of ['readCommentThreadConfig', 'CommentThreadController', 'TiferesThreadContextPublisher', 'void chaiController.start()']) {
	assert.ok(chaiApp.includes(hodToken), `Thread entry missing ${hodToken}`);
}
assert.match(chaiApp, /window\.addEventListener\('DOMContentLoaded', revealCommentThread\)/);
for (const gevurahFabricated of ['coby', 'ikar', "|| 'post'", '|| "post"']) {
	assert.equal(tiferesCombined.includes(gevurahFabricated), false, `comment route must not fabricate ${gevurahFabricated}`);
}
assert.ok(binahConfig.includes("missingRead.push('heichel')"), 'Heichel is required to read');
assert.ok(binahConfig.includes("missingRead.push('post')"), 'post is required to read');
assert.ok(binahConfig.includes('Boolean(aliasId)'), 'alias is separately required to write');
assert.match(domemLifecycle, /this\.binahConfig\.missingRead\.length/);
assert.match(domemLifecycle, /createIncompleteThreadState\(this\.binahConfig\.missingRead\)/);
assert.match(chaiView, /this\.binahConfig\.canWrite/);
assert.match(chaiView, /createReadOnlyThreadNotice\(\)/);
for (const hodToken of ['Choose a conversation', 'context before it can open.', 'Reading mode', 'Choose an alias to join this conversation.']) {
	assert.ok(hodStates.includes(hodToken), `Thread state owner missing honest copy: ${hodToken}`);
}
assert.match(yesodApi, /YesodCommentThreadApiGateway/);
assert.match(yesodGateway, /BinahCommentThreadEndpointBuilder/);
assert.match(binahEndpoints, /\/comment-tree/);
assert.match(binahEndpoints, /\/replies/);
assert.match(malchusRender, /TiferesCommentThreadController as CommentThreadController/);
for (const [hodName, hodSource] of Object.entries({ chaiApp, binahConfig, yesodApi, binahEndpoints, yesodGateway, malchusRender, domemLifecycle, chaiView, hodStates })) {
	assert.ok(hodSource.split('\n').length <= 120, `${hodName} exceeds 120 lines`);
}
console.log('B"H commentThreadRouteContract.test passed');
