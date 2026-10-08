import createManifold from 'manifold-3d';
import polygonClipping from 'polygon-clipping';
export const GEOMETRY_BUDGETS = Object.freeze({linearToleranceCm:1e-5,arcSagittaCm:.02,desktopComputeMs:100,iterations:100});
export function planarArea(ring){return Math.abs(ring.reduce((s,p,i)=>{const q=ring[(i+1)%ring.length];return s+p[0]*q[1]-q[0]*p[1];},0)/2);}
export function clippedArea(shape){return shape.reduce((s,polygon)=>s+planarArea(polygon[0])-polygon.slice(1).reduce((n,h)=>n+planarArea(h),0),0);}
export function subtractPlan(a,b){return polygonClipping.difference([a],[b]);}
export async function geometryModule(options){const module=await createManifold(options);module.setup();return module;}
export function classifyBoxes(a,b,{construction=false}={}){
 const depths=a.min.map((v,i)=>Math.min(a.max[i],b.max[i])-Math.max(v,b.min[i]));
 if(depths.some(d=>d < -GEOMETRY_BUDGETS.linearToleranceCm))return 'separate';
 if(depths.some(d=>d <= GEOMETRY_BUDGETS.linearToleranceCm))return 'touching';
 return construction?'intentional-construction-overlap':'intersection';
}
export function cutWall(module,{length,height,thickness,openings=[]}){
 for(const o of openings)if(o.offset<0||o.bottom<0||o.width<=0||o.height<=0||o.offset+o.width>length||o.bottom+o.height>height)throw new Error('Opening outside host wall');
 const resources=[];let wall=module.Manifold.cube([length,thickness,height]);resources.push(wall);
 try{for(const o of openings){const base=module.Manifold.cube([o.width,thickness+2,o.height]);resources.push(base);const cut=base.translate([o.offset,-1,o.bottom]);resources.push(cut);wall=wall.subtract(cut);resources.push(wall);}return {volume:wall.volume(),bounds:wall.boundingBox()};}
 finally{resources.reverse().forEach(r=>r.delete());}
}
// Domain face identity is assigned from host identity/side, never triangle index.
export function regenerateWall(module,wall){
 const geometry=cutWall(module,{length:wall.length.value,height:wall.height,thickness:wall.thickness,openings:wall.openings??[]});
 const faces=['inside','outside'].map(side=>({id:`${wall.id}:${side}`,hostId:wall.id,side,material:structuredClone(wall.materialFaces?.[side]??null),length:wall.length.value,height:wall.height,planeY:side==='inside'?0:wall.thickness}));
 return {geometry,faces};
}
