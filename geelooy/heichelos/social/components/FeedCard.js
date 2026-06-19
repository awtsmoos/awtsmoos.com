// B"H
/**
 * @module FeedCard
 * @description
 * Chapter 54: The card stops guessing and receives the envelope.
 * Every post, question, answer, and series-like spark can now reveal title,
 * author, heichel, series, sections, assets, and counts through one face.
 */
import { h } from './render.js';

export function FeedCard(post = {}) {
    const media = (post.assets || []).map(asset => asset.label || asset.kind);
    const sectionCount = (post.sections || []).length;

    return h('article', { class: 'awt-card', 'data-content-id': post.contentId || '' }, [
        h('div', { class: 'awt-card-head' }, [
            post.authorAlias || 'Anonymous alias',
            post.heichelId || 'No heichel'
        ]),
        h('h3', {}, [post.title || 'Untitled revelation']),
        h('p', {}, [post.summary || 'A vessel waits for words.']),
        h('div', { class: 'awt-media-row' }, [
            ...media.map(item => h('span', { class: 'awt-media-pill' }, [item])),
            sectionCount ? h('span', { class: 'awt-media-pill' }, [`${sectionCount} section${sectionCount === 1 ? '' : 's'}`]) : ''
        ].filter(Boolean)),
        h('div', { class: 'awt-card-actions' }, [
            h('button', { class: 'awt-btn' }, [`Comment (${post.counts?.comments || 0})`]),
            h('button', { class: 'awt-btn' }, ['Save']),
            h('button', { class: 'awt-btn' }, ['Share'])
        ])
    ]);
}
