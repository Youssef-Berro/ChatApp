import React from 'react';

function SingleUserInCreateGroupSearch(props) {
    const {user} = props;


    return (
        <div className='create-group-user' >
            <div className="img">
                <img src={`./../../img/users/${user.photo}`} alt="" />
            </div>
            <div className='middle-section'>
                <div className="chat-name">{user.name}</div>
                <div className="email">Email: {user.email}</div>
            </div>
            <button 
                className="add-btn" 
                onClick={() => props.addUserToGroup(user)}>add</button>
        </div>
    )
}

export default SingleUserInCreateGroupSearch;