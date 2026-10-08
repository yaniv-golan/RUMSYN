import React,{createContext,useContext,useLayoutEffect,useRef,useState} from 'react';
import {TextField,Label,Group,Input,Button} from 'react-aria-components';
import {parseMeasurement,formatMeasurement} from '../../packages/model/units.js';
export const MeasurementContext=createContext({unit:'metric',t:key=>key});
export function LengthField({label,value,onChange,min}){
 const {unit,t}=useContext(MeasurementContext),[text,setText]=useState(()=>formatMeasurement(value,unit)),[invalid,setInvalid]=useState(false),dirty=useRef(false),emitted=useRef(value),previousUnit=useRef(unit),draftUnit=useRef(unit);
 useLayoutEffect(()=>{const changedUnit=previousUnit.current!==unit;previousUnit.current=unit;if(!changedUnit&&dirty.current&&Object.is(value,emitted.current))return;if(Number.isFinite(value)||!dirty.current){setText(formatMeasurement(value,unit));setInvalid(false);dirty.current=false;draftUnit.current=unit;}},[value,unit]);
 const valid=n=>Number.isFinite(n)&&(min===undefined||min===0&&n>=0||min>0&&n>0);
 const update=raw=>{if(!dirty.current)draftUnit.current=unit;dirty.current=true;setText(raw);let n;try{n=parseMeasurement(raw,draftUnit.current);}catch{n=NaN;}if(!valid(n))n=NaN;emitted.current=n;setInvalid(!Number.isFinite(n));onChange(n);};
 const activeUnit=dirty.current?draftUnit.current:unit;
 const step=direction=>{if(invalid)return;let n;try{n=dirty.current?parseMeasurement(text,draftUnit.current):value;}catch{return;}const next=n+direction*(activeUnit==='imperial'?2.54:1);if(valid(next)){dirty.current=false;draftUnit.current=unit;emitted.current=next;setText(formatMeasurement(next,unit));setInvalid(false);onChange(next);}};
 const displayLabel=activeUnit==='imperial'?label.replace(/\((?:cm|ס״מ)\)/g,`(${t('imperialUnitLabel')})`):label;
 return <TextField value={text} onChange={update} isInvalid={invalid} onBlur={()=>{if(!invalid&&Number.isFinite(value)){setText(formatMeasurement(value,unit));dirty.current=false;draftUnit.current=unit;}}}><Label>{displayLabel}</Label><Group><Button aria-label={`${displayLabel} -`} onPress={()=>step(-1)}>−</Button><Input dir="ltr" inputMode="text" onKeyDown={e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();step(e.key==='ArrowUp'?1:-1);}}}/><Button aria-label={`${displayLabel} +`} onPress={()=>step(1)}>+</Button></Group>{activeUnit!==unit&&<p className="help">{t('pendingUnits')} · {t(activeUnit==='metric'?'metric':'imperial')}</p>}{invalid&&<p className="field-error" role="alert">{t('invalidMeasurement')}</p>}</TextField>;
}
