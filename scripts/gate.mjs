import {createHash} from 'node:crypto';
export const digest = v => createHash('sha256').update(v).digest('hex');
export function validateGate({register,inventory,baseline,baselineDigest,candidate,evidence=[],reports=[],mappings=[],release=false}) {
  const errors=[];
  const fail = code=>errors.push(code);
  const hex64 = v=>typeof v==='string' && /^[a-f0-9]{64}$/.test(v);
  if (candidate && ((!/^[a-f0-9]{40}$/.test(candidate.sourceCommit ?? '') && (release || candidate.sourceCommit!==null || !hex64(candidate.dirtyDigest) || !hex64(candidate.sourceDigest))) || !hex64(candidate.buildDigest) || !hex64(candidate.acceptanceInventoryDigest) || !Array.isArray(candidate.catalogHashes) || !candidate.catalogHashes.every(hex64))) fail('INVALID_CANDIDATE');
  const binding = new Map();
  for (const m of mappings) {
    if(binding.has(m.caseId)) fail('DUPLICATE_MAPPING:'+m.caseId);
    binding.set(m.caseId,m);
  }
  if (digest(baseline.raw) !== baselineDigest) fail('BASELINE_DIGEST');
  const requirements=register.requirements;
  const ids=new Set(requirements.map(r=>r.id));
  if (ids.size!==requirements.length) fail('DUPLICATE_REQUIREMENT');
  const obligationIds=new Set(inventory.obligations.map(o=>o.id));
  if (obligationIds.size!==inventory.obligations.length) fail('DUPLICATE_OBLIGATION');
  for(const old of baseline.obligations) {
    const current=inventory.obligations.find(o=>o.id===old.id);
    if(!current) fail('REMOVED_OBLIGATION:'+old.id);
    else if(JSON.stringify(old)!==JSON.stringify(current)) fail('CHANGED_OBLIGATION:'+old.id);
    if(!ids.has(old.requirement)) fail('MISSING_REQUIREMENT:'+old.requirement);
  }
  for(const o of inventory.obligations) {
    const parent=requirements.find(r=>r.id===o.requirement);
    if(!parent) fail('ORPHAN_OBLIGATION:'+o.id);
    else if(o.release!==parent.release) fail('RELEASE_MISMATCH:'+o.id);
  }
  const reportMap=new Map();
  for(const report of reports) {
    if(!Array.isArray(report.cases)||!report.cases.length) {fail('EMPTY_REPORT');continue;}
    for(const c of report.cases) {if(reportMap.has(c.id))fail('DUPLICATE_CASE:'+c.id);reportMap.set(c.id,c);}
  }
  for(const e of evidence) {
    if(!candidate || JSON.stringify(e.candidate)!==JSON.stringify(candidate)) fail('STALE_CANDIDATE');
    if(!Array.isArray(e.cases)||!e.cases.length) fail('EMPTY_EVIDENCE');
    for(const id of e.cases??[]) if(reportMap.get(id)?.outcome!=='pass') fail('CASE_NOT_PASS:'+id);
    for(const id of e.obligations??[]) {
      if(!obligationIds.has(id)) fail('ORPHAN_EVIDENCE:'+id);
      if(!e.cases?.some(caseId=>binding.get(caseId)?.obligations.includes(id))) fail('UNBOUND_OBLIGATION:'+id);
    }
    if(e.outcome!=='pass') fail('EVIDENCE_NOT_PASS');
    if(e.manual && (!e.reviewer || !e.device || !e.artifactDigest)) fail('MANUAL_METADATA');
  }
  for(const r of requirements) if(['verified','accepted'].includes(r.status)) {
    const required=inventory.obligations.filter(o=>o.requirement===r.id);
    if(!required.length || !required.every(o=>evidence.some(e=>e.outcome==='pass' && e.requirements?.includes(r.id) && e.obligations?.includes(o.id) && e.cases?.some(caseId=>reportMap.get(caseId)?.outcome==='pass' && binding.get(caseId)?.obligations.includes(o.id))))) fail('UNSUPPORTED_VERIFICATION:'+r.id);
  }
  if(release) {
    if(!candidate?.sourceCommit || candidate.dirtyDigest) fail('UNCLEAN_RELEASE');
    if(baseline.reviewStatus!=='approved' || inventory.reviewStatus!==baseline.reviewStatus) fail('UNAPPROVED_INVENTORY');
    for(const o of inventory.obligations.filter(o=>o.release==='v1')) if(!evidence.some(e=>e.outcome==='pass'&&e.obligations?.includes(o.id)&&e.cases?.length&&e.cases.every(id=>reportMap.get(id)?.outcome==='pass')&&e.cases.some(caseId=>binding.get(caseId)?.obligations.includes(o.id)))) fail('INCOMPLETE:'+o.id);
  }
  return errors;
}
