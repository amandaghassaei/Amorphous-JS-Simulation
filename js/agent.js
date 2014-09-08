/**
 * Created by aghassaei on 9/8/14.
 */

var amorphNameSpace = amorphNameSpace || {};

function Agent(xPos, yPos){
    this.color = "#fff";
    this.radius = 10;
    this.position = [xPos, yPos];


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
    console.log("amanda");
};

Agent.prototype.showNetworking = function(){
    var self = this;
    setTimeout(function(){
        self.animateNeightborCommunication();
        self.neighborAnimation = setInterval(function(){
            self.animateNeightborCommunication();
        }, 3000);
    }, Math.random()*3000);

//    clearInterval(this.neighborAnimation);
};

Agent.prototype.animateNeightborCommunication = function() {
    if (!this.neighborhood){
        this.neighborhood = amorphNameSpace.mainCanvas.circle(this.position[0], this.position[1], this.radius);
    }
    this.neighborhood.attr({"stroke-width":"0", "fill-opacity": "0.1"});
    var self = this;
    this.neighborhood.animate({'fill':'black', 'transform':"s4 4"}, 500, function(){
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
    if (this.neighborAnimation) {
        clearInterval(this.neighborAnimation);
        this.neighborAnimation = null;
    }
    if (this.neighborhood) {
        this.neighborhood.remove();
        this.neighborhood = null;
    }
    if (this.renderedCircle) {
        this.renderedCircle.remove();
        this.renderedCircle = null;
    }
}

