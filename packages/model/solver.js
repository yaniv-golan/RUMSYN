import {dimension, TOLERANCE_CM} from './index.js';
// Bounded convex quadrilateral solver: four sides + AC diagonal + orientation.
// The diagonal splits the outline into two independently constructed triangles.
function triangle(a, b, base) {
  if (a + b <= base + TOLERANCE_CM || Math.abs(a-b) >= base - TOLERANCE_CM) return null;
  const x = (a*a + base*base - b*b)/(2*base);
  return [x, Math.sqrt(Math.max(0,a*a-x*x))];
}
export function solveQuadrilateral({sides, diagonal, orientation}) {
  if (!Array.isArray(sides) || sides.length !== 4) throw new Error('Expected four perimeter sides');
  sides.forEach(v => dimension(v));
  const longest = Math.max(...sides);
  if (2 * longest >= sides.reduce((a,b)=>a+b,0) - TOLERANCE_CM) return {status:'contradictory', conflicts:['sides'], reason:'Perimeter cannot close'};
  if (diagonal === undefined) return {status:'underdetermined', degreesOfFreedom:1, preserved:sides.slice(), usefulMeasurements:['diagonal AC','known corner angle'], reason:'Four sides do not determine corner angles'};
  dimension(diagonal);
  const b = triangle(sides[0],sides[1],diagonal);
  const d = triangle(sides[3],sides[2],diagonal);
  if (!b || !d) return {status:'contradictory', conflicts:['sides','diagonal'], reason:'Diagonal violates triangle inequalities'};
  const coordinates = [[0,0],[b[0],b[1]],[diagonal,0],[d[0],-d[1]]];
  const turns = coordinates.map((p,i)=>{
    const q=coordinates[(i+1)%4], r=coordinates[(i+2)%4];
    return (q[0]-p[0])*(r[1]-q[1])-(q[1]-p[1])*(r[0]-q[0]);
  });
  if (turns.some(t=>Math.abs(t)<=TOLERANCE_CM) || !(turns.every(t=>t>0)||turns.every(t=>t<0)))
    return {status:'unsupported_branch', reason:'Measurements produce a concave or degenerate branch; full concave constraint solving remains required in M2', preserved:sides.slice()};
  // Concave branches are outside this harness's convex input contract.
  if (!['clockwise','counterclockwise'].includes(orientation)) return {status:'ambiguous', alternatives:[coordinates,coordinates.map(([x,y])=>[x,-y])], reason:'Select known orientation; convex branch assumed explicitly'};
  return {status:'solved', coordinates:orientation === 'clockwise' ? coordinates : coordinates.map(([x,y])=>[x,-y]), assumptions:['convex quadrilateral'], residualCm:0};
}
export function reconcileSegments({wallId,total,segments,attachments=[]}) {
  dimension(total.value);
  segments.forEach(x=>dimension(x.value));
  const sum = segments.reduce((s,x)=>s+x.value,0);
  const residual = sum-total.value;
  if (Math.abs(residual) <= TOLERANCE_CM) return {status:'consistent', residualCm:residual};
  const choices = [];
  if (!total.locked) choices.push({target:'total',oldValue:total.value,newValue:sum,residualCm:0,reason:'Match supplied segment sum; measurement accuracy is unknown'});
  for (const part of segments) if (!part.locked && part.value-residual > 0) choices.push({target:part.id,oldValue:part.value,newValue:part.value-residual,residualCm:0,reason:'Match supplied total; measurement accuracy is unknown'});
  const unavailable=[];
  const feasible=choices.filter(choice=>{
    const proposedTotal=choice.target==='total'?choice.newValue:total.value;
    const proposedSegments=segments.map(part=>part.id===choice.target?{...part,value:choice.newValue}:part);
    const conflict=attachments.find(a=>{
      if(a.offset<0 || a.offset+a.width>proposedTotal+TOLERANCE_CM)return true;
      const index=proposedSegments.findIndex(part=>part.id===a.segmentId);
      if(index<0)return false;
      if(a.width>proposedSegments[index].value+TOLERANCE_CM)return true;
      const offset=proposedSegments.slice(0,index).reduce((sum,part)=>sum+part.value,0)+(a.offsetWithinSegment??0);
      return a.lockedOffset && Math.abs(offset-a.offset)>TOLERANCE_CM;
    });
    if(conflict){unavailable.push({...choice,reason:`Repair conflicts with attachment ${conflict.id}; dimensions/locked position retained`});return false;}
    return true;
  });
  return {status:feasible.length?'contradictory':'no_allowed_repair',wallId,residualCm:residual,conflicts:['total',...segments.map(x=>x.id)],choices:feasible,unavailable};
}
