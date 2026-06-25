// B"H
/** Chapter 585: The Code Forge can shift between pulse, entropy, spotlight, and map. */
const MODES = ['pulse', 'spotlight', 'entropy', 'map'];
function apply(mode) {
  document.body.dataset.civilizationMode = mode;
  document.body.classList.toggle('civ-heat-2', mode === 'pulse');
  document.body.classList.toggle('civ-heat-3', mode === 'entropy');
}
export const CivilizationPulseModes = {
  mode: 'pulse',
  init() { apply(this.mode); },
  next() {
    const i = MODES.indexOf(this.mode);
    this.mode = MODES[(i + 1) % MODES.length];
    apply(this.mode);
    return this.mode;
  }
};
