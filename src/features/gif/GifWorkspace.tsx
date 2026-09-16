import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/Icon';
import { inspectImage, inspectVideo, convertGif, type ImageFrame, type VideoSource, type GifOptions } from './media';
import './gif.css';

export function GifWorkspace({mode,onBack}:{mode:'images'|'video';onBack:()=>void}) {
 const [frames,setFrames]=useState<ImageFrame[]>([]);
 const [video,setVideo]=useState<VideoSource|null>(null);
 const [settings,setSettings]=useState<GifOptions>({longest:480,colors:256,repeat:0,background:'#ffffff',fit:'contain'});
 const [delay,setDelay]=useState(300);
 const [range,setRange]=useState({start:0,end:5,fps:10});
 const [busy,setBusy]=useState(false), [importing,setImporting]=useState(false), [error,setError]=useState('');
 const [progress,setProgress]=useState({done:0,total:0});
 const [result,setResult]=useState<{url:string;size:number;frames:number}|null>(null);
 const [playing,setPlaying]=useState(false),[selected,setSelected]=useState(0),[dragging,setDragging]=useState(false);
 const input=useRef<HTMLInputElement>(null),controller=useRef<AbortController|null>(null),mounted=useRef(true),importLock=useRef(false);
 const urls=useRef(new Set<string>());
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;controller.current?.abort();urls.current.forEach(url=>URL.revokeObjectURL(url));urls.current.clear();};},[]);
 function revoke(url:string){URL.revokeObjectURL(url);urls.current.delete(url);}
 function clearResult(){if(result)revoke(result.url);setResult(null);setPlaying(false);}
 useEffect(()=>{
  if(!playing || !frames.length)return;
  const timer=setTimeout(()=>setSelected(index=>(index+1)%frames.length),frames[selected]?.delay||300);
  return()=>clearTimeout(timer);
 },[playing,selected,frames]);
 async function addFiles(list: FileList | File[]) {
  if(busy||importLock.current)return;
  importLock.current=true;setImporting(true);setError('');clearResult();
  try {
   if(mode==='images'){
    const files=Array.from(list);
    if(frames.length+files.length>80)throw new Error('Tối đa 80 ảnh. Hãy chọn ít ảnh hơn.');
    const added:ImageFrame[]=[];const failures:string[]=[];
    for(const file of files){try{const frame=await inspectImage(file,delay);if(!mounted.current){URL.revokeObjectURL(frame.url);break;}urls.current.add(frame.url);added.push(frame);}catch(e){failures.push(e instanceof Error?e.message:'Không đọc được ảnh.');}}
    if(mounted.current){setFrames(current=>[...current,...added]);setError(failures.join(' '));}
   }else{
    if(list.length!==1)throw new Error('Chọn một video mỗi lần.');
    const next=await inspectVideo(list[0]);
    if(!mounted.current){URL.revokeObjectURL(next.url);return;}
    if(video)revoke(video.url);urls.current.add(next.url);setVideo(next);setRange({start:0,end:Math.min(5,next.duration),fps:10});
   }
  }catch(e){if(mounted.current)setError(e instanceof Error?e.message:'Không mở được tệp.');}
  finally{importLock.current=false;if(mounted.current)setImporting(false);if(input.current)input.current.value='';}
 }
 function move(index:number,direction:number){clearResult();setSelected(0);setFrames(current=>{const next=[...current];[next[index],next[index+direction]]=[next[index+direction],next[index]];return next;});}
 function remove(index:number){clearResult();revoke(frames[index].url);setFrames(current=>current.filter((_,i)=>i!==index));setSelected(0);}
 async function generate(){
  setError('');clearResult();setBusy(true);setProgress({done:0,total:0});const abort=new AbortController();controller.current=abort;
  try {
   const source=mode==='images'?frames:video;
   if(!source)throw new Error('Thêm video trước khi tạo GIF.');
   if(mode==='images'&&frames.length<2)throw new Error('Thêm ít nhất 2 ảnh để tạo ảnh động.');
   const blob=await convertGif(source,settings,range,abort.signal,(done,total)=>{if(mounted.current)setProgress({done,total});});
   if(!mounted.current||abort.signal.aborted)return;
   const url=URL.createObjectURL(blob);urls.current.add(url);setResult({url,size:blob.size,frames:mode==='images'?frames.length:Math.ceil((range.end-range.start)*range.fps)});
  }catch(e){if(mounted.current)setError(e instanceof Error?e.message:'Không tạo được GIF.');}
  finally{if(mounted.current)setBusy(false);controller.current=null;}
 }
 const current=mode==='images'?frames[0]:video;
 const scale=current?Math.min(1,settings.longest/Math.max(current.width,current.height)):1;
 const size=current?`${Math.round(current.width*scale)} × ${Math.round(current.height*scale)} px`:'Chưa có tệp';
 const total=mode==='images'?frames.reduce((sum,frame)=>sum+frame.delay,0)/1000:Math.max(0,range.end-range.start);
 const update=<K extends keyof GifOptions>(key:K,value:GifOptions[K])=>{clearResult();setSettings(current=>({...current,[key]:value}));};
 return <div className="gif-workspace">
  <button className="back-link" onClick={onBack}><Icon name="arrow" size={16}/> Gif converter</button>
  <div className="gif-heading"><div><p className="eyebrow">GIF CONVERTER</p><h1>{mode==='images'?'Ảnh thành GIF':'Video thành GIF'}</h1><p>{mode==='images'?'Sắp xếp từng khoảnh khắc thành một ảnh động.':'Chọn đoạn bạn muốn giữ, tạo GIF và chia sẻ.'}</p></div><span className="gif-local">Tệp được xử lý trên thiết bị</span></div>
  <div className="gif-layout">
   <section className="gif-panel gif-controls" aria-label="Thiết lập GIF">
    <fieldset disabled={busy||importing}>
     <h2>1. {mode==='images'?'Thêm ảnh':'Thêm video'}</h2>
     <input ref={input} type="file" className="gif-file-input" aria-label={mode==='images'?'Chọn ảnh tạo GIF':'Chọn video tạo GIF'} accept={mode==='images'?'.jpg,.jpeg,.png,.webp,.bmp':'video/*'} multiple={mode==='images'} onChange={event=>event.target.files&&void addFiles(event.target.files)}/>
     <button className={`gif-upload ${dragging?'is-dragging':''}`} type="button" onClick={()=>input.current?.click()} onDragOver={event=>{event.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={event=>{event.preventDefault();setDragging(false);void addFiles(event.dataTransfer.files);}}>
      <Icon name={mode==='images'?'image':'film'} size={28}/><strong>{importing?'Đang đọc tệp…':mode==='images'?'Chọn hoặc thả ảnh vào đây':'Chọn hoặc thả video vào đây'}</strong><span>{mode==='images'?'JPG, PNG, WebP, BMP · tối đa 80 ảnh':'Video trình duyệt đọc được · tối đa 150 MB'}</span>
     </button>
     {mode==='images'&&frames.length>0&&<><div className="gif-list-heading"><span>{frames.length} ảnh · {total.toFixed(2)} giây</span><button type="button" onClick={()=>{clearResult();frames.forEach(f=>revoke(f.url));setFrames([]);setSelected(0);}}>Xóa tất cả</button></div><ol className="gif-frame-list">{frames.map((frame,i)=><li key={frame.id}><button type="button" className={`gif-thumb ${selected===i?'is-selected':''}`} aria-label={`Xem ảnh ${i+1}: ${frame.file.name}`} onClick={()=>{setPlaying(false);setSelected(i);}}><img src={frame.url} alt=""/></button><div className="gif-frame-meta"><strong title={frame.file.name}>{i+1}. {frame.file.name}</strong><label>Thời gian <input type="number" min={20} max={10000} step={10} value={frame.delay} aria-label={`Thời gian ảnh ${i+1} (ms)`} onChange={e=>{clearResult();setFrames(items=>items.map((f,j)=>j===i?{...f,delay:Number(e.target.value)}:f));}}/> ms</label></div><div className="gif-frame-actions"><button type="button" disabled={i===0} aria-label={`Đưa ảnh ${i+1} lên`} onClick={()=>move(i,-1)}>↑</button><button type="button" disabled={i===frames.length-1} aria-label={`Đưa ảnh ${i+1} xuống`} onClick={()=>move(i,1)}>↓</button><button type="button" aria-label={`Xóa ảnh ${i+1}`} onClick={()=>remove(i)}><Icon name="close" size={16}/></button></div></li>)}</ol></>}
     {video&&<div className="gif-video-info"><strong>{video.file.name}</strong><span>{video.width} × {video.height} px · {video.duration.toFixed(2)} giây</span></div>}
     <h2>2. Chuyển động</h2>
     {mode==='images'?<><div className="gif-field-row"><label>Thời gian mặc định (ms)<input type="number" min={20} max={10000} step={10} value={delay} onChange={e=>setDelay(Number(e.target.value))}/></label><button className="gif-secondary" type="button" onClick={()=>{if(!Number.isFinite(delay)||delay<20||delay>10000){setError('Thời gian phải từ 20 đến 10.000 ms.');return;}clearResult();setFrames(current=>current.map(frame=>({...frame,delay})));}}>Áp dụng tất cả</button></div><p className="gif-help">300 ms ≈ 3 ảnh/giây. Dùng nút ↑ ↓ để đổi thứ tự.</p></>:<><div className="gif-field-row"><label>Bắt đầu (giây)<input type="number" min={0} step={.1} max={video?.duration} value={range.start} onChange={e=>{clearResult();setRange({...range,start:Number(e.target.value)});}}/></label><label>Kết thúc (giây)<input type="number" min={0} step={.1} max={video?.duration} value={range.end} onChange={e=>{clearResult();setRange({...range,end:Number(e.target.value)});}}/></label></div><label>Khung hình mỗi giây<select value={range.fps} onChange={e=>{clearResult();setRange({...range,fps:Number(e.target.value)});}}><option value={5}>5 FPS · nhẹ</option><option value={10}>10 FPS · cân bằng</option><option value={15}>15 FPS · mượt</option><option value={24}>24 FPS · mượt hơn</option></select></label><p className="gif-help">Chọn đoạn tối đa 20 giây / 240 frame. GIF không có âm thanh.</p></>}
     <h2>3. Kích thước & chất lượng</h2>
     <div className="gif-field-row"><label>Cạnh dài tối đa<select value={settings.longest} onChange={e=>update('longest',Number(e.target.value))}>{[240,360,480,640,800,960].map(n=><option key={n} value={n}>{n} px</option>)}</select></label><label>Bảng màu<select value={settings.colors} onChange={e=>update('colors',Number(e.target.value))}><option value={64}>64 màu · nhẹ</option><option value={128}>128 màu</option><option value={256}>256 màu · tốt nhất</option></select></label></div>
     <div className="gif-field-row"><label>Phát lại<select value={settings.repeat} onChange={e=>update('repeat',Number(e.target.value))}><option value={0}>Lặp vô hạn</option><option value={-1}>Một lần</option></select></label><label>Đặt ảnh<select value={settings.fit} onChange={e=>update('fit',e.target.value as GifOptions['fit'])}><option value="contain">Vừa khung</option><option value="cover">Lấp đầy khung</option></select></label></div>
     <label className="gif-color-label">Màu nền<input type="color" value={settings.background} onChange={e=>update('background',e.target.value)}/></label><p className="gif-help">Giữ tỷ lệ ảnh đầu tiên. Vùng trong suốt được ghép lên màu nền đã chọn.</p>
    </fieldset>
    {error&&<p className="gif-error" role="alert">{error}</p>}
    {busy?<div className="gif-progress" role="status"><span>{progress.total?`Đang tạo: ${progress.done}/${progress.total} frame`:'Đang chuẩn bị…'}</span><progress max={progress.total||1} value={progress.done}/><button className="gif-secondary" onClick={()=>controller.current?.abort()}>Hủy tạo GIF</button></div>:<button className="gif-primary" onClick={()=>void generate()} disabled={importing||(mode==='images'?frames.length<2:!video)}>Tạo GIF</button>}
   </section>
   <section className="gif-panel gif-preview"><div className="gif-preview-heading"><h2>{result?'GIF đã tạo':'Xem trước'}</h2><span>{size}</span></div><div className="gif-stage" style={{background:settings.background}}>
    {result?<img src={result.url} alt="GIF đã tạo"/>:mode==='images'&&frames[selected]?<img src={frames[selected].url} alt={frames[selected].file.name} style={{objectFit:settings.fit}}/>:video?<video src={video.url} controls preload="metadata" playsInline/>:<div className="gif-empty"><Icon name={mode==='images'?'layers':'film'} size={44}/><h3>{mode==='images'?'Ảnh của bạn, chuyển động của bạn':'Biến khoảnh khắc thành GIF'}</h3><p>{mode==='images'?'Thêm ít nhất 2 ảnh để bắt đầu.':'Thêm video rồi chọn điểm bắt đầu và kết thúc.'}</p></div>}
   </div><div className="gif-preview-footer">
    {result?<><div><strong>{result.size < 1024*1024 ? (result.size/1024).toFixed(1)+' KB' : (result.size/1024/1024).toFixed(2)+' MB'} · {result.frames} frame</strong><span>Đây là file GIF đã mã hóa.</span></div><a className="gif-primary" href={result.url} download={mode==='images'?'designforge-images.gif':'designforge-video.gif'}>Tải GIF xuống</a></>:<><div><strong>{current?`${total.toFixed(2)} giây · ${settings.colors} màu`:'Kết quả sẽ xuất hiện tại đây'}</strong><span>{current?'Bấm Tạo GIF để xem đúng kết quả xuất.':'Ảnh và video không được tải lên máy chủ.'}</span></div>{mode==='images'&&frames.length>1&&<button className="gif-secondary" onClick={()=>setPlaying(!playing)}>{playing?'Dừng xem thử':'Phát thử'}</button>}</>}
   </div>{result&&<button className="gif-text-button" onClick={clearResult}>Quay lại ảnh / video nguồn</button>}</section>
  </div>
 </div>;
}
