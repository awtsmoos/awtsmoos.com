
// B"H
// FILE: js/devtools/panels/network.js

export const NetworkPanel = {
    init(container, state) {
        container.innerHTML = `
            <div style="display:flex; background:#111; border-bottom:1px solid #333; padding:5px 10px; font-weight:bold; font-size:0.85em; width:100%;">
                <div style="width:50px;">Status</div>
                <div style="width:60px;">Method</div>
                <div style="flex-grow:1;">File / URL</div>
                <div style="width:80px;">Type</div>
                <div style="width:80px; text-align:right;">Time</div>
            </div>
            <div id="dt-network-list" style="flex-grow:1; overflow-y:auto; background:#000; width:100%;"></div>
        `;
        
        const list = container.querySelector('#dt-network-list');
        
        const renderList = () => {
            list.innerHTML = state.networkReqs.map(req => {
                const color = req.status === 200 ? 'var(--neon-lime)' : (req.status === 404 ? 'var(--color-accent-danger)' : 'white');
                return `
                    <div style="display:flex; padding:5px 10px; border-bottom:1px solid #222; font-family:var(--font-code); font-size:0.8em;">
                        <div style="width:50px; color:${color};">${req.status}</div>
                        <div style="width:60px; color:var(--neon-cyan);">${req.method}</div>
                        <div style="flex-grow:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${req.url}">${req.url}</div>
                        <div style="width:80px; color:gray;">${req.type}</div>
                        <div style="width:80px; text-align:right;">${Math.round(req.duration)}ms</div>
                    </div>
                `;
            }).join('');
            list.scrollTop = list.scrollHeight;
        };

        renderList();
        state.onNetworkLog = () => renderList();
    }
};
