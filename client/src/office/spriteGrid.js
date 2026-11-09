// All character layer sheets (skin/hair/clothing) share one 800x448 grid:
// 10 columns x 7 rows, each cell 80x64px. Confirmed by pixel-probing the
// source sprite sheets — every layer's silhouette lines up on the same grid,
// which is what makes simple stacked-layer compositing work.
export const CELL_W = 80;
export const CELL_H = 64;
export const SHEET_W = 800;
export const SHEET_H = 448;

// Named animation rows (col count = how many frames in that row are populated).
export const ROWS = {
  idle: { row: 0, frames: 5 },
  walk: { row: 1, frames: 8 },
  run: { row: 2, frames: 8 },
  jump: { row: 3, frames: 4 },
  climb: { row: 4, frames: 4 },
  sit: { row: 5, frames: 6 },
  hurt: { row: 6, frames: 8 },
};

export function spriteUrl(file) {
  return `/assets/office/sprites/${file}`;
}

export function roomUrl(file) {
  return `/assets/office/room/${file}`;
}

// Style for one layer div showing a single frame of a sheet, scaled up.
export function frameLayerStyle(file, frameIndex, row, scale) {
  return {
    position: "absolute",
    inset: 0,
    width: CELL_W * scale,
    height: CELL_H * scale,
    backgroundImage: `url(${spriteUrl(file)})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${SHEET_W * scale}px ${SHEET_H * scale}px`,
    backgroundPosition: `-${frameIndex * CELL_W * scale}px -${row * CELL_H * scale}px`,
    imageRendering: "pixelated",
    pointerEvents: "none",
  };
}

// Small square thumbnail (frame 0 of idle row) for pickers/swatches.
// `focus` crops into a sub-rect of the cell so small pieces (shoes/socks,
// which only occupy a few feet-pixels) are still legible at swatch size.
const SWATCH_FOCUS = {
  full: { x: 0, y: 0, w: CELL_W, h: CELL_H },
  feet: { x: 22, y: 44, w: 36, h: 20 },
};

export function swatchStyle(file, size = 40, focus = "full") {
  const rect = SWATCH_FOCUS[focus] || SWATCH_FOCUS.full;
  const scaleX = size / rect.w;
  const scaleY = size / rect.h;
  return {
    width: size,
    height: size,
    backgroundImage: `url(${spriteUrl(file)})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${SHEET_W * scaleX}px ${SHEET_H * scaleY}px`,
    backgroundPosition: `-${rect.x * scaleX}px -${rect.y * scaleY}px`,
    imageRendering: "pixelated",
  };
}
