var EMAIL = "";

function generateEmail() {
  EMAIL = $('#input-email').val();
  var newEmail = "";
  var objToSet = {};

  chrome.storage.local.get(EMAIL, function(items) {
    // get the last email we generated, or if nil just get the email of the
    // user. we will use that.
    if(!(EMAIL in items)) newEmail = EMAIL;
    else {
      newEmail = items[EMAIL].lastEmail;
      items = items[EMAIL];
    }

    // add a . after the first letter.
    newEmail = newEmail.slice(0, 1) + "." + newEmail.slice(1, newEmail.length);

    // store this as the last email
    items = items || {};
    items["lastEmail"] = newEmail;

    // if items does not have anything in tracked emails
    if(!("trackedEmails" in items)) items["trackedEmails"] = []

    // add the new email to tracked emails
    addToTrackedEmails(newEmail, EMAIL, items, storeTrackObject)
    $('#email-field').text(newEmail);
  });
}

function copyEmail() {
  $('#email-field').append('<input type="text" style="display:hidden;" id="copy-text" value=' + $('#email-field').text() + '>');
  $('#copy-text').focus();
  document.execCommand('SelectAll');
  document.execCommand("Copy", false, null);
  $('#copy-text').remove();
}

function addToTrackedEmails(emailToTrack, userEmail, items, callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  }

  chrome.tabs.query(queryInfo, function(tabs) {
    // get the page url
    var pageTitle = tabs[0].url

    // extract the company name from url

    // replace the beginning of the url
    pageTitle = pageTitle.replace(/(https\:\/\/www\.)|(http\:\/\/www\.)|(https:\/\/)|(http:\/\/)/, "");

    // find the first occurrence of a . and then cut the rest of the string off
    pageTitle = pageTitle.substring(0, pageTitle.indexOf('.'));

    items["trackedEmails"].push({"email": emailToTrack, "site": pageTitle, "spam": 0, "track": true});

    callback(items, EMAIL);
  })
}

function storeTrackObject(items, EMAIL) {
  var objToSet = {};
  objToSet[EMAIL] = items;
  chrome.storage.local.set(objToSet);
}

function verify() {
  var config = {
         'client_id': '525774793049-g4535gfratld5lsqo0ip0g3db35jhtnh.apps.googleusercontent.com',
         'scope': 'https://www.googleapis.com/auth/gmail.readonly',
         'immediate': true
   };
}

$('#generate-email').on('click', generateEmail);
$('#copy-email').on('click', copyEmail);
