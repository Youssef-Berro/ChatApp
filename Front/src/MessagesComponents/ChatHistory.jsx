import React, { useContext, useRef, useEffect, useState } from 'react'
import Message from './Message'
import { 
    OpenedChatMessagesContext, 
    SocketContext, 
    OpenedChatContext 
} from '../components/ChatPage'

function ChatHistory() {
    const { socket } = useContext(SocketContext);
    const {openedChat} = useContext(OpenedChatContext);
    const { openedChatMessages } = useContext(OpenedChatMessagesContext);
    const messagesScrollRef = useRef(null);
    const [typing, setTyping] = useState(false);
    const typingTimeoutRef = useRef(null);


    useEffect(() => {
        setTimeout(() => {
            messagesScrollRef.current.scrollIntoView({ behavior: "auto" });
        }, 1);
    }, [openedChatMessages]);


    const handleTyping = (data) => {
        if(openedChat._id != data.room)   return;

        // Clear the previous typing timeout if it exists
        clearTimeout(typingTimeoutRef.current);

        setTyping(true);

        // Set a new typing timeout
        typingTimeoutRef.current = setTimeout(() => {
            setTyping(false);
        }, 1000);
    }


    useEffect(() => {
        socket?.on('receive typing', handleTyping);

        return () => { socket?.off('receive typing', handleTyping) }
    }, [socket, openedChat])


    return (
        <div className='chat-history'>
            {openedChatMessages.length !== 0 && openedChatMessages.map(message => (
                <Message
                    key={message._id}
                    message={message}
                />
            ))}
            {typing && <div className="typing">
                <div className="circle"></div>
                <div className="circle"></div>
                <div className="circle"></div>
            </div>}
            <div ref={messagesScrollRef} />
        </div>
    )
}

export default ChatHistory;
