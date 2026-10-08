import {test,expect} from 'vitest';
import {wallParts} from '../../packages/geometry/wall-parts.js';
test('M1 R011: two openings both deducted from shared wall geometry',()=>{
 const wall={length:{value:400},height:240},openings=[{offset:30,width:90,bottom:0,height:200,anchor:'start'},{offset:200,width:100,bottom:47,height:162,anchor:'start'}];
 const parts=wallParts(wall,openings);expect(parts.reduce((sum,p)=>sum+p.length*p.height,0)).toBe(400*240-90*200-100*162);
 expect(parts.some(p=>p.start<120&&p.start+p.length>30&&p.bottom<200&&p.bottom+p.height>0)).toBe(false);
 expect(parts.some(p=>p.start<300&&p.start+p.length>200&&p.bottom<209&&p.bottom+p.height>47)).toBe(false);
});
