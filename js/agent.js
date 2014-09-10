/**
 * Created by aghassaei on 9/8/14.
 */

var amorphNameSpace = amorphNameSpace || {};

function Agent(xPos, yPos, state){
    this.id = parseInt(Math.random()*100000);//random id number
    this.successorId = null;
    this.state = false;//true if part of connection line
    if (state) this.state = state;

    this.color = "#fff";
    this.radius = 10;
    this.position = [xPos, yPos];//agent doesn't ever "use" this info, just for rendering
    this.absoluteTranslation = [0, 0];//only used for end nodes - stupid way raphael  does transformations

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

    //bind events to circle
    var self = this;
    if (self != amorphNameSpace.node1 && self != amorphNameSpace.node2){//never remove these!
        circle.click(function(){//clicking or dragging will remove from canvas
            self.selectForRemoval();
        });
//        circle.onDragOver(function(){
//            self.selectForRemoval();
//        });
    }
    circle.hover(function(){//hover will show info
        if (self.hopCountIndicator) self.hopCountIndicator.remove();
        self.hopCountIndicator = amorphNameSpace.mainCanvas.text(self.position[0], self.position[1]-14, self.hopCount);
    }, function(){
        if (self.hopCountIndicator) self.hopCountIndicator.remove();
    });
    if (self == amorphNameSpace.node1 || self == amorphNameSpace.node2){
        circle.drag(function(dx, dy){
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
            amorphNameSpace.startTransmissions();
        });
    }

    this.renderedCircle = circle;
};

Agent.prototype.changePosition = function(dx, dy){
    this.renderedCircle.transform("T" + (this.absoluteTranslation[0] + dx) + "," + (this.absoluteTranslation[1] + dy));
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
    if (this == amorphNameSpace.node1) return;//node 1 does not receive data
    if (hopCount>80) return;//avoid crashing the browser
    if (!this.hopCount || hopCount<this.hopCount){
        this.hopCount = hopCount;

        if (this.state){
            //if we've reached a node on the line
            var successor = this.findNeighborWithId(this.successorId);
            this.successorId = successorId;
            if (successor){//successor may have been removed
                successor.setNewState(false);
            }
            this.findNeighborWithId(successorId).setNewState(true);
        } else {
            //transmit new hop to neighbors
            this.successorId = successorId;
            this.transmitData();
        }
    }
};

Agent.prototype.findNeighborWithId = function(id){
    if (!id) return null;
    var successor = null;
    $.each(this.neighborAgents, function(i, agent) {
        if (agent.id == id) successor = agent;
    });
    return successor;
};

Agent.prototype.setNewState = function(state){
    if (this == amorphNameSpace.node1 || this == amorphNameSpace.node2) return;//do not change state of node1 or node 2
    if (state != this.state){//if the state is changing, be sure to relay these changes upstream
        this.state = state;
        var successor = this.findNeighborWithId(this.successorId);
        if (successor) successor.setNewState(state);
    }

};

Agent.prototype.renderGrad = function(shouldShowGrad, scalingFactor){
    //create color based on hop count
    if (shouldShowGrad){
        if (!this.hopCount) {
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
};