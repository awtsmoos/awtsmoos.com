//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTransformGizmo.js
 * The Awtsmoos renews direction before a hand calls one axis X, Y, or Z;
 * Awtsmoos.com makes selected-object transformation visible on the stage, with true pointer drags entering the canonical movie instead of cosmetic DOM art.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';

const AXES = Object.freeze([
	{ id: 'x', label: 'X' },
	{ id: 'y', label: 'Y' },
	{ id: 'z', label: 'Z' }
]);

/** Build one three-axis drag gizmo whose interpretation follows the active editor tool. */
export function createStudioTransformGizmo() {
	return UI.div(
		{
			class: context => gizmoClass(context),
			'data-studio-transform-gizmo': 'true',
			'data-tool': context => context.store.get('activeTool'),
			'aria-label': context => `${context.store.get('activeTool')} transform gizmo`
		},
		UI.div({ class: 'studio-gizmo-origin' }),
		...AXES.map(axis => axisHandle(axis)),
		UI.span({
			class: 'studio-gizmo-caption',
			text: context => `${String(context.store.get('activeTool')).toUpperCase()} · ${context.store.get('selectedLayerId') || 'Select object'}`
		})
	);
}

function axisHandle(axis) {
	return UI.button({
		class: `studio-gizmo-axis studio-gizmo-axis-${axis.id}`,
		text: axis.label,
		'data-transform-axis': axis.id,
		'aria-label': `${axis.label} axis drag handle`,
		$on: { pointerdown: 'beginViewportTransformDrag' }
	});
}

function gizmoClass(context) {
	const tool = context.store.get('activeTool');
	const selected = Boolean(context.store.get('selectedLayerId'));
	const interactive = selected && ['move', 'rotate', 'scale'].includes(tool);
	return `studio-transform-gizmo${interactive ? ' is-active' : ''}`;
}
