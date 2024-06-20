import React from 'react'

function Button(props) {
    const moreClasses = props.moreClasses || '';

    return (
        <button
            className={`general-btn ${moreClasses}`}
            onClick={props.onClick}>{props.value}
        </button>
    )
}

export default Button