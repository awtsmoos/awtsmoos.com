// B"H
/**
 * @module CardSocialActions
 * @description
 * Chapter 2: The Awtsmoos folds a social storm into one disciplined menu.
 *
 * The card surface is no longer a noisy market of scattered buttons. A single
 * three-dot gate opens a compact `card-social-actions` vessel. Inside it, every
 * action is a small spark with a known route, a required alias check, and a
 * safe handler. The infinite light stays ordered: comment, answer, repost,
 * reference, and share become data first, DOM second, and panic never.
 */

import * as api from '../../api.js';
import { notify } from './toast.js';

/**
 * Ask for short user text through the Awtsmoos prompt when available.
 *
 * @param {string} label Prompt title.
 * @param {string} [fallback=''] Starting value.
 * @returns {Promise<string|null>} User text, empty text, or null if cancelled.
 */
function askText(label, fallback = '') {
    if (window.AwtsmoosPrompt?.go) {
        return window.AwtsmoosPrompt.go({ headerTxt: label, value: fallback });
    }
    return Promise.resolve(window.prompt(label, fallback));
}

/**
 * Find the current alias from the legacy browser globals.
 *
 * @returns {string} Active alias id or an empty string.
 */
function currentAlias() {
    return window.curAlias || window.curAliasId || window.awtsmoosAlias || '';
}

/**
 * Shape the logged-in alias as a graph entity.
 *
 * @returns {{type:string,id:string,aliasId:string}} Alias graph vessel.
 */
function aliasEntity() {
    const aliasId = currentAlias();
    return { type: 'alias', id: aliasId, aliasId };
}

/**
 * Shape a post/question/answer card as a graph entity.
 *
 * @param {object} item Card data.
 * @param {object} appState Active heichel state.
 * @returns {object} Graph entity payload.
 */
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

/**
 * Require an alias before a write action can leave the browser.
 *
 * @param {string} label Human action label.
 * @returns {string} Alias id or empty string.
 */
function requireAlias(label) {
    const aliasId = currentAlias();
    if (aliasId) return aliasId;
    notify(`Sign in before ${label.toLowerCase()}.`, 'error');
    return '';
}

/**
 * Wrap one social write in user feedback.
 *
 * @param {string} label Human action label.
 * @param {Function} action Async action runner.
 * @returns {Promise<object|null>} API result or error vessel.
 */
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

/**
 * Create a comment on the card's post.
 *
 * @param {object} item Card data.
 * @param {object} appState Active heichel state.
 * @returns {Promise<object|null>} API result or null.
 */
async function addComment(item, appState) {
    const aliasId = requireAlias('Comment');
    if (!aliasId) return null;
    const content = await askText('Comment');
    if (!content) return null;
    return runAction('Comment', () => api.createComment({
        heichelId: appState.heichelId,
        postId: item.id || item.postId,
        aliasId,
        seriesId: appState.currentSeries,
        content
    }));
}

/**
 * Create an answer beneath a question card.
 *
 * @param {object} item Question card data.
 * @param {object} appState Active heichel state.
 * @returns {Promise<object|null>} API result or null.
 */
async function addAnswer(item, appState) {
    const aliasId = requireAlias('Answer');
    if (!aliasId) return null;
    const content = await askText('Answer');
    if (!content) return null;
    const answerId = `answer_${Date.now()}`;
    return runAction('Answer', () => api.createAnswer({
        heichelId: appState.heichelId,
        questionId: item.id || item.postId,
        aliasId,
        answerId,
        title: `Answer to ${item.title || item.id || item.postId}`,
        content,
        seriesId: appState.currentSeries
    }));
}

/**
 * Send a graph intent through the social content API.
 *
 * @param {object} item Card data.
 * @param {object} appState Active heichel state.
 * @param {'Repost'|'Reference'|'Share'} mode Graph action label.
 * @returns {Promise<object|null>} API result or null.
 */
async function graphIntent(item, appState, mode) {
    const aliasId = requireAlias(mode);
    if (!aliasId) return null;
    const note = mode === 'Reference' ? await askText('Reference note', '') : '';
    if (mode === 'Reference' && note === null) return null;
    const runners = { Repost: api.repostEntity, Reference: api.referenceEntity, Share: api.shareEntity };
    return runAction(mode, () => runners[mode]({
        aliasId,
        from: aliasEntity(),
        to: postEntity(item, appState),
        note,
        excerpt: item.title || item.content || ''
    }));
}

/**
 * Build one compact card menu button.
 *
 * @param {string} label Button text.
 * @param {Function} handler Click handler.
 * @returns {object} Blueprint consumed by ScribeOfManifestation.
 */
function actionButton(label, handler) {
    return {
        tag: 'button',
        attr: { type: 'button', class: 'card-menu-action card-social-action', title: label, role: 'menuitem' },
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

/**
 * @function socialActionBlueprints
 * @param {object} item The purified post-ish card vessel.
 * @param {object} appState The active heichel state.
 * @returns {Array<object>} Menu item blueprints for the three-dot menu.
 */
export function socialActionBlueprints(item, appState) {
    if (!item || !appState?.heichelId || !(item.id || item.postId)) return [];
    const contentType = item.contentType || item.postType || 'post';
    const actions = [
        actionButton('Comment', () => addComment(item, appState)),
        actionButton('Repost', () => graphIntent(item, appState, 'Repost')),
        actionButton('Reference', () => graphIntent(item, appState, 'Reference')),
        actionButton('Share', () => graphIntent(item, appState, 'Share'))
    ];
    if (contentType === 'question') actions.splice(1, 0, actionButton('Answer', () => addAnswer(item, appState)));
    return [{ tag: 'div', attr: { class: 'card-social-actions', role: 'group' }, children: actions }];
}
