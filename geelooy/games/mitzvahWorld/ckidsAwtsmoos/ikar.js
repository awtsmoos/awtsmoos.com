/**
 * B"H
 * @file ikar.js
 * @description
 * Main entry point for the Mitzvah World UI layer.
 *
 * Fixes:
 * - safer deep-link loading
 * - Blob URL cleanup
 * - better fetch diagnostics
 * - no silent JSON world-file confusion
 * - no endless menu hiding when world load fails
 */

import ManagerOfAllWorlds from "./Olam/worldManager/index.js";
import config from "../tochen/config/config.awtsmoos.js";

/**
 * B"H
 * The old world Blob URL, so repeated loads do not leak memory.
 */
let lastWorldBlobUrl = null;

/**
 * B"H
 * Creates the manager.
 *
 * @returns {ManagerOfAllWorlds}
 * The world manager.
 */
function createManager() {
  const manager = new ManagerOfAllWorlds("/oyvedEdom.js");
  window.mana = manager;
  return manager;
}

/**
 * B"H
 * Gets UI nodes from the internal UI registry or DOM fallback.
 *
 * @returns {{ikar: Element|null, menu: Element|null, loading: Element|null}}
 * Important interface elements.
 */
function getUI() {
  let ikar = null;
  let menu = null;
  let loading = null;

  if (window.mana?.ui && typeof window.mana.ui.$g === "function") {
    ikar = window.mana.ui.$g("ikar");
    menu = window.mana.ui.$g("menu") || window.mana.ui.$g("main menu");
    loading = window.mana.ui.$g("loading");
  }

  if (!menu) menu = document.querySelector(".gameMenu") || document.querySelector(".menu");
  if (!loading) loading = document.querySelector(".loading");

  return { ikar, menu, loading };
}

/**
 * B"H
 * Builds an API path from alias and level.
 *
 * @param {URLSearchParams} urlParams
 * Current query params.
 *
 * @returns {{alias: string|null, path: string|null}}
 * Deep-link load details.
 */
function getDeepLink(urlParams) {
  const alias = urlParams.get("alias");
  const level = urlParams.get("level");
  let path = urlParams.get("path");

  if (alias && level && !path) {
    const filename = level.endsWith(".js") ? level : `${level}.js`;
    const internalPath = encodeURIComponent(`desktop.folder/game data.folder/worlds/${filename}`);
    path = `/api/social/aliases/${alias}/fileSystem/readFile?path=${internalPath}`;
  }

  return { alias, path };
}

/**
 * B"H
 * Fetches a user world JS file and validates that it is not a JSON error.
 *
 * @param {string} path
 * API or direct URL.
 *
 * @returns {Promise<string>}
 * JavaScript source text.
 */
async function fetchWorldSource(path) {
  const response = await fetch(path, {
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      "Accept": "text/javascript, application/javascript, text/plain, */*;q=0.1"
    }
  });

  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `World file fetch failed with HTTP ${response.status}. ` +
      `Content-Type: ${contentType}. Preview: ${text.slice(0, 250)}`
    );
  }

  const trimmed = text.trim();

  if (contentType.includes("application/json") && trimmed.startsWith("{")) {
    throw new Error(
      `World path returned JSON instead of JavaScript. ` +
      `This usually means a server/API error. Preview: ${trimmed.slice(0, 250)}`
    );
  }

  if (!trimmed) {
    throw new Error("World file was empty.");
  }

  return text;
}

/**
 * B"H
 * Converts fetched JS text into a Blob module URL.
 *
 * @param {string} source
 * JavaScript source.
 *
 * @returns {string}
 * Blob URL.
 */
function makeWorldBlobUrl(source) {
  if (lastWorldBlobUrl) {
    URL.revokeObjectURL(lastWorldBlobUrl);
    lastWorldBlobUrl = null;
  }

  lastWorldBlobUrl = URL.createObjectURL(
    new Blob([source], { type: "text/javascript" })
  );

  return lastWorldBlobUrl;
}

/**
 * B"H
 * Waits for the ikar UI to be ready.
 *
 * @param {number} maxAttempts
 * Maximum polling attempts.
 *
 * @returns {Promise<Element>}
 * The ikar element.
 */
function waitForIkar(maxAttempts = 200) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const interval = setInterval(() => {
      attempts++;
      const { ikar } = getUI();

      if (ikar && window.awtsmoosGameUI) {
        clearInterval(interval);
        resolve(ikar);
        return;
      }

      if (attempts > maxAttempts) {
        clearInterval(interval);
        reject(new Error("UI readiness timed out. ikar or awtsmoosGameUI missing."));
      }
    }, 100);
  });
}

/**
 * B"H
 * Shows or hides loading/menu state.
 *
 * @param {boolean} loadingOn
 * Whether loading is active.
 *
 * @returns {void}
 */
function setLoadingState(loadingOn) {
  const { menu, loading } = getUI();

  if (loadingOn) {
    if (menu) {
      menu.classList.add("hidden", "offscreen");
      menu.classList.remove("onscreen");
    }

    if (loading) loading.classList.remove("hidden");
    return;
  }

  if (menu) {
    menu.classList.remove("hidden", "offscreen");
    menu.classList.add("onscreen");
  }

  if (loading) loading.classList.add("hidden");
}

/**
 * B"H
 * Auto-loads a world from query params.
 *
 * @returns {Promise<void>}
 */
async function handleAutoLoad() {
  const urlParams = new URLSearchParams(window.location.search);
  const { alias, path } = getDeepLink(urlParams);

  if (path) {
    try {
      const ikar = await waitForIkar();
      setLoadingState(true);

      const source = await fetchWorldSource(path);
      const blobUrl = makeWorldBlobUrl(source);

      ikar.dispatchEvent(
        new CustomEvent("start", {
          detail: {
            worldDayuhURL: blobUrl,
            sourcePath: path,
            gameUiHTML: window.awtsmoosGameUI
          }
        })
      );
    } catch (error) {
      console.error("B\"H Auto-load failed:", error);
      alert(`Failed to load world.\n${error.message}`);
      setLoadingState(false);
    }

    return;
  }

  if (alias) {
    let attempts = 0;

    const interval = setInterval(() => {
      attempts++;

      if (attempts > 100) {
        clearInterval(interval);
        return;
      }

      const { ikar, menu } = getUI();

      if (ikar && window.ui && window.mana?.ui) {
        clearInterval(interval);

        if (menu) menu.classList.add("hidden");

        const fwScreen = window.mana.ui.$g("find worlds") || document.querySelector(".findWorlds");

        if (fwScreen) {
          fwScreen.classList.remove("hidden");
          window.ui.peula(fwScreen, {
            loadAliasWorlds: {
              alias,
              title: `Deep Link: ${alias}`
            }
          });
        }
      }
    }, 100);
  }
}

/**
 * B"H
 * Starts the UI layer.
 *
 * @returns {void}
 */
function bootIkar() {
  if (window.invalid) return;

  createManager();

  if (document.readyState === "complete") {
    handleAutoLoad();
  } else {
    window.addEventListener("load", handleAutoLoad, { once: true });
  }
}

try {
  bootIkar();
} catch (error) {
  console.error("B\"H - Error caught:", error);
}