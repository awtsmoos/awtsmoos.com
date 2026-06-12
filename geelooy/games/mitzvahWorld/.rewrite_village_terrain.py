import json
from pathlib import Path
p=Path('levels/ladder/data/village.json')
data=json.loads(p.read_text())
terrain=data['nivrayim']['ProceduralTerrain'][0]
terrain.update({
  'width': 460,
  'depth': 360,
  'segments': 112,
  'collisionSegments': 32,
  'microNoise': 0.018,
  'points': [
    {'x':-230,'z':-180,'y':0}, {'x':230,'z':-180,'y':0}, {'x':230,'z':180,'y':0}, {'x':-230,'z':180,'y':0}
  ],
  'hills': [
    {'x':-185,'z':82,'height':13.5,'radius':92},
    {'x':168,'z':-96,'height':11.5,'radius':84},
    {'x':42,'z':150,'height':8.5,'radius':70},
    {'x':-70,'z':-148,'height':7.5,'radius':76},
    {'x':190,'z':120,'height':6.5,'radius':60}
  ],
  'plateaus': [
    {'x':0,'z':12,'y':0,'rx':48,'rz':35},
    {'x':145,'z':-110,'y':0,'rx':22,'rz':18},
    {'x':-120,'z':92,'y':0,'rx':24,'rz':20},
    {'x':132,'z':96,'y':0,'rx':22,'rz':20},
    {'x':-150,'z':-35,'y':0,'rx':65,'rz':36},
    {'x':112,'z':58,'y':0,'rx':58,'rz':36}
  ],
  'roads': [
    {'width':10,'feather':13,'flatten':0.95,'points':[[-145,-42],[-90,-8],[-25,8],[45,22],[135,72]]},
    {'width':8,'feather':10,'flatten':0.82,'points':[[-40,5],[-100,-25],[-155,-45]]},
    {'width':6,'feather':10,'flatten':0.65,'points':[[-150,-40],[-40,20],[80,0],[190,-70]]}
  ],
  'regionExpandedTerrain': 'full-region-execution-20260612-bh1'
})
p.write_text(json.dumps(data, indent=2))
print('BH rewrote full village.json terrain', terrain['width'], terrain['depth'], len(terrain['hills']))
