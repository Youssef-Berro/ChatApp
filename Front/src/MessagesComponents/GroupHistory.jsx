import React, { useContext, useEffect, useRef, useState } from 'react'
import GroupMessage from './GroupMessage'
import { 
    OpenedGroupContext, 
    OpenedGroupMessagesContext, 
    SocketContext 
} from '../components/ChatPage'

function GroupHistory() {
    const {socket} = useContext(SocketContext);
    const {openedGroup} = useContext(OpenedGroupContext);
    const {openedGroupMessages} = useContext(OpenedGroupMessagesContext);
    const messagesScrollRef = useRef(null);
    const [typing, setTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const [typingUserName, setTypingUserName] = useState('');


    useEffect(() => {
        setTimeout(() => {
            messagesScrollRef.current.scrollIntoView({ behavior: "auto" });
        }, 1);
    }, [openedGroupMessages]);


    const handleTyping = (data) => {
        if(openedGroup._id != data.room)    return;

        // Clear the previous typing timeout if it exists
        clearTimeout(typingTimeoutRef.current);

        setTyping(true);
        setTypingUserName(data.sender)

        // Set a new typing timeout
        typingTimeoutRef.current = setTimeout(() => {
            setTyping(false);
            setTypingUserName('');
        }, 1000);
    }

    useEffect(() => {
        socket?.on('receive group typing', handleTyping);

        return () => {
            // Clean up the event listener when the component unmounts.
            socket?.off('receive group typing', handleTyping);
        };
    }, [socket, openedGroup]);

    return (
        <div className='chat-history'>
            {openedGroupMessages.length !== 0  && openedGroupMessages.map(message => (
                <GroupMessage  
                    key={message._id} 
                    message={message}/>
            ))}
            {typing && <div className="group-typing-container">
                <p className='participant-name'>{typingUserName}</p>
                <div className="group-typing">
                    <div className="circle"></div>
                    <div className="circle"></div>
                    <div className="circle"></div>
                </div>  
            </div>}
            <div ref={messagesScrollRef} />
        </div>
    )
}

export default GroupHistory;