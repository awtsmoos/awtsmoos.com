// B"H
/**
 * Chapter 1: The Iron Chamber Of Slots.
 *
 * The Awtsmoos breathes names into reality, yet this chamber refuses to spend
 * that holy breath on every lookup. A local is carved once into a slot, then
 * the runner touches a compact numeric gate instead of wandering through the
 * string-pool forest. The story is practical: tiny frame records, direct parent
 * refs, and typed arrays that remember where each lexical world begins.
 */
class Mode2SlotFrames {
  /**
   * Creates the arena where lexical frames stand like stacked worlds.
   * @param {number} valueCapacity Maximum value cells in the local arena.
   * @param {number} frameCapacity Maximum frame headers in the frame arena.
   */
  constructor(valueCapacity = 1024, frameCapacity = 128) {
    this.values = new Array(valueCapacity);
    this.frameBase = new Uint32Array(frameCapacity);
    this.frameSize = new Uint32Array(frameCapacity);
    this.frameParent = new Int32Array(frameCapacity);
    this.frameCount = 0;
    this.valueTop = 0;
  }

  /**
   * Enters a lexical frame and returns its numeric frame id.
   * @param {number} slotCount Amount of local slots reserved for the frame.
   * @param {number} parentFrame Parent lexical frame id, or -1 for root.
   * @returns {number} The allocated frame id.
   */
  enter(slotCount = 0, parentFrame = -1) {
    if (this.frameCount >= this.frameBase.length) throw new Error('MD2 slot frame arena overflow');
    if (this.valueTop + slotCount > this.values.length) throw new Error('MD2 slot value arena overflow');
    const frame = this.frameCount++;
    this.frameBase[frame] = this.valueTop;
    this.frameSize[frame] = slotCount;
    this.frameParent[frame] = parentFrame;
    this.valueTop += slotCount;
    return frame;
  }

  /**
   * Reads a local slot directly from a frame.
   * @param {number} frame Numeric frame id.
   * @param {number} slot Numeric local slot id.
   * @returns {*} The stored value.
   */
  load(frame, slot) {
    this.assertSlot(frame, slot);
    return this.values[this.frameBase[frame] + slot];
  }

  /**
   * Writes a local slot directly inside a frame.
   * @param {number} frame Numeric frame id.
   * @param {number} slot Numeric local slot id.
   * @param {*} value Value to store.
   * @returns {*} The same value for stack-friendly STORE_SLOT semantics.
   */
  store(frame, slot, value) {
    this.assertSlot(frame, slot);
    this.values[this.frameBase[frame] + slot] = value;
    return value;
  }

  /**
   * Walks parent refs to read a captured slot.
   * @param {number} frame Starting frame id.
   * @param {number} depth Number of parent hops.
   * @param {number} slot Slot id in the ancestor frame.
   * @returns {*} The captured value.
   */
  loadClosure(frame, depth, slot) {
    return this.load(this.ancestor(frame, depth), slot);
  }

  /**
   * Walks parent refs to write a captured slot.
   * @param {number} frame Starting frame id.
   * @param {number} depth Number of parent hops.
   * @param {number} slot Slot id in the ancestor frame.
   * @param {*} value Value to store.
   * @returns {*} The stored value.
   */
  storeClosure(frame, depth, slot, value) {
    return this.store(this.ancestor(frame, depth), slot, value);
  }

  /**
   * Finds an ancestor frame by lexical depth.
   * @param {number} frame Starting frame id.
   * @param {number} depth Number of parent hops.
   * @returns {number} Ancestor frame id.
   */
  ancestor(frame, depth) {
    let cursor = frame;
    for (let i = 0; i < depth; i++) cursor = this.frameParent[cursor];
    if (cursor < 0) throw new Error('MD2 closure slot parent missing');
    return cursor;
  }

  /**
   * Guards direct slot access with exact bounds.
   * @param {number} frame Numeric frame id.
   * @param {number} slot Numeric local slot id.
   */
  assertSlot(frame, slot) {
    if (frame < 0 || frame >= this.frameCount) throw new Error(`MD2 bad slot frame ${frame}`);
    if (slot < 0 || slot >= this.frameSize[frame]) throw new Error(`MD2 bad slot ${slot}`);
  }
}

module.exports = { Mode2SlotFrames };
