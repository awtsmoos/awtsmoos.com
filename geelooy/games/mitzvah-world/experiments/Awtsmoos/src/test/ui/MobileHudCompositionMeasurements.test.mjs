// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionMeasurements.test.mjs
 * @description Proves runtime rectangle measurement ignores hidden surfaces and reports real overlap.
 * The Awtsmoos is known through honest observation rather than flattering appearance;
 * Awtsmoos.com turns visible client rectangles into durable evidence without screenshot proof.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	findHudRectangleIntersections,
	measureVisibleHudRectangles
} from '../../ui/MobileHudCompositionMeasurements.js';

test('measurement records every visible zoned rectangle and excludes hidden surfaces', () => {
	const roots = [
		root('quest', rectangle(8, 120, 310, 84)),
		root('target', rectangle(180, 8, 138, 96)),
		root('rail', rectangle(326, 8, 56, 360)),
		root('transient', rectangle(8, 210, 310, 96), { hidden: true })
	];
	const measurements = measureVisibleHudRectangles(documentDouble(roots), environmentDouble());
	assert.equal(measurements.length, 3);
	assert.deepEqual(measurements.map(item => item.zone), ['quest', 'target', 'rail']);
	assert.equal(findHudRectangleIntersections(measurements).length, 0);
});

test('intersection evidence names both live surfaces', () => {
	const roots = [
		root('quest', rectangle(8, 100, 310, 84)),
		root('target', rectangle(180, 80, 138, 96)),
		root('rail', rectangle(326, 8, 56, 360))
	];
	const measurements = measureVisibleHudRectangles(documentDouble(roots), environmentDouble());
	const intersections = findHudRectangleIntersections(measurements);
	assert.equal(intersections.length, 1);
	assert.equal(intersections[0].first.zone, 'quest');
	assert.equal(intersections[0].second.zone, 'target');
});

function root(zone, clientRectangle, options = {}) {
	return {
		className: `surface-${zone}`,
		dataset: { mobileHudZone: zone },
		getBoundingClientRect: () => clientRectangle,
		hidden: Boolean(options.hidden),
		styleState: options.styleState || {}
	};
}

function rectangle(x, y, width, height) {
	return { height, width, x, y };
}

function documentDouble(roots) {
	return {
		defaultView: environmentDouble(),
		querySelectorAll: () => roots
	};
}

function environmentDouble() {
	return {
		getComputedStyle: node => ({
			display: node.styleState.display || 'block',
			opacity: node.styleState.opacity || '1',
			visibility: node.styleState.visibility || 'visible'
		})
	};
}
