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

  function getCurrentDayMonthYear(){

    return (new Date());
  }

  function cell(i, j)
  {
    return $("#cell_" + i + "_" + j);
  }

  function redrawCalendar(year, month)
  {
    $("#month").text(months[month] + " " + year);

    firstDay = getFirstDayOfMonth(year, month);
    numberOfDays = getNumberOfDaysInMonth(year, month);
    currentDay = getCurrentDayMonthYear().getDate();
    currentMonth = getCurrentDayMonthYear().getMonth();
    currentYear = getCurrentDayMonthYear().getFullYear();

    day = 1;
    count= 0;

    $.ajax({
      url : "/appointments",
      type: "GET",
      dataType: "JSON",
      success: function(data)
      {
        var currentMonthData = new Array();

        for (var i = 0; i < 6; i++) {
          for (var j = 0; j < 7; j++) {
            if (((i * 6 + j) >= firstDay) && (day <= numberOfDays)) {
              cell(i, j).text(day++);
              cell(i,j).attr( "day", day-1 );

              for(k = 0; k<data.length; k++){

                if(data[k].day == day-1 && data[k].month == month && data[k].year == year){
                  cell(i, j).append('<div id="event">' + data[k].time + " " + data[k].desciption + '</div>');
                }

              }

            } else {
              cell(i, j).text("");
            }

        //highlights current day in light blue. Makes sure to unhighlight in other months.
        //there is a better way to do this. If I have time I'll implement it.
        if((year == currentYear) && (month == currentMonth) && (day == currentDay + 1)){
          cell(i, j).css("backgroundColor", "lightblue");
        }
        else{
          cell(i, j).css("backgroundColor", "white");
        } 

      }
    }

  }
});

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

  $(document).ready(function()
  {
    // Get the current date
    var date = new Date();

    // Month and year are attached to window so they persist (globals)
    window.month = date.getMonth();
    window.year = date.getFullYear();

    // Redraw the calendar so it matches the current date
    redrawCalendar(year, month);

    //If a click occurs on the table add a div containing the information to be logged. 
    $('td').click(function(){

      //if the cell is not empty we are able to add otherwise it is an empty cell. Can't add to empty cell.
      if($(this).html()){

            // Fail if the user doesn't enter a description
            if ($("#description").val() == "") {
              alert("Please enter a description");
              return;
            }

            var myCol = $(this).index();
            var $tr = $(this).closest('tr');
            var myRow = $tr.index();

            var day = cell(myRow-2, myCol).attr("day");

            var time = $("#hour").val() + ":" + $("#minute").val();

            var des = $("#description").val();

            $.ajax({
                url : "/appointments",
                type: "POST",
                data : { 'year': window.year, 'month': window.month, 'day': day, 'time':time, 'desciption': des },
                success: function(data, textStatus)
                {
                  cell(myRow-2, myCol).append('<div id="event">' + data.time + " " + data.desciption + '</div>');
                }
            });

            

            $("#hour").val($("#hour option:first").val());
            $("#minute").val($("#minute option:first").val());
            $("#description").val('');
          }

        });
});
