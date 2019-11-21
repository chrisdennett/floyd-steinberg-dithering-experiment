import {
  getLocationFromIndex,
  getPixelBrightness,
  isOnRightEdge,
  isOnBottomEdge,
  drawPixelBlock
} from "./helpers";

export const createDitheredCanvas = (
  inputCanvas,
  targPixelIndex,
  blockSize
) => {
  const { width: inputW, height: inputH } = inputCanvas;

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = inputW * blockSize;
  outputCanvas.height = inputH * blockSize;
  const ctx = outputCanvas.getContext("2d");

  const inputCtx = inputCanvas.getContext("2d");
  let imgData = inputCtx.getImageData(0, 0, inputW, inputH);
  let pixelColourArray = imgData.data;

  const pixelDataArray = createPixelDataArrayFromPixelColorArray(
    pixelColourArray
  );

  const ditheredArray = createDitheredArray(
    pixelDataArray,
    inputW,
    inputH,
    targPixelIndex
  );

  for (let i = 0; i < ditheredArray.length; i++) {
    const pixelData = ditheredArray[i];
    const { ditheredQuantisation } = pixelData;

    let colour = pixelData.colour
      ? pixelData.colour
      : `rgb(${ditheredQuantisation},${ditheredQuantisation},${ditheredQuantisation})`;

    const { x, y } = getLocationFromIndex(i, inputW);
    drawPixelBlock({ ctx, x, y, blockSize, colour });
  }

  return outputCanvas;
};

const createPixelDataArrayFromPixelColorArray = rgbaPixels => {
  const brightnessArray = [];

  for (let rIndex = 0; rIndex < rgbaPixels.length; rIndex += 4) {
    const brightness = getPixelBrightness(rgbaPixels, rIndex);

    const ditheredQuantisation = 0; // set default value
    const quantErrorToAdd = 0; // set default value
    brightnessArray.push({
      brightness,
      ditheredQuantisation,
      quantErrorToAdd
    });
  }

  return brightnessArray;
};

const createDitheredArray = (
  sourcePixelDataArray,
  pixelWidth,
  pixelHeight,
  targPixelIndex
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

    const onRightEdge = isOnRightEdge(i, pixelWidth);
    const onLeftEdge = i % pixelWidth === 0;
    const onBottomEdge = isOnBottomEdge(i, pixelWidth, pixelHeight);
    let rightPixelData,
      bottomPixelData,
      bottomLeftPixelData,
      bottomRightPixelData;

    if (!onRightEdge) {
      rightPixelData = sourcePixelDataArray[rightPixelIndex];
      rightPixelData.quantErrorToAdd += rightErrorFraction;
    }

    if (!onBottomEdge) {
      bottomPixelData = sourcePixelDataArray[bottomPixelIndex];
      bottomPixelData.quantErrorToAdd += bottomErrorFraction;
    }

    if (!onLeftEdge && !onBottomEdge) {
      bottomLeftPixelData = sourcePixelDataArray[bottomLeftIndex];
      bottomLeftPixelData.quantErrorToAdd += bottomLeftErrorFraction;
    }

    if (!onRightEdge && !onBottomEdge) {
      bottomRightPixelData = sourcePixelDataArray[bottomRightIndex];
      bottomRightPixelData.quantErrorToAdd += bottomRightErrorFraction;
    }

    if (i === targPixelIndex) {
      sourcePixelData.colour = "#ff0000";

      if (rightPixelData) rightPixelData.colour = "#00FF00";
      if (bottomRightPixelData) bottomRightPixelData.colour = "#FFFF00";
      if (bottomPixelData) bottomPixelData.colour = "#00FFFF";
      if (bottomLeftPixelData) bottomLeftPixelData.colour = "#FF00FF";
    }
  }

  return sourcePixelDataArray;
};
