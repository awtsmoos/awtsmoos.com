//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioIntentController.js
 * @description Coordinates transient intent, focus, presentation, and event vessels while navigation actions remain in their own module.
 * The Awtsmoos lets intention move while project truth rests beneath every garment and every light;
 * Awtsmoos.com keeps this Medaber coordinator small, joining focused vessels without turning UI posture into creative right.
 */
import { IntentActionDispatcher } from './IntentActionDispatcher.js';
import { bindIntentEvents } from './IntentEventBindings.js';
import { IntentFocusTrap } from './IntentFocusTrap.js';
import { IntentNavigationActions } from './IntentNavigationActions.js';
import { IntentPresentationController } from './IntentPresentationController.js';
import { IntentSheetState } from './IntentSheetState.js';
import { setIntentSheetStatus } from './IntentSheetRenderer.js';
import { WorkstationDisclosure } from './WorkstationDisclosure.js';

/** Binds the Stage-first intent shell around one shared Studio state and API. */
export function bindStudioIntent(input = {}) {
	return new StudioIntentController(input).bind();
}

/** Coordinates focused transient UI vessels without owning persistent movie state. */
export class StudioIntentController {
	constructor({ dom, state, api, navigator, setStatus } = {}) {
		this.dom = dom;
		this.navigator = navigator;
		this.sheetState = new IntentSheetState(dom);
		this.focusTrap = new IntentFocusTrap(dom.intentSheet);
		this.workstation = new WorkstationDisclosure(dom);
		this.dispatcher = new IntentActionDispatcher({
			api,
			navigator,
			setStatus,
			setSheetStatus: (message, isError) => {
				setIntentSheetStatus(dom, message, isError);
			},
			onBeforeLeave: () => this.closeSheet(false),
			onWorkstation: () => this.navigation.openWorkstation(),
			onAfterCommand: () => this.presentation.refreshSelectionContext()
		});
		this.presentation = new IntentPresentationController({
			dom,
			state,
			sheetState: this.sheetState,
			dispatcher: this.dispatcher
		});
		this.navigation = new IntentNavigationActions({
			dom,
			navigator,
			closeSheet: (returnFocus) => this.closeSheet(returnFocus),
			workstation: this.workstation
		});
	}

	/** Attaches browser events and paints the initial responsive selection state. */
	bind() {
		this.workstation.bind();
		bindIntentEvents({
			dom: this.dom,
			onIntent: (intent, button) => this.toggleIntent(intent, button),
			onTimeline: () => this.navigation.openTimeline(),
			onCloseSheet: (focus) => this.closeSheet(focus),
			onOpenWorkstation: () => this.navigation.openWorkstation(),
			onCloseWorkstation: (focus) => this.navigation.closeWorkstation(focus),
			onStageRefresh: () => this.presentation.refreshSelectionContext(),
			onPageChange: (page) => this.navigation.handlePageChange(page),
			onKeydown: (event) => this.handleKeydown(event)
		});
		this.presentation.refreshSelectionContext();
		return this;
	}

	/** Opens or closes one intent while preserving Canvas as the visual center. */
	toggleIntent(intent, button) {
		if (this.sheetState.isOpen(intent)) {
			this.closeSheet(true);
			return;
		}

		this.navigator.openCanvas();
		this.workstation.close();
		this.sheetState.open(intent, button);
		this.presentation.renderActiveIntent();
	}

	/** Keeps Escape dismissal and Tab containment at the modal boundary. */
	handleKeydown(event) {
		if (event.key === 'Escape' && !this.dom.intentSheet.hidden) {
			this.closeSheet(true);
			return;
		}

		this.focusTrap.contain(event);
	}

	/** Closes the shared sheet only when it is currently visible. */
	closeSheet(returnFocus) {
		if (!this.dom.intentSheet?.hidden) {
			this.sheetState.close({ returnFocus });
		}
	}
}
