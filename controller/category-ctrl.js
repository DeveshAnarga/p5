/**
*
* Desc. : This file contains the function or action need to be done for category object
* */

//Dependencies
const Cat = require("../models/category"); //require the Category object
const RANDOM_STRING = require("randomstring"); //required randomstring module
const Event = require("../models/event");
const Operator = require("../models/operator");

//Global variables
let catId;
let catDate;
let catImg;
let optId = "tracker"; //default for operator

//Export this module to the file that 'require' it -- the category routes file
module.exports = {
    /** The following function is to serve REST API request
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    createCat: async function(req, res){
        let randStr = RANDOM_STRING.generate({
            length: 2,
            charset: "alphabetic",
            capitalization: "uppercase"});
        let randNum = Math.round(Math.random() * 9000 + 1000);

        catId = `C${randStr}-${randNum}` //The type is string
        catDate = new Date().toISOString(); //generate time creation by default
        catImg = "/cat-default.jpg"

        let aCat = new Cat({
            name: req.body.name,
            description: req.body.description,
            image: catImg,
            categoryId: catId,
            createdDate: catDate
        });

        //try and catch
        try {
            await aCat.save();

            //if a category is succesfully saved, invoked the operator operation
            let isExist = await Operator.countDocuments();
            if(isExist === 0){ //if no entity has been created for operator, create one

                let anOpt = new Operator({
                    id: "tracker",
                    created: 1,
                    deleted: 0,
                    updated: 0
                });
                await anOpt.save();
            } else { //else, update that entity
                let opt = await Operator.findOne({id: optId});

                if(opt) {
                    let newNum = opt.created + 1;
                    let theOpt = await Operator.updateOne(
                        {id: optId},
                        {
                            $set: {
                                created: newNum
                            }
                        });
                    console.log(theOpt);
                }
            }
            res.status(200).json({ id: aCat.categoryId});
        } catch (e) {
            res.status(404).json(e);
        }
    },
    allCategories: async function (req, res){
        let categories = await Cat.find({}).populate("eventList"); //to be deleted once event schema has been made
        res.json(categories);
    },
    deleteById: async function (req, res){
        let id = req.body.categoryId;

        let isExist = await Cat.findOne({categoryId: id});


        console.log(isExist);
        if(isExist == null){
            res.status(404).json("ID not found");
        } else {
            for(let i = 0; i < isExist.eventList.length; i++){
                let delEvent = await Event.deleteOne({_id: isExist.eventList[i]});
                console.log(isExist.eventList[i], delEvent);
            }

            let delCat = await Cat.deleteOne({categoryId: id});
            let opt = await Operator.findOne({id: optId});
            if(opt) {
                let newNum = opt.deleted + 1;
                let theOpt = await Operator.updateOne(
                    {id: optId},
                    {
                        $set: {
                            deleted: newNum
                        }
                    });
                console.log(theOpt);
            }
            res.status(200).json(delCat);
        }
    },
    updateCategory: async function (req, res){
        let reqCat = req.body.categoryId;

        let theCat = await Cat.updateOne(
            {categoryId: reqCat},
            {$set: {
                name: req.body.name,
                description: req.body.description
            }
        });

        if(theCat.modifiedCount === 1){ //the response is to be updated
            let opt = await Operator.findOne({id: optId});
            if(opt) {
                let newNum = opt.updated + 1;
                let theOpt = await Operator.updateOne(
                    {id: optId},
                    {
                        $set: {
                            updated: newNum
                        }
                    });
                console.log(theOpt);
            }
            res.status(200).json({status:"updated successfully"});
        } else {
            res.status(200).json({status:"ID not found"});
        }
    },
    /** Until Here **/

    /** The following function is to serve HTML pages developed in Iteration 1
     *
     * @param req
     * @param res
     */
    viewAdd: function (req, res){
        res.render("add-category");
    },
    addCat: async function (req, res) {
        let randStr = RANDOM_STRING.generate({
            length: 2,
            charset: "alphabetic",
            capitalization: "uppercase"});
        let randNum = Math.round(Math.random() * 9000 + 1000);

        catId = `C${randStr}-${randNum}` //The type is string
        catDate = new Date().toLocaleString(); //generate time creation by default

        if(req.body.image === ''){ //if no image provided
            catImg = "/cat-default.jpg" //assign this image, as a default value
        } else {
            catImg = req.body.image;
        }

        let aCat = new Cat({
            name: req.body.name,
            description: req.body.description,
            image: catImg,
            categoryId: catId,
            createdDate: catDate
        });

        try {
            await aCat.save();

            let isExist = await Operator.countDocuments();
            if(isExist === 0){
                console.log("not exist")
                let anOpt = new Operator({
                    id: "tracker",
                    created: 1,
                    deleted: 0,
                    updated: 0
                });
                await anOpt.save();
            } else {
                let opt = await Operator.findOne({id: optId});

                console.log("exist")
                if(opt) {
                    let newNum = opt.created + 1;
                    let theOpt = await Operator.updateOne(
                        {id: optId},
                        {
                            $set: {
                                created: newNum
                            }
                        });
                    console.log(theOpt);
                }
            }

            res.redirect("/category/31837409/list");
        } catch (e) {
            res.send("Error saving file");
        }
    },
    viewList: async function (req, res) {
        let categories = await Cat.find({});
        res.render("event-categories", { categories: categories });
    },
    viewDelete: function (req, res){
        res.render("delete-category");
    },
    delCat: async function (req, res){
        let id = req.body.categoryId;

        let isExist = await Cat.findOne({categoryId: id});

        if(isExist == null){
            res.status(404).json("ID not found");
        } else {
            let delCat = await Cat.deleteOne({categoryId: id});
            let opt = await Operator.findOne({id: optId});
            if(opt) {
                let newNum = opt.deleted + 1;
                let theOpt = await Operator.updateOne(
                    {id: optId},
                    {
                        $set: {
                            deleted: newNum
                        }
                    });
                console.log(theOpt);
            }
            res.redirect("/category/31837409/list");
        }
    },
    listByKeywords: async function (req, res) {
        let keyword = req.query.keyword;
        let categories = await Cat.find({});
        let temp_db = [];

        //Loop through all categories in the database
        for(let i = 0; i < categories.length; i++){
            console.log(categories[i].description);
            let flag = categories[i].description.toLowerCase().includes(keyword.toLowerCase()); //find category's desc. that matches the keyword given
            if(flag === true){ //if flag is true, add that category to the 'temporary database' --
                temp_db.push(categories[i]); //-- used to hold list of categories containing the specified keyword in their desc.
            }
        }

        console.log(temp_db);
        res.render("search-category", {categories: temp_db, keyword: keyword});
    },
    eventDetails: async function (req, res) {
        let eventId = req.params.id; //get the id

        //check if the id is specified or 'def' stands for default
        if (eventId === 'def') { //if it's by default
            let event = await Event.find({});
            let events = await formatEventDates(eventsList);
            res.render("list-event", {events: event}); //display the list of events
        } else { //if it's specified
            let eventData = await Event.findOne({id: eventId}).exec(); //find the event object based on the id provided and assigned it to eventData
            res.render("event-details", {event: eventData}); //display the details of the specified event
        }
    }
    /** Until Here **/
}