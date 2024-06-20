import React, { useState } from 'react'
import "./adduser.css"
import { db } from '../../../../lib/firebase'
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { useUserStore } from '../../../../lib/userStore'
function AddUser() {
  const [user, setuser] = useState(null)
  const{currentUser}=useUserStore()
  const handleSearch=async (e)=>{
    e.preventDefault()
    const formData=new FormData(e.target)
    const username=formData.get("username")
    try{
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapShot=await getDocs(q)
      if(!querySnapShot.empty){
          setuser(querySnapShot.docs[0].data())
      }else {
        setuser(null);
      }
      
    }
    catch(err){
      console.log(err)
    }
  }
  const handleAdd =async()=>{
    const chatRef=collection(db,"chats")
    const userChatsRef=collection(db,"userchats")
      try{
        const newChatRef=doc(chatRef)
          await setDoc(newChatRef,{
            createdAt:serverTimestamp(),
            messages:[],
          });
          await updateDoc(doc(userChatsRef,user.id),{
            chats:arrayUnion({
              chatId:newChatRef.id,
              lastMessage:"",
              receiverId:currentUser.id,
              updatedAt:Date.now(),
            })
          })
          await updateDoc(doc(userChatsRef,currentUser.id),{
            chats:arrayUnion({
              chatId:newChatRef.id,
              lastMessage:"",
              receiverId:user.id,
              updatedAt:Date.now(),
            })
          })
          
      }
      catch(err){
        console.log(err)
      }
  }
  return (
    <div className='adduser'>
      <form onSubmit={handleSearch}>
            <input type='text' placeholder='UserName' name="username"></input>
            <button>Search</button>
      </form>
      {user && <div className="user">
            <div className="detail">
                <img src={user.avatar || './avatar.png'}></img>
                <span>{user.username}</span>
            </div>
            <button onClick={handleAdd}>AddUser</button>
      </div>}
    </div>
  )
}

export default AddUser
