//B"H
/**
 * @module postApprovalPanel
 * @description
 * Renders the submitted-post queue for heichel guardians. It stays separate
 * from role settings so each vessel remains small and testable.
 */

import {
    approveSubmittedPost,
    denySubmittedPost,
    getSubmittedPosts
} from '../api/postApprovals.js';

export function mountPostApprovalPanel({ root, heichelId, aliasId }) {
    if (!root || !heichelId || !aliasId) return null;

    const panel = document.createElement('section');
    panel.className = 'heichel-post-approval-panel';

    const header = document.createElement('div');
    header.className = 'heichel-post-approval-header';

    const title = document.createElement('h3');
    title.textContent = 'Submitted Posts';
    header.appendChild(title);

    const refresh = document.createElement('button');
    refresh.type = 'button';
    refresh.textContent = 'Refresh';
    header.appendChild(refresh);
    panel.appendChild(header);

    const list = document.createElement('div');
    list.className = 'heichel-post-approval-list';
    panel.appendChild(list);

    const status = document.createElement('div');
    status.className = 'heichel-post-approval-status';
    panel.appendChild(status);

    root.appendChild(panel);

    const ctx = { heichelId, aliasId, list, status };
    refresh.onclick = () => loadSubmittedPosts(ctx);
    loadSubmittedPosts(ctx);
    return panel;
}

async function loadSubmittedPosts(ctx) {
    ctx.status.textContent = 'Loading submitted posts...';
    const response = await getSubmittedPosts({ heichelId: ctx.heichelId });
    const posts = response?.success && typeof response.success === 'object'
        ? Object.values(response.success)
        : [];
    renderSubmittedPosts(ctx, posts);
    ctx.status.textContent = posts.length ? `${posts.length} submitted post${posts.length === 1 ? '' : 's'}.` : 'No submitted posts.';
}

function renderSubmittedPosts(ctx, posts) {
    ctx.list.replaceChildren();
    if (!posts.length) {
        const empty = document.createElement('div');
        empty.className = 'heichel-post-approval-empty';
        empty.textContent = 'Nothing is waiting for approval.';
        ctx.list.appendChild(empty);
        return;
    }

    posts.forEach(post => {
        const card = document.createElement('article');
        card.className = 'heichel-post-approval-card';

        const title = document.createElement('h4');
        title.textContent = post.title || post.id || 'Untitled post';
        card.appendChild(title);

        const meta = document.createElement('div');
        meta.className = 'heichel-post-approval-meta';
        const author = post.aliasId || 'unknown';
        const authorLink = document.createElement('a');
        authorLink.href = `/@${encodeURIComponent(author)}`;
        authorLink.textContent = `@${author}`;
        meta.appendChild(authorLink);
        const messageLink = document.createElement('a');
        messageLink.href = `/email/?to=${encodeURIComponent(author)}`;
        messageLink.textContent = 'Message';
        messageLink.className = 'heichel-post-approval-message';
        meta.appendChild(messageLink);
        const series = document.createElement('span');
        series.textContent = `series ${post.seriesId || 'root'}`;
        meta.appendChild(series);
        card.appendChild(meta);

        if (post.content) {
            const preview = document.createElement('p');
            preview.className = 'heichel-post-approval-preview';
            preview.textContent = String(post.content).slice(0, 220);
            card.appendChild(preview);
        }

        const actions = document.createElement('div');
        actions.className = 'heichel-post-approval-actions';
        actions.appendChild(actionButton('Approve', async () => {
            ctx.status.textContent = `Approving ${post.id}...`;
            const result = await approveSubmittedPost({ heichelId: ctx.heichelId, aliasId: ctx.aliasId, postId: post.id });
            ctx.status.textContent = result?.success ? 'Post approved.' : (result?.error?.message || 'Could not approve post.');
            if (result?.success) loadSubmittedPosts(ctx);
        }));
        actions.appendChild(actionButton('Deny', async () => {
            ctx.status.textContent = `Denying ${post.id}...`;
            const result = await denySubmittedPost({ heichelId: ctx.heichelId, aliasId: ctx.aliasId, postId: post.id });
            ctx.status.textContent = result?.success ? 'Post denied.' : (result?.error?.message || 'Could not deny post.');
            if (result?.success) loadSubmittedPosts(ctx);
        }, 'danger'));
        card.appendChild(actions);

        ctx.list.appendChild(card);
    });
}

function actionButton(label, onClick, tone = 'primary') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `heichel-post-approval-action ${tone}`;
    button.textContent = label;
    button.onclick = onClick;
    return button;
}
