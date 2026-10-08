import {test,expect} from 'vitest';
import {zipSync,strToU8} from 'fflate';
import {projectArchiveBytes} from '../../packages/persistence/archive.js';
test('M1 R033: strict native archive rejects CRC size and extra-entry corruption before opening',()=>{
 const bytes=zipSync({'project.json':strToU8('{"message":"native"}')});expect(new TextDecoder().decode(projectArchiveBytes(bytes))).toBe('{"message":"native"}');
 const crc=bytes.slice(),v=new DataView(crc.buffer),at=v.getUint32(crc.length-6,true);v.setUint32(14,123,true);v.setUint32(at+16,123,true);expect(()=>projectArchiveBytes(crc)).toThrow('corrupt');
 const size=bytes.slice(),s=new DataView(size.buffer);s.setUint32(22,30_000_000,true);s.setUint32(at+24,30_000_000,true);expect(()=>projectArchiveBytes(size)).toThrow('corrupt');
 expect(()=>projectArchiveBytes(zipSync({'project.json':strToU8('{}'),'extra.json':strToU8('{}')}))).toThrow('corrupt');
 const spoof=zipSync({'project.json':strToU8('x'.repeat(2_000_000))}),sp=new DataView(spoof.buffer),central=sp.getUint32(spoof.length-6,true);sp.setUint32(22,2,true);sp.setUint32(central+24,2,true);expect(()=>projectArchiveBytes(spoof)).toThrow('corrupt');
});
