function Accuracy() {
}

Accuracy.linearTolerance = 1E-6;
Accuracy.angularTolerance = 1E-2;
Accuracy.linearToleranceSquared = Accuracy.linearTolerance * Accuracy.linearTolerance;
Accuracy.maxLength = 100;

Accuracy.lengthEquals = function(a, b) {
	return Math.abs(a - b) < Accuracy.linearTolerance;
};

Accuracy.lengthIsZero = function(a) {
	return Math.abs(a) < Accuracy.linearTolerance;
};

Accuracy.angleEquals = function(a, b) {
	return Math.Abs(a - b) < Accuracy.angularTolerance;
};

Accuracy.angleIsZero = function(a) {
	return Math.Abs(a) < Accuracy.angularTolerance;
};
	
function Complex(a) {
	this.data = [2];
//	this.data = new glMatrixArrayType(2);
	this.data[0] = a[0];
	this.data[1] = a[1];
}

Complex.zero = new Complex([0.0, 0.0]);
Complex.one = new Complex([1.0, 0.0]);
Complex.i = new Complex([0.0, 1.0]);

Complex.createPolar = function(r, theta) {
	return new Complex([r * Math.cos(theta), r * Math.sin(theta)]);
};

Complex.add = function(a, b) {
	return new Complex([a.data[0] + b.data[0], a.data[1] + b.data[1]]);
};

Complex.subtract = function(a, b) {	
	return new Complex([a.data[0] - b.data[0], a.data[1] - b.data[1]]);
};

Complex.multiply = function(a, b) {
	if (a == undefined || b == undefined || a.data == undefined || b.data == undefined) {
		var x = 0;
	}
	
	return new Complex([a.data[0] * b.data[0] - a.data[1] * b.data[1], a.data[0] * b.data[1] + a.data[1] * b.data[0]]);
};

Complex.divide = function(a, b) {
	var automorphy = b.data[0] * b.data[0] + b.data[1] * b.data[1];
	return new Complex([(a.data[0] * b.data[0] + a.data[1] * b.data[1]) / automorphy, (a.data[1] * b.data[0] - a.data[0] * b.data[1]) / automorphy]);
};

Complex.transformArray = function (original, m) {
    var transformed = [original.length];
    for (i in original) {
        transformed[i] = original[i].transform(m);
    }

    return transformed;
};

Complex.conjugateArray = function (original) {
    var transformed = [original.length];
    for (i in original) {
        transformed[i] = original[i].conjugate();
    }

    return transformed;
};

Complex.prototype.scale = function(s) {
	if ( typeof scale === "Complex") {
		scale = scale.modulus;
	}

	return new Complex([this.data[0] * s, this.data[1] * s]);
};

Complex.prototype.equals = function(a, b) {
	return Complex.subtract(a, b).modulusSquared() < 0.000001;
};

Complex.prototype.modulus = function() {
	return Math.sqrt(this.data[0] * this.data[0] + this.data[1] * this.data[1]);
};

Complex.prototype.modulusSquared = function() {
	return this.data[0] * this.data[0] + this.data[1] * this.data[1];
};

Complex.prototype.argument = function() {
	return Math.atan2(this.data[1], this.data[0]);
};

Complex.prototype.negative = function() {
	return new Complex([-this.data[0], -this.data[1]]);
};

Complex.prototype.transform = function(m) {
	return Complex.divide(Complex.add(Complex.multiply(m.a, this), m.b), Complex.add(Complex.multiply(m.c, this), m.d));
};

Complex.prototype.conjugate = function() {
	return new Complex([this.data[0], -this.data[1]]);
};

Complex.prototype.toString = function() {
	return "{" + this.data[0] + ", " + this.data[1] + "}";
};


function Mobius(a, b, c, d) {
/*	var det = Complex.subtract(
		Complex.multiply(a,d),
		Complex.multiply(b,c)
	);
	
	if (!Accuracy.lengthIsZero(det)) {
		a = Complex.divide(a, det);
		b = Complex.divide(b, det);
		c = Complex.divide(c, det);
		d = Complex.divide(d, det);
	}
	*/
	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;
}

Mobius.identity = new Mobius(Complex.one, Complex.zero, Complex.zero, Complex.one);

Mobius.multiply = function(m2, m1) {
    return new Mobius(
        Complex.add(Complex.multiply(m2.a, m1.a), Complex.multiply(m2.b, m1.c)), 
        Complex.add(Complex.multiply(m2.a, m1.b), Complex.multiply(m2.b, m1.d)), 
        Complex.add(Complex.multiply(m2.c, m1.a), Complex.multiply(m2.d, m1.c)), 
        Complex.add(Complex.multiply(m2.c, m1.b), Complex.multiply(m2.d, m1.d))
    );
};

Mobius.createDiscAutomorphism = function(a, phi) {
	return Mobius.multiply(Mobius.createRotation(phi), new Mobius(Complex.one, a.negative(), a.conjugate(), Complex.one.negative()));
};

Mobius.createDiscTranslation = function(a, b) {
	return Mobius.multiply(Mobius.createDiscAutomorphism(b, 0), Mobius.createDiscAutomorphism(a, 0).inverse());
};

Mobius.createTranslation = function(tranlsation) {
	return new Mobius(Complex.one, tranlsation, Complex.zero, Complex.one);
};

Mobius.createRotation = function(phi) {
	return new Mobius(Complex.createPolar(1, phi), Complex.zero, Complex.zero, Complex.one);
};

Mobius.prototype.inverse = function() {
	return new Mobius(this.d, this.b.negative(), this.c.negative(), this.a);
};

Mobius.prototype.conjugate = function() {
	return new Mobius(this.a.conjugate(), this.b.conjugate(), this.c.conjugate(), this.d.conjugate());
};

Mobius.prototype.transpose = function() {
	return new Mobius(this.a, this.c, this.b, this.d);
};

Mobius.prototype.conjugateTranspose = function() {
	return new Mobius(this.a.conjugate(), this.c.conjugate(), this.b.conjugate(), this.d.conjugate());
};

