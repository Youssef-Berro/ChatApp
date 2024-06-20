import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import Loading from '../utils/Loading'
import { OpenedChatContext, 
    OpenedGroupContext, 
    OpenedChatMessagesContext, 
    OpenedGroupMessagesContext, 
    SocketContext,
    GroupsContext
} from './../components/ChatPage'


function Group(props) {
    const {group} = props;
    const token = localStorage.getItem('token');
    const myData = JSON.parse(localStorage.getItem('myData'));
    const [loading, setLoading] = useState(false);
    
    // contexts
    const {socket} = useContext(SocketContext);
    const {groups, setGroups} = useContext(GroupsContext)
    const {setOpenedGroup} = useContext(OpenedGroupContext);
    const {setOpenedGroupMessages} = useContext(OpenedGroupMessagesContext);
    const {setOpenedChatMessages} = useContext(OpenedChatMessagesContext);
    const {setOpenedChat} = useContext(OpenedChatContext);


    // add active class for opened group
    const openGroupInfoFct = async () => {
        try {
            setLoading(true);
            const resp = await axios.get(`http://localhost:8000/api/group-messages/group-messagesv1/${group._id}`,
                            {headers : {Authorization: `Bearer ${token}`}});

            const data = await resp.data;

            setOpenedChat({});
            setOpenedChatMessages([]);
            setOpenedGroup({...group});
            setOpenedGroupMessages([...data.data.messages]);


            const currGroup = groups.filter(grp => grp._id == group._id)[0];
            if(currGroup.notificationCounter != undefined) {
                const otherGroups = groups.filter(grp => grp._id != group._id);
                currGroup.notificationCounter = undefined;
                setGroups([currGroup, ...otherGroups]);
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
            <div className='user' onClick={openGroupInfoFct}>
                <div className="img">
                    <img 
                        src={`./../../img/groups/${group.profil}`} 
                        alt="img not found" />
                </div>
                <div className='right-section'>
                    <div className="group-name">{group.name}</div>
                    {group.latestMessage && 
                        <div className="latest-message">
                            <p className='name'>
                                {(group.latestMessage.sender._id == myData._id) ? 'me : ' :
                                    (`${group.latestMessage.sender.name} :`)}
                            </p>
                            <p className='lt'>{group.latestMessage.content}</p>
                        </div>}
                </div>
                {group.notificationCounter && 
                    <div className="chat-notification-counter">
                        {group.notificationCounter}
                    </div>}
            </div>
        </>
    )
}

export default Group;