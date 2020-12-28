function getStateNum(state){
    postalCodes = {
        "AL":"01",
        "AK":"02",
        "AZ":"04",
        "AR":"05",
        "CA":"06",
        "CO":"08",
        "CT":"09",
        "DE":"10",
        "FL":"12",
        "GA":"13",
        "HI":"15",
        "ID":"16",
        "IL":"17",
        "IN":"18",
        "IA":"19",
        "KS":"20",
        "KY":"21",
        "LA":"22",
        "ME":"23",
        "MD":"24",
        "MA":"25",
        "MI":"26",
        "MN":"27",
        "MS":"28",
        "MO":"29",
        "MT":"30",
        "NE":"31",
        "NV":"32",
        "NH":"33",
        "NJ":"34",
        "NM":"35",
        "NY":"36",
        "NC":"37",
        "ND":"38",
        "OH":"39",
        "OK":"40",
        "OR":"41",
        "PA":"42",
        "RI":"44",
        "SC":"45",
        "SD":"46",
        "TN":"47",
        "TX":"48",
        "UT":"49",
        "VT":"50",
        "VA":"51",
        "WA":"53",
        "WV":"54",
        "WI":"55",
        "WY":"56",
    }    
    return postalCodes[state]
}

function getStateName(state){
    states = {'01': 'Alabama', '02': 'Alaska', '04': 'Arizona', '05': 'Arkansas', '06': 'California', '08': 'Colorado', '09': 'Connecticut', '10': 'Delaware', '12': 'Florida', '13': 'Georgia', '15': 'Hawaii', '16': 'Idaho', '17': 'Illinois', '18': 'Indiana', '19': 'Iowa', '20': 'Kansas', '21': 'Kentucky', '22': 'Louisiana', '23': 'Maine', '24': 'Maryland', '25': 'Massachusetts', '26': 'Michigan', '27': 'Minnesota', '29': 'Missouri', '30': 'Montana', '31': 'Nebraska', '32': 'Nevada', '33': 'New Hampshire', '34': 'New Jersey', '35': 'New Mexico', '36': 'New York', '37': 'North Carolina', '38': 'North Dakota', '39': 'Ohio', '40': 'Oklahoma', '41': 'Oregon', '42': 'Pennsylvania', '44': 'Rhode Island', '45': 'South Carolina', '46': 'South Dakota', '47': 'Tennessee', '48': 'Texas', '49': 'Utah', '50': 'Vermont', '51': 'Virginia', '53': 'Washington', '54': 'West Virginia', '55': 'Wisconsin', '56': 'Wyoming'}
    return states[state]
}

function getStateGeoJson(statecode) {
    $.get('https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json',function(data,status){
        data = JSON.parse(data)
        data.features = data.features.filter(ele => ele.properties.STATE == statecode)
        makeStatePlot(statecode, data)
    });
}

function summarize(countyData) { 
    for(let i = 0; i < countyData.length; i++) {
        if (countyData[i] < 0 || countyData[i] == "NaN") {countyData[i] = "-" }
    }
    
    var county = $("<h4></h4>").text(countyData[1] + ", " + countyData[4])
    county.attr("class", "py-2")
    $("#summary").append(county)

    var cost = $("<h6></h6>").text("Average Monthly Rental Cost: $" + countyData[5])
    cost.attr("class", "font-italic")
    $("#summary").append(cost)
    var cost = $("<p></p>").text("Average Utility Allowance: $" + countyData[10])
    cost.attr("class", "font-italic")
    $("#summary").append(cost)

    let units = Math.floor(countyData[6]*(100-countyData[7])/100)
    let months = countyData[8]
    var availble = $("<p></p>").text(units + " Units available, with an average of " 
        + months + " months waiting.")
    $("#summary").append(availble)

    let bedInfo = $("<div></div>")
    bedInfo.attr("id", "bedInfo")
    $("#summary").append(bedInfo)

    var data = [{
        values: [countyData[11], countyData[12], countyData[13]],
        labels: ['0-1 bedroom', '2 bedroom', '3+ bedroom'],
        type: 'pie',
        automargin: true,
        marker: { 
            colors: ['rgb(228, 228, 245)','rgb(158,154,200)','rgb(84,39,143)']
        }
    }];
      
    var layout = {
        height: 300,
        width: 300,
        margin: {"t": 0, "b": 0, "l": 0, "r": 0},
    };
      
    Plotly.newPlot('bedInfo', data, layout);


}

function makeStatePlot(state, stateGeoJson) {

    Plotly.d3.csv('https://raw.githubusercontent.com/reriggs/technica-2020/main/data/county_summary.csv', function(err, rows){
      function unpack(rows, key) {
          let vals = rows.filter(r => (parseInt(r["state_code"]) === parseInt(state)) && (r["code"].indexOf("X") == -1)).map (function(row) {
            if (key == "code" && row[key].length == 4) {
                return "0" + row[key];
            } else {
                return row[key];
            }
          });
          return vals;
      }

      var data = [{
          type: 'choropleth',
          locationmode: 'geojson-id',
          locations: unpack(rows, 'code'),
          z: unpack(rows, 'rent_per_month'),
          text: unpack(rows, 'name'),
          geojson: stateGeoJson,
          zmin: 0,
          zmax: 600,
          colorscale: [
              [0, 'rgb(242,240,247)'], [0.4, 'rgb(228, 228, 245)'],
              [0.5, 'rgb(188,189,220)'], [0.55, 'rgb(158,154,200)'],
              [0.65, 'rgb(117,107,177)'], [1, 'rgb(84,39,143)']
          ],
          colorbar: {
              title: 'US Dollars ($)', 
              thickness: 15
          },
          marker: {
              line:{
                  color: 'rgb(255,255,255)',
                  width: 1
              }
          }
      }];


      var layout = {
          title: 'Average Cost of Rent for Low-Income Housing in ' + getStateName(state) + ' by County',
          geo:{
              scope: 'usa',
              showlakes: true,
              lakecolor: 'rgb(255,255,255)',
              fitbounds: "geojson",
              visible: false
          }
      };

      Plotly.newPlot("country", data, layout, {showLink: false}).then(gd => {
        gd.on('plotly_click', d => {
            var pt = (d.points || [])[0]
    
            console.log(pt.location)
            $.get('https://raw.githubusercontent.com/reriggs/technica-2020/main/data/county_summary.csv',function(data,status){
                data.split("\n").forEach(row => {
                    row = row.split(",")
                    if (parseInt(row[2]) == parseInt(pt.location) ) {
                        $("#summary").empty()
                        summarize(row)
                    }
                })
            });
            
    
        })
      })
    });
}


function resetView(){
    $("#summary").empty()
    countryView()
}

function countryView(){
    Plotly.d3.csv('https://raw.githubusercontent.com/reriggs/technica-2020/main/data/state_summary.csv', function(err, rows){
        function unpack(rows, key) {
            return rows.map(function(row) { return row[key]; });
        }
    
        var data = [{
            type: 'choropleth',
            locationmode: 'USA-states',
            locations: unpack(rows, 'State'),
            z: unpack(rows, 'Average Family Expenditure per month ($$)'),
            text: unpack(rows, 'Name'),
            zmin: 0,
            zmax: 600,
            colorscale: [
                [0, 'rgb(242,240,247)'], [0.4, 'rgb(228, 228, 245)'],
                [0.5, 'rgb(188,189,220)'], [0.55, 'rgb(158,154,200)'],
                [0.65, 'rgb(117,107,177)'], [1, 'rgb(84,39,143)']
            ],
            colorbar: {
                title: 'US Dollars ($)', 
                thickness: 15
            },
            marker: {
                line:{
                    color: 'rgb(255,255,255)',
                    width: 1
                }
            }
        }];
    
    
        var layout = {
            title: 'Average Cost of Rent for Low-Income Housing by State',
            geo:{
                scope: 'usa',
                showlakes: true,
                lakecolor: 'rgb(255,255,255)'
            }
        };
    
        Plotly.newPlot("country", data, layout, {showLink: false}).then(gd => {
            gd.on('plotly_click', d => {
                var pt = (d.points || [])[0]
                
                getStateGeoJson(getStateNum(pt.location))

            })
        })
    });
}

countryView()
