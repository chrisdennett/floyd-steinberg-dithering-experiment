export const drawCanvas = (targetCanvas, source) => {
  const ctx = targetCanvas.getContext("2d");
  targetCanvas.width = source.width;
  targetCanvas.height = source.height;

  ctx.drawImage(source, 0, 0);
};

export const createThresholdCanvas = (inputCanvas, blockSize) => {
  const { width: inputW, height: inputH } = inputCanvas;

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = inputW * blockSize;
  outputCanvas.height = inputH * blockSize;
  const outputCtx = outputCanvas.getContext("2d");

  const inputCtx = inputCanvas.getContext("2d");
  let imgData = inputCtx.getImageData(0, 0, inputW, inputH);
  let pixels = imgData.data;

  for (let y = 0; y < inputH; y++) {
    for (let x = 0; x < inputW; x++) {
      const i = (y * inputW + x) * 4;

      const brightness = getPixelBrightness(pixels, i);

      const blackOrWhite = brightness > 127 ? 255 : 0;

      outputCtx.fillStyle = `rgb(${blackOrWhite},${blackOrWhite},${blackOrWhite})`;
      outputCtx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    }
  }

  return outputCanvas;
};

export const createSmallCanvas = (source, maxWidth, maxHeight) => {
  const sourceW = source.width;
  const sourceH = source.height;

  const wToHRatio = sourceH / sourceW;
  const hToWRatio = sourceW / sourceH;

  // allow maxHeight or maxWidth to be null
  if (!maxWidth) maxWidth = source.width;
  if (!maxHeight) maxHeight = source.height;

  let targetW = maxWidth;
  let targetH = targetW * wToHRatio;

  if (sourceH > maxHeight) {
    targetH = maxHeight;
    targetW = targetH * hToWRatio;
  }

  const smallCanvas = document.createElement("canvas");
  const ctx = smallCanvas.getContext("2d");
  smallCanvas.width = targetW;
  smallCanvas.height = targetH;

  ctx.drawImage(source, 0, 0, sourceW, sourceH, 0, 0, targetW, targetH);

  return smallCanvas;
};

export const createTestGreyCanvas = (w = 100, h = 100, grey = 127) => {
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = w;
  outputCanvas.height = h;
  const ctx = outputCanvas.getContext("2d");

  ctx.fillStyle = `rgb(${grey}, ${grey}, ${grey})`;
  ctx.fillRect(0, 0, w, h);

  return outputCanvas;
};

export const drawPixelBlock = ({ ctx, x, y, blockSize, colour }) => {
  ctx.fillStyle = colour;
  ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
};

export const isOnRightEdge = (sourceIndex, width) => {
  const xPos = sourceIndex % width;
  return xPos >= width - 1;
};

export const isOnBottomEdge = (sourceIndex, width, height) => {
  const yPos = Math.floor(sourceIndex / width) + 1;
  return yPos >= height - 1;
};

export const getLocationFromIndex = (index, width) => {
  const y = Math.floor(index / width) + 1;
  const x = index % width;

  return { x, y };
};

export const getPixelBrightness = (pixels, startIndex) => {
  const r = pixels[startIndex];
  const g = pixels[startIndex + 1];
  const b = pixels[startIndex + 2];

  return r * 0.2126 + g * 0.7152 + b * 0.0722;
};
