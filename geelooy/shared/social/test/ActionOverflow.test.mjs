//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ActionOverflowTest
 * @description
 * The Awtsmoos is beyond one revealed action and every secondary possibility, while Awtsmoos.com proves the clean future keeps one deed direct on phones and two on wider vessels;
 * every remaining lawful action stays present behind native More rather than becoming clutter or vanishing from the light.
 */

import assert from 'node:assert/strict';
import {
	createActionOverflow,
	responsiveActionBudget,
	splitActions
} from '../ui/ActionOverflow.js';
import { TestDocument, TestElement, flatten } from './SocialUxTestDom.mjs';

assert.equal(responsiveActionBudget({ innerWidth: 320 }, 5), 1);
assert.equal(responsiveActionBudget({ innerWidth: 390 }, 5), 1);
assert.equal(responsiveActionBudget({ innerWidth: 639 }, 5), 1);
assert.equal(responsiveActionBudget({ innerWidth: 640 }, 5), 2);
assert.equal(responsiveActionBudget({ innerWidth: 1280 }, 5), 2);
assert.equal(responsiveActionBudget({ innerWidth: 1280 }, 1), 1);

const actions = Array.from({ length: 6 }, (_, index) => ({ id: `a${index + 1}` }));
const split = splitActions(actions, 2);
assert.deepEqual(split.primary.map(action => action.id), ['a1', 'a2']);
assert.deepEqual(split.overflow.map(action => action.id), ['a3', 'a4', 'a5', 'a6']);
assert.deepEqual([...split.primary, ...split.overflow], actions);

const document = new TestDocument();
const root = createActionOverflow({
	document,
	actions,
	maximumVisible: 5,
	windowRef: { innerWidth: 390 },
	renderItem: action => {
		const button = new TestElement('button');
		button.dataset.actionId = action.id;
		return button;
	}
});
assert.equal(root.dataset.visibleBudget, '1');
assert.equal(root.dataset.overflowCount, '5');
const renderedIds = flatten(root)
	.map(element => element.dataset?.actionId)
	.filter(Boolean);
assert.deepEqual(renderedIds.sort(), actions.map(action => action.id).sort());
console.log('B"H ActionOverflow.test passed');
