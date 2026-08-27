// B"H
// Boruch Hashem
// Blessed is He

import { StudioDocumentMutations } from '../authoring/StudioDocumentMutations.js';
import { StudioPenDraft } from './StudioPenDraft.js';
import { StudioStageCoordinateMapper } from './StudioStageCoordinateMapper.js';
import { StudioVectorPathFactory } from './StudioVectorPathFactory.js';

/**
 * @file StudioPenToolController.js
 * @description
 * The Awtsmoos renews every click before an anchor becomes authored substance;
 * Awtsmoos.com keeps draft anchors transient, captures the production canvas only while Pen is active,
 * and commits one ordinary vector entity so history, timeline, renderer, and export all receive the same path.
 */
export class StudioPenToolController {
	constructor(app, store, options = {}) {
		this.app = app;
		this.store = store;
		this.canvas = options.canvas || app?.ctx?.canvas || null;
		this.mapper = options.mapper || StudioStageCoordinateMapper;
		this.draft = options.draft || new StudioPenDraft();
		this.boundPointerDown = (event) => this.pointerDown(event);
		this.boundDoubleClick = (event) => this.doubleClick(event);
		this.boundKeyDown = (event) => this.keyDown(event);
	}

	/** Installs capture-phase gesture ownership without changing project history. */
	install() {
		if (!this.canvas) {
			throw new Error('Studio Pen requires the production canvas.');
		}
		this.canvas.addEventListener('pointerdown', this.boundPointerDown, true);
		this.canvas.addEventListener('dblclick', this.boundDoubleClick, true);
		window.addEventListener('keydown', this.boundKeyDown, true);
		this.store.set({ studioTool: null, studioPenDraftCount: 0 });
		return this;
	}

	/** Toggles Pen activity, cancelling unfinished points when leaving the tool. */
	toggle() {
		return this.active() ? this.deactivate() : this.activate();
	}

	/** Activates Pen and marks the real production canvas with accessible cursor state. */
	activate() {
		this.store.set({ studioTool: 'pen', studioPenDraftCount: this.draft.count });
		this.canvas.dataset.studioTool = 'pen';
		return true;
	}

	/** Deactivates Pen and discards transient draft anchors without history. */
	deactivate() {
		this.cancel();
		this.store.set({ studioTool: null, studioPenDraftCount: 0 });
		delete this.canvas.dataset.studioTool;
		return true;
	}

	/** Adds one world-space anchor while Pen owns the canvas gesture. */
	pointerDown(event) {
		if (!this.active() || (event.button !== undefined && event.button !== 0)) {
			return false;
		}
		this.consume(event);
		const point = this.mapper.toWorld(this.app, event);
		const added = this.draft.add(point);
		if (added) {
			this.syncCount();
		}
		return added;
	}

	/** Double-click completes the current path without adding a private preview object. */
	doubleClick(event) {
		if (!this.active()) {
			return false;
		}
		this.consume(event);
		return this.finish();
	}

	/** Enter commits and Escape cancels unless the user is editing a form field. */
	keyDown(event) {
		if (!this.active() || this.editableTarget(event.target)) {
			return false;
		}
		if (event.key === 'Enter') {
			this.consume(event);
			return this.finish();
		}
		if (event.key === 'Escape') {
			this.consume(event);
			return this.cancel();
		}
		return false;
	}

	/** Commits exactly one canonical vector-path entity when at least two anchors exist. */
	finish() {
		if (this.draft.count < 2) {
			return false;
		}
		const entity = StudioVectorPathFactory.create(this.draft.snapshot());
		StudioDocumentMutations.add(this.store, entity);
		this.draft.clear();
		this.syncCount();
		return true;
	}

	/** Cancels only transient draft state; the authored project remains untouched. */
	cancel() {
		const changed = this.draft.count > 0;
		this.draft.clear();
		this.syncCount();
		return changed;
	}

	/** Removes listeners and transient tool identity during Studio teardown. */
	destroy() {
		this.canvas?.removeEventListener('pointerdown', this.boundPointerDown, true);
		this.canvas?.removeEventListener('dblclick', this.boundDoubleClick, true);
		window.removeEventListener('keydown', this.boundKeyDown, true);
		if (this.canvas) {
			delete this.canvas.dataset.studioTool;
		}
	}

	/** Returns whether Pen currently owns production-canvas pointer gestures. */
	active() {
		return this.store.get().studioTool === 'pen';
	}

	/** Mirrors only draft count into transient observable UI state. */
	syncCount() {
		this.store.set({ studioPenDraftCount: this.draft.count });
	}

	/** Prevents active Pen gestures from falling through to legacy character selection. */
	consume(event) {
		event.preventDefault?.();
		event.stopImmediatePropagation?.();
		event.stopPropagation?.();
	}

	/** Protects text/form editing from global Pen keyboard shortcuts. */
	editableTarget(target) {
		const tag = String(target?.tagName || '').toLowerCase();
		return Boolean(target?.isContentEditable || ['input', 'textarea', 'select'].includes(tag));
	}
}
