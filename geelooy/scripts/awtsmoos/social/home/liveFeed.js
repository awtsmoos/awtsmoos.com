// B"H
/**
 * @module HomeLiveFeed
 * @description
 * Chapter 21: The living feed learned where live posts actually open.
 *
 * The home screen asks the online social API for the selected river, renders
 * returned items, and sends post cards to the root series when the feed gives a
 * postId without a seriesId. Empty network answers are labeled honestly.
 */
import { getFeedHome, getTrendingFeed, getDiscoverFeed } from '/heichelos/heichel/modules/api/platform.js';

const routes = {
  forYou: () => getFeedHome({ limit: 12 }),
  following: () => getDiscoverFeed({ limit: 12 }),
  trending: () => getTrendingFeed({ limit: 12 })
};

const labels = { forYou: 'For You', following: 'Following', trending: 'Trending' };

initHomeLiveFeed();

function initHomeLiveFeed() {
  const list = document.querySelector('[data-home-feed]');
  const tabs = [...document.querySelectorAll('[data-feed-mode]')];
  if (!list || tabs.length === 0) return;
  tabs.forEach(tab => tab.addEventListener('click', () => activate(tab.dataset.feedMode, list, tabs)));
  activate('forYou', list, tabs);
}

async function activate(mode, list, tabs) {
  tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.feedMode === mode));
  list.dataset.feedState = 'loading';
  list.replaceChildren(statusCard(`Loading ${labels[mode] || 'feed'} from the live network...`));
  const response = await safeLoad(mode);
  const items = extractItems(response);
  list.dataset.feedState = items.length ? 'ready' : 'empty';
  list.replaceChildren(...(items.length ? items.map(renderItem) : [emptyCard(mode, response)]));
}

async function safeLoad(mode) {
  try {
    return await (routes[mode] || routes.forYou)();
  } catch (error) {
    console.error('B"H home live feed failed', error);
    return null;
  }
}

function extractItems(response) {
  const raw = response?.success?.items || response?.success || response?.items || response || [];
  return Array.isArray(raw) ? raw.filter(Boolean).slice(0, 12) : [];
}

function renderItem(item) {
  const title = item.title || item.name || item.postId || item.id || 'Untitled post';
  const author = item.author || item.aliasId || item.heichelId || 'Geelooy';
  const summary = item.description || item.excerpt || item.content || item.text || title;
  const article = element('article', 'home-post-card is-live-post');
  article.append(authorRow(author, item.timestamp || item.createdAt || item.updatedAt || 'live'));
  article.append(element('p', '', trim(summary, 180)));
  article.append(actionsRow(hrefFor(item)));
  return article;
}

function hrefFor(item) {
  if (item.href || item.url) return item.href || item.url;
  const postId = item.postId || item.id;
  const heichelId = item.heichelId;
  const seriesId = item.seriesId || 'root';
  if (heichelId && postId) return `/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/${encodeURIComponent(postId)}`;
  if (heichelId) return `/heichelos/${encodeURIComponent(heichelId)}`;
  return '/heichelos';
}

function authorRow(author, time) {
  const row = element('div', 'post-author');
  row.append(element('span'), element('strong', '', String(author)), element('small', '', String(time)));
  return row;
}

function actionsRow(href) {
  const footer = element('footer', 'home-live-actions');
  footer.append(link('Open', href), link('Create post', '/heichelos/submit'));
  return footer;
}

function emptyCard(mode, response) {
  const message = response ? `No live ${labels[mode] || 'feed'} posts returned yet.` : 'The live feed could not be reached.';
  const article = element('article', 'home-post-card home-feed-empty');
  article.append(element('p', '', message), actionsRow('/heichelos'));
  return article;
}

function statusCard(message) {
  const article = element('article', 'home-post-card home-feed-loading');
  article.append(element('p', '', message));
  return article;
}

function element(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function link(text, href) {
  const a = element('a', '', text);
  a.href = href;
  return a;
}

function trim(value, limit) {
  const text = String(value).replace(/\s+/g, ' ').trim();
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}
