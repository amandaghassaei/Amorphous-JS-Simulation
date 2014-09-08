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

