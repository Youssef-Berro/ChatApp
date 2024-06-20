import axios from 'axios'
import React, { useContext, useState } from 'react'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { 
    GroupsContext,
    OpenedGroupContext, 
    OpenedGroupMessagesContext, 
    SocketContext 
} from '../components/ChatPage'

function GroupInput() {
    const token = localStorage.getItem('token');
    const myData = JSON.parse(localStorage.getItem('myData'));
    const {socket} = useContext(SocketContext);
    const [message, setMessage] = useState('');


    // contexts
    const {groups, setGroups} = useContext(GroupsContext);
    const {setOpenedGroupMessages} = useContext(OpenedGroupMessagesContext);
    const {openedGroup} = useContext(OpenedGroupContext);



    // works on press enter only
    const handlePressKey = async (event) => {
        if((event.key !== 'Enter') || (message === ''))   return;

        try {
            setMessage('');
            const resp = await axios.post(`http://localhost:8000/api/group-messages`,
                                {group: openedGroup._id, content: message},
                                {headers : {Authorization: `Bearer ${token}`}});

            const data = await resp.data;
            setOpenedGroupMessages((prevMessages) => ([...prevMessages, data]));
            socket.emit('send group message', {room: openedGroup._id, message: data, sender: myData._id});

            let currGroup = groups.filter( group => group._id == openedGroup._id)[0];
            const otherGroups = groups.filter( group => group._id != openedGroup._id);        

            currGroup.latestMessage = {...data};
            setGroups([currGroup, ...otherGroups]);
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
        socket.emit('group typing', {room: openedGroup._id, sender: myData.name});
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

export default GroupInput;