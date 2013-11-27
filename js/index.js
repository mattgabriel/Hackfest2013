// JavaScript Document
$(document).ready(function(){
	
	// initialize the Kii SDK!
	Kii.initializeWithSite("fff046dd", "6594f5bbabefe32b3cb83c6b2762e683", KiiSite.US);
	
	
}); //document ready


var accessToken = "";
var UUID = "";

// the user clicked the 'sign up' button
function performRegistration() {
	preloader(1);
	// get the user credentials from the UI
	var username = $("#signup-username").val();
	var password = $("#signup-password").val();
	// create the user
	try {
		var user = KiiUser.userWithUsername(username, password);

		// perform the asynchronous registration, with callbacks defined
		user.register({
		
			// callback for successful registration
			success: function(theAuthedUser) {
				
				// tell the console
				Kii.logger("User registered: " + theAuthedUser);
				//$(".responseMessage.signup").html("User registered: " + theAuthedUser['_uuid']);
				console.log(theAuthedUser);
				UUID = theAuthedUser['_uuid'];
				createContact("","",""); //telephone,name,email
				createUserSettings("");//notification
				getUserHouses();
				$(".signupForm, .loginForm").fadeOut();
				preloader(0);
				
			},
			// callback for failed registration
			failure: function(theUser, anErrorString) {
				// tell the user
				$(".responseMessage.signup").html("Unable to register user: " + anErrorString);
				// tell the console
				Kii.logger("Unable to register user: " + anErrorString);
				preloader(0);
			}
		});
	} catch(e) {
		// tell the user
		$(".responseMessage.signup").html("Unable to register user: " + e.message);
		// tell the console
		Kii.logger("Unable to register user: " + e.message);
		preloader(0);
	}
}

// the user clicked the 'sign in' button
function performLogin() {
	preloader(1);
	// get the user credentials from the UI
	var username = $("#login-username").val();
	var password = $("#login-password").val();
	// perform the asynchronous authentication, with callbacks defined
	KiiUser.authenticate(username, password, {
		// callback for successful authentication
		success: function(theAuthedUser) {
			// tell the console
			Kii.logger("User authenticated: " + theAuthedUser);
			//$(".responseMessage.login").html("User authenticated: " + theAuthedUser['_accessToken']);
			//console.log(theAuthedUser);
			UUID = theAuthedUser['_uuid'];
			getUserHouses();
			$(".signupForm, .loginForm").fadeOut();
			preloader(0);
		},
		// callback for failed registration
		failure: function(theUser, anErrorString) {
			// tell the user
			$(".responseMessage.login").html("Unable to register user: " + anErrorString);
			// tell the console
			Kii.logger("Unable to register user: " + anErrorString);
			//console.log(anErrorString);
			preloader(0);
		}
	});
}


function createHouse(HouseId,Devices,HouseName){
	// Create an application scope bucket named "mydata"
	preloader(1);
	var appBucket = Kii.bucketWithName("houses");
	// Create the object with key/value pairs
	var obj = appBucket.createObject();
	obj.set("ID", HouseId);
	obj.set("HouseName", HouseName);
	obj.set("MasterId", UUID);
	obj.set("Devices", Devices);
	obj.set("Contact", "");
	obj.set("Telephone", "");
	obj.set("PostCode", "");
	obj.set("Holiday", 0);
	
	// Save the object
	obj.save({
	  success: function(theObject) {
		  getUserHouses();
		  preloader(0);
		  return "House created!";
	  },
	  failure: function(theObject, errorString) {
		  preloader(0);
		  return "Error saving object: " + errorString;
	  }
	});
}

function createDevice(houseId,deviceId,deviceName,deviceState){
	// Create an application scope bucket named "mydata"
	var appBucket = Kii.bucketWithName("device");
	// Create the object with key/value pairs
	var obj = appBucket.createObject();
	obj.set("houseId", houseId);
	obj.set("deviceId", deviceId);
	obj.set("deviceName", deviceName);
	//obj.set("deviceState", "");
	
	// Save the object
	obj.save({
	  success: function(theObject) {
		return "Device created!";
	  },
	  failure: function(theObject, errorString) {
		return "Error saving device: " + errorString;
	  }
	});
}

function createContact(telephone,name,email){
	// Create an application scope bucket named "mydata"
	var appBucket = Kii.bucketWithName("contact");
	// Create the object with key/value pairs
	var obj = appBucket.createObject();
	obj.set("ID", UUID);
	obj.set("telephone", telephone);
	obj.set("name", name);
	obj.set("email", email);
	
	// Save the object
	obj.save({
	  success: function(theObject) {
		return 'Contact successfully created!';
	  },
	  failure: function(theObject, errorString) {
		return "Error saving contact: " + errorString;
	  }
	});
}

function createUserSettings(pushNotification){
	// Create an application scope bucket named "mydata"
	var appBucket = Kii.bucketWithName("userSettings");
	// Create the object with key/value pairs
	var obj = appBucket.createObject();
	obj.set("ID", UUID);
	obj.set("pushNotification", pushNotification);
	
	// Save the object
	obj.save({
	  success: function(theObject) {
		return 'User Setting successfully created!';
	  },
	  failure: function(theObject, errorString) {
		return "Error saving Setting: " + errorString;
	  }
	});
}

function createRule(startTime,endTime,state,anyTimeOfDay,deviceId,lastUpdated){
	// Create an application scope bucket named "mydata"
	var appBucket = Kii.bucketWithName("rules");
	// Create the object with key/value pairs
	var obj = appBucket.createObject();
	obj.set("ID", UUID);
	obj.set("startTime", startTime);
	obj.set("endTime", endTime);
	obj.set("state", state);
	obj.set("anyTimeOfDay", anyTimeOfDay);
	obj.set("deviceId", deviceId);
	obj.set("lastUpdated", lastUpdated);  //state and time object
	
	// Save the object
	obj.save({
	  success: function(theObject) {
		return 'Rule successfully created!';
	  },
	  failure: function(theObject, errorString) {
		return "Error saving rule: " + errorString;
	  }
	});
}

function updateBucket(key,value,URI){
	// Create/add new values
	var object2 = KiiObject.objectWithURI(URI);
	object2.set(key, value);
	
	object2.save({
	  success: function(theObject) {
		console.log("Object saved!");
		console.log(theObject);
	  },
	  failure: function(theObject, errorString) {
		console.log("Error saving object: " + errorString);
	  }
	});
}


function getUserHouses(){
	// Prepare the target bucket to be queried
	var bucket = Kii.bucketWithName("houses");
	// Build "all" query
	//var all_query = KiiQuery.queryWithClause();
	
	// Create the conditions for the query
	var clause1 = KiiClause.equals("MasterId", UUID);
	
	// Merge the conditions together with an AND
	var totalClause = KiiClause.and(clause1);
	
	// Build the query with the clauses and some other parameters
	var query = KiiQuery.queryWithClause(totalClause);
	query.setLimit(100);
	query.sortByAsc("ID");
	
	// Define the callbacks
	var queryCallbacks = {
	  success: function(queryPerformed, resultSet, nextQuery) {
		  //clear current list of houses (if any)
		$(".myHouses").fadeIn();
		$(".housesList").html("");
		// do something with the results
		if(resultSet.length == 0){
			$("body .housesList").append("<li><p>No houses set up yet.</p></li>");
		}
		
		for(var i=0; i<resultSet.length; i++) {
		  // do something with the object resultSet[i];
		  var HouseName = resultSet[i]['_customInfo']['HouseName'];
		  var ID = resultSet[i]['_customInfo']['ID'];
		  var HouseId = resultSet[i]['_customInfo']['ID'];
		  var Devices = resultSet[i]['_customInfo']['Devices'];
		  if(HouseName == ""){ HouseName = "My House"; }
		  $("body .housesList").append("<li class=\"houseInstance\" data-houseid=\"" + HouseId + "\" data-uri=\"" + resultSet[i].objectURI() + "\"><p>" + HouseName + "</p><p class=\"houseState good\" id=\"houseDevices\">Good <span class=\"ss-icon\">&#x2713;</span></p><p class=\"deleteHouse ss-icon\">&#x2421;</p><p class=\"editHouse ss-icon\">&#x270E;</p><div class=\"clear\"></div></li>");
		  console.log(resultSet[i]);
		}
		if(nextQuery != null) {
		  // There are more results (pages).
		  // Execute the next query to get more results.
		  bucket.executeQuery(nextQuery, queryCallbacks);
		}
	  },
	  failure: function(queryPerformed, anErrorString) {
		// do something with the error response
		return "Error retrieving houses";
	  }
	}
	// Execute the query
	bucket.executeQuery(query, queryCallbacks);
	//return returnValues;
	// alternatively, you can also do:
	// bucket.executeQuery(null, queryCallbacks);
}

function getHouseDetails(houseId){
	preloader(1);
	// Prepare the target bucket to be queried
	var bucket = Kii.bucketWithName("houses");
	// Build "all" query
	//var all_query = KiiQuery.queryWithClause();
	
	// Create the conditions for the query
	var clause1 = KiiClause.equals("ID", houseId);
	
	// Merge the conditions together with an AND
	var totalClause = KiiClause.and(clause1);
	
	// Build the query with the clauses and some other parameters
	var query = KiiQuery.queryWithClause(totalClause);
	query.setLimit(100);
	query.sortByAsc("ID");
	
	// Define the callbacks
	var queryCallbacks = {
	  success: function(queryPerformed, resultSet, nextQuery) {
		  //clear current list of houses (if any)
		$(".houseDetails").fadeIn();
		// do something with the results
		if(resultSet.length == 0){
			$(".houseDetails-fields").append("<p>Nothing found with HouseId = " + houseId + "</p>");
		} else {
			$(".houseDetails-fields").html("");	
		}
		for(var i=0; i<resultSet.length; i++) {
		  // do something with the object resultSet[i];
		  var HouseName = resultSet[i]['_customInfo']['HouseName'];
		  var ID = resultSet[i]['_customInfo']['ID'];
		  var HouseId = resultSet[i]['_customInfo']['ID'];
		  var Devices = resultSet[i]['_customInfo']['Devices'];
		  var Contact = resultSet[i]['_customInfo']['Contact'];
		  var Telephone = resultSet[i]['_customInfo']['Telephone'];
		  var PostCode = resultSet[i]['_customInfo']['PostCode'];
		  var Holiday = resultSet[i]['_customInfo']['Holiday'];
		 
		  var HouseURI = resultSet[i].objectURI();
		  if(HouseName == ""){ HouseName = "My House"; }
		  $(".houseDetails-fields").data("houseuri",HouseURI);
		  $(".houseDetails-fields").append("<input type=\"text\" id=\"HouseName\" placeholder=\"House name\" class=\"formInput\" value=\"" + HouseName + "\">");
		  $(".houseDetails-fields").append("<input type=\"text\" id=\"HouseContact\" placeholder=\"House contact\" class=\"formInput\" value=\"" + Contact + "\">");
		  $(".houseDetails-fields").append("<input type=\"text\" id=\"HouseTelephone\" placeholder=\"House telephone\" class=\"formInput\" value=\"" + Telephone + "\">");
		  $(".houseDetails-fields").append("<input type=\"text\" id=\"HousePostCode\" placeholder=\"House postCode\" class=\"formInput\" value=\"" + PostCode + "\">");
		  preloader(0);
		  console.log(resultSet[i]);
		}
		if(nextQuery != null) {
		  // There are more results (pages).
		  // Execute the next query to get more results.
		  bucket.executeQuery(nextQuery, queryCallbacks);
		}
	  },
	  failure: function(queryPerformed, anErrorString) {
		// do something with the error response
		return "Error retrieving houses";
		preloader(0);
	  }
	}
	// Execute the query
	bucket.executeQuery(query, queryCallbacks);
	//return returnValues;
	// alternatively, you can also do:
	// bucket.executeQuery(null, queryCallbacks);
}

function getHouseDevices(houseId){
	preloader(1);
	// Prepare the target bucket to be queried
	var bucket = Kii.bucketWithName("device");
	// Build "all" query
	//var all_query = KiiQuery.queryWithClause();
	
	// Create the conditions for the query
	var clause1 = KiiClause.equals("houseId", houseId);
	
	// Merge the conditions together with an AND
	var totalClause = KiiClause.and(clause1);
	
	// Build the query with the clauses and some other parameters
	var query = KiiQuery.queryWithClause(totalClause);
	query.setLimit(100);
	query.sortByAsc("ID");
	
	// Define the callbacks
	var queryCallbacks = {
	  success: function(queryPerformed, resultSet, nextQuery) {
		  //clear current list of houses (if any)
		$(".houseDevices-fields").html("");
		$(".houseDevices").fadeIn();
		// do something with the results
		if(resultSet.length == 0){
			$(".houseDevices-fields").append("<li><p>No devices assigned to this house yet.</p></li>");
		} else {
			$(".houseDevices-fields").html("");	
		}
		$(".houseDevices-fields").data("houseid",houseId);
		preloader(0);
		for(var i=0; i<resultSet.length; i++) {
		  // do something with the object resultSet[i];
		  var deviceId = resultSet[i]['_customInfo']['deviceId'];
		  var deviceName = resultSet[i]['_customInfo']['deviceName'];
		  var deviceURI = resultSet[i].objectURI();
		  
		  $(".houseDevices-fields ul").append("<li data-deviceid=\"" + deviceId + "\" data-deviceuri=\"" + deviceURI + "\"><h3>" + deviceName + "</h3><p class=\"deviceState\">Active</p><p class=\"deviceUpdated\">2 hours ago</p></li>");
		  
		  console.log(resultSet[i]);
		}
		if(nextQuery != null) {
		  // There are more results (pages).
		  // Execute the next query to get more results.
		  bucket.executeQuery(nextQuery, queryCallbacks);
		}
	  },
	  failure: function(queryPerformed, anErrorString) {
		// do something with the error response
		return "Error retrieving houses";
		preloader(0);
	  }
	}
	// Execute the query
	bucket.executeQuery(query, queryCallbacks);
	//return returnValues;
	// alternatively, you can also do:
	// bucket.executeQuery(null, queryCallbacks);
}

function deleteObject(objectURI){
	var object = KiiObject.objectWithURI(objectURI);
	// Delete the Object
	object.delete({
	  success: function(theDeletedObject) {
		return "Object deleted!";
	  },
	  failure: function(theObject, errorString) {
		return "Error deleting object: " + errorString;
	  }
	});
}


function preloader(state){
	if(state == 1){
		$("body").prepend('<div class="preloader"><img src="img/preloader1.GIF"></div>');	
	} else {
		$(".preloader").fadeOut(400,function(){
			$(this).remove();
		});
	}
}

function generateId(){
	return Math.floor((Math.random()*10000000000)+1);	
}