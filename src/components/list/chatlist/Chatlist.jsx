import React, { useState } from 'react'
import "./chatlist.css"
import AddUser from './addUser/AddUser'
import { useUserStore } from '../../../lib/userStore'
import { useEffect } from 'react'
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from '../../../lib/firebase'
import { usechatStore } from '../../../lib/chatStore'
function Chatlist() {
const [addMode, setaddMode] = useState(false);
const [input, setinput] = useState("")
const [chats, setChats] = useState([]);
const {currentUser}=useUserStore();
const {chatId,changeChat}=usechatStore();
useEffect(() => {
  const unSub = onSnapshot(doc(db, "userchats", currentUser.id),async (res) => {
    if (!res.exists()) {
      setChats([]);
      return;
    }
    const items = res.data().chats;
      
      const promises=items.map(async(item)=>{
          const userdocRef=doc(db,"users",item.receiverId)
          const userdocSnap=await getDoc(userdocRef);
          const user=userdocSnap.data();
          return{...item,user}
      })
    
    const chatData=await Promise.all(promises);
    setChats(chatData.sort((a,b)=>b.updatedAt-a.updatedAt))
    
  });
  return ()=>{
    unSub();
  }
}, [currentUser.id])
const handleSelect=async(chat)=>{
  const userChats=chats.map((item)=>{
    const{user,...rest}=item;
    return rest;
  })
  const chatIndex=userChats.findIndex(item=>item.chatId===chat.chatId)
  userChats[chatIndex].isSeen=true;
  const userChatsRef=doc(db,"userchats",currentUser.id);
  try{
      await updateDoc(userChatsRef,{
        chats:userChats,
      })
      changeChat(chat.chatId,chat.user)
  }
  catch(err){
    console.log(err)
  }
  
}
const filteredChats = chats.filter((c) =>
  c.user.username.toLowerCase().includes(input.toLowerCase())
);
  return (
    <div className='chattlist'>
        
      <div className="search">
        
        <div className="searchbar">
            <img src="./search.png"></img>
            <input type='text' placeholder='Search' onChange={(e)=>setinput(e.target.value)}></input>
        </div>
        <img src={addMode? "./minus.png":"./plus.png"} className='addbtn' onClick={()=>setaddMode((prev)=>!prev)}></img>
      </div>
      
      {filteredChats.map((chat) => (
        <div
          className='item'
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{ backgroundColor: chat?.isSeen ? 'transparent' : 'blue' }}
        >
          <img
            src={chat.user.blocked.includes(currentUser.id) ? './avatar.png' : chat.user.avatar || './avatar.png'}
            alt='Avatar'
          />
          <div className='texts'>
            <span>{chat.user.blocked.includes(currentUser.id) ? 'Username' : chat.user.username || 'Unknown User'}</span>
            <p>{chat.lastMessage || 'No messages yet'}</p>
          </div>
        </div>
      ))}
      {/* {chats && Object.entries(chats).map(([chatId, chat]) => (
        <div className="item" key={chat.chatId} onClick={()=>handleSelect(chat)} style={{backgroundColor:chat?.isSeen ? "transparent":"blue"}}>
          <img src={chat.user.blocked.includes(currentUser.id)?"./avatar.png":chat.user.avatar || "./avatar.png"} alt="Avatar" />
          <div className="texts">
            <span>{chat.user.blocked.includes(currentUser.id)?"Username":chat.user.username || "Unknown User"}</span>
            <p>{chat.lastMessage || "No messages yet"}</p>
          </div>
        </div>
      ))} */}
      
      {/* {
        
        chats.map((chat)=>{
          <div className="item" key={chat.chatId}>
          <img src="./avatar.png" alt=" "></img>
          <div className="texts">
              <span>{chat.user.username}</span>
              <p>{chat.lastMessage}</p>
          </div>
          
        </div>
        })
      } */}
      {/* <div className="item" >
          <img src="./avatar.png" alt=" "></img>
          <div className="texts">
              <span>John</span>
              <p></p>
          </div>
          
        </div> */}
      
      {addMode && <AddUser/>}
    </div>
  )
}

export default Chatlist
