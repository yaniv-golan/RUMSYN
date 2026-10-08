import {test,expect} from 'vitest';
import {furnitureParts,partCentre} from '../../packages/geometry/furniture-parts.js';
test('M1 R013 manager E07: rotated nonsquare table legs remain within the tabletop frame',()=>{
 const f={category:'table',width:140,depth:60,height:75,x:170,y:-80,elevation:12,rotation:37},r=f.rotation*Math.PI/180,parts=furnitureParts(f);expect(parts.length).toBe(5);
 for(const p of parts){const c=partCentre(f,p);for(const dx of [-p.w/2,p.w/2])for(const dz of [-p.d/2,p.d/2]){
  const x=c.x+dx*Math.cos(r)-dz*Math.sin(r)-f.x,y=c.y+dx*Math.sin(r)+dz*Math.cos(r)-f.y;
  expect(Math.abs(x*Math.cos(r)+y*Math.sin(r))).toBeLessThanOrEqual(70+1e-8);
  expect(Math.abs(-x*Math.sin(r)+y*Math.cos(r))).toBeLessThanOrEqual(30+1e-8);
 }expect(c.elevation-p.h/2).toBeGreaterThanOrEqual(12);expect(c.elevation+p.h/2).toBeLessThanOrEqual(87);}
});
