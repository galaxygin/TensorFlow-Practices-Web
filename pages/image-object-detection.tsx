import * as cocoSsd from '@tensorflow-models/coco-ssd'
import * as tfjs from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import { CircularProgress, List, ListItem, ListItemText, Typography } from "@material-ui/core";
import { useEffect, useState } from "react";
import Page from "./page";

export default function ImageObjectDetection() {
    const [imageURI, setImage] = useState('/assets/images/image96.png')
    const [myWindow, setWindow] = useState(null)
    const [model, setModel] = useState(null)
    const [imagePredictions, setImagePredict] = useState([])
    const [contentWidth, setContentWidth] = useState(0)

    useEffect(() => {
        setWindow(window)
        setContentWidth(window.innerWidth * 0.85)
        load()
    }, [])

    const load = async () => {
        tfjs.setBackend('webgl')
        const net = await cocoSsd.load({ base: 'mobilenet_v2' })
        console.log(net)
        setModel(net)
    }

    async function imagePredict(event) {
        if (event.target.files && event.target.files[0]) {
            const fileReader = new myWindow.FileReader()
            fileReader.onload = async (e) => {
                setImage(e.target.result)
                var img = new Image()
                img.width = 700
                img.height = 700
                img.src = e.target.result
                setImagePredict(await model.detect(img))
            }
            fileReader.readAsDataURL(event.target.files[0]);
        }
    }

    function renderImageResult() {
        if (!model)
            return <Typography>Loading model</Typography>
        if (imagePredictions.length == 0)
            return <Typography>Couldn't detect anything</Typography>
        return <List>
            {imagePredictions.map(prediction => (
                <ListItem key={prediction.class}>
                    <ListItemText primary={"Prediction: " + prediction.class + "\nProbability: " + prediction.score} />
                </ListItem>
            ))}
        </List>
    }

    function renderContent() {
        return <div style={{ width: contentWidth, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h3">
                Image Object Detection
            </Typography><br />
            <div>
                <Typography variant="h6" >
                    Detecting object from an image
                </Typography>
                <img src={imageURI} style={{ width: 300, height: 300 }} /><br />
                {(model) ? <input type="file" onChange={imagePredict} className="filetype" accept="image/*" id="group_image" /> : <CircularProgress />}<br /><br />
                {renderImageResult()}
            </div>
        </div>
    }

    return <Page content={renderContent()} />
}