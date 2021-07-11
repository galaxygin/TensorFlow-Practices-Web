import * as tfjs from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import { Typography } from "@material-ui/core"
import { useEffect, useState } from "react"
import Page from "./page"

export default function ScissorsPaperRock() {
    const [model, setModel] = useState(null)
    const [contentWidth, setContentWidth] = useState(0)
    const [imageSize, setImageSize] = useState(0)

    useEffect(() => {
        setContentWidth(window.innerWidth * 0.85)
        setImageSize(window.innerWidth * 0.25)
        load()
    }, [])

    const load = async () => {
        await tfjs.setBackend('webgl')
        const Model = await tfjs.loadLayersModel('/models/rps_js/model.json')
        console.log(Model)
        setModel(Model)
    }

    function predictHand(uri: string) {
        const hand = new Image()
        hand.width = 500
        hand.height = 500
        hand.src = uri
        // var tensor = tfjs.browser.fromPixels(hand).resizeNearestNeighbor([150, 150]).toFloat();
        const img = tfjs.browser.fromPixels(hand, 1).reshape([150, 150, 3]).expandDims(0)
        // var tensor = tfjs.image.resizeBilinear(img, [150, 150])
        // tensor = tfjs.sum(tensor.mul(rgb), 2).reshape([150, 150, 3])
        const result = model.predict(img)
        console.log(result)
    }

    function renderContent() {
        return <div style={{ width: contentWidth, display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h3'>
                Scissors Paper Rock Classification
            </Typography>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <img src={'/assets/images/scissors.png'} onClick={() => predictHand('/assets/images/scissors.png')} width={imageSize} height={imageSize} />
                <img src={'/assets/images/paper.png'} onClick={() => predictHand('/assets/images/paper.png')} width={imageSize} height={imageSize} />
                <img src={'/assets/images/rock.png'} onClick={() => predictHand('/assets/images/rock.png')} width={imageSize} height={imageSize} />
            </div>
        </div>
    }

    return <Page content={renderContent()} />
}