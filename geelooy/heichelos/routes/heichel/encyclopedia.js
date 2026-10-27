// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file encyclopedia.js
 * @description
 * Server-rendered Admur Encyclopedia experience for the admur-encyclopedia series:
 * a category-browsing landing page and bespoke bilingual reference-article pages.
 * Data comes from the public social API; every fetch is guarded so a failure
 * falls back to the generic series shell instead of an empty vessel.
 */

const ENC_HEICHEL = 'chassidus';
const ENC_SERIES = 'admur-encyclopedia';
const ENC_BASE = `/heichelos/${ENC_HEICHEL}/series/${ENC_SERIES}`;

/**
 * Display categories. The raw `category` field on posts carries a few near-duplicate
 * labels (concept/concepts, figures/person); they are merged here for browsing.
 * Each entry lists the raw keys it absorbs, a Hebrew name, and an English subtitle.
 */
const CATEGORIES = [
	{ key: 'concepts', raw: ['concept', 'concepts'], he: 'מושגים', en: 'Core Concepts' },
	{ key: 'divine_attributes', raw: ['divine_attributes'], he: 'מדות אלקיות', en: 'Divine Attributes' },
	{ key: 'partzufim', raw: ['partzufim'], he: 'פרצופים', en: 'Divine Countenances' },
	{ key: 'worlds', raw: ['worlds'], he: 'עולמות', en: 'The Worlds' },
	{ key: 'cosmology', raw: ['cosmology'], he: 'קוסמולוגיה', en: 'Cosmic Order' },
	{ key: 'soul', raw: ['soul'], he: 'נפש', en: 'The Soul' },
	{ key: 'avodah', raw: ['avodah'], he: 'עבודה', en: 'Divine Service' },
	{ key: 'mitzvos', raw: ['mitzvos'], he: 'מצוות', en: 'Commandments' },
	{ key: 'holidays', raw: ['holidays'], he: 'מועדים', en: 'Festivals' },
	{ key: 'kelipah', raw: ['kelipah'], he: 'קליפה', en: 'The Husk' },
	{ key: 'eschatology', raw: ['eschatology'], he: 'אחרית הימים', en: 'End of Days' },
	{ key: 'figures', raw: ['figures', 'person'], he: 'דמויות', en: 'Personalities' },
	{ key: 'place', raw: ['place'], he: 'מקומות', en: 'Places' },
	{ key: 'sefer', raw: ['sefer'], he: 'ספרים', en: 'Works' }
];

const RAW_TO_DISPLAY = {};
for (const cat of CATEGORIES) {
	for (const raw of cat.raw) RAW_TO_DISPLAY[raw] = cat.key;
}

const CAT_BY_KEY = {};
for (const cat of CATEGORIES) CAT_BY_KEY[cat.key] = cat;

/** Human section titles for the unit `part` values stored on posts. */
const PART_TITLES = {
	definition: 'Definition',
	development: 'Development',
	distinctions: 'Distinctions',
	corpus_definition: 'From the Maamarim',
	corpus_explanation: 'From the Maamarim',
	quote: 'Quotations',
	related: 'Related Articles',
	sources: 'Sources',
	expansion: 'Corpus Occurrences'
};

/** Encodes one route segment. */
function encodeSegment(value) {
	return encodeURIComponent(String(value ?? ''));
}

/** Escapes text for HTML. */
function escapeHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/** Splits a bilingual title like "Ahavah (אהבה) — Love" into { latin, hebrew, gloss }. */
function splitTitle(title) {
	const text = String(title || '').trim();
	const m = text.match(/^([^(—–-]+?)\s*\(([^)]+)\)\s*[—–-]\s*(.+)$/);
	if (m) return { latin: m[1].trim(), hebrew: m[2].trim(), gloss: m[3].trim(), full: text };
	const m2 = text.match(/^([^(]+?)\s*\(([^)]+)\)\s*$/);
	if (m2) return { latin: m2[1].trim(), hebrew: m2[2].trim(), gloss: '', full: text };
	return { latin: text, hebrew: '', gloss: '', full: text };
}

/** Normalizes an API list wrapper into a plain array. */
function normalizeList(value) {
	if (Array.isArray(value)) return value;
	if (value && Array.isArray(value.success)) return value.success;
	if (value && Array.isArray(value.posts)) return value.posts;
	return [];
}

/** Extracts encyclopedia cross-link slugs like [ency-admur-kav] from text. */
function extractCrossLinks(text) {
	const out = [];
	const seen = new Set();
	const re = /\[\s*(ency-admur-[a-z0-9-]+)\s*\]/g;
	let m;
	while ((m = re.exec(String(text || ''))) !== null) {
		if (!seen.has(m[1])) {
			seen.add(m[1]);
			out.push(m[1]);
		}
	}
	return out;
}

/**
 * Minimal markdown: **bold**, *italic*, `code`, "- "/"• " lists, blank-line paragraphs.
 * [ency-admur-slug] tokens become links when the index knows them.
 */
function mdToHtml(text, indexById) {
	const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
	const blocks = [];
	let list = null;
	function flushList() {
		if (list) {
			blocks.push('<ul class="enc-list">' + list.map(item => `<li>${inline(item)}</li>`).join('') + '</ul>');
			list = null;
		}
	}
	function inline(s) {
		let out = escapeHtml(s);
		out = out.replace(/\[ency-admur-([a-z0-9-]+)\]/g, (mm, slug) => {
			const id = `ency-admur-${slug}`;
			const known = indexById && indexById[id];
			const label = known ? escapeHtml(splitTitle(known.title).latin) : escapeHtml(id);
			return `<a class="enc-inline-link" href="${ENC_BASE}/post/${id}">${label}</a>`;
		});
		out = out.replace(/`([^`]+)`/g, '<code class="enc-code">$1</code>');
		out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
		out = out.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
		return out;
	}
	for (const line of lines) {
		const trimmed = line.trim();
		const bullet = trimmed.match(/^[-•]\s+(.*)$/);
		if (bullet) {
			if (!list) list = [];
			list.push(bullet[1]);
			continue;
		}
		flushList();
		if (!trimmed) continue;
		blocks.push(`<p>${inline(trimmed)}</p>`);
	}
	flushList();
	return blocks.join('\n');
}

function createEncyclopedia($i) {
	/** True when the route addresses the Admur Encyclopedia series. */
	function isEncyclopediaSeries(vars) {
		return vars && vars.series === ENC_SERIES;
	}

	/** Fetches the bounded post index (id, title, category) for the series. */
	async function fetchIndex() {
		const properties = encodeURIComponent(JSON.stringify({ id: true, title: true, postId: true, category: true }));
		const response = await $i.fetchAwtsmoos(
			`/api/social/heichelos/${ENC_HEICHEL}/series/${ENC_SERIES}/posts/details?properties=${properties}`
		);
		if (!response || response.error) throw new Error('index unavailable');
		const posts = normalizeList(response).map(p => ({
			id: p.postId || p.id,
			title: p.title || p.identity?.title || p.id,
			category: RAW_TO_DISPLAY[p.category] || 'concepts'
		})).filter(p => p.id);
		if (!posts.length) throw new Error('empty index');
		return posts;
	}

	/** Fetches one full post record. */
	async function fetchPost(postId) {
		const response = await $i.fetchAwtsmoos(
			`/api/social/heichelos/${ENC_HEICHEL}/series/${ENC_SERIES}/post/${encodeSegment(postId)}`
		);
		if (!response || response.error || !response.units) throw new Error('post unavailable');
		return response;
	}

	/** Shared document head for encyclopedia pages. */
	function documentHead({ title, description, canonical, ogType = 'website', ogTitle = null }) {
		const ogTitleTag = ogTitle || title;
		return `<!doctype html>
<html class="enc-document" lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0d0b08">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1">
<link rel="canonical" href="${escapeHtml(canonical)}">
<link rel="alternate" hreflang="he" href="${escapeHtml(canonical)}">
<link rel="alternate" hreflang="en" href="${escapeHtml(canonical)}">
<meta property="og:type" content="${escapeHtml(ogType)}">
<meta property="og:title" content="${escapeHtml(ogTitleTag)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:site_name" content="Awtsmoos">
<link rel="icon" href="https://awtsmoos.com/api/social/drive/public/awtsfixmvplwhac/repo-image-archive/sha256/1be42a935229f419884743069841806a9550a026df2254562665c97e954d9b3c/asset">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cardo:ital,wght@0,400;0,700;1,400&family=Frank+Ruhl+Libre:wght@400;500;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/heichelos/encyclopedia/encyclopedia.css">
<script>
try {
	var __encTheme = localStorage.getItem('awtsmoos-theme');
	if (__encTheme !== 'light' && __encTheme !== 'dark') __encTheme = 'light';
	document.documentElement.setAttribute('data-theme', __encTheme);
} catch (e) { document.documentElement.setAttribute('data-theme', 'light'); }
</script>`;
	}

	/** Slim site masthead shared by encyclopedia pages. */
	function masthead(activeLabel) {
		return `<header class="enc-masthead">
	<div class="enc-masthead-inner">
		<a class="enc-brand" href="/" aria-label="Awtsmoos home">B"H · Awtsmoos</a>
		<nav class="enc-masthead-nav" aria-label="Encyclopedia">
			<a class="enc-masthead-link${activeLabel === 'browse' ? ' is-active' : ''}" href="${ENC_BASE}">Encyclopedia</a>
			<a class="enc-masthead-link" href="/heichelos/chassidus">Chassidus</a>
		</nav>
	</div>
</header>`;
	}

	function pageFooter() {
		return `<footer class="enc-footer">
	<p class="enc-footer-line">The Admur Encyclopedia — concepts of Chassidus, gathered from the Maamarim.</p>
	<p class="enc-footer-bh">B"H</p>
</footer>`;
	}

	/** Renders the landing page: hero, search, category cards, article browser. */
	async function renderEncyclopediaLanding(vars) {
		const query = (vars && vars.query) || {};
		const activeCategory = typeof query.category === 'string' && CAT_BY_KEY[query.category] ? query.category : '';
		const initialQuery = typeof query.q === 'string' ? query.q.slice(0, 120) : '';

		const posts = await fetchIndex();
		const indexById = {};
		for (const p of posts) indexById[p.id] = p;

		const byCategory = {};
		for (const cat of CATEGORIES) byCategory[cat.key] = [];
		for (const p of posts) byCategory[p.category].push(p);
		for (const key of Object.keys(byCategory)) {
			byCategory[key].sort((a, b) => splitTitle(a.title).latin.localeCompare(splitTitle(b.title).latin));
		}

		const cardsHtml = CATEGORIES.map(cat => {
			const count = byCategory[cat.key].length;
			const isActive = activeCategory === cat.key;
			return `<div class="enc-cat-card${isActive ? ' is-active' : ''}" data-enc-cat="${cat.key}">
	<h3 class="enc-cat-heading">
		<span class="enc-cat-he" lang="he" dir="rtl">${escapeHtml(cat.he)}</span>
		<span class="enc-cat-rule" aria-hidden="true"></span>
		<span class="enc-cat-en">${escapeHtml(cat.en)}</span>
	</h3>
	<span class="enc-cat-count">${count} article${count === 1 ? '' : 's'}</span>
	<a class="enc-card-link" href="${ENC_BASE}?category=${cat.key}">Browse ${escapeHtml(cat.en)} articles →</a>
</div>`;
		}).join('\n');

		// Embedded search index: id, title, display category, definition snippet.
		const searchIndex = posts.map(p => ({ i: p.id, t: p.title, c: p.category }));
		const searchIndexJson = JSON.stringify(searchIndex).replace(/</g, '\\u003c');

		const articleRows = posts
			.slice()
			.sort((a, b) => splitTitle(a.title).latin.localeCompare(splitTitle(b.title).latin))
			.map(p => articleRow(p))
			.join('\n');

		// Content-derived meta description: marquee concepts pulled from the live index.
		const marqueeSlugs = ['ency-admur-ahavah', 'ency-admur-bitachon', 'ency-admur-tzimtzum', 'ency-admur-emunah', 'ency-admur-yirah', 'ency-admur-deveikus'];
		const marquee = [];
		for (const slug of marqueeSlugs) {
			if (indexById[slug] && marquee.length < 4) marquee.push(splitTitle(indexById[slug].title).latin);
		}
		if (marquee.length < 4) {
			for (const p of byCategory.concepts) {
				const latin = splitTitle(p.title).latin;
				if (!marquee.includes(latin) && marquee.length < 4) marquee.push(latin);
			}
		}
		const description = `${posts.length} articles explaining Chassidic concepts — ${marquee.join(', ')}${marquee.length ? ' — ' : ''}from the teachings of the Admur HaZakein, in Hebrew and English.`;

		return `${documentHead({
			title: 'Admur Encyclopedia (אנציקלופדיה) — Chassidic Concepts Explained | Awtsmoos',
			description,
			canonical: `https://awtsmoos.com${ENC_BASE}`,
			ogTitle: 'Admur Encyclopedia — Chassidic Concepts Explained | Awtsmoos'
		})}
</head>
<body>
${masthead('browse')}
<main class="enc-landing">
	<section class="enc-hero">
		<p class="enc-hero-kicker">Chassidus · Reference</p>
		<h1 class="enc-hero-title"><span class="enc-hero-he" lang="he" dir="rtl">אנציקלופדיה</span><span class="enc-hero-en">The Admur Encyclopedia</span></h1>
		<p class="enc-hero-sub">196 articles on the concepts of Chassidus — Hebrew and English, drawn from the Maamarim.</p>
		<form class="enc-search" id="encSearchForm" role="search" action="${ENC_BASE}" method="get">
			<label class="enc-search-label" for="encSearchInput">Search the encyclopedia</label>
			<div class="enc-search-box">
				<input class="enc-search-input" id="encSearchInput" name="q" type="search" autocomplete="off"
					placeholder="Search concepts — e.g. tzimtzum, אהבה, sefirot…" value="${escapeHtml(initialQuery)}" aria-label="Search encyclopedia articles">
				<button class="enc-search-button" type="submit">Search</button>
			</div>
		</form>
	</section>
	<section class="enc-cats" aria-label="Browse by category">
		<h2 class="enc-section-title">Browse by Category</h2>
		<div class="enc-cat-grid" id="encCatGrid">
${cardsHtml}
		</div>
	</section>
	<section class="enc-browser" id="encBrowser" aria-label="Articles">
		<div class="enc-browser-head">
			<h2 class="enc-section-title" id="encBrowserTitle">All Articles</h2>
			<p class="enc-result-count" id="encResultCount" aria-live="polite"></p>
			<button class="enc-clear" id="encClearFilter" type="button" hidden>Clear filter ✕</button>
		</div>
		<div class="enc-article-grid" id="encArticleGrid">
${articleRows}
		</div>
	</section>
</main>
${pageFooter()}
<script>window.__ENC_INDEX__ = ${searchIndexJson};</script>
<script>window.__ENC_CATS__ = ${JSON.stringify(CATEGORIES.map(c => ({ key: c.key, en: c.en, he: c.he }))).replace(/</g, '\\u003c')};</script>
<script>window.__ENC_ACTIVE_CAT__ = ${JSON.stringify(activeCategory)};</script>
<script src="/heichelos/encyclopedia/encyclopedia.js"></script>
</body>
</html>`;
	}

	/** One article row in the landing browser grid. */
	function articleRow(p) {
		const t = splitTitle(p.title);
		const cat = CAT_BY_KEY[p.category];
		const linkText = t.gloss ? `${t.latin} — ${t.gloss}` : t.latin;
		return `<div class="enc-article-row" data-enc-cat="${p.category}">
	<div class="enc-row-main">
		<a class="enc-row-link" href="${ENC_BASE}/post/${encodeSegment(p.id)}">${escapeHtml(linkText)}</a>
		${t.hebrew ? `<div class="enc-row-he" lang="he" dir="rtl">${escapeHtml(t.hebrew)}</div>` : ''}
	</div>
	<span class="enc-badge">${escapeHtml(cat ? cat.en : p.category)}</span>
</div>`;
	}

	/** Renders one article page. */
	async function renderEncyclopediaArticle(vars) {
		const postId = vars.post;
		const [index, post] = await Promise.all([fetchIndex(), fetchPost(postId)]);
		const indexById = {};
		for (const p of index) indexById[p.id] = p;

		const displayCat = RAW_TO_DISPLAY[post.category] || 'concepts';
		const cat = CAT_BY_KEY[displayCat];
		const title = splitTitle(post.title || postId);

		const siblings = index
			.filter(p => p.category === displayCat && p.id !== postId)
			.sort((a, b) => splitTitle(a.title).latin.localeCompare(splitTitle(b.title).latin));
		const inCategory = index
			.filter(p => p.category === displayCat)
			.sort((a, b) => splitTitle(a.title).latin.localeCompare(splitTitle(b.title).latin));
		const pos = inCategory.findIndex(p => p.id === postId);
		const prev = pos > 0 ? inCategory[pos - 1] : null;
		const next = pos >= 0 && pos < inCategory.length - 1 ? inCategory[pos + 1] : null;

		// Explicit cross-links from `related` units, then same-category fill.
		const linked = [];
		const seenLinked = new Set([postId]);
		for (const unit of post.units || []) {
			if (unit.part !== 'related') continue;
			for (const slug of extractCrossLinks(unit.hebrew + '\n' + unit.english)) {
				if (!seenLinked.has(slug) && indexById[slug]) {
					seenLinked.add(slug);
					linked.push(indexById[slug]);
				}
			}
		}
		const related = linked.concat(siblings.filter(p => !seenLinked.has(p.id)).slice(0, Math.max(0, 6 - linked.length))).slice(0, 6);

		const sections = renderUnits(post.units || [], indexById);

		const relatedHtml = related.length
			? `<section class="enc-article-section" aria-label="Related articles">
	<h2 class="enc-article-h2">Related Articles</h2>
	<div class="enc-related-grid">
	${related.map(p => {
		const t = splitTitle(p.title);
		const rc = CAT_BY_KEY[p.category];
		return `<div class="enc-related-card">
			<a class="enc-related-link" href="${ENC_BASE}/post/${encodeSegment(p.id)}">${escapeHtml(t.latin)}</a>
			${t.hebrew ? `<span class="enc-related-he" lang="he" dir="rtl">${escapeHtml(t.hebrew)}</span>` : ''}
			<span class="enc-badge enc-badge-small">${escapeHtml(rc ? rc.en : p.category)}</span>
		</div>`;
	}).join('\n')}
	</div>
</section>`
			: '';

		const navHtml = (prev || next)
			? `<nav class="enc-prevnext" aria-label="More in ${escapeHtml(cat.en)}">
	${prev ? `<div class="enc-prevnext-cell"><span class="enc-prevnext-dir">← Previous</span><a class="enc-prevnext-link" href="${ENC_BASE}/post/${encodeSegment(prev.id)}" rel="prev">${escapeHtml(splitTitle(prev.title).latin)}</a></div>` : '<div class="enc-prevnext-cell"></div>'}
	${next ? `<div class="enc-prevnext-cell enc-next"><span class="enc-prevnext-dir">Next →</span><a class="enc-prevnext-link" href="${ENC_BASE}/post/${encodeSegment(next.id)}" rel="next">${escapeHtml(splitTitle(next.title).latin)}</a></div>` : '<div class="enc-prevnext-cell"></div>'}
</nav>`
			: '';

		const jsonLd = {
			'@context': 'https://schema.org',
			'@type': 'Article',
			headline: post.title,
			url: `https://awtsmoos.com${ENC_BASE}/post/${encodeSegment(postId)}`,
			isPartOf: { '@type': 'Collection', name: 'Admur Encyclopedia' }
		};

		return `${documentHead({
			title: `${title.full} | Awtsmoos`,
			description: `${title.latin}${title.gloss ? ` — ${title.gloss}` : ''} (${title.hebrew}). A bilingual encyclopedia article on ${cat.en} from the Admur Encyclopedia.`,
			canonical: `https://awtsmoos.com${ENC_BASE}/post/${encodeSegment(postId)}`,
			ogType: 'article',
			ogTitle: `${title.full} | Awtsmoos`
		})}
<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
</head>
<body>
${masthead('')}
<main class="enc-article-page">
	<nav class="enc-crumbs" aria-label="Breadcrumb">
		<a class="enc-crumb" href="/">Home</a><span class="enc-crumb-sep" aria-hidden="true">›</span>
		<a class="enc-crumb" href="${ENC_BASE}">Encyclopedia</a><span class="enc-crumb-sep" aria-hidden="true">›</span>
		<a class="enc-crumb" href="${ENC_BASE}?category=${displayCat}">${escapeHtml(cat.en)}</a><span class="enc-crumb-sep" aria-hidden="true">›</span>
		<span class="enc-crumb enc-crumb-current" aria-current="page">${escapeHtml(title.latin)}</span>
	</nav>
	<article class="enc-article">
		<header class="enc-article-head">
			<p class="enc-article-cat"><a class="enc-badge enc-badge-link" href="${ENC_BASE}?category=${displayCat}">${escapeHtml(cat.en)}</a></p>
			<h1 class="enc-article-title">
				<span class="enc-article-title-latin">${escapeHtml(title.latin)}</span>
				${title.hebrew ? `<span class="enc-article-title-he" lang="he" dir="rtl">${escapeHtml(title.hebrew)}</span>` : ''}
			</h1>
			${title.gloss ? `<p class="enc-article-gloss">${escapeHtml(title.gloss)}</p>` : ''}
		</header>
		<div class="enc-article-body">
${sections}
		</div>
	</article>
	${relatedHtml}
	${navHtml}
</main>
${pageFooter()}
</body>
</html>`;
	}

	/** Renders the units array into grouped bilingual sections. */
	function renderUnits(units, indexById) {
		const out = [];
		let currentLabel = null;
		let quoteBuffer = [];
		function flushQuotes() {
			if (!quoteBuffer.length) return;
			out.push('<div class="enc-quotes">' + quoteBuffer.map(q => `<blockquote class="enc-quote">${q}</blockquote>`).join('\n') + '</div>');
			quoteBuffer = [];
		}
		/** Emits a section heading only when its label differs from the previous one. */
		function headingFor(part) {
			flushQuotes();
			const label = PART_TITLES[part];
			if (label && label !== currentLabel) {
				out.push(`<h2 class="enc-article-h2">${escapeHtml(label)}</h2>`);
			}
			currentLabel = label || part;
		}
		for (const unit of units) {
			const part = unit.part || 'development';
			const he = (unit.hebrew || '').trim();
			const en = (unit.english || '').trim();
			if (!he && !en) continue;
			if (part === 'related') {
				// Prose flows without its own heading: the Related Articles cards
				// section below carries the heading. Bracket slugs linkify inline.
				flushQuotes();
				currentLabel = PART_TITLES.related;
				if (en) out.push(`<div class="enc-unit-text">${mdToHtml(en, indexById)}</div>`);
				continue;
			}
			headingFor(part);
			if (part === 'quote') {
				if (he) quoteBuffer.push(`<p class="enc-quote-he" lang="he" dir="rtl">${escapeHtml(he)}</p>`);
				if (en) quoteBuffer.push(mdToHtml(en, indexById));
				continue;
			}
			if (part === 'sources') {
				out.push(`<div class="enc-unit enc-unit-sources">${mdToHtml(en || he, indexById)}</div>`);
				continue;
			}
			out.push('<div class="enc-unit">');
			if (he) out.push(`<p class="enc-he" lang="he" dir="rtl">${escapeHtml(he)}</p>`);
			if (en) out.push(`<div class="enc-unit-text">${mdToHtml(en, indexById)}</div>`);
			out.push('</div>');
		}
		flushQuotes();
		return out.join('\n');
	}

	return { isEncyclopediaSeries, renderEncyclopediaLanding, renderEncyclopediaArticle, ENC_BASE, CATEGORIES };
}

module.exports = createEncyclopedia;
