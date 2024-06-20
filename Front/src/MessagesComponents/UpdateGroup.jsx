import React from 'react'
import Button from '../utils/Button'
import Input from '../utils/Input'


// used for update name and update desc
function UpdateGroup(props) {
    const attrb = (props.placeholder.includes('name') ? 'name' : 'description');

    return (
        <>
            <div className="update-menu">
                <div className="head">  
                    <p>{props.title}</p>
                    <div 
                        className="close-comp" 
                        onClick={() => props.openUpdateFct(false)}>
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
                            autoFocus={true}
                            placeholder = {props.placeholder}
                            onChange={(e) => props.setNewDataFct(e.target.value)} />
                    </div>
                    <Button 
                            value = 'apply' 
                            onClick = {() => props.handleUpdateGroup(attrb)}/>
                </div>
            </div>
            <div className="overlay"></div>
        </>
    )
}

export default UpdateGroup;