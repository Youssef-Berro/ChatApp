import React, {useContext, useState} from 'react'
import { OpenedChatContext, ChatsContext, SocketContext } from '../components/ChatPage'
import Button from '../utils/Button'
import axios from 'axios'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import Loading from '../utils/Loading'


function receiverInfo(props) {
    const token = localStorage.getItem('token');
    const {socket} = useContext(SocketContext);
    const {openedChat, setOpenedChat} = useContext(OpenedChatContext);
    const {chats, setChats} = useContext(ChatsContext);
    const [loading, setLoading] = useState(false);

    const myData = JSON.parse(localStorage.getItem('myData'));
    const receiverData = (openedChat.participants[0]._id == myData._id) ? 
                            openedChat.participants[1] : 
                            openedChat.participants[0] ;

    const handleDeleteChat = async () => {
        try{
            const result = await Swal.fire({
                title: `Are you sure you need to delete the chat with ${openedChat.chatName}?`,
                showCancelButton: true,
                confirmButtonText: 'Yes',
                customClass: {
                    confirmButton: 'custom-confirm-button'
                }
            });

            if(result.isConfirmed) {
                setLoading(true);
                await axios.delete(`http://localhost:8000/api/chats/delete-chat/${openedChat._id}`, {
                    headers: {Authorization : `Bearer ${token}`}
                })

                const updatedChats = chats.filter(chat => chat._id != openedChat._id);
                props.setOpenreceiverInfo(false);
                socket.emit('delete chat', {room: openedChat._id, name: myData.name});
                socket.emit('leave room', {room: openedChat._id});
                setOpenedChat({});
                setChats([...updatedChats]);
                setLoading(false);

                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Chat deleted',
                    showConfirmButton: false,
                    timer: 1000
                })
            }
        }catch(err) {
            setLoading(false);
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: `Error`,
                showConfirmButton: false,
                timer: 1500
            })
        }
    }

    return (
        <>
            {loading && <Loading />}
            <div className="receiver-info">
                <div className="head">
                    <div className="receiver-photo img">
                        <img 
                            src={`./../../img/users/${openedChat.chatPhoto}`} 
                            alt="img not found" />
                    </div>
                    <div className="close-comp" 
                        onClick={() => props.setOpenreceiverInfo(false)}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg" 
                                height="1.4rem" 
                                viewBox="0 0 384 512">
                                    <path d="M342.6 150.6c12.5-12.5 12.5-32.8 
                                            0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 
                                            105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 
                                            32.8 0 45.3L146.7 256 41.4 361.4c-12.5 
                                            12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 
                                            0L192 301.3 297.4 406.6c12.5 12.5 32.8 
                                            12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 
                                            342.6 150.6z"/>
                            </svg>
                    </div>
                </div>
                <div className="name-cont">
                    <p className='text'>Name:</p> &nbsp;&nbsp;
                    <p className='value'>{receiverData.name}</p>
                </div>
                <div className="email-cont">
                    <p className='text'>Email:</p> &nbsp;&nbsp;
                    <p className='value'>{receiverData.email}</p>
                </div>
                <Button
                    moreClasses='btn-type2'
                    onClick={handleDeleteChat}
                    value='delete chat'/>
            </div>
            <div className="overlay"></div>
        </>
    )
}

export default receiverInfo;