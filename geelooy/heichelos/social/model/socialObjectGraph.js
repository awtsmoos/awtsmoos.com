// B"H
/**
 * @module SocialObjectGraph
 * @description
 * Chapter 102: The screen is no longer a list; it is a galaxy engine.
 * Posts, comments, answers, verse cuts, attachments, series, and references
 * are normalized into linked vessels so the UI can show every relation alive.
 */
import { AttachmentKinds, CommentKinds, PostKinds, ReferenceKinds, SectionKinds, assertKnownKind } from './kinds.js';

export function createPost(input = {}) {
    const id = input.id || `post_${Date.now()}`;
    const kind = assertKnownKind(PostKinds, input.kind || 'essay', 'post');
    return {
        id,
        kind,
        title: input.title || '',
        caption: input.caption || '',
        body: input.body || '',
        author: input.author || null,
        seriesIds: input.seriesIds || [],
        sections: normalizeSections(input.sections || []),
        attachments: normalizeAttachments(input.attachments || []),
        references: normalizeReferences(input.references || []),
        comments: normalizeComments(input.comments || []),
        copiedFrom: input.copiedFrom || null,
        meta: input.meta || {}
    };
}

export function createSeries(input = {}) {
    return {
        id: input.id || `series_${Date.now()}`,
        title: input.title || '',
        postIds: input.postIds || [],
        subseriesIds: input.subseriesIds || [],
        references: normalizeReferences(input.references || []),
        meta: input.meta || {}
    };
}

export function normalizeSections(sections) {
    return sections.map((section, index) => ({
        id: section.id || `section_${index + 1}`,
        kind: assertKnownKind(SectionKinds, section.kind || 'paragraph', 'section'),
        text: section.text || '',
        verseRef: section.verseRef || null,
        start: section.start ?? null,
        end: section.end ?? null,
        attachments: normalizeAttachments(section.attachments || []),
        meta: section.meta || {}
    }));
}

export function normalizeAttachments(attachments) {
    return attachments.map((attachment, index) => ({
        id: attachment.id || `attachment_${index + 1}`,
        kind: assertKnownKind(AttachmentKinds, attachment.kind || 'file', 'attachment'),
        src: attachment.src || '',
        caption: attachment.caption || '',
        cues: attachment.cues || [],
        frames: attachment.frames || [],
        manifest: attachment.manifest || null,
        meta: attachment.meta || {}
    }));
}

export function normalizeReferences(references) {
    return references.map((reference, index) => ({
        id: reference.id || `reference_${index + 1}`,
        kind: assertKnownKind(ReferenceKinds, reference.kind || 'custom', 'reference'),
        fromId: reference.fromId || null,
        toId: reference.toId || null,
        fromSectionId: reference.fromSectionId || null,
        toSectionId: reference.toSectionId || null,
        label: reference.label || '',
        meta: reference.meta || {}
    }));
}

export function normalizeComments(comments) {
    return comments.map((comment, index) => ({
        id: comment.id || `comment_${index + 1}`,
        kind: assertKnownKind(CommentKinds, comment.kind || 'comment', 'comment'),
        body: comment.body || '',
        answerPostId: comment.answerPostId || null,
        replies: normalizeComments(comment.replies || []),
        attachments: normalizeAttachments(comment.attachments || []),
        meta: comment.meta || {}
    }));
}

export function copyPostToSeries(post, seriesId, copierId) {
    return createPost({
        ...post,
        id: `${post.id}_copy_${seriesId}`,
        kind: post.kind === 'question' ? 'question' : 'remix',
        seriesIds: [...new Set([...(post.seriesIds || []), seriesId])],
        copiedFrom: { postId: post.id, copierId }
    });
}
