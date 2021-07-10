import * as tfjs from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import * as mobilenet from '@tensorflow-models/mobilenet'
import * as knnClassifier from '@tensorflow-models/knn-classifier'
import { useEffect, useState } from 'react';
import Page from './page';
import { useStyles } from '../public/assets/styles/styles';
import { Button, CircularProgress, List, ListItem, ListItemText, Typography } from '@material-ui/core';
import { isMobile } from 'react-device-detect';
import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm'

const classifier = knnClassifier.create();

export default function ImageClassification() {
    const classes = useStyles()
    const knnClasses = ['A', 'B', 'C'];
    const [model, setModel] = useState(null)
    const [imageURI, setImage] = useState('/assets/images/image96.png')
    const [myWindow, setWindow] = useState(null)
    const [imagePredictions, setImageResult] = useState([])
    const [loading, setLoading] = useState(false)
    const [contentWidth, setContentWidth] = useState(0)

    const [webcam, setWebcam] = useState(null)
    const [webcamOn, setWebcamIsOn] = useState(false)
    const [webcamResult, setWebcamResult] = useState([])

    const [webcamKnn, setWebcamKnn] = useState(null)
    const [webcamKnnOn, setWebcamKnnIsOn] = useState(false)
    const [webcamKnnResult, setWebcamKnnResult] = useState(null)

    useEffect(() => {
        setWindow(window)
        setContentWidth(window.innerWidth * 0.85)
        load()
    }, [])

    const load = async () => {
        // setWasmPaths('../node_modules/@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm.wasm')
        // tfjs.setBackend((isMobile) ? 'wasm' : 'webgl')
        tfjs.setBackend('webgl')
        setModel(await mobilenet.load())
    }

    async function imagePredict(event) {
        if (event.target.files && event.target.files[0]) {
            const fileReader = new myWindow.FileReader()
            fileReader.onload = async (e) => {
                setImage(e.target.result)
                setLoading(true)
                var img = new Image()
                img.width = 700
                img.height = 700
                img.src = e.target.result
                setImageResult(await model.classify(img))
                setLoading(false)
            }
            fileReader.readAsDataURL(event.target.files[0]);
        }
    }

    async function webcamPredict() {
        while (webcamOn) {
            if (webcam) {
                const img = await webcam.capture();
                if (img) {
                    setWebcamResult(await model.classify(img));
                    // Dispose the tensor to release the memory.
                    img.dispose();
                }
            }

            // Give some breathing room by waiting for the next animation frame to fire.
            await tfjs.nextFrame();
        }
    }

    async function webcamPredictKnn() {
        while (webcamKnnOn) {
            if (classifier.getNumClasses() > 0) {
                const img = await webcamKnn.capture();
                if (img) {
                    // Get the activation from mobilenet from the webcam.
                    const activation = model.infer(img, 'conv_preds');
                    // Get the most likely class and confidence from the classifier module.
                    const result = await classifier.predictClass(activation);
                    setWebcamKnnResult(result)
                    // Dispose the tensor to release the memory.
                    img.dispose();
                }
            }

            await tfjs.nextFrame();
        }
    }

    const addExample = async classId => {
        // Capture an image from the web camera.
        const img = await webcamKnn.capture();
        if (img) {
            // Get the intermediate activation of MobileNet 'conv_preds' and pass that
            // to the KNN classifier.
            const activation = model.infer(img, true);
            // Pass the intermediate activation to the classifier.
            classifier.addExample(activation, classId);
            // Dispose the tensor to release the memory.
            img.dispose();
        }
    };

    function renderImageResult() {
        if (loading) {
            return <CircularProgress />
        } else {
            if (!model) {
                return <Typography>
                    The model is not ready or supported
                </Typography>
            }
            if (imagePredictions.length == 0) {
                return <Typography>
                    Couldn't detect anything
                </Typography>
            }
            return <List>
                {imagePredictions.map(prediction => (
                    <ListItem key={prediction.className} >
                        <ListItemText primary={"Prediction: " + prediction.className + "\nProbability: " + prediction.probability} />
                    </ListItem>
                ))
                }
            </List >
        }
    }

    function renderKnnResult() {
        if (webcamKnnResult) {
            return <Typography>
                {`Prediction: ${knnClasses[webcamKnnResult.label]}\nProbability: ${webcamKnnResult.confidences[webcamKnnResult.label]}`}
            </Typography>
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
            <Typography variant="h3" paragraph>
                Image Classification
            </Typography>
            <Typography variant="h6" paragraph>
                Powered by Mobile Net
            </Typography>
            <div style={{ display: 'flex', flexDirection: (isMobile) ? 'column' : 'row' }}>
                <div>
                    <Typography variant="h6" >
                        Detect from image
                    </Typography>
                    <img src={imageURI} style={{ width: 300, height: 300 }} /><br />
                    {(model) ? <input type="file" onChange={imagePredict} className="filetype" accept="image/*" id="group_image" /> : <CircularProgress />}<br /><br />
                    {renderImageResult()}
                </div>
                <div>
                    <Typography variant="h6">
                        Detect from Webcam (Desktop only)
                    </Typography>
                    <video autoPlay playsInline muted id="webcam" width="300" height="300"></video><br />
                    <Button variant="outlined" disabled={(model) ? false : true} color={(webcamOn) ? "secondary" : "primary"} onClick={async () => {
                        if (webcamOn) {
                            await webcam.stop()
                            setWebcamIsOn(false)
                        } else {
                            setWebcam(await tfjs.data.webcam(document.getElementById('webcam') as HTMLVideoElement))
                            setWebcamIsOn(true)
                        }
                    }}>
                        {buttonContent(webcamOn)}
                    </Button>
                    <List>
                        {webcamResult.map(prediction => (
                            <ListItem key={prediction.className}>
                                <ListItemText primary={"Prediction: " + prediction.className + "\nProbability: " + prediction.probability} />
                            </ListItem>
                        ))}
                    </List>
                </div>
                <div>
                    <Typography variant="h6">
                        Detect from Webcam with KNN Classifier (Desktop only)
                    </Typography>
                    <video autoPlay playsInline muted id="webcamKnn" width="300" height="300"></video><br />
                    <Button variant="outlined" disabled={(model) ? false : true} color={(webcamOn) ? "secondary" : "primary"} onClick={async () => {
                        if (webcamKnnOn) {
                            await webcamKnn.stop()
                            setWebcamKnnIsOn(false)
                        } else {
                            setWebcamKnn(await tfjs.data.webcam(document.getElementById('webcamKnn') as HTMLVideoElement))
                            setWebcamKnnIsOn(true)
                        }
                    }}>
                        {buttonContent(webcamKnnOn)}
                    </Button><br />
                    <Button id="class-a" variant="outlined" onClick={() => addExample(0)}>Add A</Button>
                    <Button id="class-b" variant="outlined" onClick={() => addExample(1)}>Add B</Button>
                    <Button id="class-c" variant="outlined" onClick={() => addExample(2)}>Add C</Button>
                    {renderKnnResult()}
                </div>
            </div>
        </ div>
    }

    webcamPredict()
    webcamPredictKnn()

    return <Page content={renderContent()} />
}