// B"H
/**
 * @module CardSocialActions
 * @description
 * Tiny card-level social vessels for comments, answers, reposts, references,
 * and share links. The card stays the first screen; the actions are compact
 * and send real requests through the existing API layer.
 */

import * as api from '../../api.js';
import { notify } from './toast.js';

function askText(label, fallback = '') {
    if (window.AwtsmoosPrompt?.go) {
        return window.AwtsmoosPrompt.go({ headerTxt: label, value: fallback });
    }
    return Promise.resolve(window.prompt(label, fallback));
}

function postEntity(item, appState) {
    const contentType = item.contentType || item.postType || 'post';
    return {
        type: contentType === 'question' || contentType === 'answer' ? contentType : 'post',
        id: item.id || item.postId,
        heichelId: appState.heichelId,
        seriesId: appState.currentSeries,
        aliasId: item.aliasId || item.author || ''
    };
}

function aliasEntity() {
    const aliasId = currentAlias();
    return {
        type: 'alias',
        id: aliasId,
        aliasId
    };
}

function currentAlias() {
    return window.curAlias || window.curAliasId || window.awtsmoosAlias || '';
}

function requireAlias(label) {
    const aliasId = currentAlias();
    if (aliasId) return aliasId;
    notify(`Sign in before ${label.toLowerCase()}.`, 'error');
    return '';
}

async function runAction(label, action) {
    try {
        notify(`${label}...`, 'info');
        const result = await action();
        if (result?.error) {
            notify(result.error.message || result.message || `${label} resisted.`, 'error');
            return result;
        }
        notify(`${label} complete.`, 'success');
        return result;
    } catch (error) {
        notify(error.message || `${label} failed.`, 'error');
        return { error };
    }
}

async function addComment(item, appState) {
    const aliasId = requireAlias('Comment');
    if (!aliasId) return null;
    const content = await askText('Comment');
    if (!content) return null;
    return await runAction('Comment', () => api.createComment({
        heichelId: appState.heichelId,
        postId: item.id || item.postId,
        aliasId,
        seriesId: appState.currentSeries,
        content
    }));
}

async function addAnswer(item, appState) {
    const aliasId = requireAlias('Answer');
    if (!aliasId) return null;
    const content = await askText('Answer');
    if (!content) return null;
    const answerId = `answer_${Date.now()}`;
    return await runAction('Answer', () => api.createAnswer({
        heichelId: appState.heichelId,
        questionId: item.id || item.postId,
        aliasId,
        answerId,
        title: `Answer to ${item.title || item.id || item.postId}`,
        content,
        seriesId: appState.currentSeries
    }));
}

async function graphIntent(item, appState, mode) {
    const aliasId = requireAlias(mode);
    if (!aliasId) return null;
    const note = mode === 'Reference' ? await askText('Reference note', '') : '';
    if (mode === 'Reference' && note === null) return null;
    const payload = {
        aliasId,
        from: aliasEntity(),
        to: postEntity(item, appState),
        note,
        excerpt: item.title || item.content || ''
    };
    const runner = mode === 'Repost' ? api.repostEntity : mode === 'Reference' ? api.referenceEntity : api.shareEntity;
    return await runAction(mode, () => runner(payload));
}

function actionButton(label, handler) {
    return {
        tag: 'button',
        attr: { type: 'button', class: 'card-social-action', title: label },
        children: [label],
        events: {
            click: async event => {
                event.preventDefault();
                event.stopPropagation();
                await handler();
            }
        }
    };
}

export function socialActionBlueprints(item, appState) {
    if (!item || !appState?.heichelId || !(item.id || item.postId)) return [];
    const contentType = item.contentType || item.postType || 'post';
    const actions = [
        actionButton('Comment', () => addComment(item, appState)),
        actionButton('Repost', () => graphIntent(item, appState, 'Repost')),
        actionButton('Reference', () => graphIntent(item, appState, 'Reference')),
        actionButton('Share', () => graphIntent(item, appState, 'Share'))
    ];
    if (contentType === 'question') {
        actions.splice(1, 0, actionButton('Answer', () => addAnswer(item, appState)));
    }
    return [{
        tag: 'div',
        attr: { class: 'card-social-actions', 'data-social-actions': item.id || item.postId },
        children: actions
    }];
}
