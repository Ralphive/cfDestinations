/* Module to manipulate ByD data */

module.exports = {
    GetItems: function (options, callback) {
        return (GetItems(options, callback))
    }
}

const request = require('request')  // HTTP Client

const odata = require('../odata')

//ByD Models
const model_items = "/byd_items/MaterialCollection"

//Destinations
const Route = require("../dest/Destination");

// Load ByD route and destination
var bydRoute = null;
var bydDest = null;
Route.getRoute("ByD").then(r => {
    bydRoute = r;
    console.log("bydRoute " + bydRoute.target.name);

    // Load destination
    // destination based on route, need to wait!
    bydRoute.getDestination().then(dest => {
        console.log(dest);
        bydDest = dest;
    });
});


function ByDRequest(options, callback) {

    if (options.headers == null) { options.headers = [] }

    options.headers["Accept"] = "application/json"
    options.headers["Content-Type"] = "application/json"
    options.headers["Authorization"] = "Basic " + bydDest.authTokens[0].value

    request(options, function (error, response, body) {
        if (error) {
            console.error(error.message)
        } else {
            if (response.statusCode == 403) {
                console.log("Invalid CSRF token. ")
            } else {
                callback(error, response, JSON.parse(body));
            }
        }
    });
}

function GetItems(query, callback) {
    var options = {};
    var select = "" //"InternalID,Description,BaseMeasureUnitCode"

    if (query && query.hasOwnProperty("$filter")) {
        query["$filter"] = query["$filter"].replace(new RegExp('productid', 'g'), "InternalID")
    } else {
        if (!query) { query = []; }
    }

    query["$expand"] = "MaterialTextCollection"

    options.url = bydDest.destinationConfiguration.URL + bydRoute.target.entryPath + model_items
    options.method = "GET"
    options.qs = odata.formatQuery(query, select)

    ByDRequest(options, function (error, response, bodyItems) {
        if (error) {
            callback(error);
        } else {

            callback(null, bodyItems);
        }
    });
}
