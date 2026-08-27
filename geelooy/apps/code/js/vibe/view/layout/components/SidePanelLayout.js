
// B"H
/**
 * @file SidePanelLayout.js
 * @brief The Right Pillar: The Asset Navigation Interface.
 */

export const SidePanelLayout = {
    /**
     * B"H - Assembles the Side Panel JSON blueprint.
     * @returns {Object} JSON configuration for HTML() generator.
     */
    build() {
        return {
            className: 'vibe-side-panel', id: 'vibe-side-panel',
            style: { display: 'flex', flexDirection: 'column' },
            children:[
                { id: 'vibe-panel-restore-btn', className: 'vibe-panel-restore-btn', html: '<svg class="svg-icon"><use href="#icon-plus"></use></svg>' },
                {
                    className: 'vibe-panel-inner',
                    style: { flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 },
                    children:[
                        {
                            className: 'vibe-sidebar-tabs',
                            children:[
                                { className: 'vibe-sb-tab', dataset: { tab: 'tree' }, text: 'Tree' },
                                { className: 'vibe-sb-tab', dataset: { tab: 'manifest' }, text: 'External' },
                                { className: 'vibe-sb-tab', dataset: { tab: 'timeline' }, text: 'Timeline' },
                                { className: 'vibe-sb-tab', dataset: { tab: 'chats' }, text: 'Chats' },
                                { className: 'vibe-sb-tab', dataset: { tab: 'aichat' }, text: '⚡ AI' },
                                { className: 'vibe-tab-spacer' },
                                {
                                    className: 'vibe-header-actions',
                                    children:[
                                        { tag: 'button', id: 'vibe-panel-max-btn', className: 'icon-button', html: '<svg class="svg-icon"><use href="#icon-fullscreen"></use></svg>' },
                                        { tag: 'button', id: 'vibe-panel-min-btn', className: 'icon-button', html: '<svg viewBox="0 0 24 24" class="svg-icon" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg>' }
                                    ]
                                }
                            ]
                        },
                        { id: 'vibe-tree-container', className: 'vibe-context-list' },
                        { id: 'vibe-manifest-container', className: 'vibe-manifest-view', style: { display: 'none' } },
                        { id: 'vibe-timeline-container', className: 'vibe-timeline-view', style: { display: 'none' } },
                        { id: 'vibe-chats-container', className: 'vibe-context-list', style: { display: 'none' } },
                        { id: 'vibe-aichat-container', className: 'vibe-context-list', style: { display: 'none' } },
                        { className: 'vibe-settings-area', children: [{ id: 'vibe-model-badge', text: '...' }] }
                    ]
                }
            ]
        };
    }
};
