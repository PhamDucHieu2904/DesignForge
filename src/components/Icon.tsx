import type { IconName } from '../domain/types';

const paths: Record<IconName, string> = {
  film: 'M4 3h16v18H4zM4 7h16M4 17h16M8 3v4m8-4v4M8 17v4m8-4v4m-6-11 5 3-5 3z',
  spark: 'M12 3v4m0 10v4M3 12h4m10 0h4M5.6 5.6l2.8 2.8m5.2 5.2 2.8 2.8m0-10.8-2.8 2.8m-5.2 5.2-2.8 2.8',
  scan: 'M4 7V5a1 1 0 0 1 1-1h2m8 0h2a1 1 0 0 1 1 1v2m0 10v2a1 1 0 0 1-1 1h-2m-8 0H5a1 1 0 0 1-1-1v-2M7 9h10v6H7z',
  file: 'M6 3h7l5 5v13H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm7 0v6h5M8 13h8m-8 4h5',
  image: 'M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Zm3 12 3-3 2 2 3-4 4 5M9 9h.01',
  pen: 'm14 4 6 6M5 19l3.5-.7L19 7.8a2.12 2.12 0 0 0-3-3L5.7 15.3 5 19Zm9-12 3 3',
  layers: 'm12 3 8 4-8 4-8-4 8-4Zm-8 9 8 4 8-4m-16 5 8 4 8-4',
  search: 'm20 20-4.6-4.6M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  bookmark: 'M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-3-6 3V4Z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'm6 6 12 12M18 6 6 18',
  sliders: 'M4 6h16M4 12h16M4 18h16M8 4v4m8 2v4m-5 6v4',
  external: 'M14 5h5v5m-1-4-8 8M19 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4',
};

export function Icon({ name, size = 20, strokeWidth = 1.7 }: { name: IconName; size?: number; strokeWidth?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}
