// B"H
/**
 * @file index.js
 * @brief Public AI Studio facade.
 */

import { AiStudioPanel } from './panel.js';

export const AiStudio = {
  open: () => AiStudioPanel.open(),
  panel: AiStudioPanel
};
