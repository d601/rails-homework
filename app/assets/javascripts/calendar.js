/*
  Todo:

  AugmentedDate is a Date, but this is represented with a has-a relationship.
  This leads to ugly code like date.date.getDay(). As far as I'm aware there's
  no way around this because of Javascript's lack of actual inheritance.

  AugmentedDate and Calendar both have functions that are similar to eachother
  because some actions are done live and some done as a response to JSON data.
  The way this is represented could probably be cleaned up a bit.

  Changing the date makes the calendar move around/resize.

  Graphics could be improved.

  javascript:calendar.setDate() calls are ugly.

  Adding appointments could be encapsulated more nicely.

  -js
*/

// ============================================================================
// AugmentedDate
// ============================================================================

function AugmentedDate(date)
{
  if (!date) {
    this.date = new Date();
  // JSON responses appear to be strings - but don't pass this instanceof test
  } else if (date instanceof String || date.constructor.name == "String") {
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


/*
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

*/

// ============================================================================
// Calendar
// ============================================================================

// Ideally this would be a singleton - but javascript is not very expressive,
// and figuring out how to do this properly will take a good amount of time.
function Calendar()
{
  this.date = new AugmentedDate();
}


Calendar.prototype.redraw = function()
{
  $("#month").text(this.date.getMonthString() + " " + this.date.date.getFullYear());

  // Clear everything
  for (var i = 0; i < 42; i++) {
    getCell(i).text("");
    getCell(i).css("backgroundColor", "white");
    getCell(i).data("day", "");
  }

  // Add day numbers
  for (var day = 1; day <= this.date.getDaysInMonth(); day++) {
    this.getCellFromDay(day).text(day);
    this.getCellFromDay(day).data("day", day);
  }

  // Highlight current date if we are on the current month/year
  var d = new Date();
  if (this.date.date.getFullYear() == d.getFullYear()
      && this.date.date.getMonth() == d.getMonth()) {
      this.getCellFromDay(d.getDate()).css("backgroundColor", "lightblue");
  }

  // Load appointments from server
  $.get("/appointments",
        { start: (this.date.getMonthRange()[0]).toJSON(),
          end: (this.date.getMonthRange()[1]).toJSON() },
        function(data) {
          console.log(JSON.stringify(data));
          $.each(data, function(i, value) {
            window.calendar.addAppointment(new AugmentedDate(value.time),
                           value.description);
          });
        });
}

Calendar.prototype.setDate = function(yearsDelta, monthsDelta)
{
  this.date.setDateDelta(yearsDelta, monthsDelta);

  this.redraw();
}

Calendar.prototype.addAppointment = function(date, text)
{
  if (date instanceof AugmentedDate) {
    element = this.getCellFromDate(date);
  }

  element.append(appointmentMarkup(date.date.getHours(),
                                   date.date.getMinutes(),
                                   text));
}

Calendar.prototype.addAppointmentFromForm = function(element)
{
  element.append(appointmentMarkup($("#hour"),
                                   $("#minute"),
                                   $("#description").val())); 
 }
 
// day is a number - use when generating default cell values
Calendar.prototype.getCellFromDay = function(day)
{
  return getCell((day + this.date.getFirstDayInMonth() - 1));
}

// date is an AugmentedDate object - use for JSON responses
// This does not check if the month/year are wrong
Calendar.prototype.getCellFromDate = function(date)
{
  return this.getCellFromDay(date.date.getDay());
}
  

// ============================================================================
// Utility functions
// ============================================================================

function appointmentMarkup(hours, minutes, text)
{
  return '<div class="event">' + hours + ":" + minutes + " " + text + '</div>';
}

function getCell(id)
{
  return $("#cell_" + id);
}

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

/*
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

} */

/*
function setDate(yearsDelta, monthsDelta)
{
  date.setDateDelta(yearsDelta, monthsDelta);

  redrawCalendar(date);
} */

/*
function addAppointment(date, text)
{
  if (date instanceof AugmentedDate) {
    element = date.getCell();
  }

  element.append('<div class="event">' + date.date.getHours() + ":"
                 + date.date.getMinutes() + " " + text + '</div>');
}

*/

$(document).ready(function() {

  window.calendar = new Calendar();

  // window.date = new AugmentedDate(new Date());

  // Redraw the calendar so it matches the current date
  calendar.redraw();

  //If a click occurs on the table add a div containing the information to be logged. 
  $("#cal_table td").click(function(){
    
    //if the cell is not empty we are able to add otherwise it is an empty cell. Can't add to empty cell.
    if ($(this).html()) {

      // Fail if the user doesn't enter a description
      if ($("#description").val() == "") {
        alert("Please enter a description");
        return;
      }


      appointmentTime = new AugmentedDate(new Date(calendar.date.date.getFullYear(),
                            calendar.date.date.getMonth(),
                            $(this).data("day"),
                            $("#hour").val(),
                            $("#minute").val())); 

    Calendar.addAppointmentFromForm($(this));

  // Month is indexed in ruby - server-side - starting from 1.

      $.post("/appointments",
             {"appointment[year]": Calendar.date.date.getFullYear(),
              "appointment[month]": Calendar.date.date.getMonth() + 1,
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
