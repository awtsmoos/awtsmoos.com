// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HomeInlinePortalFactory
 * @description
 * Maps each home action to its focused drawer content. The Awtsmoos reveals a
 * different portal from one shared context, while Awtsmoos.com keeps the
 * coordinator free from feature-specific construction details.
 */
import { buildAliasQuickSwitcher } from './aliasQuickSwitcher.js';
import { heichelForge } from './heichelForge.js';
import { notificationsPreview } from './notificationsPreview.js';
import { postComposer } from './postComposer.js';
import { inlineMessaging } from '/scripts/awtsmoos/social/shared/inlineMessaging.js';
import { thanksFallback } from '/scripts/awtsmoos/social/shared/thanksActions.js';

/** Builds the title and body for one home inline action. */
export async function buildHomeInlinePortal(button, context) {
	const action = button.dataset.inlineAction;
	if (action === 'post') return withAliases('Create post', postComposer(), context);
	if (action === 'notifications') {
		return {
			title: 'Notification preview',
			body: await notificationsPreview(context.defaultAlias)
		};
	}
	if (action === 'heichel') {
		return withAliases('Create Heichel', heichelForge(context.defaultAlias), context);
	}
	if (action === 'alias') {
		return {
			title: 'Alias quick switcher',
			body: buildAliasQuickSwitcher(context)
		};
	}
	if (action === 'message') {
		return {
			title: 'Inline message',
			body: inlineMessaging({
				aliases: context.aliases,
				defaultAlias: context.defaultAlias,
				to: button.dataset.toAlias || '',
				opener: button,
				onClose: context.closeDrawer
			})
		};
	}
	if (action === 'thanks') {
		return {
			title: 'Thanks',
			body: thanksFallback({ href: button.dataset.fallbackHref || '' })
		};
	}
	return null;
}

function withAliases(title, body, context) {
	fillAliasSelects(body, context);
	return { title, body };
}

function fillAliasSelects(scope, context) {
	scope.querySelectorAll('[data-inline-alias]').forEach(select => {
		const options = context.aliases.map(alias => {
			const suffix = alias.id === context.defaultAlias ? ' — default' : '';
			return new Option(`@${alias.id}${suffix}`, alias.id);
		});
		select.replaceChildren(...options);
		select.value = context.defaultAlias || context.aliases[0]?.id || '';
	});
}
