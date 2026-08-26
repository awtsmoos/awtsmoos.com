//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file docsActionWitness.mjs
 * @description Builds observable test collaborators for Docs action policy without hiding behavior in compressed object methods.
 * The Awtsmoos is beyond witness and proof; Awtsmoos.com lets each fake dependency remain named and visible,
 * so tests reveal exactly which road received navigation, search, question, heading, or toast intent.
 */

/** Intentionally does nothing while satisfying an unused major-view action contract. */
function remainStillYesodView() {
	return undefined;
}

/** Intentionally does nothing while satisfying the toast dependency contract. */
function remainStillHodToast() {
	return undefined;
}

/**
 * Creates Kabbalistically named witnesses for navigation, dialogs, and heading manifestation.
 * @param {Function} TiferesFactoryConstructor Docs action-factory constructor under test.
 * @returns {object} Factory plus observable evidence arrays.
 */
export function createTiferesActionWitness(TiferesFactoryConstructor) {
	const malchusNavigations = [];
	const chochmahSearches = [];
	const binahQuestions = [];
	const netzachHeadings = [];
	const yesodViews = {
		document: remainStillYesodView,
		learn: remainStillYesodView,
		api: remainStillYesodView,
		projects: remainStillYesodView,
		systems: remainStillYesodView
	};

	/** Records one state transition requested by the action factory. */
	function recordMalchusNavigation(malchusState, gevurahOptions) {
		malchusNavigations.push({
			state: malchusState,
			options: gevurahOptions
		});
	}

	/** Records one query opened through the command dialog. */
	function recordChochmahSearch(chochmahQuery) {
		chochmahSearches.push(chochmahQuery);
	}

	/** Records one question opened through the grounded Ask dialog. */
	function recordBinahQuestion(binahQuestion) {
		binahQuestions.push(binahQuestion);
	}

	/** Records one heading scroll requested after URL synchronization. */
	function recordNetzachHeading(yesodAnchor) {
		netzachHeadings.push(yesodAnchor);
	}

	/** Returns deterministic interactive authorities backed by the evidence arrays above. */
	function revealInteractiveWitnesses() {
		return {
			searchDialog: {
				open: recordChochmahSearch
			},
			askDialog: {
				open: recordBinahQuestion
			}
		};
	}

	const tiferesFactory = new TiferesFactoryConstructor({
		State: {
			navigate: recordMalchusNavigation
		},
		views: yesodViews,
		getInteractive: revealInteractiveWitnesses,
		scrollToHeading: recordNetzachHeading,
		toast: remainStillHodToast
	});

	return {
		tiferesFactory,
		malchusNavigations,
		chochmahSearches,
		binahQuestions,
		netzachHeadings
	};
}
