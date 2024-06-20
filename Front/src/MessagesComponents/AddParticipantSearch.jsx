import axios from 'axios'
import React, { useState } from 'react'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import './../css/Auth.css'
import Loading from '../utils/Loading'

function AddParticipantSearch(props) {
    const {user} = props;
    const token = localStorage.getItem('token');
    const [loading, setLoading] = useState(false);


    const handleAddParticipant = async () => {
        try{
            setLoading(true);

            await axios.patch(`http://localhost:8000/api/groups/add-participant/${props.groupId}`,{
                userId: user._id}, {
                headers : {Authorization: `Bearer ${token}`}
            })

            props.addParticipant(user);
            setLoading(false);
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: `${user.name} added`,
                showConfirmButton: false,
                timer: 1500
            })

            props.OpenAddParticipantFct(false);
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
            <div className='user create-group-user' >
                <div className="img">
                    <img 
                        src={`./../../img/users/${user.photo}`}
                        alt="img not found" />
                </div>
                <div className='middle-section'>
                    <div className="chat-name">{user.name}</div>
                    <div className="email">Email: {user.email}</div>
                </div>
                <button className="add-btn" onClick={handleAddParticipant}>add</button>
            </div>
        </>
    )
}

export default AddParticipantSearch;