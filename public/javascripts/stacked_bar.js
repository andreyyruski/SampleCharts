var dataset = null;
var w = 640,
    h = 280,
    p = [20, 50, 30, 20],
    x = d3.scale.ordinal().rangeRoundBands([0, w - p[1] - p[3]], 0.1),
    y = d3.scale.linear().range([0, h - p[0] - p[2]]),
    z = d3.scale.ordinal().range(["lightpink", "darkgray", "lightblue"]),
    parse = d3.time.format("%m/%Y").parse,
    format = d3.time.format("%b");
var dataset = [];
var group_names = [];
var attribute_names = [];

var svg = d3.select("body").append("svg:svg")
    .attr("width", w)
    .attr("height", h)
    .append("svg:g")
    .attr("transform", "translate(" + p[3] + "," + (h - p[2]) + ")");

d3.xml("/201594_data_source.xml", function(xml) {
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

    var colors = d3.scale.category10();

    // Compute the x-domain (by date) and y-domain (by top).
    x.domain(dataset[0].map(function(d) { return d.x; }));
    y.domain([0, d3.max(dataset[dataset.length - 1], function(d) { return d.y0 + d.y; })]);

    // Add a group for each cause.
    var cause = svg.selectAll("g.cause")
        .data(dataset)
        .enter().append("svg:g")
        .attr("class", "cause")
        .style("stroke", "black")
        .style("fill", function(d, i) {
            return colors(i);
        });

    // Add a rect for each date.
    var rect = cause.selectAll("rect")
        .data(Object)
        .enter().append("svg:rect")
        .attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return -y(d.y0) - y(d.y); })
        .attr("height", function(d) { return y(d.y); })
        .attr("width", x.rangeBand());


});
