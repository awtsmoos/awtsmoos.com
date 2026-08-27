
// B"H
/**
 * @file split-layout.js
 * @brief Divides the screen into Tabbed Heavens and Eternal Console Earth.
 */

import { HTML } from '../../../html-generator.js';

export class SplitDevToolsLayout {
    static mount(container, upperTabs, eternalConsoleEl) {
        container.innerHTML = '';
        
        const master = HTML({
            style: { display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }
        });

        const upper = HTML({
            style: { flex: '1 1 60%', display: 'flex', flexDirection: 'column', borderBottom: '2px solid #444', overflow: 'hidden' }
        });

        const lower = HTML({
            style: { flex: '1 1 40%', display: 'flex', flexDirection: 'column', position: 'relative' }
        });

        eternalConsoleEl.style.height = '100%';
        lower.appendChild(eternalConsoleEl);

        const header = HTML({ 
            style: { display: 'flex', background: '#252526', borderBottom: '1px solid #444' } 
        });
        
        const body = HTML({ 
            style: { flexGrow: '1', position: 'relative' } 
        });
        
        upper.appendChild(header);
        upper.appendChild(body);

        const activeTabs = {};
        upperTabs.forEach(tab => {
            const btn = HTML({
                tag: 'button', text: tab.name,
                style: { 
                    padding: '8px 16px', background: 'transparent', color: '#888', 
                    border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer'
                },
                events: {
                    click: () => {
                        Object.values(activeTabs).forEach(t => {
                            t.btn.style.color = '#888';
                            t.btn.style.borderBottomColor = 'transparent';
                            t.el.style.display = 'none';
                        });
                        btn.style.color = '#0ff';
                        btn.style.borderBottomColor = '#0ff';
                        tab.el.style.display = 'flex';
                    }
                }
            });
            
            tab.el.style.display = 'none';
            tab.el.style.height = '100%';
            tab.el.style.width = '100%';
            
            header.appendChild(btn);
            body.appendChild(tab.el);
            activeTabs[tab.id] = { btn, el: tab.el };
        });

        if (upperTabs.length > 0) activeTabs[upperTabs[0].id].btn.click();

        master.appendChild(upper);
        master.appendChild(lower);
        container.appendChild(master);
    }
}
