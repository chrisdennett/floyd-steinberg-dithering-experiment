export const drawCanvas = (targetCanvas, source) => {
  const ctx = targetCanvas.getContext("2d");
  targetCanvas.width = source.width;
  targetCanvas.height = source.height;

  ctx.drawImage(source, 0, 0);
};

export const drawCanvasArea = (
  targetCanvas,
  source,
  x = 0,
  y = 0,
  width = 100,
  height = 100
) => {
  const ctx = targetCanvas.getContext("2d");
  targetCanvas.width = width;
  targetCanvas.height = height;

  console.log("targetCanvas.height: ", targetCanvas.height);

  // void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  ctx.drawImage(source, x, y, width, height, 0, 0, width, height);
};

export const createThresholdCanvas = (sourceCanvasData, blockSize) => {
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = sourceCanvasData.width * blockSize;
  outputCanvas.height = sourceCanvasData.height * blockSize;
  const outputCtx = outputCanvas.getContext("2d");

  sourceCanvasData.pixelData.forEach(pixel => {
    const blackOrWhite = pixel.brightness > 127 ? 255 : 0;
    outputCtx.fillStyle = `rgb(${blackOrWhite},${blackOrWhite},${blackOrWhite})`;
    outputCtx.fillRect(
      pixel.x * blockSize,
      pixel.y * blockSize,
      blockSize,
      blockSize
    );
  });

  return outputCanvas;
};

export const createColourCanvas = (sourceCanvasData, blockSize) => {
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = sourceCanvasData.width * blockSize;
  outputCanvas.height = sourceCanvasData.height * blockSize;
  const outputCtx = outputCanvas.getContext("2d");

  sourceCanvasData.pixelData.forEach(pixel => {
    outputCtx.fillStyle = pixel.colour;
    outputCtx.fillRect(
      pixel.x * blockSize,
      pixel.y * blockSize,
      blockSize,
      blockSize
    );
  });

  return outputCanvas;
};

export const createBrightnessCanvas = (sourceCanvasData, blockSize) => {
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = sourceCanvasData.width * blockSize;
  outputCanvas.height = sourceCanvasData.height * blockSize;
  const outputCtx = outputCanvas.getContext("2d");

  sourceCanvasData.pixelData.forEach(pixel => {
    outputCtx.fillStyle = `rgb(${pixel.brightness},${pixel.brightness},${pixel.brightness})`;
    outputCtx.fillRect(
      pixel.x * blockSize,
      pixel.y * blockSize,
      blockSize,
      blockSize
    );
  });

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

export const drawImageToCanvas = img => {
  const outputCanvas = document.createElement("canvas");
  const ctx = outputCanvas.getContext("2d");
  outputCanvas.width = img.width;
  outputCanvas.height = img.height;

  ctx.drawImage(img, 0, 0);

  return outputCanvas;
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

export const createCanvasData = canvas => {
  return {
    width: canvas.width,
    height: canvas.height,
    pixelData: createPixelData(canvas)
  };
};

const createPixelData = inputCanvas => {
  const { width: inputW, height: inputH } = inputCanvas;
  const inputCtx = inputCanvas.getContext("2d");
  let imgData = inputCtx.getImageData(0, 0, inputW, inputH);
  let rgbaPixels = imgData.data;
  const brightnessArray = [];

  for (let rIndex = 0; rIndex < rgbaPixels.length; rIndex += 4) {
    const brightness = getPixelBrightness(rgbaPixels, rIndex);
    const colour = `rgb(${rgbaPixels[rIndex]}, ${rgbaPixels[rIndex + 1]}, ${
      rgbaPixels[rIndex + 2]
    })`;

    const index = rIndex / 4;
    const x = index % inputW;
    const y = Math.floor(index / inputW);

    const onRightEdge = isOnRightEdge(index, inputW);
    const onLeftEdge = x === 0;
    const onBottomEdge = isOnBottomEdge(index, inputW, inputH);

    const ditheredQuantisation = -1; // set default value
    const quantErrorToAdd = 0; // set default value
    brightnessArray.push({
      x,
      y,
      onLeftEdge,
      onRightEdge,
      onBottomEdge,
      brightness,
      colour,
      ditheredQuantisation,
      quantErrorToAdd
    });
  }

  return brightnessArray;
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
