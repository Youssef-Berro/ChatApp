import React, { useEffect, useState } from 'react'
import Button from '../utils/Button'
import Input from '../utils/Input'
import axios from 'axios'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'


function ChangePassword(props) {
    const token = localStorage.getItem('token');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');



    const handleChangePass = async () => {
        if(oldPassword == '' || newPassword == '' || newPasswordConfirm == '') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'the three inputs must be filled',
                customClass: {
                    confirmButton: 'custom-ok-button'
                }
            })
            return;
        }


        try {
            await axios.patch('http://localhost:8000/api/users/change-password', 
            {oldPassword : oldPassword, newPassword: newPassword, passwordConfirm: newPasswordConfirm},
            {headers : {Authorization : `Bearer ${token}`}})

            props.openChangePasswordMenuFct(false);
        }catch(err) {
            const msg = err.response.data.message;
            let errorMessage = '';

            if(msg == 'incorrect old password')
                errorMessage = 'wrong old password';
            else if(msg.includes('new pass diff than pass confirm'))
                errorMessage = 'new password and password confirm must be the same';
            else if(msg.includes('password must be greater than 8 characters'))
                errorMessage = 'password must be greater than 8 characters';


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

    return (
        <>
            <div className="change-password-menu">
                <div className="head">  
                    <p className='title'>change password</p>
                    <div 
                        className="close-comp" 
                        onClick={() => props.openChangePasswordMenuFct(false)}
                        >
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
                <div className="body">
                    <div className="search-wrapper">
                        <Input 
                            autoFocus={false}
                            placeholder = 'old password'
                            onChange={(e) => setOldPassword(e.target.value)} />
                    </div>
                    <div className="search-wrapper">
                        <Input 
                            autoFocus={false}
                            type='password'
                            placeholder = 'new password'
                            onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                    <div className="search-wrapper">
                        <Input 
                            autoFocus={false}
                            type='password'
                            placeholder = 'password confirm'
                            onChange={(e) => setNewPasswordConfirm(e.target.value)} />
                    </div>
                    <Button
                        moreClasses='sumit-pass-btn'
                        value = 'submit change' 
                        onClick={handleChangePass} />
                </div>
            </div>
            <div className="overlay"></div>
        </>
    )
}

export default ChangePassword;

