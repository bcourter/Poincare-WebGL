function Animator(object, duration, v1) {
	this.object = object;
    this.duration = duration;
    this.v0 = window[this.object];
    this.v1 = v1;
    
    this.startTime = new Date().getTime();
    Animator.prototype.animators.push(this);
}

Animator.prototype.animators = [];

Animator.update = function () {
   	var animators = Animator.prototype.animators;
 	for (var i = 0; i < animators.length; i++) {
		animators[i].evaluate();
	}
}

Animator.prototype.evaluate = function () {
    var now =  new Date().getTime();
    var lapsed = (now - this.startTime) / 1000;
    var ratio = lapsed / this.duration;
    
    if (ratio > 1) {
    	var animators = Animator.prototype.animators;
    	for (var i = 0; i < animators.length; i++) {
    		if (animators[i] == this) {
    		        if (i == animators.length - 1) {
    		            animators.pop();
    		            break;
    		        }
    		    
    			animators = animators.slice(i, 1);
    			break;
    		}
    	}
    	
    	window[this.object] = this.v1;
    	return;
    }
    
    ratio = 1 - (ratio - 1) * (ratio - 1);
    
    window[this.object] = this.calculate(ratio);
}


function FloatAnimator(object, duration, v1) {
	this.object = object;
    this.duration = duration;
    this.v0 = window[this.object];
    this.v1 = v1;
    
    this.startTime = new Date().getTime();
    FloatAnimator.prototype.animators.push(this);
}

FloatAnimator.prototype = new Animator();
FloatAnimator.prototype.constructor = FloatAnimator;

FloatAnimator.prototype.calculate = function (ratio) {
	return ratio * this.v1 + (1 - ratio) * this.v0;
}


function FloatArrayAnimator(object, duration, v1) {
	this.object = object;
    this.duration = duration;
    this.v0 = window[this.object];
    this.v1 = v1;
    
    this.startTime = new Date().getTime();
    FloatArrayAnimator.prototype.animators.push(this);
}

FloatArrayAnimator.prototype = new Animator();
FloatArrayAnimator.prototype.constructor = FloatArrayAnimator;

FloatArrayAnimator.prototype.calculate = function (ratio) {
	var op = [];
	for (var i = 0; i < v0.length; i++)
		op[i] = ratio * this.v1[i] + (1 - ratio) * this.v0[i];
		
	return op;
}


function MobiusAnimator(object, duration, v1) {
	this.object = object;
    this.duration = duration;
    this.v0 = window[this.object];
    this.v1 = v1;
    
    this.startTime = new Date().getTime();
    MobiusAnimator.prototype.animators.push(this);
}

MobiusAnimator.prototype = new Animator();
MobiusAnimator.prototype.constructor = MobiusAnimator;

MobiusAnimator.prototype.calculate = function (ratio) {
		var transformedCenter = Complex.zero.transform(this.v0);
        var toCenter = Mobius.createDiscAutomorphism(transformedCenter, 0);
        var angle = Complex.one.scale(0.5).transform(this.v0).transform(toCenter).argument();
        return Mobius.multiply(
				Mobius.createDiscAutomorphism(transformedCenter.scale(ratio), 0),
				Mobius.createRotation(angle * ratio)
			);


//	return Mobius.add(this.v1.scale(ratio), this.v0.scale(1 - ratio));
}

