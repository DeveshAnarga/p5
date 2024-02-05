/** File containing the schema for category collection
 * 
 */
const MONGOOSE = require("mongoose"); //to enable the usage of mongoose

/** Represents a Category -
 * @schema
 * @param {string} name - category's name || accept only alphanumeric values
 * @param {string} desc - category's desc
 * @param {string} image - category's image || has default value
 *
 * Additionally, the schema will have the following attributes (by default):
 * @this {string} id - category's id || randomly created using string and number randomisation
 * @this {string} date - category's date || assign object creation date by default using Date obj.
 * */

const CATEGORY_SCHEMA = MONGOOSE.Schema({
    name: {
        type: String,
        required: true,
        validate: {
            validator: function (name){
                return /^[a-zA-Z0-9]+$/.test(name); //only enable alphanumeric value
            },
            message: "Please only input alphanumeric character(s)."
        }
    },
    description: String,
    image: String,
    eventList: [{
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: "Event",
    }, ],
    categoryId: String,
    createdDate: String,
})

//Exporting this module, so it can be used by files that wishes to
module.exports = MONGOOSE.model("Category", CATEGORY_SCHEMA);