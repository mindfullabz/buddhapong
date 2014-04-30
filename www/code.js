
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

        if (!state.session)
            $('#main').empty().append($('<pre/>').text(_.json(data, true)))

        if (state == 'searching' || state == 'searching+') {
            var other = _.find(data, function (data, key) { return data.joinme })
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
            var other = _.find(data, function (data, key) { return data.session == state.joinme })
            if (other) return enterSession(state.joinme, true)
        }
    }
    function enterSession(session, host) {
        state = { session : session }
        ws.send(_.json(state))


        var sid = session
        $.post(buddhapongServer + '/createToken', session, function (token) {


        var d = $('<div id="me"/>')
        $('#main').empty().append($('<div/>').text('testing1')).append(d)

          // var xmlhttp=new XMLHttpRequest();
          // xmlhttp.open("GET", "https://opentokrtc.com/cordova.json", false);
          // xmlhttp.send();
          // var data = JSON.parse( xmlhttp.response );

          // var data = {}
          // data.apiKey = 44742772
          // data.sid = sid
          // data.token = token

          var data = {}
          data.apiKey = 44742772
          data.sid = '1_MX40NDc0Mjc3Mn5-VHVlIEFwciAyOSAxODo0NToyNyBQRFQgMjAxNH4wLjE2NjI1Mjg1flB-'
          data.token = host ? 'T1==cGFydG5lcl9pZD00NDc0Mjc3MiZzZGtfdmVyc2lvbj10YnJ1YnktdGJyYi12MC45MS4yMDExLTAyLTE3JnNpZz1hZDg5YTQxYTk2NjFiOWExZWI1ZTYyY2IzY2VlZDg5YTMwOGI5N2FkOnJvbGU9cHVibGlzaGVyJnNlc3Npb25faWQ9MV9NWDQwTkRjME1qYzNNbjUtVkhWbElFRndjaUF5T1NBeE9EbzBOVG95TnlCUVJGUWdNakF4Tkg0d0xqRTJOakkxTWpnMWZsQi0mY3JlYXRlX3RpbWU9MTM5ODgyMjQ4NyZub25jZT0wLjI4NzA5OTA3MjcwMTA4MjUmZXhwaXJlX3RpbWU9MTQwMTQxNDI2OCZjb25uZWN0aW9uX2RhdGE9aGk=' : 'T1==cGFydG5lcl9pZD00NDc0Mjc3MiZzZGtfdmVyc2lvbj10YnJ1YnktdGJyYi12MC45MS4yMDExLTAyLTE3JnNpZz1lMWJiOTkyNDFjOWY5Y2E5MGVmYmRkZjU1Y2NiZGVmYjE4MzUzYTI5OnJvbGU9cHVibGlzaGVyJnNlc3Npb25faWQ9MV9NWDQwTkRjME1qYzNNbjUtVkhWbElFRndjaUF5T1NBeE9EbzBOVG95TnlCUVJGUWdNakF4Tkg0d0xqRTJOakkxTWpnMWZsQi0mY3JlYXRlX3RpbWU9MTM5ODgyMjUwMSZub25jZT0wLjk4MDIwODk1MTIyNjc0NCZleHBpcmVfdGltZT0xNDAxNDE0MjY4JmNvbm5lY3Rpb25fZGF0YT1oaQ=='

          // Very simple OpenTok Code for group video chat
          var publisher = TB.initPublisher(data.apiKey,'me');

          var session = TB.initSession( data.apiKey, data.sid ); 
          session.on({
            'streamCreated': function( event ){
                //console.log('GOT HERE!!')
                var div = document.createElement('div');
                div.setAttribute('id', 'stream' + event.stream.streamId);
                document.body.appendChild(div);
                session.subscribe( event.stream, div.id, {subscribeToAudio: false} );
            }
          });
          session.connect(data.token, function(){
            session.publish( publisher );
          });

        })


        return




        var d = $('<div id="me"/>')
        $('#main').empty().append(d)
        $.post(buddhapongServer + '/createToken', session, function (token) {
            var p = OT.initPublisher('44742772', 'me')

            var s = OT.initSession('44742772', session)
            s.on({
                streamCreated : function(event) {
                    var d = $('<div/>').attr('id', 'stream' + event.stream.streamId).text('hi?')
                    $('#main').append(d)
                    //s.subscribe(event.stream, d.attr('id'))
                }
            })

            s.connect(token, function() {
                s.publish(p)
            })
        })
    }
    ws.send(_.json(state))

    $('body').prepend($('<button/>').text('reload').click(function () {
        location.reload()
    }))
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
