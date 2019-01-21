/**
 * SAP Business One Service Layer module to interact with B1 Data 
 * Server Configuration and User Credentials set in the Cloud Foundry associated B1 Destination and modules/dest/dest-app.json file 
 */
module.exports = {
    // Connect to SAP Business One
    Connect: function (response) {
        return (Connect(response));
    },
    // Get B1 Items through a Service Layer oData service
    GetItems: function (options, response) {
        return (GetItems(options, response));
    }
}

//Load Node Modules
var req = require('request') // HTTP Client

// Load internal odata module
const odata = require('../odata')

// Load internal Destination module 
const Route = require("../dest/Destination");

var SLServer = null;
// Load B1 route and destination (as defined in modules/dest/dest-app.json file)
var b1Route = null;
var b1Dest = null;
Route.getRoute("B1").then(r => {
    b1Route = r;
    console.log("b1Route " + b1Route.target.name);

    // Load B1 destination
    b1Route.getDestination().then(dest => {
        console.log(dest);
        b1Dest = dest;
        SLServer = b1Dest.destinationConfiguration.URL;
    });
});

var connectedStatus = false;

/**
 * Login to B1 Service Layer via /Login oData service
 */
function Connect() {
    return new Promise(function (resolve, reject) {
        var uri = SLServer + "Login"
        var resp = {}

        //B1 Login Credentials
        var destUser = JSON.parse(b1Dest.destinationConfiguration.User);
        var data = {
            UserName: destUser.UserName,
            Password: b1Dest.destinationConfiguration.Password,
            CompanyDB: destUser.CompanyDB
        };

        //Set HTTP Request Options
        options = { uri: uri, body: JSON.stringify(data) }

        //Post Request
        req.post(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {

                body = JSON.parse(body);
                console.log(body)

                resp.cookie = response.headers['set-cookie']
                resp.SessionId = body.SessionId;

                connectedStatus = true;

                resolve(resp);
            } else {
                reject(error, response);
            }
        });
    });
}

/**
 * Get B1 Items via Service Layer /Items oData service
 * @param {*} options 
 * @param {*} callback 
 */
function GetItems(options, callback) {
    var uri = SLServer + "Items?$select=ItemCode,ItemName,"
        + "QuantityOnStock,QuantityOrderedFromVendors,QuantityOrderedByCustomers"
        + "&$filter=ItemsGroupCode%20eq%20103"
    var resp = {}

    // Set HTTP Request Options
    options.uri = uri

    if (!connectedStatus) {
        Connect().then(
            function (resp) {
                options.headers["Cookie"] = resp.cookie;

                // Get Request
                req.get(options, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        body = JSON.parse(body);
                        delete body["odata.metadata"];
                        return callback(null, body);
                    } else {
                        console.error("Error on GetItems " + error);
                        return callback(error);
                    }
                });
            },
            function (error, resp) {
                console.error("Can't Connect to Service Layer");
                console.error(error);
                return; /* Abort Execution */
            });
    }
}