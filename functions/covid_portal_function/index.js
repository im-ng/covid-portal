//
"use strict";

var catalyst = require("zcatalyst-sdk-node");
var express = require("express");
var app = express();

//COVID MEMBER TABLE
const covid_member_table = "covid_member";

//COLUMN NAMES
const firstNameColumn = "FIRSTNAME";
const lastNameColumn = "LASTNAME";
const phoneNumberColumn = "PHONENUMBER";
const cityNameColumn = "CITY";

//Initialize express app
app.use(express.json());

/**
 * Returns map of affected members count against city
 * API returns valid response only for authenticated users.
 *
 * @param {*} req
 * @param {*} res
 */
app.get("/admin/members", (req, res) => {
  // console.log(req);
  var catalystApp = catalyst.initialize(req);
  //
  let userManagement = catalystApp.userManagement();
  let userPromise = userManagement.getCurrentUser();
  userPromise
    .then((currentUser) => {
      getAllAffectedMembersByCity(catalystApp)
        .then((rows) => {
          var data = [];
          rows.forEach((element) => {
            var d = {};
            d.city = element.covid_member.CITY;
            d.count = element.covid_member.ROWID;
            data.push(d);
          });
          res.send({
            data: data,
          });
        })
        .catch((err) => {
          console.log(err);
          sendErrorResponse(res);
        });
    })
    .catch((err) => {
      console.log(err);
      sendErrorResponse(res);
    });
});

/**
 * Returns count of affected members of city being queried.
 * @param {*} req
 * @param {*} res
 */
app.get("/admin/members/city", (req, res) => {
  var city = req.query.city_name;
  // Initializing Catalyst SDK
  var catalystApp = catalyst.initialize(req);
  //
  let userManagement = catalystApp.userManagement();
  let userPromise = userManagement.getCurrentUser();
  userPromise
    .then((currentUser) => {
      // Queries the Catalyst Data Store table and checks whether a row is present for the given city
      getCityWiseDataFromCatalyst(catalystApp, city)
        .then((rows) => {
          var data = [];
          rows.forEach((element) => {
            var d = {};
            d.fName = element.covid_member.FIRSTNAME;
            d.lName = element.covid_member.LASTNAME;
            d.city  = element.covid_member.CITY;
            data.push(d);
          });
          res.send({
            data: data,
          });
        })
        .catch((err) => {
          console.log(err);
          sendErrorResponse(res);
        });
    })
    .catch((err) => {
      console.log(err);
      sendErrorResponse(res);
    });
});

/**
 * Add a new affected member into datastore and returns success message.
 * Check if member already in data store and returns a warning.
 *
 * @param {*} req
 * @param {*} res
 */
app.post("/member", (req, res) => {
  const data = req.body;
  var catalystApp = catalyst.initialize(req);
  getDataFromCatalystDataStore(
    catalystApp,
    data.first_name,
    data.phone_number,
    data.city_name
  )
    .then((row) => {
      if (row.length == 0) {
        var rowData = {};
        rowData[firstNameColumn] = data.first_name;
        rowData[lastNameColumn] = data.last_name;
        rowData[phoneNumberColumn] = data.phone_number;
        rowData[cityNameColumn] = data.city_name;

        var rowArr = [];
        rowArr.push(rowData);
        catalystApp
          .datastore()
          .table(covid_member_table)
          .insertRows(rowArr)
          .then((cityInsertResp) => {
            res.send({
              message: "Thanks for reporting!",
            });
          })
          .catch((err) => {
            console.log(err);
            sendErrorResponse(res);
          });
      } else {
        res.send({
          message:
            "Looks like the member being added already to affected pool! Thanks for reporting!",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      sendErrorResponse(res);
    });
});

/**
 * Returns count of affected members of city being queried.
 * @param {*} req
 * @param {*} res
 */
app.get("/city", (req, res) => {
  var city = req.query.city_name;
  // Initializing Catalyst SDK
  var catalystApp = catalyst.initialize(req);
  // Queries the Catalyst Data Store table and checks whether a row is present for the given city
  getCityWiseDataFromCatalyst(catalystApp, city)
    .then((rows) => {
      if (rows.length == 0) {
        res.send({
          message: "Your city seems in non-affected zone!",
          count: 0,
        });
      } else {
        var count = rows.length;
        var message = `Your city seems in affected zone! With total of ${count} affected member(s).`;
        res.send({
          message: message,
          count: count,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      sendErrorResponse(res);
    });
});

/**
 * Pull all affected members per city
 * @param {*} catalystApp
 */
function getAllAffectedMembersByCity(catalystApp) {
  return new Promise((resolve, reject) => {
    catalystApp
      .zcql()
      .executeZCQLQuery(
        "SELECT COUNT(ROWID), CITY FROM covid_member GROUP BY CITY ORDER BY CITY"
      )
      .then((queryResponse) => {
        resolve(queryResponse);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/**
 * Pull citywise affected members data
 * @param {*} catalystApp
 * @param {*} cityName
 */
function getCityWiseDataFromCatalyst(catalystApp, cityName) {
  return new Promise((resolve, reject) => {
    catalystApp
      .zcql()
      .executeZCQLQuery(
        "Select * from " +
          covid_member_table +
          " where " +
          cityNameColumn +
          "='" +
          cityName +
          "'"
      )
      .then((queryResponse) => {
        resolve(queryResponse);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/**
 * Checks whether an affected member is already reported for the given city by querying the Data Store table
 * @param {*} catalystApp
 * @param {*} firstName
 * @param {*} phoneNumber
 * @param {*} cityName
 */
function getDataFromCatalystDataStore(
  catalystApp,
  firstName,
  phoneNumber,
  cityName
) {
  return new Promise((resolve, reject) => {
    catalystApp
      .zcql()
      .executeZCQLQuery(
        "Select * from " +
          covid_member_table +
          " where " +
          firstNameColumn +
          "='" +
          firstName +
          "'" +
          " and " +
          phoneNumberColumn +
          "='" +
          phoneNumber +
          "'" +
          " and " +
          cityNameColumn +
          "='" +
          cityName +
          "'"
      )
      .then((queryResponse) => {
        resolve(queryResponse);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/**
 * Sends an error response
 * @param {*} res
 */
function sendErrorResponse(res) {
  res.status(500);
  res.send({
    error: "Internal server error occurred. Please try again in some time.",
  });
}
module.exports = app;
