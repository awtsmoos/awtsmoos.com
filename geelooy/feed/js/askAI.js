// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AskAI
 * @description
 * Yaakov 2026-10-13 (TRACK D): "Ask about this post" — fully client-side,
 * EXTRACTIVE Q&A over the post's own text. No network calls, no external
 * LLM: the question is tokenized, the post's passages are ranked by term
 * overlap, and the answer is built by QUOTING the best-matching passages.
 * Every answer is labeled "AI-assisted" and cites the passages it quotes.
 */

import { icon, escapeHtml } from './icons.js';

const STOP = new Set(
	('a,an,the,and,or,but,if,then,else,when,what,why,how,which,who,whom,whose,' +
	'this,that,these,those,is,are,was,were,be,been,being,have,has,had,do,does,' +
	'did,will,would,shall,should,can,could,may,might,must,of,in,on,at,to,for,' +
	'with,from,by,as,not,no,yes,it,its,it\u2019s,they,them,their,we,us,our,you,your,' +
	'he,him,his,she,her,they,i,me,my,so,very,just,also,only,more,most,such,' +
	'into,out,up,down,over,under,again,once,about,into,between,through,during,' +
	'like,doesn,don,isn,aren,wasn,weren,haven,hasn,hadn,won,wouldn,couldn,shouldn,' +
	'mean,means,meant,explain,explanation,says,say,said,tell').split(',')
);

function tokenize(text) {
	const words = String(text || '').toLowerCase().match(/[a-z\u0590-\u05ff\u0600-\u06ff']+/g) || [];
	return words.filter((w) => w.length > 2 && !STOP.has(w));
}

/**
 * Splits post HTML into candidate passages (plain text, min length).
 * @returns {Array<string>}
 */
export function passagesFromHtml(html) {
	const text = String(html || '')
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<\/(p|div|blockquote|li|h[1-6]|tr)>/gi, '\n')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"').replace(/&#39;/g, "'")
		.replace(/[ \t]+/g, ' ');
	return text.split('\n').map((s) => s.trim()).filter((s) => s.length >= 60);
}

/** Score passages against question tokens by term overlap. */
export function rankPassages(question, passages) {
	const qTerms = tokenize(question);
	if (!qTerms.length || !passages.length) return [];
	const qSet = new Set(qTerms);
	const scored = passages.map((p, idx) => {
		const pTerms = tokenize(p);
		const pSet = new Set(pTerms);
		let overlap = 0;
		for (const t of qSet) if (pSet.has(t)) overlap += 1;
		const coverage = qSet.size ? overlap / qSet.size : 0;
		return { idx, text: p, overlap, coverage };
	}).filter((s) => s.overlap > 0);
	scored.sort((a, b) => (b.coverage - a.coverage) || (b.overlap - a.overlap));
	return scored;
}

const SOURCE_RE = /(yeshayahu|isaiah|bereishis|genesis|shemos|exodus|vayikra|tehillim|psalms|mishlei|proverbs|iyov|daniel|tzalmos|rambam|maimonides|talmud|mishnah|gemara|midrash|tanya|likutei|zohar|shulchan|aruch|ch\.\s*\d+|\b\d{1,3}\s*:\s*\d{1,3}\b|perek|sefer|torah|chumash|haftorah|megillah|pirkei|avos)/i;
const PRACTICAL_RE = /\b(do|don't|should|practice|daily|every day|action|mitzvah|halachah|avoid|be careful|make sure|try to|habit|custom|customary|blessing|pray|daven|give|charity|tzedakah|kindness|chesed)\b/i;

/**
 * Builds an extractive answer: quoted passages + citations.
 * @returns {{kind: string, heading: string, lead: string, quotes: Array<{text: string, ref: string}>}}
 */
export function answerQuestion(question, passages) {
	const trimmed = String(question || '').trim();
	const ranked = rankPassages(trimmed, passages);
	if (!ranked.length) {
		return {
			kind: 'none', heading: 'No passage found',
			lead: 'I searched the whole post and no passage matches those words. Try simpler words, or one of the suggested questions below.',
			quotes: []
		};
	}
	const pick = ranked.slice(0, 3).map((r, i) => ({
		text: r.text.length > 420 ? r.text.slice(0, 417).trimEnd() + '\u2026' : r.text,
		ref: `Passage ${r.idx + 1} of this post`
	}));
	return {
		kind: 'extract', heading: 'From this post',
		lead: 'The passages below match your question best. They are quoted exactly as written in the post.',
		quotes: pick
	};
}

/** "Explain like I'm five": the most central passage of the post. */
export function answerSimplify(passages) {
	if (!passages.length) return answerQuestion('', passages);
	// Centrality: passage with the highest total term overlap with all others.
	const sets = passages.map((p) => new Set(tokenize(p)));
	let best = 0, bestScore = -1;
	for (let i = 0; i < sets.length; i++) {
		let score = 0;
		for (let j = 0; j < sets.length; j++) {
			if (i === j) continue;
			for (const t of sets[i]) if (sets[j].has(t)) score++;
		}
		if (score > bestScore) { bestScore = score; best = i; }
	}
	return {
		kind: 'simplify', heading: 'In the simplest words',
		lead: 'This is the post\u2019s heart — the passage everything else circles around:',
		quotes: [{ text: passages[best], ref: `Passage ${best + 1} of this post` }]
	};
}

/** "Show me the sources": passages that look like citations. */
export function answerSources(passages) {
	const hits = passages.filter((p) => SOURCE_RE.test(p));
	if (!hits.length) {
		return {
			kind: 'none', heading: 'No sources named',
			lead: 'The post doesn\u2019t name its sources explicitly — try \u201cExplain like I\u2019m five\u201d instead.',
			quotes: []
		};
	}
	return {
		kind: 'sources', heading: 'Sources named in this post',
		lead: 'These are the sources the post itself names or quotes:',
		quotes: hits.slice(0, 3).map((p) => ({
			text: p.length > 420 ? p.slice(0, 417).trimEnd() + '\u2026' : p,
			ref: 'Cited inside this post'
		}))
	};
}

/** "What does this mean practically?": passages that read as guidance. */
export function answerPractical(passages) {
	const hits = passages.filter((p) => PRACTICAL_RE.test(p));
	if (!hits.length) {
		return {
			kind: 'none', heading: 'No practical guidance found',
			lead: 'This post reads as pure learning — no passage speaks about practice directly.',
			quotes: []
		};
	}
	const ranked = rankPassages('practical daily practice action do mitzvah', hits);
	const pick = (ranked.length ? ranked : hits.map((text, idx) => ({ text, idx }))).slice(0, 3);
	return {
		kind: 'practical', heading: 'What to take into practice',
		lead: 'These passages from the post speak to daily life:',
		quotes: pick.map((r) => ({
			text: r.text.length > 420 ? r.text.slice(0, 417).trimEnd() + '\u2026' : r.text,
			ref: 'From this post'
		}))
	};
}

const SUGGESTIONS = [
	{ id: 'simplify', label: 'Explain like I\u2019m five' },
	{ id: 'sources', label: 'Show me the sources' },
	{ id: 'practical', label: 'What does this mean practically?' }
];

function answerHtml(result) {
	const quotes = result.quotes.map((q) => `
		<figure class="askai-quote">
			<blockquote dir="auto">${escapeHtml(q.text)}</blockquote>
			<figcaption><cite>${escapeHtml(q.ref)}</cite></figcaption>
		</figure>`).join('');
	return `
		<div class="askai-answer" role="status">
			<p class="askai-badge">${icon('spark', 'askai-badge-ic')} AI-assisted answer — quoted from this post, generated on your device</p>
			<h4 class="askai-answer-head" dir="auto">${escapeHtml(result.heading)}</h4>
			<p class="askai-answer-lead">${escapeHtml(result.lead)}</p>
			${quotes}
			<p class="askai-disclaimer">This answer only quotes what this post says. It is not a psak — ask your rav for guidance.</p>
		</div>`;
}

/**
 * Mounts the "Ask about this post" panel into a slot element.
 * @param {HTMLElement} slot Element to render into.
 * @param {{title: string, html: string}} post Post title + full body HTML.
 */
export function mountAskAI(slot, post) {
	if (!slot || slot.dataset.askaiMounted) return;
	slot.dataset.askaiMounted = '1';
	const passages = passagesFromHtml(post.html || '');

	slot.innerHTML = `
		<section class="askai" aria-label="Ask about this post">
			<button type="button" class="askai-toggle feed-ic-btn" aria-expanded="false">
				${icon('questionCircle')}<span class="feed-ic-btn-label">Ask about this post</span>
			</button>
			<div class="askai-panel" hidden>
				<p class="askai-intro">Ask anything about \u201c${escapeHtml(post.title || 'this post')}\u201d — answers quote the post itself.</p>
				<div class="askai-suggest" role="group" aria-label="Suggested questions">
					${SUGGESTIONS.map((s) => `<button type="button" class="askai-chip" data-askai-suggest="${s.id}">${escapeHtml(s.label)}</button>`).join('')}
				</div>
				<form class="askai-form">
					<label class="askai-label" for="askai-q-${slot.id || 'x'}">Your question</label>
					<div class="askai-row">
						<input class="askai-input" id="askai-q-${slot.id || 'x'}" type="text" maxlength="300" placeholder="Ask in your own words\u2026" autocomplete="off">
						<button class="askai-ask" type="submit">Ask</button>
					</div>
				</form>
				<div class="askai-out" aria-live="polite"></div>
			</div>
		</section>`;

	const toggle = slot.querySelector('.askai-toggle');
	const panel = slot.querySelector('.askai-panel');
	const out = slot.querySelector('.askai-out');
	const form = slot.querySelector('.askai-form');
	const input = slot.querySelector('.askai-input');

	toggle.addEventListener('click', () => {
		const open = panel.hidden;
		panel.hidden = !open;
		toggle.setAttribute('aria-expanded', String(open));
		if (open) input.focus();
	});

	function show(result) {
		out.innerHTML = answerHtml(result);
		out.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
	}

	slot.querySelectorAll('[data-askai-suggest]').forEach((btn) => {
		btn.addEventListener('click', () => {
			const kind = btn.dataset.askaiSuggest;
			show(kind === 'simplify' ? answerSimplify(passages)
				: kind === 'sources' ? answerSources(passages)
				: answerPractical(passages));
		});
	});

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const q = input.value.trim();
		if (!q) return;
		show(answerQuestion(q, passages));
	});
}
