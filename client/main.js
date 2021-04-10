"use strict";

/**
 * Persist affected member details to covid data store
 */
function postAffectedMemberDetails() {
  var fName = $("#first-name-input").val();
  var lName = $("#last-name-input").val();
  var phone = $("#phone-number-input").val();
  var city = $("#city-post-input").val();
  if (
    fName.length == 0 ||
    lName.length == 0 ||
    phone.length == 0 ||
    city.length == 0
  ) {
    alert("Provide valid details of affected member!");
    resetForm();
    return;
  }
  $.ajax({
    url: "/server/covid_portal_function/member",
    type: "post",
    contentType: "application/json",
    data: JSON.stringify({
      first_name: fName,
      last_name: lName,
      phone_number: phone,
      city_name: city,
    }),
    success: function (data) {
      alert(data.message);
      resetForm();
    },
    error: function (error) {
      alert(error.message);
      resetForm();
    },
  });
}

/**
 * Get number of affected members from search city
 */
function getAffectedMembers() {
  showLoader();
  var city = $("#city-get-input").val();
  $.ajax({
    url: "/server/covid_portal_function/city?city_name=" + city,
    type: "get",
    success: function (data) {
      hideLoader();
      $("#result-text").text("");
      $("#result-text").text(data.message);
    },
    errror: function (error) {
      alert(error.message);
    },
  });
}

/**
 * Preview progress loader
 */
function showLoader() {
  $("#result-container").hide();
  $("#loader").show();
}

/**
 * Hide progress loader
 */
function hideLoader() {
  $("#loader").hide();
  $("#result-container").show();
}

/**
 * Preview city wise count of affected members
 */
function pullCityWiseAffectedMembers() {
  $.ajax({
    url: "/server/covid_portal_function/admin/members",
    type: "get",
    contentType: "application/json",
    success: function (response) {
      $("#table").bootstrapTable({
        data: response.data,
        pagination: false,
        search: true,
        columns: [
          {
            field: "city",
            title: "Affected City",
          },
          {
            field: "count",
            title: "Count",
          },
        ],
      });
      $("#table").bootstrapTable('load', response.data);
      $("#table").on("click-row.bs.table", function (row, element, field) {
        pullAffectedMembersDetails(element);
      });
    },
    error: function (error) {
      alert(error.message);
    },
  });
}

/**
 * Preview affected members details of selected city
 * @param {*} row
 */
function pullAffectedMembersDetails(row) {
  var city = row.city;
  $.ajax({
    url: "/server/covid_portal_function/admin/members/city?city_name=" + city,
    type: "get",
    contentType: "application/json",
    success: function (response) {
      $("#table2").bootstrapTable({
        data: response.data,
        pagination: true,
        columns: [
          {
            field: "fName",
            title: "First Name",
          },
          {
            field: "lName",
            title: "Last Name",
          },
          {
            field: "city",
            title: "City",
          },
        ],
      });
      $("#table2").bootstrapTable('load', response.data);
      $("#modalTable").modal("show");
    },
    error: function (error) {
      alert(error.message);
    },
  });
}

/**
 * Check if signed in user is authorized to preview details.
 */
function checkAuthorized() {
  catalyst.auth
    .isUserAuthenticated()
    .then((result) => {
      document.getElementById("lname").innerHTML =
        "Welcome " + result.content.first_name + " " + result.content.last_name;
      pullCityWiseAffectedMembers();
    })
    .catch((err) => {
      console.log(err);
      document.body.style.visibility = "visible";
      document.body.innerHTML =
        "You are not logged in. Please log in to continue. Redirecting you to the login page..";
      setTimeout(function () {
        window.location.href = "index.html";
      }, 5000);
    });
}

/**
 * Perform logout action
 */
function logout() {
  var redirectURL = "http://" + document.domain + "/app/index.html";
  var auth = catalyst.auth;
  auth.signOut(redirectURL);
}

/**
 * Reload page for admin sign in.
 */
function moveToSignIn() {
  window.location.replace("/app/signin.html");
}

/**
 * Reset form data
 */
function resetForm() {
  $("#first-name-input").val('');
  $("#last-name-input").val('');
  $("#phone-number-input").val('');
  $("#city-post-input").val('');
}
