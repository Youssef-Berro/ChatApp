import React, { useState, useEffect } from 'react'
import AddParticipantSearch from './AddParticipantSearch'
import axios from 'axios'
import Button from '../utils/Button'
import Input from '../utils/Input'

function AddParticipant(props) {
    const token = localStorage.getItem('token');
    const [searchData, setSearchData] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [filterNow, setFilterNow] = useState(false);


    const handleSearch = async () => {
        if(searchInput == '') {
            setSearchData([]);
            return;
        }

        try{
            const resp = await axios.get(`http://localhost:8000/api/users/search?searchStr=${searchInput}`, {
                headers : {Authorization: `Bearer ${token}`}
            })

            const data = await resp.data;
            setSearchData(data);
            setFilterNow(true);
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

    useEffect(() => {
        if(filterNow) {
            const prevUsersId = props.openedGroupParticipants.map( prevUser => prevUser._id);
            const updatedSearchData = searchData.filter( user => !prevUsersId.includes(user._id));
            setSearchData([...updatedSearchData]);
            setFilterNow(false);
        }
    }, [filterNow])


    return (
        <>
            <div className="add-participant-menu">
                <div className="head">  
                    <p>Add Participant</p>
                    <div 
                        className="close-comp" 
                        onClick={() => props.OpenAddParticipantFct(false)}
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

                <div className = "search-wrapper">
                    <Input 
                        autoFocus={false}
                        placeholder = 'search for users'
                        onChange={(e) => {setSearchInput(e.target.value)}} />
                    <Button 
                            value = 'search' 
                            onClick = {handleSearch}/>
                </div>

                <div className='search-result'>
                {searchData.length !== 0 && 
                    searchData.map(user => <AddParticipantSearch 
                                                addParticipant = {props.addParticipant}
                                                key = {user._id}
                                                groupId = {props.groupId}
                                                user = {user} 
                                                OpenAddParticipantFct={props.OpenAddParticipantFct}
                                            />)}
                </div>

                {searchData.length === 0 &&
                    <div className='no-result'>no result :{`)`}</div>}
            </div>
            <div className = "overlay"></div>
        </>
    )
}

export default AddParticipant;