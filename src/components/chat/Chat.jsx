import React, { useEffect, useRef, useState } from 'react';
import './chat.css';
import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { usechatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';
import { formatDistanceToNow } from 'date-fns';

function Chat() {
  const [chat, setChat] = useState();
  const [openEmoji, setOpenEmoji] = useState(false);
  const [text, setText] = useState("");
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = usechatStore();
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const { currentUser } = useUserStore();
  const endRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000 * 60); // Update every minute

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    if (!chatId) return;

    const unSub = onSnapshot(doc(db, 'chats', chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = (er) => {
    setText((prev) => prev + er.emoji);
    setOpenEmoji(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text === "") return;
    let imgUrl = null;
    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }
      await updateDoc(doc(db, 'chats', chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });
      const userIDs = [currentUser.id, user.id];
      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, 'userchats', id);
        const userChatsSnapshot = await getDoc(userChatsRef);
        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);
          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
          userChatsData.chats[chatIndex].updatedAt = Date.now();
          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (err) {
      console.log(err);
    }
    setImg({
      file: null,
      url: "",
    });
    setText("");
  };

  return (
    <div className="chatt">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || './avatar.png'} alt="Avatar" />
          <div className='texts'>
            
            {/* <span>{(user?.username)}</span> */}
            <span>{(user?.username && user.username.toUpperCase())}</span>
            <p>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="Phone" />
          <img src="./video.png" alt="Video" />
          <img src="./info.png" alt="Info" />
        </div>
      </div>
      <div className="center">
        {console.log(chat)}
        {chat?.messages?.map((message) => {
          let messageDate;
          if (message.createdAt && message.createdAt.toDate) {
            messageDate = message.createdAt.toDate();
          } else {
            messageDate = new Date(message.createdAt);
          }

          if (isNaN(messageDate)) {
            console.error("Invalid date", message.createdAt);
            return null;
          }

          return (
            <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={messageDate}>
              <div className="texts">
                {message.img && <img src={message.img} alt="" />}
                <p>{message.text}</p>
                <span>{formatDistanceToNow(messageDate)} ago</span>
              </div>
            </div>
          );
        })}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="Preview" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="Upload" />
          </label>
          <input type="file" id="file" style={{ display: "none" }} onChange={handleImg} />
          <label htmlFor="file">
            <img src="./camera.png" alt="Camera" id="file" />
          </label>
          <img src="./mic.png" alt="Mic" />
        </div>
        <input
          type="text"
          placeholder={isCurrentUserBlocked || isReceiverBlocked ? "Can't Send" : 'Type Here...'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img src="./emoji.png" alt="Emoji" onClick={() => setOpenEmoji((prev) => !prev)} />
          {openEmoji && (
            <div className="picker">
              <EmojiPicker onEmojiClick={handleEmoji} />
            </div>
          )}
        </div>
        <button className="sendbtn" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
