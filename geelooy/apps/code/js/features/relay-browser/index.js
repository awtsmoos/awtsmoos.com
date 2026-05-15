
// B"H
/**
 * @file index.js
 * @brief The Orchestrator of the Distant Vision.
 * 
 * THE CHRONICLE OF THE FAR-SEEING EYE:
 * When the soul wishes to touch a server miles away,
 * It cannot walk the path with feet of clay.
 * It must construct a chariot of pure HTML light,
 * To pierce the veil and end the endless night.
 * This module manifests the Relay Browser from nothingness,
 * Querying the remote endpoints to unveil the hidden directories,
 * using purely data-driven logic and profound JSON blueprints.
 */

import { HTML } from '../../html-generator.js';
import { UI } from '../../ui.js';

export const RelayBrowser = {
    /**
     * B"H
     * Opens a window into the remote server's soul, allowing the user to navigate
     * the distant directories and select a foundational root for the new workspace.
     * 
     * @param {string} url - The sacred address of the Relay server.
     * @returns {Promise<string|null>} The absolute path chosen by the observer, or null if abandoned.
     */
    async selectRoot(url) {
        return new Promise((resolve) => {
            let currentPath = '/';
            let items = [];
            let overlayEl = null;
            let viewMode = 'list'; // B"H - Added structural toggle state: 'list' or 'grid'

            // B"H - The ritual of concluding the vision
            const cleanup = (result) => {
                if (overlayEl && overlayEl.parentNode) {
                    overlayEl.parentNode.removeChild(overlayEl);
                }
                resolve(result);
            };

            // B"H - Reaching across the void
            const fetchList = async (path) => {
                UI.showLoading("Traversing distant dimensions...");
                try {
                    const params = new URLSearchParams();
                    params.append('action', 'list');
                    params.append('filepath', path);
                    
                    const res = await fetch(url.replace(/\/+$/, ''), {
                        method: 'POST',
                        body: params.toString(),
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    });
                    
                    if (!res.ok) throw new Error(res.statusText);
                    const data = await res.json();
                    
                    // B"H - Parsing the heterogeneous truth of the server's response
                    items = data.map(child => {
                        if (typeof child === 'string') {
                            // If it's a raw string, we infer directory based on lack of file extension
                            return { name: child, isDir: !child.includes('.') };
                        }
                        return { 
                            name: child.name, 
                            isDir: child.isDirectory || child.type === 'directory' || child.kind === 'directory' 
                        };
                    }).sort((a,b) => (a.isDir === b.isDir ? a.name.localeCompare(b.name) : (a.isDir ? -1 : 1)));
                    
                    currentPath = path.replace(/\/+/g, '/');
                    render();
                } catch (e) {
                    const message = e?.message || String(e);
                    const advice = message.includes('Failed to fetch')
                        ? 'Could not reach the Relay Server. Make sure it is running, usually with: node relay-server.js, and that it sends CORS headers.'
                        : message;
                    UI.showToast(`B"H - Relay connection failed: ${advice}`, "error", 10000);
                    cleanup(null);
                } finally {
                    UI.hideLoading();
                }
            };

            // B"H - Ascending the Seder Hishtalshelus
            const goUp = () => {
                if (currentPath === '/') return;
                const parts = currentPath.split('/').filter(Boolean);
                parts.pop();
                fetchList('/' + parts.join('/'));
            };

            // B"H - The continuous re-manifestation of the UI
            const render = () => {
                const isList = viewMode === 'list';

                const newEl = HTML({
                    className: 'relay-browser-overlay',
                    style: { 
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
                        background: 'rgba(0,0,0,0.85)', zIndex: 100000, display: 'flex', 
                        justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)' 
                    },
                    children: [
                        {
                            style: { 
                                background: 'var(--color-bg-secondary)', width: '800px', height: '90vh', 
                                borderRadius: '8px', border: '1px solid var(--neon-cyan)', display: 'flex', 
                                flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' 
                            },
                            children: [
                                // HEADER - Super Compact
                                {
                                    style: { 
                                        padding: '8px 12px', borderBottom: '1px solid var(--color-border)', 
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                        background: 'rgba(0,0,0,0.4)', flexShrink: 0
                                    },
                                    children: [
                                        { 
                                            tag: 'h4', text: 'Relay Directory Selector', 
                                            style: { margin: 0, color: 'var(--neon-cyan)', fontSize: '1em' } 
                                        },
                                        { 
                                            tag: 'button', text: '✖', 
                                            style: { 
                                                background: 'transparent', border: 'none', color: 'var(--color-accent-danger)', 
                                                cursor: 'pointer', fontSize: '1.2em', fontWeight: 'bold', padding: '0 4px'
                                            }, 
                                            onClick: () => cleanup(null) 
                                        }
                                    ]
                                },
                                // CONTROLS - Super Compact
                                {
                                    style: { 
                                        padding: '6px 12px', background: 'rgba(255,255,255,0.02)', display: 'flex', 
                                        gap: '8px', alignItems: 'center', borderBottom: '1px solid var(--color-border)', flexShrink: 0
                                    },
                                    children: [
                                        { 
                                            tag: 'button', text: '▲ UP', className: 'secondary-btn', 
                                            style: { minHeight: '28px', padding: '0 10px', fontSize: '0.8em' }, 
                                            onClick: () => goUp() 
                                        },
                                        { 
                                            tag: 'input', value: currentPath, 
                                            style: { 
                                                flexGrow: 1, background: '#000', color: 'var(--neon-lime)', 
                                                border: '1px solid #444', padding: '4px 8px', borderRadius: '4px', 
                                                outline: 'none', fontFamily: 'var(--font-code)', fontSize: '0.85em'
                                            }, 
                                            events: { 
                                                keydown: (e) => {
                                                    if (e.key === 'Enter') fetchList(e.target.value);
                                                }
                                            }
                                        },
                                        // View Toggles
                                        {
                                            style: { 
                                                display: 'flex', gap: '2px', background: 'rgba(0,0,0,0.5)', 
                                                padding: '2px', borderRadius: '4px', border: '1px solid var(--color-border)' 
                                            },
                                            children: [
                                                { 
                                                    tag: 'button', className: 'icon-button', title: 'Details View',
                                                    style: { 
                                                        width: '24px', height: '24px', padding: '2px', 
                                                        background: isList ? 'var(--neon-cyan)' : 'transparent', 
                                                        color: isList ? '#000' : 'var(--color-text-secondary)', 
                                                        minHeight: '0', borderRadius: '2px' 
                                                    }, 
                                                    html: '<svg class="svg-icon" style="width:14px;height:14px;"><use href="#icon-list"></use></svg>', 
                                                    onClick: () => { viewMode = 'list'; render(); } 
                                                },
                                                { 
                                                    tag: 'button', className: 'icon-button', title: 'Icons View',
                                                    style: { 
                                                        width: '24px', height: '24px', padding: '2px', 
                                                        background: !isList ? 'var(--neon-cyan)' : 'transparent', 
                                                        color: !isList ? '#000' : 'var(--color-text-secondary)', 
                                                        minHeight: '0', borderRadius: '2px' 
                                                    }, 
                                                    html: '<svg class="svg-icon" style="width:14px;height:14px;"><use href="#icon-brain"></use></svg>', 
                                                    onClick: () => { viewMode = 'grid'; render(); } 
                                                }
                                            ]
                                        }
                                    ]
                                },
                                // THE LIST AREA
                                {
                                    style: isList 
                                        ? { flexGrow: 1, overflowY: 'auto', padding: '4px', display: 'flex', flexDirection: 'column', gap: '1px', alignContent: 'start' }
                                        : { flexGrow: 1, overflowY: 'auto', padding: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px', alignContent: 'start' },
                                    children: items.map(item => ({
                                        style: isList
                                            ? { padding: '4px 8px', cursor: item.isDir ? 'pointer' : 'default', border: '1px solid transparent', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.1s' }
                                            : { padding: '10px 5px', cursor: item.isDir ? 'pointer' : 'default', border: '1px solid transparent', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(255,255,255,0.02)', transition: 'all 0.15s', textAlign: 'center' },
                                        events: {
                                            mouseenter: (e) => { 
                                                if(item.isDir) { 
                                                    e.currentTarget.style.background = isList ? 'rgba(0,246,255,0.1)' : 'var(--color-bg-tertiary)'; 
                                                    e.currentTarget.style.borderColor = 'var(--neon-cyan)'; 
                                                } 
                                            },
                                            mouseleave: (e) => { 
                                                e.currentTarget.style.background = isList ? 'transparent' : 'rgba(255,255,255,0.02)'; 
                                                e.currentTarget.style.borderColor = 'transparent'; 
                                            }
                                        },
                                        onClick: () => { 
                                            if(item.isDir) fetchList(currentPath + (currentPath === '/' ? '' : '/') + item.name); 
                                        },
                                        children: [
                                            { 
                                                tag: 'span', 
                                                style: { fontSize: isList ? '1.2em' : '2.5em', opacity: item.isDir ? '1' : '0.5' }, 
                                                text: item.isDir ? '📁' : '📄' 
                                            },
                                            { 
                                                tag: 'span', 
                                                style: { color: 'white', fontFamily: 'var(--font-code)', fontSize: isList ? '0.85em' : '0.75em', wordBreak: 'break-word', lineHeight: '1.2' }, 
                                                text: item.name 
                                            }
                                        ]
                                    }))
                                },
                                // FOOTER
                                {
                                    style: { 
                                        padding: '8px 12px', borderTop: '1px solid var(--color-border)', 
                                        display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.4)', flexShrink: 0
                                    },
                                    children: [
                                        { 
                                            tag: 'button', text: 'Select Current Directory', 
                                            className: 'primary-btn', style: { padding: '6px 16px', minHeight: '0', fontSize: '0.85em' }, 
                                            onClick: () => cleanup(currentPath) 
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                });

                if (overlayEl && overlayEl.parentNode) {
                    overlayEl.parentNode.replaceChild(newEl, overlayEl);
                } else {
                    document.body.appendChild(newEl);
                }
                overlayEl = newEl;
            };

            // Initiate manifestation at the root
            fetchList('/');
        });
    }
};
