/**
 * Created by aghassaei on 9/8/14.
 */

var amorphNameSpace = amorphNameSpace || {};

function Agent(xPos, yPos){
    this.id = parseInt(Math.random()*100000);//random id number
    this.successorId = null;
    this.state = false;//true if part of connection line
    this.color = "#fff";
    this.transmissionNum = 0;//store num associated with last transmission, so you know whether to expire hop count

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
    circle.click(function(){//clicking or dragging will remove from canvas
        self.selectForRemoval();
    });
//        circle.onDragOver(function(){
//            self.selectForRemoval();
//        });
    circle.hover(function(){//hover will show info
        if (self.hopCountIndicator) self.hopCountIndicator.remove();
        self.hopCountIndicator = amorphNameSpace.mainCanvas.text(self.position[0], self.position[1]-14, self.hopCount);
    }, function(){
        if (self.hopCountIndicator) self.hopCountIndicator.remove();
    });
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
    var hopToTransmit = this.hopCount + 1;
    var transmissionNum = this.transmissionNum;
    var self = this;
    $.each(self.neighborAgents, function(i, agent){
        agent.receiveData(hopToTransmit, self.id, transmissionNum);
    });
};

Agent.prototype.receiveData = function(hopCount, successorId, transmissionNum){
    if (this == amorphNameSpace.node1) return;//node 1 does not receive data
    if (transmissionNum > this.transmissionNum) {
        this.transmissionNum = transmissionNum;
        this.hopCount = null;//expire last hop
    } else if (transmissionNum < this.transmissionNum){
        return;//old transmission, ignore this
    }
    if (hopCount>80) return;//avoid crashing the browser
    if (!this.hopCount || hopCount<this.hopCount){
        this.hopCount = hopCount;

        if (this.state && this.successorId && this.successorId != successorId){//if successor is changing - relay that up the line
            var successor = this.findNeighborWithId(this.successorId);
            if (successor) successor.setNewState(false);
        }
        this.successorId = successorId;

        if (this == amorphNameSpace.node2){//if we've reached a node on the line
            this.findNeighborWithId(successorId).setNewState(true);
        }
//        } else {//transmit new hop to neighbors
            //animate transmission of data
            var self = this;
            this.renderedCircle.animate({"fill":"grey"}, amorphNameSpace.animationSpeed, function(){
                self.transmitData();
                if (self.state){
                    self.changeColor("#f00");
                } else {
                    self.changeColor("#fff");
                }
            });
//        }
    }
};

Agent.prototype.findNeighborWithId = function(id){
    if (!id) return null;
    var successor = null;
    if (!this.neighborAgents) return successor;
    $.each(this.neighborAgents, function(i, agent) {
        if (agent.id == id) successor = agent;
    });
    return successor;
};

Agent.prototype.setNewState = function(state){
//    if (state != this.state){//if the state is changing, be sure to relay these changes upstream
        this.state = state;
        var self = this;
        var successor = this.findNeighborWithId(this.successorId);
        if (state) {
            this.changeColor("#f00");
            this.renderedCircle.animate({'fill':'#400'}, amorphNameSpace.animationSpeed, function(){
                self.changeColor("#f00");
                if (successor) successor.setNewState(state);
                if (self.stateTimeout) clearTimeout(self.stateTimeout);
                self.stateTimeout = setTimeout(function(){
                    self.state = false;
                    self.changeColor("#fff");
                }, 3000);//expire state
            });
        } else {
            if (this.stateTimeout) clearTimeout(this.stateTimeout);
            this.changeColor("#fff");
            this.renderedCircle.animate({'fill':'#f00'}, amorphNameSpace.animationSpeed, function(){
                if (successor) successor.setNewState(state);
            });
        }
//    }

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
    clearTimeout(this.stateTimeout);
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