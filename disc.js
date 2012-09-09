function region(p, q) {
	this.p = p;
	this.q = q;
	var sinP2 = Math.pow(Math.sin(Math.PI / p), 2);
	var cosQ2 = Math.pow(Math.cos(Math.PI / q), 2);
	this.r = Math.sqrt(sinP2 / (cosQ2 - sinP2));
	this.d = Math.sqrt(cosQ2 / (cosQ2 - sinP2));
	this.phi = Math.PI * (0.5 - (1.0 / p + 1.0 / q));

	this.l1 = line.prototype.createTwoPoint(complex.zero, complex.one);
	this.l2 = line.prototype.createTwoPoint(complex.zero, Math.PI / p);
	this.c = circle.prototype.create(new complex([this.d, 0]), this.r);
	var center = this.c.center();

	var polar = complex.prototype.createPolar(this.r, Math.PI - this.phi)
	this.p0 = complex.zero;
	this.p1 = complex.prototype.add(new complex([this.d, 0]), polar);
	this.p2 = new complex([this.d - this.r, 0]);

	/*         08
	 *       09  07
	 *     10  14  06
	 *   11  12  13  05
	 * 00  01  02  03  04
	 * */
	this.points = [15];
	var count = 4;
	for ( i = 0; i < count; i++) {
		var t = i / count;

		this.points[i] = this.p2.scale(t);
		this.points[i + count] = complex.prototype.add(new complex([this.d, 0]), complex.prototype.createPolar(this.r, Math.PI - this.phi * t));
		this.points[i + 2 * count] = this.p1.scale(1 - t);
	}

	this.points[12] = complex.prototype.add(this.p0, complex.prototype.add(this.p1, this.p2).scale(1 / 2)).scale(1 / 2);
	this.points[13] = complex.prototype.add(this.p2, complex.prototype.add(this.p0, this.p1).scale(1 / 2)).scale(1 / 2);
	this.points[14] = complex.prototype.add(this.p1, complex.prototype.add(this.p2, this.p0).scale(1 / 2)).scale(1 / 2);
}


function face(region, center, vertices, edgeCenters, halfEdges, spines, dualEdges, interiors, isFlipped) {
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
	this.edges = [p];
	var increment = mobius.prototype.createRotation(2 * Math.PI / p);
	var midvertex = region.p1;
	var e = new edge(this, region.c, midvertex, midvertex.transform(increment.inverse()));
	
	var edges = [p];
	var rotation = mobius.identity;
	for ( i = 0; i < p; i++) {
		edges[i] = e.transform(rotation);
		rotation = mobius.prototype.multiply(rotation, increment);
	}
}

face.prototype.create = function(region) {
	var region = region;
	var center = complex.zero;
	var p = region.p;
	var isFlipped = false;

	var increment = mobius.prototype.createRotation(2 * Math.PI / p);
	var midvertex = region.p1;

	var mesh = region.points;
	var meshConjugate = complex.prototype.conjugateArray(mesh)
	var meshCount = 3;
	var vertices = [p];
	var edgeCenters = [p];

	var halfEdgePoints = [2 * p];
	var spinePoints = [p];
	var dualEdgePoints = [p];
	var interiorPoints = [2 * p];

	var rotation = mobius.identity;
	for ( i = 0; i < p; i++) {
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

		rotation = mobius.prototype.multiply(rotation, increment);
	}

	return new face(region, center, vertices, edgeCenters, halfEdgePoints, spinePoints, dualEdgePoints, interiorPoints, isFlipped);
};


face.prototype.createWithEdges = function(region, edges, center, vertices, edgeCenters, halfEdges, spines, dualEdges, interiors, isFlipped) {
	var f = new face(region, center, vertices, edgeCenters, halfEdgePoints, spinePoints, dualEdgePoints, interiorPoints, isFlipped);
	f.edges = edges;
}

face.prototype.transform = function(m) { int
	p = this.region.p;
	var edges = [p];

	center = face.cinteriorsIenter().transform(m);
	vertices = complex.prototype.transformArray(face.vertices, m);
	edgeCenters = complex.prototype.transformArray(face.edgeCenters, m);

	halfEdges = [2 * p];
	spines = [p];
	dualEdges = [p];
	interiors = [2 * p];

	for ( i = 0; i < p; i++) {
		halfEdges[i] = complex.prototype.transformArray(face.halfEdgePoints[i], m);
		halfEdges[i + p] = complex.prototype.transformArray(face.halfEdgePoints[i + p], m);
		spines[i] = complex.prototype.transformArray(face.spinePoints[i], m);
		dualEdges[i] = complex.prototype.transformArray(face.dualEdgePoints[i], m);
		interiors[i] = complex.prototype.transformArray(face.interiorPoints[i], m);
		interiors[i + p] = complex.prototype.transformArray(face.interiorPoints[i + p], m);
	}

	return face.prototype.createWithEdges(this.region, edges, center, vertices, edgeCenters, halfEdges, spines, dualEdges, interiors, this.isFlipped);
}

face.prototype.conjugate = function(m) { int
	p = this.region.p;
	var edges = [p]; 

	center = face.center().conjugate(m);
	vertices = complex.prototype.conjugateArray(face.vertices);
	edgeCenters = complex.prototype.conjugateArray(face.edgeCenters);

	halfEdges = new Complex[2 * p];
	spines = new Complex[p];
	dualEdges = new Complex[p];
	interiors = new Complex[2 * p];

	for ( i = 0; i < p; i++) {
		edges[i] = complex.prototype.conjugateArray(face.edges[i]);
		halfEdges[i] = complex.prototype.conjugateArray(face.halfEdgePoints[i]);
		halfEdges[i + p] = complex.prototype.conjugateArray(face.halfEdgePoints[i + p]);
		spines[i] = complex.prototype.conjugateArray(face.spinePoints[i]);
		dualEdges[i] = complex.prototype.conjugateArray(face.dualEdgePoints[i]);
		interiors[i] = complex.prototype.conjugateArray(face.interiorPoints[i]);
		interiors[i + p] = complex.prototype.conjugateArray(face.interiorPoints[i + p]);
	}

	return face.prototype.createWithEdges(this.region, edges, center, vertices, edgeCenters, halfEdges, spines, dualEdges, interiors, this.isFlipped);
};

face.prototype.coords = function() {
	var p = this.region.p;

	var vertices = [];
	var textureCoords = [];
	for (i = 0; i < p; i ++){
		vertices = vertices.concat(
			this.dualEdges[i][0].data[0],	this.dualEdges[i][0].data[1],
			this.dualEdges[i][1].data[0],	this.dualEdges[i][1].data[1],
			this.dualEdges[i][2].data[0],	this.dualEdges[i][2].data[1],
			this.edgeCenters[i].data[0],	this.edgeCenters[i].data[1],
			this.halfEdges[i][0].data[0],	this.halfEdges[i][0].data[1],
			this.halfEdges[i][1].data[0],	this.halfEdges[i][1].data[1],
			this.halfEdges[i][2].data[0],	this.halfEdges[i][2].data[1],
			this.halfEdges[i + p][0].data[0],	this.halfEdges[i + p][0].data[1],
			this.halfEdges[i + p][1].data[0],	this.halfEdges[i + p][1].data[1],
			this.halfEdges[i + p][2].data[0],	this.halfEdges[i + p][2].data[1],
			this.vertices[i].data[0],	this.vertices[i].data[1],
			this.spines[i][0].data[0],	this.spines[i][0].data[1],
			this.spines[i][1].data[0],	this.spines[i][1].data[1],
			this.spines[i][2].data[0],	this.spines[i][2].data[1],
			this.interiors[i][0].data[0],	this.interiors[i][0].data[1],
			this.interiors[i][1].data[0],	this.interiors[i][1].data[1],
			this.interiors[i][2].data[0],	this.interiors[i][2].data[1],
			this.interiors[i + p][0].data[0],	this.interiors[i + p][0].data[1],
			this.interiors[i + p][1].data[0],	this.interiors[i + p][1].data[1],
			this.interiors[i + p][2].data[0], 	this.interiors[i + p][2].data[1]
		); 
	
	textureCoords = textureCoords.concat(
			this.dualEdges[0][0].data[0],	this.dualEdges[0][0].data[1],
			this.dualEdges[0][1].data[0],	this.dualEdges[0][1].data[1],
			this.dualEdges[0][2].data[0],	this.dualEdges[0][2].data[1],
			this.edgeCenters[0].data[0],	this.edgeCenters[0].data[1],
			this.halfEdges[0][0].data[0],	this.halfEdges[0][0].data[1],
			this.halfEdges[0][1].data[0],	this.halfEdges[0][1].data[1],
			this.halfEdges[0][2].data[0],	this.halfEdges[0][2].data[1],
			this.halfEdges[0][0].data[0],	this.halfEdges[0][0].data[1],
			this.halfEdges[0][1].data[0],	this.halfEdges[0][1].data[1],
			this.halfEdges[0][2].data[0],	this.halfEdges[0][2].data[1],
			this.vertices[0].data[0],	this.vertices[0].data[1],
			this.spines[0][0].data[0],	this.spines[0][0].data[1],
			this.spines[0][1].data[0],	this.spines[0][1].data[1],
			this.spines[0][2].data[0],	this.spines[0][2].data[1],
			this.interiors[0][0].data[0],	this.interiors[0][0].data[1],
			this.interiors[0][1].data[0],	this.interiors[0][1].data[1],
			this.interiors[0][2].data[0],	this.interiors[0][2].data[1],
			this.interiors[0][0].data[0],	this.interiors[0][0].data[1],
			this.interiors[0][1].data[0],	this.interiors[0][1].data[1],
			this.interiors[0][2].data[0], 	this.interiors[0][2].data[1]
		);
	}
	
	vertices = vertices.concat(this.center.data[0], this.center.data[1]);
	textureCoords = textureCoords.concat(this.center.data[0], this.center.data[1]);
	
	var centerI = vertices.length/2 - 1;
	var dualEdgesI = [0, 1, 2];
	var edgeCentersI = 3
	var halfEdgesI = [4, 5, 6, 7, 8, 9]
	var verticesI = 10;
	var spinesI = [11, 12, 13];
	var interiorsI = [14, 15, 16, 17, 18, 19];
	
	var size = 20;
    var cubeVertexIndices = [];
    
    for (n = 0; n < p; n++){
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
    
    return [vertices,  textureCoords, cubeVertexIndices]
};


function edge(face, circline, start, end) {
	this.face = face;
	this.circline = circline;
	this.start = start;
	this.end = end;
};

edge.prototype.transform = function(m) {
	return new edge(this.face, this.circline.transform(m), this.start.transform(m), this.end.transform(m));
};

edge.prototype.conjugate = function() {
	return new edge(this.face, this.circline.conjugate(), this.start.conjugate(), this.end.conjugate());
};


function disc(region, bitmap, isInverting) {
	this.region = region;
	this.isInverting = isInverting;

	this.currentFace = face.prototype.create(region);
	this.initialFace = this.currentFace;

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
}


