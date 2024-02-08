import React, { useState } from 'react'
import axios from 'axios'

const OptimizationForm = () => {
    const [result, setResult] = useState('')

    const handleOptimize = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/optimize/')
            setResult(response.data.message)
        } catch (error) {
            console.error('Error optimizing: ', error)
        }
    }

    return (
        <div>
            <button onClick={handleOptimize}>Optimize</button>
            <p>{result}</p>
        </div>
    )
}

const LocationsInput = () => {
    const [inputVal, setInputVal] = useState('')

    const handleInput = (event) => {
        setInputVal(event.target.value)
    }

    const sendInput = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/getlocations/', { message: inputVal })
            console.log('Message sent successfully!!:', response.data)
        } catch (error) {
            console.error('Error sending messgae!!:', error)
        }
    }

    return (
        <div padding="25">
            <input type="text" value={inputVal} onChange={handleInput} />
            <button onClick={sendInput}>Input locations</button>
        </div>
    )

}



// export default OptimizationForm
export default LocationsInput