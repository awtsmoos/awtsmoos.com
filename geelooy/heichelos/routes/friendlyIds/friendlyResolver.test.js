// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file friendlyResolver.test.js
 * @description
 * Tests for the human-friendly ID resolver: Hebrew numerals, every documented
 * pattern, bounds, and the 404 contract. Run: node --test friendlyResolver.test.js
 */

'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
	hebrewNumeralValue,
	parseCount,
	resolveFriendlyPath
} = require('./friendlyResolver.js');
const { createFriendlyRoutes } = require('./friendlyDerech.js');

function urlFor(sefer, segments) {
	const out = resolveFriendlyPath(sefer, segments);
	assert.equal(out.status, 'redirect', `expected redirect for ${sefer}/${segments.join('/')}`);
	return out.url;
}

function notFoundFor(sefer, segments) {
	const out = resolveFriendlyPath(sefer, segments);
	assert.equal(out.status, 'notFound', `expected notFound for ${sefer}/${segments.join('/')}`);
}

test('hebrew numerals parse, incl. geresh and final forms', () => {
	assert.equal(hebrewNumeralValue('א'), 1);
	assert.equal(hebrewNumeralValue('ה'), 5);
	assert.equal(hebrewNumeralValue('י'), 10);
	assert.equal(hebrewNumeralValue('מב'), 42);
	assert.equal(hebrewNumeralValue('מ״ב'), 42);
	assert.equal(hebrewNumeralValue("מב'"), 42);
	assert.equal(hebrewNumeralValue('טו'), 15);
	assert.equal(hebrewNumeralValue('טז'), 16);
	assert.equal(hebrewNumeralValue('תריג'), 613);
	assert.equal(hebrewNumeralValue('ך'), 20);
	assert.equal(hebrewNumeralValue('bogus'), null);
	assert.equal(hebrewNumeralValue(''), null);
});

test('parseCount handles digits and Hebrew numerals', () => {
	assert.equal(parseCount('1'), 1);
	assert.equal(parseCount('01'), 1);
	assert.equal(parseCount('42'), 42);
	assert.equal(parseCount('0'), null);
	assert.equal(parseCount('מב'), 42);
	assert.equal(parseCount('א'), 1);
});

test('tanya landings and chapters', () => {
	assert.equal(
		urlFor('tanya', []),
		'/heichelos/ikar/series/tanyaLikkuteiAmarim'
	);
	assert.equal(
		urlFor('tanya', ['1']),
		'/heichelos/ikar/series/tanyaLikkuteiAmarim/post/tanya-he-la-01'
	);
	assert.equal(
		urlFor('tanya', ['chapter-1']),
		'/heichelos/ikar/series/tanyaLikkuteiAmarim/post/tanya-he-la-01'
	);
	assert.equal(
		urlFor('tanya', ['53']),
		'/heichelos/ikar/series/tanyaLikkuteiAmarim/post/tanya-he-la-53'
	);
	assert.equal(
		urlFor('tanya', ['א']),
		'/heichelos/ikar/series/tanyaLikkuteiAmarim/post/tanya-he-la-01'
	);
	assert.equal(
		urlFor('tanya', ['פרק-א']),
		'/heichelos/ikar/series/tanyaLikkuteiAmarim/post/tanya-he-la-01'
	);
	assert.equal(
		urlFor('tanya', ['פרק-נב']),
		'/heichelos/ikar/series/tanyaLikkuteiAmarim/post/tanya-he-la-52'
	);
});

test('tanya verses', () => {
	assert.equal(
		urlFor('tanya', ['chapter-1', 'verse-5']),
		'/heichelos/ikar/series/tanyaLikkuteiAmarim/post/tanya-he-la-01#verse-5'
	);
	assert.equal(
		urlFor('tanya', ['פרק-א', 'פסוק-ה']),
		'/heichelos/ikar/series/tanyaLikkuteiAmarim/post/tanya-he-la-01#verse-5'
	);
	assert.equal(
		urlFor('tanya', ['א', 'ה']),
		'/heichelos/ikar/series/tanyaLikkuteiAmarim/post/tanya-he-la-01#verse-5'
	);
});

test('tanya sections (Shaar HaYichud, Igeres HaTeshuvah, Kuntres Acharon)', () => {
	assert.equal(
		urlFor('tanya', ['shaar-hayichud']),
		'/heichelos/ikar/series/tanyaShaarHaYichud'
	);
	assert.equal(
		urlFor('tanya', ['shaar-hayichud', '3']),
		'/heichelos/ikar/series/tanyaShaarHaYichud/post/tanya-he-sh-03'
	);
	assert.equal(
		urlFor('tanya', ['שער-היחוד', 'ג']),
		'/heichelos/ikar/series/tanyaShaarHaYichud/post/tanya-he-sh-03'
	);
	assert.equal(
		urlFor('tanya', ['igeres-hateshuvah', '12']),
		'/heichelos/ikar/series/tanyaIgeresHaTeshuvah/post/tanya-he-it-12'
	);
	assert.equal(
		urlFor('tanya', ['kuntres-acharon', '9']),
		'/heichelos/ikar/series/tanyaKuntresAcharon/post/tanya-he-ka-09'
	);
	assert.equal(
		urlFor('tanya', ['kuntres-acharon', '9', 'verse-2']),
		'/heichelos/ikar/series/tanyaKuntresAcharon/post/tanya-he-ka-09#verse-2'
	);
});

test('tanya rejects out-of-range and unknown paths', () => {
	notFoundFor('tanya', ['0']);
	notFoundFor('tanya', ['54']);
	notFoundFor('tanya', ['chapter-0']);
	notFoundFor('tanya', ['kuntres-acharon', '10']);
	notFoundFor('tanya', ['shaar-hayichud', '13']);
	notFoundFor('tanya', ['bogus']);
	notFoundFor('tanya', ['1', '2', '3', '4']);
	notFoundFor('tanya', ['nope', 'nada']);
});

test('likutei torah parshas and chapters', () => {
	assert.equal(
		urlFor('likutei-torah', []),
		'/heichelos/ikar/series/' + encodeURIComponent('BH-likkuteiTorah-במדבר')
	);
	assert.equal(
		urlFor('likutei-torah', ['bamidbar']),
		'/heichelos/ikar/series/' + encodeURIComponent('BH-likkuteiTorah-במדבר')
	);
	assert.equal(
		urlFor('likutei-torah', ['Bamidbar']),
		'/heichelos/ikar/series/' + encodeURIComponent('BH-likkuteiTorah-במדבר')
	);
	assert.equal(
		urlFor('likutei-torah', ['bamidbar', '1']),
		'/heichelos/ikar/series/' + encodeURIComponent('BH-likkuteiTorah-במדבר') + '/post/lt-bamidbar-ch01'
	);
	assert.equal(
		urlFor('likutei-torah', ['במדבר', 'א']),
		'/heichelos/ikar/series/' + encodeURIComponent('BH-likkuteiTorah-במדבר') + '/post/lt-bamidbar-ch01'
	);
	assert.equal(
		urlFor('likutei-torah', ['tzav', '12']),
		'/heichelos/ikar/series/' + encodeURIComponent('BH-likkuteiTorah-צו') + '/post/lt-tzav-ch12'
	);
	assert.equal(
		urlFor('likutei-torah', ['shabbat-shuvah', '3']),
		'/heichelos/ikar/series/' + encodeURIComponent('BH-likkuteiTorah-דרושים-שבת-שובה') + '/post/lt-shabbat-shuvah-ch03'
	);
	assert.equal(
		urlFor('likutei-torah', ['shemini-atzeret', '8', 'verse-2']),
		'/heichelos/ikar/series/' + encodeURIComponent('BH-likkuteiTorah-דרושים-שמיני-עצרת') + '/post/lt-shemini-atzeret-ch08#verse-2'
	);
});

test('likutei torah rejects unknown parsha and out-of-range chapters', () => {
	notFoundFor('likutei-torah', ['bereishis']);
	notFoundFor('likutei-torah', ['bamidbar', '22']);
	notFoundFor('likutei-torah', ['tzav', '13']);
	notFoundFor('likutei-torah', ['bamidbar', '0']);
});

test('igeres hakodesh letters and volumes', () => {
	assert.equal(
		urlFor('igeres-hakodesh', []),
		'/heichelos/ikar/series/igeresHaKodeshVolume1'
	);
	assert.equal(
		urlFor('igeres-hakodesh', ['letter-42']),
		'/heichelos/ikar/series/igeresHaKodeshVolume1/post/igeres-he-v01-0042'
	);
	assert.equal(
		urlFor('igeres-hakodesh', ['42']),
		'/heichelos/ikar/series/igeresHaKodeshVolume1/post/igeres-he-v01-0042'
	);
	assert.equal(
		urlFor('igeres-hakodesh', ['אגרת-מב']),
		'/heichelos/ikar/series/igeresHaKodeshVolume1/post/igeres-he-v01-0042'
	);
	assert.equal(
		urlFor('igeres-hakodesh', ['מב']),
		'/heichelos/ikar/series/igeresHaKodeshVolume1/post/igeres-he-v01-0042'
	);
	assert.equal(
		urlFor('igeres-hakodesh', ['vol-3', 'letter-42']),
		'/heichelos/ikar/series/igeresHaKodeshVolume3/post/igeres-he-v03-0042'
	);
	assert.equal(
		urlFor('igeres-hakodesh', ['3', '42']),
		'/heichelos/ikar/series/igeresHaKodeshVolume3/post/igeres-he-v03-0042'
	);
	assert.equal(
		urlFor('igeres-hakodesh', ['כרך-ג', 'אגרת-מב']),
		'/heichelos/ikar/series/igeresHaKodeshVolume3/post/igeres-he-v03-0042'
	);
	assert.equal(
		urlFor('igeres-hakodesh', ['vol-28', 'letter-415']),
		'/heichelos/ikar/series/igeresHaKodeshVolume28/post/igeres-he-v28-0415'
	);
});

test('igeres hakodesh rejects out-of-range letters and volumes', () => {
	notFoundFor('igeres-hakodesh', ['letter-170']); // vol 1 has 169
	notFoundFor('igeres-hakodesh', ['letter-0']);
	notFoundFor('igeres-hakodesh', ['vol-29', 'letter-1']);
	notFoundFor('igeres-hakodesh', ['vol-28', 'letter-416']);
	notFoundFor('igeres-hakodesh', ['bogus']);
});

test('derech route map: redirects carry Location, unknowns 404', async () => {
	const routes = createFriendlyRoutes('tanya');

	const landing = await routes['/']();
	assert.equal(landing.statusCode, 302);
	assert.equal(landing.headers.Location, '/heichelos/ikar/series/tanyaLikkuteiAmarim');

	const chapter = await routes['/:a']({ a: 'chapter-1' });
	assert.equal(chapter.statusCode, 302);
	assert.equal(chapter.headers.Location, '/heichelos/ikar/series/tanyaLikkuteiAmarim/post/tanya-he-la-01');

	const verse = await routes['/:a/:b']({ a: 'פרק-א', b: 'פסוק-ה' });
	assert.equal(verse.statusCode, 302);
	assert.ok(verse.headers.Location.endsWith('/post/tanya-he-la-01#verse-5'));

	const missing = await routes['/:a']({ a: 'no-such-chapter-zzz' });
	assert.equal(missing.statusCode, 404);
	assert.match(missing.response, /Not found/);

	const deep = await routes['/:rest*']({ rest: 'a/b/c/d/e' });
	assert.equal(deep.statusCode, 404);

	// a parsha name under /tanya is simply unknown -> clean 404, no crash
	const hebrew = await routes['/:a/:b']({ a: 'במדבר', b: 'א' });
	assert.equal(hebrew.statusCode, 404);
});
