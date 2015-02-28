var data = {
  clientID : "383003173790-638lifc5v4agfu93f48ua5kvum7p6hvq.apps.googleusercontent.com",
  apiKey   : "AIzaSyBvYrjNBQJNxZN0aRIvDW5ZdpmlCYE-8Ig",
  scope : "https://www.googleapis.com/auth/gmail.readonly",
};

function handleClientLoad() {
  gapi.client.setApiKey(data["apiKey"]);
  window.setTimeout(checkAuth,1);
}

function checkAuth() {
  gapi.auth.authorize({client_id: data["clientID"], scope: data["scope"], immediate: true}, handleAuthResult);
}


function handleAuthResult(authResult) {
  var authorizeButton = $('#authorize-button');
  if (authResult && !authResult.error) {
    authorizeButton.css('display', 'hidden');
    makeApiCall();
  } else {
    authorizeButton.css('display', 'block');
    authorizeButton.onclick = handleAuthClick;
  }
}

function handleAuthClick(event) {
  gapi.auth.authorize({client_id: data["clientID"], scope: data["scope"], immediate: false}, handleAuthResult);
  return false;
}

function makeApiCall() {
  gapi.client.load('gmail', 'v1', function() {
    var request = gapi.client.gmail.users.messages.list({
      'userId': 'jmc41493@gmail.com',
      'maxResults': 10
    });
    request.execute(function(resp) {
      console.log(resp);
    });
  });
}

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

$(window).bind("load", handleClientLoad);
$('#sign-in-button').on('click', handleAuthClick);
$('#my-button').on('click', makeApiCall);
