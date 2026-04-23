
// B"H
export const SelectionDOM = {
    refresh(selectedItems, domMap) {
        domMap.forEach((entry, key) => {
            if (entry.el) entry.el.classList.toggle('selected', selectedItems.has(key));
        });
    },
    clearAll(domMap) {
        domMap.forEach(entry => { if (entry.el) entry.el.classList.remove('selected'); });
    }
};
