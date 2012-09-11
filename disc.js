function Region(p, q) {
	this.p = p;
	this.q = q;
	var sinP2 = Math.pow(Math.sin(Math.PI / p), 2);
	var cosQ2 = Math.pow(Math.cos(Math.PI / q), 2);
	this.r = Math.sqrt(sinP2 / (cosQ2 - sinP2));
	this.d = Math.sqrt(cosQ2 / (cosQ2 - sinP2));
	this.phi = Math.PI * (0.5 - (1.0 / p + 1.0 / q));

	this.l1 = Line.createTwoPoint(Complex.zero, Complex.one);
	this.l2 = Line.createPointAngle(Complex.zero, Math.PI / p);
	this.c = Circle.prototype.create(new Complex([this.d, 0]), this.r);
	var center = this.c.center();

	var polar = Complex.createPolar(this.r, Math.PI - this.phi)
	this.p0 = Complex.zero;
	this.p1 = Complex.add(new Complex([this.d, 0]), polar);
	this.p2 = new Complex([this.d - this.r, 0]);

	/*         08
	 *       09  07
	 *     10  14  06
	 *   11  12  13  05
	 * 00  01  02  03  04
	 * */
	this.points = [15];
	var count = 4;
	for (var i = 0;  i < count; i++) {
		var t = i / count;

		this.points[i] = this.p2.scale(t);
		this.points[i + count] = Complex.add(new Complex([this.d, 0]), Complex.createPolar(this.r, Math.PI - this.phi * t));
		this.points[i + 2 * count] = this.p1.scale(1 - t);
	}

	this.points[12] = Complex.add(this.p0, Complex.add(this.p1, this.p2).scale(1 / 2)).scale(1 / 2);
	this.points[13] = Complex.add(this.p2, Complex.add(this.p0, this.p1).scale(1 / 2)).scale(1 / 2);
	this.points[14] = Complex.add(this.p1, Complex.add(this.p2, this.p0).scale(1 / 2)).scale(1 / 2);
}


function Face(region, center, vertices, edgeCenters, halfEdges, spines, dualEdges, interiors, isFlipped) {
	this.region = region;
	this.center = center;
	this.vertices = vertices;
	this.edgeCenters = edgeCenters;
	this.halfEdges = halfEdges;
	this.spines = spines;
	this.dualEdges = dualEdges;
	this.interiors = interiors;
	this.isFlipped = isFlipped;

	var p = region.p;

	var increment = Mobius.createRotation(2 * Math.PI / p);
	var midvertex = region.p1;
	var e = new edge(this, region.c, midvertex, midvertex.transform(increment.inverse()));
	
	this.edges = [p];
	var rotation = Mobius.identity;
	for (var i = 0;  i < p; i++) {
		this.edges[i] = e.transform(rotation);
		rotation = Mobius.multiply(rotation, increment);
	}
	
	this.initBuffers();
}

Face.prototype.initBuffers = function () {
    var p = this.region.p;

    var vertices = [];
    var textureCoords = [];
    for (var i = 0; i < p; i++) {
        vertices = vertices.concat(
			this.dualEdges[i][0].data[0], this.dualEdges[i][0].data[1],
			this.dualEdges[i][1].data[0], this.dualEdges[i][1].data[1],
			this.dualEdges[i][2].data[0], this.dualEdges[i][2].data[1],
			this.edgeCenters[i].data[0], this.edgeCenters[i].data[1],
			this.halfEdges[i][0].data[0], this.halfEdges[i][0].data[1],
			this.halfEdges[i][1].data[0], this.halfEdges[i][1].data[1],
			this.halfEdges[i][2].data[0], this.halfEdges[i][2].data[1],
			this.halfEdges[i + p][0].data[0], this.halfEdges[i + p][0].data[1],
			this.halfEdges[i + p][1].data[0], this.halfEdges[i + p][1].data[1],
			this.halfEdges[i + p][2].data[0], this.halfEdges[i + p][2].data[1],
			this.vertices[i].data[0], this.vertices[i].data[1],
			this.spines[i][0].data[0], this.spines[i][0].data[1],
			this.spines[i][1].data[0], this.spines[i][1].data[1],
			this.spines[i][2].data[0], this.spines[i][2].data[1],
			this.interiors[i][0].data[0], this.interiors[i][0].data[1],
			this.interiors[i][1].data[0], this.interiors[i][1].data[1],
			this.interiors[i][2].data[0], this.interiors[i][2].data[1],
			this.interiors[i + p][0].data[0], this.interiors[i + p][0].data[1],
			this.interiors[i + p][1].data[0], this.interiors[i + p][1].data[1],
			this.interiors[i + p][2].data[0], this.interiors[i + p][2].data[1]
		);

        textureCoords = textureCoords.concat(
			this.dualEdges[0][0].data[0], this.dualEdges[0][0].data[1],
			this.dualEdges[0][1].data[0], this.dualEdges[0][1].data[1],
			this.dualEdges[0][2].data[0], this.dualEdges[0][2].data[1],
			this.edgeCenters[0].data[0], this.edgeCenters[0].data[1],
			this.halfEdges[0][0].data[0], this.halfEdges[0][0].data[1],
			this.halfEdges[0][1].data[0], this.halfEdges[0][1].data[1],
			this.halfEdges[0][2].data[0], this.halfEdges[0][2].data[1],
			this.halfEdges[0][0].data[0], this.halfEdges[0][0].data[1],
			this.halfEdges[0][1].data[0], this.halfEdges[0][1].data[1],
			this.halfEdges[0][2].data[0], this.halfEdges[0][2].data[1],
			this.vertices[0].data[0], this.vertices[0].data[1],
			this.spines[0][0].data[0], this.spines[0][0].data[1],
			this.spines[0][1].data[0], this.spines[0][1].data[1],
			this.spines[0][2].data[0], this.spines[0][2].data[1],
			this.interiors[0][0].data[0], this.interiors[0][0].data[1],
			this.interiors[0][1].data[0], this.interiors[0][1].data[1],
			this.interiors[0][2].data[0], this.interiors[0][2].data[1],
			this.interiors[0][0].data[0], this.interiors[0][0].data[1],
			this.interiors[0][1].data[0], this.interiors[0][1].data[1],
			this.interiors[0][2].data[0], this.interiors[0][2].data[1]
		);
    }

    vertices = vertices.concat(this.center.data[0], this.center.data[1]);
    textureCoords = textureCoords.concat(this.center.data[0], this.center.data[1]);

    var centerI = vertices.length / 2 - 1;
    var dualEdgesI = [0, 1, 2];
    var edgeCentersI = 3
    var halfEdgesI = [4, 5, 6, 7, 8, 9]
    var verticesI = 10;
    var spinesI = [11, 12, 13];
    var interiorsI = [14, 15, 16, 17, 18, 19];

    var size = 20;
    var cubeVertexIndices = [];

    for (n = 0; n < p; n++) {
        cubeVertexIndices.push([
	        centerI,
	        n * size + spinesI[2],
	        n * size + dualEdgesI[0],
	        n * size + interiorsI[0],
	        n * size + dualEdgesI[1],
	        n * size + interiorsI[1],
	        n * size + dualEdgesI[2],
	        n * size + halfEdgesI[0],
	        n * size + edgeCentersI
	    ]);

        cubeVertexIndices.push([
	        n * size + spinesI[2],
	        n * size + spinesI[1],
	        n * size + interiorsI[0],
	        n * size + interiorsI[2],
	        n * size + interiorsI[1],
	        n * size + halfEdgesI[1],
	        n * size + halfEdgesI[0]
	    ]);

        cubeVertexIndices.push([
	        n * size + spinesI[1],
	        n * size + spinesI[0],
	        n * size + interiorsI[2],
	        n * size + halfEdgesI[2],
	        n * size + halfEdgesI[1]
	    ]);

        cubeVertexIndices.push([
	        n * size + spinesI[0],
	        n * size + verticesI,
	        n * size + halfEdgesI[2]
	    ]);

        var nn = (n + p - 1) % p;

        cubeVertexIndices.push([
	        centerI,
	        nn * size + spinesI[2],
	        n * size + dualEdgesI[0],
	        n * size + interiorsI[3],
	        n * size + dualEdgesI[1],
	        n * size + interiorsI[4],
	        n * size + dualEdgesI[2],
	        n * size + halfEdgesI[3],
	        n * size + edgeCentersI
	    ]);

        cubeVertexIndices.push([
	        nn * size + spinesI[2],
	        nn * size + spinesI[1],
	        n * size + interiorsI[3],
	        n * size + interiorsI[5],
	        n * size + interiorsI[4],
	        n * size + halfEdgesI[4],
	        n * size + halfEdgesI[3]
	    ]);

        cubeVertexIndices.push([
	        nn * size + spinesI[1],
	        nn * size + spinesI[0],
	        n * size + interiorsI[5],
	        n * size + halfEdgesI[5],
	        n * size + halfEdgesI[4]
	    ]);

        cubeVertexIndices.push([
	        nn * size + spinesI[0],
	        nn * size + verticesI,
	        n * size + halfEdgesI[5]
	    ]);
    }

    this.cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexPositionBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.cubeVertexPositionBuffer.itemSize = 2;
    this.cubeVertexPositionBuffer.numItems = vertices.length; shaderProgram.MobiusA

    this.cubeVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexTextureCoordBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    this.cubeVertexTextureCoordBuffer.itemSize = 2;
    this.cubeVertexTextureCoordBuffer.numItems = textureCoords.length;

    this.indexBuffers = [];
    for (i = 0; i < cubeVertexIndices.length; i++) {
        this.indexBuffers[i] = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffers[i]);

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices[i]), gl.STATIC_DRAW);
        this.indexBuffers[i].itemSize = 1;
        this.indexBuffers[i].numItems = cubeVertexIndices[i].length;
    }
};

Face.create = function(region) {
	var region = region;
	var center = Complex.zero;
	var p = region.p;
	var isFlipped = false;

	var increment = Mobius.createRotation(2 * Math.PI / p);
	var midvertex = region.p1;

	var mesh = region.points;
	var meshConjugate = Complex.conjugateArray(mesh)
	var meshCount = 3;
	var vertices = [p];
	var edgeCenters = [p];
	var halfEdgePoints = [2 * p];
	var spinePoints = [p];
	var dualEdgePoints = [p];
	var interiorPoints = [2 * p];

	var rotation = Mobius.identity;
	for (var i = 0;  i < p; i++) {
		dualEdgePoints[i] = [meshCount];
		dualEdgePoints[i][0] = mesh[1].transform(rotation);
		dualEdgePoints[i][1] = mesh[2].transform(rotation);
		dualEdgePoints[i][2] = mesh[3].transform(rotation);

		edgeCenters[i] = mesh[4].transform(rotation);

		halfEdgePoints[i] = [meshCount];
		halfEdgePoints[i][0] = mesh[5].transform(rotation);
		halfEdgePoints[i][1] = mesh[6].transform(rotation);
		halfEdgePoints[i][2] = mesh[7].transform(rotation);

		halfEdgePoints[i + p] = [meshCount];
		halfEdgePoints[i + p][0] = mesh[5].conjugate().transform(rotation);
		halfEdgePoints[i + p][1] = mesh[6].conjugate().transform(rotation);
		halfEdgePoints[i + p][2] = mesh[7].conjugate().transform(rotation);

		vertices[i] = mesh[8].transform(rotation);

		spinePoints[i] = [meshCount];
		spinePoints[i][0] = mesh[9].transform(rotation);
		spinePoints[i][1] = mesh[10].transform(rotation);
		spinePoints[i][2] = mesh[11].transform(rotation);

		interiorPoints[i] = [meshCount];
		interiorPoints[i][0] = mesh[12].transform(rotation);
		interiorPoints[i][1] = mesh[13].transform(rotation);
		interiorPoints[i][2] = mesh[14].transform(rotation);

		interiorPoints[i + p] = [meshCount];
		interiorPoints[i + p][0] = mesh[12].conjugate().transform(rotation);
		interiorPoints[i + p][1] = mesh[13].conjugate().transform(rotation);
		interiorPoints[i + p][2] = mesh[14].conjugate().transform(rotation);

		rotation = Mobius.multiply(rotation, increment);
	}

	return new Face(region, center, vertices, edgeCenters, halfEdgePoints, spinePoints, dualEdgePoints, interiorPoints, isFlipped);
};


Face.createFromExisting = function(previous, edges, center, vertices, edgeCenters, halfEdges, spines, dualEdges, interiors, isFlipped) {
	var f = new Face(previous.region, center, vertices, edgeCenters, halfEdges, spines, dualEdges, interiors, isFlipped);
	f.edges = edges;
	f.cubeVertexTextureCoordBuffer = previous.cubeVertexTextureCoordBuffer;
	return f;
}

Face.prototype.transform = function(m) { 
	var p = this.region.p;
	var edges = [p];

	var center = this.center.transform(m);
	var vertices = Complex.transformArray(this.vertices, m);
	var edgeCenters = Complex.transformArray(this.edgeCenters, m);

	var halfEdges = [2 * p];
	var spines = [p];
	var dualEdges = [p];
	var interiors = [2 * p];

	for (var i = 0; i < p; i++) {
		edges[i] = this.edges[i].transform(m);

		halfEdges[i] = Complex.transformArray(this.halfEdges[i], m);
		halfEdges[i + p] = Complex.transformArray(this.halfEdges[i + p], m);
		spines[i] = Complex.transformArray(this.spines[i], m);
		dualEdges[i] = Complex.transformArray(this.dualEdges[i], m);
		interiors[i] = Complex.transformArray(this.interiors[i], m);
		interiors[i + p] = Complex.transformArray(this.interiors[i + p], m);
	}

	return Face.createFromExisting(this, edges, center, vertices, edgeCenters, halfEdges, spines, dualEdges, interiors, this.isFlipped);
}

Face.prototype.conjugate = function() { 
	var p = this.region.p;
	var edges = [p]; 

	var center = this.center.conjugate();
	var vertices = Complex.conjugateArray(this.vertices);
	var edgeCenters = Complex.conjugateArray(this.edgeCenters);

	var halfEdges = [2 * p];
	var spines = [p];
	var dualEdges = [p];
	var interiors = [2 * p];

	for (var i = 0; i < p; i++) {
		edges[i] = this.edges[i].conjugate();

		halfEdges[i] = Complex.conjugateArray(this.halfEdges[i]);
		halfEdges[i + p] = Complex.conjugateArray(this.halfEdges[i + p]);
		spines[i] = Complex.conjugateArray(this.spines[i]);
		dualEdges[i] = Complex.conjugateArray(this.dualEdges[i]);
		interiors[i] = Complex.conjugateArray(this.interiors[i]);
		interiors[i + p] = Complex.conjugateArray(this.interiors[i + p]);
	}

	return Face.createFromExisting(this, edges, center, vertices, edgeCenters, halfEdges, spines, dualEdges, interiors, this.isFlipped);
};

Face.prototype.draw = function(motionMobius, textureOffset, texture, shaderProgram){
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);
   
	for(i = 0; i < this.indexBuffers.length; i++) {
       	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffers[i]);
  		gl.drawElements(gl.TRIANGLE_STRIP, this.indexBuffers[i].numItems, gl.UNSIGNED_SHORT, 0);
   	}
}


function edge(Face, Circline, start, end) {
	this.Face = Face;
	this.Circline = Circline;
	this.start = start;
	this.end = end;
};

edge.prototype.transform = function(m) {
	return new edge(this.Face, this.Circline.transform(m), this.start.transform(m), this.end.transform(m));
};

edge.prototype.conjugate = function() {
	return new edge(this.Face, this.Circline.conjugate(), this.end.conjugate(), this.start.conjugate());
};

edge.prototype.isConvex = function() {
	if (this.Circline.constructor != Circle)
		return false;

	var a1 = Complex.subtract(this.end, this.start).argument();
	var a2 = Complex.subtract(this.Circline.center(), this.start).argument();
	return (a1 - a2 + 4 * Math.PI) % (2 * Math.PI) < Math.PI;
};

function disc(region, bitmap, isInverting) {
	this.region = region;
	this.isInverting = isInverting;

	this.initialFace = Face.create(region); //.transform(Mobius.createDiscAutomorphism(new Complex([0.001, 0.001]), 0));
	this.faces = [this.initialFace];

	/*			// texture
	 GL.Hint(HintTarget.PerspectiveCorrectionHint, HintMode.Nicest);
	 texture = CreateTexture(bitmap);

	 int r = 0, g = 0, b = 0;
	 int size = bitmap.Width * bitmap.Height;
	 int skip = 16;
	 size = 0;
	 for (int i = 0; i < bitmap.Width; i += skip) {
	 for (int j = 0; j < bitmap.Height; j += skip) {
	 Color color = bitmap.GetPixel(i, j);
	 r += color.R;
	 g += color.G;
	 b += color.B;
	 size++;
	 }
	 }

	 r /= size;
	 g /= size;
	 b /= size;
	 backgroundColor = Color.FromArgb(r, g, b);
	 */
	this.drawCount = 1;
	this.totalDraw = 0;

	this.initFaces();
	this.initTextures();
}

disc.prototype.initFaces = function() {
	var circleLimit = 0.990;
	var seedFace = this.initialFace;
	var faceQueue = [seedFace];
	var faceCenters = [seedFace.center];
	
	var count = 1;
	var minDist = 1;
	while(faceQueue.length > 0) {
		f = faceQueue.pop();
	
		for(var i in f.edges){
			var e = f.edges[i];
			if (e.isConvex()) { 
				continue; 
				}
		
		var c = e.Circline;
			if (c.constructor != Circle) {
				continue;
			} 
			
			if  (c.radiusSquared() < 1.5E-4) { 
				continue; 
			}
				
			var m = e.Circline.asMobius();
			var image =  f.conjugate().transform(m);
			if (isNaN(image.center.data[0])) {
				alert();
				continue;
			}
					
			if (image.center.modulusSquared() > circleLimit) { 
				continue; 
			}
			
			var isDone = false;
			
			for (var j in faceCenters) {
				if (Complex.prototype.equals(faceCenters[j], image.center)) {	
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
	
}

var texture;  // TBD figure out how to tidy this up.
disc.prototype.initTextures = function() {
	texture = gl.createTexture();
	texture.image = new Image();
	texture.image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.bindTexture(gl.TEXTURE_2D, null);
	}
	
	texture.image.src = "nehe.gif";
};

disc.prototype.draw = function(motionMobius, textureOffset, shaderProgram) {
	for(var i in this.faces){
		this.faces[i].draw(motionMobius, textureOffset, texture, shaderProgram);
	}
}

