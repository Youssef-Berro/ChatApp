import React from 'react'

function SingleUserSearch(props) {
    const {user} = props;


    return (
        <div className='user' onClick={() => props.createChat(user)}>
            <div className="img">
                <img src={`./../../img/users/${user.photo}`} alt="" />
            </div>
            <div className='right-section'>
                <div className="chat-name">{user.name}</div>
                <div className="latest-message">Email: {user.email}</div>
            </div>
        </div>
    )
}

export default SingleUserSearch;