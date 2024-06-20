import { useEffect } from "react"
import Chat from "./components/chat/Chat"
import Detail from "./components/detail/Detail"
import List from "./components/list/List"
import Login from "./components/login/Login"
import Notification from "./components/notification/Notification"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./lib/firebase"
import { useUserStore } from "./lib/userStore"
import { usechatStore } from "./lib/chatStore"

const App = () => {
  const {currentUser,isLoading,fetchUserInfo}=useUserStore()
  const {chatId}=usechatStore();
  useEffect(() => {
      const unSub=onAuthStateChanged(auth,(user)=>{
        fetchUserInfo(user?.uid);
      })
      return ()=>{
        unSub();
      };
  }, [fetchUserInfo])
  if (isLoading) return <div className="loading"> 
  <img src="./logo2e.png" className="loadinganim"></img>
  
  </div>
  return (
    <div className='container'>
      
      {
        currentUser ? (<><List>
          </List>
          {chatId && <Chat>
            </Chat>}
          {chatId && <Detail>
            </Detail>}
          </>):(<Login></Login>)
      }
      <Notification></Notification>
    </div>
  )
}

export default App