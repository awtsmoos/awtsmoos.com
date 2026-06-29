// B"H
/**
 * @file ItemIconResolver.js
 * @description Stable icon resolver for every bag, loot, vendor, and wardrobe item.
 */
const TOKEN_ICONS = Object.freeze({
  SPARK: "✨",
  PAGE: "📜",
  MAIL: "✉️",
  HERB: "🌿",
  WOOD: "🪵",
  THREAD: "🧵",
  WHEAT: "🌾",
  TERUMAH: "🥖",
  BASKET: "🧺",
  KNF: "🔪",
  MEAT: "🥩",
  "MEAT?": "❓",
  HIDE: "🟫",
  LEATHER: "📕",
  FUR: "🦊",
  KLAF: "📜",
  BATIM: "⬛",
  TEF: "◼️",
  MEAL: "🍲",
  BREAD: "🍞",
  CLOAK: "🧥",
  FRIEND: "🤝",
  CAN: "🚿",
  INK: "🖋️",
  KEY: "🗝️",
  SEFER: "📖"
});

const CATEGORY_ICONS = Object.freeze({
  "Sefarim": "📖",
  "Quest Items": "❗",
  "Materials": "🧰",
  "Food": "🍞",
  "Equipment": "🛡️",
  "Torah Artifacts": "✨"
});

function isImageIcon(icon) {
  return typeof icon === "string" && (icon.includes("/") || icon.startsWith("data:"));
}

function looksLikePlaceholder(icon) {
  return typeof icon === "string" && /^[A-Z0-9_? -]{2,16}$/.test(icon.trim());
}

function byName(item = {}) {
  const text = `${item.id || ""} ${item.name || ""} ${item.category || ""}`.toLowerCase();
  if (/sefer|siddur|chumash|book|bereishis|torah/.test(text)) return "📖";
  if (/key/.test(text)) return "🗝️";
  if (/bread|meal|food|wheat/.test(text)) return "🍞";
  if (/meat|cow|hide|leather|fur|fox|cloak/.test(text)) return "🥩";
  if (/herb|produce|farm|watering/.test(text)) return "🌿";
  if (/wood|log|bridge/.test(text)) return "🪵";
  if (/knife|tool|staff|sword|bow/.test(text)) return "⚔️";
  if (/letter|mail|page|parchment|ink/.test(text)) return "📜";
  if (/spark|tefillin|batim|klaf|artifact/.test(text)) return "✨";
  return CATEGORY_ICONS[item.category] || "🎒";
}

export function resolveItemIcon(item = {}) {
  const icon = item?.icon;
  if (isImageIcon(icon)) return icon;
  if (typeof icon === "string" && !looksLikePlaceholder(icon)) return icon;
  const token = String(icon || item?.iconToken || "").trim().toUpperCase();
  return TOKEN_ICONS[token] || byName(item);
}

export function decorateItemIcon(item = {}) {
  if (!item || typeof item !== "object") return item;
  return { ...item, icon: resolveItemIcon(item), iconToken: item.icon };
}

export default resolveItemIcon;
