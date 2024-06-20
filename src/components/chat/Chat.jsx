import React, { useEffect, useRef, useState } from 'react'
import "./chat.css"
import EmojiPicker from 'emoji-picker-react'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { usechatStore } from '../../lib/chatStore'
import { useUserStore } from '../../lib/userStore'
import upload from '../../lib/upload'
function Chat() {
    const [chat, setChat] = useState()
    const [openemoji, setopenemoji] = useState(false)
    const [text, settext] = useState("")
    const {chatId,user,isCurrentUserBlocked,isReceiverBlocked}=usechatStore();
    const [img, setimg] = useState({
        file:null,
        url:"",
    })
    const {currentUser}=useUserStore();
    const endRef=useRef(null)
    useEffect(() => {
        endRef.current?.scrollIntoView({behavior:"smooth"})
    }, []);
    useEffect(() => {
        const unSub=onSnapshot(doc(db,"chats",chatId),(res)=>{
                setChat(res.data())

        })
        return()=>{
                unSub();
        }
    }, [chatId])
    console.log(chat)
    const handleEmoji=(er)=>{
        settext((prev)=>prev + er.emoji);
        setopenemoji(false)
    }
    const handleImg=(e)=>{
        if(e.target.files[0]){
            setimg({
                file:e.target.files[0],
                url:URL.createObjectURL(e.target.files[0])
            })
        }
        
    }
    const handleSend=async()=>{
        if(text==="") return;
        let imgUrl=null;
        try{
            if(img.file){
                imgUrl=await upload(img.file)
            }
                await updateDoc(doc(db,"chats",chatId),{
                    messages:arrayUnion({
                        senderId:currentUser.id,
                        text,
                        createdAt:new Date(),
                        ...(imgUrl && {img:imgUrl}),
                    })
                })
                const userIDs=[currentUser.id,user.id];
                userIDs.forEach(async(id)=>{
                const userChatsRef=doc(db,"userchats",id)
                const userChatsSnapshot=await getDoc(userChatsRef)
                if(userChatsSnapshot.exists()){
                    const userChatsData=userChatsSnapshot.data();
                    const chatIndex=userChatsData.chats.findIndex((c)=>c.chatId===chatId)
                    userChatsData.chats[chatIndex].lastMessage=text;
                    userChatsData.chats[chatIndex].isSeen=id===currentUser.id? true:false;
                    userChatsData.chats[chatIndex].updatedAt=Date.now()
                    await updateDoc(userChatsRef,{
                        chats:userChatsData.chats,
                    })
                }})
        }
        catch(err){
            console.log(err)
        }
        setimg({
            file:null,
            url:""
        })
        settext("");
        let now = new Date();
    }
  return (
    <div className='chatt'>
      <div className="top">
        <div className="user">
            <img src={user?.avatar || './avatar.png'} />
            <div className='texts'>
                <span>{user?.username}</span>
                <p>time</p>
            </div>
        </div>
        <div className="icons">
            <img src="./phone.png" alt="" />
            <img src="./video.png" alt="" />
            <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {console.log(chat)}
            { chat?.messages?.map((message)=>(
                    <div className={message.senderId===currentUser?.id ?"message own" :"message"} key={message?.createAt}>
                    <div className="texts">
                        {message.img && <img src={message.img} alt="" />}
                        <p>{message.text}</p>
                        <span>1 min ago</span>
                    </div>
                </div>
            ))
                
            }
            {img.url && (<div className="message own">
                <div className="texts">
                    <img src={img.url} alt="" />
                </div>
            </div>)}
            
           
            <div ref={endRef}></div>
      </div>
      
     
      <div className="bottom">
        <div className="icons">
            <label htmlFor="file">
            <img src="./img.png" alt="" />
            </label>
            
            <input type="file" id="file" style={{display:"none"}} onChange={handleImg}/>
            <img src="./camera.png" alt="" />
            <img src="./mic.png" alt="" />
        </div>
        <input type="text" placeholder={(isCurrentUserBlocked || isReceiverBlocked)?"Can't Send" :'Type Here...'} value={text} onChange={(e)=>settext(e.target.value)} disabled={isCurrentUserBlocked || isReceiverBlocked}/>
        <div className="emoji">
            <img src="./emoji.png" alt=""  onClick={()=>setopenemoji((prev)=>!prev)}/>
            <div className="picker">
            <EmojiPicker open={openemoji} onEmojiClick={handleEmoji}></EmojiPicker>
            </div>
            
        </div>
        <button className='sendbtn' onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>Send</button>
      </div>
    </div>
  )
}

export default Chat
