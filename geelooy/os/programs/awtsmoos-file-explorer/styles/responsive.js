// B"H
export default /*css*/`
@media (max-width: 720px) {
  .file-explorer-header { padding: 10px; }
  .button-bar { flex-wrap: wrap; gap: 8px; }
  .menu-buttons, .view-controls { flex-wrap: wrap; }
  .menu-buttons button, .view-controls button { padding: 7px 10px; }
  .file-explorer-content { flex-direction: column; }
  .file-explorer-sidebar { width: 100%; max-height: 150px; border-right: 0; border-bottom: 1px solid rgba(125,211,252,.18); }
  .sidebar-resizer { display: none; }
  .file-explorer-body { padding: 12px; }
  .icons-view { grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 10px; }
  .file-item.icon { min-height: 128px; border-radius: 16px; }
  .file-item.icon .icon-img { width: 52px; height: 52px; }
  .details-view { min-width: 0; }
  .details-view .file-item.icon { grid-template-columns: 36px minmax(0, 1fr); }
  .details-view .item-meta, .details-view .mount-badge { grid-column: 2; justify-self: start; }
  .drive-shelf::before { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .file-explorer *, .file-explorer *::before, .file-explorer *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: .001ms !important;
  }
  .file-item.icon:hover, .tree-node-content:hover, .drive-chip:hover { transform: none; }
}
`;

/** B"H: motion bows out when the human asks for stillness. */
