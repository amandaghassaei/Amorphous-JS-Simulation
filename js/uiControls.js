/**
 * Created by aghassaei on 9/8/14.
 */

var amorphNameSpace = amorphNameSpace || {};

$(document).ready(function(){

    $(".slider").slider();

    $("#numAgents").on("slidechange", function(event, ui){
        amorphNameSpace.agents = amorphNameSpace.createAgentArray(getNumAgentsForSliderVal(ui.value));
    });

    $("#numAgents").slider('value',50);

    function getNumAgentsForSliderVal(val){
        return val*10+300;
    }

});