import React, { useEffect, useState } from 'react'

function GroupMessage(props) {
    const {message} = props;
    const myData = JSON.parse(localStorage.getItem('myData'));
    const [sender, setSender] = useState('');
    const [msgTime, setMsgTime] = useState('');


    useEffect(() => {
        if(message.sender._id == myData._id)    setSender('me');
        else    setSender('participant');

        setMsgTime(formatDate(message.createdAt));
    }, [])



    const formatDate = (date) => {
        const currentDate = new Date();
        const inputDate = new Date(date);
        const timeDiff = currentDate - inputDate;

        // within 24 hr
        if(timeDiff < 24 * 60 * 60 * 1000) {
            const formattedTime = inputDate.toLocaleTimeString('en-US',
                        { hour: '2-digit', minute: '2-digit', hour12: true });

            return formattedTime;
        }
        else {
            const day = inputDate.getDate();
            const month = inputDate.toLocaleString('default', { month: 'short' });
            const year = inputDate.getFullYear().toString().slice(-2);
            const hours = inputDate.getHours();
            const minutes = inputDate.getMinutes();


            return   `${day}/${month}/${year} at ${hours}:${minutes}`;
        }
    }


    return (
        <>
            {sender === 'me' ? (
                <div className={sender}>
                    <p className='content'>{message.content}</p>
                    <p className="time">{msgTime}</p>
                </div>
            ) : (
                <div className='single-message-cont'>
                    <div className="img">
                        <img 
                            src={`./../../img/users/${message.sender.photo}`} 
                            alt="" />
                    </div>
                    <div className={sender}>
                        <p className="participant-name">{message.sender.name}</p>
                        <p className='content'>{message.content}</p>
                        <p className="time">{msgTime}</p>
                    </div>  
                </div>
            )}
        </>
    )
}

export default GroupMessage;