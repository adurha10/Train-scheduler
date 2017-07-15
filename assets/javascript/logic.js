// Initialize Firebase
var config = {
  apiKey: "AIzaSyCI7RpY5p86EjcdpE6u0mWJmSsfqs8gUzs",
  authDomain: "employee-data-mgmt-fe16b.firebaseapp.com",
  databaseURL: "https://employee-data-mgmt-fe16b.firebaseio.com",
  projectId: "employee-data-mgmt-fe16b",
  storageBucket: "employee-data-mgmt-fe16b.appspot.com",
  messagingSenderId: "485587441571"
};

firebase.initializeApp(config);

// Set "database" variable for brevity
var database = firebase.database();

// Array to hold all scheduled trains
var schedule = [];

$('#add-train').validate({ // initialize the plugin
  rules: {
    nameForm: {
    required: true,
    },
    destForm: {
    required: true,
    },
    startForm: {
    required: true,
    time: true,
    },
    freqForm: {
    required: true,
    digits: true,
    maxlength: 4,
    min: 1,
    }
  },
  messages: {
    nameForm: "Train name is required",
    destForm: "Destination is required",
    startForm: {
      required: "Start time of train required",
      time: "Please input a time in the format: HH:mm"
    },
    freqForm: {
      required: "Frequency of train required",
      digits: "Please input the number of minutes",
      maxlength: "Time must be less than 9999 minutes",
      min: "Time must be greater than 0"
    }
  },
  errorPlacement: function(error, element) {
    $('#error-container').append(error)
  }
});


// Submit button click event listener
$("#data-submit").on("click", function(){
  // Prevent form submission before grabbing values
  event.preventDefault();

  var form = $("#add-train");
  if(form.valid()){  
    // Grab user input and store in variables
    var name = $("#train-name").val().trim();
    var dest = $("#train-dest").val().trim();
    var start = $("#train-start").val().trim();
    var freq = $("#train-freq").val().trim();

    // Store user input in object for Firebase
    var empObj = {
  	name: name,
  	dest: dest,
  	start: start,
  	freq: freq 			
    }

    // Pass user input object to Firebase
    database.ref().push(empObj);

    // Reset form fields for additional input
    $("#train-name").val("");
    $("#train-dest").val("");
    $("#train-start").val("");
    $("#train-freq").val("");
  }
});

// Event listener to populate and update schedule panel
database.ref().on("child_added", function(snapshot){

  // Saves Firebase object as variable for brevity
	var lastObj = snapshot.val();
	
  // Push train into schedule array
  schedule.push(lastObj);

  // Creates new row on table
  var newRow = $("<tr>");
  newRow.attr("id", schedule.indexOf(lastObj));
  		
  // Creates new data entries for row on table 
  var newName = $("<td>");
  var newDest = $("<td>");
  var newStart = $("<td>");
  var newFreq = $("<td>");
  		
  // Sets text for all data entries for this row
  newName.text(lastObj.name);
  newDest.text(lastObj.dest);
  newStart.text(lastObj.start);
  newFreq.text(lastObj.freq);

  // Appends all data entries to appropriate row
  newRow.append(newName);
  newRow.append(newDest);
  newRow.append(newStart);
  newRow.append(newFreq);

  // Appends new row to document in the schedule panel
  $("#train-container").append(newRow);
}, function(errorObject){
  console.log("Errors Handled: " + errorObject.code);
});

function arrivalHandler(){
  // Update currentTime variable to current second 
  var currentTime = moment();
  
  // Display current time in document
  $("#current-time").text(currentTime);

  // Run through all trains on schedule and update "Next Arrival" and "Minutes Away"
  for (var i = schedule.length - 1; i >= 0; i--) {
    
    // Save current train to variable for brevity
    var trainObj = schedule[i];

    var startTime = moment(trainObj.start, "hh:mm");

    // Difference between the times
    if (moment().diff(moment(startTime), "minutes") > 0){
      var diffTime = moment().diff(moment(startTime), "minutes");
      
      var remainder = diffTime % trainObj.freq;
    
      var tillArrival = trainObj.freq - remainder;

      var nextTrain = moment().add(tillArrival, "minutes").format("HH:mm");
      


      if ($("#next-train" + i).length) {
        $("#next-train" + i).text(nextTrain);
      } else{
        var newNextTrain = $("<td>");
        newNextTrain.attr("id", "next-train" + i);
        newNextTrain.text(nextTrain);
        $("#" + i).append(newNextTrain);
      }

      if ($("#till-arrival" + i).length) {
        $("#till-arrival" + i).text(tillArrival);
      } else{
        var newArrival = $("<td>");
        newArrival.attr("id", "till-arrival" + i);
        newArrival.text(tillArrival);
        $("#" + i).append(newArrival);
      }

    } else{
      nextTrain = moment(startTime).format("HH:mm");
      tillArrival = moment(startTime).diff(moment(), "minutes");
      
      if ($("#next-train" + i).length) {
        $("#next-train" + i).text(nextTrain);
      } else{
        var newNextTrain = $("<td>");
        newNextTrain.attr("id", "next-train" + i);
        newNextTrain.text(nextTrain);
        $("#" + i).append(newNextTrain);
      }

      if ($("#till-arrival" + i).length) {
        $("#till-arrival" + i).text(tillArrival);
      } else{
        var newArrival = $("<td>");
        newArrival.attr("id", "till-arrival" + i);
        newArrival.text(tillArrival);
        $("#" + i).append(newArrival);
      }
    };
  };

};
// Updates schedule panel to show current "next arrival times"
setInterval(arrivalHandler, 1000);