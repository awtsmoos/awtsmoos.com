// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CommentaryMenu
 * @description
 * The commentary sidebar menu: every classical commentary available for the
 * current page, expandable per verse/segment, with Agree buttons and a way
 * to add your own comment to any verse.
 *
 * Follows the existing comment-system patterns (BlueprintManifestor blueprints,
 * fetchRelevantComments, tab system). Mobile-first.
 */

import { fetchRashiComments, availableCommentaryAliases, hasCommentaryAvailable } from '../commentaryProvider.js?v=commentary-001';
import { fetchRelevantComments } from './fetching.js?v=community-panel-003';
import { nextFrame } from './performance/SmoothScheduler.js';

/**
 * Registry of known commentaries with display metadata.
 * `live`: fully available with English. `hebrew`: Hebrew only for now.
 * `soon`: known work, not yet on the page.
 */
const COMMENTARY_REGISTRY = [
  {
    alias: 'rashi',
    name: 'Rashi',
    fullName: 'Rabbi Shlomo Yitzchaki',
    status: 'live',
    statusLabel: 'English + Hebrew',
    description: 'The classic commentary on the daf',
    fetch: fetchRashiComments,
  },
  {
    alias: 'tosafot',
    name: 'Tosafot',
    fullName: 'The Tosafists',
    status: 'hebrew',
    statusLabel: 'Hebrew only',
    description: 'Dialectical commentary of the French and German schools',
    fetch: null,
  },
  {
    alias: 'ramban',
    name: 'Ramban',
    fullName: 'Rabbi Moshe ben Nachman',
    status: 'hebrew',
    statusLabel: 'Hebrew only',
    description: 'Nachmanides on the daf',
    fetch: null,
  },
  {
    alias: 'rashba',
    name: 'Rashba',
    fullName: 'Rabbi Shlomo ben Aderet',
    status: 'hebrew',
    statusLabel: 'Hebrew only',
    description: 'Chiddushei HaRashba',
    fetch: null,
  },
  {
    alias: 'ritva',
    name: 'Ritva',
    fullName: 'Rabbi Yom Tov ben Avraham Ishbili',
    status: 'hebrew',
    statusLabel: 'Hebrew only',
    description: 'Chiddushei HaRitva',
    fetch: null,
  },
  {
    alias: 'meiri',
    name: 'Meiri',
    fullName: 'Rabbi Menachem Meiri',
    status: 'hebrew',
    statusLabel: 'Hebrew only',
    description: 'Beis HaBechirah',
    fetch: null,
  },
];

/* ------------------------------------------------------------------ */
/* Agree store (localStorage-backed, per comment id)                    */
/* ------------------------------------------------------------------ */

const AGREE_KEY = 'awtsmoos-commentary-agrees-v1';

function loadAgrees() {
  try {
    return JSON.parse(localStorage.getItem(AGREE_KEY) || '{}');
  } catch (_) {
    return {};
  }
}

function saveAgrees(map) {
  try {
    localStorage.setItem(AGREE_KEY, JSON.stringify(map));
  } catch (_) {}
}

export function hasAgreed(commentId) {
  return !!loadAgrees()[commentId];
}

export function toggleAgree(commentId) {
  const map = loadAgrees();
  if (map[commentId]) delete map[commentId];
  else map[commentId] = Date.now();
  saveAgrees(map);
  return !!map[commentId];
}

export function agreeCount(commentId) {
  // Base count from store; real server counts can be merged later.
  return hasAgreed(commentId) ? 1 : 0;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined && text !== null) n.textContent = text;
  return n;
}

function initialFor(name) {
  return String(name || '?').trim().charAt(0).toUpperCase() || '?';
}

/**
 * Groups comments by their verse/ref anchor.
 * @returns {Array<{ref: string, comments: Array}>}
 */
function groupByRef(comments) {
  const groups = new Map();
  for (const c of comments || []) {
    const ref = String(c.ref || c.anchor || 'General').trim() || 'General';
    if (!groups.has(ref)) groups.set(ref, []);
    groups.get(ref).push(c);
  }
  return [...groups.entries()].map(([ref, list]) => ({ ref, comments: list }));
}

function statusBadge(status, label) {
  const b = el('span', `awtsmoos-commentary-status awtsmoos-commentary-status-${status}`, label);
  return b;
}

/* ------------------------------------------------------------------ */
/* Comment card (one commentary unit)                                  */
/* ------------------------------------------------------------------ */

function makeCommentCard(comment, commentary) {
  const card = el('article', 'awtsmoos-commentary-card');
  card.dataset.commentId = comment.id || '';

  // Dibur anchor (the opening words this comments on)
  const dibur = comment.dibur || comment.anchor || '';
  if (dibur) {
    card.appendChild(el('div', 'awtsmoos-commentary-dibur', '❝ ' + dibur));
  }

  // Hebrew text
  if (comment.textHeb) {
    const he = el('p', 'awtsmoos-commentary-hebrew', comment.textHeb);
    he.dir = 'rtl';
    he.lang = 'he';
    card.appendChild(he);
  }

  // English text
  const enText = comment.textEng || comment.text || '';
  if (enText) {
    card.appendChild(el('p', 'awtsmoos-commentary-english', enText));
  }

  // Action row: Agree + Add your comment
  const actions = el('div', 'awtsmoos-commentary-actions');

  const agreeBtn = el(
    'button',
    'awtsmoos-commentary-agree' + (hasAgreed(comment.id) ? ' is-agreed' : ''),
    ''
  );
  agreeBtn.type = 'button';
  agreeBtn.setAttribute('aria-pressed', String(hasAgreed(comment.id)));
  agreeBtn.title = 'Agree with this commentary';
  const updateAgreeLabel = () => {
    const n = agreeCount(comment.id);
    agreeBtn.innerHTML = '';
    agreeBtn.appendChild(el('span', 'awtsmoos-agree-icon', '👍'));
    agreeBtn.appendChild(el('span', 'awtsmoos-agree-label', ' Agree'));
    if (n > 0) agreeBtn.appendChild(el('span', 'awtsmoos-agree-count', ` (${n})`));
  };
  updateAgreeLabel();
  agreeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const now = toggleAgree(comment.id);
    agreeBtn.classList.toggle('is-agreed', now);
    agreeBtn.setAttribute('aria-pressed', String(now));
    updateAgreeLabel();
  });
  actions.appendChild(agreeBtn);

  const replyBtn = el('button', 'awtsmoos-commentary-reply', '💬 Add your comment');
  replyBtn.type = 'button';
  replyBtn.title = 'Add your own comment on this verse';
  replyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openScribeForVerse(comment.ref || '', dibur, commentary);
  });
  actions.appendChild(replyBtn);

  card.appendChild(actions);
  return card;
}

/**
 * Opens the scribe (comment composer) scoped to a verse.
 * Falls back to the sidebar scribe altar when the full composer is absent.
 */
function openScribeForVerse(ref, dibur, commentary) {
  // Prefer a dedicated composer if the app exposes one.
  if (typeof window.openCommentComposer === 'function') {
    window.openCommentComposer({ ref, dibur, commentary: commentary?.alias });
    return;
  }
  // Fallback: scroll to the sidebar scribe altar and prefill context.
  const mount = document.querySelector('.awtsmoos-sidebar-scribe-mount');
  if (mount) {
    mount.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const note = mount.querySelector('.awtsmoos-scribe-verse-note') || (() => {
      const n = el('div', 'awtsmoos-scribe-verse-note');
      mount.prepend(n);
      return n;
    })();
    note.textContent = `Commenting on ${ref || 'this verse'}${dibur ? ` — ❝${dibur}❞` : ''} (${commentary?.name || ''})`;
    const ta = mount.querySelector('textarea');
    if (ta) ta.focus();
  }
}

/* ------------------------------------------------------------------ */
/* Verse group (expandable)                                            */
/* ------------------------------------------------------------------ */

function makeVerseGroup(group, commentary) {
  const wrap = el('div', 'awtsmoos-commentary-verse');
  const head = el('button', 'awtsmoos-commentary-verse-head');
  head.type = 'button';
  head.setAttribute('aria-expanded', 'false');
  head.appendChild(el('span', 'awtsmoos-commentary-verse-ref', group.ref));
  head.appendChild(el('span', 'awtsmoos-commentary-verse-count', `${group.comments.length} comment${group.comments.length === 1 ? '' : 's'}`));
  head.appendChild(el('span', 'awtsmoos-commentary-chevron', '▸'));

  const body = el('div', 'awtsmoos-commentary-verse-body');
  body.hidden = true;

  head.addEventListener('click', () => {
    const open = body.hidden;
    body.hidden = !open;
    head.setAttribute('aria-expanded', String(open));
    head.querySelector('.awtsmoos-commentary-chevron').textContent = open ? '▾' : '▸';
  });

  // Verse-level "add your comment" affordance
  const verseActions = el('div', 'awtsmoos-commentary-verse-actions');
  const addBtn = el('button', 'awtsmoos-commentary-verse-add', '✍️ Comment on this verse');
  addBtn.type = 'button';
  addBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openScribeForVerse(group.ref, '', commentary);
  });
  verseActions.appendChild(addBtn);
  body.appendChild(verseActions);

  for (const c of group.comments) {
    body.appendChild(makeCommentCard(c, commentary));
  }

  wrap.appendChild(head);
  wrap.appendChild(body);
  return wrap;
}

/* ------------------------------------------------------------------ */
/* Commentary row (expandable)                                         */
/* ------------------------------------------------------------------ */

function makeCommentaryRow(commentary) {
  const row = el('div', 'awtsmoos-commentary-row');
  row.dataset.alias = commentary.alias;

  const head = el('button', 'awtsmoos-commentary-head');
  head.type = 'button';
  head.setAttribute('aria-expanded', 'false');

  head.appendChild(el('div', 'awtsmoos-commentary-avatar', initialFor(commentary.name)));

  const copy = el('div', 'awtsmoos-commentary-copy');
  const titleRow = el('div', 'awtsmoos-commentary-title-row');
  titleRow.appendChild(el('span', 'awtsmoos-commentary-name', commentary.name));
  titleRow.appendChild(el('span', 'awtsmoos-commentary-alias', '@' + commentary.alias));
  copy.appendChild(titleRow);
  copy.appendChild(el('div', 'awtsmoos-commentary-fullname', commentary.fullName || ''));
  copy.appendChild(statusBadge(commentary.status, commentary.statusLabel));
  head.appendChild(copy);
  head.appendChild(el('span', 'awtsmoos-commentary-chevron', '▸'));

  const body = el('div', 'awtsmoos-commentary-body');
  body.hidden = true;

  let loaded = false;
  head.addEventListener('click', async () => {
    const open = body.hidden;
    body.hidden = !open;
    head.setAttribute('aria-expanded', String(open));
    head.querySelector('.awtsmoos-commentary-chevron').textContent = open ? '▾' : '▸';
    if (open && !loaded) {
      loaded = true;
      body.appendChild(el('div', 'awtsmoos-commentary-loading', 'Gathering commentary…'));
      try {
        const comments = commentary.fetch ? await commentary.fetch() : [];
        body.innerHTML = '';
        if (!comments.length) {
          const empty = el(
            'div',
            'awtsmoos-commentary-empty',
            commentary.status === 'live'
              ? 'No comments on this passage yet.'
              : `${commentary.name} is not yet translated for this page — Hebrew edition coming soon.`
          );
          body.appendChild(empty);
        } else {
          const groups = groupByRef(comments);
          const note = el('div', 'awtsmoos-commentary-count-note',
            `${comments.length} comments across ${groups.length} verse${groups.length === 1 ? '' : 's'}`);
          body.appendChild(note);
          for (const g of groups) body.appendChild(makeVerseGroup(g, commentary));
        }
      } catch (err) {
        body.innerHTML = '';
        body.appendChild(el('div', 'awtsmoos-commentary-error', 'Could not load commentary.'));
        loaded = false; // allow retry
      }
    }
  });

  row.appendChild(head);
  row.appendChild(body);
  return row;
}

/* ------------------------------------------------------------------ */
/* Menu root                                                           */
/* ------------------------------------------------------------------ */

/**
 * Returns the commentaries relevant to the current page.
 * Rashi is live on Bavli daf pages; others are listed for discovery.
 */
export function commentariesForPage() {
  const live = hasCommentaryAvailable() ? availableCommentaryAliases() : [];
  return COMMENTARY_REGISTRY.map((c) => ({
    ...c,
    status: live.includes(c.alias) ? 'live' : c.status,
    statusLabel: live.includes(c.alias) ? 'English + Hebrew' : c.statusLabel,
  }));
}

/**
 * Renders the full commentary menu into a container element.
 * @param {HTMLElement} mount
 */
export function renderCommentaryMenu(mount) {
  mount.innerHTML = '';
  const section = el('section', 'awtsmoos-commentary-menu');

  const header = el('header', 'awtsmoos-commentary-menu-head');
  header.appendChild(el('h3', '', 'Commentaries'));
  const list = commentariesForPage();
  header.appendChild(el('span', 'awtsmoos-count-pill', String(list.length)));
  section.appendChild(header);

  const sub = el('p', 'awtsmoos-commentary-menu-sub',
    'Classical commentaries on this passage — expand any verse, agree, or add your own insight.');
  section.appendChild(sub);

  const rows = el('div', 'awtsmoos-commentary-rows');
  for (const c of list) rows.appendChild(makeCommentaryRow(c));
  section.appendChild(rows);

  mount.appendChild(section);
  return section;
}

/**
 * Mounts the commentary menu at the top of the sidebar commentator list.
 * Call after the sidebar tab content exists.
 */
export async function mountCommentaryMenu() {
  await nextFrame();
  // Avoid duplicates on re-render.
  if (document.querySelector('.awtsmoos-commentary-menu')) return;
  const listHost = document.querySelector('.keepers-assembly.awtsmoos-students-list');
  const mount = el('div', 'awtsmoos-commentary-menu-mount');
  renderCommentaryMenu(mount);
  if (listHost && listHost.parentNode) {
    listHost.parentNode.insertBefore(mount, listHost);
  } else {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.prepend(mount);
  }
}
