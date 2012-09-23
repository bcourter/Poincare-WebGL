var isDragging = false;
var isDraggingAngle = false;
var thisMousePos = Complex.zero;
var initialMousePos = Complex.zero;

function handleMinimizeControlsButtonClick(event) {
	var coords = controlsPanelMinimizeCanvas.relMouseCoords(event);
	var x = coords.x;
	var y = coords.y;
	
	if (x < 0 || y < 0 || x > doc.controlsPanelMinimizeSize || y > doc.controlsPanelMinimizeSize)
		return;

	doc.areControlsMinimized = !doc.areControlsMinimized;
	doc.controlsBody.style.display = doc.areControlsMinimized ? "none" : "block";
	doc.controlsPanelMinimize.style.position = doc.areControlsMinimized ? "relative" : "absolute"
}

function handleMouseDown(event) {
    isDragging = true;
    thisMousePos = mousePos(event)
    if (thisMousePos.modulusSquared() > 0.98) {
        isDraggingAngle = true;
    }

    initialMousePos = thisMousePos;
}

function handleMouseUp(event) {
    isDragging = false;
    isDraggingAngle = false;
}

function handleMouseMove(event) {
    if (!isDragging) {
        return;
    }

    thisMousePos = mousePos(event);
}

function sample() {
    if (!isDragging) {
        return;
    }

    if (isDraggingAngle) {
        angleIncrement = thisMousePos.argument() - initialMousePos.argument();
    } else {
        if (thisMousePos.modulusSquared() > 0.98) {
            thisMousePos = Complex.createPolar(0.98, thisMousePos.argument());
        }
        motionIncrement = Complex.subtract(thisMousePos, initialMousePos);
    }

    initialMousePos = thisMousePos;
}

function mousePos(event) {
    var coords = doc.canvas.relMouseCoords(event);
//    var coords = doc.canvas.relMouseCoords(window.event);
    var x = coords.x;
	var y = coords.y;

   return new Complex([2 * x / doc.canvas.width - 1, 1 - 2 * y / doc.canvas.height]);
}
