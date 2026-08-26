// B"H
// Boruch Hashem
// Blessed is He

import { StudioWorkspaceCommands } from '../StudioWorkspaceCommands.js';
import { StudioEventFamily } from './StudioEventFamily.js';

/**
 * @file StudioNavigationEvents.js
 * @description
 * The Awtsmoos renews selection and destination before a panel can appear near or far from the artist;
 * Awtsmoos.com keeps navigation, visibility, transform, export, and compact-sheet routing together without owning feature-domain law.
 */
export class StudioNavigationEvents extends StudioEventFamily {
	/**
	 * Builds workspace navigation and selected-entity shell event handlers.
	 * @param {object} merkavahController Active Studio controller.
	 * @returns {object} Navigation and shell event family.
	 */
	static create(merkavahController) {
		const yesodStore = this.store(merkavahController);
		return {
			switchLeftPanel: (tiferesEvent) => {
				return StudioWorkspaceCommands.setPanel(
					yesodStore,
					tiferesEvent.currentTarget.dataset.panel
				);
			},
			selectEntity: (tiferesEvent) => {
				return StudioWorkspaceCommands.select(
					yesodStore,
					tiferesEvent.currentTarget.dataset.entityId
				);
			},
			filterAssets: (tiferesEvent) => {
				return StudioWorkspaceCommands.setFilter(yesodStore, tiferesEvent.target.value);
			},
			updateTransform: (tiferesEvent) => {
				return StudioWorkspaceCommands.updateTransform(
					yesodStore,
					tiferesEvent.target.dataset.transformProperty,
					tiferesEvent.target.value
				);
			},
			toggleVisible: () => {
				return StudioWorkspaceCommands.toggle(yesodStore, 'visible');
			},
			toggleLocked: () => {
				return StudioWorkspaceCommands.toggle(yesodStore, 'locked');
			},
			openAssetsPanel: () => this.openLeftPanel(merkavahController, 'assets'),
			openLayersPanel: () => this.openLeftPanel(merkavahController, 'layers'),
			openCreatePanel: () => this.openLeftPanel(merkavahController, 'create'),
			openAiPanel: () => this.openLeftPanel(merkavahController, 'ai'),
			openPropertiesPanel: () => {
				merkavahController.openMobilePanel('props');
			},
			openTimelinePanel: () => {
				merkavahController.openMobilePanel('time');
			},
			exportMovie: () => {
				return merkavahController.exportMovie();
			},
			openCharacterLab: () => {
				return merkavahController.openCharacterLab();
			},
			openMobilePanel: (tiferesEvent) => {
				merkavahController.openMobilePanel(
					tiferesEvent.currentTarget.dataset.mobilePanel
				);
			}
		};
	}
}
