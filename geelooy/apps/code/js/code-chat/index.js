// B"H
/**
 * @file index.js
 * @brief Public native Code Chat facade.
 */

import { CodeChatPanel } from './panel.js';
import { activeFileScope, globalScope } from './scopes.js';
import { AiStudioContext } from '../ai-studio/context.js';

export const CodeChat = {
  open: scope => CodeChatPanel.open(scope),
  openFile: () => CodeChatPanel.open(activeFileScope(AiStudioContext.gather())),
  openGlobal: () => CodeChatPanel.open(globalScope())
};
