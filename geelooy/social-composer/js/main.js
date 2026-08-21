//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialComposerEntry
 * @description The Awtsmoos awakens resilient media, local custody, quiet future depth, review, recovery, and publishing in ordered flow;
 * Awtsmoos.com keeps advanced chambers native and retractable while one optional particle field breathes behind creation without owning it.
 */
import { startActivityBeacon } from '../../shared/ActivityBeacon.js';
import { FutureExperience } from '../../shared/ui/future/FutureExperience.js?v=future-005';
import { installComposerAccessibility } from './accessibility.js';
import { YesodCloneAssetApi } from './clone/CloneAssetApi.js';
import { GevurahCloneAssetHydrator } from './clone/CloneAssetHydrator.js';
import { BinahCloneSourceLoader } from './clone/CloneSourceLoader.js';
import { YesodCloneSourceApi } from './clone/CloneSourceApi.js';
import { createComposer } from './ComposerAssembly.js?v=future-ui-005';
import { contextFromLocation } from './config.js';
import { ArchiveOrgComposerView } from './media/ArchiveOrgComposerView.js';
import { buildPostPayload } from './model/PostPayload.js';
import { buildPublicationPlan } from './publishing/PublicationPlan.js';
import { OrotComposerExperience } from './ui/ComposerExperience.js';

function reportStartupFailure(error) {
	console.error(error);
	const status = document.getElementById('statusMessage');
	if (!status) return;
	status.hidden = false;
	status.dataset.kind = 'error';
	status.textContent = error.message;
}

function diagnosticHandle(composer) {
	return {
		...composer,
		payload: () => buildPostPayload(composer.state.snapshot()),
		publicationPlan: () => buildPublicationPlan(composer.state.snapshot()),
		review: () => composer.review.open(),
		versions: () => composer.drafts.history.read(composer.state.snapshot())
	};
}

function prepareFutureComposer() {
	document.body.dataset.futurePage = 'composer';
	document.body.setAttribute('data-future-particles', '');
	const panels = [...document.querySelectorAll('.composerColumn > details.majorPanel')];
	panels.forEach((detail, index) => {
		detail.setAttribute('data-future-disclosure', '');
		detail.dataset.disclosureKey = `composer.major.${detail.dataset.mobilePanel || index}`;
	});
	document.querySelector('.publicationPanel')?.setAttribute('data-mobile-closed', '');
	return new FutureExperience(document).start();
}

function installCloneMediaOwnership(composer, context) {
	if (!context.cloneSource) return null;
	const hydrator = new GevurahCloneAssetHydrator({
		state: composer.state,
		api: new YesodCloneAssetApi(),
		status: composer.status
	});
	hydrator.initialize();
	return hydrator;
}

async function awaken() {
	const disconnectAccessibility = installComposerAccessibility();
	const future = prepareFutureComposer();
	const context = contextFromLocation();
	const composer = createComposer(context);
	composer.cloneLoader = new BinahCloneSourceLoader({
		state: composer.state,
		api: new YesodCloneSourceApi(),
		status: composer.status,
		source: context.cloneSource
	});
	if (context.cloneSource) await composer.cloneLoader.initialize();
	composer.cloneAssetHydrator = installCloneMediaOwnership(composer, context);
	composer.experience = new OrotComposerExperience({
		document,
		state: composer.state,
		cloneAssetHydrator: composer.cloneAssetHydrator
	});
	composer.archiveOrgView = new ArchiveOrgComposerView({ root: document });
	composer.review.initialize();
	composer.controller.initialize();
	composer.experience.initialize();
	composer.creator.initialize();
	composer.drafts.initialize();
	composer.archiveOrgView.mount();
	composer.future = future;
	composer.activityBeacon = startActivityBeacon({ application: 'social-composer' });
	composer.disconnectAccessibility = disconnectAccessibility;
	window.RichSocialComposer = diagnosticHandle(composer);
}

window.addEventListener('DOMContentLoaded', () => {
	void awaken().catch(reportStartupFailure);
});

export {
	awaken,
	diagnosticHandle,
	installCloneMediaOwnership,
	prepareFutureComposer,
	reportStartupFailure
};
