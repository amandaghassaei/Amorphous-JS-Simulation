/**
 * Created by aghassaei on 9/8/14.
 */

var amorphNameSpace = amorphNameSpace || {};

function Agent(xPos, yPos){
    this.color = "#fff";
    this.radius = 10;
    this.position = [xPos, yPos];
    this.isAnimatingComm = false;
}

Agent.prototype.renderAgent = function() {
    if (!this.renderedCircle){
        var circle = amorphNameSpace.mainCanvas.circle(this.position[0], this.position[1], this.radius);
        circle.attr("stroke", "#000");
        this.renderedCircle = circle;
    } else {
        this.renderedCircle.transform("T" + this.position[0] + "," + this.position[1]);
    }
    this.renderedCircle.attr("fill", this.color);

};

Agent.prototype.changePosition = function(xPos, yPos) {
    this.position = [xPos, yPos];
    this.renderAgent();
};

Agent.prototype.changeColor = function(color) {
    this.color = color;
    this.renderAgent();
};

Agent.prototype.transmitData = function() {
};

Agent.prototype.showNetworking = function(){
    if (this.isAnimatingComm) return;
    this.isAnimatingComm = true;
    this.shouldDoAnimation = true;//needed this to help with a timeout-related bug
    var self = this;
    setTimeout(function(){
        if (self.shouldDoAnimation){
            self.animateNeighborCommunication();
            self.neighborAnimation = setInterval(function(){
                if (self.shouldDoAnimation){
                    self.animateNeighborCommunication();
                } else {
                    clearInterval(self.neighborAnimation);
                    this.isAnimatingComm = false;
                }
            }, 3000);
        }
    }, Math.random()*3000);
};

Agent.prototype.hideNetworking = function(){
    if (this.neighborAnimation){
        clearInterval(this.neighborAnimation);
        this.neighborAnimation = null;
    }
    this.isAnimatingComm = false;
    this.shouldDoAnimation = false;
};

Agent.prototype.animateNeighborCommunication = function() {
    if (!this.neighborhood){
        this.neighborhood = amorphNameSpace.mainCanvas.circle(this.position[0], this.position[1], this.radius);
    }
    this.neighborhood.attr({"stroke-width":"0", "fill-opacity": "0.1"});
    var self = this;
    this.neighborhood.animate({'fill':'black', 'transform':"s" + amorphNameSpace.commRadius + " " + amorphNameSpace.commRadius}, 500, function(){
        self.neighborhood.animate({"fill-opacity":"0.0"}, 200, function(){
            self.neighborhood.transform("s1 1");
        });
    });
};

Agent.prototype.destroy = function(){
    if (this.dataConnection) {
        clearInterval(this.dataConnection);
        this.dataConnection = null;
    }
    this.hideNetworking();
    if (this.neighborhood){
        this.neighborhood.remove();
        this.neighborhood = null;
    }
    if (this.renderedCircle) {
        this.renderedCircle.remove();
        this.renderedCircle = null;
    }
}

