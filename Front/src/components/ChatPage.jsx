import React, { createContext, useState, useEffect } from "react"
import './../css/ChatPage.css'
import SideBar from "./SideBar"
import RecentChats from "./../ChatsAndGroupsWithCreationComponents/RecentChats"
import Messages from "./../MessagesComponents/Messages"
import { useNavigate } from "react-router-dom"
import Info from "./Info"
import io from 'socket.io-client'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'


const SwitchPageContext = createContext();
const ChatsContext = createContext();
const GroupsContext = createContext();
const OpenedChatContext = createContext();
const OpenedGroupContext = createContext();
const OpenedChatMessagesContext = createContext();
const OpenedGroupMessagesContext = createContext();
const SocketContext = createContext();


function ChatPage() {
    const path = useNavigate();
    const token = localStorage.getItem('token');
    const myData = JSON.parse(localStorage.getItem('myData'));

    useEffect(() => {
        if (!token || !myData)   path('/');
    }, [token, myData]);

    const [switchPage, setSwitchPage] = useState(true); // true: chat-page, false: group-page
    const [chats, setChats] = useState([]);
    const [groups, setGroups] = useState([]);
    const [openedChat, setOpenedChat] = useState({});
    const [openedGroup, setOpenedGroup] = useState({});
    const [openedChatMessages, setOpenedChatMessages] = useState([]);
    const [openedGroupMessages, setOpenedGroupMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [myRoom, joinMyRoom] = useState(false);


    useEffect(() => {
        const newSocket = io.connect('http://localhost:8000');
        setSocket(newSocket);


        // Clean up the socket connection when the component unmounts
        return () => {
            newSocket.disconnect();
        };
    }, [])



    useEffect(() => {
        // when the connection are established and am not already joined my room then join it
        if((socket !== null) && (myRoom === false)) {
            socket.emit('join room', {room: myData._id})
            joinMyRoom(true);
        }
    }, [socket])


    const handleReceiveDeleteChat = (data) => {
        socket.emit('leave room', {room: data.room});
        if(openedChat._id == data.room) {
            setOpenedChat({});
            setOpenedChatMessages([]);
        }

        const otherChats = chats.filter(chat => chat._id != data.room);
        setChats([...otherChats]);

        Swal.fire({
            position: 'center',
            icon: 'info',
            title: `chat with ${data.name} deleted by him`,
            showConfirmButton: false,
            timer: 2000
        })
    }


    const handleReceiveDeleteGroup = (data) => {
        socket.emit('leave room', {room: data.room});
        if(openedGroup._id == data.room) {
            setOpenedGroup({});
            setOpenedGroupMessages([]);
        }

        const updatedGroups = groups.filter(group => group._id != data.room);
        setGroups([...updatedGroups]);

        Swal.fire({
            position: 'center',
            icon: 'info',
            title: `group ${data.name} deleted by the admin ${data.admin}`,
            showConfirmButton: false,
            timer: 2000
        })
    }


    const handleReceiveCreateChat = (data) => {
        setChats( prevChats => [data.chat, ...prevChats]);
        socket.emit('join room', {room: data.chat._id});

        Swal.fire({
            position: 'center',
            icon: 'info',
            title: `chat created with ${data.chatName} by him`,
            showConfirmButton: false,
            timer: 2000
        })
    }


    const handleReceiveCreateGroup = (data) => {
        setGroups(prevChats => [data.group, ...prevChats]);
        socket.emit('join room', data.group._id);

        Swal.fire({
            position: 'center',
            icon: 'info',
            title: `${data.group.name} created by ${data.adminName}`,
            showConfirmButton: false,
            timer: 2000
        })
    }


    const handleReceiveRemoveParticipant = (data) => {
        socket.emit('leave room', {room: data.group._id});
        if(openedGroup._id == data.group._id) {
            setOpenedGroup({});
            setOpenedGroupMessages([]);
        }

        const updatedGroups = groups.filter(group => group._id != data.group._id);
        console.log(updatedGroups);
        setGroups([...updatedGroups]);

        Swal.fire({
            position: 'center',
            icon: 'info',
            title: `${data.adminName} remove you from ${data.group.name} group`,
            showConfirmButton: false,
            timer: 2000
        })
    }


    const handleReceiveAddedToGroup = (data) => {
        setGroups(prevChats => [data.group, ...prevChats]);
        socket.emit('join room', data.group._id);

        Swal.fire({
            position: 'center',
            icon: 'info',
            title: `${data.adminName} add you to ${data.group.name} group`,
            showConfirmButton: false,
            timer: 2000
        })
    }



    // only group admin receive this event
    const handleReceiveLeaveGroup = (data) => {
        const updatedParticipants = openedGroup.participants.filter( participant => 
            participant._id !== data.participantId);

        if(openedGroup._id == data.groupId)
            setOpenedGroup({...openedGroup, participants: [...updatedParticipants]});


        const updatedGroups = groups.map( group => {
            if (group._id === data.groupId) 
                return { ...group, participants: updatedParticipants };
            return group;
        })
        setGroups(updatedGroups);

        Swal.fire({
            position: 'center',
            icon: 'info',
            title: `${data.participantName} leave ${data.groupName} group`,
            showConfirmButton: false,
            timer: 1500
        })
    }


    useEffect(() => {
        socket?.on('receive delete chat', handleReceiveDeleteChat);
        socket?.on('receive delete group', handleReceiveDeleteGroup);
        socket?.on('receive create chat', handleReceiveCreateChat);
        socket?.on('receive create group', handleReceiveCreateGroup);
        socket?.on('receive remove participant', handleReceiveRemoveParticipant);
        socket?.on('receive added to group', handleReceiveAddedToGroup);
        socket?.on('receive leave group', handleReceiveLeaveGroup);


        return () => {
            // Clean up the event listener when the component unmounts
            socket?.off('receive delete chat', handleReceiveDeleteChat);
            socket?.off('receive delete group', handleReceiveDeleteGroup);
            socket?.off('receive create chat', handleReceiveCreateChat);
            socket?.off('receive create group', handleReceiveCreateGroup);
            socket?.off('receive remove participant', handleReceiveRemoveParticipant);
            socket?.off('receive added to group', handleReceiveAddedToGroup);
            socket?.off('receive leave group', handleReceiveLeaveGroup);
        }
    }, [socket, openedChat, openedGroup, chats, groups]);


    return (
        <>
            <SocketContext.Provider value ={{socket, setSocket}}>
            <SwitchPageContext.Provider value ={{switchPage, setSwitchPage}}>
            <GroupsContext.Provider value ={{groups, setGroups}}>
            <ChatsContext.Provider value = {{chats, setChats}}>
            <OpenedChatContext.Provider value = {{openedChat, setOpenedChat}}>
            <OpenedGroupContext.Provider value = {{openedGroup, setOpenedGroup}}>
            <OpenedChatMessagesContext.Provider value = {{openedChatMessages, setOpenedChatMessages}}>
            <OpenedGroupMessagesContext.Provider value = {{openedGroupMessages, setOpenedGroupMessages}}>
                <div className="chat-page-container">
                    <div className="left-container">
                        <SideBar />
                        <RecentChats />
                    </div>
                    {(
                        (Object.keys(openedChat).length == 0) && 
                        (Object.keys(openedGroup).length == 0))
                        ? <Info/> : <Messages/>
                    }
                </div>
            </OpenedGroupMessagesContext.Provider>
            </OpenedChatMessagesContext.Provider>
            </OpenedGroupContext.Provider>
            </OpenedChatContext.Provider>
            </ChatsContext.Provider>
            </GroupsContext.Provider>
            </SwitchPageContext.Provider>
            </SocketContext.Provider>
        </>
    )
}


export {
    ChatPage,
    SwitchPageContext,
    ChatsContext,
    GroupsContext,
    OpenedChatContext,
    OpenedGroupContext,
    OpenedChatMessagesContext,
    OpenedGroupMessagesContext,
    SocketContext
};