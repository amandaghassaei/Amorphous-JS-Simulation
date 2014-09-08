/**
 * Created by aghassaei on 9/8/14.
 */

var amorphNameSpace = amorphNameSpace || {};

$(document).ready(function(){

    $(".slider").slider();


    var numAgents = $("#numAgents");
    numAgents.on("slidechange", function(event, ui){//recalc num agents on slider change
        if (amorphNameSpace.agents){
            $.each(amorphNameSpace.agents, function(i, agent) {
                agent.destroy();//make sure all references are lost
            });
        }
        amorphNameSpace.agents = amorphNameSpace.createAgentArray(ui.value*10+300);
    });
    numAgents.slider('value',50);//set initial val

    var commRadius = $("#commRadius");
    commRadius.on("slidestart", function(event, ui){
        for (var i=0;i<100;i++){//only show a random selection of 100 doing networking - too heavy otherwise
            amorphNameSpace.agents[i].showNetworking();
        }
    });
    commRadius.on("slidestop", function(event, ui){
        $.each(amorphNameSpace.agents, function(i, agent) {
            agent.hideNetworking();
        });
    });
    commRadius.on("slide", function(event, ui){
        amorphNameSpace.commRadius = ui.value/20.0+2;
    });
    commRadius.on("slidechange", function(event, ui){//recalc num agents on slider change
        amorphNameSpace.commRadius = ui.value/20.0+2;
    });
    commRadius.slider('value',30);//set initial val

});