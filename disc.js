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
		var t =	i / count;
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

function face(region) {
	this.region = region;
	this.center = complex.zero;
	var p = region.P;
	this.isFlipped = false;

	var increment = mobius.prototype.createRotation(2 * Math.PI / p);
	var midvertex = region.p1;
	var e = new edge(this, region.c, midvertex, midvertex.transform(increment.inverse()));

	var mesh = region.points;
	this.edges = [p];
	this.vertices = [p];
	this.edgeCenters = [p];

	this.halfEdgePoints = [2 * p];
	this.spinePoints = [p];
	this.dualEdgePoints = [p];
	this.interiorPoints = [2 * p];

	var rotation = mobius.identity;
	for ( i = 0; i < p; i++) {
		edges[i] = e.transform(rotation);

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

		rotation = complex.prototype.multiply(rotation, increment);
	}
}

function edge(face, circline, start, end) {
	this.face = face;
	this.circline = circline;
	this.start = start;
	this.end = end;
}

edge.prototype.transform = function(m) {
	return new edge(this.face, this.circline.transform(m), this.start.transfrom(m), m * this.end.transform(m));
}

edge.prototype.conjugate = function() {
	return new edge(this.face, this.circline.conjugate(), this.start.conjugate(), m * this.end.conjugate());
}


function disc(region, bitmap, isInverting) {
	this.region = region;
	this.isInverting = isInverting;

	this.currentFace = new face(region);
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

