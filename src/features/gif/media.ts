import { outputSize, videoTimes, checkBudget } from './settings';
export type GifOptions = { longest: number; colors: number; repeat: number; background: string; fit: 'contain' | 'cover' };
export type ImageFrame = { id: string; file: File; url: string; width: number; height: number; delay: number };
export type VideoSource = { file: File; url: string; width: number; height: number; duration: number };
function aborted() { return new DOMException('Đã hủy tạo GIF.','AbortError'); }
function waitMedia(media: HTMLMediaElement, event: string, signal?: AbortSignal) {
 return new Promise<void>((resolve,reject) => {
  const clear = () => { clearTimeout(timer); media.removeEventListener(event,ok); media.removeEventListener('error',fail); signal?.removeEventListener('abort',cancel); };
  const ok = () => { clear(); resolve(); };
  const fail = () => { clear(); reject(new Error('Không đọc được video. Thử MP4 (H.264) hoặc WebM khác.')); };
  const cancel = () => { clear(); reject(aborted()); };
  const timer = setTimeout(fail,15000);
  media.addEventListener(event,ok,{once:true}); media.addEventListener('error',fail,{once:true}); signal?.addEventListener('abort',cancel,{once:true});
  if (signal?.aborted) cancel();
 });
}
export async function inspectVideo(file: File): Promise<VideoSource> {
 if (file.size > 150*1024*1024) throw new Error('Video tối đa 150 MB.');
 const url = URL.createObjectURL(file), video = document.createElement('video');
 try {
  video.preload='auto'; video.muted=true; const ready=waitMedia(video,'loadeddata'); video.src=url; await ready;
  if (!Number.isFinite(video.duration) || !video.videoWidth) throw new Error('Video không có thời lượng hợp lệ.');
  return {file,url,width:video.videoWidth,height:video.videoHeight,duration:video.duration};
 } catch(e) { URL.revokeObjectURL(url); throw e; }
 finally { video.removeAttribute('src'); video.load(); }
}
export async function inspectImage(file: File, delay: number): Promise<ImageFrame> {
 if (!/\.(png|jpe?g|webp|bmp)$/i.test(file.name) || file.size > 20*1024*1024) throw new Error(file.name + ': dùng JPG, PNG, WebP hoặc BMP, tối đa 20 MB/ảnh.');
 const bitmap=await createImageBitmap(file);
 try {
  if (bitmap.width*bitmap.height > 40_000_000) throw new Error(file.name + ': ảnh quá lớn (tối đa 40 megapixel).');
  return {id:crypto.randomUUID(),file,url:URL.createObjectURL(file),width:bitmap.width,height:bitmap.height,delay};
 } finally { bitmap.close(); }
}
export async function convertGif(source: ImageFrame[] | VideoSource, options: GifOptions, range: {start:number;end:number;fps:number}, signal: AbortSignal, progress: (done:number,total:number)=>void): Promise<Blob> {
 // Metadata helpers contain no encoder import: expensive quantization only runs in the worker.
 const images=Array.isArray(source) ? source : null;
 const first=images ? images[0] : source as VideoSource;
 if (!first) throw new Error('Thêm ảnh trước khi tạo GIF.');
 const {width,height}=outputSize(first.width,first.height,options.longest);
 const times=images?[]:videoTimes(range.start,range.end,range.fps,(source as VideoSource).duration);
 const count=images?images.length:times.length;
 checkBudget(width,height,count);
 if(images && images.some(frame=>!Number.isFinite(frame.delay)||frame.delay<20||frame.delay>10000))throw new Error('Thời gian mỗi ảnh phải từ 20 đến 10.000 ms.');
 if (signal.aborted) throw aborted();
 const worker=new Worker('/assets/gif-worker.js');
 const request=(message: unknown, transfers: Transferable[] = []) => new Promise<{buffer?: ArrayBuffer}>((resolve,reject) => {
  const cleanup=()=>{clearTimeout(timer); worker.onmessage=null; worker.onerror=null; signal.removeEventListener('abort',cancel);};
  const cancel=()=>{cleanup(); reject(aborted());};
  const timer=setTimeout(()=>{cleanup();reject(new Error('Xử lý quá lâu. Hãy giảm kích thước GIF và thử lại.'));},60000);
  worker.onmessage=({data})=>{cleanup(); data.error ? reject(new Error(data.error)) : resolve(data);};
  worker.onerror=()=>{cleanup();reject(new Error('Không tải được bộ tạo GIF. Tải lại trang rồi thử lại.'));};
  signal.addEventListener('abort',cancel,{once:true});
  if(signal.aborted) {cancel();return;} worker.postMessage(message,transfers);
 });
 const canvas=document.createElement('canvas'); canvas.width=width; canvas.height=height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 let video: HTMLVideoElement | undefined;
 try {
  if (!ctx) throw new Error('Trình duyệt không hỗ trợ Canvas.');
  await request({type:'init',width,height,colors:options.colors,repeat:options.repeat});
  if (!images) { video=document.createElement('video');video.muted=true;video.preload='auto'; const ready=waitMedia(video,'loadeddata',signal);video.src=(source as VideoSource).url;await ready; }
  for(let i=0;i<count;i++) {
   if(signal.aborted) throw aborted();
   let bitmap: ImageBitmap | undefined;
   try {
    let visual: CanvasImageSource; let sw:number,sh:number;
    if(images) { bitmap=await createImageBitmap(images[i].file);visual=bitmap;sw=bitmap.width;sh=bitmap.height; }
    else {
     const target=times[i];
     if(Math.abs(video!.currentTime-target)>.0001) { const seek=waitMedia(video!,'seeked',signal);video!.currentTime=target;await seek; }
     visual=video!;sw=video!.videoWidth;sh=video!.videoHeight;
    }
    ctx.fillStyle=options.background;ctx.fillRect(0,0,width,height);
    const ratio=options.fit==='cover'?Math.max(width/sw,height/sh):Math.min(width/sw,height/sh);
    ctx.drawImage(visual,(width-sw*ratio)/2,(height-sh*ratio)/2,sw*ratio,sh*ratio);
    const pixels=ctx.getImageData(0,0,width,height).data;
    const delay=images ? images[i].delay : Math.max(20,(Math.round((i+1)*100/range.fps)-Math.round(i*100/range.fps))*10);
    await request({type:'frame',buffer:pixels.buffer,delay},[pixels.buffer]);
    progress(i+1,count);
   } finally {bitmap?.close();}
  }
  const output=await request({type:'finish'});
  if(!output.buffer) throw new Error('Không nhận được GIF.');
  return new Blob([output.buffer],{type:'image/gif'});
 } finally {worker.terminate();canvas.width=canvas.height=0;if(video){video.removeAttribute('src');video.load();}}
}
