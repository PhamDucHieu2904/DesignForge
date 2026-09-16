import { createEncoder } from './engine';
let encoder: ReturnType<typeof createEncoder> | undefined;
const scope = self as unknown as { onmessage: ((event: MessageEvent) => void) | null; postMessage: (data: unknown, transfer?: Transferable[]) => void };
scope.onmessage = ({ data }) => {
 try {
  if (data.type === 'init') encoder = createEncoder(data.width,data.height,data.colors,data.repeat);
  else if (data.type === 'frame') { if (!encoder) throw new Error('Chưa khởi tạo GIF.'); encoder.add(new Uint8ClampedArray(data.buffer),data.delay); }
  else if (data.type === 'finish') {
   if (!encoder) throw new Error('Chưa khởi tạo GIF.');
   const bytes = encoder.finish(); encoder = undefined;
   const buffer = new Uint8Array(bytes).buffer;
   scope.postMessage({buffer},[buffer]); return;
  } else throw new Error('Yêu cầu không hợp lệ.');
  scope.postMessage({ok:true});
 } catch (error) { scope.postMessage({error: error instanceof Error ? error.message : 'Không tạo được GIF.'}); }
};
