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
        amorphNameSpace.node1 = new Agent(20, amorphNameSpace.mainCanvas.height/2, "#f00")
        agents.push(amorphNameSpace.node1);
        amorphNameSpace.node2 = new Agent(amorphNameSpace.mainCanvas.width-20, amorphNameSpace.mainCanvas.height/2, "#f00");
        agents.push(amorphNameSpace.node2);

        //draw all agents on canvas
        $.each(agents, function(i, agent) {
            agent.renderAgent();
        });

        //begin communication among agents
        amorphNameSpace.dataConnection = setInterval(function(){
            $.each(agents, function(i, agent) {
                agent.transmitData();
            });
        } , 3000);


        return agents;
    };

    //init stuff - this should only run once
    amorphNameSpace.mainCanvas = Raphael(document.getElementById("mainWrapper"), 900, 500);//main canvas

});