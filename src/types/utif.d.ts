declare module 'utif' {
  export type TiffIFD = { width: number; height: number; [key: string]: unknown };
  export function decode(buffer: ArrayBuffer): TiffIFD[];
  export function decodeImage(buffer: ArrayBuffer, ifd: TiffIFD): void;
  export function toRGBA8(ifd: TiffIFD): Uint8Array;
}
