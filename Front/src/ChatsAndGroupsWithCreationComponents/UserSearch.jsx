import React from 'react'
import SingleUserSearch from './SingleUserSearch'
import Button from '../utils/Button'
import Input from '../utils/Input'


// we don't filter the data after search because sometimes the client need to search for
// a user instead of searching manually in curr chats (by scrolling)
function UserSearch(props) {

    return (
        <>
            <div className={`search-bar ${props.displaySearch ? 'active' : ''}`}>
                <div className="head">
                    <div className="title">Search</div>
                    <div className="close-comp" 
                        onClick={() => props.setDisplaySearchFct(false)}>
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

                <div className="search-wrapper">
                    <Input 
                        autoFocus={false}
                        placeholder = 'start a new chat'
                        onChange={(e) => props.setSearchInputFct(e.target.value)} />
                    <Button 
                        value = 'search' 
                        onClick={(props.handleSearch)}/>
                </div>
                <div className='search-user'>
                    {props.searchData.length !== 0 && 
                        props.searchData.map(user => <SingleUserSearch 
                                                    createChat = {props.createChat}
                                                    key = {user._id} 
                                                    user = {user} 
                                                />)}
                </div>
                {props.searchData.length === 0 &&
                    <div className='no-result'>no result :{`)`}</div>}
            </div>
            <div className='overlay'></div>
        </>
    )
}

export default UserSearch;