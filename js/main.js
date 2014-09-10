/**
 * Created by aghassaei on 9/8/14.
 */

var amorphNameSpace = amorphNameSpace || {};

$(document).ready(function(){

    amorphNameSpace.createAgentArray = function(numAgents){
        amorphNameSpace.mainCanvas.clear();//clear any items off the canvas
        var agents = [];//array of free agents - these will be represented by colored circles

        //make two special agents that we will draw a line between - be sure these are at front of array so they don't get removed
        amorphNameSpace.node1 = new Agent(20, amorphNameSpace.mainCanvas.height/2, true);
        agents.push(amorphNameSpace.node1);
        amorphNameSpace.node2 = new Agent(amorphNameSpace.mainCanvas.width-20, amorphNameSpace.mainCanvas.height/2, true);
        agents.push(amorphNameSpace.node2);

        for (var i=0;i<numAgents;i++){
            var xPos = parseInt(Math.random()*amorphNameSpace.mainCanvas.width);
            var yPos = parseInt(Math.random()*amorphNameSpace.mainCanvas.height);
            agents.push(new Agent(xPos, yPos));
        }

        //draw all agents on canvas
        $.each(agents, function(i, agent) {
            agent.renderAgent();
        });
        //bring end nodes to front
        amorphNameSpace.node1.renderedCircle.toFront();
        amorphNameSpace.node2.renderedCircle.toFront();

        return agents;
    };

    amorphNameSpace.changeAgentArraySize = function(newSize){
        if (newSize>amorphNameSpace.agents.length){
            for (var i=amorphNameSpace.agents.length;i<newSize;i++){
                var xPos = parseInt(Math.random()*amorphNameSpace.mainCanvas.width);
                var yPos = parseInt(Math.random()*amorphNameSpace.mainCanvas.height);
                var agent = new Agent(xPos, yPos);
                agent.renderAgent();
                amorphNameSpace.agents.push(agent);
            }
            //bring end nodes to front
            amorphNameSpace.node1.renderedCircle.toFront();
            amorphNameSpace.node2.renderedCircle.toFront();
        } else {
            for (var j=amorphNameSpace.agents.length-1;j>=newSize;j--){
                amorphNameSpace.agents[j].destroy();
                amorphNameSpace.agents.pop();
            }
        }
    };

    amorphNameSpace.startTransmissions = function(){

        //expire hop count - can I get rid of this?
        $.each(amorphNameSpace.agents, function(i, agent) {
            agent.hopCount = null;
        });

        amorphNameSpace.node1.state = true;
        amorphNameSpace.node2.state = true;
        amorphNameSpace.node1.hopCount = 0;
        amorphNameSpace.node1.transmitData();//start data transmission from node 1

        $.each(amorphNameSpace.agents, function(i, agent) {
            if (!agent.hopCount && agent != amorphNameSpace.node1 && agent != amorphNameSpace.node2){//find all islands
                agent.changeColor("#000");
            }
        });

    };

    amorphNameSpace.renderAllColors = function(){
        if (amorphNameSpace.shouldShowGrad){
            var maxHopCount = 0;
            $.each(amorphNameSpace.agents, function(i, agent) {
                if (agent.hopCount>maxHopCount) maxHopCount = agent.hopCount;
            });
            var scalingFactor = 255/maxHopCount;
            $.each(amorphNameSpace.agents, function(i, agent) {
                agent.renderGrad(true, scalingFactor);
            });
            $.each(amorphNameSpace.agents, function(i, agent) {
                if (agent.state) agent.changeColor("#f00");
            });
        } else {
            $.each(amorphNameSpace.agents, function(i, agent) {
                if (agent.state) {
                    agent.changeColor("#f00");
                } else {
                    agent.changeColor("#fff");
                }
            });
        }

    };

    //init stuff - this should only run once
    amorphNameSpace.mainCanvas = Raphael(document.getElementById("svgContainer"), 900, 500);//main canvas



});