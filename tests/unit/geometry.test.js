import {beforeAll,test,expect} from 'vitest';
import {geometryModule,subtractPlan,clippedArea,cutWall,classifyBoxes,GEOMETRY_BUDGETS,regenerateWall} from '../../packages/geometry/proof.js';
let m;beforeAll(async()=>{m=await geometryModule();});
test('G01 R036: independent rectangle, concave and trapezoid areas and deductions',()=>{
 const rect=[[0,0],[400,0],[400,300],[0,300]],hole=[[0,0],[100,0],[100,50],[0,50]];
 expect(clippedArea(subtractPlan(rect,hole))).toBe(115000);
 const concave=[[0,0],[400,0],[400,100],[200,100],[200,300],[0,300]];
 expect(clippedArea(subtractPlan(concave,hole))).toBe(75000); // 400*100 + 200*200 - 5000
 const trap=[[0,0],[400,0],[300,200],[0,200]];
 const cs=new m.CrossSection([trap]);expect(cs.area()).toBeCloseTo(70000,5);cs.delete();
});
test('G02 R007: acute/obtuse joins and reversed winding preserve bounded offset',()=>{
 const ring=[[0,0],[100,0],[140,50],[0,50]],reversed=[...ring].reverse();
 const a=new m.CrossSection([ring],'EvenOdd'),b=new m.CrossSection([reversed],'EvenOdd');
 const ao=a.offset(15,'Miter',4),bo=b.offset(15,'Miter',4);
 expect(ao.area()).toBeCloseTo(bo.area(),4);
 // Independent offset of the two horizontal supporting lines y=0 and y=50.
 const points=ao.toPolygons().flat();expect(Math.min(...points.map(p=>p[1]))).toBeCloseTo(-15,4);expect(Math.max(...points.map(p=>p[1]))).toBeCloseTo(65,4);
 [ao,bo,a,b].forEach(x=>x.delete());
});
test('G02 R005: curved wall ring has frozen radial thickness and sagitta bound',()=>{
 const radius=100,thickness=15,n=Math.ceil(Math.PI/Math.acos(1-GEOMETRY_BUDGETS.arcSagittaCm/(radius+thickness)));
 const outer=m.CrossSection.circle(radius+thickness,n),inner=m.CrossSection.circle(radius,n),ring=outer.subtract(inner);
 expect(Math.abs(ring.area()-Math.PI*((radius+thickness)**2-radius**2))).toBeLessThan(5);
 expect((radius+thickness)*(1-Math.cos(Math.PI/n))).toBeLessThanOrEqual(.02);
 [ring,inner,outer].forEach(x=>x.delete());
});
test('G03 R007 R016: near-end opening, frame/one-cm trim, invalid host does not corrupt',()=>{
 const wall={length:300,height:237,thickness:15,openings:[{offset:1,bottom:47,width:91,height:162}]};
 const result=cutWall(m,wall);expect(result.volume).toBeCloseTo((300*237-91*162)*15,4);expect(result.bounds.max).toEqual([300,15,237]);
 expect(classifyBoxes({min:[0,0,0],max:[100,1,100]},{min:[20,.5,0],max:[50,20,30]})).toBe('intersection');
 expect(classifyBoxes({min:[0,0,0],max:[100,1,100]},{min:[20,1,0],max:[50,20,30]})).toBe('touching');
 expect(()=>cutWall(m,{...wall,openings:[{offset:1,bottom:0,width:301,height:200}]})).toThrow('outside');expect(cutWall(m,wall)).toEqual(result);
});
test('G04 R006 R008: steps/slope bounds and measured beam embedment classified separately',()=>{
 const beam={min:[0,0,224],max:[306,9,238]},ceiling={min:[0,0,237],max:[400,300,252]};
 expect(classifyBoxes(beam,ceiling,{construction:true})).toBe('intentional-construction-overlap');expect(beam.max[2]-ceiling.min[2]).toBe(1);
 const step=m.Manifold.cube([100,100,20]);expect(step.volume()).toBe(200000);step.delete();
 // Triangular cross-section slope: independent 1/2 * 100 * 50 * 200.
 const section=new m.CrossSection([[[0,0],[100,0],[100,50]]]),slope=section.extrude(200);expect(slope.volume()).toBeCloseTo(500000,4);slope.delete();section.delete();
});
test('G05 R021: domain material bindings survive actual regeneration, edit and undo',()=>{
 const wall={id:'D',length:{value:300,unit:'cm',source:'entered'},height:237,thickness:15,materialFaces:{inside:{color:'#ffffff',texture:'local:texture-1'},outside:{color:'#00ff00'}},openings:[{offset:1,bottom:47,width:91,height:162}]};
 const original=structuredClone(wall),first=regenerateWall(m,wall);
 for(let i=0;i<100;i++){wall.length.value=301+i;const rebuilt=regenerateWall(m,wall);expect(rebuilt.faces.find(f=>f.side==='inside').material.texture).toBe('local:texture-1');expect(rebuilt.faces.map(f=>f.id)).toEqual(first.faces.map(f=>f.id));expect(rebuilt.geometry.volume).toBeCloseTo(((301+i)*237-91*162)*15,4);}
 const restored=regenerateWall(m,original);expect(restored).toEqual(first);
 const degenerate=new m.CrossSection([[[0,0],[1e-10,0],[2e-10,0]]]);expect(degenerate.area()).toBe(0);degenerate.delete();
});
