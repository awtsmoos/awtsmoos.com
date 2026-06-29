// B"H
/** @file npcCssPortraitText.js @description Portrait labels and responsive CSS. */
export const NPC_UI_PORTRAIT_TEXT = `
.awts-npc-portrait-name {
  font-size: 15px;
  font-weight: 1000;
  text-transform: uppercase;
  text-shadow: 0 2px 4px #000;
}

.awts-npc-portrait-subtitle,
.awts-npc-subtitle {
  color: #d7ecff;
  text-transform: uppercase;
  letter-spacing: .08em;
}

.awts-npc-portrait-subtitle {
  font-size: 11px;
  opacity: .86;
}

.awts-npc-heading {
  min-width: 0;
}

.awts-npc-subtitle {
  font-weight: 800;
  margin-top: -5px;
  opacity: .9;
}

@media (max-width: 720px) {
  .awts-npc-hero {
    grid-template-columns: 96px minmax(0, 1fr);
    gap: 10px;
  }

  .awts-npc-portrait-ring {
    width: 82px;
    height: 82px;
    padding: 5px;
  }

  .awts-npc-portrait-face {
    font-size: 16px;
  }

  .awts-npc-portrait-emoji {
    font-size: 24px;
  }

  .awts-npc-portrait-name {
    font-size: 12px;
  }

  .awts-npc-portrait-subtitle {
    font-size: 9px;
  }

  .awts-npc-portrait-level {
    font-size: 10px;
    min-width: 36px;
  }
}
`;
export default NPC_UI_PORTRAIT_TEXT;
