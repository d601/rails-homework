// ============================================================================
// AugmentedDate
// ============================================================================

function AugmentedDate(date)
{
  // JSON responses appear to be strings - but don't pass this instanceof test
  if (date instanceof String || date.constructor.name == "String") {
    this.date = new Date(date);
  } else if (date instanceof Date) {
    this.date = date;
  } else { // Remove this when done
    alert("Fatal error!");
  }
}

AugmentedDate.prototype.months = ["January", "Febuary", "March", "April",
                                  "May", "June", "July", "August", "September",
                                  "October", "November", "December"];

AugmentedDate.prototype.getDaysInMonth = function()
{
  // This works because setting the day to 0 actually sets it to the _last_
  // day of the _previous_ month. Therefore, if the month is set ahead by one,
  // day 0 will roll back into the month we are interested in.
  d = new Date(this.date.getFullYear(),
               this.date.getMonth() + 1,
               0);

  return d.getDate();
}

AugmentedDate.prototype.getMonthRange = function()
{
  start = this.getFirstDateInMonth();
  end = new Date(this.date.getFullYear(),
                 this.date.getMonth() + 1,
                 1);

  return [start, end];
}

// Returns a date _object_, not a number.
AugmentedDate.prototype.getFirstDateInMonth = function()
{
  d = new Date(this.date.getFullYear(),
               this.date.getMonth(),
               1);
  return d;
}

// Returns the "day" - a number between 0 to 6 corresponding to Sun - Sat
AugmentedDate.prototype.getFirstDayInMonth = function()
{
  d = this.getFirstDateInMonth();

  return d.getDay();
}

AugmentedDate.prototype.getMonthString = function()
{
  return this.months[this.date.getMonth()];
}

AugmentedDate.prototype.setDateDelta = function(years, months)
{
  this.date = new Date(this.date.getFullYear() + years,
                       this.date.getMonth() + months);
}

// Returns a reference to the calendar cell for the given day in the current
// date's month
// At this point functionality of the calendar is getting mixed with
// functionality of the date - it probably wouldn't be overengineering to
// separate these
AugmentedDate.prototype.getCellFromDay = function(day)
{
  // #cell_ids start at 0
  return $("#cell_" + (day + this.getFirstDayInMonth() - 1));
}

// When we draw the calendar, the current day does not matter, so the previous
// function is provided. However, it's easier to turn JSON date responses into
// AugmentedDate objects and then use this function.
// Note that this doesn't check if the year or month are correct!
AugmentedDate.prototype.getCell = function()
{
  return this.getCellFromDay(this.date.getDate());
}

// ============================================================================
// Utility functions
// ============================================================================

function getNumberOfDaysInMonth(year, month)
{
  return (new Date(year, month + 1, 0)).getDate();
}

function getFirstDayOfMonth(year, month)
{
  return (new Date(year, month, 1)).getDay();
}

function getCurrentDayMonthYear()
{
  return (new Date());
}

function redrawCalendar(date)
{
  $("#month").text(date.getMonthString() + " " + date.date.getFullYear());

  $.get("/appointments",
        { start: (date.getMonthRange()[0]).toJSON(),
          end: (date.getMonthRange()[1]).toJSON() },
        function(data) {
          console.log(JSON.stringify(data));
          $.each(data, function(i, value) {
            addAppointment(new AugmentedDate(value.time),
                           value.description);
          });
        });


  // Clear everything
  for (var i = 0; i < 42; i++) {
    $("#cell_" + i).text("");
    $("#cell_" + i).css("backgroundColor", "white");
    $("#cell_" + i).data("day", "");
  }

  // Add day numbers
  for (var day = 1; day <= date.getDaysInMonth(); day++) {
    date.getCellFromDay(day).text(day);
    date.getCellFromDay(day).data("day", day);
  }

  // Highlight current date if we are on the current month/year
  var d = new Date();
  if (date.date.getFullYear() == d.getFullYear()
      && date.date.getMonth() == d.getMonth()) {
      date.getCellFromDay(d.getDate()).css("backgroundColor", "lightblue");
  }

}
// setMonth() takes a number of years/months to go up or down
// For now don't use values larger than +/- 1, I didn't have the time to do
// the correct math. -js
function setDate(yearsDelta, monthsDelta)
{

  /*
  year += yearsDelta;
  month += monthsDelta;
  
  // Change the year if necessary
  if (month > 11) {
    year += 1;
    month = 0;
  } else if (month < 0) {
    year -= 1;
    month = 11;
  }
*/

  date.setDateDelta(yearsDelta, monthsDelta);

  redrawCalendar(date);
}

function addAppointment(date, text)
{
  if (date instanceof AugmentedDate) {
    element = date.getCell();
  }

  element.append('<div class="event">' + date.date.getHours() + ":"
                 + date.date.getMinutes() + " " + text + '</div>');
}

/*
function postAppointment()
{
  ;
}*/

$(document).ready(function() {
  window.date = new AugmentedDate(new Date());

  // Redraw the calendar so it matches the current date
  redrawCalendar(date);

  //If a click occurs on the table add a div containing the information to be logged. 
  $("#cal_table td").click(function(){
    
      //if the cell is not empty we are able to add otherwise it is an empty cell. Can't add to empty cell.
      if ($(this).html()) {

            // Fail if the user doesn't enter a description
            if ($("#description").val() == "") {
              alert("Please enter a description");
              return;
            }


            appointmentTime = new AugmentedDate(new Date(date.date.getFullYear(),
                                  date.date.getMonth(),
                                  $(this).data("day"),
                                  $("#hour").val(),
                                  $("#minute").val())); 

          addAppointment(appointmentTime, $("#description").val());

        // Month is indexed in ruby - server-side - starting from 1.

            $.post("/appointments",
                   {"appointment[year]": date.date.getFullYear(),
                    "appointment[month]": date.date.getMonth() + 1,
                    "appointment[day]": $(this).data("day"),
                    "appointment[hour]": $("#hour").val(),
                    "appointment[minute]": $("#minute").val(),
                    "appointment[description]": $("#description").val()},
                    function(data) {
                      console.log(data);
                    });

            $("#hour").val($("#hour option:first").val());
            $("#minute").val($("#minute option:first").val());
            $("#description").val('');
      }
  });
});
