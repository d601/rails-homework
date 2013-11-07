// Note that month starts with January at 0 - so October is 9, not September.
months = ["January", "Febuary", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"];

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

function cell(i, j)
{
  return $("#cell_" + i + "_" + j);
}

function getCellFromDay(day)
{
  cellNumber = getFirstDayOfMonth(year, month) + day - 1;
  j = cellNumber % 7;
  i = (cellNumber - j) / 7;
  // alert("" + cellNumber + " " + i + " " + j);
  return cell(i, j);
}

function redrawCalendar(year, month)
{
  $("#month").text(months[month] + " " + year);

  firstDay = getFirstDayOfMonth(year, month);
  numberOfDays = getNumberOfDaysInMonth(year, month);
  currentDay = getCurrentDayMonthYear().getDate();
  currentMonth = getCurrentDayMonthYear().getMonth();
  currentYear = getCurrentDayMonthYear().getFullYear();


  $.get("/appointments",
        {start: (new Date(year, month, 1)).toJSON(),
         end: (new Date(year, month + 1, 1)).toJSON()},
        function(data) {
          console.log(JSON.stringify(data));
          $.each(data, function(i, value) {
            addAppointment(getCellFromDay((new Date(value.time)).getDate()),
                           (new Date(value.time)),
                           value.description);
          });
        });


  day = 1;
  count= 0;

  for (var i = 0; i < 6; i++) {
    for (var j = 0; j < 7; j++) {
      if (((i * 6 + j) >= firstDay) && (day <= numberOfDays)) {
        cell(i, j).data("day", day);
        cell(i, j).text(day++);
      } else {
        cell(i, j).data("day", "");
        cell(i, j).text("");
      }

      //highlights current day in light blue. Makes sure to unhighlight in other months.
      //there is a better way to do this. If I have time I'll implement it.
      if ((year == currentYear)
          && (month == currentMonth)
          && (day == currentDay + 1)) {
        cell(i, j).css("backgroundColor", "lightblue");
      } else {
        cell(i, j).css("backgroundColor", "white");
      } 

    }
  }

}
// setMonth() takes a number of years/months to go up or down
// For now don't use values larger than +/- 1, I didn't have the time to do
// the correct math. -js
function setDate(yearsDelta, monthsDelta)
{
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

  redrawCalendar(year, month);
}

// time should be passed as a date object
function addAppointment(element, time, text)
{
  element.append('<div class="event">' + time.getHours() + ":" + time.getMinutes() + " " + text + '</div>');
}

/*
function postAppointment()
{
  ;
}*/

$(document).ready(function() {
  // Get the current date
  var date = new Date();

  // Month and year are attached to window so they persist (globals)
  window.month = date.getMonth();
  window.year = date.getFullYear();

  // Redraw the calendar so it matches the current date
  redrawCalendar(year, month);

  //If a click occurs on the table add a div containing the information to be logged. 
  $("#cal_table td").click(function(){
      console.log($(this).data("day"));
    
      //if the cell is not empty we are able to add otherwise it is an empty cell. Can't add to empty cell.
      if ($(this).html()) {

            // Fail if the user doesn't enter a description
            if ($("#description").val() == "") {
              alert("Please enter a description");
              return;
            }

            appointmentTime = new Date(year,
                                  month,
                                  $(this).data("day"),
                                  $("#hour").val(),
                                  $("#minute").val()), 
          addAppointment($(this),
                         appointmentTime,
                         $("#description").val());

            $.post("/appointments",
                   {"appointment[year]": year,
                    "appointment[month]": month,
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
