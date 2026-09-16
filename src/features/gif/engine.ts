import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { checkBudget } from './settings';
export { outputSize, videoTimes, checkBudget } from './settings';
export function createEncoder(width: number, height: number, colors: number, repeat: number) {
  if (![64,128,256].includes(colors) || ![0,-1].includes(repeat)) throw new Error('Thiết lập GIF không hợp lệ.');
  checkBudget(width,height,1);
  const encoder = GIFEncoder();
  let count = 0;
  return {
    add(data: Uint8ClampedArray, delay: number) {
      if (data.length !== width*height*4 || !Number.isFinite(delay) || delay < 20 || delay > 10000) throw new Error('Khung hình hoặc thời gian không hợp lệ.');
      checkBudget(width,height,++count);
      const palette = quantize(data, colors);
      encoder.writeFrame(applyPalette(data,palette),width,height,{palette,delay,repeat});
    },
    finish() { if (!count) throw new Error('Chưa có khung hình.'); encoder.finish(); return encoder.bytes(); }
  };
}
