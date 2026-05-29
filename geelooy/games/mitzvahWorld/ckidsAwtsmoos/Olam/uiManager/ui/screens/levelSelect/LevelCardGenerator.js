// B"H
/**
 * @class LevelCardGenerator
 * @description Chapter 61: no mojibake. Locked gates show plain readable text.
 */
export class LevelCardGenerator {
  /** @param {Array<object>} levelMap Level-card data. */
  static generate(levelMap) {
    return levelMap.map(lvl => ({
      className: `ls-card ${lvl.id.split('.')[0]} ${lvl.locked ? 'locked' : 'unlocked'}`,
      onclick(e, $, ui) {
        if (lvl.locked) {
          const overlay = $("effectsOverlay");
          if (overlay) ui.peula(overlay, { text: `${lvl.title} is sealed. Finish earlier chambers first.`, color: "#b0bec5" });
          return;
        }
        ui.peula($("levelSelectScreen"), { launch: lvl.id });
      },
      children: [
        { className: "ls-icon", textContent: lvl.locked ? "LOCK" : lvl.icon },
        { className: "ls-card-title", textContent: lvl.title },
        { className: "ls-card-desc", textContent: lvl.desc },
        { className: "ls-card-lock", textContent: lvl.locked ? "LOCKED" : "ENTER" }
      ]
    }));
  }
}
