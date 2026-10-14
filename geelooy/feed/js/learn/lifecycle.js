// B"H
/**
 * @module LifecycleGuide
 * @description
 * B"H — Yaakov 2026-10-14 (TRACK I): the Lifecycle Guide. A gentle guide
 * through Jewish life milestones: birth, bar/bat mitzvah, marriage, and
 * mourning. Each topic has editor slots for what to expect, customs, and
 * relevant texts — plus a standing note to consult one's own rabbi.
 *
 * CONTENT RULE (standing): SCAFFOLD ONLY. No halachic guidance is invented
 * here. Sensitive topics (especially mourning) are handled with care and
 * dignity: soft language, no timers, no checklists presented as obligations.
 *
 * Mounts via `mount(el, ctx)`; `initCardHooks()` is a no-op.
 */

import { icon, escapeHtml } from '../icons.js';

/* B"H — EDITORS: human-written content per topic key:
   { overview, whatToExpect, customs, texts: [{title, url}] }.
   Keep the mourning topic gentle — see the tone note in renderTopic. */
const TOPIC_CONTENT = {};

const TOPICS = [
	{
		key: 'birth', name: 'Birth', hebrew: 'לידה',
		blurb: 'Welcoming a new soul — bris, naming, and the first days',
		sensitive: false,
	},
	{
		key: 'bar-bat-mitzvah', name: 'Bar / Bat Mitzvah', hebrew: 'בר / בת מצוה',
		blurb: 'Stepping into mitzvos — preparation and celebration',
		sensitive: false,
	},
	{
		key: 'marriage', name: 'Marriage', hebrew: 'נישואין',
		blurb: 'Building a Jewish home — from engagement to the chuppah',
		sensitive: false,
	},
	{
		key: 'mourning', name: 'Mourning', hebrew: 'אבילות',
		blurb: 'When someone we love is gone — walking through loss with dignity',
		sensitive: true,
	},
];

function editorSlot(label, hint) {
	return `
		<div class="lti-slot">
			<span class="lti-slot-label">${escapeHtml(label)}</span>
			<p>${escapeHtml(hint)}</p>
		</div>`;
}

function topicBody(topic, c) {
	const texts = Array.isArray(c.texts) ? c.texts : [];
	return `
		${topic.sensitive ? `
			<div class="lti-gentle">
				<p>Take your time here. There is no rush, no test, and no wrong way to grieve.
				This guide is here when you are ready for it — and only then.</p>
			</div>` : ''}
		<div class="lti-card">
			<h4>Overview</h4>
			${c.overview ? `<p>${escapeHtml(c.overview)}</p>` : editorSlot('Overview',
				`Editor: a warm, plain-language overview of ${topic.name} — what it is and why it matters.`)}
		</div>
		<div class="lti-card">
			<h4>What to expect</h4>
			${c.whatToExpect ? `<p>${escapeHtml(c.whatToExpect)}</p>` : editorSlot('What to expect',
				`Editor: walk a newcomer through ${topic.name} step by step — what happens, in what order, who is involved. Descriptive, never prescriptive.`)}
		</div>
		<div class="lti-card">
			<h4>Customs</h4>
			${c.customs ? `<p>${escapeHtml(c.customs)}</p>` : editorSlot('Customs',
				`Editor: the customs around ${topic.name}. Note where communities differ, and always point readers to their own rabbi for guidance.`)}
		</div>
		<div class="lti-card">
			<h4>Relevant texts</h4>
			${texts.length ? `<ul class="lti-list">${texts.map(t => `
				<li><a class="lti-list-row" style="text-decoration:none" href="${escapeHtml(t.url || '#')}" target="_blank" rel="noopener">
					${icon('book')}<span class="lti-list-main"><span class="lti-list-title">${escapeHtml(t.title || 'Text')}</span></span>
				</a></li>`).join('')}</ul>`
				: editorSlot('Relevant texts', `Editor: link the texts a person should read for ${topic.name}.`)}
		</div>
		<div class="lti-gentle">
			<p>Customs vary between communities and families. For personal guidance,
			speak with your own rabbi — this guide orients; it does not rule.</p>
		</div>`;
}

export async function mount(el, ctx) {
	el.classList.add('lti');

	function renderIndex() {
		el.innerHTML = `
			<div class="lti-head">
				<div>
					<h3>${icon('users', 'feed-ic')} Lifecycle Guide</h3>
					<p>Life's milestones, walked through gently — what to expect, and where to learn more.</p>
				</div>
			</div>
			<div class="lti-grid">
				${TOPICS.map(t => `
					<button type="button" class="lti-tile" data-topic="${escapeHtml(t.key)}">
						<span class="lti-tile-he">${escapeHtml(t.hebrew)}</span>
						<span class="lti-tile-title">${escapeHtml(t.name)}</span>
						<span class="lti-tile-sub">${escapeHtml(t.blurb)}</span>
					</button>`).join('')}
			</div>`;
		el.querySelectorAll('[data-topic]').forEach(btn => {
			btn.addEventListener('click', () => {
				const topic = TOPICS.find(t => t.key === btn.dataset.topic);
				if (topic) renderTopic(topic);
			});
		});
	}

	function renderTopic(topic) {
		const c = TOPIC_CONTENT[topic.key] || {};
		el.innerHTML = `
			<div class="lti-head">
				<div>
					<h3><span class="lti-he" style="font-size:22px">${escapeHtml(topic.hebrew)}</span> ${escapeHtml(topic.name)}</h3>
					<p>${escapeHtml(topic.blurb)}</p>
				</div>
				<button type="button" class="lti-back" data-topic-back>${icon('chevronUp')} All milestones</button>
			</div>
			${topicBody(topic, c)}`;
		el.querySelector('[data-topic-back]').addEventListener('click', renderIndex);
	}

	renderIndex();
}

export function initCardHooks() {
	/* No per-card hooks for the guide. */
}
