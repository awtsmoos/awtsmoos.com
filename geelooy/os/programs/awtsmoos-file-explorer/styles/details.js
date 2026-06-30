// B"H
export default /*css*/`
.details-view {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 560px;
}
.details-view::before {
  content: "Name  ·  Type  ·  Mount";
  position: sticky;
  top: 0;
  z-index: 4;
  padding: 9px 14px;
  border: 1px solid rgba(125,211,252,.18);
  border-radius: 14px;
  background: rgba(2,6,23,.72);
  color: var(--awts-explorer-faint);
  font-size: 10px;
  font-weight: 950;
  letter-spacing: .14em;
  text-transform: uppercase;
  backdrop-filter: blur(14px);
}
.details-view .file-item.icon {
  display: grid;
  grid-template-columns: 42px minmax(180px, 1fr) 90px 138px;
  align-items: center;
  min-height: 56px;
  padding: 8px 12px;
  gap: 12px;
  border-radius: 16px;
}
.details-view .file-item.icon .icon-img { width: 38px; height: 38px; margin: 0; }
.details-view .file-name { text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.details-view .item-meta { margin: 0; }
.details-view .mount-badge { justify-self: end; margin: 0; }
.details-view .file-item.icon::before { background: linear-gradient(90deg, rgba(125,211,252,.08), transparent); }
.details-view .file-item.icon:hover { transform: translateX(3px); }
.details-view .awts-kind-folder .file-name::after { content: " /"; color: var(--awts-explorer-gold); }
.details-view .awts-kind-file[data-extension="js"] .item-meta { color: #facc15; }
.details-view .awts-kind-file[data-extension="css"] .item-meta { color: var(--awts-explorer-blue); }
.details-view .awts-kind-file[data-extension="html"] .item-meta { color: #fb923c; }
`;

/** B"H: details view is the same body, straightened into a ledger of vessels. */
