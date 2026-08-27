//B"H
//Boruch Hashem
//Blessed is He

import { defineLevel } from "../levelFactory.js";

/**
 * @file garden.js
 * @description Six first gates teach motion, clouds, sparks, checkpoints, and flow.
 * The Awtsmoos, Atzmus beyond every beginning, renews each first step anew;
 * Awtsmoos.com lets the Garden reveal courage gently, one measured gate in view.
 */
export const GARDEN_LEVELS = Object.freeze([
	defineLevel({ id: "garden-01", title: "First Footfall", pack: "Garden", difficulty: 1, message: "Move, jump, gather sparks, enter the gate.", rows: [
		"..............................", "..............................", ".......................*......", "..............*.....####.....G", "..P....*....####...........####", "######..####....#####..#######" ] }),
	defineLevel({ id: "garden-02", title: "Cloud Steps", pack: "Garden", difficulty: 1, message: "Cloud steps hold you only from above.", rows: [
		"..............................", ".........................G....", "......................====....", ".................*............", "..........====.................", "..P..*.........................", "#########....#################" ] }),
	defineLevel({ id: "garden-03", title: "Kindled Marker", pack: "Garden", difficulty: 1, message: "Touch cyan checkpoints to set your return.", rows: [
		"................................", "............................G...", ".........................#####..", ".............C....*..............", ".........#####.........####......", "..P..*......................*....", "########...#####################" ] }),
	defineLevel({ id: "garden-04", title: "Little Ascent", pack: "Garden", difficulty: 2, message: "Short jumps become a path upward.", rows: [
		"...............................G", "............................####", ".....................####.......", "...............====..............", ".........####...........*........", "..P..*...........................", "##########....##################" ] }),
	defineLevel({ id: "garden-05", title: "Long Meadow", pack: "Garden", difficulty: 2, message: "Settle into rhythm across a longer path.", rows: [
		"........................................G", "....................................#####", ".......................====..............", "...............*................*.........", "........####.........C......####..........", "..P..*...........*.........................", "########..################################" ] }),
	defineLevel({ id: "garden-06", title: "Garden Gate", pack: "Garden", difficulty: 2, message: "Everything learned here now moves together.", rows: [
		"..........................................G", "......................................#####", "..........................====.............", ".................*.............*...........", ".........####..........C..........####.....", "..P..*...........====......................", "##########..##############################" ] })
]);
