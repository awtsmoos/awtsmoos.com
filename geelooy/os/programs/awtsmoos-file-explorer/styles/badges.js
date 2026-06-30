// B"H
export default /*css*/`
.mount-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  margin-top: 9px;
  padding: 4px 8px;
  border: 1px solid rgba(148,163,184,.18);
  border-radius: 999px;
  background: rgba(2,6,23,.46);
  color: var(--awts-explorer-muted);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .07em;
  white-space: nowrap;
}
.mount-local .mount-badge { border-color: rgba(52,211,153,.34); color: #bbf7d0; }
.mount-tunnel .mount-badge, .remote-file-item .mount-badge { border-color: rgba(56,189,248,.42); color: #bae6fd; }
.mount-preview .mount-badge { border-color: rgba(192,132,252,.42); color: #e9d5ff; }
.mount-denied .mount-badge { border-color: rgba(251,113,133,.48); color: #fecdd3; }
.mount-local::after, .mount-tunnel::after, .mount-preview::after, .mount-denied::after {
  content: "";
  position: absolute;
  top: 10px;
  right: 10px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--awts-explorer-green);
  box-shadow: 0 0 18px currentColor;
}
.mount-tunnel::after { background: var(--awts-explorer-blue); }
.mount-preview::after { background: var(--awts-explorer-purple); }
.mount-denied::after { background: var(--awts-explorer-red); }
.awts-kind-folder { border-color: rgba(251,191,36,.24); }
.awts-kind-folder .file-name { color: #fde68a; }
.awts-kind-file[data-extension="js"] .file-name { color: #fef08a; }
.awts-kind-file[data-extension="css"] .file-name { color: #bae6fd; }
.awts-kind-file[data-extension="html"] .file-name { color: #fed7aa; }
.awts-icon-folder { filter: drop-shadow(0 0 12px rgba(251,191,36,.35)); }
.awts-icon-js, .awts-icon-css, .awts-icon-html { filter: drop-shadow(0 0 10px rgba(255,255,255,.12)); }
`;

/** B"H: badges tell locality, permission, sync, and kind without shouting. */
