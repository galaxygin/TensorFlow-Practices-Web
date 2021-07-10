import * as cocossd from '@tensorflow-models/coco-ssd'
import * as tfjs from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import { Button, CircularProgress, MenuItem, Select, Typography } from "@material-ui/core";
import { useEffect, useState } from "react";
import Page from "./page";
import { isMobile } from 'react-device-detect'

export default function ObjectDetection() {
    const [model, setModel] = useState(null)
    const [webcam, setWebcam] = useState(null)
    const [webcamOn, setWebcamIsOn] = useState(false)
    const [size, setSize] = useState(0)
    const [cameras, setCameras] = useState([])
    const [selectedCamera, setCamera] = useState("select")
    const [navigator, setNavigator] = useState(null)
    const [cameraOn, setCameraIsOn] = useState(false)
    const [contentWidth, setContentWidth] = useState(0)
    var children = []
    var localStream

    useEffect(() => {
        setSize(window.innerWidth * 0.8)
        setNavigator(window.navigator)
        setContentWidth(window.innerWidth * 0.85)
        // Call this function again to keep predicting when the browser is ready.
        window.requestAnimationFrame(cameraPredict);
        load()
    }, [])

    const load = async () => {
        tfjs.setBackend('webgl')
        setModel(await cocossd.load({ base: 'mobilenet_v2' }))
    }

    const getCameras = async () => {
        if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
            navigator.getUserMedia({ video: true }, async function (stream) {
                localStream = stream;
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                setCameras(videoDevices);
                stopStream();
            }, err => console.log(err));
        }
    }

    const startStream = async () => {
        const config = {
            video: {
                width: {
                    min: 640,
                    ideal: size,
                    max: size,
                },
                height: {
                    min: 480,
                    ideal: size,
                    max: size
                },
            }, deviceId: {
                exact: selectedCamera
            }
        };
        // const stream = await navigator.mediaDevices.getUserMedia(config);
        (document.getElementById('webcam') as HTMLVideoElement).load();
        navigator.getUserMedia({ video: true }, async function (stream) {
            localStream = stream;
            (document.getElementById('webcam') as HTMLVideoElement).srcObject = stream;
            (document.getElementById('webcam') as HTMLVideoElement).play();
        }, err => console.log(err));
        (document.getElementById('webcam') as HTMLVideoElement).addEventListener('loadeddata', () => {
            setCameraIsOn(true)
        }, false);
    };

    const stopStream = () => {
        (document.getElementById('webcam') as HTMLVideoElement).pause();
        (document.getElementById('webcam') as HTMLVideoElement).src = "";
        if (localStream) {
            localStream.getTracks().forEach(x => x.stop())
        }
    }

    async function webcamPredict() {
        while (webcamOn) {
            if (webcam) {
                const img = await webcam.capture();
                if (img) {
                    await model.detect(img).then(predictions => {
                        for (let i = 0; i < children.length; i++) {
                            document.getElementById("liveView").removeChild(children[i]);
                        }
                        children.splice(0)
                        predictions.forEach(prediction => {
                            const p = document.createElement('p');
                            p.innerText = prediction.class + ' - with ' + Math.round(parseFloat(prediction.score) * 100) + '% confidence.';
                            p.style.cssText = 'position: absolute;margin-left: ' + prediction.bbox[0] + 'px; margin-top: '
                                + (prediction.bbox[1] - 10) + 'px; width: ' + (prediction.bbox[2] - 10) + 'px; top: 0; left: 0;'
                                + 'background-color: rgba(255, 111, 0, 0.85);color: #FFF;border: 1px dashed rgba(255, 255, 255, 0.7); font-size: 12px;';
                            const highlighter = document.createElement('div');
                            highlighter.setAttribute('class', 'highlighter');
                            highlighter.style.cssText = 'position: absolute;left: ' + prediction.bbox[0] + 'px; top: ' + prediction.bbox[1] + 'px; width: ' + prediction.bbox[2] + 'px; height: '
                                + prediction.bbox[3] + 'px;background: rgba(0, 255, 0, 0.25);border: 1px dashed #fff;z - index: 1;';
                            document.getElementById("liveView").appendChild(highlighter);
                            document.getElementById("liveView").appendChild(p);
                            children.push(highlighter);
                            children.push(p);
                        })
                    })
                    // Dispose the tensor to release the memory.
                    img.dispose();
                }
            }

            // Give some breathing room by waiting for the next animation frame to fire.
            await tfjs.nextFrame();
        }
    }

    async function cameraPredict() {
        while (cameraOn) {
            if ((document.getElementById('webcam') as HTMLVideoElement).readyState === 4) {
                await model.detect(document.getElementById('webcam') as HTMLVideoElement).then(predictions => {
                    for (let i = 0; i < children.length; i++) {
                        document.getElementById("liveView").removeChild(children[i]);
                    }
                    children.splice(0)
                    predictions.forEach(prediction => {
                        const p = document.createElement('p');
                        p.innerText = prediction.class + ' - with ' + Math.round(parseFloat(prediction.score) * 100) + '% confidence.';
                        p.style.cssText = 'position: absolute;margin-left: ' + prediction.bbox[0] + 'px; margin-top: '
                            + (prediction.bbox[1] - 10) + 'px; width: ' + (prediction.bbox[2] - 10) + 'px; top: 0; left: 0;'
                            + 'background-color: rgba(255, 111, 0, 0.85);color: #FFF;border: 1px dashed rgba(255, 255, 255, 0.7); font-size: 12px;';
                        const highlighter = document.createElement('div');
                        highlighter.setAttribute('class', 'highlighter');
                        highlighter.style.cssText = 'position: absolute;left: ' + prediction.bbox[0] + 'px; top: ' + prediction.bbox[1] + 'px; width: ' + prediction.bbox[2] + 'px; height: '
                            + prediction.bbox[3] + 'px;background: rgba(0, 255, 0, 0.25);border: 1px dashed #fff;z - index: 1;';
                        document.getElementById("liveView").appendChild(highlighter);
                        document.getElementById("liveView").appendChild(p);
                        children.push(highlighter);
                        children.push(p);
                    })
                })

                // Give some breathing room by waiting for the next animation frame to fire.
                await tfjs.nextFrame();
            }
        }
    }

    function buttonContent(flag: boolean) {
        if (!model)
            return <CircularProgress />
        if (flag)
            return <Typography>Stop</Typography>
        else
            return <Typography>Start</Typography>
    }

    function renderContent() {
        return <div style={{ width: contentWidth, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h3">
                Object Detection
                    </Typography><br />
            <div id="liveView" style={{ position: 'relative', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                <video style={{ display: 'block' }} autoPlay playsInline muted id="webcam" width={size} height={size / 2}></video>
            </div><br />
            <Typography variant='h6'>
                Camera options
                </Typography>
            <Typography>
                Webcam (Desktop only)
                </Typography>
            <Button variant="outlined" disabled={(model) ? false : true} color={(webcamOn) ? "secondary" : "primary"} onClick={async () => {
                if (webcamOn) {
                    await webcam.stop()
                    setWebcamIsOn(false)
                    for (let i = 0; i < children.length; i++) {
                        document.getElementById("liveView").removeChild(children[i]);
                    }
                    children.splice(0)
                } else {
                    setWebcam(await tfjs.data.webcam(document.getElementById('webcam') as HTMLVideoElement))
                    setWebcamIsOn(true)
                }
            }}>
                {buttonContent(webcamOn)}
            </Button><br /><br />
            <Typography>
                Other cameras (Experimental and works on limited environment only)
                </Typography>
            <Select value={selectedCamera} onChange={e => setCamera(e.target.value as string)}>
                <MenuItem value={"select"}>Supported Cameras</MenuItem>
                {cameras.map(camera => (
                    <MenuItem value={camera.deviceId} key={camera.deviceId}>{camera.label}</MenuItem>
                ))}
            </Select>
            <Button variant='outlined' onClick={() => {
                getCameras()
            }}>
                Look for cameras
                </Button><br />
            <Button variant="outlined" disabled={(model) ? false : true} onClick={() => {
                if (cameraOn) {
                    setCameraIsOn(false)
                    for (let i = 0; i < children.length; i++) {
                        document.getElementById("liveView").removeChild(children[i]);
                    }
                    children.splice(0)
                    stopStream()
                } else {
                    startStream()
                }
            }}>
                {buttonContent(cameraOn)}
            </Button><br />

        </div>
    }

    webcamPredict()

    cameraPredict()
    return <Page content={renderContent()} />
}