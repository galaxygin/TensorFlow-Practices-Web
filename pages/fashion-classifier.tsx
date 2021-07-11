import * as tfjs from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import { Typography } from "@material-ui/core"
import { useEffect, useState } from "react"
import Page from "./page"

const class_names = ['T-shirt/top', 'Trouser', 'Pullover', 'Dress', 'Coat',
    'Sandal', 'Shirt', 'Sneaker', 'Bag', 'Ankle boot']

export default function FashionClassifier() {
    const [model, setModel] = useState(null)
    const [contentWidth, setContentWidth] = useState(0)
    const [imageSize, setImageSize] = useState(0)
    const [prediction, setPrediction] = useState("")

    useEffect(() => {
        setContentWidth(window.innerWidth * 0.85)
        setImageSize(window.innerWidth * 0.25)
        load()
    }, [])

    const load = async () => {
        await tfjs.setBackend('webgl')
        const Model = await tfjs.loadLayersModel('/models/fashion_mnist/model.json')
        console.log(Model)
        setModel(Model)
    }

    function predictHand(uri: string) {
        const hand = new Image()
        hand.width = 500
        hand.height = 500
        hand.src = uri
        // var tensor = tfjs.browser.fromPixels(hand).resizeNearestNeighbor([28, 28]).toFloat();
        var img = tfjs.browser.fromPixels(hand, 1)
        var tensor = tfjs.image.resizeBilinear(img, [28, 28]).expandDims(0)
        // const rgb = tfjs.tensor1d([0.2989, 0.587, 0.114])
        // tensor = tfjs.sum(tensor, 2).reshape([1, 28, 28, 1])
        const result = model.predict(tensor)
        const index = tfjs.argMax(result, 1).dataSync()
        setPrediction(class_names[tfjs.argMax(result, 1).dataSync()[0]])
        console.log(class_names[tfjs.argMax(result, 1).dataSync()[0]])
        console.log(result)
    }

    function renderContent() {
        return <div style={{ width: contentWidth, display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h3'>
                Fashion Classification
            </Typography>
            <Typography>
                Selected item is {prediction}
            </Typography>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <img src={'/assets/images/shorts.jpg'} onClick={() => predictHand('/assets/images/shorts.jpg')} width={imageSize} height={imageSize} />
                <img src={'/assets/images/shoes.jpg'} onClick={() => predictHand('/assets/images/shoes.jpg')} width={imageSize} height={imageSize} />
                <img src={'/assets/images/rock.png'} onClick={() => predictHand('/assets/images/rock.png')} width={imageSize} height={imageSize} />
            </div>
        </div>
    }

    return <Page content={renderContent()} />
}