/**
 * Created by aghassaei on 9/8/14.
 */

var amorphNameSpace = amorphNameSpace || {};

$(document).ready(function(){

    $(".slider").slider();

    var commRadius = $("#commRadius");
    commRadius.on("slide", function(event, ui){
        amorphNameSpace.commRadius = ui.value/20.0+2;
    });
    commRadius.on("slidechange", function(event, ui){//recalc num neighbors on comm rad change
        amorphNameSpace.commRadius = ui.value/20.0+2;
        if (amorphNameSpace.agents){
            $.each(amorphNameSpace.agents, function(i, agent) {
                agent.getAllNeighbors();//make sure all references are lost
                agent.changeColor("#fff");
                agent.node1HopCount = null;
            });
            amorphNameSpace.startTransmissions();
        }
    });
    commRadius.on("slidestart", function(event, ui){
        for (var i=0;i<100;i++){//only show a random selection of 100 doing networking - too heavy otherwise
            if (amorphNameSpace.agents){
                amorphNameSpace.agents[i].showNetworking();
            }
        }
    });
    commRadius.on("slidestop", function(event, ui){
        if (amorphNameSpace.agents){
            $.each(amorphNameSpace.agents, function(i, agent) {
                agent.hideNetworking();
            });
        }
    });
    commRadius.slider('value',30);//set initial val

    var numAgents = $("#numAgents");
    numAgents.on("slidechange", function(event, ui){//recalc num agents on slider change
        if (amorphNameSpace.agents){
            $.each(amorphNameSpace.agents, function(i, agent) {
                agent.destroy();//make sure all references are lost
            });
        }
        amorphNameSpace.agents = amorphNameSpace.createAgentArray(ui.value*10+300);
        $.each(amorphNameSpace.agents, function(i, agent) {
            agent.getAllNeighbors();//make sure all references are lost
            agent.changeColor("#fff");
            agent.node1HopCount = null;
        });
        amorphNameSpace.startTransmissions();
    });
    numAgents.slider('value',50);//set initial val

});