import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { GifReader } from 'omggif';
const compiled=await build({entryPoints:['src/features/gif/engine.ts'],bundle:true,platform:'node',format:'esm',write:false});
const engine=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].contents).toString('base64'));
test('GIF export decodes actual frame pixels, delays, dimensions and loop',()=>{
 const encoder=engine.createEncoder(2,2,256,0);
 for(const [rgb,delay] of [[[255,0,0],120],[[0,255,0],450]]) {
  const data=new Uint8ClampedArray(16);for(let i=0;i<16;i+=4)data.set([...rgb,255],i);
  encoder.add(data,delay);
 }
 const reader=new GifReader(encoder.finish());
 assert.equal(reader.width,2);assert.equal(reader.height,2);assert.equal(reader.numFrames(),2);assert.equal(reader.loopCount(),0);
 assert.equal(reader.frameInfo(0).delay,12);assert.equal(reader.frameInfo(1).delay,45);
 for(let i=0;i<2;i++){const pixels=new Uint8Array(16);reader.decodeAndBlitFrameRGBA(i,pixels);assert.deepEqual([...pixels.slice(0,4)],i===0?[255,0,0,255]:[0,255,0,255]);}
});
test('GIF supports single playback and rejects empty or invalid frames',()=>{
 const encoder=engine.createEncoder(1,1,64,-1);
 assert.throws(()=>encoder.finish());
 assert.throws(()=>encoder.add(new Uint8ClampedArray(4),0));
 encoder.add(new Uint8ClampedArray([10,20,30,255]),100);
 assert.equal(new GifReader(encoder.finish()).loopCount(),null);
});
test('GIF dimensions preserve aspect ratio without upscaling and video trims omit end frame',()=>{
 assert.deepEqual(engine.outputSize(1920,1080,480),{width:480,height:270});
 assert.deepEqual(engine.outputSize(100,200,480),{width:100,height:200});
 assert.deepEqual(engine.videoTimes(1,1.4,5,2),[1,1.2]);
 assert.throws(()=>engine.videoTimes(0,21,5,30));
 assert.throws(()=>engine.videoTimes(0,20,24,30));
 assert.throws(()=>engine.videoTimes(2,1,10,30));
 assert.throws(()=>engine.checkBudget(960,960,80));
});
