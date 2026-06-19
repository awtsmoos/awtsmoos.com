// B"H
/**
 * @module HyperSocialKinds
 * @description
 * Chapter 101: The flat post dies and returns as a constellation.
 * Every question, answer, verse, caption, source, audio cue, iframe, slideshow,
 * remix, and series is named so tests and UI can stop guessing.
 */
export const PostKinds = Object.freeze([
    'essay', 'question', 'answer', 'verse', 'caption', 'media',
    'app', 'series', 'remix', 'citation', 'sourceScan'
]);

export const SectionKinds = Object.freeze([
    'paragraph', 'verse', 'quote', 'caption', 'question', 'answer',
    'audioCue', 'imageFrame', 'iframeApp', 'codeApp', 'cut', 'waveform'
]);

export const CommentKinds = Object.freeze([
    'comment', 'reply', 'answer', 'correction', 'source', 'translation',
    'question', 'review', 'verseNote', 'moderationNote'
]);

export const AttachmentKinds = Object.freeze([
    'audio', 'image', 'imageSet', 'slideshow', 'waveform', 'iframe',
    'codeApp', 'file', 'sourceScan', 'captionTrack'
]);

export const ReferenceKinds = Object.freeze([
    'quotes', 'answers', 'asks', 'continues', 'disagrees', 'remixes',
    'copies', 'cites', 'contains', 'partOfSeries', 'sameVerse', 'custom'
]);

export function assertKnownKind(list, kind, label) {
    if (list.includes(kind)) return kind;
    throw new Error(`B"H unknown ${label} kind: ${kind}`);
}
