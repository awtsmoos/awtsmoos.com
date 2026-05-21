/**
 * B"H
 * Chapter 48: The Hidden Pulse Became Visible.
 */

export class RuntimeDiagnosticsOverlay {
  constructor() {
    this.samples = [];
  }

  sample(label, value) {
    const record = { label, value, index: this.samples.length };
    this.samples.push(record);
    return record;
  }

  summary() {
    return this.samples.reduce((acc, item) => ({ ...acc, [item.label]: item.value }), {});
  }
}

export default RuntimeDiagnosticsOverlay;
