
// B"H
export const FCLayout = {
    getHTML() {
        return `
            <div class="fc-window" style="border:none; box-shadow:none;">
                <div class="fc-toolbar">
                    <button id="fc-up-btn" class="icon-button" title="Go Up"><svg class="svg-icon"><use href="#icon-arrow-left"></use></svg></button>
                    <div id="fc-breadcrumbs" class="fc-breadcrumbs"></div>
                    <div class="fc-view-options">
                        <button id="fc-refresh-btn" class="icon-button" title="Refresh"><svg class="svg-icon"><use href="#icon-refresh"></use></svg></button>
                        <button id="fc-view-grid" class="icon-button" title="Grid View"><svg class="svg-icon"><use href="#icon-brain"></use></svg></button>
                        <button id="fc-view-details" class="icon-button active" title="Details View"><svg class="svg-icon"><use href="#icon-list"></use></svg></button>
                    </div>
                </div>
                <div class="fc-sort-bar" id="fc-sort-bar">
                    <div class="fc-col-name" data-sort="name">Name</div>
                    <div class="fc-col-size" data-sort="size">Size</div>
                    <div class="fc-col-date" data-sort="date">Date</div>
                </div>
                <div id="fc-content" class="fc-content details-view"></div>
                <div class="fc-statusbar"><span id="fc-status-count">0 items</span></div>
            </div>
        `;
    },
    
    bindViewToggles(container, uiInstance) {
        container.querySelector('#fc-view-grid').onclick = () => uiInstance.setView('grid');
        container.querySelector('#fc-view-details').onclick = () => uiInstance.setView('details');
    }
};
