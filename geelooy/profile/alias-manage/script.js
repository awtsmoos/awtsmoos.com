// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AliasStudio
 * @description
 * The Awtsmoos lets identity creation unfold through preview, validation, and
 * deliberate action; Awtsmoos.com keeps this controller thin while modules serve.
 */
import {
	getAliasStudioConfig,
	getAliasStudioRefs
} from './modules/config.js';
import { bindAliasDeletion } from './modules/deleteFlow.js';
import {
	createValidationScheduler,
	renderAliasValidation,
	validateAliasIdentity
} from './modules/validation.js';
import {
	applyPreviewDisclosure,
	connectAliasPreview,
	hydrateAliasFields
} from './modules/preview.js';
import {
	readAliasValues,
	saveAlias,
	setAliasStudioBusy,
	setAliasStudioStatus
} from './modules/actions.js';

document.addEventListener('DOMContentLoaded', bootAliasStudio);

function bootAliasStudio() {
	const config = getAliasStudioConfig();
	const refs = getAliasStudioRefs();
	if (!config.studio || !refs.form) {
		return;
	}
	hydrateAliasFields(refs, config);
	applyPreviewDisclosure(refs);
	const preview = connectAliasPreview(refs, config);
	const validate = createValidationScheduler(function runValidation() {
		validateCurrentIdentity(refs, config, preview);
	});
	refs.name?.addEventListener('input', validate);
	refs.aliasId?.addEventListener('input', validate);
	refs.form.addEventListener('submit', function saveIdentity(event) {
		submitAlias(event, refs, config);
	});
	bindAliasDeletion(refs, config, function returnAfterDelete() {
		returnToProfile(config.returnURL);
	});
	const openingMessage = config.isUpdate
		? 'Editing an existing identity.'
		: 'Ready to shape a new identity.';
	setAliasStudioStatus(refs.status, 'neutral', openingMessage);
}

async function validateCurrentIdentity(refs, config, preview) {
	if (config.isUpdate && refs.aliasId?.disabled) {
		renderAliasValidation(refs.validation, {
			tone: 'neutral',
			message: `Identity address stays @${config.alias} in update mode.`
		});
		return;
	}
	try {
		const result = await validateAliasIdentity({
			aliasName: refs.name?.value || '',
			aliasId: refs.aliasId?.value || ''
		});
		renderAliasValidation(refs.validation, result);
		preview.setSuggestedId(result.suggestedId);
	} catch (error) {
		renderAliasValidation(refs.validation, {
			tone: 'error',
			message: error.message || 'Identity validation is temporarily unavailable.'
		});
	}
}

async function submitAlias(event, refs, config) {
	event.preventDefault();
	const values = readAliasValues(refs);
	if (!values.aliasName) {
		setAliasStudioStatus(refs.status, 'error', 'Add an alias name before saving.');
		refs.name?.focus();
		return;
	}
	setAliasStudioBusy(refs, true);
	setAliasStudioStatus(refs.status, 'busy', 'Saving identity…');
	try {
		await saveAlias(config, values);
		const savedMessage = config.isUpdate ? 'Identity updated.' : 'Identity created.';
		setAliasStudioStatus(refs.status, 'success', savedMessage);
		returnToProfile(config.returnURL);
	} catch (error) {
		setAliasStudioStatus(
			refs.status,
			'error',
			error.message || 'Identity could not be saved.'
		);
	} finally {
		setAliasStudioBusy(refs, false);
	}
}

function returnToProfile(returnURL) {
	setTimeout(function navigateToProfile() {
		location.href = returnURL;
	}, 420);
}
