/* jshint node: true, esversion: 6 */
"use strict";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fortune = require("./lib/fortune.js");
const formidable = require("formidable");

// setting up handlebars view engine
const handlebars = require("express3-handlebars").create({ 
    "defaultLayout": "main",
    helpers: {
        section: function(name, options){
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});
app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

function getWeatherData() {
    return {
        locations: [
            {
                name: 'Portland',
                forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
                weather: 'Overcast',
                temp: '54.1 F (12.3 C)',
            },
            {
                name: 'Bend',
                forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
                weather: 'Partly Cloudy',
                temp: '55.0 F (12.8 C)',
            },
            {
                name: 'Manzanita',
                forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
                weather: 'Light Rain',
                temp: '55.0 F (12.8 C)',
            },
        ],
    };
}

app.set("port", process.env.PORT || 3000);
app.disable("x-powered-by");
// using the 'body-parser' middleware to make form body available on 'req.body'
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// using the "static" middleware to serve static content
app.use(express.static(__dirname + "/public"));
// setting up context for handlebars
app.use(function (req, res, next) {
    res.locals.showTests = app.get("env") !== "production" && 
        req.query.test === "1";
    next();
});
app.use(function (req, res, next) {
    if (!res.locals.partials) 
        res.locals.partials = {};
    res.locals.partials.weather = getWeatherData();
    next();
});

// routes
app.get("/", function (req, res) {
    res.render("home");
});
app.get("/about", function (req, res) {
    res.render("about", { 
        fortune: fortune.getFortune(),
        pageTestScript: '/qa/tests-about.js' 
    });
});
app.get("/tours/hood-river", function (req, res) {
    res.render("tours/hood-river");
});
app.get("/tours/request-group-rate", function (req, res) {
    res.render("tours/request-group-rate");
});
app.get("/tours/oregon-coast", function (req, res) {
    res.render("tours/oregon-coast");
});
app.get("/newsletter", function(req, res){
    // we will learn about CSRF later...for now, we just
    // provide a dummy value
    res.render('newsletter', { csrf: 'CSRF token goes here' });
});
app.post("/process", function (req, res) {
    console.log('Form (from querystring): ' + req.query.form);
    console.log(req.body);
    console.log('CSRF token (from hidden form field): ' + req.body._csrf);
    console.log('Name (from visible form field): ' + req.body.name);
    console.log('Email (from visible form field): ' + req.body.email);
    if (req.xhr || req.accepts("json, html")==="json") {
        // if there were an error, we would send { error: 'error description' }
        res.send({ success: true });
    } else {
        // if there were an error, we would redirect to an error page
        res.redirect(303, '/thank-you');
    }
});
app.get("/contest/vacation-photo", function (req, res) {
    const now = new Date();
    res.render("contest/vacation-photo", {
        year: now.getFullYear(),
        month: now.getMonth()
    });
});
app.post("/contest/vacation-photo/:year/:month", function (req, res) {
    const form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if (err) res.redirect(303, "/error");
        console.log("recieved fields");
        console.log(fields);
        console.log("recieved files");
        console.log(files);
        res.redirect(303, "/thank-you");
    });
});
app.get("/jquery-test", function (req, res) {
    res.render("jquery-test");
});
// custom 404 page
app.use(function (req, res, next) {
    res.status(404);
    res.render("404");
});

// custom 500 page
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render("500");
});
// start server
app.listen(app.get("port"), () => {
    console.log("Express started on http://localhost:" + app.get("port") + "; press Ctrl-C to terminate.");
});