/**
 * Created by aghassaei on 9/8/14.
 */

var amorphNameSpace = amorphNameSpace || {};

$(document).ready(function(){

    $(".slider").slider();


    var numAgents = $("#numAgents");
    numAgents.on("slidechange", function(event, ui){//recalc num agents on slider change
        amorphNameSpace.agents = amorphNameSpace.createAgentArray(ui.value*10+300);
    });
    numAgents.slider('value',50);//set initial val

});