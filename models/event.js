
const mongoose = require("mongoose");
const randomstring = require("randomstring");

// Define the Mongoose schema for the Event
const eventSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,  // Ensure unique event IDs
    },
    name: {
        type: String,
        required: true,  // Name is mandatory
    },
    desc: {
        type: String,
        required: true,  // Description is mandatory
    },
    image: String,
    start: {
        type: Date,
        required: true,  // Start date/time is mandatory
    },
    duration: Number,
    end: Date,
    active: Boolean,
    capacity: {
        type: Number,
        validate: {
            validator: Number.isInteger,  // Ensure capacity is an integer
            message: '{VALUE} is not an integer value'
        },
        min: [10, 'Capacity must be at least 10'],   // Minimum capacity of 10
        max: [2000, 'Capacity must be at most 2000'], // Maximum capacity of 2000
    },
    ticket: String,
    catid: String,
    categoryList: [{
        type: mongoose.Schema.Types.ObjectId, // Reference to Category model
        ref: 'Category'  // This refers to the name you'd use when creating a mongoose model for Category
    }]

});

// Pre-save hook to generate a unique ID 
eventSchema.pre("save", function (next) {
    if (!this.id) {
        let randStr = randomstring.generate({
            length: 2,
            charset: "alphabetic",
            capitalization: "uppercase",
        });
        let randNum = Math.round(Math.random() * 9000 + 1000);
        this.id = `E${randStr}-${randNum}`;
    }
    next();
});

// Create the Mongoose model for the Event
const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
