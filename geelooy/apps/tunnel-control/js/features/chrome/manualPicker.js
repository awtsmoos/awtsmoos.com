
// B"H

import { el } from "../../lib/dom.js";
import { writeField } from "./read.js";

const COMMON_WINDOWS_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe"
];

const COMMON_MAC_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
];

const COMMON_LINUX_PATHS = [
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser"
];

/**
 * B"H
 * Returns common Chrome candidate paths.
 *
 * @returns {string[]} Candidate paths.
 */
function candidates() {
  return [
    ...COMMON_WINDOWS_PATHS,
    ...COMMON_MAC_PATHS,
    ...COMMON_LINUX_PATHS
  ];
}

/**
 * B"H
 * Opens a modal node.
 *
 * @param {HTMLElement} modal Modal node.
 * @returns {void}
 */
function open(modal) {
  modal.classList.remove("hidden");
  modal.removeAttribute("hidden");
  document.body.classList.add("modal-open");
}

/**
 * B"H
 * Closes a modal node.
 *
 * @param {HTMLElement} modal Modal node.
 * @returns {void}
 */
function close(modal) {
  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

/**
 * B"H
 * Builds one candidate row.
 *
 * @param {string} path Candidate path.
 * @param {HTMLElement|null} chromePathField Chrome path field.
 * @param {HTMLElement} modal Modal node.
 * @returns {HTMLElement} Candidate row.
 */
function candidateRow(path, chromePathField, modal) {
  return el("div", {
    className: "chrome-candidate",
    children: [
      el("code", { text: path }),
      el("button", {
        type: "button",
        className: "btn-sm",
        text: "Use",
        on: {
          click: () => {
            writeField(chromePathField, path);
            close(modal);
          }
        }
      })
    ]
  });
}

/**
 * B"H
 * Creates the manual Chrome picker modal.
 *
 * @param {object} fields Chrome fields.
 * @returns {HTMLElement} Modal node.
 */
function createManualModal(fields) {
  const manualInput = el("input", {
    id: "chromeManualPathInput",
    type: "text",
    value: fields.chromePath?.value || "",
    placeholder: "Paste full path to chrome.exe or Google Chrome binary"
  });

  const modal = el("div", {
    id: "chromeManualModal",
    className: "hidden",
    attrs: {
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Choose Chrome manually"
    }
  });

  const body = el("div", {
    className: "chrome-manual-body",
    children: [
      el("div", {
        className: "awt-alert",
        children: [
          el("strong", { text: "Choose Chrome manually" }),
          el("span", {
            text: "Use this when auto-detect cannot find Chrome. Paste the exact executable path, or pick one common location below."
          })
        ]
      }),
      el("div", {
        className: "field",
        children: [
          el("label", { text: "Manual Chrome executable path" }),
          manualInput
        ]
      }),
      el("div", {
        className: "chrome-candidates",
        children: candidates().map(path => candidateRow(path, fields.chromePath, modal))
      })
    ]
  });

  const closeButton = el("button", {
    type: "button",
    className: "btn-sm",
    text: "Close",
    on: { click: () => close(modal) }
  });

  const saveButton = el("button", {
    type: "button",
    className: "btn-primary",
    text: "Use this path",
    on: {
      click: () => {
        writeField(fields.chromePath, manualInput.value);
        close(modal);
      }
    }
  });

  modal.append(
    el("div", {
      id: "chromeManualBackdrop",
      className: "awt-modal-backdrop",
      on: { click: () => close(modal) }
    }),
    el("div", {
      className: "chrome-manual-dialog",
      children: [
        el("div", {
          className: "modal-head",
          children: [
            el("div", {
              children: [
                el("div", { className: "root-picker-eyebrow", text: "Chrome path" }),
                el("h2", { className: "modal-title", text: "Manual Chrome picker" }),
                el("p", {
                  text: "Pick a common location or paste the exact Chrome executable path."
                })
              ]
            }),
            closeButton
          ]
        }),
        body,
        el("div", {
          className: "modal-foot",
          children: [
            el("span", {
              className: "awt-muted",
              text: "After saving, click Launch / Connect."
            }),
            el("div", {
              className: "awt-row",
              children: [saveButton]
            })
          ]
        })
      ]
    })
  );

  document.body.append(modal);
  return modal;
}

/**
 * B"H
 * Mounts the manual Chrome picker.
 *
 * @param {HTMLButtonElement} button Button that opens the picker.
 * @param {object} fields Chrome fields.
 * @returns {void}
 */
export function mountManualChromePicker(button, fields) {
  if (!button || button.dataset.awtManualMounted === "1") return;
  button.dataset.awtManualMounted = "1";

  let modal = document.getElementById("chromeManualModal");

  button.addEventListener("click", event => {
    event.preventDefault();
    modal = modal || createManualModal(fields);
    const manualInput = modal.querySelector("#chromeManualPathInput");
    if (manualInput && fields.chromePath) {
      manualInput.value = fields.chromePath.value || "";
    }
    open(modal);
  });
}
