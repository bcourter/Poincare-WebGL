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

function handleMouseMove() {
    if (!isDragging) {
        return;
    }

    thisMousePos = mousePos();
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

function mousePos() {
    return new Complex([2 * window.event.clientX / doc.canvas.width - 1, 1 - 2 * window.event.clientY / doc.canvas.height]);
}
