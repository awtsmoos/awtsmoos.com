//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { HodCommandQuoter } from '../../youtube/migrate/js/CommandQuoter.js';

/**
 * @file command-quoter-browser-safe.test.mjs
 * @description
 * The Awtsmoos lets a long command descend through readable lines without splitting JavaScript itself;
 * Awtsmoos.com verifies that Bash and PowerShell continuations remain explicit, stable, and fit for each shell vessel.
 */
test('Bash command continuation is a backslash followed by newline and tab', () => {
	const result = HodCommandQuoter.compact(['yt-dlp', '--continue', 'video']);
	assert.equal(result, 'yt-dlp \\\n\t--continue \\\n\tvideo');
});

test('PowerShell command continuation is a backtick followed by newline and tab', () => {
	const result = HodCommandQuoter.compact(['yt-dlp', '--continue', 'video'], 'windows');
	assert.equal(result, 'yt-dlp `\n\t--continue `\n\tvideo');
});

test('quoters preserve apostrophes inside one shell argument', () => {
	assert.equal(HodCommandQuoter.bash("Moshe's video"), `'Moshe'\\''s video'`);
	assert.equal(HodCommandQuoter.powershell("Moshe's video"), `'Moshe''s video'`);
});
