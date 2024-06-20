import React, { useEffect } from 'react'
import './App.css'
import {Routes, Route, useLocation, useNavigate} from 'react-router-dom'
import SignUp from './AuthComponents/SignUp'
import LogIn from './AuthComponents/LogIn'
import Header from './AuthComponents/Header'
import { ChatPage } from './components/ChatPage'
import Footer from './AuthComponents/Footer'



function App() {
    const token = localStorage.getItem('token');
    const currPath = useLocation().pathname;
    const path = useNavigate();


    useEffect(() => {
        if(token)   path('/chat');
        else    path('/');
    }, [])


    return (
        <>
            {((currPath == '/') || (currPath == '/sign-up')) && <Header />}
            <Routes>
                <Route path='/' element={<LogIn />} />
                <Route path='/sign-up' element={<SignUp />} />
                <Route path='/chat' element={<ChatPage />}/>
            </Routes>
            {((currPath == '/') || (currPath == '/sign-up')) && <Footer />}
        </>
    )
}

export default App;