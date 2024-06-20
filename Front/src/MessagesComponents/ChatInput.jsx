import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { 
    ChatsContext, 
    OpenedChatContext, 
    OpenedChatMessagesContext, 
    SocketContext 
} from '../components/ChatPage'

function ChatInput() {
    const token = localStorage.getItem('token');
    const myData = JSON.parse(localStorage.getItem('myData'));
    const [message, setMessage] = useState('');

    // contexts
    const {openedChat} = useContext(OpenedChatContext);
    const {chats, setChats} = useContext(ChatsContext);
    const {socket} = useContext(SocketContext);
    const {setOpenedChatMessages} = useContext(OpenedChatMessagesContext);

    const handlePressKey = async (event) => {
        if((event.key !== 'Enter') || (message === ''))   return;

        try {
            // don't forget states in react are asynchronous
            setMessage('');
            const resp = await axios.post(`http://localhost:8000/api/messages`,
                                {chat: openedChat._id, content: message},
                                {headers : {Authorization: `Bearer ${token}`}});

            const data = resp.data; 

            setOpenedChatMessages((prevMessages) => ([...prevMessages, data]));
            socket.emit('send message', {room: openedChat._id, message: data, sender: myData._id});


            let currChat = chats.filter( chat => chat._id == openedChat._id)[0];
            const otherChats = chats.filter( chat => chat._id != openedChat._id);        

            currChat.latestMessage = {...data};
            setChats([currChat, ...otherChats]);
        }catch(err) {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: `Error`,
                showConfirmButton: false,
                timer: 1500
            })
        }
    }

    const handleInputChange = (e) => {
        setMessage(e.target.value);
        socket.emit('typing', {room: openedChat._id});
    }

    return (
        <div className='chat-input-container'>
            <input 
                type="text"
                onKeyDown={handlePressKey}
                autoFocus={true}
                value={message}
                onChange={handleInputChange}
                placeholder='Type a message...'/>
        </div>
    )
}

export default ChatInput;