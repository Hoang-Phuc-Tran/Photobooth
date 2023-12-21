# Photobooth Program
![Capture](https://github.com/Hoang-Phuc-Tran/Photobooth/assets/120700092/5a37ccdc-b03b-41b3-a35e-c87588bf4df5)

## Overview
This project is a "photobooth" application that allows users to edit and draw on a live video feed from their webcam and save the edited image to their local machine.

## Features

### Canvas
- The application fills the browser window.
- The video capture and all user drawing are done in a 640 x 480 rectangle in the center of the canvas.
- GUI elements for tools are drawn in areas not occupied by the video stream, without overlapping.

### Video
- The video capture is set up to get a 640 x 480 stream from the camera.
- The captured image is centered horizontally and vertically in the browser window.
- The image is updated continuously and drawn underneath any user-added shapes or stamps.

### Filters
- Filters include Invert, Posterize, Gray, and Blur, with an option to select NO filter.
- Filters are applied only to the video feed, not to the shapes or stamps.
- Users select filters through a dropdown selection list, radio buttons, or similar GUI elements.

### Stamps
- Users can select from 4 different stamp images, each no bigger than 150 x 150 pixels.
- Only one stamp is selected at a time.
- Stamps are drawn centered on the current mouse position over the video stream and added to the stream on click.
- Stamps must be drawn in front of previous stamps or shapes and behind subsequent ones.
- Stamp selection UI elements show the stamp image.
- Selecting rectangle or ellipse tools deselects any stamp.

### Rectangle and Ellipse Tools
- Users can draw rectangles and ellipses on the video area.
- Shapes are drawn based on mouse down and up positions within the video stream area.
- Users can select the border and fill color, and choose from 4 border thicknesses, including NONE.
- Shapes and stamps are drawn in the order they are created.

### Reset
- A button allows users to clear all stamps and shapes, reset filters, and display the raw video feed.

### Image Capture
- Pressing the spacebar saves the current video stream, with all filters, stamps, and shapes, to a PNG image.
- The saved image includes only the 640 x 480 area of the video stream, excluding UI elements.

## Additional Notes
- Ensure application responsiveness and browser compatibility.
