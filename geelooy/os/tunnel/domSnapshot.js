// B"H
export function basicSnapshot() {
  return {
    title:document.title,
    windows:[...document.querySelectorAll(".window")].map(windowInfo),
    fullscreen:!!document.fullscreenElement
  };
}

export function windowInfo(element) {
  const rect = element.getBoundingClientRect?.();
  return {
    id:element.dataset.id || "",
    title:element.querySelector(".window-header")?.textContent?.trim() || element.textContent.slice(0, 80),
    className:element.className,
    rect:rect ? { x:rect.x, y:rect.y, width:rect.width, height:rect.height } : null
  };
}

export function startMenuItems() {
  return [...document.querySelectorAll("#menu-items li")]
    .map(item => item.textContent.trim())
    .filter(Boolean);
}

/**
 * B"H
 * DOM snapshots are the mirror-water of the Virtual OS. They do not own the
 * windows; they only catch their outline so the remote eye can see the room.
 */
