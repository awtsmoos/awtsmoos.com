// B"H
import { renderBlueprint } from '../components/render.js';
import { FeedView } from '../views/FeedView.js';
import { createSocialApi } from '../api/index.js';
import { addSection, createDraft, toPostPayload } from '../composer/composerDraft.js';

export function bootSocialRevamp(target = document.body, data = {}, options = {}) {
    const doc = target.ownerDocument || document;
    const api = options.api || createSocialApi({ fetcher: options.fetcher || globalThis.fetch?.bind(globalThis) });
    const state = {
        data: hasContent(data) ? data : loadingData(),
        draft: createDraft({ aliasId: readAlias(), profileHeichelId: readAlias(), ...(data.draft || {}) }),
        status: '',
        statusKind: '',
        loading: !hasContent(data)
    };

    function commit() {
        const root = renderBlueprint(FeedView(state.data, actions()), doc);
        target.innerHTML = '';
        target.appendChild(root);
        return root;
    }

    function actions() {
        return {
            draft: state.draft,
            status: state.status,
            statusKind: state.statusKind,
            onRefresh: event => { event?.preventDefault?.(); load(); },
            onAddSection: event => {
                event?.preventDefault?.();
                state.draft = addSection(state.draft, { title: '', body: '' });
                commit();
            },
            onSubmit: submitComposer,
            onComment: post => focusComposer(doc, post),
            onSave: post => savePost(post),
            onShare: post => sharePost(post)
        };
    }

    const root = commit();
    if (!hasContent(data)) load();
    return root;

    async function load() {
        state.loading = true;
        state.status = 'Loading social feed...';
        state.statusKind = 'loading';
        commit();
        const loaded = await loadSocialHome(api);
        state.loading = false;
        if (loaded.error) {
            state.status = loaded.error;
            state.statusKind = 'error';
            state.data = errorData(loaded.error);
        } else {
            state.status = loaded.meta;
            state.statusKind = 'success';
            state.data = loaded.data;
        }
        commit();
    }

    async function submitComposer(event) {
        event?.preventDefault?.();
        const form = event?.currentTarget;
        const fields = form ? new FormData(form) : null;
        state.draft = createDraft({
            ...state.draft,
            title: fields?.get('title') || state.draft.title,
            verses: state.draft.verses.map(verse => ({
                ...verse,
                title: fields?.get(`${verse.verseSection}-title`) || verse.title,
                body: fields?.get(`${verse.verseSection}-body`) || (verse.verseSection === 'root' ? fields?.get('root') : verse.body)
            }))
        });
        state.status = 'Publishing...';
        state.statusKind = 'loading';
        commit();
        const result = await api.posts.create(toApiPostPayload(state.draft));
        if (!result.ok) {
            state.status = result.error || 'Post could not be published.';
            state.statusKind = 'error';
            commit();
            return;
        }
        state.status = 'Published.';
        state.statusKind = 'success';
        await load();
    }
}

export async function loadSocialHome(api) {
    const [feed, activity, notifications] = await Promise.all([
        api.feed.global({ limit: 20 }),
        api.graph.activity({ scope: 'all', limit: 20 }),
        api.graph.notifications({ unread: true, limit: 10 })
    ]);
    const okResults = [feed, activity, notifications].filter(result => result.ok);
    if (!okResults.length) return { error: feed.error || activity.error || notifications.error || 'Social APIs are unavailable.' };
    const posts = normalizeResultList(feed.data);
    const comments = normalizeComments(activity.data);
    const unread = normalizeResultList(notifications.data).length;
    return {
        data: {
            profile: {
                name: readAlias() || 'Awtsmoos Social',
                bio: 'Live feed, publishing, comments, notifications, and discovery from /api/social.',
                posts: posts.length,
                comments: comments.length,
                heichelos: countHeichelos(posts)
            },
            posts,
            comments,
            notifications: { unreadCount: unread, groups: normalizeResultList(notifications.data) }
        },
        meta: `Loaded ${posts.length} posts, ${comments.length} comments, ${unread} unread signals.`
    };
}

function toApiPostPayload(draft) {
    const payload = toPostPayload(draft);
    return { ...payload, sections: payload.sections.toString(), assets: payload.assets };
}

function normalizeResultList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.posts)) return data.posts;
    if (Array.isArray(data?.success)) return data.success;
    if (Array.isArray(data?.results)) return data.results;
    return data ? [data] : [];
}

function normalizeComments(data) {
    return normalizeResultList(data).filter(item => item?.kind === 'comment' || item?.commentId || item?.text || item?.body).map(item => ({
        author: item.author || item.aliasId || item.actor || 'Alias',
        text: item.text || item.body || item.summary || 'Activity updated.',
        replies: item.replies || []
    }));
}

function countHeichelos(posts) {
    return new Set(posts.map(post => post.heichelId || post.heichel).filter(Boolean)).size;
}

function hasContent(data) {
    return Array.isArray(data.posts) || Array.isArray(data.items) || data.profile || Array.isArray(data.comments);
}

function readAlias() {
    return globalThis.curAlias || new URLSearchParams(globalThis.location?.search || '').get('alias') || '';
}

function loadingData() {
    return { profile: { name: 'Awtsmoos Social', bio: 'Loading /api/social...' }, posts: [], comments: [] };
}

function errorData(error) {
    return { profile: { name: 'Awtsmoos Social', bio: error }, posts: [], comments: [] };
}

function focusComposer(doc, post) {
    const composer = doc.getElementById?.('composer');
    composer?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    const title = composer?.querySelector?.('input[name="title"]');
    if (title && post?.title) title.value = `Re: ${post.title}`;
    title?.focus?.();
}

function savePost(post) {
    const key = 'awtsmoos-social-saved';
    const id = post.contentId || post.id || post.title || Date.now();
    const storage = safeLocalStorage();
    const stored = JSON.parse(storage?.getItem(key) || '[]');
    if (!stored.includes(id)) stored.push(id);
    storage?.setItem(key, JSON.stringify(stored));
    return stored;
}

async function sharePost(post) {
    const url = post.url || (globalThis.location?.href || '');
    const title = post.title || 'Awtsmoos Social';
    if (globalThis.navigator?.share) return globalThis.navigator.share({ title, url });
    if (globalThis.navigator?.clipboard) return globalThis.navigator.clipboard.writeText(url);
}

function safeLocalStorage() {
    try { return globalThis.localStorage || null; } catch { return null; }
}
