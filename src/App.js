import React, { useState, useEffect } from "react";
import ErrorBoundary from "./ErrorBoundary";
import {
  createSmallCanvas,
  drawCanvas,
  createThresholdCanvas
} from "./helpers";
import { createDitheredCanvas } from "./ditheredCanvasHelper";

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
  const origCanvasRef = React.useRef(null);
  const thresholdCanvasRef = React.useRef(null);
  const blockSize = 1;
  const maxWidth = 397;

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

      const ditheredCanvas = createDitheredCanvas(
        smallCanvas,
        targPixelIndex,
        blockSize
      );

      const thresholdCanvas = createThresholdCanvas(smallCanvas, blockSize);

      drawCanvas(origCanvasRef.current, sourceImg);
      drawCanvas(thresholdCanvasRef.current, thresholdCanvas);
      drawCanvas(canvasRef.current, ditheredCanvas);
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
      <canvas ref={origCanvasRef} />;
      <canvas ref={thresholdCanvasRef} />;
      <canvas ref={canvasRef} />;
    </>
  );
};

export default App;
