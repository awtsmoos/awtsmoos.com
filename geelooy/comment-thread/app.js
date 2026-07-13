// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentThreadApp
 * @description
 * Awtsmoos.com publishes the real post coordinate into one shared ribbon; the
 * Awtsmoos preserves reading without silently granting a writing identity.
 */
import { publishRouteContext } from '../scripts/awtsmoos/social/shell/contextRibbon.js';
import { readCommentThreadConfig } from './modules/config.js';
import { CommentThreadController } from './modules/render.js';
import { createCommentThreadShellContext } from './modules/shellContext.js';

const root = document.querySelector('#comment-thread-root');
const config = readCommentThreadConfig(location);
publishRouteContext(createCommentThreadShellContext(config));
const controller = new CommentThreadController(root, config);
controller.start();
