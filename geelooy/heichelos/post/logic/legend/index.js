// B"H
/** Chapter 346: Reader legend behavior runs after beauty without owning scroll. */
import { bindCenterSectionObserver } from './centerSectionObserver.js';
import { bindReadingProgressState } from './readingProgressState.js';
import { bindCompletionState } from './completionState.js';
import { classifySectionKinds } from './sectionKindClassifier.js';
import { blessCommentThreadState } from './commentThreadState.js';
import { bindInlineAnchorState } from './inlineAnchorState.js';

export function runReaderLegend() {
  const previous = window.__awtsmoosReaderLegend;
  previous?.unbindCenter?.();
  previous?.unbindProgress?.();
  previous?.unbindCompletion?.();
  const unbindCenter = bindCenterSectionObserver();
  const unbindProgress = bindReadingProgressState();
  const unbindCompletion = bindCompletionState();
  const sectionCount = classifySectionKinds();
  const commentCount = blessCommentThreadState();
  const inlineCount = bindInlineAnchorState();
  const state = { active: true, unbindCenter, unbindProgress, unbindCompletion, sectionCount, commentCount, inlineCount };
  window.__awtsmoosReaderLegend = state;
  return state;
}
