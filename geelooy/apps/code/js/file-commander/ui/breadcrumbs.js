
// B"H
import { State } from '../../state.js';

export const FCBreadcrumbs = {
    render(container, currentPathItem, navigateFn) {
        container.innerHTML = '';
        if (!currentPathItem) return;

        const rootSpan = document.createElement('span');
        rootSpan.className = 'fc-crumb root';
        rootSpan.textContent = 'Workspaces';
        rootSpan.onclick = () => navigateFn({ kind: 'root', name: 'Workspaces', path: '/' });
        container.appendChild(rootSpan);

        if (currentPathItem.kind === 'root') return;

        const sep1 = document.createElement('span');
        sep1.className = 'fc-sep'; sep1.textContent = '>';
        container.appendChild(sep1);

        const ws = State.workspaces.find(ws => ws.id === currentPathItem.workspaceId);
        const wsName = ws ? ws.name : (currentPathItem.isWorkspaceRoot ? currentPathItem.name : 'Unknown');
        
        const wsSpan = document.createElement('span');
        wsSpan.className = 'fc-crumb'; wsSpan.textContent = wsName;
        wsSpan.onclick = () => { if (ws) navigateFn({ ...ws, path: '/', kind: 'directory' }); };
        container.appendChild(wsSpan);

        if (currentPathItem.path === '/' || currentPathItem.path === '') return;

        const parts = currentPathItem.path.split('/').filter(Boolean);
        let currentAccum = '';
        
        parts.forEach((part) => {
            const sep = document.createElement('span');
            sep.className = 'fc-sep'; sep.textContent = '/';
            container.appendChild(sep);

            currentAccum += '/' + part;
            const crumbPath = currentAccum; 
            
            const crumb = document.createElement('span');
            crumb.className = 'fc-crumb'; crumb.textContent = part;
            crumb.onclick = () => navigateFn({ ...currentPathItem, path: crumbPath, name: part, kind: 'directory' });
            container.appendChild(crumb);
        });
    }
};
