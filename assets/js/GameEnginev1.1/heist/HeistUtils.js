export const COLS = 22;
export const ROWS = 16;

export function getCellSize(gameEnv) {
  return {
    width: gameEnv.innerWidth / COLS,
    height: gameEnv.innerHeight / ROWS
  };
}

export function gridToPixel(gameEnv, x, y) {
  const cellSize = getCellSize(gameEnv);
  return { x: x * cellSize.width, y: y * cellSize.height };
}

export function gridCenterToPixel(gameEnv, x, y) {
  const cellSize = getCellSize(gameEnv);
  return { x: x * cellSize.width + cellSize.width / 2, y: y * cellSize.height + cellSize.height / 2 };
}

export function isWallAt(gameEnv, x, y) {
  return !!gameEnv.heistWalls?.has(`${x},${y}`);
}

export function collidesWithWalls(gameEnv, x, y, width, height) {
  const { width: cellWidth, height: cellHeight } = getCellSize(gameEnv);
  const startX = Math.floor(x / cellWidth);
  const startY = Math.floor(y / cellHeight);
  const endX = Math.floor((x + width - 1) / cellWidth);
  const endY = Math.floor((y + height - 1) / cellHeight);

  for (let gx = startX; gx <= endX; gx += 1) {
    for (let gy = startY; gy <= endY; gy += 1) {
      if (isWallAt(gameEnv, gx, gy)) {
        return true;
      }
    }
  }

  return false;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function getGridBounds(gameEnv) {
  const { width, height } = getCellSize(gameEnv);
  return { width: width * COLS, height: height * ROWS };
}
