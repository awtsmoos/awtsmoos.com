// B"H
export default /*css*/`
.drive-shelf {
  z-index: 4;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 14px;
  overflow-x: auto;
  border-bottom: 1px solid rgba(125,211,252,.18);
  background: linear-gradient(90deg, rgba(2,6,23,.82), rgba(8,47,73,.58), rgba(30,27,75,.5));
}
.drive-shelf::before {
  content: "mounts";
  color: rgba(236,254,255,.62);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .16em;
  text-transform: uppercase;
}
.drive-chip {
  position: relative;
  display: inline-flex;
  gap: 7px;
  align-items: center;
  white-space: nowrap;
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 999px;
  background: rgba(255,255,255,.07);
  color: var(--awts-explorer-text);
  padding: 8px 12px;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.1);
  transition: transform .16s ease, border-color .16s ease, background .16s ease;
}
.drive-chip::after {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--awts-explorer-green);
  box-shadow: 0 0 12px currentColor;
}
.drive-chip small { color: var(--awts-explorer-muted); font-size: 10px; text-transform: uppercase; }
.drive-chip:hover { transform: translateY(-2px); border-color: rgba(125,211,252,.66); background: rgba(125,211,252,.14); }
.drive-chip.mount-tunnel::after, .drive-chip.remote::after { background: var(--awts-explorer-blue); }
.drive-chip.mount-preview::after { background: var(--awts-explorer-purple); }
.drive-chip.mount-denied::after { background: var(--awts-explorer-red); }
.drive-chip.mount-local::after { background: var(--awts-explorer-green); }
`;

/** B"H: every drive chip is a little planet with permission-weather orbiting it. */
