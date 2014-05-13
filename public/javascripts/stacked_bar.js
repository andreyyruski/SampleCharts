var dataset = null;
var svg = null;
var comments_csv = null;
var comment_type_index = null;
var comment_text_index = null;

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
var bar_colors = [];
var attribute_names_for_legend = [];
var legend_actual_names = {};

String.prototype.repeat = function( num )
{
    return new Array( num + 1 ).join( this );
}

function init_svg() {
    svg = d3.select("body").append("svg:svg")
        .attr("width", w)
        .attr("height", h)
        .append("svg:g")
        .attr("transform", "translate(" + p[3] + "," + (h - p[2]) + ")");
}

function load_data_and_draw_graph() {
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
                return bar_colors[i];
            });

        // Add a rect for each date.
        var rect = cause.selectAll("rect")
            .data(Object)
            .enter().append("svg:rect")
            .attr("x", function(d) { return x(d.x); })
            .attr("y", function(d) { return -y(d.y0) - y(d.y); })
            .attr("height", function(d) { return y(d.y); })
            .attr("width", x.rangeBand())
            .append("title")
            .text(function(d){return  "Sample Tool tip";});

        // Add a label per date.
        var label = svg.selectAll("text")
            .data(x.domain())
            .enter().append("svg:text")
            .attr("x", function(d) { return x(d) + x.rangeBand() / 2; })
            .attr("y", 6)
            .attr("text-anchor", "middle")
            .attr("dy", ".71em")
            .text(function(d) {console.log(group_names[d]); return group_names[d].split(" ")[1] ;});//group_names[d];});

        // Add y-axis rules.
        var rule = svg.selectAll("g.rule")
            .data(y.ticks(10))
            .enter().append("svg:g")
            .attr("class", "rule")
            .attr("transform", function(d) { return "translate(-585" + "," + -y(d) + ")"; });

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
            .style("fill",function(d,i){console.log(bar_colors[i]); return bar_colors[i];})
            .attr("transform", "translate(0,-"+(h - p[0] - p[2]+120)+")");

        legend.selectAll("text")
            .data(attribute_names_for_legend)
            .enter()
            .append("svg:text")
            .attr("x",function(d,i) {return legend_scale(i) + 25})
            .attr("y",25)
            .attr("width",20)
            .attr("height", 20)
            .text(function(d,i) {return legend_actual_names[attribute_names_for_legend[i]];})
            .style("fill","black")
            .attr("transform", "translate(0,-"+(h - p[0] - p[2]+120)+")");

        load_comments_data();
    });
}

function load_style_data() {
    $.get("/201594_style.xml", function(xml_data) {
        var xml = $(xml_data);
        var series_strings = ["firstSeries", "secondSeries", "thirdSeries", "fourthSeries", "fifthSeries", "sixthSeries"]
        for(var index = 0; index < series_strings.length; index++) {
            var bar_color = parseInt(xml.find("style[d='."+series_strings[index]+"'][n='fill']").attr("v")).toString(16);
            bar_color = "0".repeat(6-bar_color.length) + bar_color
            bar_colors.push("#"+bar_color);
        }
        load_series_data();
    });
}

function load_series_data() {
    d3.csv('/201594_series.csv',function(csv){
        csv.map(function(row){
            legend_actual_names[row['DATA_SERIES_NAME']] = row['DISPLAY_NAME'];
        });
        load_data_and_draw_graph();
    });
}

function load_comments_data() {
    $.ajax({
        url: "/201594_comments.csv",
        dataType: 'text',
        cache: false
    }).done(function(csvAsString){
        comments_csv = csvAsString.csvToArray();
        comments_csv[0].map(function(a,b){if(a=='COMMENT_TYPE'){comment_type_index = b;}});
        comments_csv[0].map(function(a,b){if(a=='TEXT'){comment_text_index = b;}});
        if(comment_type_index!=null && comment_text_index!=null) {
            comments_csv.slice(1,-1).map(function(row,row_index){
                if(row[comment_type_index]=='Chart Name') {
                    $("#chart_title").html(row[comment_text_index].replace(/\\/g,"'"));
                    return;
                }
            });
        }
    });
}


init_svg();
load_style_data();

