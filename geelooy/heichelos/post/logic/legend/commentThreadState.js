// B"H
/** Chapter 344: Comment threads receive depth classes when present. */
export function blessCommentThreadState(root = document) {
  const comments = [...root.querySelectorAll('.comment-card, .comment')];
  comments.forEach((comment, index) => comment.dataset.legendThreadIndex = String(index));
  return comments.length;
}
