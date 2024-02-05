/** File containing the schema for Operator collection
 * 
 */
const MONGOOSE = require("mongoose"); //to enable the usage of mongoose

/** Represents a Category -
 * @schema
 * @param {string} id - operator's name || by default will be set to tracker
 * @param {number} created - updated when a 'creation' happened
 * @param {number} deleted - updated when a 'deletion' happened
 * @param {number} updated - updated when an 'update' happened
 * */
const OPERATOR_SCHEMA = MONGOOSE.Schema({
    id: String,
    created: Number,
    deleted: Number,
    updated: Number,
})

//Exporting this module, so it can be used by files that wishes to
module.exports = MONGOOSE.model("Operator", OPERATOR_SCHEMA);