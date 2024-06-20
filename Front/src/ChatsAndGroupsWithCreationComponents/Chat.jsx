import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import './../css/Auth.css'
import Loading from '../utils/Loading'
import { getPartnerData } from '../utils/functions'
import { OpenedChatContext, 
        OpenedGroupContext, 
        OpenedChatMessagesContext, 
        OpenedGroupMessagesContext,
        SocketContext,
        ChatsContext
} from './../components/ChatPage'


function Chat(props) {
    const {chat} = props;
    const token = localStorage.getItem('token');
    const myData = JSON.parse(localStorage.getItem('myData'));
    const [loading, setLoading] = useState(false);



    // contexts
    const {socket} = useContext(SocketContext);
    const {setOpenedGroup} = useContext(OpenedGroupContext);
    const {setOpenedChat} = useContext(OpenedChatContext);
    const {chats, setChats} = useContext(ChatsContext);
    const {setOpenedChatMessages} = useContext(OpenedChatMessagesContext);
    const {setOpenedGroupMessages} = useContext(OpenedGroupMessagesContext);
    const [chatName, chatPhoto] = getPartnerData(chat);


    useEffect(() => {
        socket.emit('join room', {room : chat._id});
    }, [chat])


    const openChatInfoFct = async () => {
        try {
            setLoading(true);
            const resp = await axios.get(`http://localhost:8000/api/messages/chat-messages/${chat._id}`,
                            {headers : {Authorization: `Bearer ${token}`}});

            const data = await resp.data;


            setOpenedGroup({});
            setOpenedGroupMessages([]);
            setOpenedChat({...chat, chatName, chatPhoto});
            setOpenedChatMessages([...data.data.messages]);


            const currChat = chats.filter(ch => ch._id == chat._id)[0];
            if(currChat.notificationCounter != undefined) {
                const otherChats = chats.filter(ch => ch._id != chat._id);
                currChat.notificationCounter = undefined;
                setChats([currChat, ...otherChats]);
            }


            setLoading(false);
        }catch(err) {
            setLoading(false);
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Error',
                showConfirmButton: false,
                timer: 1500
            })
        }
    }


    return (
        <>
            {loading && <Loading/>}
            <div className='user' onClick={openChatInfoFct} >
                <div className="img">
                    <img 
                        src={`./../../img/users/${chatPhoto}`}
                        alt="img not found" />
                </div>
                <div className='right-section'>
                    <div className="chat-name">{chatName}</div>
                    {chat.latestMessage && 
                        <div className="latest-message">
                            <p className='name'>
                                {(chat.latestMessage.sender._id == myData._id) ? 'me : ' :
                                (`${chat.latestMessage.sender.name} :`)}
                            </p>
                            &nbsp;
                            <p className='lt'>{chat.latestMessage.content}</p>
                        </div>}
                </div>
                {chat.notificationCounter && 
                    <div className="chat-notification-counter">
                        {chat.notificationCounter}
                    </div>}
            </div>
        </>
    )
}

export default Chat;