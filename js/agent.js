/**
 * Created by aghassaei on 9/8/14.
 */

var amorphNameSpace = amorphNameSpace || {};

function Agent(xPos, yPos, color){
    this.color = "#fff";
    if (color) this.color = color;
    this.radius = 10;
    this.position = [xPos, yPos];
    this.isAnimatingComm = false;
    this.neighborAgents = [];
    this.hopCounts = {};
    this.node1HopCount = null;
}

Agent.prototype.renderAgent = function(){
    if (this.renderedCircle){
        this.renderedCircle.remove();
        console.log("something is going wrong here");
    }
    var circle = amorphNameSpace.mainCanvas.circle(this.position[0], this.position[1], this.radius);
    circle.attr({"stroke":"#000", "fill":this.color});

    //bind click events to circle - clicking of dragging will remove from canvas
    var self = this;
    circle.click(function(){
        self.selectForRemoval();
    });

    this.renderedCircle = circle;
};

Agent.prototype.changePosition = function(xPos, yPos){
    this.position = [xPos, yPos];
    this.renderedCircle.transform("T" + this.position[0] + "," + this.position[1]);
};

Agent.prototype.changeColor = function(color){
    this.color = color;
    this.renderedCircle.attr("fill", this.color);
};

Agent.prototype.transmitData = function(){
    if (!this.neighborAgents || this.neighborAgents.length == 0){
        console.log("no neighbors");
        return;
    }
    var dataToTransmit = this.node1HopCount + 1;
    var self = this;
    $.each(self.neighborAgents, function(i, agent){
        agent.receiveData(dataToTransmit);
    });
};

//Agent.prototype.incrementCounts = function(hopCounts){
//    var newHopCounts = {};
//    for (var key in hopCounts){
//        if (hopCounts.hasOwnProperty(key)){
//            newHopCounts[key] = hopCounts[key]+1;
//        }
//    }
//    return newHopCounts;
//};

Agent.prototype.receiveData = function(hopCount){
    var shouldTransmitToNeighbors = false;
    if (hopCount>70) return;
    if (!this.node1HopCount){
        this.node1HopCount = hopCount;
        shouldTransmitToNeighbors = true;
        console.log(this.node1HopCount);
    }
//    for (var key in hopCounts){
//        if (hopCounts.hasOwnProperty(key)){
//            if (hopCounts[key]>50) return;
//            if (!this.hopCounts[key]){//|| this.hopCounts[key] > hopCounts[key]
//                this.hopCounts[key] = hopCounts[key];
//                shouldTransmitToNeighbors = true;
//                this.changeColor("#"+ this.hopCounts["node1"] + "00");
//            }
//        }
//    }
    if (shouldTransmitToNeighbors) {
        this.changeColor("#f00");
        this.transmitData();
    } else {
        this.changeColor("#0f0");
    }
};

Agent.prototype.selectForRemoval = function(){
    var self = this;
    //remove from neighbors
    $.each(this.neighborAgents, function(i, agent) {
        var indexToRemove = agent.neighborAgents.indexOf(self);
        agent.neighborAgents.splice(indexToRemove, 1);
    });
    var myIndex = amorphNameSpace.agents.indexOf(this);
    amorphNameSpace.agents.splice(myIndex, 1);
    this.destroy();
};

Agent.prototype.getAllNeighbors = function(){
    var neighbors = [];
    var self = this;
    //if dx^2+dy^2<=commRad^2
    var radSquared = Math.pow(amorphNameSpace.commRadius*this.radius, 2);//commRadius is really a scaling factor
    $.each(amorphNameSpace.agents, function(i, agent) {
        if (agent != self){
            if ((Math.pow(agent.position[0]-self.position[0], 2) + Math.pow(agent.position[1]-self.position[1], 2)) <= radSquared){
                neighbors.push(agent);
            }
        }
    });
    this.neighborAgents = neighbors;
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
                    self.isAnimatingComm = false;
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

Agent.prototype.animateNeighborCommunication = function(){
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
    this.neighborAgents = null;
}

