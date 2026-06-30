// B"H
import { getCurrentPage } from './pages.js';
const KEY = 'awtsmoos:desktop:shortcuts:v1';
export function loadShortcuts() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }
export function addShortcut(shortcut) { const all = loadShortcuts(); const item = { id:`shortcut-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title:shortcut.title || 'Shortcut', icon:shortcut.icon || '🔗', kind:shortcut.kind || 'shortcut', path:shortcut.path || '/', page:shortcut.page ?? getCurrentPage(), badge:shortcut.badge || 'link' }; all.push(item); saveShortcuts(all); return item; }
export function saveShortcuts(items) { try { localStorage.setItem(KEY, JSON.stringify(items || [])); } catch {} }
/** B"H: user-made desktop shortcuts remember which world/page birthed them. */
