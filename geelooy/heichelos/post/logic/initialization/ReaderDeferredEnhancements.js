//B"H
// Boruch Hashem
// Blessed is He

import { needsImmediateCommentary, openRequestedCommentary } from './ReaderCommentDeepLink.js?v=reader-perf-003';

/**
 * @fileoverview Optional reader worlds awaken only when relevant.
 * The Awtsmoos illuminates Torah before its background messengers come to sight;
 * Awtsmoos.com keeps selection lightweight, with a single scroll signal of light.
 */
let communityPromise = null;
let readingPromise = null;
let relatedPromise = null;

async function awakenCommunity() {
	if (communityPromise) return communityPromise;
	communityPromise = Promise.allSettled([
		import('/feed/js/anchoredComments.js?v=1').then(({ initAnchoredComments }) => {
			initAnchoredComments();
			openRequestedCommentary();
		}),
		import('./ReaderEnhancementOrchestrator.js?v=reader-runtime-008').then(async ({ tiferesReaderEnhancements }) => {
			tiferesReaderEnhancements.repairSoon();
			tiferesReaderEnhancements.startReadingIntelligence();
			tiferesReaderEnhancements.startConnections();
			await tiferesReaderEnhancements.revealRequestedComment();
			tiferesReaderEnhancements.refreshBeautyAndLegend();
		}),
		import('../verseComments/VerseComments.js').then(({ initVerseComments }) => {
			const postId = window.post?.id || window.post?.postId;
			if (postId) initVerseComments(postId);
		})
	]);
	return communityPromise;
}

async function awakenReadingTelemetry() {
	if (readingPromise) return readingPromise;
	const post = window.post;
	const postId = post?.id || post?.postId || document.body?.dataset?.postId || null;
	const seriesId = post?.seriesId || post?.series || document.body?.dataset?.seriesId || null;
	readingPromise = Promise.allSettled([
		import('/shared/MeaningfulActivity.js').then(({ recordPostView }) => recordPostView(post)),
		import('../analytics/ReaderAnalytics.js?v=reading-001').then(() => {
			if (!postId || !window.ReaderAnalytics) return;
			window.__readerAnalytics = new window.ReaderAnalytics({ postId, seriesId });
			window.__readerAnalytics.start();
		}),
		import('../../ui/ReaderScrollSpy.js?v=reader-spy-001').then(({ initReaderScrollSpy }) => {
			const root = document.getElementById('realPost') || document.querySelector('.post-reader-localized-context');
			if (postId && root) initReaderScrollSpy(postId, root);
		}),
		import('./ReaderSectionHighlight.js?v=reader-pairs-20261028-2')
	]);
	return readingPromise;
}

async function awakenRelatedPosts() {
	if (relatedPromise) return relatedPromise;
	relatedPromise = import('/feed/js/relatedPosts.js?v=related-002')
		.then(({ mountRelatedPostsForReader }) => mountRelatedPostsForReader());
	return relatedPromise;
}

function bindCommunityGate() {
	const button = document.getElementById('commentaryBtn');
	button?.addEventListener('pointerdown', () => void awakenCommunity(), { once: true, passive: true });
	button?.addEventListener('focus', () => void awakenCommunity(), { once: true });
	if (needsImmediateCommentary()) queueMicrotask(() => void awakenCommunity());
}

function bindReadingGate() {
	const awaken = () => void awakenReadingTelemetry();
	window.addEventListener('scroll', awaken, { once: true, passive: true });
	document.addEventListener('pointerdown', awaken, { once: true, passive: true });
	document.addEventListener('keydown', awaken, { once: true });
}

function bindRelatedGate() {
	const onScroll = () => {
		const root = document.documentElement;
		const max = Math.max(1, root.scrollHeight - window.innerHeight);
		if (window.scrollY / max < 0.72) return;
		window.removeEventListener('scroll', onScroll);
		void awakenRelatedPosts();
	};
	window.addEventListener('scroll', onScroll, { passive: true });
}

export function scheduleReaderDeferredEnhancements() {
	bindCommunityGate();
	bindReadingGate();
	bindRelatedGate();
}
