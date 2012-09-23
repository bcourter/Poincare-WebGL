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

FloatAnimator.prototype.evaluate = function () {
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
    
    ratio = 1 - (ratio - 1) * (ratio - 1)
    window[this.object] = ratio * this.v1 + (1 - ratio) * this.v0;
}


function MobiusAnimator(object, duration, mobius1) {
	this.object = object;
    this.duration = duration;
    this.mobius0 = window[this.object];
    this.mobius1 = mobius1;
    
    this.startTime = new Date().getTime();
    MobiusAnimator.prototype.animators.push(this);
}

MobiusAnimator.prototype = new Animator();
MobiusAnimator.prototype.constructor = MobiusAnimator;

MobiusAnimator.prototype.evaluate = function () {
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
    	
    	window[this.object] = this.mobius1;
    	return;
    }
    
    ratio = 1 - (ratio - 1) * (ratio - 1)
    window[this.object] = Mobius.add(this.mobius1.scale(ratio), this.mobius0.scale(1 - ratio));
}

