//B"H
export function makeDragLogic(child, gridContainer) {
    var moveBtn = document.createElement("div");
    moveBtn.classList.add("moveBtn");
    moveBtn.innerText = "move";
    
    // Append to child or its details pane
    let details = child.querySelector(".editor-details");
    if(details) details.appendChild(moveBtn);
    else child.appendChild(moveBtn);

    var started = false;
    var start = { x: 0, y: 0 };
    var startDrag = { x: 0, y: 0 };
    var placeholder = null;
    var lastInsertedIndex = -1;

    moveBtn.addEventListener("mousedown", startDragHandler);
    moveBtn.addEventListener("touchstart", startDragHandler, { passive: false });

    function startDragHandler(e) {
        e.preventDefault();
        if (!started) {
            started = true;
            if (e.type === "touchstart") {
                startDrag.x = e.touches[0].clientX;
                startDrag.y = e.touches[0].clientY;
            } else {
                startDrag.x = e.clientX;
                startDrag.y = e.clientY;
            }

            var rect = child.getBoundingClientRect();
            start.x = rect.x;
            start.y = rect.y;

            placeholder = document.createElement("div");
            placeholder.classList.add("placeholder");
            placeholder.style.height = `${child.offsetHeight}px`;
            placeholder.style.width = `${child.offsetWidth}px`;
            gridContainer.insertBefore(placeholder, child);

            child.style.position = "absolute";
            child.classList.add("dragging");
            child.style.left = `${start.x}px`;
            child.style.top = `${start.y}px`;
            child.style.zIndex = 1000;

            window.addEventListener("mousemove", onMoveHandler);
            window.addEventListener("mouseup", endDragHandler);
            window.addEventListener("touchmove", onMoveHandler, { passive: false });
            window.addEventListener("touchend", endDragHandler);
        }
    }

    function onMoveHandler(e) {
        if (!started) return;
        var currentX, currentY;
        if (e.type === "touchmove") {
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        } else {
            currentX = e.clientX;
            currentY = e.clientY;
        }

        var diff = { x: currentX - startDrag.x, y: currentY - startDrag.y };
        child.style.left = `${start.x + diff.x}px`;
        child.style.top = `${start.y + diff.y}px`;

        updateGridLayout(currentX, currentY);
    }

    function updateGridLayout(mouseX, mouseY) {
        var items = Array.from(gridContainer.children);
        var closestIndex = -1;
        items.forEach((item, index) => {
            if (item === child || item === placeholder) return;
            var rect = item.getBoundingClientRect();
            if (mouseX > rect.left && mouseX < rect.right && mouseY > rect.top && mouseY < rect.bottom) {
                closestIndex = index;
            }
        });
        if (closestIndex !== -1 && closestIndex !== lastInsertedIndex) {
            gridContainer.insertBefore(placeholder, items[closestIndex]);
            lastInsertedIndex = closestIndex;
        }
    }

    function endDragHandler(e) {
        if (started) {
            e.preventDefault();
            if (placeholder) {
                gridContainer.insertBefore(child, placeholder);
                placeholder.remove();
                placeholder = null;
            }
            child.style.position = "";
            child.style.zIndex = "";
            child.style.left = "";
            child.style.top = "";
            child.classList.remove("dragging");
            
            started = false;
            window.removeEventListener("mousemove", onMoveHandler);
            window.removeEventListener("mouseup", endDragHandler);
            window.removeEventListener("touchmove", onMoveHandler);
            window.removeEventListener("touchend", endDragHandler);
            
            // Trigger save order logic here if needed
        }
    }
}
