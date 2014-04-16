var dataset = null;
var w = 640,
    h = 380,
    p = [120, 50, 30, 40],
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

    // Add a label per date.
    var label = svg.selectAll("text")
        .data(x.domain())
        .enter().append("svg:text")
        .attr("x", function(d) { return x(d) + x.rangeBand() / 2; })
        .attr("y", 6)
        .attr("text-anchor", "middle")
        .attr("dy", ".71em")
        .text(function(d) {return group_names[d];});

    // Add y-axis rules.
    var rule = svg.selectAll("g.rule")
        .data(y.ticks(5))
        .enter().append("svg:g")
        .attr("class", "rule")
        .attr("transform", function(d) { return "translate(0" + "," + -y(d) + ")"; });

    rule.append("svg:line")
        .attr("x2", w - p[1] - p[3])
        .style("stroke", function(d) { return d ? "#fff" : "#000"; })
        .style("stroke-opacity", function(d) { return d ? 0 : null; });

    rule.append("svg:text")
        .attr("x", w - p[1] - p[3] + 6)
        .attr("dy", ".35em")
        .text(d3.format(",d"));



    attribute_names_for_legend = attribute_names.splice(1,attribute_names.length)
    legend_scale = d3.scale.linear().domain([0,attribute_names_for_legend.length]).range([0, w - p[1] - p[3]])
    var legend = svg.append("g");
    legend.selectAll("rect")
          .data(attribute_names_for_legend)
          .enter()
          .append("svg:rect")
        .attr("x",function(d,i) {return legend_scale(i)})
        .attr("y",10)
        .attr("width",20)
        .attr("height", 20)
        .text(function(d) {return "Amma";})
        .style("fill",function(d,i){console.log(colors(i)); return colors(i);})
        .attr("transform", "translate(0,-"+(h - p[0] - p[2]+120)+")");

    legend.selectAll("text")
        .data(attribute_names_for_legend)
        .enter()
        .append("svg:text")
        .attr("x",function(d,i) {return legend_scale(i) + 25})
        .attr("y",25)
        .attr("width",20)
        .attr("height", 20)
        .text(function(d,i) {return attribute_names_for_legend[i];})
        .style("fill","black")
        .attr("transform", "translate(0,-"+(h - p[0] - p[2]+120)+")");
});
