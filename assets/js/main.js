"use strict";
window.fx = true;
var timerid=null;
var tv = 100;
var factor_tv=1;
var w=6;
var h=10;
var r=15;
var rs=5;
var omega=1;
var sigma=0.01;
var epsilon=1;
var dataset=[];
var dataset_p0=[];
var dataset_p1=[];
var dataset_p2=[];
var dataset_pr=[];
var osil = new Oscillators(w*h,omega,sigma,epsilon);
var cm;
var cm_init;
var cm_asso;
var vw = document.getElementById("viz_phases").clientWidth;
var vh = document.getElementById("viz_phases").clientHeight;
var graph1;
var view_unit;
var view_phase;
var line = d3.svg.line()
    .x(function(d){ return d[0]; })
    .y(function(d){ return d[1]; });
    var cdata = { };
for(var i=0;i<w*h;i++)
{
    cdata[i.toString()] = 0;
}

var learning = learning_hebbian;

var pat0 = [
    -1,-1, 1, 1,-1,-1,
    -1, 1, 1, 1, 1,-1,
    1, 1,-1,-1, 1, 1,
    1,-1,-1,-1,-1, 1,
    1,-1,-1,-1,-1, 1,
    1,-1,-1,-1,-1, 1,
    1,-1,-1,-1,-1, 1,
    1, 1,-1,-1, 1, 1,
    -1, 1, 1, 1, 1,-1,
    -1,-1, 1, 1,-1,-1
];

var pat1 = [
    -1,-1, 1, 1,-1,-1,
    -1, 1, 1, 1,-1,-1,
    1, 1, 1, 1,-1,-1,
    -1,-1, 1, 1,-1,-1,
    -1,-1, 1, 1,-1,-1,
    -1,-1, 1, 1,-1,-1,
    -1,-1, 1, 1,-1,-1,
    -1,-1, 1, 1,-1,-1,
    -1,-1, 1, 1,-1,-1,
    1, 1, 1, 1, 1, 1
];

var pat2 = [
    -1, 1, 1, 1, 1,-1,
    1, 1, 1, 1, 1, 1,
    1, 1,-1,-1, 1, 1,
    -1,-1,-1,-1, 1, 1,
    -1,-1,-1,-1, 1, 1,
    -1,-1,-1, 1, 1,-1,
    -1,-1, 1, 1,-1,-1,
    -1, 1, 1,-1,-1,-1,
    1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1
];

var patr = [
    -1,-1, 1,-1,-1,-1,
    1, 1, 1, 1, 1,-1,
    -1, 1, 1, 1,-1, 1,
    -1,-1,-1, 1,-1,-1,
    -1,-1, 1, 1,-1,-1,
    -1,-1, 1,-1,-1,-1,
    -1,-1, 1, 1,-1,-1,
    -1,-1,-1, 1,-1,-1,
    -1,-1, 1, 1,-1,-1,
    1,-1, 1, 1, 1, 1
];

function draw_init()
{ 
    view_unit = d3.select("#viz").append("svg");
    view_phase = d3.select("#viz_phases").append("svg");

    view_unit
        .attr("width", w*r*2)
        .attr("height", h*r*2);    

    view_phase
        .attr("width", vw)
        .attr("height", vh);

    view_phase.append("g")
        .attr("class","units");

    var grp = view_phase.append("g")
        .attr("class","base");

    grp.append("circle")
        .attr("r", vw*0.45)
        .attr("cx",vw*0.5)
        .attr("cy",vh*0.5)
        .attr("stroke", "gray")
        .attr("fill", "transparent");

    grp.append("path")
        .attr("d", line([[0, 0.5*vh], [vw, 0.5*vh]]))
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    grp.append("path")
        .attr("d", line([[0.5*vw, 0], [0.5*vw, vh]]))
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    graph1 = new Rickshaw.Graph( {
        element: document.getElementById("chart_order"),
        renderer: 'line',
        max: 1.05,
        min: -1.05,
        series: new Rickshaw.Series.FixedDuration([{ name: '0'}], undefined, {
            timeInterval: tv,
            maxDataPoints: 100,
            timeBase: new Date().getTime() / 1000
        }) 
    });

    new Rickshaw.Graph.HoverDetail({
        graph: graph1
    });

    new Rickshaw.Graph.Axis.Y({
        element: document.getElementById('y_axis'),
        graph: graph1,
        grid: true,
        orientation: 'left',
        tickValues: [-1.0,0,1.0],
        tickFormat: function(y){return y.toPrecision(2); } 
    });

    for(var ds of [{name:"#pattern_r",data:dataset_pr, basedata: patr},{name:"#pattern_0",data:dataset_p0, basedata: pat0},{name:"#pattern_1",data:dataset_p1, basedata: pat1},{name:"#pattern_2",data:dataset_p2, basedata: pat2}])
    {
        let a = ds.data;
        let b = ds.basedata;
        var obj = d3.select(ds.name).append("svg")
            .attr("width", w*rs*2)
            .attr("height", h*rs*2)
            .selectAll("circle")
            .data(ds.data)

            obj.enter().append("circle")
            .attr("r", rs)
            .attr("fill", function(d,i){return d3.hsl(170,-d.val*0.5+0.5,0.40);})
            .attr("cx", function(d,i){return d.x*rs*2+rs;})
            .attr("cy", function(d,i){return d.y*rs*2+rs;})
            .on("click", function(d,i){
                b[i] = -b[i];
                a[i].val = -a[i].val;
                calc_connection();
                d3.select(this).attr("fill", function(d,i){
                    return d3.hsl(170,-d.val*0.5+0.5,0.40);
                });
            });
    }
}

function gen_patterns()
{
    dataset_p0.splice(0,dataset_p0.length);
    dataset_p1.splice(0,dataset_p1.length);
    dataset_p2.splice(0,dataset_p2.length);
    dataset_pr.splice(0,dataset_pr.length);

    for (var j=0;j<h;j++){
        for (var i=0;i<w;i++){
            dataset_p0.push({val:pat0[w*j+i],x:i,y:j});
            dataset_p1.push({val:pat1[w*j+i],x:i,y:j});
            dataset_p2.push({val:pat2[w*j+i],x:i,y:j});
            dataset_pr.push({val:patr[w*j+i],x:i,y:j});
        }
    }
}

function gen_dataset()
{
    dataset = [];

    for (var j=0;j<h;j++){
        for (var i=0;i<w;i++){
            dataset.push({val:0,x:i,y:j});
        }
    }
}

function calc_connection()
{
    cm_init = learning([patr]);
    cm_asso = learning([pat0,pat1,pat2]);
    change_mode();
}

function learning_hebbian(m)
{
    var tm = numeric.transpose(m);
    var tmp = numeric.dot(tm,m);
    tmp = numeric.sub(tmp,numeric.diag(numeric.getDiag(tmp)));
    tmp = numeric.mul(tmp,1.0/(w*h));

    return tmp;
}

function learning_projection(m)
{
    var tm = numeric.transpose(m);
    var tmp = numeric.dot(tm,numeric.dot(numeric.inv(numeric.dot(m,tm)),m));
    tmp = numeric.sub(tmp,numeric.diag(numeric.getDiag(tmp)));
    //tmp = numeric.mul(tmp,1.0/(w*h));

    return tmp;
}

function start()
{
    var btn = document.getElementById("button_start");
    if(timerid == null)
    {
        timerid = setInterval(update,tv);
        btn.value = "Stop";
    }
    else
    {
        clearInterval(timerid);
        timerid = null;
        btn.value = "Start";
    }
}

function update()
{
    update_data();
    update_view();
    update_chart();
}

function update_view()
{
    var obj = view_unit.selectAll("circle")
        .data(dataset);

    obj.enter().append("circle")
        .attr("r", r)
        .attr("cx", function(d,i){return d.x*r*2+r;})
        .attr("cy", function(d,i){return d.y*r*2+r;});

    obj.exit().remove();

    obj.transition()
        .duration(tv)
        .attr("fill", function(d,i){return d3.hsl(170,(Math.cos(d.val-dataset[0].val)+1)*0.5,0.45);})

        obj = view_phase.select(".units")
        .selectAll("circle")
        .data(dataset);

    obj.enter().append("circle")
        .attr("r", 5)
        .attr("opacity", 0.75)
        .attr("fill", function(d,i){return d3.hsl(i/(w*h)*360,1,0.65);});

    obj.exit().remove();

    obj.transition()
        .duration(0)
        .attr("cx", function(d,i){return (Math.cos(d.val)*0.45+0.5)*vw;})
        .attr("cy", function(d,i){return (Math.sin(d.val)*0.45+0.5)*vh;});
}

function update_chart()
{
    for(var i=0;i<dataset.length;i++)
    {
        cdata[i.toString()] = Math.sin(dataset[i].val);
    }
    graph1.series.addData(cdata);
    graph1.render();
}

function update_data()
{
    osil.associate(cm,tv/1000/factor_tv);

    for(var i=0;i<dataset.length;i++)
    {
        dataset[i].val = osil.units[i].theta;
    }
}

function change_param()
{
    omega = parseFloat(document.getElementById("param_omega").value)*factor_tv;
    sigma = parseFloat(document.getElementById("param_sigma").value);
    epsilon = parseFloat(document.getElementById("param_epsilon").value)*factor_tv;

    osil.setOmega(omega,sigma);
    osil.setEpsilon(epsilon);
}


function randomize()
{
    osil.randomize();
    update_data();
    update_view();
}

function change_pattern()
{
    patr.splice(0,patr.length);
    [pat0,pat1,pat2][Math.floor(Math.random()*3)].forEach(function(d){patr.push(d);});

    var pos = Array.apply(null, {length: w*h}).map(Number.call, Number)
        function shuffle(o){
            for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
            return o;
        };
    shuffle(pos).splice(0,Math.floor(pos.length*0.9));
    for(var i of pos)
    {
        patr[i] *= -1;
    }
    dataset_pr.splice(0,dataset_pr.length);

    for (var j=0;j<h;j++){
        for (var i=0;i<w;i++){
            dataset_pr.push({val:patr[w*j+i],x:i,y:j});
        }
    }

    calc_connection();

    d3.select("#pattern_r")
        .selectAll("svg")
        .selectAll("circle")
        .data(dataset_pr)
        .transition()
        .duration(0)
        .attr("fill", function(d,i){return d3.hsl(170,-d.val*0.5+0.5,0.40);});
}

function change_learning()
{
    learning = document.getElementById("lmethod").checked?learning_hebbian:learning_projection;
    calc_connection();
}

function change_mode()
{
    cm = document.getElementById("modes").checked?cm_init:cm_asso;
}

gen_dataset();
gen_patterns();
change_learning();
change_param();
draw_init();
update();

