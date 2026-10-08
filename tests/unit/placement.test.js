import {test,expect} from 'vitest';
import {roomPoints,measuredRoom} from '../../packages/model/room.js';
import {footprint,placementWarnings,suggestInteriorPlacement} from '../../packages/geometry/placement.js';
test('M1 R013: default footprint fits irregular room and warnings remain nonblocking',()=>{
 const state={...measuredRoom({sides:[400,300,350,300],diagonal:450,orientation:'clockwise'}),furniture:[]},item={width:100,depth:60,height:75,x:100,y:100,elevation:0,rotation:0};expect(placementWarnings(state,item)).toContain('Furniture footprint extends outside the room.');const centre=suggestInteriorPlacement(state,item);expect(placementWarnings(state,{...item,...centre})).toEqual([]);
 // Independent signed half-plane check for all corners, not merely centre.
 for(const corner of footprint({...item,...centre}))for(let i=0;i<4;i++){const a=roomPoints(state)[i],b=roomPoints(state)[(i+1)%4];expect((b[0]-a[0])*(corner[1]-a[1])-(b[1]-a[1])*(corner[0]-a[0])).toBeLessThanOrEqual(1e-6);}
});
