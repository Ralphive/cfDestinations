/* Service Layer module to interact with B1 Data */
/* Server Configuration and User Credentials set in the /config.json file */
module.exports = {
    Connect: function (response) {
        return (Connect(response));
    },
    GetItems: function (options, response) {
        return (GetItems(options, response));
    }
}

//Load Node Modules
var req = require('request') // HTTP Client

const odata = require('../odata')

//Destinations 
const Route = require("../dest/Destination");

var SLServer = null;
// Load ByD route and destination
var b1Route = null;
var b1Dest = null;
Route.getRoute("B1").then(r => {
    b1Route = r;
    console.log("b1Route " + b1Route.target.name);

    // Load destination
    b1Route.getDestination().then(dest => {
        console.log(dest);
        b1Dest = dest;
        SLServer = b1Dest.destinationConfiguration.URL;
    });
});

var connectedStatus = false;

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

        //Make Request
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

function GetItems(options, callback) {
    var uri = SLServer + "Items?$select=ItemCode,ItemName,"
        + "QuantityOnStock,QuantityOrderedFromVendors,QuantityOrderedByCustomers"
        + "&$filter=ItemsGroupCode%20eq%20103"
    var resp = {}

    //Set HTTP Request Options
    options.uri = uri

    if (!connectedStatus) {
        Connect().then(
            function (resp) {
                options.headers["Cookie"] = resp.cookie;

                //Make Request
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
                return; // Abort Execution
            });
    }
}