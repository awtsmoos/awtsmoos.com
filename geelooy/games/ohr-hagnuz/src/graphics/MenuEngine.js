
import { Understanding } from '../binah/Understanding.js';

/**
 * B"H
 * MenuEngine: The Interface of Potentiality.
 * 
 * Chapter: The Three Pillars.
 * This menu allows the player to access their Sefarim and view their current state.
 * Just as the world stands on three pillars, our UI organizes the soul's tools.
 */
export class MenuEngine {
    /**
     * Draw the main menu overlay.
     * @param {CanvasRenderingContext2D} ctx 
     */
    static draw(ctx) {
        const state = Understanding.state;
        if (!state.menu.open) {
            this.drawIcon(ctx);
            return;
        }

        const { width: w, height: h } = ctx.canvas;
        ctx.save();
        
        // Dim the background
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, w, h);

        // Sidebar
        const menuW = 250;
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, menuW, h);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(5, 5, menuW - 10, h - 10);

        // Header
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px "Segoe UI"';
        ctx.fillText('B"H - SEFARIM BAG', 25, 50);

        const options = ['INVENTORY', 'STATS', 'SETTINGS', 'CLOSE'];
        options.forEach((opt, i) => {
            ctx.fillStyle = state.menu.selection === i ? '#4caf50' : '#888';
            ctx.font = state.menu.selection === i ? 'bold 22px "Segoe UI"' : '20px "Segoe UI"';
            ctx.fillText(opt, 40, 120 + i * 50);
            if (state.menu.selection === i) ctx.fillText('>', 20, 120 + i * 50);
        });

        // Sub-menu content (Inventory)
        if (state.menu.subMenu === 'MAIN') {
            this.drawInventory(ctx, menuW + 50, 100);
        }

        ctx.restore();
    }

    static drawIcon(ctx) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(ctx.canvas.width - 60, 20, 40, 5);
        ctx.fillRect(ctx.canvas.width - 60, 30, 40, 5);
        ctx.fillRect(ctx.canvas.width - 60, 40, 40, 5);
    }

    static drawInventory(ctx, x, y) {
        const s = Understanding.state.player;
        ctx.fillStyle = '#fff';
        ctx.font = '20px "Segoe UI"';
        ctx.fillText('Collected Wisdom:', x, y);

        s.inventory.forEach((item, i) => {
            ctx.fillStyle = '#aaa';
            ctx.fillText(`${i+1}. ${item.name} (${item.type})`, x + 20, y + 40 + i * 40);
        });
    }

    static toggle() {
        const s = Understanding.state.menu;
        s.open = !s.open;
        s.selection = 0;
    }

    static moveSelection(dir) {
        const s = Understanding.state.menu;
        s.selection = (s.selection + dir + 4) % 4;
    }
}
