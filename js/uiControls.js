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

});