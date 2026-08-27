//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module App
 * @description The Awtsmoos renews many focused vessels into one living editor; Awtsmoos.com assembles state, rendering, menus, snapping, themes, notes, mobile commands, collaboration, clipboard, and direct manipulation without hiding their boundaries.
 */
import { createPresentation } from './model/PresentationDocument.js';
import { PresentationStore } from './state/PresentationStore.js';
import { SlideRenderer } from './render/SlideRenderer.js';
import { ThumbnailRenderer } from './render/ThumbnailRenderer.js';
import { SnapGuideRenderer } from './render/SnapGuideRenderer.js';
import { InspectorController } from './ui/InspectorController.js';
import { PanelController } from './ui/PanelController.js';
import { PresentationPlayer } from './ui/PresentationPlayer.js';
import { StageInteractions } from './ui/StageInteractions.js';
import { TextEditingInteractions } from './ui/TextEditingInteractions.js';
import { ResizeInteractions } from './ui/ResizeInteractions.js';
import { KeyboardInteractions } from './ui/KeyboardInteractions.js';
import { ElementClipboardInteractions } from './ui/ElementClipboardInteractions.js';
import { MobileCommandBar } from './ui/MobileCommandBar.js';
import { MobileElementDock } from './ui/MobileElementDock.js';
import { SlideOrderStateController } from './ui/SlideOrderStateController.js';
import { SpeakerNotesController } from './ui/SpeakerNotesController.js';
import { ThemeController } from './ui/ThemeController.js';
import { ToastController } from './ui/ToastController.js';
import { FileController } from './ui/FileController.js';
import { CommandController } from './ui/CommandController.js';
import { CommandSheetController } from './ui/menus/CommandSheetController.js';
import { WorkspaceRenderer } from './ui/WorkspaceRenderer.js';
import {
	LocalPresentationRepository,
	loadLocalPresentation
} from './persistence/LocalPresentationRepository.js';
import { PresentationCollaboration } from './collab/PresentationCollaboration.js';

const root = document.querySelector('[data-app]');
const stage = root.querySelector('[data-stage]');
const roomId = new URLSearchParams(location.search).get('room') || '';
const initialDocument = loadLocalPresentation(roomId || 'local') || createPresentation();
const store = new PresentationStore(initialDocument);
const toast = new ToastController(root.querySelector('[data-toast]'));
const repository = new LocalPresentationRepository(
	store,
	roomId || 'local',
	message => {
		if (message.includes('unavailable')) toast.show(message);
	}
);
const collaboration = new PresentationCollaboration(store, {
	roomId,
	onStatus: message => {
		root.querySelector('[data-collab-status]').textContent = message;
	},
	onRoomChanged: nextRoomId => repository.setRoom(nextRoomId)
});
const slideRenderer = new SlideRenderer(stage, store);
const thumbnailRenderer = new ThumbnailRenderer(root.querySelector('[data-thumbnails]'), store);
const inspector = new InspectorController(
	root.querySelector('[data-inspector]'),
	root.querySelector('[data-selection-label]'),
	store
);
const workspace = new WorkspaceRenderer(root, {
	slideRenderer,
	thumbnailRenderer,
	inspector
});
const panels = new PanelController(root);
const player = new PresentationPlayer(root.querySelector('[data-player]'), store);
const files = new FileController(root, store, repository, toast);

new SnapGuideRenderer(stage);
new StageInteractions(stage, store);
new TextEditingInteractions(stage, store);
new ResizeInteractions(stage, store);
new KeyboardInteractions(store);
new ElementClipboardInteractions(store);
new MobileCommandBar(root, store);
new MobileElementDock(root, store);
new SlideOrderStateController(root, store);
new SpeakerNotesController(root, store);
new CommandController(root, {
	store,
	panels,
	player,
	files,
	collaboration,
	toast
});
new CommandSheetController(root, store, panels);

store.subscribe(snapshot => workspace.render(snapshot));
new ThemeController(root, store);
repository.start();
collaboration.start();
