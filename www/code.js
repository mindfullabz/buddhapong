
var waitFor = {}
var isApp = typeof cordova != 'undefined'
var buddhapongServer = 'http://buddhapong-server-env-w434ankmsv.elasticbeanstalk.com'

waitFor.socket = true
addScript('http://cdn.sockjs.org/sockjs-0.3.min.js')
function waitForSockJS() {
    if (window.SockJS) {
        ws = new SockJS(buddhapongServer + '/ws')
        ws.onopen = function() { delete waitFor.socket; main() }
    } else setTimeout(waitForSockJS, 30)
}
waitForSockJS()

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

    ws.onclose = function (e) {
        $('#main').empty().text('SOCKET CLOSED')
    }

    $('#main').empty().text('finding partner..')
    var state = 'searching'
    ws.onmessage = function (e) {
        var data = _.unJson(e.data)
        $('#main').empty().append($('<pre/>').text(_.json(data, true)))

        if (state == 'searching' || state == 'searching+') {
            var other = _.find(data, function (data, key) { return data.joinme })
            if (other) return enterSession(other.joinme)
            if (state == 'searching') {
                state = 'searching+'
                $.post(buddhapongServer + '/createSession', null, function (session) {
                    if (state == 'searching+') {
                        state = { joinme : session }
                        ws.send(_.json(state))
                    }
                })
            }
        } else if (state.joinme) {
            var other = _.find(data, function (data, key) { return data.session == state.joinme })
            if (other) return enterSession(session)
        }
    }
    function enterSession(session) {
        state = { session : session }
        ws.send(_.json(state))
    }
    ws.send(_.json(state))
}
main()

/*
document.addEventListener('deviceready', function() {
      // Getting OpenTokRTC's room's credentials. 
      // To use your own room in opentokrtc, change cordova to room of your choice
      //   -> ie: https://opentokrtc.com/myroom.json
      // To use your own credentials
      //  replace data.apiKey, data.sid, and data.token with your own 
      var xmlhttp=new XMLHttpRequest();
      xmlhttp.open("GET", "https://opentokrtc.com/cordova.json", false);
      xmlhttp.send();
      var data = JSON.parse( xmlhttp.response );

      // Very simple OpenTok Code for group video chat
      var publisher = TB.initPublisher(data.apiKey,'myPublisherDiv');

      var session = TB.initSession( data.apiKey, data.sid ); 
      session.on({
        'streamCreated': function( event ){
            var div = document.createElement('div');
            div.setAttribute('id', 'stream' + event.stream.streamId);
            document.body.appendChild(div);
            session.subscribe( event.stream, div.id, {subscribeToAudio: false} );
        }
      });
      session.connect(data.token, function(){
        session.publish( publisher );
      });

}, false);
*/
