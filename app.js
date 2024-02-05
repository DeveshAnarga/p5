/**
 * Team 02 - Assignment 2 
 * @author Michellia Herman
 * @author Devesh Gurusinghe
 * */

/** GLOBAL VARIABLES **/

/** Express module - @const || @type {e | (() => Express)} **/
const EXPRESS = require("express");

/** Mongoose module - @const **/
const MONGOOSE = require("mongoose");

/** Require 'Categories' and 'Event' route module - @const || @type {Router | {}} **/
// const EVENT = require("./controllers/events");
const CATEGORIES = require("./routes/category-routes");
const EVENTS = require("./routes/event-routes");

/** Port number - @const || @type {number} **/
const PORT_NUMBER = 8081;

/** app instance - @let || @type {Express} **/
let app = EXPRESS();

//Mount specified middleware to serve the path
app.use(EXPRESS.urlencoded({ extended: true }));
app.use(EXPRESS.static("node_modules/bootstrap/dist/css"));
app.use(EXPRESS.static("images"));
app.use(EXPRESS.json()); //to enable the use of JSON

//Configure Express for EJS
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.listen(PORT_NUMBER); //listen to the specified port

const URL = "mongodb://localhost:27017/assg2";

/** Function to connect to the URL - @param url || @returns {Promise<string>} */
async function connect(url) {
    await MONGOOSE.connect(url);
    return "Connected Successfully";
}

/** ROUTING **/
app.get("/", async function (req, res) {
    const Category = MONGOOSE.model("Category");
    const Event = MONGOOSE.model("Event");
    const Operator = MONGOOSE.model("Operator");

    const categories = await Category.countDocuments();
    const events = await Event.countDocuments();
    const operation = await Operator.findOne({id: "tracker"});
    //console.log(typeof categories);
    // const events = await MONGOOSE.db.collection("events").countDocuments();
    res.render("index", {
        categories: categories,
        events: events,
        operation: operation
    });
});


app.use("/", CATEGORIES); //Redirect to the Category Routes
app.use("/api/v1/event/32818866", EVENTS); //Redirect to the Event Routes

app.use("/devesh/api/v1/", EVENTS); // API end points

connect(URL)
    .then(console.log)
    .catch((err) => console.log(err)); //Connect to the URL
