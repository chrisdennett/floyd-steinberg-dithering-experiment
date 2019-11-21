import { drawPixelBlock } from "./helpers";

export const createDitheredCanvas = (sourceCanvasData, blockSize) => {
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = sourceCanvasData.width * blockSize;
  outputCanvas.height = sourceCanvasData.height * blockSize;
  const ctx = outputCanvas.getContext("2d");

  sourceCanvasData.pixelData.forEach(pixel => {
    const { ditheredQuantisation, x, y } = pixel;
    let colour = `rgb(${ditheredQuantisation},${ditheredQuantisation},${ditheredQuantisation})`;
    drawPixelBlock({ ctx, x, y, blockSize, colour });
  });

  return outputCanvas;
};

export const createQuantErrorCanvas = (sourceCanvasData, blockSize) => {
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = sourceCanvasData.width * blockSize;
  outputCanvas.height = sourceCanvasData.height * blockSize;
  const ctx = outputCanvas.getContext("2d");

  sourceCanvasData.pixelData.forEach(pixel => {
    const { quantisationError, x, y } = pixel;
    let colour = `rgb(${quantisationError},${quantisationError},${quantisationError})`;
    drawPixelBlock({ ctx, x, y, blockSize, colour });
  });

  return outputCanvas;
};

export const updatePixelDataWithDitherInfo = (
  sourcePixelDataArray,
  pixelWidth
) => {
  const totalPixels = sourcePixelDataArray.length;

  for (let i = 0; i < totalPixels; i++) {
    const sourcePixelData = sourcePixelDataArray[i];

    const fullPixelValue =
      sourcePixelData.brightness + sourcePixelData.quantErrorToAdd;

    sourcePixelData.ditheredQuantisation = fullPixelValue > 127 ? 255 : 0;
    sourcePixelData.quantisationError =
      sourcePixelData.brightness - sourcePixelData.ditheredQuantisation;

    const rightErrorFraction = sourcePixelData.quantisationError * (7 / 16);
    const bottomRightErrorFraction =
      sourcePixelData.quantisationError * (1 / 16);
    const bottomErrorFraction = sourcePixelData.quantisationError * (5 / 16);
    const bottomLeftErrorFraction =
      sourcePixelData.quantisationError * (3 / 16);

    const rightPixelIndex = i + 1;
    const bottomPixelIndex = i + pixelWidth;
    const bottomRightIndex = bottomPixelIndex + 1;
    const bottomLeftIndex = bottomPixelIndex - 1;

    let rightPixelData,
      bottomPixelData,
      bottomLeftPixelData,
      bottomRightPixelData;

    if (!sourcePixelData.onRightEdge) {
      rightPixelData = sourcePixelDataArray[rightPixelIndex];
      rightPixelData.quantErrorToAdd += rightErrorFraction;
    }

    if (!sourcePixelData.onBottomEdge) {
      bottomPixelData = sourcePixelDataArray[bottomPixelIndex];
      bottomPixelData.quantErrorToAdd += bottomErrorFraction;
    }

    if (!sourcePixelData.onLeftEdge && !sourcePixelData.onBottomEdge) {
      bottomLeftPixelData = sourcePixelDataArray[bottomLeftIndex];
      bottomLeftPixelData.quantErrorToAdd += bottomLeftErrorFraction;
    }

    if (!sourcePixelData.onRightEdge && !sourcePixelData.onBottomEdge) {
      bottomRightPixelData = sourcePixelDataArray[bottomRightIndex];
      bottomRightPixelData.quantErrorToAdd += bottomRightErrorFraction;
    }
  }

  return sourcePixelDataArray;
};

// if (i === targPixelIndex) {
//     sourcePixelData.colour = "#ff0000";

//     if (rightPixelData) rightPixelData.colour = "#00FF00";
//     if (bottomRightPixelData) bottomRightPixelData.colour = "#FFFF00";
//     if (bottomPixelData) bottomPixelData.colour = "#00FFFF";
//     if (bottomLeftPixelData) bottomLeftPixelData.colour = "#FF00FF";
//   }
