var EMAIL = "";

function storeKey(key, value) {
  var objToSet = {};
  objToSet[key] = value;

  chrome.storage.local.set(objToSet, function() {
    var alertHtml = key + " : " + value + " was saved!";
    var saveHtml = "<div class='save-alert center'><p class='alert-info'>" + alertHtml + "</p></div>";
    var newElement = $(saveHtml)

    $('#append').append(newElement);
  });
}

function generateEmail() {
  EMAIL = $('#input-email').val();
  var newEmail = "";
  var objToSet = {};

  chrome.storage.local.get(EMAIL, function(items) {
    // get the last email we generated, or if nil just get the email of the
    // user. we will use that.

    if(!(EMAIL in items)) newEmail = EMAIL;
    else newEmail = items[EMAIL].lastEmail;

    // add a . after the first letter.
    newEmail = newEmail.slice(0, 1) + "." + newEmail.slice(1, newEmail.length);

    // store this as the last email
    items = items || {};
    items["lastEmail"] = newEmail;

    objToSet[EMAIL] = items;
    chrome.storage.local.set(objToSet, function() {
      $('#email-field').text(newEmail);
    });
  });
}

function copyEmail() {
  $('#email-field').append('<input type="text" style="display:hidden;" id="copy-text" value=' + $('#email-field').text() + '>');
  $('#copy-text').focus();
  document.execCommand('SelectAll');
  document.execCommand("Copy", false, null);
  $('#copy-text').remove();
}

$('#store-form').on('submit', function() {
    var key, value;

    if (typeof($('#key').val()) !== "undefined") key = $('#key').val();
    if (typeof($('#value').val()) !== "undefined") value = $('#value').val();

    storeKey(key, value);
    $('#key, #value').val("");

    return false;
});

$('#get-form').on('submit', function() {
  var key, value;
  if(typeof($('#get-key').val()) !== "undefined") {
    key = $('#get-key').val();
    chrome.storage.local.get(key, function(items) {
      if($('#get-value').length < 1) {
        $('#get-form').after("<h3 class='center inline'>Retrieved value: </div><p id='get-value' class='inline'>" + items[key] + "</p>");
      }
      else {
        $('#get-value').text(items[key]);
      }
    })
  }
  return false;
})

function verify() {
  var config = {
         'client_id': '525774793049-g4535gfratld5lsqo0ip0g3db35jhtnh.apps.googleusercontent.com',
         'scope': 'https://www.googleapis.com/auth/gmail.readonly',
         'immediate': true
   };
}

// $('#generate-email').on('click', verify);
$('#generate-email').on('click', generateEmail);
$('#copy-email').on('click', copyEmail);
