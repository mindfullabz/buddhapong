
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

if (!isApp) {
    waitFor.opentok = true
    addScript('http://static.opentok.com/webrtc/v2.2/js/opentok.min.js')
    function waitForOT() {
        if (window.OT) { delete waitFor.opentok; main() }
        else setTimeout(waitForOT, 30)
    }
    waitForOT()
} else {
    OT = TB
}

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

        if (!state.session)
            $('#main').empty().append($('<pre/>').text(_.json(data, true)))

        if (state == 'searching' || state == 'searching+') {
            var other = _.find(data, function (data, key) { return data && data.joinme })
            if (other) return enterSession(other.joinme, false)
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
            var other = _.find(data, function (data, key) { return data && data.session == state.joinme })
            if (other) return enterSession(state.joinme, true)
        }
    }
    function enterSession(session, host) {
        state = { session : session }
        ws.send(_.json(state))
        $('#main').empty().text('connecting..')

        $.post(buddhapongServer + '/createToken', session, function (token) {
            crossTheStreams('44742772', session, token)
        })

        function crossTheStreams(key, session, token) {
            var d = $('<div style="width:200px;height:200px" id="me"/>')
            $('#main').empty().append($('<div/>').text(_.json({ key : key, session : session, token : token, isApp : isApp })))
            $('#main').append(d)

            var p = OT.initPublisher(key, 'me')

            var s = OT.initSession(key, session)
            s.on({
                streamCreated : function(event) {
                    var d = $('<div style="width:200px;height:200px"/>').attr('id', 'stream' + event.stream.streamId).text('hi?')
                    $('#main').append(d)
                    s.subscribe(event.stream, d.attr('id'))
                }
            })

            s.connect(token, function() {
                s.publish(p)
            })
        }
    }
    ws.send(_.json(state))

    $('body').prepend($('<button/>').text('reload').click(function () {
        location.reload()
    }))
}
main()

htmlConsole = function () {
    $('body').append('<div id="debugDiv"/>')
    if (typeof console  != "undefined") 
        if (typeof console.log != 'undefined')
            console.olog = console.log;
        else
            console.olog = function() {};

    console.log = function(message) {
        console.olog(message);
        $('#debugDiv').append('<p>' + message + '</p>');
    };
    console.error = console.debug = console.info =  console.log
    console.log('console log:')
}

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
