
document.write('got here!')
throw 'stopping'

var waitFor = {}
var isApp = typeof cordova != 'undefined'
var buddhapongServer = 'http://buddhapong-server-env-w434ankmsv.elasticbeanstalk.com'

waitFor.socket = true
var ws = new (WebSocket || MozWebSocket)(buddhapongServer.replace(/^http/, 'ws'))
ws.onopen = function() { delete waitFor.socket; main() }

waitFor.opentok = true
addScript(isApp ? 'opentok.js' : 'http://static.opentok.com/webrtc/v2.2/js/opentok.min.js')
function waitForOT() {
    if (window.TB) window.OT = window.TB
    if (window.OT) { delete waitFor.opentok; main() }
    else setTimeout(waitForOT, 30)
}
waitForOT()

if (isApp) {
    waitFor.deviceready = true
    document.addEventListener('deviceready', function () { delete waitFor.deviceready; main() })
}

waitFor.dom = true
$(function () { delete waitFor.dom; main() })

function main() {
    if (_.keys(waitFor).length > 0) {
        try {
            $('#main').text('waiting for: ' + _.keys(waitFor).join(', '))
        } catch (e) {}
        return
    }
    $('#main').text('loaded..')

    ws.onmessage = function (e) {
        var data = _.unJson(e.data)
        $('#main').empty().append($('<pre/>').text(_.json(data, true)))
    }
    ws.onclose = function (e) {
        $('#main').empty().text('SOCKET CLOSED')
    }
    ws.send(_.json('hello, I have arrived: ' + Math.random()))
}
main()

// document.addEventListener('deviceready', function() {
//       // Getting OpenTokRTC's room's credentials. 
//       // To use your own room in opentokrtc, change cordova to room of your choice
//       //   -> ie: https://opentokrtc.com/myroom.json
//       // To use your own credentials
//       //  replace data.apiKey, data.sid, and data.token with your own 
//       var xmlhttp=new XMLHttpRequest();
//       xmlhttp.open("GET", "https://opentokrtc.com/cordova.json", false);
//       xmlhttp.send();
//       var data = JSON.parse( xmlhttp.response );

//       // Very simple OpenTok Code for group video chat
//       var publisher = TB.initPublisher(data.apiKey,'myPublisherDiv');

//       var session = TB.initSession( data.apiKey, data.sid ); 
//       session.on({
//         'streamCreated': function( event ){
//             var div = document.createElement('div');
//             div.setAttribute('id', 'stream' + event.stream.streamId);
//             document.body.appendChild(div);
//             session.subscribe( event.stream, div.id, {subscribeToAudio: false} );
//         }
//       });
//       session.connect(data.token, function(){
//         session.publish( publisher );
//       });

// }, false);
