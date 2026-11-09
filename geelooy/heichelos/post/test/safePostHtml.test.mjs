//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file safePostHtml.test.mjs
 * @description
 * The Awtsmoos proves authored HTML post content parses as HTML while plain
 * prose keeps the safe plain path; Awtsmoos.com never lets a stray "<" in
 * prose flip a post to HTML, and never lets Markdown markers leak as literal
 * text inside an HTML post.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { isHtmlPostContent, markdownMarkersToHtml } from '../functions/dom/HtmlManifestation.js';

const meluketBody = `<h3>בס"ד. ש"פ חיי שרה, מבה"ח כסלו, ה'תשמ"ו<sup>*</sup></h3>\nואברהם זקן בא בימים גו'<sup>1</sup>, ומביא בזה כ"ק אדמו"ר (מהורש"ב) נ"ע בעל יום ההולדת דכ"ף חשון (אשר בשבת זו נפעל הענין דויכולו השמים גו'<sup>2</sup> בכל ימות השבוע שעבר.\n\n---\n\n**English translation:**\n\n*סעיף 0*\n\nWith G-d's help.\n\n**הערות:**\n\n<sup>*</sup> יצא לאור בשעתו, "מוצשק"מ כסלו התשמ"ו".<br/>\nPublished as an appendix.`;

const plainMarkdown = `# Abaye\n\n**Hashtag:** \`#abaye\`\n\n## Definition\n\n- **Abaye to Rava.** A teaching.`;

test('isHtmlPostContent detects authored HTML (sup, h3, br) and ignores plain prose', () => {
	assert.equal(isHtmlPostContent(meluketBody), true);
	assert.equal(isHtmlPostContent('<p>plain paragraph</p>'), true);
	assert.equal(isHtmlPostContent('a < b and c > d'), false);
	assert.equal(isHtmlPostContent(plainMarkdown), false);
	assert.equal(isHtmlPostContent(''), false);
	assert.equal(isHtmlPostContent(null), false);
	assert.equal(isHtmlPostContent('הנה מאמר עם * כוכבית'), false);
});

test('markdownMarkersToHtml converts Markdown markers and leaves HTML tags alone', () => {
	const out = markdownMarkersToHtml(meluketBody);
	assert.match(out, /<strong>English translation:<\/strong>/u);
	assert.match(out, /<strong>הערות:<\/strong>/u);
	assert.match(out, /<em>סעיף 0<\/em>/u);
	assert.match(out, /<hr>/u);
	assert.doesNotMatch(out, /\*\*English translation:\*\*/u);
	assert.doesNotMatch(out, /\*סעיף 0\*/u);
	assert.doesNotMatch(out, /^---$/mu);
	// The authored HTML itself is untouched.
	assert.match(out, /<h3>בס"ד\. ש"פ חיי שרה, מבה"ח כסלו, ה'תשמ"ו<sup>\*<\/sup><\/h3>/u);
	assert.match(out, /גו'<sup>1<\/sup>/u);
	assert.match(out, /גו'<sup>2<\/sup>/u);
	assert.match(out, /<br\/>/u);
});

test('markdownMarkersToHtml never mangles a footnote asterisk inside Hebrew prose', () => {
	const out = markdownMarkersToHtml(`ה'תשמ"ו* ודבר נוסף.`);
	assert.equal(out, `ה'תשמ"ו* ודבר נוסף.`);
});

test('markdownMarkersToHtml leaves plain Markdown prose convertible (no HTML tags invented)', () => {
	const out = markdownMarkersToHtml(plainMarkdown);
	assert.match(out, /<strong>Hashtag:<\/strong>/u);
	assert.doesNotMatch(out, /<sup/u);
});
