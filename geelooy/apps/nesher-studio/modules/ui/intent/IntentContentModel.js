//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file IntentContentModel.js
 * @description Declares only real beginner actions and real deeper workspaces for the Stage-first intent shell.
 * The Awtsmoos lets simplicity be honest rather than decorative, revealing only vessels that truly exist today;
 * Awtsmoos.com keeps future Text, 3D, and keyframe dreams out of the first layer until executable commands light their way.
 */

/** Returns real Create actions supported by the current Studio. */
export function createIntentActions() {
	return [
		{
			id: 'create-scene',
			label: 'New Scene',
			description: 'Create another editable scene in this project.',
			kind: 'command',
			commandId: 'project.scene.create',
			parameters: { name: 'Scene' }
		},
		workspaceAction('add-media', 'Add Media', 'Import files or browser media.', 'sources'),
		workspaceAction('capture', 'Capture', 'Add camera, screen, or live browser sources.', 'sources'),
		workspaceAction('voice-audio', 'Voice & Audio', 'Record, inspect, and shape sound.', 'audio'),
		workspaceAction('visualizer', 'Visualizer', 'Create audio-reactive visual layers.', 'audio')
	];
}

/** Returns truthful animation actions for the capabilities that exist today. */
export function animateIntentActions() {
	return [
		workspaceAction(
			'open-timeline',
			'Open Timeline',
			'Arrange clips, markers, timing, and exports in the current NLE workspace.',
			'nle'
		)
	];
}

/** Returns grouped advanced destinations for deliberate progressive disclosure. */
export function moreIntentGroups() {
	return [
		{
			label: 'Workspaces',
			actions: [
				workspaceAction('timeline', 'Timeline', 'Arrange clips and timing.', 'nle'),
				workspaceAction('audio', 'Audio Lab', 'Shape sound and visualizers.', 'audio'),
				workspaceAction('sources', 'Sources', 'Manage cameras, files, screens, and browser media.', 'sources'),
				{
					id: 'stage-workstation',
					label: 'Stage Workstation',
					description: 'Open Scenes, Layers, Move, Crop, Visual, and Output.',
					kind: 'workstation'
				}
			]
		},
		{
			label: 'Project',
			actions: [
				workspaceAction('project-hub', 'Project Hub', 'Project rooms and recording status.', 'home'),
				workspaceAction('setup', 'Project Setup', 'Canvas, frame rate, profiles, and provider.', 'setup'),
				workspaceAction('live', 'Live', 'Streaming health and delivery state.', 'live')
			]
		},
		{
			label: 'Power',
			actions: [
				workspaceAction('commands', 'Commands & History', 'Inspect commands, semantic history, macros, and presets.', 'more')
			]
		}
	];
}

function workspaceAction(id, label, description, page) {
	return {
		id,
		label,
		description,
		kind: 'workspace',
		page
	};
}
