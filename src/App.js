import React, { useState, useEffect } from "react";
import ErrorBoundary from "./ErrorBoundary";

const App = () => {
  return (
    <ErrorBoundary>
      <Content />
    </ErrorBoundary>
  );
};

const Content = () => {
  const [sourceImg, setSourceImg] = useState(null);
  const [targPixelIndex, setTargPixelIndex] = useState(570);
  const canvasRef = React.useRef(null);
  const maxWidth = 90;

  useEffect(() => {
    if (!sourceImg) {
      const image = new Image();
      image.crossOrigin = "Anonymous";
      image.onload = () => {
        setSourceImg(image);
      };
      image.src = "doug.png";
    } else {
      const wToHRatio = sourceImg.height / sourceImg.width;
      const maxHeight = maxWidth * wToHRatio;

      // const testGreyCanvas = createTestGreyCanvas();
      const smallCanvas = createSmallCanvas(sourceImg, maxWidth, maxHeight);

      const blockCanvas = createDitheredCanvas(smallCanvas, targPixelIndex);

      const ctx = canvasRef.current.getContext("2d");
      canvasRef.current.width = blockCanvas.width;
      canvasRef.current.height = blockCanvas.height;
      drawCanvas(ctx, blockCanvas);
    }
  });

  return (
    <>
      <div>
        <button onClick={() => setTargPixelIndex(targPixelIndex + 1)}>
          Next
        </button>
        <span> Target Pixel Index: {targPixelIndex}</span>
      </div>
      <canvas ref={canvasRef} />;
    </>
  );
};

export default App;

const drawCanvas = (ctx, source) => {
  ctx.drawImage(source, 0, 0);
};

const createSmallCanvas = (source, maxWidth, maxHeight) => {
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

const createPixelDataArrayFromPixelColorArray = rgbaPixels => {
  const brightnessArray = [];

  for (let rIndex = 0; rIndex < rgbaPixels.length; rIndex += 4) {
    const r = rgbaPixels[rIndex];
    const g = rgbaPixels[rIndex + 1];
    const b = rgbaPixels[rIndex + 2];

    const brightness = r * 0.2126 + g * 0.7152 + b * 0.0722;

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

// const createTestGreyCanvas = (w = 100, h = 100, grey = 127) => {
//   const outputCanvas = document.createElement("canvas");
//   outputCanvas.width = w;
//   outputCanvas.height = h;
//   const ctx = outputCanvas.getContext("2d");

//   ctx.fillStyle = `rgb(${grey}, ${grey}, ${grey})`;
//   ctx.fillRect(0, 0, w, h);

//   return outputCanvas;
// };

const createDitheredCanvas = (inputCanvas, targPixelIndex) => {
  const { width: inputW, height: inputH } = inputCanvas;

  const blockSize = 5;
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

const drawPixelBlock = ({ ctx, x, y, blockSize, colour }) => {
  ctx.fillStyle = colour;
  ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
};

const isOnRightEdge = (sourceIndex, width) => {
  const xPos = sourceIndex % width;
  return xPos >= width - 1;
};

const isOnBottomEdge = (sourceIndex, width, height) => {
  const yPos = Math.floor(sourceIndex / width) + 1;
  return yPos >= height - 1;
};

const getLocationFromIndex = (index, width) => {
  const y = Math.floor(index / width) + 1;
  const x = index % width;

  return { x, y };
};

const getPixelBrightness = (pixels, startIndex) => {
  const r = pixels[startIndex];
  const g = pixels[startIndex + 1];
  const b = pixels[startIndex + 2];

  return r * 0.2126 + g * 0.7152 + b * 0.0722;
};
