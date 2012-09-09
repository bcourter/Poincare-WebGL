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
		var pp1 = center.scale(1 - t);
		var pp2 = this.p2.scale(t);
		this.points[i] = complex.prototype.add(pp1, pp2);
		this.points[i + count] = complex.prototype.add(new complex([this.d, 0]), complex.prototype.createPolar(this.r, Math.PI - this.phi * t));
		this.points[i + 2 * count] = this.p1.scale(1 - t);
	}

	this.points[12] = complex.prototype.add(center, complex.prototype.add(this.p1, this.p2).scale(1 / 2)).scale(1 / 2);
	this.points[13] = complex.prototype.add(this.p2, complex.prototype.add(center, this.p1).scale(1 / 2)).scale(1 / 2);
	this.points[14] = complex.prototype.add(this.p1, complex.prototype.add(this.p2, center).scale(1 / 2)).scale(1 / 2);
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

face.prototype.transform = function(m) { int
	p = this.region.p;
	var edges = [p];

	center = face.center().transform(m);
	vertices = complex.prototype.transformArray(face.vertices, m);
	edgeCenters = complex.prototype.transformArray(face.edgeCenters, m);

	halfEdges = new complex[2 * p];
	spines = new complex[p];
	dualEdges = new complex[p];
	interiors = new complex[2 * p];

	for ( i = 0; i < p; i++) {
		edges[i] = complex.prototype.transformArray(face.edges[i], m);
		halfEdges[i] = complex.prototype.transformArray(face.halfEdgePoints[i], m);
		halfEdges[i + p] = complex.prototype.transformArray(face.halfEdgePoints[i + p], m);
		spines[i] = complex.prototype.transformArray(face.spinePoints[i], m);
		dualEdges[i] = complex.prototype.transformArray(face.dualEdgePoints[i], m);
		interiors[i] = complex.prototype.transformArray(face.interiorPoints[i], m);
		interiors[i + p] = complex.prototype.transformArray(face.interiorPoints[i + p], m);
	}

	return new face(this.region, edges, center, vertices, edgeCenters, halfEdges, spines, dualEdges, interiors, this.isFlipped);
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

	return new face(this.region, edges, center, vertices, edgeCenters, halfEdges, spines, dualEdges, interiors, !this.isFlipped);
};

face.prototype.coords = function() {
	var p = this.region.p;
	var halfEdgesOffset = 0;
	var spinesOffset = halfEdgesOffset + 2 * p;
	var dualEdgesOffset = spinesOffset + p;
	var interiorsOffset = dualEdgesOffset + p;
	var length = interiorsOffset + 2 * p;
	
	var vertices = [];
	var textureCoords = [];
	for (i = 0 ; i < p; i ++){
		vertices = vertices.concat(
			this.halfEdges[i].data, 
			this.halfEdges[i + p].data, 
			this.spines[i].data, 
			this.dualEdges[i].data,
			this.interiors[i].data ,
			this.interiors[i + p].data
		);
		
		textureCoords = textureCoords.concat(
			this.halfEdges[i].data, 
			this.halfEdges[i + p].data, 
			this.spines[i].data, 
			this.dualEdges[i].data,
			this.interiors[i].data ,
			this.interiors[i + p].data
		);
		
	}
    var cubeVertexIndices = [
        0, 1, 2,      
        0, 2, 3
    ];
    
    return [vertices, textureCoords, cubeVertexIndices]
};
	
	/*face.prototype.coords = function(color, texture, textureBack, isInverting, isInverted, texOffset) {

			GL.Color4(color);
			GL.Enable(EnableCap.Texture2D);
			GL.Enable(EnableCap.Blend);
			GL.BlendFunc(BlendingFactorSrc.SrcAlpha, BlendingFactorDest.OneMinusSrcAlpha);
			GL.Enable(EnableCap.ColorLogicOp);
			GL.LogicOp(LogicOp.Copy);
			
			GL.BindTexture(TextureTarget.Texture2D, texture);
			//	prototype	AverageColor = Color4.Black;
			
			for (i = 0; i < p; i++) {

				if (isInverting) {
					if (isInverted ^ isFlipped) 
						GL.LogicOp(LogicOp.CopyInverted);
					else
						GL.LogicOp(LogicOp.Copy);
				}

				GL.Begin(BeginMode.TriangleStrip);
				GLVertex(center, 0, texOffset);
				GLVertex(spinePoints[i][2], 11, texOffset);
				GLVertex(dualEdgePoints[i][0], 1, texOffset);
				GLVertex(interiorPoints[i][0], 12, texOffset);
				GLVertex(dualEdgePoints[i][1], 2, texOffset);
				GLVertex(interiorPoints[i][1], 13, texOffset);
				GLVertex(dualEdgePoints[i][2], 3, texOffset);
				GLVertex(halfEdgePoints[i][0], 5, texOffset);
				GLVertex(edgeCenters[i], 4, texOffset);
				GL.End();

				GL.Begin(BeginMode.TriangleStrip);
				GLVertex(spinePoints[i][2], 11, texOffset);
				GLVertex(spinePoints[i][1], 10, texOffset);
				GLVertex(interiorPoints[i][0], 12, texOffset);
				GLVertex(interiorPoints[i][2], 14, texOffset);
				GLVertex(interiorPoints[i][1], 13, texOffset);
				GLVertex(halfEdgePoints[i][1], 6, texOffset);
				GLVertex(halfEdgePoints[i][0], 5, texOffset);
				GL.End();

				GL.Begin(BeginMode.TriangleStrip);
				GLVertex(spinePoints[i][1], 10, texOffset);
				GLVertex(spinePoints[i][0], 9, texOffset);
				GLVertex(interiorPoints[i][2], 14, texOffset);
				GLVertex(halfEdgePoints[i][2], 7, texOffset);
				GLVertex(halfEdgePoints[i][1], 6, texOffset);
				GL.End();

				GL.Begin(BeginMode.TriangleStrip);
				GLVertex(spinePoints[i][0], 9, texOffset);
				GLVertex(vertices[i], 8, texOffset);
				GprototypeLVertex(halfEdgePoints[i][2], 7, texOffset);
				GL.End();

				if (isInverting) {
					if (isInverted ^ isFlipped) 
						GL.LogicOp(LogicOp.Copy);
					else
						GL.LogicOp(LogicOp.CopyInverted);
				}

				int ii = (i + p - 1) % p;
				GL.Begin(BeginMode.TriangleStrip);
				GLVertex(center, 0, texOffset);
				GLVertex(spinePoints[ii][2], 11, texOffset);
				GLVertex(dualEdgePoints[i][0], 1, texOffset);
				GLVertex(interiorPoints[i + p][0], 12, texOffset);
				GLVertex(dualEdgePoints[i][1], 2, texOffset);
				GLVertex(interiorPoints[i + p][1], 13, texOffset);
				GLVertex(dualEdgePoints[i][2], 3, texOffset);
				GLVertex(halfEdgePoints[i + p][0], 5, texOffset);
				GLVertex(edgeCenters[i], 4, texOffset);
				GL.End();

				GL.Begin(BeginMode.TriangleStrip);
				GLVertex(spinePoints[ii][2], 11, texOffset);
				GLVertex(spinePoints[ii][1], 10, texOffset);
				GLVertex(interiorPoints[i + p][0], 12, texOffset);
				GLVertex(interiorPoints[i + p][2], 14, texOffset);
				GLVertex(interiorPoints[i + p][1], 13, texOffset);
				GLVertex(halfEdgePoints[i + p][1], 6, texOffset);
				GLVertex(halfEdgePoints[i + p][0], 5, texOffset);
				GL.End();

				GL.Begin(BeginMode.TriangleStrip);
				GLVertex(spinePoints[ii][1], 10, texOffset);
				GLVertex(spinePoints[ii][0], 9, texOffset);
				GLVertex(interiorPoints[i + p][2], 14, texOffset);
				GLVertex(halfEdgePoints[i + p][2], 7, texOffset);
				GLVertex(halfEdgePoints[i + p][1], 6, texOffset);
				GL.End();;

				GL.Begin(BeginMode.TriangleStrip);
				GLVertex(spinePoints[ii][0], 9, texOffset);
				GLVertex(vertices[ii], 8, texOffset);
				GLVertex(halfEdgePoints[i + p][2], 7, texOffset);
				GL.End();
			}

			GL.Disable(EnableCap.Texture2D);
			
//			GL.LogicOp(LogicOp.Invert);
//			foreach (Edge edge in edges) 
//				edge.DrawGL(color);
			
			GL.Disable(EnableCap.ColorLogicOp);
			GL.Disable(EnableCap.Blend);
			
		};
*/

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


