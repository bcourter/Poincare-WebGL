function Disc(region, bitmapURL, circleLimit, maxRegions) {
    this.region = region;
    this.circleLimit = circleLimit;
    this.maxRegions = maxRegions;
    this.bitmapURL = bitmapURL;

    this.circleMaxModulus;
    this.radiusLimit = 1E-4;

    this.initialFace = Face.create(region); //.transform(Mobius.createDiscAutomorphism(new Complex([0.001, 0.001]), 0));
    this.faces = [this.initialFace];

    this.drawCount = 1;
    this.totalDraw = 0;

    this.initTextures();
    this.initShaders();
    this.initFaces();
}

Disc.prototype.initShaders = function () {
// Disc
    var mobiusVertexShader = getShader(gl, "shader-mobius-vertex");
    var mobiusFragmentShader = getShader(gl, "shader-mobius-fragment");

    this.mobiusShaderProgram = gl.createProgram();
    gl.attachShader(this.mobiusShaderProgram, mobiusVertexShader);
    gl.attachShader(this.mobiusShaderProgram, mobiusFragmentShader);
    gl.linkProgram(this.mobiusShaderProgram);

    if (!gl.getProgramParameter(this.mobiusShaderProgram, gl.LINK_STATUS)) {
        output("Could not initialise shaders");
    }

    this.mobiusShaderProgram.vertexPositionAttribute = gl.getAttribLocation(this.mobiusShaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(this.mobiusShaderProgram.vertexPositionAttribute);

    this.mobiusShaderProgram.textureCoordAttribute = gl.getAttribLocation(this.mobiusShaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(this.mobiusShaderProgram.textureCoordAttribute);

    this.mobiusShaderProgram.mobiusA = gl.getUniformLocation(this.mobiusShaderProgram, "uMobiusA");
    this.mobiusShaderProgram.mobiusB = gl.getUniformLocation(this.mobiusShaderProgram, "uMobiusB");
    this.mobiusShaderProgram.mobiusC = gl.getUniformLocation(this.mobiusShaderProgram, "uMobiusC");
    this.mobiusShaderProgram.mobiusD = gl.getUniformLocation(this.mobiusShaderProgram, "uMobiusD");
    this.mobiusShaderProgram.interp = gl.getUniformLocation(this.mobiusShaderProgram, "uInterp");

    this.mobiusShaderProgram.samplerUniform = gl.getUniformLocation(this.mobiusShaderProgram, "uSampler");
    this.mobiusShaderProgram.textureOffset = gl.getUniformLocation(this.mobiusShaderProgram, "uTextureOffset");
    this.mobiusShaderProgram.isInverted = gl.getUniformLocation(this.mobiusShaderProgram, "uIsInverted");

// Gradient bands and background circle
    var mobiusVertexShader = getShader(gl, "shader-mobius-vertex");
    var basicFragmentShader = getShader(gl, "shader-basic-fragment");

    this.circleGradientShaderProgram = gl.createProgram();
    gl.attachShader(this.circleGradientShaderProgram, mobiusVertexShader);
    gl.attachShader(this.circleGradientShaderProgram, basicFragmentShader);
    gl.linkProgram(this.circleGradientShaderProgram);

    if (!gl.getProgramParameter(this.circleGradientShaderProgram, gl.LINK_STATUS)) {
        output("Could not initialise shaders");
    }

    this.circleGradientShaderProgram.vertexPositionAttribute = gl.getAttribLocation(this.circleGradientShaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(this.circleGradientShaderProgram.vertexPositionAttribute);
    
    this.circleGradientShaderProgram.mobiusA = gl.getUniformLocation(this.circleGradientShaderProgram, "uMobiusA");
    this.circleGradientShaderProgram.mobiusB = gl.getUniformLocation(this.circleGradientShaderProgram, "uMobiusB");
    this.circleGradientShaderProgram.mobiusC = gl.getUniformLocation(this.circleGradientShaderProgram, "uMobiusC");
    this.circleGradientShaderProgram.mobiusD = gl.getUniformLocation(this.circleGradientShaderProgram, "uMobiusD");
    this.circleGradientShaderProgram.interp = gl.getUniformLocation(this.circleGradientShaderProgram, "uInterp");

    this.circleGradientShaderProgram.canvas = doc.canvas;
}

Disc.prototype.initFaces = function () {
    var seedFace = this.initialFace;
    var faceQueue = [seedFace];
    var faceCenters = new ComplexCollection();

    var count = 1;
    var minDist = 1;
    var maxFaces = this.maxRegions / this.region.p / 2;
    while (faceQueue.length > 0 && count < maxFaces) {
        face = faceQueue.pop();

        for (var i = 0; i < face.edges.length; i++) {
            var edge = face.edges[i];
            if (edge.isConvex())
                continue;

            var c = edge.Circline;
            if (c.constructor != Circle)
                continue;

            //       if (face.edgeCenters[i].magnitudeSquared > 0.9) 
            //          continue;

            if (c.radiusSquared() < this.radiusLimit)
                continue;

            var mobius = edge.Circline.asMobius();
            var image = face.conjugate().transform(mobius);
            //          if (isNaN(image.center.data[0])) {
            //              output("NaN!");
            //             continue;
            //         }

            if (image.center.modulusSquared() > this.circleLimit)
                continue;

            if (faceCenters.contains(image.center))
                continue;

            this.faces.push(image);
            faceQueue.unshift(image);
            faceCenters.add(image.center);
            count++;
        }
    }

    this.circleMaxModulus = faceCenters.max;
};

var backgroundColor = null;
// http: //badassjs.com/post/11867989702/badass-js-is-back-with-a-new-look-heres-a-little

var texture;  // TBD figure out how to tidy this up.
Disc.prototype.initTextures = function () {
    var jpeg = new JpegImage();
    var maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    var maxVertexTextureImageUnits = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);

    if (texture != null)
        gl.deleteTexture(texture);

    texture = gl.createTexture();
    //		texture.image = new Image(); // tmp

    //   texture.image.onload = function () {
    jpeg.onload = function () {
        var canvas = document.createElement("canvas");
        var size = Math.min(jpeg.width, jpeg.height);
        size = Math.pow(2, Math.floor(Math.log(size) / Math.log(2)));
        size = Math.min(size, maxTextureSize);

        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext("2d");
        var d = ctx.getImageData((jpeg.width - size) / 2, (jpeg.height - size) / 2, jpeg.width, jpeg.height);
        jpeg.copyToImageData(d);
        ctx.putImageData(d, 0, 0);

        var r = 0;
        var g = 0;
        var b = 0;
        var a = 0;
        var skip = 16;
        var len = d.data.length;
        for (var i = 0; i < len; i += 4 * skip) {
            backgroundColor = [
                r += d.data[i + 0],
                g += d.data[i + 1],
                b += d.data[i + 2],
                a += d.data[i + 3]
            ];
        }

        var scale = skip / len * 4 / 255;
        backgroundColor = [r * scale, g * scale, b * scale, a * scale];
	//var contrastColor = backgroundColor[0] + backgroundColor[1] + backgroundColor[2] > 2 ? "black" : "white";
	//doc.image.style.color = contrastColor;

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas); // This is the important line!
        //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.bindTexture(gl.TEXTURE_2D, null);

    };

    jpeg.load(this.bitmapURL);

    //  texture.image.src = this.bitmapURL;
};




Disc.prototype.draw = function (motionMobius, textureOffset, isInverting, isConformalMapping) {
    if (backgroundColor !== null && isHorizon > 0)
       this.drawCircleGradient(colorAlpha(backgroundColor, isHorizon), colorAlpha(backgroundColor, isHorizon), 0, 1, this.circleGradientShaderProgram);

    gl.useProgram(this.mobiusShaderProgram);
    gl.uniform2fv(this.mobiusShaderProgram.textureOffset, textureOffset.data);
    gl.uniform2fv(this.mobiusShaderProgram.mobiusA, motionMobius.a.data);
    gl.uniform2fv(this.mobiusShaderProgram.mobiusB, motionMobius.b.data);
    gl.uniform2fv(this.mobiusShaderProgram.mobiusC, motionMobius.c.data);
    gl.uniform2fv(this.mobiusShaderProgram.mobiusD, motionMobius.d.data);

    gl.uniform1f(this.mobiusShaderProgram.interp, isConformalMapping);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    for (var i = 0; i < this.faces.length; i++) {
        this.faces[i].draw(motionMobius, textureOffset, texture, this.mobiusShaderProgram, isInverting);
    }

    if (isHorizon > 0) {
        var width = 1 - this.circleMaxModulus;
        var gradientInside = 10 * width;
        var gradientMiddle = 3 * width;
        //    var gradientInside = 0.04;
        // var gradientMiddle = 0.01;
        if (backgroundColor !== null) {
            this.drawCircleGradient(colorAlpha(backgroundColor, 0 * isHorizon), colorAlpha(backgroundColor, 1 * isHorizon), 1.0 - gradientInside, 1 - gradientMiddle, this.circleGradientShaderProgram);
            this.drawCircleGradient(colorAlpha(backgroundColor, 1 * isHorizon), colorAlpha(backgroundColor, 1 * isHorizon), 1.0 - gradientMiddle, 1.0, this.circleGradientShaderProgram);
        }

        var thickness = 0.005;
        this.drawCircleGradient([1, 1, 1, 0 * isHorizon], [1, 1, 1, 1 * isHorizon], 1 - 3 / 4 * thickness, 1 - thickness / 4, this.circleGradientShaderProgram);
        this.drawCircleGradient([1, 1, 1, 1 * isHorizon], [0, 0, 0, 1 /*      */ ], 1 - thickness / 4, 1 + thickness / 4, this.circleGradientShaderProgram); //TBD doesn't transparency antialias?
    }
};

function colorAlpha(color, alpha) {
    return [color[0], color[1], color[2], alpha];
}

Disc.prototype.drawCircleGradient = function (color0, color1, r0, r1) {
    gl.useProgram(this.circleGradientShaderProgram);

    gl.uniform2fv(this.circleGradientShaderProgram.mobiusA, Mobius.identity.a.data);
    gl.uniform2fv(this.circleGradientShaderProgram.mobiusB, Mobius.identity.b.data);
    gl.uniform2fv(this.circleGradientShaderProgram.mobiusC, Mobius.identity.c.data);
    gl.uniform2fv(this.circleGradientShaderProgram.mobiusD, Mobius.identity.d.data);
    gl.uniform1f(this.mobiusShaderProgram.interp, isConformalMapping);

    var count = 180;

    var vertices = [];
    var colors = [];
    for (var i = 0; i <= p; i++) {
    	var t = tau / count * i;
    	vertices[i].push([r0 * Math.cos(t), r0 * Math.sin(t)]);
    	vertices[i].push([r1 * Math.cos(t), r1 * Math.sin(t)]);
    	
     	colors[i].push(color0);
    	colors[i].push(color1);
    }

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    vertexBuffer.itemSize = 2;
    vertexBuffer.numItems = vertices.length;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(this.circleGradientShaderProgram.vertexPositionAttribute, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	var colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
	colorBuffer.itemSize = 4;
	colorBuffer.numItems = textureCoords.length;
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(this.circleGradientShaderProgram.colorAttribute, colorBuffer.itemSize, gl.UNSIGNED_BYTE, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexBuffer.numItems);
};

