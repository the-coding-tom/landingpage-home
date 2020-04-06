const apiServerUrl = "http://3.126.223.86:23000/";
let gStartDateTime = "";

function onDateSelect(e) {
  $("#submit-btn").attr("disabled", false);
  $("#err-display").text("");
  $("#booking-response").text("");
  gStartDateTime = "";
  if (e.target.validity.valid) {
    $("#time-slots").css("display", "flex");
    // console.log(e.target.value.replace(/\//gi, "-"));
  } else {
    $("#err-display").text("Invalid date");
    $("#time-slots").css("display", "none");
  }
}
function onTimeSlotSelect(e) {
  $("#submit-btn").attr("disabled", false);
  $("#booking-response").text("");
  gStartDateTime = "";
  $(".time-slot").removeClass("selected");
  $(e.target).addClass("selected");
  $("#submit-btn").css("display", "inline-block");
}
function onSubmit() {
  const name = $("#name").val();
  const mobile = $("#mobile").val();
  if (!name) {
    window.scrollTo(0, 0);
    return $("#err-name").text("Name required");
  }
  if (!mobile) {
    window.scrollTo(0, 0);
    return $("#err-mobile").text("Mobile required");
  }
  if (!$(".time-slot.selected").length) {
    $("#booking-response").text("Select a time slot!");
    return 0;
  }
  $("#submit-btn").attr("disabled", true);
  const dateTime =
    moment(String($("#datepicker").val())).format("YYYY-MM-DD") +
    " " +
    $(".time-slot.selected").text();
  gStartDateTime = dateTime;
  $.ajax({
    url: apiServerUrl + "patient/booking/getavailablecoviddoctors",
    type: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({
      startDateTime: dateTime
    }),
    success: onRetrievedAvailableDoctors
  });
}
function onRetrievedAvailableDoctors(data) {
  let doctors = data;
  if (doctors.error) doctors = [];
  doctors.sort((a, b) => {
    if (a.assignedPatients < b.assignedPatients) return -1;
    else if (a.assignedPatients > b.assignedPatients) return -1;
    else return 0;
  });
  // console.log(doctors);
  if (!doctors.length) {
    return $("#booking-response").text(
      "Sorry, no available doctors. Please choose a different time slot"
    );
  } else {
    const name = $("#name").val();
    const mobile = $("#mobile").val();
    const email = $("#email").val();
    $.ajax({
      url: apiServerUrl + "patient/booking/bookslot",
      type: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        startDateTime: gStartDateTime,
        endDateTime: moment(gStartDateTime)
          .add(30, "m")
          .format("YYYY-MM-DD HH:mm"),
        mobile: mobile,
        patientName: name,
        email: email,
        assignedDoctorId: doctors[0].sz_empid
      }),
      success: () => {
        setTimeout(() => {
          window.location.assign("http://serenity.health");
        }, 5000);
        return $("#booking-success").text(
          `Your appointment has been booked for ${gStartDateTime}! You will be notified on ${mobile}. Redirecting...`
        );
      }
    });
  }
}

// MAIN //
const datePicker = $("#datepicker").datepicker({
  uiLibrary: "bootstrap4"
});

$("#datepicker").on("change", onDateSelect);
$(".time-slot").on("click", onTimeSlotSelect);
