function accuracy() {
}

accuracy.prototype.linearTolerance = 1E-9;
accuracy.prototype.angularTolerance = 1E-3;
accuracy.prototype.linearToleranceSquared = accuracy.linearTolerance * accuracy.linearTolerance;
accuracy.prototype.maxLength = 100;

accuracy.prototype.lengthEquals = function(a, b) {
	return Math.abs(a - b) < accuracy.linearTolerance;
};

accuracy.prototype.lengthIsZero = function(a) {
	return Math.abs(a) < accuracy.linearTolerance;
};

accuracy.prototype.angleEquals = function(a, b) {
	return Math.Abs(a - b) < accuracy.angularTolerance;
};

accuracy.prototype.angleIsZero = function(a) {
	return Math.Abs(a) < accuracy.angularTolerance;
};

function complex(a) {
	this.data = new glMatrixArrayType(2);
	this.data[0] = a[0];
	this.data[1] = a[1];
}

complex.zero = new complex([0.0, 0.0]);
complex.one = new complex([1.0, 0.0]);
complex.i = new complex([0.0, 1.0]);

complex.prototype.createPolar = function(r, theta) {
	return new complex([r * Math.cos(theta), r * Math.sin(theta)]);
};

complex.prototype.set = function(a, b) {
	b.data[0] = a.data[0];
	b.data[1] = a.data[1];
	return b
};

complex.prototype.add = function(a, b) {
	return new complex([a.data[0] + b.data[0], a.data[1] + b.data[1]]);
};

complex.prototype.subtract = function(a, b) {
	return new complex([a.data[0] - b.data[0], a.data[1] - b.data[1]]);
};

complex.prototype.multiply = function(a, b) {
	if (a == undefined || b == undefined || a.data == undefined || b.data == undefined) {
		var x = 0;
	}
	
	return new complex([a.data[0] * b.data[0] - a.data[1] * b.data[1], a.data[0] * b.data[1] + a.data[1] * b.data[0]]);
};

complex.prototype.divide = function(a, b) {
	var automorphy = b.data[0] * b.data[0] + b.data[1] * b.data[1];
	return new complex([(a.data[0] * b.data[0] + a.data[1] * b.data[1]) / automorphy, (a.data[1] * b.data[0] - a.data[0] * b.data[1]) / automorphy]);
};

complex.prototype.scale = function(s) {
	if ( typeof scale === "complex") {
		scale = scale.modulus;
	}

	return new complex([this.data[0] * s, this.data[1] * s]);
};

complex.prototype.equals = function(a, b) {
	return complex.subtract(a, b).modulusSquared < accuracy.linearToleranceSquared;
};

complex.prototype.modulus = function() {
	return Math.sqrt(this.data[0] * this.data[0] + this.data[1] * this.data[1]);
};

complex.prototype.modulusSquared = function() {
	return this.data[0] * this.data[0] + this.data[1] * this.data[1];
};

complex.prototype.argument = function() {
	return Math.atan2(this.data[1], this.data[0]);
};

complex.prototype.negative = function() {
	return new complex([-this.data[0], -this.data[1]]);
};

complex.prototype.transform = function(m) {
	return complex.prototype.divide(complex.prototype.add(complex.prototype.multiply(m.a, this), m.b), complex.prototype.add(complex.prototype.multiply(m.c, this), m.d));
};

complex.prototype.conjugate = function() {
	return new complex([this.data[0], -this.data[1]]);
};

complex.prototype.transformArray = function(original, m) {
	var transformed = [original.length];
	for ( i = 0; i < original.length; i++) {
		transformed[i] = original[i].transform(m);
	}
	
	return transformed;
};

complex.prototype.conjugateArray = function(original) {
	var transformed = [original.length];
	for ( i = 0; i < original.length; i++) {
		transformed[i] = original[i].conjugate;
	}
	
	return transformed;
};

complex.prototype.toString = function() {
	return "{" + this.data[0] + ", " + this.data[1] + "}";
};

function mobius(a, b, c, d) {
	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;
}

mobius.identity = new mobius(complex.one, complex.zero, complex.zero, complex.one);

mobius.prototype.multiply = function(m1, m2) {
    return new mobius(
        complex.prototype.add(complex.prototype.multiply(m2.a, m1.a), complex.prototype.multiply(m2.b, m1.c)), 
        complex.prototype.add(complex.prototype.multiply(m2.a, m1.b), complex.prototype.multiply(m2.b, m1.d)), 
        complex.prototype.add(complex.prototype.multiply(m2.c, m1.a), complex.prototype.multiply(m2.d, m1.c)), 
        complex.prototype.add(complex.prototype.multiply(m2.c, m1.b), complex.prototype.multiply(m2.d, m1.d))
    );
};

mobius.prototype.createDiscAutomorphism = function(a, phi) {
	return mobius.prototype.multiply(mobius.prototype.createRotation(phi), new mobius(complex.one, a.negative(), a.conjugate(), complex.one.negative()));
};

mobius.prototype.createDiscTranslation = function(a, b) {
	return mobius.multiply(mobius.createDiscAutomorphism(b, 0), mobius.createDiscAutomorphism(a, 0).inverse());
};

mobius.prototype.createTranslation = function(tranlsation) {
	return new mobius(complex.one, tranlsation, complex.zero, complex.one);
};

mobius.prototype.createRotation = function(phi) {
	return new mobius(complex.prototype.createPolar(1, phi), complex.zero, complex.zero, complex.one);
};

mobius.prototype.inverse = function() {
	return new mobius(this.d, this.b.negative(), this.c.negative(), this.a);
};

mobius.prototype.conjugate = function() {
	return new mobius(this.a.conjugate(), this.b.conjugate(), this.c.conjugate(), this.d.conjugate());
};

mobius.prototype.transpose = function() {
	return new mobius(this.a, this.c, this.b, this.d);
};

mobius.prototype.conjugateTranspose = function() {
	return new mobius(this.a.conjugate(), this.c.conjugate(), this.b.conjugate(), this.d.conjugate());
};

