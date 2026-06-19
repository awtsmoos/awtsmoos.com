// B"H
import { h } from './render.js';
export function CommentTree(comments = []) { return h('section', { class: 'awt-panel awt-comment-tree' }, comments.map(commentNode)); }
function commentNode(comment) { return h('div', { class: 'awt-comment' }, [h('strong', {}, [comment.author || 'Alias']), h('p', {}, [comment.text || '...']), ...(comment.replies || []).map(commentNode)]); }
