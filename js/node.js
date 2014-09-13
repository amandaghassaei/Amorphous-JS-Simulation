/**
 * Created by aghassaei on 9/8/14.
 */

function Node(xPos, yPos) {
    Agent.apply(this, [xPos, yPos]);
    this.state = true;
    this.color = "f00";
}
Node.prototype = new Agent();//subclass of agent

Node.prototype.startTransmissions = function(){
    this.transmissionNum++;
    this.hopCount = 0;
    this.transmitData();//start data transmission from node 1
};

Node.prototype.renderAgent = function(){
    Agent.prototype.renderAgent.call(this);
    var self = this;
    this.renderedCircle.drag(function(dx, dy){
        self.changePosition(dx, dy);
    }, function(){
        if (self.hopCountIndicator) self.hopCountIndicator.remove();
    }, function(){
        self.absoluteTranslation[0] = self.absoluteTranslation[0] + self.renderedCircle.getBBox()["x"] + self.radius - self.position[0];
        self.absoluteTranslation[1] = self.absoluteTranslation[1] + self.renderedCircle.getBBox()["y"] + self.radius - self.position[1];
        self.position[0] = self.renderedCircle.getBBox()["x"] + self.radius;
        self.position[1] = self.renderedCircle.getBBox()["y"] + self.radius;
        $.each(amorphNameSpace.agents, function(i, agent) {
            agent.getAllNeighbors();//make sure all references are lost
        });
    });
};

Node.prototype.selectForRemoval = function(){
    //never remove nodes
};

Node.prototype.setNewState = function(state){
    //never set new state
};

