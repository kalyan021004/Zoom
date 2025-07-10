import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import PeopleIcon from '@mui/icons-material/People'
import SettingsIcon from '@mui/icons-material/Settings'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import server from '../environment';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState([]);
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [showModal, setModal] = useState(false);
    let [screenAvailable, setScreenAvailable] = useState();
    let [messages, setMessages] = useState([])
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(0);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    let [isFullscreen, setIsFullscreen] = useState(false);
    let [participantCount, setParticipantCount] = useState(1);

    const videoRef = useRef([])
    let [videos, setVideos] = useState([])

    useEffect(() => {
        console.log("HELLO")
        getPermissions();
    }, [])

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);
        }
    }, [video, audio])

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }

    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()
        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
                setParticipantCount(prev => prev - 1)
            })

            socketRef.current.on('user-joined', (id, clients) => {
                setParticipantCount(clients.length)
                
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };

                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        setVideo(!video);
    }

    let handleAudio = () => {
        setAudio(!audio)
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])

    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/"
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }

    let closeChat = () => {
        setModal(false);
    }

    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };

    let sendMessage = () => {
        console.log(socketRef.current);
        socketRef.current.emit('chat-message', message, username)
        setMessage("");
    }

    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

    let toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    }

    return (
        <div className="min-vh-100" style={{ backgroundColor: '#1a1a1a' }}>
            {askForUsername ? (
                <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100">
                    <div className="row w-100">
                        <div className="col-lg-6 col-md-8 col-sm-10 mx-auto">
                            <div className="card shadow-lg border-0" style={{ backgroundColor: '#2d2d2d', borderRadius: '20px' }}>
                                <div className="card-body p-5">
                                    <div className="text-center mb-4">
                                        <h2 className="text-white mb-3">
                                            <i className="fas fa-video me-3" style={{ color: '#4CAF50' }}></i>
                                            Join Video Conference
                                        </h2>
                                        <p className="text-muted">Enter your details to join the meeting</p>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <div className="position-relative">
                                            <video 
                                                ref={localVideoref} 
                                                autoPlay 
                                                muted 
                                                className="w-100 rounded-3"
                                                style={{ height: '200px', objectFit: 'cover', backgroundColor: '#000' }}
                                            ></video>
                                            <div className="position-absolute top-0 start-0 m-3">
                                                <span className="badge bg-success">Camera Preview</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <TextField 
                                            fullWidth
                                            id="username-input" 
                                            label="Your Name" 
                                            value={username} 
                                            onChange={e => setUsername(e.target.value)} 
                                            variant="outlined"
                                            className="mb-3"
                                            InputProps={{
                                                style: { color: 'white' }
                                            }}
                                            InputLabelProps={{
                                                style: { color: '#aaa' }
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '& fieldset': {
                                                        borderColor: '#555',
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: '#4CAF50',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#4CAF50',
                                                    },
                                                },
                                            }}
                                        />
                                    </div>

                                    <div className="d-grid">
                                        <Button 
                                            variant="contained" 
                                            onClick={connect}
                                            size="large"
                                            disabled={!username.trim()}
                                            style={{ 
                                                backgroundColor: '#4CAF50',
                                                borderRadius: '10px',
                                                padding: '12px',
                                                fontSize: '16px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            <i className="fas fa-sign-in-alt me-2"></i>
                                            Join Meeting
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="container-fluid p-0 position-relative min-vh-100">
                    {/* Header Bar */}
                    <div className="row m-0">
                        <div className="col-12 p-0">
                            <nav className="navbar navbar-dark" style={{ backgroundColor: '#2d2d2d' }}>
                                <div className="container-fluid">
                                    <div className="navbar-brand">
                                        <i className="fas fa-video me-2" style={{ color: '#4CAF50' }}></i>
                                        Video Conference
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <Badge badgeContent={participantCount} color="primary" className="me-3">
                                            <PeopleIcon style={{ color: 'white' }} />
                                        </Badge>
                                        <span className="text-white me-3">{new Date().toLocaleTimeString()}</span>
                                        <IconButton onClick={toggleFullscreen} style={{ color: "white" }}>
                                            <FullscreenIcon />
                                        </IconButton>
                                    </div>
                                </div>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="row m-0 flex-grow-1">
                        {/* Video Area */}
                        <div className={`${showModal ? 'col-lg-9 col-md-8' : 'col-12'} p-3 transition-all`}>
                            <div className="position-relative h-100">
                                {/* Main Video Grid */}
                                <div className="row h-100">
                                    {videos.length === 0 ? (
                                        // Single user view
                                        <div className="col-12 h-100">
                                            <div className="card bg-dark border-0 h-100 rounded-3 overflow-hidden">
                                                <video 
                                                    ref={localVideoref} 
                                                    autoPlay 
                                                    muted 
                                                    className="w-100 h-100"
                                                    style={{ objectFit: 'cover' }}
                                                ></video>
                                                <div className="position-absolute bottom-0 start-0 m-3">
                                                    <span className="badge bg-primary">{username} (You)</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Multiple users view
                                        <>
                                            {/* Local video in grid */}
                                            <div className={`${videos.length === 1 ? 'col-6' : videos.length <= 4 ? 'col-lg-6 col-md-12' : 'col-lg-4 col-md-6'} mb-3`}>
                                                <div className="card bg-dark border-0 h-100 rounded-3 overflow-hidden">
                                                    <video 
                                                        ref={localVideoref} 
                                                        autoPlay 
                                                        muted 
                                                        className="w-100 h-100"
                                                        style={{ objectFit: 'cover', minHeight: '250px' }}
                                                    ></video>
                                                    <div className="position-absolute bottom-0 start-0 m-3">
                                                        <span className="badge bg-primary">{username} (You)</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Remote videos */}
                                            {videos.map((video, index) => (
                                                <div key={video.socketId} className={`${videos.length === 1 ? 'col-6' : videos.length <= 4 ? 'col-lg-6 col-md-12' : 'col-lg-4 col-md-6'} mb-3`}>
                                                    <div className="card bg-dark border-0 h-100 rounded-3 overflow-hidden">
                                                        <video
                                                            data-socket={video.socketId}
                                                            ref={ref => {
                                                                if (ref && video.stream) {
                                                                    ref.srcObject = video.stream;
                                                                }
                                                            }}
                                                            autoPlay
                                                            className="w-100 h-100"
                                                            style={{ objectFit: 'cover', minHeight: '250px' }}
                                                        ></video>
                                                        <div className="position-absolute bottom-0 start-0 m-3">
                                                            <span className="badge bg-success">Participant {index + 1}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>

                                {/* Controls Bar */}
                                <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4">
                                    <div className="card bg-dark border-0 rounded-pill shadow-lg">
                                        <div className="card-body p-2">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <IconButton 
                                                    onClick={handleVideo} 
                                                    className="mx-2"
                                                    style={{ 
                                                        color: "white",
                                                        backgroundColor: video ? '#4CAF50' : '#f44336',
                                                        borderRadius: '50%'
                                                    }}
                                                >
                                                    {video ? <VideocamIcon /> : <VideocamOffIcon />}
                                                </IconButton>
                                                
                                                <IconButton 
                                                    onClick={handleAudio} 
                                                    className="mx-2"
                                                    style={{ 
                                                        color: "white",
                                                        backgroundColor: audio ? '#4CAF50' : '#f44336',
                                                        borderRadius: '50%'
                                                    }}
                                                >
                                                    {audio ? <MicIcon /> : <MicOffIcon />}
                                                </IconButton>

                                                {screenAvailable && (
                                                    <IconButton 
                                                        onClick={handleScreen} 
                                                        className="mx-2"
                                                        style={{ 
                                                            color: "white",
                                                            backgroundColor: screen ? '#2196F3' : 'rgba(255,255,255,0.1)',
                                                            borderRadius: '50%'
                                                        }}
                                                    >
                                                        {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                                                    </IconButton>
                                                )}

                                                <Badge badgeContent={newMessages} color="error" className="mx-2">
                                                    <IconButton 
                                                        onClick={() => setModal(!showModal)} 
                                                        style={{ 
                                                            color: "white",
                                                            backgroundColor: showModal ? '#2196F3' : 'rgba(255,255,255,0.1)',
                                                            borderRadius: '50%'
                                                        }}
                                                    >
                                                        <ChatIcon />
                                                    </IconButton>
                                                </Badge>

                                                <IconButton 
                                                    onClick={handleEndCall} 
                                                    className="mx-2"
                                                    style={{ 
                                                        color: "white",
                                                        backgroundColor: '#f44336',
                                                        borderRadius: '50%'
                                                    }}
                                                >
                                                    <CallEndIcon />
                                                </IconButton>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chat Sidebar */}
                        {showModal && (
                            <div className="col-lg-3 col-md-4 p-0 border-start" style={{ backgroundColor: '#2d2d2d' }}>
                                <div className="d-flex flex-column h-100">
                                    {/* Chat Header */}
                                    <div className="p-3 border-bottom border-secondary">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <h5 className="text-white mb-0">
                                                <ChatIcon className="me-2" />
                                                Chat
                                            </h5>
                                            <IconButton onClick={closeChat} style={{ color: "white" }}>
                                                <i className="fas fa-times"></i>
                                            </IconButton>
                                        </div>
                                    </div>

                                    {/* Chat Messages */}
                                    <div className="flex-grow-1 p-3 overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                        {messages.length === 0 ? (
                                            <div className="text-center text-muted mt-5">
                                                <i className="fas fa-comments fa-3x mb-3"></i>
                                                <p>No messages yet<br/>Start a conversation!</p>
                                            </div>
                                        ) : (
                                            messages.map((item, index) => (
                                                <div key={index} className="mb-3">
                                                    <div className="card border-0" style={{ backgroundColor: '#3d3d3d' }}>
                                                        <div className="card-body p-3">
                                                            <div className="d-flex align-items-center mb-2">
                                                                <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2" style={{ width: '30px', height: '30px' }}>
                                                                    <span className="text-white small">{item.sender.charAt(0).toUpperCase()}</span>
                                                                </div>
                                                                <small className="text-primary fw-bold">{item.sender}</small>
                                                            </div>
                                                            <p className="text-white mb-0 small">{item.data}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Chat Input */}
                                    <div className="p-3 border-top border-secondary">
                                        <div className="input-group">
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Type your message..."
                                                variant="outlined"
                                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                                InputProps={{
                                                    style: { color: 'white', backgroundColor: '#3d3d3d' }
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        '& fieldset': {
                                                            borderColor: '#555',
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: '#4CAF50',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: '#4CAF50',
                                                        },
                                                    },
                                                }}
                                            />
                                            <Button 
                                                variant="contained" 
                                                onClick={sendMessage}
                                                disabled={!message.trim()}
                                                style={{ 
                                                    backgroundColor: '#4CAF50',
                                                    marginLeft: '8px',
                                                    minWidth: 'auto'
                                                }}
                                            >
                                                <i className="fas fa-paper-plane"></i>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}