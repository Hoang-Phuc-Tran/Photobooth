/*
** Author: Hoang Phuc Tran
** ID: 8789102
** Date: December 05, 2023
** Description:Create a "photobooth" application that lets users alter and draw
on a camera feed in real time, then store the result locally.
 */

const HEIGHT_VIDEO = 480;
const WIDTH_VIDEO = 640;
const XY_STAMP = 100;
const CENTRER_POINT = 50;
const NUMBER_TWO = 2;

let video;
let filterOption = "NONE"; // Current filter to be applied to the video
let currentStampIndex = null; // Index of the currently selected stamp for drawing
let placedStamps = []; // Array to store data about placed stamps
let selectedShapeButton = null; // Reference to the currently selected shape button
let drawingElements = []; // Array to store drawing elements (stamps and shapes)
let videoX, videoY, videoXRight, videoYBottom; // Variables to store video boundaries
// Variables for stamp images
let stamp1, stamp2, stamp3, stamp4;
// Drawing state variables
let drawing = false; // Flag to indicate if drawing is in progress
let drawCurrentShape = ""; // Current shape type being drawn
let shapes = []; // Array to store shapes
let currentShape = {}; // Object to store the current shape being drawn
let borderColor = "#000000"; // Default color for shape borders
let fillColor = "#FFFFFF"; // Default color to fill shapes
let borderThickness = 1; // Default thickness for shape borders

/**
 * preload
 * Parameters: None
 * Returns: Nothing
 * Description: Preloads stamp images from the assets folder.
 */
function preload() {
  // Load stamp images from the assets folder
  stamp1 = loadImage("assets/stamp1.jpg");
  stamp2 = loadImage("assets/stamp2.jpg");
  stamp3 = loadImage("assets/stamp3.jpg");
  stamp4 = loadImage("assets/stamp4.jpg");
}

/**
 * loadError
 * Parameters: err (Error object)
 * Returns: Nothing
 * Description: Logs an error message to the console if an image fails to load.
 */
function loadError(err) {
  console.error("Failed to load image: ", err);
}

function keyPressed() {
  if (keyCode === 32) {
    saveCanvasImage();
    return false; // Prevent default behavior
  }
}

/**
 * setup
 * Parameters: None
 * Returns: Nothing
 * Description: Sets up the initial canvas, video capture, and UI elements.
 */
function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(WIDTH_VIDEO, HEIGHT_VIDEO);
  video.hide();

  // Calculate video position
  videoX = (windowWidth - video.width) / NUMBER_TWO;
  videoY = (windowHeight - video.height) / NUMBER_TWO;
  videoXRight = videoX + video.width;
  videoYBottom = videoY + video.height;

  // Position filter, stamp, and shape buttons
  filterButtons();
  createStampButtons();
  shapeButtons();

  // Position reset button to the left of the video
  let resetBtn = createButton("Reset");
  resetBtn.position(videoX + 660, windowHeight - 80); // Adjust position as needed
  resetBtn.mousePressed(resetCanvas);
}

/**
 * draw
 * Parameters: None
 * Returns: Nothing
 * Description: Main drawing loop for the application. Handles video processing and drawing elements.
 */
function draw() {
  // Set the background color
  background(220);
  // Get the current frame from the video
  let filter = video.get();
  // Apply selected filter to the video frame
  applyFilter(filter);
  // Draw the filtered video frame onto the canvas
  image(
    filter,
    (windowWidth - video.width) / NUMBER_TWO,
    (windowHeight - video.height) / NUMBER_TWO
  );

  // Iterate over and draw each element from the drawing elements array
  for (let element of drawingElements) {
    if (element.type === "stamp") {
      // Draw a stamp
      drawStamp(element);
    } else {
      // Draw a shape
      drawShape(element);
    }
  }
  // Draw a preview of the current stamp or shape being placed
  if (currentStampIndex !== null && mouseIsInVideoArea()) {
    drawStampPreview(currentStampIndex);
  }
  if (drawing) {
    drawShape(currentShape);
  }
}

/**
 * applyFilter
 * Parameters: filter (p5.Image)
 * Returns: Nothing
 * Description: Applies the selected filter to the provided video frame.
 */
function drawStampPreview(index) {
  let selectedStamp;
  switch (index) {
    case 0:
      selectedStamp = stamp1;
      break;
    case 1:
      selectedStamp = stamp2;
      break;
    case 2:
      selectedStamp = stamp3;
      break;
    case 3:
      selectedStamp = stamp4;
      break;
  }
  image(selectedStamp, mouseX - CENTRER_POINT, mouseY - CENTRER_POINT, XY_STAMP, XY_STAMP);
}

/**
 * drawStamp
 * Parameters: filter (object)
 * Returns: Nothing
 * Description: Apply the filter to video.
 */
function applyFilter(filter) {
  switch (filterOption) {
    case "INVERT":
      filter.filter(INVERT);
      break;
    case "POSTERIZE":
      filter.filter(POSTERIZE, 3);
      break;
    case "GRAY":
      filter.filter(GRAY);
      break;
    case "BLUR":
      filter.filter(BLUR, 3);
      break;
    case "NONE":
      // No filter applied
      break;
  }
}

/**
 * drawStamp
 * Parameters: stamp (object)
 * Returns: Nothing
 * Description: Draws a stamp element onto the canvas.
 */
function drawStamp(stamp) {
  let selectedStamp;
  switch (stamp.index) {
    case 0:
      selectedStamp = stamp1;
      break;
    case 1:
      selectedStamp = stamp2;
      break;
    case 2:
      selectedStamp = stamp3;
      break;
    case 3:
      selectedStamp = stamp4;
      break;
  }
  image(selectedStamp, stamp.x, stamp.y, XY_STAMP, XY_STAMP);
}

function drawCurrentStamp() {
  let selectedStamp;
  switch (currentStampIndex) {
    case 0:
      selectedStamp = stamp1;
      break;
    case 1:
      selectedStamp = stamp2;
      break;
    case 2:
      selectedStamp = stamp3;
      break;
    case 3:
      selectedStamp = stamp4;
      break;
  }

  if (selectedStamp && mouseIsInVideoArea()) {
    image(selectedStamp, mouseX - CENTRER_POINT, mouseY - CENTRER_POINT, XY_STAMP, XY_STAMP);
  }
}

/**
 * mouseIsInVideoArea
 * Parameters: None
 * Returns: Boolean
 * Description: Checks if the mouse is within the video area.
 */
function mouseIsInVideoArea() {
  let videoX = (windowWidth - video.width) / NUMBER_TWO;
  let videoY = (windowHeight - video.height) / NUMBER_TWO;
  return (
    mouseX >= videoX &&
    mouseX <= videoX + video.width &&
    mouseY >= videoY &&
    mouseY <= videoY + video.height
  );
}

/**
 * mousePressed
 * Parameters: None
 * Returns: Nothing
 * Description: Handles mouse press events, particularly for placing stamps and starting shape drawing.
 */
function mousePressed() {
  if (mouseIsInVideoArea()) {
    if (currentStampIndex !== null) {
      placeStamp();
      // Reset the currentStampIndex after placing the stamp
      currentStampIndex = null;
      // Update the visual state of the stamp buttons
      highlightSelectedStamp(currentStampIndex);
    } else if (drawCurrentShape !== "") {
      // Start drawing a shape
      drawing = true;
      currentShape = {
        type: drawCurrentShape,
        x1: mouseX,
        y1: mouseY,
        border: borderColor,
        fill: fillColor,
        thickness: borderThickness,
      };
    }
  }
}

/**
 * placeStamp
 * Parameters: None
 * Returns: Nothing
 * Description: Places a stamp at the current mouse position within the video area.
 */
function placeStamp() {
  const stampWidth = XY_STAMP;
  const stampHeight = XY_STAMP;

  // Calculate initial position
  let stampX = mouseX - stampWidth / NUMBER_TWO;
  let stampY = mouseY - stampHeight / NUMBER_TWO;

  // Constrain the stamp position to keep it within the video stream area
  let videoX = (windowWidth - video.width) / NUMBER_TWO;
  let videoY = (windowHeight - video.height) / NUMBER_TWO;
  let videoXRight = videoX + video.width - stampWidth; // subtract stamp width to keep within bounds
  let videoYBottom = videoY + video.height - stampHeight; // subtract stamp height to keep within bounds

  stampX = constrain(stampX, videoX, videoXRight);
  stampY = constrain(stampY, videoY, videoYBottom);

  // Add the stamp to the drawing elements
  drawingElements.push({
    type: "stamp",
    index: currentStampIndex,
    x: stampX,
    y: stampY,
  });

  // Reset currentStampIndex to stop the preview and update the stamp buttons
  currentStampIndex = null;
  highlightSelectedStamp(currentStampIndex);
}

/**
 * mouseDragged
 * Parameters: None
 * Returns: Nothing
 * Description: Handles mouse drag events for drawing shapes.
 */
function mouseDragged() {
  if (drawing) {
    // Constrain x2 and y2 within the video area
    currentShape.x2 = constrain(mouseX, videoX, videoXRight);
    currentShape.y2 = constrain(mouseY, videoY, videoYBottom);
  }
}

/**
 * mouseReleased
 * Parameters: None
 * Returns: Nothing
 * Description: Finalizes the drawing of a shape when the mouse is released.
 */
function mouseReleased() {
  if (drawing) {
    // Constrain x2 and y2 within the video area
    currentShape.x2 = constrain(mouseX, videoX, videoXRight);
    currentShape.y2 = constrain(mouseY, videoY, videoYBottom);
    drawingElements.push(currentShape);
    drawing = false;
  }
}

/**
 * drawShape
 * Parameters: shape (object)
 * Returns: Nothing
 * Description: Draws a shape element (rectangle or ellipse) on the canvas.
 */
function drawShape(shape) {
  if (shape.thickness > 0) {
    stroke(shape.border);
    strokeWeight(shape.thickness);
  } else {
    noStroke();
  }
  fill(shape.fill);

  if (shape.type === "rectangle") {
    rectMode(CORNERS);
    rect(shape.x1, shape.y1, shape.x2, shape.y2);
  } else if (shape.type === "ellipse") {
    ellipseMode(CORNERS);
    ellipse(shape.x1, shape.y1, shape.x2, shape.y2);
  }
}

/**
 * filterButtons
 * Parameters: None
 * Returns: Nothing
 * Description: Creates UI buttons for selecting different video filters.
 */
function filterButtons() {
  const containerForButtons = createDiv("");
  containerForButtons.style("flex-direction", "column");
  containerForButtons.style("align-items", "center");
  containerForButtons.style("position", "absolute");
  containerForButtons.style("top", `${(windowHeight - video.height) / NUMBER_TWO}px`);
  containerForButtons.style("left", `${(windowWidth + video.width) / NUMBER_TWO + 20}px`);

  const label = createElement("h2", "Select Filter");
  label.parent(containerForButtons);

  const filters = ["NONE", "INVERT", "POSTERIZE", "GRAY", "BLUR"];
  filters.forEach((filter) => {
    let btn = createButton(filter);
    btn.parent(containerForButtons);
    btn.mousePressed(() => (filterOption = filter));
  });
}

/**
 * createStampButtons
 * Parameters: None
 * Returns: Nothing
 * Description: Creates buttons for selecting different stamps.
 */
function createStampButtons() {
  const topOffset = `${(windowHeight - video.height) / NUMBER_TWO + 120}px`; // The top position for the filter section

  const stampContainer = createDiv("");
  stampContainer.style("display", "grid");
  stampContainer.style("grid-template-columns", "repeat(2, 100px)"); // Two columns
  stampContainer.style("grid-gap", "10px"); // Gap between stamps
  stampContainer.style("justify-content", "center");
  stampContainer.style("position", "absolute");
  stampContainer.style("top", topOffset); // Align with the filter section
  stampContainer.style("left", `${(windowWidth + video.width) / NUMBER_TWO + 20}px`); // Position to the right of the video

  // Create image elements for each stamp
  createStampButton(stamp1, 0, stampContainer);
  createStampButton(stamp2, 1, stampContainer);
  createStampButton(stamp3, 2, stampContainer);
  createStampButton(stamp4, 3, stampContainer);
}

function createStampButton(stamp, index, container) {
  if (stamp) {
    let imgElem = createImg(stamp.canvas.toDataURL(), `Stamp ${index + 1}`);
    imgElem.size(XY_STAMP, XY_STAMP);
    imgElem.style("cursor", "pointer");
    imgElem.mousePressed(() => {
      // Toggle stamp selection
      if (currentStampIndex === index) {
        currentStampIndex = null;
        isStampSelected = false;
      } else {
        currentStampIndex = index;
        isStampSelected = true;
        // Deactivate the blue border of the selected shape button
        if (selectedShapeButton) {
          selectedShapeButton.style("border", "none");
        }
        drawCurrentShape = ""; // Reset the shape drawing state
      }
      highlightSelectedStamp(currentStampIndex);
    });
    imgElem.parent(container);
    imgElem.class("stamp-button");
  }
}

function highlightSelectedStamp(selectedIndex) {
  selectAll(".stamp-button").forEach((imgElem, index) => {
    imgElem.style("border", index === selectedIndex ? "2px solid blue" : "none");
  });
}

/**
 * shapeButtons
 * Parameters: None
 * Returns: Nothing
 * Description: Creates UI elements for drawing shapes, including buttons, color pickers, and sliders.
 */
function shapeButtons() {
  // Create a container for shape tools
  const shapeTools = createDiv("");
  shapeTools.style("position", "absolute");
  shapeTools.style("top", `${videoY + 330}px`);
  shapeTools.style("left", `${videoX + 660}px`); // Adjusted to left of the video
  shapeTools.style("padding", "5px");
  shapeTools.style("border", "1px solid #ccc");
  shapeTools.style("background-color", "#f8f8f8");

  let rectBtn = createButton("Rectangle");
  rectBtn.parent(shapeTools);
  rectBtn.mousePressed(() => {
    toggleShapeTool(rectBtn, "rectangle");
  });

  rectBtn.style("margin-top", "7px");
  rectBtn.style("margin-bottom", "3px");

  let ellipseBtn = createButton("Ellipse");
  ellipseBtn.parent(shapeTools);
  ellipseBtn.mousePressed(() => {
    toggleShapeTool(ellipseBtn, "ellipse");
  });

  // Label for Rectangle button
  const borderLabel = createElement("p", "Border Color");
  borderLabel.parent(shapeTools);
  borderLabel.style("margin", "1px");

  // Color picker for border color
  let borderColorPicker = createColorPicker("#000000");
  borderColorPicker.parent(shapeTools);
  borderColorPicker.input(() => {
    borderColor = borderColorPicker.value();
  });

  // Label for Rectangle button
  const fillLabel = createElement("p", "Fill Color");
  fillLabel.parent(shapeTools);
  fillLabel.style("margin", "1px");
  // Color picker for fill color
  let fillColorPicker = createColorPicker("#ffffff");
  fillColorPicker.parent(shapeTools);
  fillColorPicker.input(() => {
    fillColor = fillColorPicker.value();
  });

  // Label for Rectangle button
  const thicknessLabel = createElement("p", "Border Thickness");
  thicknessLabel.parent(shapeTools);
  thicknessLabel.style("margin", "1px");
  // Dropdown for border thickness
  let thicknessSelect = createSelect();
  thicknessSelect.parent(shapeTools);
  thicknessSelect.option("None", 0);
  thicknessSelect.option("Thin", 1);
  thicknessSelect.option("Medium", 2);
  thicknessSelect.option("Thick", 4);
  thicknessSelect.changed(() => {
    borderThickness = thicknessSelect.value();
  });

  function toggleShapeTool(button, shape) {
    if (drawCurrentShape === shape) {
      drawCurrentShape = "";
      button.style("border", "none");
      selectedShapeButton = null; // Reset selected shape button
    } else {
      drawCurrentShape = shape;
      if (selectedShapeButton) {
        selectedShapeButton.style("border", "none"); // Remove border from previously selected
      }
      button.style("border", "2px solid blue");
      selectedShapeButton = button; // Set the new selected shape button
      // Deactivate the blue border of the stamps
      currentStampIndex = null;
      highlightSelectedStamp(currentStampIndex);
      isStampSelected = false; // Reset stamp selection state
    }
  }
}

/**
 * resetCanvas
 * Parameters: None
 * Returns: Nothing
 * Description: Resets the drawing elements and selected options to their default states.
 */
function resetCanvas() {
  drawingElements = []; // Clear all drawn elements
  filterOption = "NONE"; // Reset filter
  currentStampIndex = null; // Deselect any stamp
  drawCurrentShape = ""; // Deselect any shape
  selectedShapeButton = null; // Deselect any shape button
}

/**
 * saveCanvasImage
 * Parameters: None
 * Returns: Nothing
 * Description: Saves the current contents of the canvas, including the video and all drawing elements, as an image.
 */
function saveCanvasImage() {
  // Temporarily draw everything onto the main canvas
  let filter = video.get();
  applyFilter(filter);
  image(filter, videoX, videoY, WIDTH_VIDEO, HEIGHT_VIDEO);

  drawingElements.forEach((element) => {
    if (element.type === "stamp") {
      drawStamp(element);
    } else {
      drawShape(element);
    }
  });

  // Now save the specific area of the canvas
  let savedImage = get(videoX, videoY, WIDTH_VIDEO, HEIGHT_VIDEO);
  savedImage.save("captured_image", "png");

  // Redraw the canvas to show the live video stream again
  draw();
}

/**
 * drawStampOnBuffer
 * Parameters: buf (p5.Graphics), stamp (object)
 * Returns: Nothing
 * Description: Draws a stamp element onto a graphics buffer.
 */
function drawStampOnBuffer(buf, stamp) {
  let selectedStamp;
  switch (stamp.index) {
    case 0:
      selectedStamp = stamp1;
      break;
    case 1:
      selectedStamp = stamp2;
      break;
    case 2:
      selectedStamp = stamp3;
      break;
    case 3:
      selectedStamp = stamp4;
      break;
  }
  // Adjust stamp position relative to buffer
  let adjustedX = stamp.x - videoX;
  let adjustedY = stamp.y - videoY;
  buf.image(selectedStamp, adjustedX, adjustedY, XY_STAMP, XY_STAMP);
}

/**
 * drawShapeOnBuffer
 * Parameters: buf (p5.Graphics), shape (object)
 * Returns: Nothing
 * Description: Draws a shape element onto a graphics buffer.
 */
function drawShapeOnBuffer(buf, shape) {
  // Adjust coordinates based on the video's position
  let adjustedX1 = shape.x1 - videoX;
  let adjustedY1 = shape.y1 - videoY;
  let adjustedX2 = shape.x2 - videoX;
  let adjustedY2 = shape.y2 - videoY;

  if (shape.thickness > 0) {
    buf.stroke(shape.border);
    buf.strokeWeight(shape.thickness);
  } else {
    buf.noStroke();
  }
  buf.fill(shape.fill);

  if (shape.type === "rectangle") {
    buf.rectMode(CORNERS);
    buf.rect(adjustedX1, adjustedY1, adjustedX2, adjustedY2);
  } else if (shape.type === "ellipse") {
    buf.ellipseMode(CORNERS);
    buf.ellipse(adjustedX1, adjustedY1, adjustedX2, adjustedY2);
  }
}
