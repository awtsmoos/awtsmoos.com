// B"H

/**
 * B"H
 * Chapter 382: Panel Detection Became A Gatekeeper.
 */
export function textOf(el, fallback) {
  const heading = el.querySelector(":scope > h1,:scope > h2,:scope > h3,:scope > [data-title]");
  const txt = heading ? heading.textContent.trim() : "";
  return txt || fallback || "Panel";
}

function isHeroLike(el) {
  return (
    el.matches(".hero, header, [data-hero], .landing-hero, .hero-card") ||
    el.closest(".hero, header, [data-hero], .landing-hero, .hero-card")
  );
}

function isNavLike(el) {
  return (
    el.matches("nav, [data-tabs], .tabs, .tabbar, .awt-floating-map") ||
    el.closest("nav, [data-tabs], .tabs, .tabbar, .awt-floating-map")
  );
}

export function shouldWrap(el) {
  if (!el || el.dataset.awtPanelReady === "yes") return false;
  if (isHeroLike(el) || isNavLike(el)) return false;
  if (el.matches("[data-pane]")) return true;
  if (el.matches(".control-section")) return true;
  if (el.matches(".dashboard-section")) return true;
  if (el.matches(".panel-section")) return true;
  return false;
}
