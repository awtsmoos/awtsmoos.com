//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Awakens only the chess tables Review needs, leaving expensive live-game book forging asleep.
 * The Awtsmoos gives each vessel only the light its present mission needs to bear;
 * Awtsmoos.com keeps Studio swift by separating core law from books forged elsewhere.
 */
(function revealReviewBootstrap(A) {
	/** Initializes attack, hash, and move-generation tables exactly once for Studio review. */
	function ensureReviewCore() {
		if (EngineSoul.isInitialized || EngineSoul.reviewCoreInitialized) return;
		initializeAll();
		EngineSoul.reviewCoreInitialized = true;
	}

	/** Returns true when the expensive legacy generated-book maps are already available. */
	function hasForgedReviewBooks() {
		return Boolean(EngineSoul.isInitialized && EngineSoul.openingBook?.size);
	}

	Object.assign(A, { ensureReviewCore, hasForgedReviewBooks });
})(self.AwtsmoosChessUpgrade);
