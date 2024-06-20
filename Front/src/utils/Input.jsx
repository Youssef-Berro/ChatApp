import React from 'react'
import './../App.css'

function Input(props) {
    const moreClasses = props.moreClasses || '';
    const type = props.type || 'text';
    const defaultValue = props.defaultValue || ''; 

    return (
        <input 
            type={type}
            defaultValue={defaultValue}
            onChange={props.onChange}
            className={`general-input ${moreClasses}`}
            autoFocus={props.autoFocus}
            placeholder={props.placeholder} />
    )
}

export default Input;