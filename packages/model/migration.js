import {validateState,clone} from './index.js';
export function migrateStateV1(input){
 validateState(input);if(input.schemaVersion!==1)throw new Error('Expected model schema1');const state=clone(input);state.schemaVersion=2;
 if(state.room){const points=state.room.vertices;state.room.corners=points.map(([x,y],i)=>({id:`corner-${i+1}`,x,y}));state.room.cornersProvenance=state.room.verticesProvenance;delete state.room.vertices;delete state.room.verticesProvenance;state.walls.forEach((w,i)=>{w.geometry={kind:'line',startCornerId:`corner-${i+1}`,endCornerId:`corner-${(i+1)%points.length+1}`};});}
 return validateState(state);
}
export function migrateSessionV1(session){if(!session||!Array.isArray(session.history))throw new Error('Malformed legacy history');return {...clone(session),state:migrateStateV1(session.state),history:session.history.map(entry=>({...clone(entry),before:migrateStateV1(entry.before),after:migrateStateV1(entry.after)}))};}
