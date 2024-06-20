import React from 'react'
import './../css/ChatMessages.css'

function Info() {
    return (
        <div className='on-open-info-container'>
            <div className="img">
                <img src="./../../img/utils/logo.svg" alt="" />
            </div>
            <div className="on-open-info">
                • Conversa is a dynamic platform designed to facilitate real-time one-on-one and 
                group conversations. It features robust authentication controls, ensuring that 
                users must create an account to access its engaging chat functionalities. 
                Whether it's connecting with friends or collaborating in group discussions, 
                this app offers a seamless and secure chat experience
            </div>
        </div>
    )
}

export default Info;