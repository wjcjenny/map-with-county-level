
$(document).ready(function(){
	"use strict";
var pymChild = new pym.Child();
      
            
// buttons 
	$('.bttn').click(function() {
		$( ".bttn" ).removeClass( 'active');
		$( this ).addClass( 'active');
	});
	
	var whichItem = "poverty";
	var dataText = "Number of poverty people: ";
	
    var svgpoverty = d3.select("#superContainer")
            				.append("svg")
							.attr('class', 'svgMap')
            				.attr('width', '100%')
							.append('g');
    var tooltip = d3.select("body").append("div") 
        .attr("class", "tooltip")       
        .style("opacity", 0);



        
//~~~~~~map~~~~~~
var draw = function(data_source){

	// combine dataset
    function combineData(geojson_data, csv_data, geojson_key, csv_key) {
        geojson_data['features'].forEach( function(d_json) {
            csv_data.forEach( function(d_csv) {
                if(d_json['properties'][geojson_key] == d_csv[csv_key])
                Object.keys(d_csv).forEach( function(key) { d_json['properties'][key] = d_csv[key]; });
            });
        });
    }

	// load dataset     
	queue()
		.defer(d3.json, "data/us-counties.json")
        // .defer(d3.json, "data/us-counties-old-topo.json")
		.defer(d3.csv, data_source)
		.await( function(error, data, csv_data) {
    		csv_data = csv_data.filter( function(d) {
    		  return d['poverty'] != "N"
    		});

            combineData(data, csv_data, "GEO_ID", "GEO.id");

           
        
         	// draw map here   
			d3.select(window)
	   		.on("resize", sizeChange);
		
			var color_scale;
			var dataVar;
            var counties = data['features'];
            var mappoverty = svgpoverty.append("g");
            var projection = d3.geo.albersUsa()
            					.scale(1100)

            var path = d3.geo.path()
            				.projection(projection);
		  


                
			if (whichItem == "poverty") {
            	color_scale = d3.scale.linear()
            					.domain([0,3000,4000,5000,10000,50000,100000,200000,2000000])
            					.range(["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"]);
				dataVar = 'poverty';
				dataText = "Estimate of people of all ages: ";
			} else if (whichItem == "highschool"){
				dataVar = 'highschool';
				dataText = "Pct of people hold high school diploma: ";
				color_scale = d3.scale.linear()
							.domain([0,20,25,30,40,100])
							.range(["#f1eef6","#bdc9e1","#74a9cf","#2b8cbe","#045a8d"]);
			} else {
				color_scale = d3.scale.linear()
                            .domain([0,20,25,30,40,100])
							// .domain([0,25,30,33,40,100])
							.range(["#f1eef6","#bdc9e1","#74a9cf","#2b8cbe","#045a8d"]);
				dataVar = 'bachelor';
				dataText = "Pct of people hold bachelor diploma: ";
			}
            


            mappoverty.selectAll("path")
            	.data(counties)
            	.enter()
            	.append("path")
            	.attr('d', path)
                .style('stroke', '#FFFFFF')
                .style('stroke-width', 0.5)
                .style('fill', '#e1e1e1')
                .style('fill', function(d) {
        			if (d['properties'][dataVar] != undefined) {  
        				return color_scale(d['properties'][dataVar])
        			} else {
        				return "white"
        			};
                });

            svgpoverty.selectAll("path")
                .on('mouseover', function(d) {
                	d3.select(this)
                        .transition()
                        .style('fill', function(d) {
                        	if (d['properties'][dataVar] == NaN) {
                            	return '#e1e1e1'
                            } else {
                            	return '#102039'
                           	};
                        })
                    
                    tooltip.transition()    
                            .duration(200)    
                            .style("opacity", 1);    
                    tooltip.html('<span class="focusstate">'+d['properties']['county']+', '+d['properties']['state']+'</span><br />'+dataText
                            +'<span class="focusnumber">'+d['properties'][dataVar]+'</span>') 
                            .style("left", (d3.event.pageX +10) + "px")   
                            .style("top", (d3.event.pageY +20) + "px")
                            .style('visibility','visible');  
                })
                .on("mouseout", function(d) {
                    d3.select(this)
                        .transition()
                        .style('fill', function(d) {
                            if (d['properties'][dataVar] != undefined) {
                                return color_scale(d['properties'][dataVar])
                            } else {
                                return "#FFFFFF";
                            }
                        });  
                    tooltip.transition()
                    .style('visibility','hidden')  
                    .duration(500)    
                    .style("opacity", 0); 
                });


        
        });
// ~~~~~end of graphic1~~~~~~//
	function sizeChange() {
	    d3.select("g")
	    	.attr("transform", "scale(" + $("#superContainer")
	    	.width()/880 + ")");
	    $(".svgMap").height($("#superContainer").width()*0.618);
        // 800 0.618
	}
};



    
        

draw("data/data-poverty.csv");


var container = "#superContainer";
function loading(){
	d3.select("g")
	.attr("transform", "scale(" + $(container)
	.width()/880 + ")");
	$(".svgMap").height($(container).width()*0.618);
}

loading();


$('#rect0').click(function(){
	whichItem = 'poverty';
    draw("data/data-poverty.csv");
});	

$('#rect1').click(function(){
	whichItem = 'highschool';	
	draw("data/data-education.csv");
});

$('#rect2').click(function(){
	whichItem = 'bachelor';
	draw("data/data-education.csv");
});


//below for state boundary
function drawstate(){
    var projection = d3.geo.albersUsa()
                        .scale(1100)

    var path = d3.geo.path()
                .projection(projection);
    var mappoverty = svgpoverty.append("g");

    d3.json("data/us-states.json", function(json) {
        svgpoverty.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#f03b20")
            .style("stroke-width", "2")
            .style("fill","none")
    });
}
drawstate();
//end for state boundary


});
  