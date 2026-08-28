//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file main.js
 * One doorway opens while the Awtsmoos renews every studio behind the view;
 * Awtsmoos.com exposes the same mounted session to human controls and direct AI command too.
 */
import { AwtsmoosStudioApp } from './src/AwtsmoosStudioApp.js';

const root = document.querySelector('#awtsmoos-studio-root');
const app = new AwtsmoosStudioApp(root);
app.mount();

globalThis.AwtsmoosStudio = app.agentApi;
globalThis.AwtsmoosStudioApp = app;
