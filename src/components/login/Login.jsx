import React, { useState } from 'react'
import "./login.css"
import { toast } from 'react-toastify'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../lib/firebase'
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore"; 
import upload from '../../lib/upload'
function Login() {
    const [avatar, setavatar] = useState({
        file:null,
        url:""
    })
    const [loading, setloading] = useState(false)
    const handleAvatar=e=>{
        if(e.target.files[0]){
            setavatar({
                file:e.target.files[0],
                url:URL.createObjectURL(e.target.files[0])
            })
        }
        
    }
    const handlelogin=async(e)=>{
        e.preventDefault()
        setloading(true)
        const formData=new FormData(e.target)
        const {email,password}=Object.fromEntries(formData);
        
        try{
            const res =await signInWithEmailAndPassword(auth,email,password)
            toast.success("Sign in Success")
        }
        catch(err){
                toast.error(err.message)
        }
        finally{
            setloading(false)
        }
    }
    const handleRegister=async(e)=>{
        e.preventDefault()
        setloading(true)
        const formData=new FormData(e.target)
        const {username,email,password,bio}=Object.fromEntries(formData);
        if(!username || !email || !password || !bio){
            setloading(false)
            return toast.warn("Plese Enter the details");
        } 
        if(!avatar.file){
            setloading(false)
            return toast.warn("Please upload an avatar!");
        } 
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
        return toast.warn("UserName Already Exists Select Another Username");
        }
        
        
        try{
            const imgUrl=await upload(avatar.file)
            const res=await createUserWithEmailAndPassword(auth,email,password)
            await setDoc(doc(db, "users", res.user.uid), {
            username: username,
            email,
            bio,
            avatar:imgUrl,
            id:res.user.uid,
            
            blocked:[],
            });
            await setDoc(doc(db, "userchats", res.user.uid), {
                chats:[],
                });
            toast.success("Account Created!! U can Login Now")
        }
        catch(err){
            console.log(err.message)
            toast.error(err.message)
        }
        finally{
            setloading(false)
        }
    }
  return (
    <div className='login'>
      <div className='items' >
        <h2>Welcome Back</h2>
        <form onSubmit={handlelogin}>
            <input type='email' placeholder='Email' name="email" required></input>
            <input type="password" name="password" placeholder='Password' required />
            <button disabled={loading}>{loading ? "Loading":"SignIn"}</button>
        </form>
      </div>
      <div className='separator'></div>
      <div className='items'>
        <h2>Create an Account</h2>
        <form onSubmit={handleRegister}>
        <label htmlFor="file">
            <img src={avatar.url || "./avatar.png"} alt="" />
             Upload A ProfilePic  </label>
        <input type='file' id="file" style={{display:"none"} } onChange={handleAvatar}/>
        <input type="text" name="username"  placeholder='Username'/>
        
        <input type='email' placeholder='Email' name="email"></input>
        <input type="password" name="password"  placeholder='Password' />
        <input type="text" name="bio"  placeholder='Tell Us Ur Bio'/>
        <button disabled={loading}>{loading ? "Loading":"SignUp"}</button>
        </form>
      </div>
        
    </div>
  )
}

export default Login
