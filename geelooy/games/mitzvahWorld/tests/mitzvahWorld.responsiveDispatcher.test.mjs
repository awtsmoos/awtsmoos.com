// B"H
/**
 * Chapter 20: One Intention Through Touch And Keys.
 */

import assert from 'node:assert/strict';
import { ResponsiveActionDispatcher } from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/mobile/ResponsiveActionDispatcher.js';

const dispatcher = new ResponsiveActionDispatcher();

assert.deepEqual(dispatcher.dispatch({ device: 'mobile', type: 'tap' }), { action: 'activate', source: 'mobile' });
assert.deepEqual(dispatcher.dispatch({ device: 'mobile', type: 'touchSlot:1' }), { action: 'actionBar', slot: 1, source: 'mobile' });
assert.deepEqual(dispatcher.dispatch({ device: 'mobile', type: 'chumashButton' }), { action: 'openChumashReader', source: 'mobile' });

assert.deepEqual(dispatcher.dispatch({ device: 'desktop', code: 'click' }), { action: 'activate', source: 'desktop' });
assert.deepEqual(dispatcher.dispatch({ device: 'desktop', code: 'KeyE' }), { action: 'activate', source: 'desktop' });
assert.deepEqual(dispatcher.dispatch({ device: 'desktop', code: 'Digit1' }), { action: 'actionBar', slot: 0, source: 'desktop' });
assert.deepEqual(dispatcher.dispatch({ device: 'desktop', code: 'KeyT' }), { action: 'openTorahDebate', source: 'desktop' });

console.log('B"H - responsive dispatcher runtime passed.');
