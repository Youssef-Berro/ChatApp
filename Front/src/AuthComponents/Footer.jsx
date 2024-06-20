import React from 'react'
import './../css/Footer.css'

function Footer() {
    return (
        <footer className='footer'>
            <div className="logo">
                <img src="./../../img/utils/logo.svg" alt="" />
            </div>
            <div className="info">
                • Conversa is a dynamic platform designed to facilitate real-time one-on-one and 
                group conversations. It features robust authentication controls, ensuring that 
                users must create an account to access its engaging chat functionalities. 
                Whether it's connecting with friends or collaborating in group discussions, 
                this app offers a seamless and secure chat experience
            </div>
        </footer>
    )
}

export default Footer;