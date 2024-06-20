import React, { useState } from 'react'
import axios from 'axios'
import './../css/UserInfo.css'
import ChangePassword from './ChangePassword'
import Button from '../utils/Button'
import Input from '../utils/Input'
import {useNavigate} from 'react-router-dom'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'


function UserInfo(props) {
    const path = useNavigate();
    const token = localStorage.getItem('token');
    const myData = JSON.parse(localStorage.getItem('myData'));
    const [newName, setNewName] = useState(myData.name);
    const [newEmail, setNewEmail] = useState(myData.email)
    const [changePasswordMenu, openChangePasswordMenu] = useState(false);

    const openChangePasswordMenuFct = (bool) => { openChangePasswordMenu(bool) }

    const handleUpdateInfo = async (attrb) => {  

        // if no changes return better than do a request
        if(([attrb] == 'name') && (newName == myData.name) || 
            ([attrb] == 'email') && (newEmail == myData.email))
                    return;

        try {
            const newData = ([attrb] == 'name') ? newName : newEmail;
            await axios.patch('http://localhost:8000/api/users/update-user', {[attrb]: newData}, {
                headers : {Authorization : `Bearer ${token}`}
            })

            myData[attrb] = newData;
            localStorage.setItem('myData', JSON.stringify(myData));


            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Updated',
                showConfirmButton: false,
                timer: 1500
            })
            props.openUserInfoFct(false);
        }catch(err) {
            const msg = err.response.data.message;
            let errorMessage = '';

            if (msg.includes("user name must be less than"))
                errorMessage = 'Name must be less than 25 characters';
            else if (msg.includes('user name must be greater than'))
                errorMessage = 'User name must be greater than 4 characters';
            else if (msg.includes('email address is already in use') || msg.includes('email must be unique'))
                errorMessage = 'Email already used';
            else if (msg.includes('invalid email format')) 
                errorMessage = 'Please enter a valid email';


            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                customClass: {
                    confirmButton: 'custom-ok-button'
                }
            })
        }
    }

    const handleUpdateImage = async (e) => {
        const photo = e.target.files[0];
        const formData = new FormData();
        const photoName = `${Date.now()}_${photo.name}`
        formData.append('photo', photo, photoName);

        try {
            await axios.patch('http://localhost:8000/api/users/update-user', formData, {
                headers : {
                    'Content-Type': 'multipart/form-data',
                    Authorization : `Bearer ${token}`
                }
            })

            myData.photo = photoName;
            localStorage.setItem('myData', JSON.stringify(myData));

            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Updated',
                showConfirmButton: false,
                timer: 1500
            })
            props.openUserInfoFct(false);
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

    const handleLogOut = () => {
        Swal.fire({
            title: 'are you sure you need to log out?',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            customClass: {
                confirmButton: 'custom-confirm-button'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                openChangePasswordMenu(false);
                setNewName(false);
                localStorage.clear();
                path('/');
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Logged Out!',
                    showConfirmButton: false,
                    timer: 1500
                })
            }
        })
    }


    const handleDropPhoto = async () => {
        if(myData.photo === 'default.jpg') 
        {
            Swal.fire({
                position: 'center',
                icon: 'info',
                title: 'your accound already without profil',
                showConfirmButton: false,
                timer: 1500
            })
            return;
        }

        try {
            await axios.patch('http://localhost:8000/api/users/drop-photo', {}, {
                headers : {Authorization : `Bearer ${token}`}
            })

            myData.photo = 'default.jpg';
            localStorage.setItem('myData', JSON.stringify(myData));

            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Updated',
                showConfirmButton: false,
                timer: 1000
            })
            props.openUserInfoFct(false);
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


    return (
        <>
            {changePasswordMenu && <ChangePassword 
                                        openChangePasswordMenuFct={openChangePasswordMenuFct}/>}
            <div className="user-info">
                <div className="head">
                    <div className="title">User Info</div>
                    <div 
                        className = 'close-comp close-user-info' 
                        onClick = {() => props.openUserInfoFct(false)}>
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
                            <img src={`./../../img/users/${myData.photo}`} alt="img not found" />
                        </div>
                        <div className="photo-operations">
                            <form encType="multipart/form-data">
                                <label htmlFor="fileInput" className="change-photo">
                                    change photo
                                </label>
                                <input 
                                    id="fileInput"
                                    type="file"
                                    accept="image/jpeg, image/png"
                                    onChange={handleUpdateImage}
                                    className='change-photo' />
                            </form>
                            <div 
                                className="drop-photo"
                                onClick={handleDropPhoto}>
                                <svg
                                    className='drop-photo-icon'
                                    xmlns="http://www.w3.org/2000/svg"  
                                    viewBox="0 0 64 64">
                                        <title>drop photo</title>
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
                    <div className="info-right-section">
                        <div className="update-name">
                                <Input
                                    defaultValue={myData.name}
                                    autoFocus={false}
                                    moreClasses='grey-border'
                                    onChange={(e) => setNewName(e.target.value)} />
                            <Button 
                                value = 'change name' 
                                onClick={() => handleUpdateInfo('name')}/>
                        </div>
                        <div className="update-email">
                                <Input
                                    defaultValue={myData.email}
                                    autoFocus={false}
                                    moreClasses='grey-border'
                                    onChange={(e) => setNewEmail(e.target.value)} />
                            <Button 
                                value = 'change email'
                                onClick={() => handleUpdateInfo('email')}/>
                        </div>
                        <div className="auth">
                            <Button 
                                value = 'change password' 
                                onClick={() => openChangePasswordMenu(true)}/>
                            <Button 
                                value = 'log out'
                                onClick={handleLogOut}
                                moreClasses='btn-type2'/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="overlay"></div>
        </>
    )
}

export default UserInfo;