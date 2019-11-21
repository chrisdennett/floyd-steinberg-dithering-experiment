import React, { useState, useEffect } from "react";
import ErrorBoundary from "./ErrorBoundary";
import {
  createSmallCanvas,
  drawCanvas,
  createThresholdCanvas,
  createCanvasData,
  drawImageToCanvas,
  createBrightnessCanvas
} from "./helpers";
import {
  createDitheredCanvas,
  updatePixelDataWithDitherInfo,
  createQuantErrorCanvas
} from "./ditheredCanvasHelper";

const App = () => {
  return (
    <ErrorBoundary>
      <Content />
    </ErrorBoundary>
  );
};

const Content = () => {
  const [sourceCanvasData, setSourceCanvasData] = useState(null);
  const ditherCanvasRef = React.useRef(null);
  const origCanvasRef = React.useRef(null);
  const brightnessCanvasRef = React.useRef(null);
  const thresholdCanvasRef = React.useRef(null);
  const quantErrorCanvasRef = React.useRef(null);
  const blockSize = 1;

  useEffect(() => {
    if (!sourceCanvasData) {
      const image = new Image();
      image.crossOrigin = "Anonymous";
      image.onload = () => {
        drawCanvas(origCanvasRef.current, image);
        const tempCanvas = drawImageToCanvas(image);

        // nned to get brightness data first
        const _sourceCanvasData = createCanvasData(tempCanvas);

        // then use that to add quantisation error an dither value
        updatePixelDataWithDitherInfo(
          _sourceCanvasData.pixelData,
          _sourceCanvasData.width
        );

        setSourceCanvasData(_sourceCanvasData);
      };
      image.src = "doug.png";
    } else {
      // const testGreyCanvas = createTestGreyCanvas();
      const brightnessCanvas = createBrightnessCanvas(
        sourceCanvasData,
        blockSize
      );

      const thresholdCanvas = createThresholdCanvas(
        sourceCanvasData,
        blockSize
      );

      const ditheredCanvas = createDitheredCanvas(sourceCanvasData, blockSize);

      const quantErrorCanvas = createQuantErrorCanvas(
        sourceCanvasData,
        blockSize
      );

      drawCanvas(brightnessCanvasRef.current, brightnessCanvas);
      drawCanvas(thresholdCanvasRef.current, thresholdCanvas);
      drawCanvas(quantErrorCanvasRef.current, quantErrorCanvas);
      drawCanvas(ditherCanvasRef.current, ditheredCanvas);
    }
  });

  return (
    <>
      <canvas ref={origCanvasRef} />
      <canvas ref={brightnessCanvasRef} />
      <canvas ref={thresholdCanvasRef} />
      <canvas ref={quantErrorCanvasRef} />
      <canvas ref={ditherCanvasRef} />
    </>
  );
};

export default App;
