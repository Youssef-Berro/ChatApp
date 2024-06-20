import axios from 'axios'
import React, { useState } from 'react'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import Loading from '../utils/Loading'

function GroupParticipant(props) {
    const {participant, groupAdmin, nbOfParticipants} = props;
    const token = localStorage.getItem('token');
    const myData = JSON.parse(localStorage.getItem('myData'));
    const [loading, setLoading] = useState(false);



    const handleRemoveParticipant = async () => {
        if(nbOfParticipants == 3) {
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
            await axios.patch(`http://localhost:8000/api/groups/remove-participant/${props.groupId}`,{
                userId: participant._id}, {
                headers : {Authorization: `Bearer ${token}`}
            });


            props.removeParticipant(participant._id);
            setLoading(false);
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: `${participant.name} removed`,
                showConfirmButton: false,
                timer: 1000
            })
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
            {loading && <Loading/>}
            <div className='participant'>
                <div>
                    <div className="img">
                        <img 
                            src={`./../../img/users/${participant.photo}`} 
                            alt="img not found" />
                    </div>
                    {myData._id == participant._id && 
                        <p className="participant-name">you</p>}
                    {myData._id != participant._id && 
                        <p className="participant-name">{participant.name}</p>}
                </div>
                {(myData._id == groupAdmin) && (myData._id != participant._id) &&
                    <div 
                        className='close-comp participants-leave'
                        onClick={handleRemoveParticipant}>
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
                    </div>}
            </div>
        </>
    )
}

export default GroupParticipant;