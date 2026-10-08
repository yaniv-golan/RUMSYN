import {unzipSync} from 'fflate';
import {PROJECT_LIMITS} from '../model/limits.js';
function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
export function projectArchiveBytes(bytes){
 const fail=()=>{throw new Error('Unsupported or corrupt project archive');};
 if(!(bytes instanceof Uint8Array)||bytes.length<22||bytes.length>PROJECT_LIMITS.compressedBytes)fail();
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),u16=o=>v.getUint16(o,true),u32=o=>v.getUint32(o,true),end=bytes.length-22;
 // Native format: one non-encrypted stored/deflated project.json, no ZIP64,
 // descriptors, split disks, trailing comments or extra entries.
 if(u32(end)!==0x06054b50||u16(end+4)||u16(end+6)||u16(end+8)!==1||u16(end+10)!==1||u16(end+20))fail();
 const at=u32(end+16),size=u32(end+12);if(at<30||at+size!==end||size<46||u32(at)!==0x02014b50)fail();
 const flags=u16(at+8),method=u16(at+10),crc=u32(at+16),compressed=u32(at+20),uncompressed=u32(at+24),nameLength=u16(at+28),extra=u16(at+30),comment=u16(at+32),local=u32(at+42);
 if(flags&~0x800||![0,8].includes(method)||uncompressed>PROJECT_LIMITS.uncompressedBytes||nameLength!==12||local!==0||u16(at+34)||46+nameLength+extra+comment!==size)fail();
 const decoder=new TextDecoder('utf-8',{fatal:true});if(decoder.decode(bytes.subarray(at+46,at+46+nameLength))!=='project.json'||u32(0)!==0x04034b50||u16(6)!==flags||u16(8)!==method||u32(14)!==crc||u32(18)!==compressed||u32(22)!==uncompressed||u16(26)!==12)fail();
 const start=30+u16(26)+u16(28);if(start+compressed!==at||decoder.decode(bytes.subarray(30,42))!=='project.json'||method===0&&compressed!==uncompressed)fail();
 // fflate0.8.3 inflates with an explicitly preallocated originalSize buffer.
 // Integrity and length checks reject truncated/spoofed size declarations.
 const files=unzipSync(bytes),result=files['project.json'];if(!result||result.length!==uncompressed||crc32(result)!==crc)fail();return result;
}
