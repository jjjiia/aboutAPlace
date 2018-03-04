//get rid of dropdown
//highlight place
//make layer for each criteria with slider
//filter 1 additional layer for overlays
//make list of similar places to display - make grid?

$(function() {
  	queue()
      .defer(d3.csv,"census_percent_2places_selected.csv")
      .defer(d3.csv,"geo_names.csv")
      .defer(d3.json,"census_keys_short.json")
      .defer(d3.json,"deviation.json")
      .defer(d3.json,"minMax.json")
      .defer(d3.json,"histogram.json")
      .await(dataDidLoad);
  })
//var colors = ["#c1d098","#7dde49","#6b7b3e","#cbcf49","#69b95a","#d39433","#2679a7","#b38f60","#4a81e7","#6edc50","#56e1a6","#549735","#279564","#2367b7"]
var colors = ["#a5573a",
"#74b74b",
"#4699b8",
"#e19680",
"#9d5b50",
"#c69442",
"#4bb193",
"#cb5842"]
//var categoriesToMap =["T002_002","T007_002","T007_013","T056_002","T056_017","T157_001"]
var categoriesToMap =["T002_002","T056_002","T056_017","T157_001"]
var dataDictionary = {}
var clickCount = 0
var currentCategory = "T002_002"
var notPercentCategories = ["T057_001","T059_001","T083_001","T147_001","T002_001","T002_002","T002_003","T157_001"]
var tractNames =null
var deviation = null
var minMax = null
var histogram = null
var url = {
    lat:null,
    lng:null,
    zoom:null,
    clicks:{}
} 
var totalMatches = {}

//var clicks = {}

function getUrl(){    
    var hash = window.location.hash.replace("#","").split("%")
    if(hash.length<=1){
        url.lng = -98
        url.lat = 38.88
        url.zoom = 4
        url.clicks = {}
    }
    else{
 //       console.log(hash)
        url.lng = hash[2]
        url.lat = hash[1]
        url.zoom = hash[0]
        url.clicks = JSON.parse(hash[3])
        clickCount = parseInt(Object.keys(url.clicks)[Object.keys(url.clicks).length-1])
        if(isNaN(clickCount)==true){
            clickCount = 0
        }
        var clicksString = JSON.stringify(url.clicks)
    }
    
    window.location.hash = url.zoom+"%"+url.lat+"%"+url.lng+"%"+clicksString
}	
function updateUrl(map){
       url.zoom = Math.round(map.getZoom()*100)/100
       url.lat = Math.round(map.getCenter().lat*100)/100
       url.lng = Math.round(map.getCenter().lng*100)/100
    
     var clicksString = JSON.stringify(url.clicks)
    window.location.hash = url.zoom+"%"+url.lat+"%"+url.lng+"%"+clicksString
  //  console.log(clicksUrl)
//       window.location.hash = JSON.stringify([url.center,url.zoom])   
  //  url.center = currentHash[0]
  //  url.zoom = currentHash.split("_")[1]
  //  console.log(["from hash",url.center,url.zoom])
}

function dataDidLoad(error,censusData,geoNames,keys,deviationFile,minMaxFile,histogramFile){
   // getUrl()
    
    dataDictionary = keys
    deviation = deviationFile
    tractNames = makeGeoNamesDict(geoNames)
    minMax = minMaxFile
    histogram = histogramFile
    var notDropdown = ["T002_001","T002_003","T004_001","T005_001","T007_001","T013_001","T025_001","T030_001","T050_001","T053_001","T056_001","T078_001","T080_001","T081_001","T094_001","T108_001","T182_001","T139_001","T145_001"]
    
   
    setupMap(censusData)
}
function makeGeoNamesDict(geoNames){
    var formatted = {}
    for(var g in geoNames){
        var geoName = geoNames[g]["Geo_NAME"]
        var geoId = geoNames[g]["Geo_GEOID"]
        formatted[geoId]=geoName
    }
    return formatted
}

function setupMap(censusData){
    mapboxgl.accessToken = 'pk.eyJ1IjoiampqaWlhMTIzIiwiYSI6ImNpbDQ0Z2s1OTN1N3R1eWtzNTVrd29lMDIifQ.gSWjNbBSpIFzDXU2X5YCiQ';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/jjjiia123/cjdurroku5gm62sonjjyahriu',
        center: [url.lng,url.lat],
        minZoom: 4,
        zoom: url.zoom
    });
    map.addControl(new MapboxGeocoder({
        accessToken: mapboxgl.accessToken
    }));
    map.on("move",function(){
        updateUrl(map)
           
    })
    map.on('load', function() {        
        d3.select("#loader").remove()
        d3.select("#zoomOut")
        .on("mouseover",function(){
            d3.select("#zoomOut").style("background-color","rgba(120, 219, 83,1)")
        })
        .on("click",function(){
            map.flyTo({
                center: [-98, 38.88],
                zoom: 4
                });
        })
        .on("mouseout",function(){
            d3.select("#zoomOut").style("background-color","rgba(255,255,255,1)")
        })
        
        
        map.addControl(new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true
        }));
        map.addSource('tractseast',{
            "type":"geojson",
            "data":'https://raw.githubusercontent.com/jjjiia/alike/master/east.geojson'
        })
        map.addSource('tractswest',{
            "type":"geojson",
            "data":'https://raw.githubusercontent.com/jjjiia/alike/master/west.geojson'
        })
        map.on("click",  "tracts", function(e) {
            
            d3.selectAll(".clickText").remove()
            d3.selectAll(".clickText2").remove()
            var layers = map.getStyle().layers
            for(var l in layers){
               var layerName = layers[l].id
               if(layerName.split("_")[1]=="filtered" ||layerName.split("_")[1]=="highlight" ||layerName.split("_")[1]=="matches"){
                   map.removeLayer(layerName)
               }
           }
            console.log(layers)
                
            var gid = e.features[0].properties[ "AFFGEOID"]
            filterTargetGeo(map,gid,code)
            
            for(var i in categoriesToMap){
                
                var code = categoriesToMap[i]
                var title = dataDictionary[code]
               addTracts(map,censusData,"west",code)
               addTracts(map,censusData,"east",code)
                 var gidShort = gid.replace("1400000US","14000US")
                 getMatches(gidShort,censusData,map,code,2)                
            }
        absoluteMatches(map)
            
        })
    });
}
function addTracts(map,censusData,ew,code){
     map.addLayer({
             "id": "tracts_filtered_"+ew+"_"+code,
             "type": "fill",
            "source": 'tracts'+ew,
             "paint": {
                 "fill-outline-color": colors[categoriesToMap.indexOf(code)],
                     "fill-color": colors[categoriesToMap.indexOf(code)],
                 "fill-opacity":.2
             },
             "filter": ["in", "FIPS", ""]
         },"road_major_label")      
} 
function filterTargetGeo(map,gid,code) {  
      map.addLayer({
                      "id": "tracts_highlight_west_clicked",
                      "type": "fill",
                     "source": 'tractswest',
                      "paint": {
                          "fill-outline-color": "#000",
                          "fill-color":"#000",
                      },
                      "filter": ["in", "FIPS", ""]
                  })     
      map.addLayer({
                      "id": "tracts_highlight_east_clicked",
                      "type": "fill",
                     "source": 'tractseast',
                      "paint": {
                          "fill-outline-color": "#000",
                              "fill-color": "#000",
                      },
                      "filter": ["in", "FIPS", ""]
                  }) 
     map.setFilter("tracts_highlight_east_clicked", ["==",  "AFFGEOID", gid]);
     map.setFilter("tracts_highlight_west_clicked", ["==",  "AFFGEOID", gid]);
}

function getMatches(gid,census,map,code,threshold){
//    console.log(["getMatches",click])
    var category = "SE_"+code
    //var threshold = 10//in percent    
   // var threshold = 10//deviation[category]
   // console.log(category)
    var matchedId = census.filter(function(el){
       // console.log(el)
        if(el["Gid"]==gid){
            return el
        }
    })
    var value= parseFloat(matchedId[0][category])
  //  var minT = value*.9
  //  var maxT = value*1.1

    var maxT = Math.round(value*1.2*100)/100//(minMax[category].max-value)/10+value
    //if(code == "T002_002"){
    //     maxTs
    //}
    var minT = Math.round(value*1/1.2*100)/100//value-(value-minMax[category].min)/10
    
    console.log(value)
    console.log([maxT,minT])
    var gidName = tractNames[matchedId[0].Gid]
    var filteredData = filterByData(census,maxT,minT,category,value)
    
    var filteredStats = calculateFiltered(filteredData,category)
    var text = "<strong>"+dataDictionary[code]
    +"</strong><br/>"
    var text2 = translateStats(filteredStats,threshold)
    var click = 0
  
    d3.select("#title").html("THIS PLACE: "+gidName)

    d3.select("#text").append("div")
        .attr("class","clickText text_"+code)
        .html(text)
        .style("color",colors[categoriesToMap.indexOf(code)])    
    d3.select("#text").append("div")
        .attr("class","clickText2 slider_"+code)
    d3.select("#text").append("div")
        .attr("class","clickText2 text2_"+code)
        .html(text2)
        .style("color",colors[categoriesToMap.indexOf(code)])
        
    slider(gid,value,category,map,census,code,maxT,minT)
    //histo(gid,value,category)  
    filterMap(filteredData,map,code)
}
function slider(gid,value,category,map,census,code,maxT,minT){
    var margin = {right: 40, left: 40}
    var width = $("#text").innerWidth()
    var svg = d3.select(".slider_"+code)
        .append("svg")
        .attr("width",width-margin.left)
        .attr("height",30)
        .attr("transform","translate("+margin.right+","+0+")")
    var svgwidth = +svg.attr("width") - margin.left - margin.right
    var svgheight = +svg.attr("height");
    var max = minMax[category].max
    var min = minMax[category].min
    var x = d3.scaleLinear().domain([min, max]).range([0, svgwidth]).clamp(true);
    var xR = d3.scaleLinear().domain([value, max]).range([x(value), svgwidth]).clamp(true);
    var xL = d3.scaleLinear().domain([min, value]).range([0, x(value)]).clamp(true);
    
    var minLabel = svg.append("text")
                    .text(min)
                    .attr("x",function(){return x(min)})
                    .attr("y",30)        
    var maxLabel = svg.append("text")
                    .text(max)
                    .attr("x",function(){return x(max)})
                    .attr("y",30)    
                    .attr("text-anchor","end")
    
    var valueLabel = svg.append("text")
                    .text(value)
                    .attr("x",function(){return x(value)})
                    .attr("y",8)    
                    .attr("text-anchor","start")
                    .style("fill",colors[categoriesToMap.indexOf(code)])
        
    var sliderPositionR = x.invert(maxT)
    var sliderPositionL = x.invert(minT)
      
    var valueMarker = svg.append("rect").attr("height",10).attr("width",2)
        .attr("x",x(value)-1).attr("y",10)
        .style("fill",colors[categoriesToMap.indexOf(code)])
    
    var sliderHightlightL = svg.append("rect")
        .attr("class","sliderHighlight")
        .attr("height",10)
    .attr("width",x(value)-x(minT))
        .attr("x",x(minT))//x(sliderPositionL))
        .attr("y",10)
        .style("fill",colors[categoriesToMap.indexOf(code)])
        .style("opacity",.5)
    
    var sliderHightlightR = svg.append("rect")
        .attr("class","sliderHighlight")
        .attr("height",10)
        .attr("width",x(maxT)-x(value))
        .attr("x",x(value))//x(sliderPositionL))
        .attr("y",10)
        .style("fill",colors[categoriesToMap.indexOf(code)])
        .style("opacity",.5)
    
    var sliderR = svg.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + 0 + "," + svgheight / 2 + ")");
        
    var sliderL = svg.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + 0 + "," + svgheight / 2 + ")");
       
    var handleR = sliderR.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 5)
        .style("fill",colors[categoriesToMap.indexOf(code)])
        .attr("cx", x(maxT))
        
    var handleL = sliderL.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 5)
        .style("fill",colors[categoriesToMap.indexOf(code)])
        .attr("cx", x(minT))   
        
        
    
    sliderL.append("line")
        .attr("class", "trackL")
        .attr("x1", xL.range()[0])
        .attr("x2", xL.range()[1])
        .select(function() { 
            return this.parentNode.appendChild(this.cloneNode(true)); 
        })
        .attr("class", "track-inset")
        .select(function() { 
            return this.parentNode.appendChild(this.cloneNode(true)); 
        })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start drag", function() { 
                sliderPositionL = x.invert(d3.event.x)
                if(sliderPositionL>value){
                    sliderPositionL = value
                }
                handleL.attr("cx", x(sliderPositionL)) 
                sliderHightlightL.attr("x",xL(sliderPositionL)).attr("width",x(value)-xL(sliderPositionL))               
           // })
           // .on("end",function(){
                var filteredData = filterByData(census,sliderPositionR,sliderPositionL,category,value)
              //  console.log([sliderPositionR,sliderPositionL,filteredData.length])
                filterMap(filteredData,map,code)
                absoluteMatches(map)
                var filteredStats = calculateFiltered(filteredData,category)
                d3.select(".text2_"+code)
                    .html(translateStats(filteredStats))
                    .style("color",colors[categoriesToMap.indexOf(code)])
            })
        ); 
    sliderR.append("line")
        .attr("class", "trackR")
        .attr("x1", xR.range()[0])
        .attr("x2", xR.range()[1])
        .select(function() { 
            return this.parentNode.appendChild(this.cloneNode(true)); 
        })
        .attr("class", "track-inset")
        .select(function() { 
            return this.parentNode.appendChild(this.cloneNode(true)); 
        })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start drag", function() { 
                sliderPositionR = x.invert(d3.event.x)
                if(sliderPositionR<value){
                    sliderPositionR = value
                }
                handleR.attr("cx", xR(sliderPositionR)) 
                sliderHightlightR.attr("width",x(sliderPositionR)-x(value))      
            })
            .on("end",function(){
                var filteredData = filterByData(census,sliderPositionR,sliderPositionL,category,value)
                filterMap(filteredData,map,code)
                absoluteMatches(map)
                var filteredStats = calculateFiltered(filteredData,category)

                d3.select(".text2_"+code)
                    .html(translateStats(filteredStats))
                    .style("color",colors[categoriesToMap.indexOf(code)])
                
            })
        ); 
          
}
function histo(gid,value,category){
    var array = new Array(100);
    var xmin = minMax[category].min
    var xmax = minMax[category].max
    var ymax = d3.max(d3.values(histogram[category])); 
    var width = $("#text").innerWidth()
    var height = 100
    var margin = 20
    var segment = histogram[category].segment
    var sd = deviation[category]
    var x = d3.scaleLinear().domain([0,100]).range([0,width-margin*3])
    var c = d3.scaleLinear().domain([xmin,xmax]).range([0,1])
    var y = d3.scaleLinear().domain([0,ymax]).range([height-margin*2,0])
   
    var line = d3.line()
    .x(function(d,i){
        return x(i)
    })
    .y(function(d,i){
        return y(histogram[category][i])
    })
    
    //var svg = d3.select(".text_"+clickCount)
    var svg = d3.select(".text_"+clickCount)
        .append("svg")
        .attr("width",width)
        .attr("height",height)
       // .attr("class","slider_"+clickCount)
    var g = svg.append("g").attr("transform", "translate(" + margin*2 + "," + margin + ")");
    g.append("g")
          .attr("transform", "translate(0," + (height-margin*2) + ")")
          .call(d3.axisBottom(x)
                .ticks(3)
                .tickFormat(function(d){return Math.round(d*segment)}))
        .select(".domain")

    g.append("g")
        .call(d3.axisLeft(y).ticks(3))
         .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 2)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("tracts");
        
    g.append("path")
       .datum(array)
        .attr("class","histogram")
        .attr("fill","none")
        .attr("stroke","black")
        .attr("d",line)
    
    g.append("rect")
        .attr("height",height-margin)
        .attr("width",function(){
            return x(2)
        })
        .attr("x",function(d,i){
            return 5
            return x((value-1)*segment)
        })
        .attr("y",0)
        .attr("fill",colors[clickCount%(colors.length-1)])
        .attr("opacity",.5)
}
function filterMap(filteredData,map,code){
    var gids = []
    for(var i in filteredData){
        var gid = filteredData[i]["Gid"].replace("14000US","1400000US")
        gids.push(gid)
    }
    totalMatches[code]=gids
    
    var filter = ["in","AFFGEOID"].concat(gids)
    map.setFilter("tracts_filtered_west"+"_"+code, filter);
    map.setFilter("tracts_filtered_east"+"_"+code, filter);
}
function translateStats(filteredStats){
    text = filteredStats["tracts"]+" tracts are between "+Math.round(filteredStats["min"]*100)/100+" and "+Math.round(filteredStats["max"]*100)/100+"<br/>"
    text = text+"containing: "+filteredStats["T002_001"]+" people, &"+filteredStats["T002_003"]+" sq.mi."
    return text
}
function calculateFiltered(filteredData,category){
    var max = d3.max(filteredData,function(d){
        return d[category]
    }); 
    var min = d3.min(filteredData,function(d){
        return d[category]
    }); 
    var columnsToSum = ["T002_001","T002_003"]
    var totals = [318558162,3532068.72]//total pop,total area
    var formatted = {}
    for(var i in columnsToSum){
        var c = columnsToSum[i]
        var sum = d3.sum(filteredData, function(d){
            return d["SE_"+c];});  
            var percent = (Math.round(sum/totals[i]*10000)/100).toLocaleString()
        formatted[c]=Math.round(sum).toLocaleString()+"("+percent+"%)"
       // formatted[c+"_p"]=(Math.round(sum/totals[i]*10000)/100).toLocaleString()
    }
    formatted["tracts"]=filteredData.length
    formatted["max"]=max
    formatted["min"]=min
    return formatted
}

function filterByData(census,max,min,category,value){
    var withinThreshold = census.filter(function(el){
            if(el[category]<max && el[category]>min){
                return el["Gid"]
            }
    })
    return withinThreshold
}
function absoluteMatches(map){
    var matchesArray =[]
    for(var i in totalMatches){
        matchesArray = matchesArray.concat(totalMatches[i])
    }
    matchesArray.sort();
    var arrayCounts = {}

    var current = null;
    var cnt = 0;
    for (var i = 0; i < matchesArray.length; i++) {
        if (matchesArray[i] != current) {
            if (cnt > 0) {
                var arrayCountsKeys = Object.keys(arrayCounts)
               // console.log([arrayCountsKeys,cnt])
                var cntKey = String(cnt)
                if (arrayCountsKeys.indexOf(cntKey)==-1){
                    arrayCounts[cntKey]=[]
                    arrayCounts[cntKey].push(current)
                }else{
                    arrayCounts[cntKey].push(current)
                }
            }
            current = matchesArray[i];
            cnt = 1;
        } else {
            cnt++;
        }
    }
    var newText = ""
    for(var t in arrayCounts){
        var count = String(t)
        if(t == 6){ count = String(t-1)}
        newText += arrayCounts[String(t)].length+" Tracts in "+ String(t)+" ways, "
    }
    d3.select("#title2").html("is like "+newText)
 //   addTotalMatches(map)
 //   var filter = ["in","AFFGEOID"].concat(arrayCounts[(Object.keys(arrayCounts)).length-1])
 //  map.setFilter("tracts_matches_west", filter);
 //  map.setFilter("tracts_matches_east", filter);
}
function addTotalMatches(map){
    
     map.addLayer({
             "id": "tracts_matches_east",
             "type": "fill",
            "source": 'tractseast',
             "paint": {
                 "fill-outline-color": "rgba(0,0,0,.5)",
                 "fill-color": "rgba(0,0,0,.5)",
             },
             "filter": ["in", "FIPS", ""]
         },"road_major_label")    
     map.addLayer({
             "id": "tracts_matches_west",
             "type": "fill",
            "source": 'tractswest',
             "paint": {
                 "fill-outline-color": "rgba(0,0,0,.5)",
                 "fill-color": "rgba(0,0,0,.5)",
             },
             "filter": ["in", "FIPS", ""]
         },"road_major_label")      
} 