import * as tfjs from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import * as toxicity from '@tensorflow-models/toxicity'
import Page from "./page"
import { useEffect, useState } from 'react'
import { Button, CircularProgress, List, ListItem, ListItemText, TextField, Typography } from '@material-ui/core'

export default function ToxicityClassifier() {
    const [model, setModel] = useState(null)
    const [predictions, setPredictions] = useState([])
    const [sentence, setSentence] = useState("")
    const [loading, setLoading] = useState(false)
    const [contentWidth, setContentWidth] = useState(0)
    // The minimum prediction confidence.
    const threshold = 0.8

    useEffect(() => {
        setContentWidth(window.innerWidth * 0.85)
        load()
    }, [])

    const load = async () => {
        await tfjs.setBackend('webgl')
        const Model = await toxicity.load(threshold, ['identity_attack', 'insult', 'obscene', 'severe_toxicity', 'sexual_explicit', 'threat', 'toxicity'])
        console.log(Model)
        setModel(Model)
    }

    async function predictToxicity() {
        setLoading(true)
        const result = await model.classify(sentence);
        setPredictions(result)
        setLoading(false)
    }

    function renderResult() {
        if (!model)
            return <Typography>Loading model</Typography>
        if (loading)
            return <Typography>Classifying</Typography>
        return <List>
            {predictions.map(prediction => (
                <ListItem key={prediction.label}>
                    <ListItemText primary={prediction.label + ": " + prediction.results[0].match} />
                </ListItem>
            ))}
        </List>
    }

    function renderContent() {
        return <div style={{ width: contentWidth, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h3" paragraph>
                {`Toxicity Classifier`}
            </Typography>
            <Typography paragraph>
                Identifying the toxicity of the sentence
            </Typography>
            <Typography>
                Sentence
            </Typography>
            <TextField style={{ width: contentWidth }} rows={5} value={sentence} multiline onChange={e => setSentence(e.target.value)} /><br />
            <Button variant="outlined" disabled={(model) ? false : true} onClick={() => predictToxicity()}>
                {(model) ? 'Identify toxicity' : <CircularProgress />}
            </Button>
            {renderResult()}
        </div>
    }

    return <Page content={renderContent()} />
}