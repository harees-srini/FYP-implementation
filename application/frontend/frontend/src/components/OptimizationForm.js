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

export default OptimizationForm