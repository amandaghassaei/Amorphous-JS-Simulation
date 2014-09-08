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

        //draw all agents on canvas
        $.each(agents, function(i, agent) {
            agent.renderAgent();
        });
        return agents;
    }

    //init stuff - this should only run once
    amorphNameSpace.mainCanvas = Raphael(document.getElementById("mainWrapper"), 900, 500);//main canvas
    amorphNameSpace.agents = amorphNameSpace.createAgentArray(400);



    amorphNameSpace.agents[0].changePosition(300,300);
    amorphNameSpace.agents[0].changeColor("#f00");



});