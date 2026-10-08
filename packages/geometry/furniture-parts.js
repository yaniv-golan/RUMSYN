// Local dimensions and centres use the same floor-plane frame as the footprint.
export function furnitureParts(f){
 const top=Math.min(5,f.height*.1),leg=Math.min(6,f.width/4,f.depth/4);
 return f.category==='table'?[{x:0,z:0,y:f.height-top/2,w:f.width,h:top,d:f.depth},...[-1,1].flatMap(x=>[-1,1].map(z=>({x:x*(f.width/2-leg/2),z:z*(f.depth/2-leg/2),y:(f.height-top)/2,w:leg,h:f.height-top,d:leg})))]:[{x:0,z:0,y:f.height/2,w:f.width,h:f.height,d:f.depth}];
}
export function partCentre(f,p){const r=f.rotation*Math.PI/180;return {x:f.x+p.x*Math.cos(r)-p.z*Math.sin(r),y:f.y+p.x*Math.sin(r)+p.z*Math.cos(r),elevation:f.elevation+p.y};}
