/**
 * Created by aghassaei on 9/8/14.
 */

var amorphNameSpace = amorphNameSpace || {};

$(document).ready(function(){

    amorphNameSpace.createAgentArray = function(numAgents){
        amorphNameSpace.mainCanvas.clear();//clear any items off the canvas
        var agents = [];//array of free agents - these will be represented by colored circles

        for (var i=0;i<numAgents;i++){
            var xPos = parseInt(Math.random()*amorphNameSpace.mainCanvas.width);
            var yPos = parseInt(Math.random()*amorphNameSpace.mainCanvas.height);
            agents.push(new Agent(xPos, yPos));
        }

        //make two special agents that we will draw a line between - agents[-1] and agents[-2]
        amorphNameSpace.node1 = new Agent(20, amorphNameSpace.mainCanvas.height/2, true);
        agents.push(amorphNameSpace.node1);
        amorphNameSpace.node2 = new Agent(amorphNameSpace.mainCanvas.width-20, amorphNameSpace.mainCanvas.height/2, true);
        agents.push(amorphNameSpace.node2);

        //draw all agents on canvas
        $.each(agents, function(i, agent) {
            agent.renderAgent();
        });

        return agents;
    };

    amorphNameSpace.startTransmissions = function(){

        //expire hop count - can I get rid of this?
        $.each(amorphNameSpace.agents, function(i, agent) {
            agent.hopCount = null;
            agent.state = false;
        });

        amorphNameSpace.node1.state = true;
        amorphNameSpace.node2.state = true;
        amorphNameSpace.node1.hopCount = 0;
        amorphNameSpace.node1.transmitData();//start data transmission from node 1

        //display grad
        amorphNameSpace.renderAllColors();
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
        }
        $.each(amorphNameSpace.agents, function(i, agent) {
            if (agent.state) {
                agent.changeColor("#f00");
            } else {
                agent.changeColor("#fff");
            }
        });
    };

    //init stuff - this should only run once
    amorphNameSpace.mainCanvas = Raphael(document.getElementById("mainWrapper"), 900, 500);//main canvas



});