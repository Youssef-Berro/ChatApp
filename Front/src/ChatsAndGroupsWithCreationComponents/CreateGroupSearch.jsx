import React from 'react'
import AddedUserToCreateGroup from './AddedUserToCreateGroup'
import SingleUserInCreateGroupSearch from './SingleUserInCreateGroupSearch'
import Button from '../utils/Button'
import Input from '../utils/Input'

function CreateGroupSearch(props) {

    return (
        <>
            <div className = {`search-bar ${props.displayCreateGroup ? 'active' : ''}`}>
                <div className = "create-group-head">
                        <div className = "title">Create Group</div>
                        <div
                            className = "close-comp"
                            onClick = {() => props.setDisplayCreateGroupFct(false)}>
                                <svg 
                                    xmlns = "http://www.w3.org/2000/svg" 
                                    height = "1em" 
                                    viewBox = "0 0 384 512">
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
                <div className="section2">
                    <Input 
                        autoFocus={false}
                        placeholder = 'group name'
                        onChange={(e) => props.setGroupNameFct(e.target.value)} />
                    <Button 
                        value = 'create' 
                        onClick = {props.createGroup}/>
                </div>
                <Input 
                        autoFocus={false}
                        placeholder = 'search for users to add'
                        onChange={(e) => props.setSearchInputFct(e.target.value)} />
                <Button 
                    value = 'search' 
                    onClick={props.handleSearch}/>

                <div className="search-result-container">
                    {props.addedUserToCreateGroup.length !== 0 &&
                        <div className="added-users">
                            {props.addedUserToCreateGroup.map(user => <AddedUserToCreateGroup 
                                                    removeUserFromGroup = {props.removeUserFromGroup}
                                                    key = {user._id} 
                                                    user = {user} />)}
                        </div>}

                    {props.groupSearchData.length !== 0  && 
                        <div className = 'search-user-for-create-group'>
                            {props.groupSearchData.map(user => <SingleUserInCreateGroupSearch
                                                                addUserToGroup = {props.addUserToGroup}
                                                                key = {user._id} 
                                                                user = {user} />)}
                        </div>}
                </div>

                {props.groupSearchData.length === 0 && props.addedUserToCreateGroup.length === 0 &&
                    <div className = 'no-result'>no result :{`)`}</div>}
            </div>
            <div className = 'overlay'></div>
        </>
    )
}

export default CreateGroupSearch;