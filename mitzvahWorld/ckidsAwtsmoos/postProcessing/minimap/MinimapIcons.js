
/**
 * B"H
 * Handles Minimap Icon Management
 */
export default class MinimapIcons {
    constructor(minimap) {
        this.minimap = minimap;
        this.itemGroups = {};
    }
    
    async updateItemAction(item) {
        if (item.iconType === "centered") return null;
        const pos = item.mesh.position;
        const w = this.minimap.worldToMinimap(pos.x, pos.z);
        if (!w) return null;

        return {
            shaym: "item " + item.shaym,
            properties: {
                w: { x: w.x, y: w.y },
                style: { transform: `translate(${w.x}px, ${w.y}px)` }
            }
        };
    }

    async updateItemPositions(category) {
        if (typeof category !== "string") {
            const keys = Object.keys(this.itemGroups);
            for (const m of keys) {
                await this.updateItemPositions(m);
            }
            return;
        }

        const items = this.itemGroups[category];
        if (!items || !Array.isArray(items)) return;

        try {
            const actions = [];
            for (let i = 0; i < items.length; i++) {
                const act = await this.updateItemAction(items[i]);
                if (act) actions.push(act);
            }
            await this.minimap.olam.ayshPeula("htmlActions", actions);
        } catch (e) {
            console.log(e);
        }
    }

    async setMinimapItem(item, category) {
        if (!this.itemGroups[category]) this.itemGroups[category] = [];
        if (!this.itemGroups[category].includes(item)) {
            this.itemGroups[category].push(item);
        }

        // Cleanup old listeners
        if (typeof item.clear === "function") {
            item.clear("change icon data");
            item.clear("change icon style");
            item.clear("delete icon");
            item.clear("add again");
            item.clear("rotate");
        }

        const pos = item.mesh.position;
        const w = this.minimap.worldToMinimap(pos.x, pos.z);
        if (!w) return;

        const iconData = await item.getIcon();
        const shlichusHas = await item.hasShlichus();
        const isCentered = item.iconType === "centered";
        let parent = "map overlays " + category;
        let transform = `translate(${w.x}px, ${w.y}px)`;
        let className = "overlayItem";

        if (isCentered) {
            className += " centered";
            parent = "map av";
            transform = `translate(-50%, -50%) rotate(0deg)`;
        }

        await this.minimap.olam.ayshPeula("htmlCreate", {
            parent,
            className,
            awtsName: item.name,
            shaym: "item " + item.shaym,
            w: { x: w.x, y: w.y },
            shlichusHas,
            events: this._getIconEvents(item),
            style: { transform },
            innerHTML: iconData
        });

        this._attachItemListeners(item, category);
    }
    
    _getIconEvents(item) {
        return {
            "mouseenter mousemove": (e, $, ui, me) => {
                let msg = "This is: " + me.awtsName;
                if (me.shlichusHas) msg += "\nHas Shlichus! Come.";
                
                const rect = me.getBoundingClientRect();
                let tx = rect.x;
                let ty = rect.y;

                ui.htmlAction({
                    shaym: "minimap label",
                    properties: {
                        innerHTML: msg,
                        style: { transform: `translate(${tx}px, ${ty}px)` }
                    },
                    methods: { classList: { remove: "invisible" } }
                });
                
                // B"H: Simple Boundary check logic could go here
            },
            mouseleave: (e, $, ui, me) => {
                ui.htmlAction({
                    shaym: "minimap label",
                    properties: {
                        innerHTML: "",
                        style: { transform: `translate(-100000px, -10000000px)` }
                    }
                });
            }
        };
    }

    _attachItemListeners(item, category) {
        if (typeof item.on !== "function") return;
        
        item.on("add again", async () => await this.setMinimapItem(item, category));
        item.on("delete icon", async () => await this.removeMinimapItem(item, category));
        
        item.on("rotate", async (rad) => {
            const act = {
                shaym: "item " + item.shaym,
                properties: {
                    style: { transform: `translate(-50%, -50%) rotate(${-(rad + Math.PI)}rad)` }
                }
            };
            await this.minimap.olam.htmlAction(act);
        });

        item.on("change icon style", async (data) => {
            const s = "item " + item.shaym;
            const actions = [];
            if (data && typeof data === "object") {
                data.shaym = s;
                actions.push(data);
            }
            return await this.minimap.olam.htmlActions(actions);
        });

        item.on("change icon data", async (data) => {
            const iconData = await item.getIcon();
            const s = "item " + item.shaym;
            const actions = [{ shaym: s, properties: { innerHTML: iconData } }];
            if (data && typeof data === "object") {
                data.shaym = s;
                actions.push(data);
            }
            return await this.minimap.olam.htmlActions(actions);
        });
    }

    async removeMinimapItem(item, category) {
        if (!item || !item.shaym) return;
        const items = this.itemGroups[category];
        if (!Array.isArray(items)) return;

        const found = items.find(w => w.shaym == item.shaym);
        const indexOf = items.indexOf(found);

        if (indexOf > -1) {
            this.itemGroups[category].splice(indexOf, 1);
            try {
                await this.minimap.olam.ayshPeula("htmlDelete", { shaym: "item " + item.shaym });
            } catch (e) { console.log(e); }
        }
    }
    
    async setMinimapItems(items, category) {
        if (typeof category !== "string") return;
        if (!Array.isArray(items)) {
            if (items === undefined || items === null) return await this.deleteMinimapItems(category);
            return;
        }

        if (!this.itemGroups[category]) {
            this.itemGroups[category] = [];
            await this.minimap.olam.ayshPeula("htmlCreate", ({
                parent: "raw map",
                shaym: "map overlays " + category,
                className: "overlaysOfMap"
            }));
        }

        const newItems = Array.from(items);
        const existing = Array.from(this.itemGroups[category]);
        this.itemGroups[category] = newItems;

        try {
            for (const ex of existing) {
                await this.minimap.olam.htmlAction({ shaym: "item " + ex.shaym, methods: { remove: [] } });
                await this.removeMinimapItem(ex, category);
            }
            await this.minimap.olam.htmlAction({ shaym: "map overlays " + category, properties: { innerHTML: "" } });
            
            for (let i = 0; i < newItems.length; i++) {
                await this.setMinimapItem(newItems[i], category);
            }
        } catch (e) { console.log(e); }
        await this.updateItemPositions(category);
    }
    
    async deleteMinimapItems(category) {
        if (typeof category !== "string") return;
        const items = this.itemGroups[category];
        if (!Array.isArray(items)) return;
        
        const copy = Array.from(items);
        for (let i = 0; i < copy.length; i++) {
            await this.removeMinimapItem(copy[i], category);
        }
        await this.minimap.olam.ayshPeula("htmlDelete", ({ shaym: "map overlays " + category }));
        delete this.itemGroups[category];
    }
}
