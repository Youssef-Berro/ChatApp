import React, {useContext, useEffect, useState } from "react"
import './../css/SideBar.css'
import { SwitchPageContext } from "./ChatPage"
import UserInfo from "./../UserInfo/UserInfo"
import { useNavigate } from "react-router-dom"


function SideBar() {
    const path = useNavigate();
    const token = localStorage.getItem('token');
    const myData = JSON.parse(localStorage.getItem('myData')) || {};
    const {switchPage, setSwitchPage} = useContext(SwitchPageContext);
    const [userInfo, openUserInfo] = useState(false);

    useEffect(() => {
        if (!token || !myData)   path('/');
    }, [token, myData]);


    const togglePage = () => {
        setSwitchPage(!switchPage);
    }

    const openUserInfoFct = (bool) => { openUserInfo(bool) };

    return(
        <>
            {userInfo && <UserInfo openUserInfoFct = {openUserInfoFct} />}
            <div className="sidebar">
                <div className="top-section">
                    <button 
                        className={`chats ${(switchPage === true) ? 'active' : ''}`} 
                        onClick={togglePage}>
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                height="1em" 
                                viewBox="0 0 640 512">
                                    <title>chats</title>
                                    <path d="M88.2 309.1c9.8-18.3 6.8-40.8-7.5-55.8C59.4 
                                            230.9 48 204 48 176c0-63.5 63.8-128 160-128s160 
                                            64.5 160 128s-63.8 128-160 128c-13.1 
                                            0-25.8-1.3-37.8-3.6c-10.4-2-21.2-.6-30.7 
                                            4.2c-4.1 2.1-8.3 4.1-12.6 6c-16 7.2-32.9 13.5-49.9 
                                            18c2.8-4.6 5.4-9.1 7.9-13.6c1.1-1.9 2.2-3.9 
                                            3.2-5.9zM0 176c0 41.8 17.2 80.1 45.9 110.3c-.9 1.7-1.9 
                                            3.5-2.8 5.1c-10.3 18.4-22.3 36.5-36.6 52.1c-6.6 7-8.3 
                                            17.2-4.6 25.9C5.8 378.3 14.4 384 24 384c43 0 86.5-13.3 
                                            122.7-29.7c4.8-2.2 9.6-4.5 14.2-6.8c15.1 3 30.9 4.5 
                                            47.1 4.5c114.9 0 208-78.8 208-176S322.9 0 208 0S0 
                                            78.8 0 176zM432 480c16.2 0 31.9-1.6 47.1-4.5c4.6 2.3 
                                            9.4 4.6 14.2 6.8C529.5 498.7 573 512 616 512c9.6 0 18.2-5.7 
                                            22-14.5c3.8-8.8 
                                            2-19-4.6-25.9c-14.2-15.6-26.2-33.7-36.6-52.1c-.9-1.7-1.9-3.4-2.8-5.1C622.8 
                                            384.1 640 345.8 640 304c0-94.4-87.9-171.5-198.2-175.8c4.1 15.2 6.2 
                                            31.2 6.2 47.8l0 .6c87.2 6.7 144 67.5 144 127.4c0 28-11.4 54.9-32.7 
                                            77.2c-14.3 15-17.3 37.6-7.5 55.8c1.1 2 2.2 4 3.2 5.9c2.5 4.5 5.2 9 
                                            7.9 13.6c-17-4.5-33.9-10.7-49.9-18c-4.3-1.9-8.5-3.9-12.6-6c-9.5-4.8-20.3-6.2-30.7-4.2c-12.1 
                                            2.4-24.7 3.6-37.8 3.6c-61.7 0-110-26.5-136.8-62.3c-16 
                                            5.4-32.8 9.4-50 11.8C279 439.8 350 480 432 480z"/>
                            </svg>
                    </button>
                    <button 
                        className={`groups ${(switchPage === false) ? 'active' : ''}`} 
                        onClick={togglePage}>
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                height="1em" 
                                viewBox="0 0 640 512">
                                    <title>groups</title>
                                    <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 
                                        482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 
                                        448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 
                                        0 482.3zM609.3 512H471.4c5.4-9.4 8.6-20.3 
                                        8.6-32v-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2h61.4C567.8 320 
                                        640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 
                                        0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 
                                        384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 
                                        0 112 50.1 112 112s-50.1 112-112 112z"/>
                            </svg>
                    </button>
                </div>
                <div className="bottom-section">
                    <button 
                        className="profil-settings"
                        onClick={() => openUserInfo(true)}>
                        <img 
                            src={`./../../img/users/${myData.photo}`} 
                            alt="img not found" />
                    </button>
                </div>
            </div>
        </>
    )
}


export default SideBar;