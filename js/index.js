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
				$(".responseMessage.signup").html("User registered: " + theAuthedUser['_uuid']);
				console.log(theAuthedUser);
				UUID = theAuthedUser['_uuid'];
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
			$(".responseMessage.login").html("User authenticated: " + theAuthedUser['_accessToken']);
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


function createHouse(MasterId,Devices){
	// Create an application scope bucket named "mydata"
	var appBucket = Kii.bucketWithName("houses");
	// Create the object with key/value pairs
	var obj = appBucket.createObject();
	obj.set("ID", MasterId);
	obj.set("MasterId", UUID);
	obj.set("Devices", Devices);
	
	// Save the object
	obj.save({
	  success: function(theObject) {
		  getUserHouses();
		  return "House created!";
	  },
	  failure: function(theObject, errorString) {
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

function updateBucket(bucket,key,value,fromKey,fromValue){
	// Create/add new values
	var object2 = KiiObject.objectWithURI(object.objectURI());
	object2.set(fromKey, fromValue);
	object2.set(key, value);
	
	// This will append the local key/value pairs to the data
	// that already exists on the server
	object2.save({
	  success: function(theObject) {
		return "Object updated!";
	  },
	  failure: function(theObject, errorString) {
		return "Error updating object: " + errorString;
	  }
	});
}


function getUserHouses(){
	//clear current list of houses (if any)
	$(".housesList").html("");
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
		// do something with the results
		for(var i=0; i<resultSet.length; i++) {
		  // do something with the object resultSet[i];
		  var ID = resultSet[i]['_customInfo']['ID'];
		  var MasterId = resultSet[i]['_customInfo']['MasterId'];
		  var Devices = resultSet[i]['_customInfo']['Devices'];
		  $("body .housesList").append("<li class=\"houseInstance\" data-uri=\"" + resultSet[i].objectURI() + "\"><p>House</p><p class=\"deleteHouse\">Delete</p><p class=\"editHouse\">Edit</p><div class=\"clear\"></div></li>");
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
		$("body").append('<div class="preloader"><img src="img/preloader1.GIF"></div>');	
	} else {
		$(".preloader").fadeOut(400,function(){
			$(this).remove();
		});
	}
}