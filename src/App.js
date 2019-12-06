import React, { useState, useEffect } from "react";
import ErrorBoundary from "./ErrorBoundary";
import styled from "styled-components";
import {
  drawCanvas,
  createThresholdCanvas,
  createCanvasData,
  drawImageToCanvas,
  createBrightnessCanvas,
  createColourCanvas,
  drawCanvasArea
} from "./helpers";
import {
  createDitheredCanvas,
  updatePixelDataWithDitherInfo
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
  //
  const ditherCanvasRef = React.useRef(null);
  const origCanvasRef = React.useRef(null);
  const brightnessCanvasRef = React.useRef(null);
  const thresholdCanvasRef = React.useRef(null);
  //
  const blockSize = 10;

  useEffect(() => {
    if (!sourceCanvasData) {
      const image = new Image();
      image.crossOrigin = "Anonymous";
      image.onload = () => {
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
      const colourCanvas = createColourCanvas(sourceCanvasData, blockSize);

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

      // drawCanvas(origCanvasRef.current, colourCanvas);
      // drawCanvas(brightnessCanvasRef.current, brightnessCanvas);
      // drawCanvas(thresholdCanvasRef.current, thresholdCanvas);
      // drawCanvas(ditherCanvasRef.current, ditheredCanvas);

      const area = { x: 1240, y: 1300, w: 600, h: 400 };

      drawCanvasArea(
        origCanvasRef.current,
        colourCanvas,
        area.x,
        area.y,
        area.w,
        area.h
      );
      drawCanvasArea(
        brightnessCanvasRef.current,
        brightnessCanvas,
        area.x,
        area.y,
        area.w,
        area.h
      );
      drawCanvasArea(
        thresholdCanvasRef.current,
        thresholdCanvas,
        area.x,
        area.y,
        area.w,
        area.h
      );
      drawCanvasArea(
        ditherCanvasRef.current,
        ditheredCanvas,
        area.x,
        area.y,
        area.w,
        area.h
      );
    }
  });

  const onCanvasClick = e => {
    e.stopPropagation(e);

    const targCanvas = e.target;
    const currentTargetRect = targCanvas.getBoundingClientRect();

    const x = e.clientX - currentTargetRect.left;
    const y = e.clientY - currentTargetRect.top;

    const blockX = x - (x % blockSize);
    const blockY = y - (y % blockSize);

    /*
    topLeft: 1240, 1380
    */

    console.log("blockX: ", blockX);
    console.log("blockY: ", blockY);

    const ctx = targCanvas.getContext("2d");
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(blockX, blockY, blockSize, blockSize);
  };

  return (
    <CanvasHolderStyled>
      <canvas ref={origCanvasRef} onClick={onCanvasClick} />
      <canvas ref={brightnessCanvasRef} onClick={onCanvasClick} />
      <canvas ref={thresholdCanvasRef} onClick={onCanvasClick} />
      <canvas ref={ditherCanvasRef} onClick={onCanvasClick} />
    </CanvasHolderStyled>
  );
};

export default App;

const CanvasHolderStyled = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
