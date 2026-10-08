import {test,expect} from 'vitest';
import {validateGate,digest} from '../../scripts/gate.mjs';
const candidate={sourceCommit:'a'.repeat(40),buildDigest:'b'.repeat(64),catalogHashes:['c'.repeat(64)],acceptanceInventoryDigest:'d'.repeat(64)};
function fixture(){
 const obligations=['hinged','folding','ikea'].map((v,i)=>({id:'O'+i,requirement:'R'+i,release:'v1',expected:v,retirement:null}));
 const raw=JSON.stringify({reviewStatus:'approved',obligations});
 return {register:{requirements:obligations.map(o=>({id:o.requirement,release:'v1',status:'planned'}))},inventory:{reviewStatus:'approved',obligations:structuredClone(obligations)},baseline:{reviewStatus:'approved',obligations:structuredClone(obligations),raw},baselineDigest:digest(raw),candidate:structuredClone(candidate),mappings:obligations.map((o,i)=>({caseId:'T'+i,obligations:[o.id]})),reports:[{cases:obligations.map((o,i)=>({id:'T'+i,outcome:'pass'}))}],evidence:obligations.map((o,i)=>({candidate:structuredClone(candidate),requirements:[o.requirement],obligations:[o.id],cases:['T'+i],outcome:'pass'})),release:true};
}
const cases=[
 ['missing ID',f=>f.register.requirements.pop(),'MISSING_REQUIREMENT'],
 ['duplicate ID',f=>f.register.requirements.push(f.register.requirements[0]),'DUPLICATE_REQUIREMENT'],
 ['zero case report',f=>f.reports[0].cases=[],'EMPTY_REPORT'],
 ['wrong source',f=>f.evidence[0].candidate.sourceCommit='stale','STALE_CANDIDATE'],
 ['wrong build',f=>f.evidence[0].candidate.buildDigest='stale','STALE_CANDIDATE'],
 ['stale manual',f=>{f.evidence[0].manual=true;f.evidence[0].candidate.buildDigest='old';},'STALE_CANDIDATE'],
 ['removed obligation',f=>f.inventory.obligations.pop(),'REMOVED_OBLIGATION'],
 ['v2 counted v1',f=>f.register.requirements[0].release='v2','RELEASE_MISMATCH'],
 ['required skipped',f=>f.reports[0].cases[0].outcome='skip','CASE_NOT_PASS'],
 ['paired test mapping deletion',f=>{f.reports[0].cases.splice(1,1);f.evidence.splice(1,1);},'INCOMPLETE:O1'],
 ['retired obligation',f=>{f.inventory.obligations[1].retirement='unapproved';},'CHANGED_OBLIGATION'],
 ['partial door family',f=>{f.evidence=f.evidence.filter(e=>!e.obligations.includes('O1'));},'INCOMPLETE:O1'],
 ['explained IKEA failure',f=>{f.reports[0].cases[2].outcome='fail';f.evidence[2].reviewedExplanation='blocked source';},'CASE_NOT_PASS:T2'],
 ['modified source',f=>{f.candidate.sourceCommit='modified-source';},'STALE_CANDIDATE'],
 ['baseline tampering',f=>{f.baseline.raw+=' ';},'BASELINE_DIGEST']
];
test('R043: synthetic fully evidenced gate passes',()=>expect(validateGate(fixture())).toEqual([]));
for(const [name,mutate,code] of cases)test('R043 negative: '+name,()=>{const f=fixture();mutate(f);expect(validateGate(f).some(e=>e.startsWith(code))).toBe(true);});
test('R043: evidence store identity cannot change tested subject',()=>{const f=fixture();f.evidence.forEach(e=>e.evidenceStoreCommit='different-store-commit');expect(validateGate(f)).toEqual([]);});
test('R043: claimed verification without evidence fails',()=>{const f=fixture();f.register.requirements[1].status='verified';f.evidence.splice(1,1);expect(validateGate(f)).toContain('UNSUPPORTED_VERIFICATION:R1');});
test('R043 manager witness: unrelated smoke cannot attest all obligations',()=>{
 const f=fixture();f.reports=[{cases:[{id:'unrelated-smoke',outcome:'pass'}]}];
 f.evidence=[{candidate:f.candidate,outcome:'pass',requirements:f.register.requirements.map(r=>r.id),obligations:f.inventory.obligations.map(o=>o.id),cases:['unrelated-smoke']}];
 expect(validateGate(f)).toContain('UNBOUND_OBLIGATION:O1');
});
test('R043: partial candidate fields and mutable approval claim rejected',()=>{
 const f=fixture();f.candidate={sourceCommit:'not-a-real-commit'};f.baseline.reviewStatus='proposed';f.inventory.reviewStatus='approved';
 const errors=validateGate(f);expect(errors).toContain('INVALID_CANDIDATE');expect(errors).toContain('UNAPPROVED_INVENTORY');
});
test('R043: intermediate verification cannot borrow an unrelated requirement claim',()=>{
 const f=fixture();f.release=false;f.register.requirements[1].status='verified';f.evidence.splice(1,1);f.evidence[0].requirements.push('R1');
 expect(validateGate(f)).toContain('UNSUPPORTED_VERIFICATION:R1');
});
