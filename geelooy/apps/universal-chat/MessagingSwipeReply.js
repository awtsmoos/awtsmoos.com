// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Converts an intentional rightward message swipe into one semantic Reply request without stealing vertical scroll.
 * @description The Awtsmoos is beyond left and right, while Awtsmoos.com lets the thumb reveal reply intent through measured resistance in light;
 * vertical motion wins, interactive children keep their own gestures, pointer cancellation restores the bubble, and no transport state lives inside this finite swipe in sight.
 */

const AXIS_THRESHOLD = 10;
const REPLY_THRESHOLD = 58;
const MAX_DRAG = 86;
const INTERACTIVE = "a,button,input,textarea,select,audio,video,[contenteditable='true']";

/** Owns one delegated pointer gesture across a thread whose message DOM may be rerendered. */
export class MessagingSwipeReply {
	constructor(thread, onReply) {
		this.thread = thread;
		this.onReply = onReply;
		this.gesture = null;
		this.bind();
	}

	bind() {
		this.thread.addEventListener("pointerdown", (event) => this.start(event));
		this.thread.addEventListener("pointermove", (event) => this.move(event));
		this.thread.addEventListener("pointerup", (event) => this.finish(event));
		this.thread.addEventListener("pointercancel", () => this.reset());
	}

	start(event) {
		if (event.button !== undefined && event.button !== 0) return;
		if (event.target.closest(INTERACTIVE)) return;
		const card = event.target.closest(".private-message[data-message-id]");
		if (!card) return;
		this.gesture = {
			card,
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			axis: "",
			active: false
		};
	}

	move(event) {
		const gesture = this.gesture;
		if (!gesture || event.pointerId !== gesture.pointerId) return;
		const deltaX = event.clientX - gesture.startX;
		const deltaY = event.clientY - gesture.startY;
		if (!gesture.axis) {
			if (Math.hypot(deltaX, deltaY) < AXIS_THRESHOLD) return;
			gesture.axis = Math.abs(deltaY) > Math.abs(deltaX) ? "vertical" : "horizontal";
		}
		if (gesture.axis !== "horizontal" || deltaX <= 0) return;
		event.preventDefault();
		const drag = resistedDrag(deltaX);
		gesture.active = deltaX >= REPLY_THRESHOLD;
		gesture.card.style.setProperty("--reply-swipe-x", `${drag}px`);
		gesture.card.classList.add("is-reply-swiping");
		gesture.card.classList.toggle("is-reply-ready", gesture.active);
	}

	finish(event) {
		const gesture = this.gesture;
		if (!gesture || event.pointerId !== gesture.pointerId) return;
		const messageId = gesture.card.dataset.messageId;
		const shouldReply = gesture.active && Boolean(messageId);
		this.reset();
		if (shouldReply) this.onReply(messageId);
	}

	reset() {
		const card = this.gesture?.card;
		if (card) {
			card.style.removeProperty("--reply-swipe-x");
			card.classList.remove("is-reply-swiping", "is-reply-ready");
		}
		this.gesture = null;
	}
}

function resistedDrag(deltaX) {
	if (deltaX <= REPLY_THRESHOLD) return Math.min(deltaX, MAX_DRAG);
	return Math.min(
		MAX_DRAG,
		REPLY_THRESHOLD + (deltaX - REPLY_THRESHOLD) * 0.22
	);
}
