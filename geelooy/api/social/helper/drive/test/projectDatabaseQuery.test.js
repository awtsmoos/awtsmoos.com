//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file projectDatabaseQuery.test.js
 * @description Proves visual queries stay inside the bounded project preview and accept only the declared field/operator vocabulary.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeField, normalizeOperator, parseQueryValue, queryProjectDocuments } = require('../projectDatabaseQuery.js');

/** @returns {object} ProjectDatabaseScope-like fixture with three documents. */
function scope() {
	const values = {
		a: { age: 30, profile: { city: 'Brooklyn' }, tags: ['torah', 'js'] },
		b: { age: 19, profile: { city: 'Queens' }, tags: ['design'] },
		c: { age: 40, profile: { city: 'Brooklyn' }, tags: ['torah'] }
	};
	return {
		list: async () => Object.keys(values),
		getKey: async (_path, key) => values[key]
	};
}

test('bounded query filters nested fields and sorts results', async () => {
	const result = await queryProjectDocuments(scope(), {
		field: 'profile.city',
		operator: 'eq',
		value: 'Brooklyn',
		sort: 'desc'
	});
	assert.deepEqual(result.documents.map(document => document.key).sort(), ['a', 'c']);
	assert.equal(result.execution, 'bounded-scan');
	assert.equal(result.total, 3);
});

test('contains supports arrays and comparisons parse JSON scalars', async () => {
	const tags = await queryProjectDocuments(scope(), { field: 'tags', operator: 'contains', value: 'torah' });
	const adults = await queryProjectDocuments(scope(), { field: 'age', operator: 'gte', value: '30' });
	assert.deepEqual(tags.documents.map(document => document.key), ['a', 'c']);
	assert.deepEqual(adults.documents.map(document => document.key), ['a', 'c']);
	assert.equal(parseQueryValue('true'), true);
});

test('query field and operator reject unsafe or undeclared input', () => {
	assert.throws(() => normalizeField('__proto__.polluted.more.more.more.more.more.more.more'), /INVALID_PROJECT_DB_QUERY_FIELD/);
	assert.throws(() => normalizeField('../escape'), /INVALID_PROJECT_DB_QUERY_FIELD/);
	assert.throws(() => normalizeOperator('regex'), /INVALID_PROJECT_DB_QUERY_OPERATOR/);
});
