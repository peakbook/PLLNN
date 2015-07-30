/*
Copyright (C) 2015 @peakbook

The JavaScript code in this page is free software: you can
redistribute it and/or modify it under the terms of the GNU
General Public License (GNU GPL) as published by the Free Software
Foundation, either version 3 of the License, or (at your option)
any later version.  The code is distributed WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.

As additional permission under GNU GPL version 3 section 7, you
may distribute non-source (e.g., minimized or compacted) forms of
that code without the copy of the GNU GPL normally required by
section 4, provided you include this license notice and a URL
through which recipients can access the Corresponding Source.
*/


// oscillator class
Oscillators = function(n,omega,omega_s,epsilon)
{
    var rnd = new Random();

    this.n = n;
    this.units = [];
    this.t = 0;
    for(var i=0;i<n;i++)
    {
        var unit = new OscillatorUnit(omega+rnd.normal(0,omega_s),epsilon);
        //var unit = new OscillatorUnit(omega,epsilon);
        this.units.push(unit);
    }
};

Oscillators.prototype.setOmega = function(omega,omega_s)
{
    var rnd = new Random();

    for(var unit of this.units)
    {
        unit.omega = omega + rnd.normal(0,omega_s);
        //unit.omega = omega;
    }
};

Oscillators.prototype.setEpsilon = function(epsilon)
{
    for(var unit of this.units)
    {
        unit.epsilon = epsilon;
    }
};


Oscillators.prototype.randomize = function()
{
    for(var unit of this.units)
    {
        unit.randomize();
    }
};

// calc order parameter
Oscillators.prototype.order = function()
{
    var mx = 0, my = 0;

    for(var unit of this.units)
    {
        mx += Math.cos(unit.theta);
        my += Math.sin(unit.theta);
    }

    return  Math.sqrt(mx*mx + my*my)/this.n;
};


Oscillators.prototype.associate = function(connection,dt)
{
    for(var i=0;i<this.n;i++)
    {
        var ui = this.units[i];
        ui.dtheta = 0;
        for(var j=0;j<this.n;j++)
        {
            var uj = this.units[j];
            ui.dtheta += connection[i][j]*Math.sin(uj.theta - ui.theta);
        }
        ui.dtheta *= ui.epsilon;
        ui.dtheta += ui.omega;
    }

    for(var i of this.units)
    {
        i.update(dt);
    }
};

// constructor of oscilator unit
OscillatorUnit = function(omega,epsilon)
{
    this.omega = omega;
    this.epsilon = epsilon;
    this.theta = 0;
    this.dtheta = 0;
    this.randomize();
};

OscillatorUnit.prototype.randomize = function()
{
    this.theta = Math.random()*2*Math.PI;
};

OscillatorUnit.prototype.update = function(dt)
{
    
    this.theta = (this.theta + this.dtheta*dt+Math.PI*2)%(Math.PI*2);
};

