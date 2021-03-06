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

Complex.transformArray = function (original, mobius) {
    var transformed = [original.length];
    for (i in original) {
        transformed[i] = original[i].transform(mobius);
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

Complex.equals = function(a, b) {
	return Complex.subtract(a, b).modulusSquared() < this.linearTolerance * this.linearTolerance;
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

Complex.prototype.transform = function(mobius) {
	return Complex.divide(Complex.add(Complex.multiply(mobius.a, this), mobius.b), Complex.add(Complex.multiply(mobius.c, this), mobius.d));
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

Mobius.multiply = function(m1, m2) {
    return new Mobius(
        Complex.add(Complex.multiply(m1.a, m2.a), Complex.multiply(m1.b, m2.c)), 
        Complex.add(Complex.multiply(m1.a, m2.b), Complex.multiply(m1.b, m2.d)), 
        Complex.add(Complex.multiply(m1.c, m2.a), Complex.multiply(m1.d, m2.c)), 
        Complex.add(Complex.multiply(m1.c, m2.b), Complex.multiply(m1.d, m2.d))
    );
};

Mobius.add = function(m1, m2) {
    return new Mobius(
        Complex.add(m1.a, m2.a), 
        Complex.add(m1.b, m2.b), 
        Complex.add(m1.c, m2.c), 
        Complex.add(m1.d, m2.d) 
    );
};

Mobius.prototype.scale = function(s) {
    return new Mobius(
        this.a.scale(s),
        this.b.scale(s),
        this.c.scale(s),
        this.d.scale(s)
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


function ComplexCollection() {
	this.sectorCount = 64;
	this.annulusCount = 128;
	this.sectors = [this.sectorCount];
	this.clear();
	this.max = 0;
}

ComplexCollection.prototype.add = function(c) {
	var sector = this.sector(c);
	var modulusSquared = c.modulusSquared();
	var annulus = Math.floor(modulusSquared * this.annulusCount);
	
	this.sectors[sector][annulus].push(c);
	this.max = Math.max(this.max, modulusSquared);
}

ComplexCollection.prototype.contains = function(c) {
	var sector = this.sector(c);
	var annulus = Math.floor(c.modulusSquared() * this.annulusCount);
	
	for (var i = 0; i < this.sectors[sector][annulus].length; i++) {
		if (Complex.equals(this.sectors[sector][annulus][i], c))
			return true;
	}
	
	return false;
}

ComplexCollection.prototype.clear = function() {
	for (var i = 0; i < this.sectorCount; i++) {
		this.sectors[i] = [this.annulusCount];
		for (var j = 0; j < this.annulusCount; j++) 
			this.sectors[i][j] = [];
	}
	
}

ComplexCollection.prototype.sector = function(complex) {
	return Math.floor(((complex.argument() + Math.PI) / (Math.PI * 2 / this.sectorCount)) % this.sectorCount);
}

	
