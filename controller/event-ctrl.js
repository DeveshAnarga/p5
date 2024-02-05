let Event = require("../models/event"); //require Event model
const Cat = require("../models/category");
const Operator = require("../models/operator");

let optId = "tracker"; //default for operator
// =====================
// HELPER FUNCTIONS
// =====================

/**
 * Format a given date string to a human-readable string.
 * @param {string} inputDateString - The date string to format.
 * @returns {string} - Formatted date string or "Invalid date".
 */
function formatDate(inputDateString) {
    const inputDate = new Date(inputDateString);
    if (isNaN(inputDate.getTime())) {
        return "Invalid date";
    }
    return inputDate.toLocaleString();
}

/**
 * Converts a given number of minutes .
 * @param {number} minutes - The duration in minutes.
 * @returns {string} - Formatted duration string.
 */
function formatMinutes(minutes) {
    if (isNaN(minutes) || minutes < 0) {
        return "Invalid input";
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) return `${remainingMinutes} minutes`;
    if (remainingMinutes === 0) return `${hours} hours`;

    return `${hours} hours and ${remainingMinutes} minutes`;
}

/**
 * Calculate the event end time using its start time and duration.
 * @param {string} startDateStr - Start date of the event.
 * @param {number} durationInMinutes - Duration of the event in minutes.
 * @returns {string} - End date/time of the event.
 */
function formatEnd(startDateStr, durationInMinutes) {
    const startDate = new Date(startDateStr);
    if (isNaN(startDate.getTime())) {
        return "Invalid start date";
    }

    // Adding the duration to the start time
    startDate.setMinutes(startDate.getMinutes() + durationInMinutes);

    return formatDate(startDate);
}

/**
 * Format dates and duration for a list of events.
 * @param {Array} eventsList - List of events.
 * @returns {Array} - Events with formatted dates and duration.
 */
async function formatEventDates(eventsList) {
    return eventsList.map((event) => ({
        ...event._doc,
        start: formatDate(event.start),
        duration: formatMinutes(event.duration),
        end: formatEnd(event.start, event.duration),
    }));
}

// ==============================
// EVENT CONTROLLERS
// ==============================

/**
 * Extracts event details from the request body and saves them in the database.
 * @param {Object} req - Request object containing event details.
 * @param {Object} res - Response object used to communicate back to the client.
 */

module.exports = {
    createEve: async function (req, res) {
        let reqBody = req.body;

        const newEvent = new Event({
            name: reqBody.EventName,
            desc: reqBody.EventDesc,
            image: reqBody.EventImage,
            start: reqBody.EventStart,
            end: reqBody.Eventend,
            duration: reqBody.EventDuration,
            active: reqBody.EventActive == "on" ? true : false,
            capacity: reqBody.EventCapacity,
            ticket: reqBody.EventTicket,
            catid: reqBody.EventID,
        });

        try {
            // Save the new event to the database
            await newEvent.save();

            let isExist = await Operator.countDocuments();
            if (isExist === 0) {
                //if no entity has been created for operator, create one

                let anOpt = new Operator({
                    id: "tracker",
                    created: 1,
                    deleted: 0,
                    updated: 0,
                });
                await anOpt.save();
            } else {
                //else, update that entity
                let opt = await Operator.findOne({ id: optId });

                if (opt) {
                    let newNum = opt.created + 1;
                    let theOpt = await Operator.updateOne(
                        { id: optId },
                        {
                            $set: {
                                created: newNum,
                            },
                        }
                    );
                    console.log(theOpt);
                }
            }


            res.redirect("/api/v1/event/32818866/list");
        } catch (error) {
            console.error("Error saving event:", error);
            res.status(500).send("Error saving event.");
        }
    },

    // **API Event Creation**
    // Add a new event via API and save to database
    createEveApi: async function (req, res) {
        let reqBody = req.body;

        const newEvent = new Event({
            name: reqBody.name,
            desc: reqBody.description,
            start: reqBody.startDateTime,
            duration: reqBody.durationInminutes,
            capacity: reqBody.capacity,
            catid: reqBody.EventID,
        });

        try {
            await newEvent.save();
            let catid = reqBody.EventID;
            let theCat = await Cat.findOne({categoryId : catid});
            theCat.eventList.push(newEvent._id);
            await theCat.save();
            
    
            res.status(200).send("Event added successfully.");
        } catch (error) {
            console.error("Error saving event:", error);
            res.status(500).send("Error saving event.");
        }
    },

    // **Event View Functions**

    // Render the "Add Event" page
    viewAdd: async function (req, res) {
        res.render("add-event");
    },

    // Retrieve and display a list of all events 
    viewList: async function (req, res) {
        try {
            const eventsList = await Event.find();
            let events = await formatEventDates(eventsList);
            res.render("list-event", { events });
        } catch (error) {
            console.error("Error retrieving events:", error);
            res.status(500).send("Error retrieving events.");
        }
    },

    // Retrieve and display a list of all events 
    viewCatList: async function (req, res) {
        const category = req.query.id;
        try {
            const eventsList = await Event.find({ category });
            let events = await formatEventDates(eventsList);
            res.render("list-event", { events });
        } catch (error) {
            console.error("Error retrieving events:", error);
            res.status(500).send("Error retrieving events.");
        }
    },

    // Retrieve and display sold-out events
    viewSoldList: async function (req, res) {
        try {
            const eventsList = await Event.find({ ticket: 0 });
            let events = await formatEventDates(eventsList);
            res.render("sold-event", { events });
        } catch (error) {
            console.error("Error retrieving sold-out events:", error);
            res.status(500).send("Error retrieving sold-out events.");
        }
    },

    // **Event Operations**

    // Delete a specific event based on its ID
    deleteById: async function (req, res) {
        const idToDelete = req.query.id;
    
        if (!idToDelete) {
            return res.status(400).send("No ID provided for deletion.");
        }
    
        try {
            // Check if the event with the specified ID exists
            const foundEvent = await Event.findOne({ id: idToDelete });
            
            if (!foundEvent) {
                return res.status(404).send("Event with provided ID not found.");
            }
    
            // Delete associated categories
            for (let i = 0; i < foundEvent.categoryList.length; i++) {
                await Cat.deleteOne({ _id: foundEvent.categoryList[i] });
            }
    
            // Delete the event itself
            await Event.deleteOne({ id: idToDelete });
    
            // Update the operator count for deleted events
            let opt = await Operator.findOne({ id: optId });
            if (opt) {
                let newNum = opt.deleted + 1;
                await Operator.updateOne({ id: optId }, { $set: { deleted: newNum } });
            }
    
            res.status(200).send("Event and associated categories deleted successfully.");
        } catch (error) {
            console.error("Error deleting event:", error);
            res.status(500).send("Error deleting event.");
        }
    },
    
    

    // View detailed info of a specific event, or all events if ID is 'def'
    viewById: async function (req, res) {
        let eventId = req.params.id;

        try {
            if (eventId === "def") {
                const events = await Event.find();
                res.render("list-event", { events });
            } else {
                const event = await Event.findOne({ id: eventId });
                res.render("event-details", { event });
            }
        } catch (error) {
            console.error("Error retrieving event details:", error);
            res.status(500).send("Error retrieving event details.");
        }
    },

    // Retrieve all events and send them as a response
    allEvents: async function (req, res) {
        try {
            const eventsList = await Event.find();
            let events = await formatEventDates(eventsList);
            res.render("list-event", { events });
        } catch (error) {
            console.error("Error retrieving events:", error);
            res.status(500).send("Error retrieving events.");
        }
    },

    updateEvent: async function (req, res) {
        
        let reqEvent = req.body.eventId;
    
        // Use consistent field name
        let theEvent = await Event.updateOne(
            { EventId: reqEvent }, 
            {
                $set: {
                    name: req.body.name,
                    capacity: req.body.capacity
                }
            }
        );
    
        // Check for the successful update
        if (theEvent.nModified === 1) {  // Use nModified to check if a document was modified
            let opt = await Operator.findOne({ id: optId });
    
            if (opt) {
                let newNum = opt.updated + 1;
                await Operator.updateOne(
                    { id: optId }, 
                    {
                        $set: {
                            updated: newNum
                        }
                    }
                );
            }
            res.status(200).json({ status: "updated successfully" });
        } else {
            res.status(400).json({ status: "ID not found or no updates made" });  
        }
    },
    

    catDetails: async function (req, res) {
        let catId = req.params.id; //get the id
        console.log(catId)

        //check if the id is specified or 'def' stands for default
        if (catId === 'def') { //if it's by default
            let cat = await Cat.find({});
            res.render("event-categories", {categories: cat}); //display the list of categories
        } else { //if it's specified
            
            let catData = await Cat.findOne({id: catId}).exec(); //find the event object based on the id provided and assigned it to catData
            res.render("category-details", {cat: catData}); //display the details of the specified category
        }
    }

    

   
};
