/**
 * Created by aghassaei on 9/8/14.
 */

var amorphNameSpace = amorphNameSpace || {};

function Agent(xPos, yPos, color){
    this.id = parseInt(Math.random()*100000);//random id number
    this.successorId = null;
    this.state = false;//true if part of connection line

    this.color = "#fff";
    if (color) this.color = color;

    this.radius = 10;
    this.position = [xPos, yPos];//agent doesn't ever "use" this info, just for rendering

    this.isAnimatingComm = false;//bool used to deal with communication radius animation

    //neighbors and grad variables
    this.neighborAgents = [];
    this.hopCount = null;
}

Agent.prototype.renderAgent = function(){
    if (this.renderedCircle){
        this.renderedCircle.remove();
        console.log("something is going wrong here");
    }
    var circle = amorphNameSpace.mainCanvas.circle(this.position[0], this.position[1], this.radius);
    circle.attr({"stroke":"#000", "fill":this.color, "opacity":"0.6"});

    //bind click events to circle - clicking of dragging will remove from canvas
    var self = this;
    circle.click(function(){
        if (self == amorphNameSpace.node1 || self == amorphNameSpace.node2) return;
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
    var dataToTransmit = this.hopCount + 1;
    var self = this;
    $.each(self.neighborAgents, function(i, agent){
        agent.receiveData(dataToTransmit, self.id);
    });
};

Agent.prototype.receiveData = function(hopCount, successorId){
//    var shouldTransmitToNeighbors = false;
    if (hopCount>80) return;//avoid crashing the browser
    if (!this.hopCount || hopCount<this.hopCount){
        this.hopCount = hopCount;
        this.successorId = successorId;

        //transmit new hop to neighbors
        if (this == amorphNameSpace.node2){
            //if we've reached the end point
        } else {
            this.transmitData();
        }
    }
};

Agent.prototype.renderGrad = function(shouldShowGrad, scalingFactor){
    //create color based on hop count
    if (shouldShowGrad){
        if (!this.hopCount || this.hopCount==null) {
            this.changeColor("#fff");
            return;
        }
        var hopString = (parseInt(this.hopCount*scalingFactor)).toString(16);
        if (hopString.length == 1){
            hopString = "0" + hopString;
        }
        var newColor = "#00" + hopString + hopString;
        this.changeColor(newColor);
     } else {
        this.changeColor("#fff");
    }
};

Agent.prototype.selectForRemoval = function(){
    console.log(this.hopCount);
    var self = this;
    //remove from neighbors
    $.each(this.neighborAgents, function(i, agent) {
        var indexToRemove = agent.neighborAgents.indexOf(self);
        agent.neighborAgents.splice(indexToRemove, 1);
    });
    var myIndex = amorphNameSpace.agents.indexOf(this);
    amorphNameSpace.agents.splice(myIndex, 1);
    amorphNameSpace.startTransmissions();
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

