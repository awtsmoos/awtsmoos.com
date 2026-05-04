
import { SectorAleph } from '../data/maps/SectorAleph.js';
import { HouseInterior } from '../data/maps/HouseInterior.js';
import { SEFARIM_LIBRARY } from '../data/TorahMusagim.js';

/**
 * B"H
 * Understanding: The Structured Soul of the World.
 * 
 * Chapter: The Inventory of Insights.
 */
export class Understanding {
    static state = {
        mode: 'EXPLORATION', // 'EXPLORATION', 'BATTLE', 'MENU'
        realm: 'OVERWORLD',
        player: {
            x: 0, y: 0, tx: 5, ty: 5,
            isMoving: false, moveProgress: 0,
            dir: 'd', speed: 1.5,
            width: 64, height: 64,
            frame: 0, animTimer: 0,
            inventory: [SEFARIM_LIBRARY[0]], // Start with Sefer Bereishis
            hp: 100, maxHp: 100, level: 1
        },
        overworld: { map: [], entities: [] },
        house: { map: [], entities: [] },
        battle: { enemy: null, log: [], turn: 'PLAYER' },
        menu: { open: false, selection: 0, subMenu: 'MAIN' },
        activeInteractingEntity: null,
        tileSize: 64,
        camera: { x: 0, y: 0, lerp: 0.1 }
    };

    static initialize() {
        this.state.overworld = this.parseMap(SectorAleph);
        this.state.house = this.parseMap(HouseInterior);
        this.syncPlayerPosition();
    }

    static syncPlayerPosition() {
        const ts = this.state.tileSize;
        this.state.player.x = this.state.player.tx * ts;
        this.state.player.y = this.state.player.ty * ts;
    }

    static parseMap(blueprint) {
        const ts = this.state.tileSize;
        const map = [];
        const entities = [];
        blueprint.forEach((row, y) => {
            const mapRow = [];
            [...row].forEach((char, x) => {
                if (char === 'S') {
                    entities.push({ type: 'NPC_SAGE', x: x*ts, y: y*ts, width: ts, height: ts, dir: 'd', originalDir: 'd' });
                    mapRow.push('1');
                } else if (char === 'K') {
                    mapRow.push('K'); // Klippah / Battle Trigger zone
                } else {
                    mapRow.push(char);
                }
            });
            map.push(mapRow);
        });
        return { map, entities };
    }

    static getState() {
        const s = this.state;
        const current = s.realm === 'OVERWORLD' ? s.overworld : s.house;
        return { ...s, map: current.map, entities: current.entities };
    }

    static transition(newRealm, tx, ty) {
        this.state.realm = newRealm;
        this.state.player.tx = tx;
        this.state.player.ty = ty;
        this.syncPlayerPosition();
        this.state.player.isMoving = false;
    }
}
