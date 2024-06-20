import React, {useContext, useEffect, useState} from 'react'
import { OpenedGroupContext, GroupsContext, SocketContext } from '../components/ChatPage'
import GroupParticipant from './GroupParticipant'
import AddParticipant from './AddParticipant'
import axios from 'axios'
import Button from '../utils/Button'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import Input from '../utils/Input'
import Loading from '../utils/Loading'

function GroupInfo(props) {
    const token = localStorage.getItem('token');
    const myData = JSON.parse(localStorage.getItem('myData'));

    // contexts
    const {socket} = useContext(SocketContext)
    const {openedGroup, setOpenedGroup} = useContext(OpenedGroupContext);
    const {groups, setGroups} = useContext(GroupsContext);


    // states
    const [updateName, openUpdateName] = useState(false);
    const [updateDesc, openUpdateDesc] = useState(false);
    const [newName, setNewName] = useState(openedGroup.name);
    const [newDesc, setNewDesc] = useState(openedGroup.description);
    const [openedGroupParticipants, setOpenedGroupParticipants] = useState([]);
    const [addParticipant, openAddParticipant] = useState(false);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        setOpenedGroupParticipants([...openedGroup.participants])
    },[])


    // function used for update name and update groop
    const handleUpdateGroup = async (attrb) => {
        const newData = ([attrb] == 'name') ? newName : newDesc;


        if(([attrb] == 'name') && (newData == openedGroup.name)) {
            openUpdateName(false);
            return;
        }
        else if(([attrb] == 'description') && (newData == openedGroup.description)) {
            openUpdateDesc(false);
            return;
        }
        else if(([attrb] == 'name') && (newData == '')) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'group name cannot be empty',
                customClass: {
                    confirmButton: 'custom-ok-button'
                }
            })
            setNewName(openedGroup.name);
            openUpdateName(false);
            return;
        }
        else if(([attrb] == 'name') && (newData.length >= 30)) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'group name must be less than 30 character',
                customClass: {
                    confirmButton: 'custom-ok-button'
                }
            })
            setNewName(openedGroup.name);
            openUpdateName(false);
            return;
        }

        try {
            await axios.patch(`http://localhost:8000/api/groups/update-group/${openedGroup._id}`, {
                [attrb]: newData}, {
                headers : {Authorization: `Bearer ${token}`}
            });

            const index = groups.findIndex(group => group._id == openedGroup._id);

            // update group in RecentChat comp
            if (index !== -1) {
                const updatedGroups = [...groups];
                updatedGroups[index] = { ...updatedGroups[index], [attrb]: newData };
                setGroups(updatedGroups);
            }

            setOpenedGroup({...openedGroup, [attrb]: newData});
            if([attrb] == 'name')
                openUpdateName(false);
            else if([attrb] ='description')
                openUpdateDesc(false);

            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'group updated',
                showConfirmButton: false,
                timer: 1500
            })
        }catch(err) {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Error',
                showConfirmButton: false,
                timer: 1000
            })
        }
    }


    const handleUpdateImage = async (e) => {
        const profil = e.target.files[0];
        const formData = new FormData();
        const photoName = `${Date.now()}_${profil.name}`;
        formData.append('profil', profil, photoName);

        try {
            await axios.patch(`http://localhost:8000/api/groups/update-group/${openedGroup._id}`,
                formData,
                {headers : {
                    'Content-Type': 'multipart/form-data',
                    Authorization : `Bearer ${token}`
                }
            })
            const index = groups.findIndex(group => group._id == openedGroup._id);

            // update group in RecentChat comp
            if (index !== -1) {
                const updatedGroups = [...groups];
                updatedGroups[index] = { ...updatedGroups[index], profil: photoName};
                setGroups(updatedGroups);
            }

            setOpenedGroup({...openedGroup, profil: photoName});
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Updated',
                showConfirmButton: false,
                timer: 1500
            })
        }catch(err) {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Error',
                showConfirmButton: false,
                timer: 1000
            })
        }
    }


    const handleDeleteGroup = async () => {
        try {
            const result = await Swal.fire({
                title: `Do you want to delete ${openedGroup.name} group?`,
                showCancelButton: true,
                confirmButtonText: 'Yes',
                customClass: {
                    confirmButton: 'custom-confirm-button'
                }
            });

            if(result.isConfirmed) {
                await axios.delete(`http://localhost:8000/api/groups/${openedGroup._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setGroups((prevGroups) =>
                    prevGroups.filter((group) => group._id !== openedGroup._id)
                );

                socket.emit('delete group', {
                                                room: openedGroup._id, 
                                                name: openedGroup.name, 
                                                admin: myData.name
                                            })
                socket.emit('leave room', {room: openedGroup._id});
                setOpenedGroup({});
                setOpenedGroupParticipants([]);
                props.setOpenGroupInfo(false);

                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Deleted',
                    showConfirmButton: false,
                    timer: 1500
                })
            }
        }catch (err) {
            console.error(err);
        }
    }

    const handleDropPhoto = async () => {
        if(openedGroup.profil === 'default.jpg') 
        {
            Swal.fire({
                position: 'center',
                icon: 'info',
                title: 'group already without photo',
                showConfirmButton: false,
                timer: 1500
            })
            return;
        }


        try {
            await axios.patch(`http://localhost:8000/api/groups/drop-photo/${openedGroup._id}`, {}, {
                headers : {Authorization : `Bearer ${token}`}
            })

            const index = groups.findIndex(group => group._id == openedGroup._id);

            // update group in RecentChat comp
            if (index !== -1) {
                const updatedGroups = [...groups];
                updatedGroups[index] = { ...updatedGroups[index], profil: 'default.jpg'};
                setGroups(updatedGroups);
            }

            setOpenedGroup({...openedGroup, profil: 'default.jpg'});
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'group updated',
                showConfirmButton: false,
                timer: 1500
            })
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

    const leaveGroup = async () => {
        if(openedGroupParticipants.length == 3)
        {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'group participants cannot be less than 3',
                customClass: {
                    confirmButton: 'custom-ok-button'
                }
            })
            return;
        }


        try {
            setLoading(true);
            await axios.patch(`http://localhost:8000/api/groups/leave-group/${openedGroup._id}`, {}, {
                headers : {Authorization : `Bearer ${token}`}
            })

            setOpenedGroupParticipants([]);
            socket.emit('leave room', {room: openedGroup._id});
            socket.emit('leave group', {
                                room: openedGroup.groupAdmin, 
                                groupId: openedGroup._id,
                                groupName: openedGroup.name,
                                participantId: myData._id,
                                participantName: myData.name
                            });


            const updatedGroups = groups.filter( group => group._id != openedGroup._id);
            setOpenedGroup({});
            setGroups([...updatedGroups]);
            props.setOpenGroupInfo(false);


            setLoading(false);
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'group leaved',
                showConfirmButton: false,
                timer: 1000
            })
        }catch(err) {
            setLoading(false);
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Error',
                showConfirmButton: false,
                timer: 1000
            })
        }
    }

    // functions for child components(as props)
    const OpenAddParticipantFct = (bool) => { openAddParticipant(bool) }



    // for efficiency update the data in addParticipantFct and 
    // removeParticipantFct(the following 2 functions) better than everytime when i click
    // on a group => populate it in the server side, because also population needs search
    // complexity, but the difference is that we click on groups more than editing group participants
    const addParticipantFct = (newParticipant) => {
        const updatedGroup = {...openedGroup, 
                            participants: [...openedGroup.participants, newParticipant]};

        // update opened group participants in OpenedGroupParticipants state
        setOpenedGroupParticipants([newParticipant, ...openedGroupParticipants]);

        // update opened group participants in openedGroup state
        setOpenedGroup({...updatedGroup});

        // update opened group participants in groups state
        const otherGroups = groups.filter( group => group._id !== openedGroup._id);
        setGroups([updatedGroup, ...otherGroups]);


        socket.emit('add participant', {
                        room: newParticipant._id,
                        adminName: myData.name,
                        group: openedGroup
                    });
    }


    const removeParticipant = (participantId) => {
        // update opened group participants in OpenedGroupParticipants state
        const updatedParticipants = openedGroupParticipants.filter(user => user._id != participantId);
        setOpenedGroupParticipants([...updatedParticipants]);

        // update opened group participants in openedGroup state
        const updatedGroup = {...openedGroup, participants: [...updatedParticipants]}
        setOpenedGroup({...updatedGroup});

        // update opened group participants in groups state
        const otherGroups = groups.filter( group => group._id !== openedGroup._id);
        setGroups([updatedGroup, ...otherGroups]);


        socket.emit('remove participant', {
            room: participantId,
            adminName: myData.name,
            group: openedGroup});
    }


    // only group admin receive this event
    const handleReceiveLeaveGroup = (data) => {
        const updatedParticipants = openedGroupParticipants.filter( participant => 
                participant._id !== data.participantId);

        setOpenedGroupParticipants([...updatedParticipants]);
    }



    useEffect(() => {
        socket?.on('receive leave group', handleReceiveLeaveGroup);

        return () => {socket?.off('receive leave group', handleReceiveLeaveGroup)}
    }, [socket, openedGroup]);


    return (
        <>
            {loading && <Loading />}
            {addParticipant && <AddParticipant
                                groupId = {openedGroup._id}
                                OpenAddParticipantFct = {OpenAddParticipantFct}
                                addParticipant = {addParticipantFct}
                                openedGroupParticipants = {openedGroupParticipants}/>}

            <div className="group-info">
                <div className="head">
                    <div className="title">Group Info</div>
                    <div 
                        className = 'close-comp' 
                        onClick = {() => props.setOpenGroupInfo(false)}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg" 
                                height="1em" 
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
                <div className="info">
                    <div className="info-left-section">
                        <div className="img">
                            <img 
                                src={`./../../img/groups/${openedGroup.profil}`} 
                                alt="img not found" />
                        </div>
                        <div className="photo-operations">
                            <form encType="multipart/form-data">
                                <label htmlFor="fileInput" className="change-photo">
                                    change group photo
                                </label>
                                <input 
                                    id="fileInput"
                                    type="file"
                                    accept="image/jpeg, image/png"
                                    onChange={handleUpdateImage}
                                    className='change-photo'/>
                            </form>
                            <div 
                                onClick={handleDropPhoto}
                                className="drop-photo" >
                                <svg
                                    className='drop-photo-icon'
                                    xmlns="http://www.w3.org/2000/svg"  
                                    viewBox="0 0 64 64">
                                        <title>drop group profil</title>
                                        <path d="M 30 2 C 29 2 28.101563 2.5 27.5 3.300781 L 24.5 8 
                                                L 13 8 C 11.300781 8 10 9.300781 10 11 L 10 17 C 10 
                                                18.699219 11.300781 20 13 20 L 13.097656 20 L 16.597656 
                                                53.5 C 16.898438 56.101563 19 58 21.597656 58 L 46.402344 
                                                58 C 49 58 51.101563 56.101563 51.402344 53.5 L 54.902344 
                                                20 L 55 20 C 56.699219 20 58 18.699219 58 17 L 58 11 C 
                                                58 9.300781 56.699219 8 55 8 L 43.5 8 L 40.402344 3.300781 
                                                C 39.902344 2.5 38.902344 2 37.902344 2 Z M 30.097656 4 
                                                L 38 4 C 38.300781 4 38.601563 4.199219 38.800781 4.398438 
                                                L 41.097656 8 L 26.902344 8 L 29.199219 4.398438 C 29.398438 
                                                4.199219 29.699219 4 30.097656 4 Z M 13 10 L 55 10 C 55.601563 
                                                10 56 10.398438 56 11 L 56 17 C 56 17.601563 55.601563 18 55 18 
                                                L 13 18 C 12.398438 18 12 17.601563 12 17 L 12 11 C 12 10.398438 
                                                12.398438 10 13 10 Z M 16 12 C 15.398438 12 15 12.398438 15 13 
                                                L 15 15 C 15 15.601563 15.398438 16 16 16 C 16.601563 16 17 
                                                15.601563 17 15 L 17 13 C 17 12.398438 16.601563 12 16 12 Z 
                                                M 21 12 C 20.398438 12 20 12.398438 20 13 L 20 15 C 20 
                                                15.601563 20.398438 16 21 16 C 21.601563 16 22 15.601563 22 
                                                15 L 22 13 C 22 12.398438 21.601563 12 21 12 Z M 26 12 C 
                                                25.398438 12 25 12.398438 25 13 L 25 15 C 25 15.601563 
                                                25.398438 16 26 16 C 26.601563 16 27 15.601563 27 15 L 27 13 
                                                C 27 12.398438 26.601563 12 26 12 Z M 31 12 C 30.398438 12 30 
                                                12.398438 30 13 L 30 15 C 30 15.601563 30.398438 16 31 16 C 
                                                31.601563 16 32 15.601563 32 15 L 32 13 C 32 12.398438 31.601563 
                                                12 31 12 Z M 37 12 C 36.398438 12 36 12.398438 36 13 L 36 15 C 
                                                36 15.601563 36.398438 16 37 16 C 37.601563 16 38 15.601563 38 
                                                15 L 38 13 C 38 12.398438 37.601563 12 37 12 Z M 42 12 C 
                                                41.398438 12 41 12.398438 41 13 L 41 15 C 41 15.601563 41.398438 
                                                16 42 16 C 42.601563 16 43 15.601563 43 15 L 43 13 C 43 
                                                12.398438 42.601563 12 42 12 Z M 47 12 C 46.398438 12 46 
                                                12.398438 46 13 L 46 15 C 46 15.601563 46.398438 16 47 16 
                                                C 47.601563 16 48 15.601563 48 15 L 48 13 C 48 12.398438 
                                                47.601563 12 47 12 Z M 52 12 C 51.398438 12 51 12.398438 
                                                51 13 L 51 15 C 51 15.601563 51.398438 16 52 16 C 52.601563 
                                                16 53 15.601563 53 15 L 53 13 C 53 12.398438 52.601563 12 52 
                                                12 Z M 15.097656 20 L 52.902344 20 L 49.402344 53.300781 C 
                                                49.199219 54.800781 48 56 46.402344 56 L 21.597656 56 C 
                                                20.097656 56 18.800781 54.800781 18.597656 53.300781 Z M 
                                                34 25 C 33.398438 25 33 25.398438 33 26 L 33 46 C 33 
                                                46.601563 33.398438 47 34 47 C 34.601563 47 35 46.601563 
                                                35 46 L 35 26 C 35 25.398438 34.601563 25 34 25 Z M 25 
                                                25.097656 C 24.398438 25.097656 24 25.597656 24.097656 26.097656 
                                                L 25.097656 46.097656 C 25 46.597656 25.5 47 26 47 C 26.601563 
                                                47 27 46.5 27 46 L 26 26 C 26 25.398438 25.5 25 25 25.097656 Z 
                                                M 43.097656 25.097656 C 42.5 25.097656 42.097656 25.5 42.097656 
                                                26 L 41.097656 46 C 41 46.5 41.398438 47 42 47 C 42.601563 47 43 
                                                46.597656 43 46.097656 L 44 26.097656 C 44 25.5 43.597656 
                                                25.097656 43.097656 25.097656 Z M 23 52 C 22.398438 52 22 
                                                52.398438 22 53 C 22 53.601563 22.398438 54 23 54 L 37 54 
                                                C 37.601563 54 38 53.601563 38 53 C 38 52.398438 37.601563 52 
                                                37 52 Z M 41 52 C 40.398438 52 40 52.398438 40 53 C 40 
                                                53.601563 40.398438 54 41 54 L 45 54 C 45.601563 54 46 
                                                53.601563 46 53 C 46 52.398438 45.601563 52 45 52 Z">
                                        </path>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="participants">
                        <div className="participants-cont">
                            {openedGroupParticipants.length !== 0 && 
                                <p className='text'>
                                    {`Participants (${openedGroupParticipants.length})`} &nbsp; :
                                </p>
                            }
                            {myData._id == openedGroup.groupAdmin &&
                                <>
                                    <div 
                                        onClick={() => openAddParticipant(true)} 
                                        className='add-participant'>
                                        <div className="icon">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg" 
                                                viewBox="0 0 32 32" >
                                                    <path d="M6.55 7.12c0 3.64 2.97 6.61 
                                                        6.62 6.61s6.62-2.97 
                                                        6.62-6.61c0-3.65-2.97-6.62-6.62-6.62S6.55 3.47 6.55 
                                                        7.12zM1.67 26v2c0 1.93 1.57 3.5 3.5 3.5h16c1.93 0 
                                                        3.5-1.57 3.5-3.5v-2c0-6.34-5.16-11.5-11.5-11.5S1.67 
                                                        19.66 1.67 26zm25.543-10.651v-1.617h1.616a1.5 1.5 0 
                                                        0 0 0-3h-1.616V9.116a1.5 1.5 0 0 0-3 0v1.616h-1.615a1.5 
                                                        1.5 0 0 0 0 3h1.615v1.617a1.5 1.5 0 0 0 3 0z">
                                                    </path>
                                            </svg>
                                        </div>
                                        <p>Add Participants</p>
                                    </div>
                                </>
                            }
                            {openedGroupParticipants.map(participant => 
                                <GroupParticipant 
                                    key = {participant._id}
                                    nbOfParticipants = {openedGroupParticipants.length}
                                    groupId = {openedGroup._id}
                                    participant = {participant}
                                    removeParticipant={removeParticipant}
                                    groupAdmin = {openedGroup.groupAdmin}/>)}
                        </div>
                    </div>
                    <div className="info-right-section">
                        <div className="name-cont">
                            <p className='text'>Name</p> &nbsp;&nbsp;
                            <div className="info-field">
                                <p className='value'>{openedGroup.name}</p>
                                {updateName ? (
                                    <>
                                        <Input
                                            defaultValue={openedGroup.name}
                                            autoFocus={true}
                                            moreClasses='grey-border group-info-input'
                                            onChange={(e) => setNewName(e.target.value)} />
                                        <Button 
                                            value = 'save' 
                                            onClick={() => handleUpdateGroup('name')}/>
                                    </>
                                ) : (
                                    <div 
                                        className="pencil" 
                                        onClick={() => openUpdateName(true)}>
                                            <img src="./../../img/utils/pencil.svg" alt="" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className='description-cont'>
                                <p className='text'>Description</p> &nbsp;&nbsp;
                                <div className="info-field">
                                    <p className='value'>{openedGroup.description}</p>
                                    {updateDesc ? (
                                    <>
                                        <Input
                                            defaultValue={openedGroup.description}
                                            autoFocus={true}
                                            moreClasses='grey-border group-info-input'
                                            onChange={(e) => setNewDesc(e.target.value)} />
                                        <Button 
                                            value = 'save' 
                                            onClick={() => handleUpdateGroup('description')}/>
                                    </>
                                    ) : (
                                        <div
                                            className="pencil" 
                                            onClick={() => openUpdateDesc(true)}>
                                                <img src="./../../img/utils/pencil.svg" alt="" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        {myData._id == openedGroup.groupAdmin ? (
                            <div className='controllers'>
                                <Button 
                                    moreClasses = 'btn-type2 delete-group'
                                    value = 'delete group' 
                                    onClick = {handleDeleteGroup}/>
                            </div>
                        ) : (
                            <Button
                                moreClasses='btn-type2 leave-group'
                                onClick={leaveGroup}
                                value='leave group'
                                />
                        )
                    }
                    </div>
                </div>
            </div>
            <div className="overlay"></div>
        </>
    )
}

export default GroupInfo;