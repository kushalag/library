
var dremail = "";

function details1(email){
  dremail = email;
}

    var newmoment = moment();
    const URL = "https://notification.opdlift.com/api/wp-appointment";
    var timeSlots = "";
    var selectedDate = "";
    var startTime = "";
    var endTime = "";
    var _opdId = "";

  function setCustomDate(date) {
    let today = $.datepicker.formatDate("yy-mm-dd", new Date(date));
    for (var i = 0; i < availableDays.length; i++) {
      if (availableDays[i].opdDate === today) {
        return [true];
      }
    }

    return [false];
  }
  var isHandled = false;

  function getCalendar() {
    var $datePicker = $("#datepicker");

    $datePicker
      .datepicker({
        changeMonth: false,
        changeYear: false,
        inline: true,
        dateFormat: "yy-mm-dd",
        minDate: 0,
        altField: "#datep",
        dayNamesMin: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        // this is reponsible for disabling date
        // beforeShowDay: setCustomDate,
        onChangeMonthYear: function (year, month, inst) {
          var fromDate = newmoment
            .month(month - 1)
            .startOf("month")
            .format("YYYY-MM-DD");
          var toDate = newmoment
            .month(month - 1)
            .endOf("month")
            .format("YYYY-MM-DD");
          if (!isHandled) getCalendarDates(fromDate, toDate);
          isHandled = true;
        },
      })
      .on("change", function (e) {
        console.log($(this).val());

        selectedDate = $(this).val();

        getTimeSlots($(this).val(), $datePicker);
        return false;
      });
  }

  function getTime(start, end, opdId) {
    event.preventDefault();

    // console.log("----- Inside getTime -----");
    // console.log({start, end, opdId});
    // console.log("----- Inside getTime -----");

    // set start time, end time, and opdId
    startTime = start;
    endTime = end;
    _opdId = opdId;


    console.log({ selectedDate, startTime: start, endTime: end });

    // moment("15", "hh").format('LT')

    $("#appointment_date_time").html(
      `${moment(selectedDate).format("LL")} ${moment(startTime, "hh:mm").format(
        "LT"
      )}`
    );
  }

  function getTimeSlots(date, $datePicker) {
    var settings = {
      url: URL + "/timeslots",
      method: "POST",
      timeout: 0,
      headers: {
        "Content-Type": "application/json",
      },
      dataType: "json",
      data: JSON.stringify({
        fromDate: date,
        appointmentType: "NEW",
        dremail: dremail,
      }),
    };

    $.ajax(settings)
      .done(function (data) {
        // console.log("------------------");
        // console.log("getTimeSlots", data);
        // console.log("------------------");


        timeSlots = "";
        timeSlots = `  <tr>
           <td colSpan="7" class="time-slots">`;

      var currentDay = new Date();
      var currentTime = currentDay.getHours();
      var showSlots = (currentTime + 1);
      var time = currentDay.getMinutes() + 30;
      var finalTime = showSlots  + ":" + time; 
      

      var dd = currentDay.getDate();
      var mm = currentDay.getMonth()+1; 
      var yyyy = currentDay.getFullYear();
      
      if(dd<10) 
      {
          dd='0'+dd;
      } 

      if(mm<10) 
      {
          mm='0'+mm;
      } 
      
      var today = yyyy + '-' + mm + '-' + dd;
      
        for (let i = 0; i < data.length; i++) {

          const slot = data[i];
          let temp = 0;
          if (i % 4 === 0) {
            temp = 0;
            timeSlots += `\n<div class="calendar">`;
          }

          temp++;

          if (slot["booked"] || (date == today   && slot.startTime < finalTime)) {
            timeSlots +=
              `\n<div class="d-inline-block">
                 <button class="calendar-button" disabled style="background: #cccccc; color:black;" onclick="getTime('` +
              slot.startTime +
              `','` +
              slot.endTime +
              `','` +
              slot.opdId +
              `')" id="button` +
              slot.startTime +
              `" >` +
              slot.startTime +
              `</button>
               </div>\n`;
          }else {
            timeSlots +=
              `\n<div class="d-inline-block">
                 <button class="calendar-button" style ="color:black;" onclick="getTime('` +
              slot.startTime +
              `','` +
              slot.endTime +
              `','` +
              slot.opdId +
              `')" id="button` +
              slot.startTime +
              `" >` +
              slot.startTime +
              `</button>
               </div>\n`;
          }

          if (temp === 4) {
            timeSlots += `</div><br/>\n`;
          }
        }

        timeSlots += ` </td></tr>`;

        setTimeout(function () {
          $datePicker
            .find(".ui-datepicker-current-day")
            .parent()
            .after(timeSlots);

          $(".time-slots").hide();

          $(".time-slots").eq(0).show();

        });
      })
      .fail(function (xhr) {
        console.log("error", xhr);
      });      
  }

  function getCalendarDates(fromDate, toDate) {
    var settings = {  
      url: URL + "/calender",
      method: "POST",
      timeout: 0,
      headers: {
        "Content-Type": "application/json",
      },
      dataType: "json",
      data: JSON.stringify({
        fromDate: fromDate,
        toDate: toDate,
        dremail: dremail,
      }),
    };

    $.ajax(settings)
      .done(function (data) {
        availableDays = data;
        getCalendar();

        console.log("success", data);
      })
      .fail(function (xhr) {
        var errors = JSON.parse(xhr.responseText).errors;

        if (errors.length > 0)
          errors.map((error) => console.log("error", error.msg));
      });
  }

  function handleSubmit(event) {
    event && event.preventDefault();

    var patientName = $("#patientName").val();
    var patientMobileNumber = $("#patientMobileNumber").val();
    var sex = $("#sex").val();
    var idno = $("#idno").val();
    var txnid = $("#txnid").val();
    var email = $("#email").val();
    var age = $("#age").val();
    var problem = $("#problem").val();

    // console.log("1212")
    // console.log({_opdId})

    var settings = {
      url: URL + "/appointment/new",
      method: "POST",
      timeout: 0,
      headers: {
        "Content-Type": "application/json",
      },
      dataType: "json",
      data: JSON.stringify({
        fromDate: selectedDate,
        startTime: startTime,
        endTime: endTime,
        dremail: dremail,
        opdId: _opdId,
        patientName,
        patientMobileNumber,
        sex,
        idno,
        txnid,
        email,
        age,
        problem,
      }),
    };

    $.ajax(settings)
      .done(function (data) {
        console.log("success", data);
      })
      .fail(function (xhr) {
        var errors = JSON.parse(xhr.responseText).errors;

        if (errors.length > 0)
          errors.map((error) => console.log("error", error.msg));
      });
  }

  $(function () {
    let availableDays = [];

    $(document).ready(function () {
      getCalendarDates(
        newmoment.format("YYYY-MM-DD"),
        newmoment.endOf("month").format("YYYY-MM-DD")
      );
    });

    $("#form").validate({
      rules: {
        selectedDate: {
          required: true,
        },
        startTime: {
          required: true,
        },
        endTime: {
          required: true,
        },

        patientName: {
          required: true,
        },
        patientMobileNumber: {
          required: true,
          minlength: 10,
          digits: true,
          maxlength: 10,
        },
        email: {
          required: true,
          email: true,
        },
      },
      messages: {
        selectedDate: "Please select an appointment date",
        startTime: "Please select an appointment time",
      },
    });
  });
// </script>

// <script>
  $(document).ready(function () {
    console.log("jquery loaded");

    // generate random string
    var random_str = makeid(20);


    $(".ea-btn.btn.btn-primary.make_payment").click(function (event) {
      var name = document.form.patientName.value;
      var mob = document.form.patientMobileNumber.value;
      var gender = document.form.sex.value;
      var govid = document.form.idno.value;
      var age = document.form.age.value;
      var txnid = document.form.txnid.value;

      if (name === "" || name == null) {
        alert("Please enter name");
        console.log("Enter Name");
        document.form.patientName.focus();
        return false;
      }

      if (mob === "" || mob.length !== 10 || isNaN(mob)) {
        alert("Enter valid mobile number");
        document.form.patientMobileNumber.focus();
        return false;
      }

      if (gender === "" || gender == null) {
        alert("Please enter gender");
        document.form.sex.focus();
        return false;
      }

      if (age === "" || age == null || isNaN(age)) {
        alert("Please enter your age");
        document.form.age.focus();
        return false;
      }

      if (govid === "" || govid == null) {
        alert("Please enter government id");
        document.form.idno.focus();
        return false;
      }

      if (txnid === "" || txnid == null) {
        alert("Please enter Payment Transaction id");
        document.form.txnid.focus();
        return false;
      }

      if ($("#appointment_date_time").html() == "") {
        alert("Please Select Date and Time");
        return false;
      }

      if (!document.form.consent.checked) {
        alert("Please provide your consent for online consultation.");
        document.form.consent.focus();
        return false;
      }

      // prevent the default behavior
      event.preventDefault();

      event.stopPropagation();

      Swal.fire(
        "Appointment Booked!",
        "You will shortly receive sms and whatsapp notification regarding your appointment!",
        "success"
      );

      // call the handle submit button
      handleSubmit();

      return false;
    });

    // hide the book button
    $(".ea-submit.booking-button").hide();

    $("form.form-horizontal").submit(function (e) {
      e.preventDefault();
    });
  });

  //  script the hide the transaction id section

  // create random string javascript
  function makeid(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
