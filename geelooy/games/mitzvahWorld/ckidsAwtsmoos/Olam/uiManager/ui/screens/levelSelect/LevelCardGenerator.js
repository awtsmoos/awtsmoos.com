// B"H
/**
 * @class LevelCardGenerator
 * @description
 * Chapter 396: Legacy level cards seal their clicks before the world hears.
 *
 * This UI builder path can still awaken from the main menu. Every card and
 * close-like control must swallow the event before the 3D raycaster receives a
 * ghost click behind the panel.
 */
function seal(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.stopImmediatePropagation?.();
}

export class LevelCardGenerator {
  /** @param {Array<object>} levelMap Level-card data. */
  static generate(levelMap) {
    return levelMap.map(lvl => ({
      className: `ls-card ${lvl.id.split('.')[0]} ${lvl.locked ? 'locked' : 'unlocked'}`,
      onclick(e, $, ui) {
        seal(e);
        if (lvl.locked) {
          const overlay = $("effectsOverlay");
          if (overlay) ui.peula(overlay, { text: `${lvl.title} is sealed.`, color: "#b0bec5" });
          return;
        }
        ui.peula($("levelSelectScreen"), { launch: lvl.id });
      },
      onpointerdown(e) { seal(e); },
      ontouchstart(e) { seal(e); },
      children: [
        { className: "ls-icon", textContent: lvl.icon || "✦" },
        { className: "ls-card-title", textContent: lvl.title },
        { className: "ls-card-desc", textContent: lvl.desc },
        { className: "ls-card-lock", textContent: lvl.locked ? "LOCKED" : "ENTER" }
      ]
    }));
  }
}
