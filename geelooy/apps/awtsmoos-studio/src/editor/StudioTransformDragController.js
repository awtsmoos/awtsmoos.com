//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTransformDragController.js
 * The Awtsmoos renews pointer and coordinate while a moving hand becomes a truthful canonical movie transformation;
 * Awtsmoos.com lets Blender-like gizmo light descend through one bounded drag controller rather than hidden DOM imitation.
 */

import { cloneStudioSelection } from './StudioLayerAccess.js';
import { commitStudioEditorMovie } from './StudioEditorCommit.js';
import { defaultTransform } from './StudioLayerFactory.js';

export class StudioTransformDragController {
	constructor(session) {
		this.session = session;
		this.drag = null;
	}

	begin(event, store) {
		const tool = store.get('activeTool');
		if (!['move', 'rotate', 'scale'].includes(tool)) return;
		const selection = cloneStudioSelection(store.get('movie'), store.get('selectedSceneId'), store.get('selectedLayerId'));
		if (!selection.layer) return store.set('status', 'Select an object before using the viewport gizmo.');
		event.preventDefault();
		const windowKli = event.currentTarget.ownerDocument.defaultView;
		this.drag = {
			axis: event.currentTarget.dataset.transformAxis || 'x',
			movie: selection.movie,
			layerId: selection.layer.id,
			sceneId: selection.scene?.id,
			startX: event.clientX,
			startY: event.clientY,
			startTransform: { ...defaultTransform(), ...(selection.layer.transform || {}) },
			store,
			tool,
			windowKli
		};
		this.moveListener = moveEvent => this.move(moveEvent);
		this.endListener = () => this.end();
		windowKli.addEventListener('pointermove', this.moveListener);
		windowKli.addEventListener('pointerup', this.endListener, { once: true });
		store.set('status', `${selection.layer.id} · ${tool} ${this.drag.axis.toUpperCase()} gizmo active.`);
	}

	/**
	 * Begin a drag from the stage body itself (not a gizmo handle). With the
	 * move tool active and a layer selected, dragging the canvas moves that
	 * layer in x/y. Movement previews live in the store without touching
	 * history; exactly one history entry is recorded when the drag ends, so
	 * the committed JSON transform always matches what the hand did.
	 */
	beginBody(event, store) {
		if (store.get('activeTool') !== 'move') return;
		const selection = cloneStudioSelection(store.get('movie'), store.get('selectedSceneId'), store.get('selectedLayerId'));
		if (!selection.layer) return;
		event.preventDefault();
		const windowKli = event.currentTarget.ownerDocument.defaultView;
		this.drag = {
			axis: 'xy',
			body: true,
			movie: selection.movie,
			layerId: selection.layer.id,
			sceneId: selection.scene?.id,
			startX: event.clientX,
			startY: event.clientY,
			startTransform: { ...defaultTransform(), ...(selection.layer.transform || {}) },
			store,
			tool: 'move',
			windowKli,
			moved: false
		};
		this.moveListener = moveEvent => this.move(moveEvent);
		this.endListener = () => this.end();
		windowKli.addEventListener('pointermove', this.moveListener);
		windowKli.addEventListener('pointerup', this.endListener, { once: true });
		store.set('status', `${selection.layer.id} · move drag active.`);
	}

	move(event) {
		if (!this.drag) return;
		const deltaX = event.clientX - this.drag.startX;
		const deltaY = event.clientY - this.drag.startY;
		const selection = cloneStudioSelection(this.drag.movie, this.drag.sceneId, this.drag.layerId);
		if (!selection.layer) return this.end();
		selection.layer.transform = this.transformForDelta(deltaX, deltaY);
		if (this.drag.body) {
			this.drag.movie = selection.movie;
			this.drag.moved = true;
			const transform = selection.layer.transform;
			this.drag.store.update(state => {
				state.movie = selection.movie;
				state.jsonDraft = JSON.stringify(selection.movie, null, 2);
				state.status = `${selection.layer.id} · move x ${roundDragValue(transform.x)}, y ${roundDragValue(transform.y)}.`;
			});
			this.session.runtime.render(selection.movie, this.drag.store.get('playhead') || 0);
			return;
		}
		commitStudioEditorMovie(this.session, this.drag.store, selection.movie, {
			selectedLayerId: selection.layer.id,
			status: `${selection.layer.id} · ${this.drag.tool} ${this.drag.axis.toUpperCase()}.`
		});
	}

	transformForDelta(deltaX, deltaY) {
		const transform = { ...this.drag.startTransform };
		const axis = this.drag.axis;
		if (this.drag.tool === 'move' && axis === 'xy') {
			transform.x = this.drag.startTransform.x + deltaX / 180;
			transform.y = this.drag.startTransform.y - deltaY / 180;
			return transform;
		}
		if (this.drag.tool === 'move') {
			const delta = axis === 'x' ? deltaX / 180 : axis === 'y' ? -deltaY / 180 : (deltaX - deltaY) / 260;
			transform[axis] = this.drag.startTransform[axis] + delta;
		}
		if (this.drag.tool === 'rotate') {
			const field = `rotation${axis.toUpperCase()}`;
			transform[field] = this.drag.startTransform[field] + (deltaX - deltaY) * 0.45;
			if (axis === 'z') transform.rotation = transform.rotationZ;
		}
		if (this.drag.tool === 'scale') {
			const field = `scale${axis.toUpperCase()}`;
			transform[field] = Math.max(0.05, this.drag.startTransform[field] + (deltaX - deltaY) * 0.005);
		}
		return transform;
	}

	end() {
		if (!this.drag) return;
		const drag = this.drag;
		drag.windowKli.removeEventListener('pointermove', this.moveListener);
		this.drag = null;
		this.moveListener = null;
		this.endListener = null;
		if (drag.body && drag.moved) {
			const selection = cloneStudioSelection(drag.movie, drag.sceneId, drag.layerId);
			const transform = selection.layer?.transform || drag.startTransform;
			commitStudioEditorMovie(this.session, drag.store, drag.movie, {
				selectedLayerId: drag.layerId,
				historyLabel: 'Object moved.',
				status: `${drag.layerId} · moved to x ${roundDragValue(transform.x)}, y ${roundDragValue(transform.y)}.`
			});
		}
	}
}

function roundDragValue(value) {
	return Math.round(Number(value || 0) * 1000) / 1000;
}
