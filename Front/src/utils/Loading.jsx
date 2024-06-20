import React from 'react'
import './../css/Loading.css'

function Loading() {
    return (
        <div className="loading-parent">
            <div className="three-body">
                <div className="three-body__dot"></div>
                <div className="three-body__dot"></div>
                <div className="three-body__dot"></div>
            </div>
        </div>
    )
}

export default Loading;