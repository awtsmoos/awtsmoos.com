// B"H
export class ShotProfileLibrary {
  static get(name='mediumShot') { return this.map[name] || this.infer(name); }
  static infer(name='') { if(/insert|detail|food|object|book|soup/i.test(name)) return this.map.insertShot; if(/close|reaction/i.test(name)) return this.map.closeUp; if(/two|dialogue/i.test(name)) return this.map.twoShot; if(/wide|group|master|establish/i.test(name)) return this.map.establishingShot; return this.map.mediumShot; }
  static map = {
    establishingShot:{zoom:.82,y:128,min:.72,max:.92,headroom:68,table:true,room:true}, wideShot:{zoom:.84,y:128,min:.74,max:.98,headroom:64,table:true,room:true}, groupShot:{zoom:.88,y:130,min:.78,max:1.02,headroom:58,table:true,room:true},
    twoShot:{zoom:1.03,y:132,min:.92,max:1.14,headroom:46,table:true,room:true}, mediumShot:{zoom:1.08,y:132,min:.92,max:1.22,headroom:42,table:true,room:false}, overTheShoulder:{zoom:1.18,y:134,min:1.04,max:1.28,headroom:36,table:true,room:false},
    mediumCloseUp:{zoom:1.24,y:136,min:1.1,max:1.4,headroom:32,table:false,room:false}, closeUp:{zoom:1.38,y:138,min:1.18,max:1.58,headroom:28,table:false,room:false}, reactionShot:{zoom:1.34,y:138,min:1.14,max:1.52,headroom:30,table:false,room:false},
    insertShot:{zoom:1.48,y:138,min:1.18,max:1.68,headroom:12,table:true,room:false}, objectInsert:{zoom:1.48,y:138,min:1.18,max:1.68,headroom:12,table:true,room:false}, foodInsert:{zoom:1.5,y:138,min:1.2,max:1.72,headroom:12,table:true,room:false}, detailShot:{zoom:1.52,y:138,min:1.22,max:1.74,headroom:12,table:true,room:false}
  };
}
