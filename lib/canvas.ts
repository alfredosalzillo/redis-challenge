export const drawPixel = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
  const hex = color.startsWith('#') ? color.substring(1) : color;
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  ctx.fillStyle = `rgba(${r},${g},${b},255)`;
  ctx.fillRect( x, y, 1, 1 );
};

export const clearCanvas = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}