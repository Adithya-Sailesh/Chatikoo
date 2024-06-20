import React, { useState } from 'react'
import "./detail.css"
import { auth, db } from '../../lib/firebase'
import { usechatStore } from '../../lib/chatStore'
import { useUserStore } from '../../lib/userStore';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';
function Detail() {
  const [contact, setcontact] = useState(false)
  const [feat, setfeat] = useState(false)
  const {chatId,user,isCurrentUserBlocked,isReceiverBlocked,changeBlock}=usechatStore();
  const{currentUser}=useUserStore();
  const handleBlock=async()=>{
      if(!user) return;
      const userDocRef=doc(db,"users",currentUser.id)
      try{
        await updateDoc(userDocRef,{
          blocked:isReceiverBlocked ? arrayRemove(user.id):arrayUnion(user.id),
        })
        changeBlock();
      }
      catch(err){
        console.log(err)
      }
  }
  const handleContact=()=>{
    setcontact((e)=>!e)
  }
  const handleFeat=()=>{
    setfeat((e)=>!e)
  }
  return (
    <div className='detaill'>
      <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <h2>{user?.username}</h2>
          <p>{user?.bio || "Your Bio Goes Here"}</p>
      </div>
      <div className="info">
          <div className="option" onClick={handleFeat}>
            <div className="title">
              <span>
                Chat Setting
              </span>
              <img src={feat? "./arrowUp.png":"./arrowDown.png"} alt="" />
            </div>
          </div>
          {/* ---------------------------------- */}
          <div className="option" onClick={handleFeat}>
            <div className="title">
              <span>
                Privacy
              </span>
              <img src={feat? "./arrowUp.png":"./arrowDown.png"} alt="" />
            </div>
          </div>
          {/* ---------------------------------- */}
          <div className="option" onClick={handleFeat}>
            <div className="title">
              <span>
              Shared Photos
              </span>
              <img src={feat? "./arrowUp.png":"./arrowDown.png"} alt="" />
            </div>
            
            <div className="photos">
                <div style={{fontSize:20}}>{feat && 'Comming Soon!!!'}</div>
            </div>
          </div>
          {/* ---------------------------------- */}
          <div className="option">
            <div className="title" onClick={handleContact}>
              <span>
                 Contact Us
              </span>
              <img src={contact? "./arrowUp.png":"./arrowDown.png"} alt="" />
            </div>
          </div>
          <div className="cont">{contact && 'Plese Message At chatikoo@gmail.com'}</div>
          {/* ---------------------------------- */}
          <button onClick={handleBlock}>
            {isCurrentUserBlocked ?"You are Blocked" : isReceiverBlocked ? "Unblock" :"BlockUser"}
          </button>
          <button className="logout" onClick={()=>auth.signOut()}>Logout</button>
      </div>
    </div>
  )
}

export default Detail
