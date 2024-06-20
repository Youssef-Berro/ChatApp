import React, {useContext, useState} from 'react'
import { OpenedChatContext, OpenedGroupContext } from './../components/ChatPage'
import ReceiverNav from './ReceiverNav'
import ChatHistory from './ChatHistory'
import ChatInput from './ChatInput'
import ReceiverInfo from './ReceiverInfo'
import GroupNav from './GroupNav'
import GroupHistory from './GroupHistory'
import GroupInput from './GroupInput'
import GroupInfo from './GroupInfo'
import './../css/ChatMessages.css'



function Messages() {
    const {openedChat} = useContext(OpenedChatContext);
    const {openedGroup} = useContext(OpenedGroupContext);
    const [receiverInfo, openreceiverInfo] = useState(false);
    const [groupInfo, openGroupInfo] = useState(false);

    const setOpenreceiverInfo = (bool) => { openreceiverInfo(bool) };
    const setOpenGroupInfo = (bool) => { openGroupInfo(bool) };

    return (
        <div className='chat-message-container'>
            {Object.keys(openedChat).length !== 0 && 
                <>
                    {receiverInfo && <ReceiverInfo setOpenreceiverInfo={setOpenreceiverInfo} />}
                    <ReceiverNav setOpenreceiverInfo={setOpenreceiverInfo} />
                    <ChatHistory />
                    <ChatInput />
                </>}

            {Object.keys(openedGroup).length !== 0 &&
                <>
                    {groupInfo && <GroupInfo setOpenGroupInfo={setOpenGroupInfo} />}
                    <GroupNav 
                        setOpenGroupInfo={setOpenGroupInfo} 
                        setOpenreceiverInfo={setOpenreceiverInfo} />
                    <GroupHistory />
                    <GroupInput />
                </>}
        </div>
    )
}

export default Messages;