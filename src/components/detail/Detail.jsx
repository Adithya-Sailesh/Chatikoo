import React from 'react'
import "./detail.css"
import { auth, db } from '../../lib/firebase'
import { usechatStore } from '../../lib/chatStore'
import { useUserStore } from '../../lib/userStore';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';
function Detail() {
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
  return (
    <div className='detaill'>
      <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <h2>{user?.username}</h2>
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Temporibus, quidem.</p>
      </div>
      <div className="info">
          <div className="option">
            <div className="title">
              <span>
                Chat Setting
              </span>
              <img src="./arrowUp.png" alt="" />
            </div>
          </div>
          {/* ---------------------------------- */}
          <div className="option">
            <div className="title">
              <span>
                Privacy
              </span>
              <img src="./arrowUp.png" alt="" />
            </div>
          </div>
          {/* ---------------------------------- */}
          <div className="option">
            <div className="title">
              <span>
              Shared Photos
              </span>
              <img src="./arrowDown.png" alt="" />
            </div>
            <div className="photos">
              <div className="photoitem">
                <div className="photodetail">
                <img src="https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                <span>PhtotoName</span>
              </div>
              <img src='./download.png'></img>
              </div>
{/* ---------------------- */}
              <div className="photoitem">
                <div className="photodetail">
                <img src="https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                <span>PhtotoName</span>
              </div>
              <img src='./download.png'></img>
              </div>
{/* ---------------------- */}
              <div className="photoitem">
                <div className="photodetail">
                <img src="https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                <span>PhtotoName</span>
              </div>
              <img src='./download.png'></img>
              </div>

              {/* ---------------------- */}
            </div>
          </div>
          {/* ---------------------------------- */}
          <div className="option">
            <div className="title">
              <span>
                 Contacr Us
              </span>
              <img src="./arrowDown.png" alt="" />
            </div>
          </div>
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
