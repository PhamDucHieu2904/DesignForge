export const MAX_PIXELS = 40_000_000;
export function outputSize(width: number, height: number, longest: number) {
  if (![width, height, longest].every(Number.isFinite) || width <= 0 || height <= 0 || longest < 160 || longest > 960) throw new Error('Kích thước không hợp lệ.');
  const scale = Math.min(1, longest / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}
export function videoTimes(start: number, end: number, fps: number, duration: number) {
  if (![start,end,fps,duration].every(Number.isFinite) || start < 0 || end <= start || end > duration + .001 || end-start > 20 || fps < 1 || fps > 24) throw new Error('Chọn đoạn từ 0–20 giây trong video và FPS từ 1–24.');
  const count = Math.ceil((end - start) * fps);
  if (count > 240) throw new Error('Tối đa 240 khung hình. Hãy giảm FPS hoặc rút ngắn đoạn video.');
  return Array.from({length:count}, (_,i) => start + i / fps);
}
export function checkBudget(width: number, height: number, frames: number) {
  if (![width,height].every(n=>Number.isInteger(n)&&n>0&&n<=960)) throw new Error('Kích thước GIF phải từ 1 đến 960 pixel.');
  if (!Number.isInteger(frames) || frames < 1 || frames > 240 || width*height*frames > MAX_PIXELS) throw new Error('GIF này quá lớn. Hãy giảm kích thước, số ảnh hoặc FPS (tối đa 40 triệu pixel cho toàn bộ GIF).');
}
