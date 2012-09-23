function Disc(region, bitmapURL, circleLimit) {
    this.region = region;
    this.circleLimit = circleLimit;
	this.bitmapURL = bitmapURL;

    this.radiusLimit = 1E-4;

    this.initialFace = Face.create(region); //.transform(Mobius.createDiscAutomorphism(new Complex([0.001, 0.001]), 0));
    this.faces = [this.initialFace];

    this.drawCount = 1;
    this.totalDraw = 0;

    this.initFaces();
    this.initTextures();
}

Disc.prototype.initFaces = function () {
    var seedFace = this.initialFace;
    var faceQueue = [seedFace];
    var faceCenters = [seedFace.center];

    var count = 1;
    var minDist = 1;
    while (faceQueue.length > 0) {
        face = faceQueue.pop();

        for (var i = 0; i < face.edges.length; i++) {
            var edge = face.edges[i];
            if (edge.isConvex()) 
                continue;
            
            var c = edge.Circline;
            if (c.constructor != Circle) 
                continue;
            
            
            if (face.edgeCenters[i].magnitudeSquared > 0.9) 
                continue;

            if (c.radiusSquared() < this.radiusLimit) 
                continue;

            var mobius = edge.Circline.asMobius();
            var image = face.conjugate().transform(mobius);
            if (isNaN(image.center.data[0])) {
                output("NaN!");
                continue;
            }

            if (image.center.modulusSquared() > this.circleLimit) 
                continue;

            var isDone = false;

            for (var j = 0; j < faceCenters.length; j++) {
                if (Complex.equals(faceCenters[j], image.center)) {
                    isDone = true;
                    break;
                }
            }
            if (isDone) {
                continue;
            }

            this.faces.push(image);
            faceQueue.push(image);
            faceCenters.push(image.center);
            count++;
        }
    }

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
        var len = d.data.length;
        for (var i = 0; i < len; i += 4) {
            backgroundColor = [
                r += d.data[i + 0],
                g += d.data[i + 1],
                b += d.data[i + 2],
                a += d.data[i + 3]
            ];
        }

        backgroundColor = [r / len * 4 / 255, g / len * 4 / 255, b / len * 4 / 255, a / len * 4 / 255];
        backgroundColor = [0.5, 0.5, 0.5, 1];


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




Disc.prototype.draw = function (motionMobius, textureOffset, mobiusShaderProgram, circleGradientShaderProgram, isInverting) {
    if (backgroundColor !== null)
        this.drawCircleGradient(colorAlpha(backgroundColor, 1), colorAlpha(backgroundColor, 1), 0, 1, circleGradientShaderProgram);

    gl.useProgram(mobiusShaderProgram);
    gl.uniform2fv(mobiusShaderProgram.textureOffset, textureOffset.data);
    gl.uniform2fv(mobiusShaderProgram.mobiusA, motionMobius.a.data);
    gl.uniform2fv(mobiusShaderProgram.mobiusB, motionMobius.b.data);
    gl.uniform2fv(mobiusShaderProgram.mobiusC, motionMobius.c.data);
    gl.uniform2fv(mobiusShaderProgram.mobiusD, motionMobius.d.data);

    for (var i = 0; i < this.faces.length; i++) {
        this.faces[i].draw(motionMobius, textureOffset, texture, mobiusShaderProgram, isInverting);
    }

    var gradientInside = 0.04;
    var gradientMiddle = 0.01;
    if (backgroundColor !== null) {
        this.drawCircleGradient(colorAlpha(backgroundColor, 0), colorAlpha(backgroundColor, 1), 1.0 - gradientInside, 1 - gradientMiddle, circleGradientShaderProgram);
        this.drawCircleGradient(colorAlpha(backgroundColor, 1), colorAlpha(backgroundColor, 1), 1.0 - gradientMiddle, 1.0, circleGradientShaderProgram);
    }
    
    var thickness = 0.005;
    this.drawCircleGradient([1, 1, 1, 0], [1, 1, 1, 1], 1 - 3/4 * thickness, 1 - thickness / 4, circleGradientShaderProgram);
    this.drawCircleGradient([1, 1, 1, 1], [0, 0, 0, 1], 1 - thickness / 4, 1 + thickness / 4, circleGradientShaderProgram); //TBD doesn't transparency antialias?
};

function colorAlpha(color, alpha) {
    return [color[0], color[1], color[2], alpha];
}

Disc.prototype.drawCircleGradient = function (color0, color1, r0, r1, circleGradientShaderProgram) {
    gl.useProgram(circleGradientShaderProgram);
    gl.uniform4fv(circleGradientShaderProgram.color0, color0);
    gl.uniform4fv(circleGradientShaderProgram.color1, color1);
    gl.uniform1f(circleGradientShaderProgram.r0, r0);
    gl.uniform1f(circleGradientShaderProgram.r1, r1);
    gl.uniform1f(circleGradientShaderProgram.size, circleGradientShaderProgram.canvas.width);

    var squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    vertices = [
             1.0, 1.0, 0,
            -1.0, 1.0, 0,
             1.0, -1.0, 0,
            -1.0, -1.0, 0
        ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(circleGradientShaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
};
