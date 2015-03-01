var EMAIL = "";
var re = "([a-z]|[A-Z]|[0-9]|(.+))*@([a-z]|[A-Z]|[0-9])*.([a-z]|[A-Z])*";
var ACTIVE = 0;

function goToOptions() {
  if(ACTIVE == 0) {
    $('#options').toggleClass('active');
    $('#track').toggleClass('active');
    $('#generate-content').fadeOut(500, function() {
      $('#options-content').fadeIn(500);
      ACTIVE = 1;
      formatOptionsPage();
    });
  }
}

function goToTrack() {
  if(ACTIVE == 1) {
    $('#track').toggleClass('active');
    $('#options').toggleClass('active');
    $('#options-content').fadeOut(500, function() {
      $('#generate-content').fadeIn(500);
      $('#table-body').empty();
      ACTIVE = 0;
      $("html").css('width', '500px');
      $("html").css('height', '374px');
    });
  }
}

function formatOptionsPage() {
  // get the entire contents of storage
  chrome.storage.local.get(null, function(items) {

    // if there are no items in storage, display a message
    if(isEmptyObject(items)) {
      if($('#track-alert').length <= 0) $('#options-table').after("<p id='track-alert' class='info center'>You are currently not tracking any emails.</p>");
      $('#options-table').css('display', 'none');
    }
    else {
      $('#options-table').css('display', 'block');
      if($('#track-alert').length > 0) {
        $('#track-alert').remove();
      }
      formatOptionsTable(items);
    }
  });
}

function formatOptionsTable(items) {
  var rowId = 0
  var keyId = 0
  var withinKey = 0
  for(key in items) {
    var data = items[key];
    for(row in data["trackedEmails"]) {
      if($('#row' + rowId).length <= 0) {
        $('#table-body').append(createRowFromData(data["trackedEmails"][row], rowId, keyId, withinKey));
      }
      withinKey += 1;
      rowId += 1;
    }
    withinKey = 0;
    keyId += 1;
  }
  $('.trackbox').prop('checked', true).change(untrackEmail);
  $('.trackbox').each(function() {
    $(this).prop('checked', $(this).data('check'));
  });
}

function createRowFromData(data, number, keyNumber, inKeyNumber) {
  var checkbox = "";
  if(data["track"]) {
    checkbox = "<input type='checkbox' class='trackbox' data-check=" + data["track"] + ">";
  }
  else {
    checkbox = "<input type='checkbox' class='trackbox' data-check=" + data["track"] + ">";
  }

  var row = "<tr class='datarow' data-inkey=" + inKeyNumber + " data-keynum=" + keyNumber + " id=row" + number +"><td>"+ data["site"] + "</td><td>" + data["email"] + "</td><td>" + data["spam"] + "</td><td>" + checkbox + "</td></tr>";
  return row;
}

function isEmptyObject(obj) {
  for(var prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }
  return true;
}

function untrackEmail() {
  var nearestObj = $(this).closest(".datarow");
  var key = nearestObj.data("keynum");
  var inkey = nearestObj.data("inkey");
  chrome.storage.local.get(null, function(items) {
    var counter = 0;
    for(keyp in items) {
      if(counter == key) {
        var data = items[keyp];
        var incounter = 0;
        for(row in data["trackedEmails"]) {
          if(incounter == inkey) {
            if(data["trackedEmails"][incounter]["track"]) {
              data["trackedEmails"][incounter]["track"] = false;
            }
            else {
              data["trackedEmails"][incounter]["track"] = true;
            }
            var newObjToSet = {};
            newObjToSet[keyp] = data;
            chrome.storage.local.set(newObjToSet);
          }
          incounter += 1;
        }
      }
      counter += 1;
    }
  });
}

function generateEmail() {
  EMAIL = $('#input-email').val();
  var newEmail = "";
  var objToSet = {};
  EMAIL = EMAIL.trim();
  if(EMAIL != "")
  {
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
      $('#email-field').val(newEmail);
    });
  }
}

function copyEmail() {
  $('#email-field').focus();
  document.execCommand('SelectAll');
  document.execCommand("Copy", false, null);
  $('span').css('display', 'block');
  $('span').fadeOut(3000);
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
  });
}

function storeTrackObject(items, EMAIL) {
  var objToSet = {};
  objToSet[EMAIL] = items;
  chrome.storage.local.set(objToSet);
}

// function updateForEmail(key, data) {
//   // get length from items[key] and do the tracking stuff.
//   var emails = data['trackedEmails'];
//   for(email in emails)
//   {
//     if(emails[email]['track']) // obeying the checkbox shit.
//     {
//       var site = emails[email]['site'];
//       var spamNum = emails[email]['spam'];
//       var emailTrack = emails[email]['email'];
//
//       var request = gapi.client.gmail.users.messages.list({
//         'userId': 'me',
//         'includeSpamTrash': true,
//         'q': 'to:' + emailTrack // BALLER THIS WORKS.
//       });
//       request.execute(function(resp){
//         //console.log(emailTrack);
//         //console.log(resp);
//         var site_re = new RegExp('.*?' + site + '.*?');
//         //console.log('.*?' + site + '.*?');
//         //console.log(items[key]['trackedEmails'][email]['spam']);
//
//         if(resp['resultSizeEstimate'] != 0)
//         {
//           var N = resp['resultSizeEstimate'];
//           items[key]["trackedEmails"][email]['spam'] = 0;
//           for(var x = 0; x < N; x++)
//           {
//             var thisMessage = resp['messages'][x]['id'];
//             var request = gapi.client.gmail.users.messages.get({
//               'userId': 'me',
//               'id': thisMessage
//             });
//             request.execute(function(resp2){
//               //console.log(resp2);
//               siteFrom = resp2['payload']['headers'][8];
//               for(var y = 0; y < 11; y++)
//               {
//                 if(resp2['payload']['headers'][y]['name'] == 'From')
//                 {
//                   break;
//                 }
//               }
//               var siteFrom = resp2['payload']['headers'][y]['value'];
//               //console.log(siteFrom);
//               if(site_re.test(siteFrom))
//               {
//                 console.log('boom'); //shitty original test code.
//                 //shouldn't do anything.
//               }
//               else
//               {
//                 spamNum = spamNum + 1; // update it in place. This requests run asynchronously.
//                 var newObj = {};
//                 items[key]["trackedEmails"][email]["spam"] += 1
//                 //items['trackedEmails'].push({'email': emailTrack, 'site': site, 'spam': spamNum})
//                 newObj[key] = items[key];
//                 chrome.storage.local.set(newObj,function(){
//                   console.log('pls');
//                 });
//               }
//             });
//           }
//         }
//       });
//     }
//   }
// }

function checkSpam()
{
  var config = {
    'client_id': '525774793049-g4535gfratld5lsqo0ip0g3db35jhtnh.apps.googleusercontent.com',
    'scope': 'https://www.googleapis.com/auth/gmail.readonly',
    'immediate': true
  };
  gapi.client.load('gmail', 'v1', function() {
    chrome.storage.local.get(null, function(items) {
      // var blocked = false;
      for(key in items)
      {
        // updateForEmail(key, items[key]);
        var emails = items[key]['trackedEmails'];
        for(email in emails)
        {
          if(emails[email]['track']) // obeying the checkbox shit.
          {
            var site = emails[email]['site'];
            var spamNum = 0;
            var emailTrack = emails[email]['email'];

            var request = gapi.client.gmail.users.messages.list({
              'userId': 'me',
              'includeSpamTrash': true,
              'q': 'to:' + emailTrack // BALLER THIS WORKS.
            });
            request.execute(function(resp){
              //console.log(emailTrack);
              //console.log(resp);
              var site_re = new RegExp('.*?' + site + '.*?');
              //console.log('.*?' + site + '.*?');
              //console.log(items[key]['trackedEmails'][email]['spam']);

              if(resp['resultSizeEstimate'] != 0)
              {
                var N = resp['resultSizeEstimate'];
                items[key]["trackedEmails"][email]['spam'] = 0;
                for(var x = 0; x < N; x++)
                {
                  var thisMessage = resp['messages'][x]['id'];
                  var request = gapi.client.gmail.users.messages.get({
                    'userId': 'me',
                    'id': thisMessage
                  });
                  request.execute(function(resp2){
                    //console.log(resp2);
                    siteFrom = resp2['payload']['headers'][8];
                    for(var y = 0; y < 11; y++)
                    {
                      if(resp2['payload']['headers'][y]['name'] == 'From')
                      {
                        break;
                      }
                    }
                    var siteFrom = resp2['payload']['headers'][y]['value'];
                    //console.log(siteFrom);
                    if(site_re.test(siteFrom))
                    {
                      console.log('boom'); //shitty original test code.
                      //shouldn't do anything.
                    }
                    else
                    {
                      spamNum = spamNum + 1; // update it in place. This requests run asynchronously.
                      var newObj = {};
                      items[key]["trackedEmails"][email]["spam"] += 1
                      //items['trackedEmails'].push({'email': emailTrack, 'site': site, 'spam': spamNum})
                      newObj[key] = items[key];
                      // while(blocked) {
                      // }
                      // blocked = true;
                      chrome.storage.local.set(newObj,function(){
                        console.log('pls');
                        // console.log('unblocking');
                        // blocked = false;
                      });
                    }
                  });
                }
              }
            });
          }
        }
      }
    });
  });
}

function verify() {
  var config = {
    'client_id': '525774793049-g4535gfratld5lsqo0ip0g3db35jhtnh.apps.googleusercontent.com',
    'scope': 'https://www.googleapis.com/auth/gmail.readonly',
    'immediate': true
  };
  //console.log('verify');
  gapi.auth.authorize(config, function() {
    console.log('login complete');
    console.log(gapi.auth.getToken());
    checkSpam();
  });
}

$('#generate-email').on('click', generateEmail);
$('#copy-email').on('click', copyEmail);
$('#track').on('click', goToTrack);
$('#options').on('click', goToOptions);

setTimeout(verify, 5000);
