/**
 * B"H
 * @module SmoothScheduler
 * @description
 * Chapter 11: The Awtsmoos does not crush the browser with one stone of work.
 * It releases the student-list sparks in breaths: frame, idle, frame. The UI
 * remains alive, the finger feels instant response, and the scroll does not tear.
 */

const FRAME_BUDGET_MS = 8;

function now() {
    return typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
}

/**
 * Waits one animation frame, falling back to a zero-delay timer.
 * @returns {Promise<number>} Frame timestamp.
 */
export function nextFrame() {
    return new Promise(resolve => {
        if (typeof requestAnimationFrame === "function") requestAnimationFrame(resolve);
        else setTimeout(() => resolve(now()), 0);
    });
}

/**
 * Lets lower-priority work wait for idle time when available.
 * @returns {Promise<void>} Idle completion.
 */
export function nextIdle() {
    return new Promise(resolve => {
        if (typeof requestIdleCallback === "function") requestIdleCallback(() => resolve(), { timeout: 80 });
        else setTimeout(resolve, 0);
    });
}

/**
 * Yields when a render burst has consumed enough frame time.
 * @param {number} startedAt Timestamp captured before a burst.
 * @returns {Promise<boolean>} True when a yield happened.
 */
export async function yieldIfFrameHot(startedAt) {
    if (now() - startedAt < FRAME_BUDGET_MS) return false;
    await nextFrame();
    return true;
}

/**
 * Runs item rendering in small chunks and appends via fragments.
 * @template T
 * @param {T[]} items Items to render.
 * @param {(item: T, index: number) => Node} renderItem Renderer.
 * @param {Element} container Destination element.
 * @param {number} [chunkSize=8] Max items per burst.
 * @returns {Promise<number>} Rendered item count.
 */
export async function renderChunked(items, renderItem, container, chunkSize = 8) {
    if (!Array.isArray(items) || !container) return 0;
    let rendered = 0;
    await nextFrame();

    for (let index = 0; index < items.length; index += chunkSize) {
        const fragment = document.createDocumentFragment();
        const startedAt = now();
        items.slice(index, index + chunkSize).forEach((item, offset) => {
            const node = renderItem(item, index + offset);
            if (node) fragment.appendChild(node);
            rendered++;
        });
        container.appendChild(fragment);
        await yieldIfFrameHot(startedAt) || await nextIdle();
    }

    return rendered;
}
