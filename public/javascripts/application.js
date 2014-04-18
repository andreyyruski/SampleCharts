// Global Data
var w = 500;
var h = 300;
var dataset = [];
var group_names = [];
var attribute_names = [];
var xScale = null
var yScale = null;

// Load the Style data
function load_style_data() {
    $.get('/201594_style.xml',function(xml){

    });
}

// Load the Source data and display the Graph
function load_series_and_draw_graph() {
    $.get('/201594_data_source.xml',function(xml){
        var data_rows = xml.getElementsByTagName("DATA");
        //console.log(data_rows);

        var first_row_attributes = data_rows[0].attributes;
        var groups_length = first_row_attributes.length - 1;

        // Collect the Data-Attribute Names (Collecting the attributes of the first row)
        for(var index=0; index < first_row_attributes.length; index++) {
            attribute_names.push(first_row_attributes[index].localName)
        }

        // Populate dataset from the XML
        // Loop for each attribute
        for(var attribute_index=1; attribute_index<attribute_names.length; attribute_index++) {
            attribute_data = [];
            for(var data_row_index=0; data_row_index< data_rows.length; data_row_index++) {
                attribute_data.push({x: data_row_index,
                    y: parseInt(data_rows[data_row_index].getAttribute(attribute_names[attribute_index]))})
            }
            dataset.push(attribute_data);
        }

        // Populate the Group names
        for(var data_row_index=0; data_row_index< data_rows.length; data_row_index++) {
            group_names.push(data_rows[data_row_index].getAttribute(attribute_names[0]));
        }

        //Set up stack method
        var stack = d3.layout.stack();

        //Data, stacked
        stack(dataset);

        //Set up scales
        xScale = d3.scale.ordinal()
            .domain(d3.range(dataset[0].length))
            .rangeRoundBands([0, w], 0.05);

        yScale = d3.scale.linear()
            .domain([0,
                d3.max(dataset, function(d) {
                    return d3.max(d, function(d) {
                        return d.y0 + d.y;
                    });
                })
            ])
            .range([h, 0]);

        //Easy colors accessible via a 10-step ordinal scale
        var colors = d3.scale.category10();

        //Create SVG element
        var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        // Add a group for each row of data
        var groups = svg.selectAll("g")
            .data(dataset)
            .enter()
            .append("svg:g")
            .style("fill", function(d, i) {
                return colors(i);
            });

        // Add a rect for each data value
        var rects = groups.selectAll("rect")
            .data(Object)
            .enter()
            .append("svg:rect")
            .attr("x", function(d) {
                return xScale(d.x);
            })
            .attr("y", function(d) {
                return  yScale(d.y0) - yScale(d.y);
            })
            .attr("height", function(d) {
                return yScale(d.y);
            })
            .attr("width", xScale.rangeBand());


    });
}
