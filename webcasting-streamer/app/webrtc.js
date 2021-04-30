var localVideo = null;
var peerConnection = null;
var peerConnectionConfig = { 'iceServers': [] };
var localStream = null;
var wsURL = "wss://ovp3-wowza.dblabs.net/webrtc-session.json";
var wsConnection = null;
var streamInfo = { applicationName: "live", streamName: "stream", sessionId: "[empty]" };
var userData = { param1: "value1" };
var videoBitrate = 360;
var audioBitrate = 64;
var videoFrameRate = "29.97";
var videoChoice = "42e01f";
var audioChoice = "opus";
var videoIndex = -1;
var audioIndex = -1;
var userAgent = null;
var newAPI = false;
var SDPOutput = new Object();

navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

function pageReady() {
	localVideo = document.getElementById('localVideo');
	var constraints = {
		video: true,
		audio: true,
	};

	if (navigator.mediaDevices.getUserMedia) {
		navigator.mediaDevices.getUserMedia(constraints).then(getUserMediaSuccess).catch(errorHandler);
		newAPI = false;
	} else if (navigator.getUserMedia) {
		navigator.getUserMedia(constraints, getUserMediaSuccess, errorHandler);
	}

	setTimeout(function() {
		startPublisher();
	}, 1000);
}

function wsConnect(url) {
	wsConnection = new WebSocket(url);
	wsConnection.binaryType = 'arraybuffer';

	wsConnection.onopen = function () {
		console.log("wsConnection.onopen");

		peerConnection = new RTCPeerConnection(peerConnectionConfig);
		peerConnection.onicecandidate = gotIceCandidate;

		if (newAPI) {
			var localTracks = localStream.getTracks();
			for (localTrack in localTracks) {
				peerConnection.addTrack(localTracks[localTrack], localStream);
			}
		}
		else {
			peerConnection.addStream(localStream);
		}

		peerConnection.createOffer(gotDescription, errorHandler);
	}

	wsConnection.onmessage = function (evt) {
		let data = evt.data.replace('host', 'host tcptype passive');
		console.log("wsConnection.onmessage: " + data);

		var msgJSON = JSON.parse(data);

		var msgStatus = Number(msgJSON['status']);
		var msgCommand = msgJSON['command'];

		if (msgStatus != 200) {
			stopPublisher();
		} else {
			var sdpData = msgJSON['sdp'];
			sdpData.sdp = sdpData.sdp;
			if (sdpData !== undefined) {
				console.log('sdp: ' + msgJSON['sdp']);

				peerConnection.setRemoteDescription(new RTCSessionDescription(sdpData), function () {
					//peerConnection.createAnswer(gotDescription, errorHandler);
				}, errorHandler);
			}

			var iceCandidates = msgJSON['iceCandidates'];
			if (iceCandidates !== undefined) {
				for (var index in iceCandidates) {
					console.log('iceCandidates: ' + iceCandidates[index]);

					peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidates[index]));
				}
			}
		}

		if (wsConnection != null)
			wsConnection.close();
		wsConnection = null;
	}

	wsConnection.onclose = function () {
		console.log("wsConnection.onclose");
	}

	wsConnection.onerror = function (evt) {
		console.log("wsConnection.onerror: " + JSON.stringify(evt));
		stopPublisher();
	}
}

function getUserMediaSuccess(stream) {
	console.log("getUserMediaSuccess: " + stream);
	localStream = stream;
	try {
		localVideo.srcObject = stream;
	} catch (error) {
		localVideo.src = window.URL.createObjectURL(stream);
	}
}

function startPublisher() {
	console.log("startPublisher: wsURL:" + wsURL + " streamInfo:" + JSON.stringify(streamInfo));
	wsConnect(wsURL);
}

function stopPublisher() {
	if (peerConnection != null)
		peerConnection.close();
	peerConnection = null;

	if (wsConnection != null)
		wsConnection.close();
	wsConnection = null;

	console.log("stopPublisher");
}

function start() {
	if (peerConnection == null)
		startPublisher();
	else
		stopPublisher();
}

function gotIceCandidate(event) {
	if (event.candidate != null) {
		console.log('gotIceCandidate: ' + JSON.stringify({ 'ice': event.candidate }));
	}
}

function gotDescription(description) {
	var enhanceData = new Object();

	if (audioBitrate !== undefined)
		enhanceData.audioBitrate = Number(audioBitrate);
	if (videoBitrate !== undefined)
		enhanceData.videoBitrate = Number(videoBitrate);
	if (videoFrameRate !== undefined)
		enhanceData.videoFrameRate = Number(videoFrameRate);


	//description.sdp = enhanceSDP(description.sdp, enhanceData);

	console.log('gotDescription: ' + JSON.stringify({ 'sdp': description }));

	peerConnection.setLocalDescription(description, function () {

		wsConnection.send('{"direction":"publish", "command":"sendOffer", "streamInfo":' + JSON.stringify(streamInfo) + ', "sdp":' + JSON.stringify(description) + ', "userData":' + JSON.stringify(userData) + '}');

	}, function () { console.log('set description error') });
}

function errorHandler(error) {
	console.log(error);
}
