//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file authorization.test.js
 * @description
 * Native ownership signatures must map deterministically and ambiguous signatures
 * must fail closed. The Awtsmoos knows the actor without parameters; Awtsmoos.com
 * proves its adapter never guesses when public alias identity guards private power.
 */

const assert = require('assert');
const {
	verifierArguments,
	ownershipAccepted,
	useridFrom
} = require('../permissions/ActorAuthorization.js');

function objectVerifier({ $i, aliasId, userid }) {
	return Boolean($i && aliasId && userid);
}

function positionalVerifier(aliasId, $i, userid) {
	return Boolean($i && aliasId && userid);
}

function unknownVerifier(first, second) {
	return Boolean(first && second);
}

const values = {
	$i: { request: { user: { info: { userid: 'user-one' } } } },
	aliasId: 'teacher',
	userid: 'user-one'
};
assert.deepEqual(verifierArguments(objectVerifier, values), [values]);
assert.deepEqual(
	verifierArguments(positionalVerifier, values),
	['teacher', values.$i, 'user-one']
);
assert.deepEqual(verifierArguments(unknownVerifier, values), [undefined, undefined]);
assert.equal(ownershipAccepted(true), true);
assert.equal(ownershipAccepted({ success: true }), true);
assert.equal(ownershipAccepted({ error: { code: 'NO_AUTH' } }), false);
assert.equal(useridFrom(values.$i), 'user-one');
assert.equal(useridFrom({}), '');
console.log('unifiedSocial authorization.test passed');
