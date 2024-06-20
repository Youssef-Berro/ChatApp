import React, { useContext, useEffect, useState } from 'react'
import {useNavigate} from 'react-router-dom'
import Chat from './Chat'
import './../css/RecentChats.css'
import Group from './Group'
import axios from 'axios'
import UserSearch from './UserSearch'
import CreateGroupSearch from './CreateGroupSearch'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import Loading from '../utils/Loading'
import { getPartnerData } from '../utils/functions'
import { 
        SwitchPageContext,
        ChatsContext, 
        GroupsContext, 
        OpenedChatContext ,
        OpenedChatMessagesContext,
        OpenedGroupContext,
        OpenedGroupMessagesContext,
        SocketContext
} from './../components/ChatPage'



function RecentChats() {
    const path = useNavigate();
    const token = localStorage.getItem('token');
    const myData = JSON.parse(localStorage.getItem('myData'));
    if(!token)   path('/');

    // states
    const [displaySearch, setDisplaySearch] = useState(false);
    const [searchData, setSearchData] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [displayCreateGroup, setDisplayCreateGroup] = useState(false);
    const [groupSearchData, setGroupSearchData] = useState([]);
    const [addedUserToCreateGroup, setAddedUserToCreateGroup] = useState([]);
    const [filterNow, setFilterNow] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [loading, setLoading] = useState(false);
    const [playNotificationSound, setPlayNotificationSound] = useState(false);


    // contexts
    const {socket} = useContext(SocketContext);
    const {groups, setGroups} = useContext(GroupsContext);
    const {switchPage} = useContext(SwitchPageContext);
    const {chats, setChats} = useContext(ChatsContext);
    const {openedChat, setOpenedChat} = useContext(OpenedChatContext);
    const {setOpenedChatMessages} = useContext(OpenedChatMessagesContext);
    const {openedGroup, setOpenedGroup} = useContext(OpenedGroupContext);
    const {setOpenedGroupMessages} = useContext(OpenedGroupMessagesContext);


    useEffect(() => {
        // fetch chats
        if(chats.length == 0) {
            const fetchUserChats = async () => {
                const resp = await axios.get('http://localhost:8000/api/chats/user-chats', {
                    headers : {Authorization: `Bearer ${token}`}
                });

                const data = await resp.data;
                setChats(data);
            }

            fetchUserChats();
        }

        // fetch groups
        if(groups.length == 0) {
            const fetchGroups = async () => {
                const resp = await axios.get('http://localhost:8000/api/groups', {
                    headers : {Authorization: `Bearer ${token}`}
                });

                const data = await resp.data;
                setGroups(data);
            }

            fetchGroups();
        }
    }, [])


    // join all groups room
    useEffect(() => {
        if(groups.length !== 0)
            groups.forEach(group => socket.emit('join room', {room : group._id}))
    }, [groups])


    const createChat = async (user) => {
        try {
            setLoading(true);
            const existingChat = chats.find( chat => 
                chat.participants.some((participant) => participant._id === user._id));

            // if chat already exist get her messages, otherwith create it
            if(!existingChat) {
                const resp = await axios.post('http://localhost:8000/api/chats/create-chat',
                    { userId: user._id }, 
                    { headers : {Authorization : `Bearer ${token}` }
                })

                const data = await resp.data;


                setOpenedGroup({});
                setOpenedGroupMessages([]);
                setOpenedChatMessages([]);
                const [chatName, chatPhoto, partnerId] = getPartnerData(data);

                setChats( prevChats => [data, ...prevChats]);
                socket.emit('join room', {room : data._id});
                socket.emit('create chat', {room: partnerId, chatName: myData.name, chat: {...data}});
                setOpenedChat({...data, chatName, chatPhoto});
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Created',
                    showConfirmButton: false,
                    timer: 1000,
                })
            }
            else {
                const resp = await axios
                        .get(`http://localhost:8000/api/messages/chat-messages/${existingChat._id}`,
                        {headers : {Authorization: `Bearer ${token}`}});

                const data = await resp.data;


                setOpenedGroup({});
                setOpenedGroupMessages([]);
                const [chatName, chatPhoto] = getPartnerData(existingChat);

                setOpenedChatMessages([...data.data.messages]);
                socket.emit('join room', {room : existingChat._id});
                setOpenedChat({...existingChat, chatName, chatPhoto});
            }

            setLoading(false);
            setDisplaySearch(false);
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


    const createGroup = async (user) => {
        try {
            if((groupName === '') ||  (groupName.length > 30)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'group name must be between 1 and 30 characters',
                    customClass: {
                        confirmButton: 'custom-ok-button'
                    }
                })
                return;
            }
            else if(addedUserToCreateGroup.length < 2) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'group must contain at least 3 participants',
                    customClass: {
                        confirmButton: 'custom-ok-button'
                    }
                })
                return;
            }

            // at creation no latest message
            const groupData = {
                name: groupName, 
                participants: addedUserToCreateGroup.map(user => user._id)
            }

            const resp = await axios.post('http://localhost:8000/api/groups',
                {...groupData},
                {headers : {Authorization : `Bearer ${token}`}
            });

            const data = await resp.data;



            setGroups([data.group, ...groups])
            setOpenedChat({});
            setOpenedChatMessages([]);
            setOpenedGroup({...data.group});
            setOpenedGroupMessages([]);
            socket.emit('join room', {room : data.group._id});

            const rooms = addedUserToCreateGroup.map((user => user._id));
            socket.emit('create group', {
                        rooms: [...rooms],
                        adminName: myData.name, 
                        group: {...data.group}
                    });

            Swal.fire({
                position: 'center',
                icon: 'success',
                title: `${groupName} group are created`,
                showConfirmButton: false,
                timer: 1500
            })
            setGroupName('');
            setDisplayCreateGroup(false);
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


    useEffect(() => {
        if(displaySearch === false)  setSearchData([]);
    }, [displaySearch])


    useEffect(() => {
        if(displayCreateGroup === false) {
            setGroupSearchData([]);
            setAddedUserToCreateGroup([]);
        }
    }, [displayCreateGroup])


    const handleSearch = async () => {
        if(searchInput == '') {
            setSearchData([]);
            setGroupSearchData([]);
            return;
        }

        try{
            const resp = await axios.get(`http://localhost:8000/api/users/search?searchStr=${searchInput}`, {
                headers : {Authorization: `Bearer ${token}`}
            });

            const data = await resp.data;
            if(displaySearch)   setSearchData(data);
            else {
                setGroupSearchData(data);
                if(addedUserToCreateGroup.length !== 0)    setFilterNow(true);   
            }
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


    const handleReceiveMessage = (data) => {
        let currChat = chats.filter(chat => chat._id == data.room)[0];
        const otherChats = chats.filter(chat => chat._id != data.room);
        currChat.latestMessage = {...data.message};        


        // chat opened in both side
        if(openedChat?._id === data.room)
        {
            setOpenedChatMessages( prevMessages => ([...prevMessages, data.message]));
            setChats([currChat, ...otherChats]);
        }
        else {
            // one user open the chat => show as notification for the second user
            (currChat.notificationCounter) ? 
                currChat.notificationCounter++ :
                currChat.notificationCounter = 1;

            setChats([currChat, ...otherChats]);
            setPlayNotificationSound(true);
        }
    }


    const handleReceiveGroupMessage = (data) => {
        let currGroup = groups.filter( group => group._id == data.room)[0];
        const otherGroups = groups.filter(group => group._id != data.room);
        currGroup.latestMessage = {...data.message};


        // group opened in both side (sender and receiver)
        if(openedGroup?._id === data.room)
        {
            setOpenedGroupMessages( prevMessages => ([...prevMessages, data.message]));
            setGroups([currGroup, ...otherGroups]);
        }
        else {
            // one user open the group => show as notification for other users
            (currGroup.notificationCounter) ? 
                currGroup.notificationCounter++ :
                currGroup.notificationCounter = 1;

            setGroups([currGroup, ...otherGroups]);
            setPlayNotificationSound(true);
        }
    }


    // on creation
    const addUserToGroup = (user) => {
        const updatedSearchData = groupSearchData.filter((searchUser) => searchUser._id !== user._id);
        setAddedUserToCreateGroup((prevAddedUsers) => [...prevAddedUsers, user]);
        setGroupSearchData(updatedSearchData);
    }

    // on creation
    const removeUserFromGroup = (user) => {
        const updatedAddedData = addedUserToCreateGroup.filter(addedUser => addedUser._id != user._id);
        setAddedUserToCreateGroup([...updatedAddedData]);
    }


    useEffect(() => {
        if(filterNow) {
            const addedUserIds = addedUserToCreateGroup.map((addedUser) => addedUser._id);
            const updatedSearchData = groupSearchData.filter((searchUser) => !addedUserIds.includes(searchUser._id));
            setGroupSearchData([...updatedSearchData]);
            setFilterNow(false);
        }
    }, [filterNow])


    useEffect(() => {
        let interval;
        if(playNotificationSound) {
            interval = setInterval(() => {
                setPlayNotificationSound(false);
            }, 500)
        }

        return () => {
            // clear the interval when the component unmount
            clearInterval(interval); 
        }
    }, [playNotificationSound]);


    useEffect(() => {
        socket?.on('receive message', handleReceiveMessage);
        socket?.on('receive group message', handleReceiveGroupMessage);

        return () => {
            // Clean up the event listener when the component unmounts
            socket?.off('receive message', handleReceiveMessage) 
            socket?.off('receive group message', handleReceiveGroupMessage) 
        }
    }, [socket, openedChat, openedGroup, chats, groups])


    // functions only for Child Comp
    const setSearchInputFct = (value) => {setSearchInput(value)}
    const setDisplaySearchFct = (bool) => {setDisplaySearch(bool)}
    const setDisplayCreateGroupFct = (bool) => {setDisplayCreateGroup(bool)}
    const setGroupNameFct = (value) => { setGroupName(value)}


    return (
        <>
            {loading && <Loading />}
            {displaySearch && <UserSearch
                                displaySearch = {displaySearch}
                                setDisplaySearchFct = {setDisplaySearchFct}
                                setSearchInputFct = {setSearchInputFct}
                                handleSearch = {handleSearch}
                                createChat = {createChat}
                                searchData = {searchData}
                        />}

            {displayCreateGroup && <CreateGroupSearch 
                                    displayCreateGroup = {displayCreateGroup}
                                    setDisplayCreateGroupFct = {setDisplayCreateGroupFct}
                                    setGroupNameFct = {setGroupNameFct}
                                    createGroup = {createGroup}
                                    setSearchInputFct = {setSearchInputFct}
                                    handleSearch = {handleSearch}
                                    addedUserToCreateGroup = {addedUserToCreateGroup}
                                    removeUserFromGroup = {removeUserFromGroup}
                                    groupSearchData = {groupSearchData}
                                    addUserToGroup = {addUserToGroup}
                            />}

            <div className = 'users'>
                <div className = "head">
                    <div className = "title">{switchPage === true ? 'Chats' : 'Groups'}</div>
                    {switchPage === false ? (
                        <div 
                            className = 'create-group' 
                            onClick = {() => (setDisplayCreateGroup(true))}>
                                <svg 
                                    height = "1em" 
                                    viewBox = "0 0 640 512">
                                        <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 
                                            128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 
                                            304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 
                                            29.7H29.7C13.3 512 0 498.7 0 482.3zM504 312V248H440c-13.3 
                                            0-24-10.7-24-24s10.7-24 24-24h64V136c0-13.3 10.7-24 24-24s24 
                                            10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 
                                            24H552v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/>
                                </svg>
                        </div>
                    ) : (
                        <div 
                            className = 'search' 
                            onClick = {() => (setDisplaySearch(true))}>
                                <svg
                                    height = "1em"
                                    viewBox = "0 0 512 512">
                                        <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 
                                            457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 
                                            0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 
                                            0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208
                                            352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
                                </svg>
                        </div>
                    )}
                </div>

                {switchPage === true ? (
                    <div className='users-chat'>
                        {chats.length !== 0 && 
                            chats.map(chat => <Chat 
                                                key = {chat._id}
                                                chat = {chat} />)}
                    </div>
                ) : (
                    <div className="groups-chat">
                        {groups.length !== 0 && 
                            groups.map(group => <Group 
                                                    key = {group._id} 
                                                    group = {group}/>)}
                    </div>
                )}
            </div>
            {playNotificationSound && (
                    <audio autoPlay>
                        <source src='./../../notification-sound.mp3' type="audio/mp3" />
                        Your browser does not support the audio element.
                    </audio>
                )}
        </>
    )
}

export default RecentChats;