import React, { useState } from "react"
import './../css/Auth.css'
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import AuthLoading from "../utils/AuthLoading"
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

function LogIn() {
    const path = useNavigate();
    const [passwordType, changePasswordType] = useState('password');
    const [displayLoading, setDisplayLoading] = useState(false);


    // used for eye icon click event
    const convertPasswordType = (event) => {
        event.preventDefault();
        changePasswordType((passwordType === 'password') ? 'text' : 'password');
    }

    const handleFormData = async (event) => {
        event.preventDefault();
        setDisplayLoading(true);
        const destructData = new FormData(event.target);
        const formData = Object.fromEntries(destructData.entries());

        try {
            const resp = await axios.post('http://localhost:8000/api/users/log-in', formData);
            const data = await resp.data;
            const userData = data.data;
            localStorage.setItem('token', data.token);
            localStorage.setItem('myData', JSON.stringify(userData));
            setDisplayLoading(false);

            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Login Successful',
                showConfirmButton: false,
                timer: 1500
            })

            path('/chat')
        }catch (err) {
            const status = err.response.status;
            if(status == 401) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'incorrect email or password',
                    customClass: {
                        confirmButton: 'custom-ok-button'
                    }
                })
            }

            setDisplayLoading(false);
        }
    }

    return (
        <>
            <div className="log-in-container">
                <div className="card log-in-card">
                    <div className="card-header log-in-header">
                        <div className="text-header">Log In</div>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleFormData}>
                            <div className="log-in-field">
                                <label htmlFor="email">Email:</label>
                                <input 
                                    required 
                                    name="email" 
                                    id="email" 
                                    type="email" />
                            </div>
                            <div className="password-field log-in-field">
                                <label htmlFor="password">Password:</label>
                                <input 
                                    required
                                    name="password" 
                                    id="password" 
                                    type={passwordType} />
                                <button 
                                    className="svg-btn"  
                                    onClick={convertPasswordType}>
                                    <svg 
                                        viewBox="0 0 576 512" 
                                        className="eye-svg" 
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M288 32c-80.8 0-145.5 36.8-192.6 
                                                80.6C48.6 156 17.3 208 2.5 243.7c
                                                -3.3 7.9-3.3 16.7 0 24.6C17.3 304 
                                                48.6 356 95.4 399.4C142.5 443.2 
                                                207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5
                                                78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 
                                                0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 
                                                68.8 368.8 32 288 32zM144 256a144 144 0 1 1 
                                                288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 
                                                64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 
                                                1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7
                                                51.2 66.4 81.6 117.6 67.9s81.6-66.4 
                                                67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 
                                                6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z">
                                        </path>
                                    </svg>
                                </button>
                            </div>
                            {displayLoading ? (
                                <div className="submit-parent">
                                    <AuthLoading />
                                </div>
                            ) : (
                                <div className="submit-parent log-in-submit">
                                    <input 
                                        type="submit" 
                                        className="submit-btn" 
                                        value='submit'/>
                                </div>)}
                        </form>
                        <div className="second-auth go-to-sign-up">
                            <p>Don&apos;t have an account ?&nbsp;&nbsp;</p>
                            <Link to='/sign-up'>Sign up</Link>
                        </div>
                    </div>
                </div>
                <div className="info2">
                    <img src="./../../img/utils/background1.jpg" alt="" />
                </div>
            </div>
        </>
    )
}


export default LogIn;