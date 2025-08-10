export const idxFromXY = (x: number, y: number) => {
  return y * 1000 + x; // 0..999 each
};

export const xyFromIdx = (idx: number) => {
  const y = Math.floor(idx / 1000);
  const x = idx % 1000;
  return { x, y };
};