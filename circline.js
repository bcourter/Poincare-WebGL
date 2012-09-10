function circline(a, b, c) {
	this.a = a;
	this.b = b;
	this.c = c;
	
	if(isNaN(a) || isNaN(b.data[0] || isNaN(b.data[1]) || isNaN(c)))	{
		var d = 0; 
	}
}

circline.prototype.create = function(a, b, c) {
	if (accuracy.prototype.lengthIsZero(a)) {
		return new line(b, c);
	}

	return new circle(a, b, c);
};

circline.prototype.transform = function(m) {
	var inverse = m.inverse();
	//			Mobius hermitian = inverse.Transpose *
	//			new Mobius(new Complex(circLine.a, 0), circLine.b.Conjugate, circLine.b, new Complex(circLine.c, 0)) *
	//			inverse.Conjugate;
	var a = inverse.transpose();
	var b = new mobius(new complex([this.a, 0]), this.b.conjugate(), this.b, new complex([this.c, 0]));
	var c = inverse.conjugate();	
	
	var hermitian = mobius.prototype.multiply(
		mobius.prototype.multiply(
			a, 
			b
		),
		c
	);
	return circline.prototype.create(hermitian.a.data[0], hermitian.c, hermitian.d.data[0]);
};

circline.prototype.equals = function(cl) {
	return accuracy.lengthEquals(this.a, cl.a) && complex.equals(this.b, cl.b) && accuracy.lengthEquals(c, cl.c);
};

circline.prototype.isPointOnLeft = function(p) {
	return (this.a * p.modulusSquared + complex.add(complex.multiply(this.b.conjugate(), p),
	complex.multiply(this.b , p.conjugate)).data[0] + this.c + Accuracy.LinearTolerance) > 0;
};

circline.prototype.containsPoint = function(p) {
	return accuracy.lengthIsZero(this.a * p.ModulusSquared + complex.add(complex.multiply(this.b.conjugate(), p) , 			complex.multiply(this.b , p.conjugate)).data[0] + c);
};

circline.prototype.arePointsOnSameSide = function(p1, p2) {
	if (complex.equals(p1, p2))
		return true;

	return circline.isPointOnLeft(p1) ^ circline.isPointOnLeft(p2);
};

circline.prototype.conjugate = function() {
	return circline.prototype.create(this.a, this.b.conjugate(), this.c);
};

function circle(a, b, c) {
//	circline.call(this);
	this.a = 1;
	this.b = b.scale(1/a);
	this.c = c/a;
}

circle.prototype = new circline();
circle.prototype.constructor = circle;

circle.prototype.create = function(center, radius) {
	return new circle(1, center.negative(), center.modulusSquared() - radius * radius);
};

circle.unit = circle.prototype.create(complex.zero, 1);

circle.prototype.center = function() {
	return this.b.negative().scale(1/this.a);
};

circle.prototype.radiusSquared = function() {
	return this.center().modulusSquared() - this.c / this.a;
};

circle.prototype.radius = function() {
	return Math.sqrt(this.radiusSquared());
};

circle.prototype.inverse = function() {
	if (accuracy.lengthIsZero((this.center().modulusSquared() - this.radiusSquared()))) {
		return new line(this.b.negative().conjugate(), 1);
	}

	return new circle(this.center().modulusSquared() - this.radiusSquared(), this.b.conjugate(), 1);
};

circle.prototype.asMobius = function() {
	return new mobius(this.center(), new complex([this.radiusSquared() - this.center().modulusSquared(), 0]), complex.one, this.b.conjugate());
};

circle.prototype.scale = function(scale) {
	if (scale.constructor == complex) {
		scale = scale.modulus;
	}

	return circle.prototype.create(this.center().scale(scale), this.radius() * scale);
};

function line(b, c) {
//	circline.call(this);
	this.a = 0;
	this.b = b;
	this.c = c;
}

line.prototype = new circline();
line.prototype.constructor = line;

line.prototype.createTwoPoint = function(p1, p2) { 
	dx = p2.data[0] - p1.data[0];
	dy = p2.data[1] - p1.data[1];

	return line.prototype.createFromEquation(-dy, dx, dx * p1.data[1] - dy * p1.data[0]);
};

// Creates a linear circle a * x + b * y + c = 0 from reals a, b, and c.
line.prototype.createFromEquation = function(a, b, c) {
	return new line(new complex([a / 2, b / 2]), c);
};

line.prototype.createPointAngle = function(point, angle) { 
	return line.prototype.createTwoPoint(point, complex.prototype.subtract(point, complex.prototype.createPolar(1, angle)));
};
	
line.prototype.inverse = function() {
	if (accuracy.lengthIsZero(c / 1000)) {
		return new line(this.b.conjugate(), 0);
	}

	return new circle(this.b.conjugate.scale(1 / c), this.b.modulus / c);
};

line.prototype.asMobius = function() {
	return new mobius(this.b, complex.one, complex.zero, this.b.negative().conjugate());
};

