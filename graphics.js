var gl;

var mobiusShaderProgram;
var circleGradientShaderProgram;

var disc;
var textureOffset = Complex.zero;
var motionIncrement = Complex.zero;
var motionMobius = Mobius.identity;
var angleIncrement = 0;
var isInverting = 0;
var isHorizon = 1;

var startTime = new Date().getTime();
var lastTime;
var initTime;
var lastTickTime;

var maxVertexTextureImageUnits;

function initGL(canvas) {
    try {
        var parentWidth = canvas.parentNode.clientWidth;
        var parentHeight = canvas.parentNode.clientHeight;

        canvas.width = parentWidth;
        canvas.height = parentWidth;
        canvas.style.top = (parentHeight - canvas.height) / 2;

        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
        output("Exception initializing WebGL.");
    }
    if (!gl) {
        output("Could not initialize WebGL.");
    }

}

function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            angleIncrement
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        output(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShaders() {
    var mobiusVertexShader = getShader(gl, "shader-mobius-vertex");
    var mobiusFragmentShader = getShader(gl, "shader-mobius-fragment");

    mobiusShaderProgram = gl.createProgram();
    gl.attachShader(mobiusShaderProgram, mobiusVertexShader);
    gl.attachShader(mobiusShaderProgram, mobiusFragmentShader);
    gl.linkProgram(mobiusShaderProgram);

    if (!gl.getProgramParameter(mobiusShaderProgram, gl.LINK_STATUS)) {
        output("Could not initialise shaders");
    }

    mobiusShaderProgram.vertexPositionAttribute = gl.getAttribLocation(mobiusShaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(mobiusShaderProgram.vertexPositionAttribute);

    mobiusShaderProgram.textureCoordAttribute = gl.getAttribLocation(mobiusShaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(mobiusShaderProgram.textureCoordAttribute);

    mobiusShaderProgram.samplerUniform = gl.getUniformLocation(mobiusShaderProgram, "uSampler");
    mobiusShaderProgram.textureOffset = gl.getUniformLocation(mobiusShaderProgram, "uTextureOffset");
    mobiusShaderProgram.isInverted = gl.getUniformLocation(mobiusShaderProgram, "uIsInverted");
    mobiusShaderProgram.mobiusA = gl.getUniformLocation(mobiusShaderProgram, "uMobiusA");
    mobiusShaderProgram.mobiusB = gl.getUniformLocation(mobiusShaderProgram, "uMobiusB");
    mobiusShaderProgram.mobiusC = gl.getUniformLocation(mobiusShaderProgram, "uMobiusC");
    mobiusShaderProgram.mobiusD = gl.getUniformLocation(mobiusShaderProgram, "uMobiusD");

    // For circle gradient
    var basicVertexShader = getShader(gl, "shader-basic-vertex");
    var circleGradientVertexShader = getShader(gl, "shader-circlegradient-fragment");

    circleGradientShaderProgram = gl.createProgram();
    gl.attachShader(circleGradientShaderProgram, basicVertexShader);
    gl.attachShader(circleGradientShaderProgram, circleGradientVertexShader);
    gl.linkProgram(circleGradientShaderProgram);

    if (!gl.getProgramParameter(circleGradientShaderProgram, gl.LINK_STATUS)) {
        output("Could not initialise CircleGradientShaderProgram");
    }

    circleGradientShaderProgram.vertexPositionAttribute = gl.getAttribLocation(circleGradientShaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(circleGradientShaderProgram.vertexPositionAttribute);

    circleGradientShaderProgram.color0 = gl.getUniformLocation(circleGradientShaderProgram, "uColor0");
    circleGradientShaderProgram.color1 = gl.getUniformLocation(circleGradientShaderProgram, "uColor1");
    circleGradientShaderProgram.r0 = gl.getUniformLocation(circleGradientShaderProgram, "uR0");
    circleGradientShaderProgram.r1 = gl.getUniformLocation(circleGradientShaderProgram, "uR1");
    circleGradientShaderProgram.size = gl.getUniformLocation(circleGradientShaderProgram, "uSize");

    circleGradientShaderProgram.canvas = doc.canvas;
}


function initDisc() {
    var file = userImage;
    if (file == "")
        file = doc.image.innerText;

    var p = parseInt(doc.pField.value);
    var q = parseInt(doc.qField.value);
    var circleLimit = parseFloat(doc.circleLimitField.value);
    var maxRegions = parseFloat(doc.maxRegionsField.value);

    doc.image.style.backgroundImage = "url(" + file + ")";
    //doc.image.innerText = file;
    disc = new Disc(new Region(p, q), file, circleLimit, maxRegions);
}

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    disc.draw(motionMobius, textureOffset, mobiusShaderProgram, circleGradientShaderProgram, isInverting);
}

function animate() {
    var timeNow = new Date().getTime();
    if (startTime != 0) {
        var elapsed = timeNow - startTime;
        elapsed *= 0.00001;

        sample();

        textureOffset = new Complex([Math.cos(3.0 * elapsed), Math.sin(2.0 * elapsed)]);

        var motionMobiusIncrement = Mobius.multiply(
				Mobius.createRotation(angleIncrement),
				Mobius.createDiscTranslation(Complex.zero, motionIncrement)
			);

        motionMobius = Mobius.multiply(
				motionMobiusIncrement,
				motionMobius
			);

        var flipEdge;
        var currentFace = disc.initialFace.transform(motionMobius);
        do {
            flipEdge = null;
            flipTrans = Mobius.identity;

            for (var i = 0; i < currentFace.edges.length; i++) {
                var edge = currentFace.edges[i];
                if (edge.isConvex()) {
                    flipEdge = edge;
                    break;
                }
            }

            var image;
            if (flipEdge != null) {
                flipTrans = Mobius.multiply(flipTrans, flipEdge.Circline.asMobius());
                image = currentFace.conjugate().transform(flipTrans);

                currentFace = image;
            }

        } while (flipEdge != null);

        // curentFace seems to accumulate rounoff error; create a new one from it's new position
        var toCenter = Mobius.createDiscAutomorphism(currentFace.center, 0);
        var angle = currentFace.vertices[0].transform(toCenter).argument();
        var seedFaceTrans = Mobius.multiply(
				Mobius.createDiscAutomorphism(currentFace.center, 0),
				Mobius.createRotation(angle - disc.initialFace.vertices[0].argument())
			);

        motionMobius = seedFaceTrans;
    } else {
        startTime = timeNow;
    }
    lastTime = timeNow;
}

var userImage = "";
function webGLStart() {
    var uploader = new qq.FileUploader({
        element: doc.imageUploader,
        action: '/poincareserver/uploader.cgi',
        button: doc.image,
        //    listElement: doc.image,
        debug: true,
        onComplete: function (id, fileName, responseJSON) {
            userImage = "images/" + responseJSON.file;
            initDisc();
        },
        onSubmit: function (id, fileName) {
            //	    doc.image.innerHtml = "<span id='progress'></span>" + fileName;
            doc.image.innerText = fileName;
            doc.image.style.backgroundImage = "";
        },
        onProgress: function (id, fileName, uploadedBytes, totalBytes) {
            var progress = document.getElementById("progress");
            progress.style.width = uploadedBytes / totalBytes * 100 + "%";
        }
    });

    initGL(doc.canvas);
    initShaders();

    var startTime = new Date().getTime();
    initDisc();
    initTime = new Date().getTime() - startTime;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
}

