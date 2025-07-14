import React, { useEffect, useState, useRef} from 'react'
import { ZIM } from 'zego-zim-web';
import bg from "./assets/bg.jpeg";


function App(){

const [ZimInstance,setZimInstance] = useState(null)
const [userInfo,setUserInfo] = useState(null)
const [messageText,setMessageText] = useState("")
const [messages,setMessages] = useState([])
const [selectedUser,setSelectedUser] = useState("Ayush")
const [isLoggedIn,SetIsLoggedIn] = useState(false)
const appId = 1617328372

const tokenA = "04AAAAAGh0YuUADB1w/0eS0xY5Evi3YgCvJTPA2Vpa2VbRgE2iPlHP4fzfasgydZWJda8v6QOUK82flyeaa1pFPvnozlZalKROre7h9LsDrX4T+4gnirH302HuqicSz0+/Rscnt/tWAoCajsdxc1It3DkYILu17RxSmDKcjLg7htHSHZFLZrzYrx5KiND4KGstOmxLewY92wWU8HW+Ee5d2r4U+7Vy0ybXUYXwCShj+1VHl22arTolJaZty9QFWtet5nKQcIG1ZAE="
const tokenB = "04AAAAAGh0YwsADLbOBc4q59MENTbtcQCxDmFpHt7LDCyTYxo0MIVjFpPTXYGoQJZIVGHG+U7Jm026dB/A4dZhcTzK4iE/dXwEVxjlqPLUduAIW53SuNs9L4nyHhWrbzgitOOsTvG1RmzC37s8hKC+Y62saFhQxl1vOZKA6uUYNIyIxJlpjDFij7HZACc8YHImRdH9zjNGmUfIUeATPjir759EE9IKvYkM7VthC2B5xTuZ+mpAHiT2OII4o+fzcukVh+hrM892mcIWAQ=="

const messageEndRef = useRef(null)

useEffect(()=>{
  const instance = ZIM.create(appId)
  setZimInstance(instance)

  instance.on('error', function (zim, errorInfo) {
    console.log('error', errorInfo.code, errorInfo.message);
});

instance.on('connectionStateChanged', function (zim, { state, event}) {
  console.log('connectionStateChanged', state, event);
});

instance.on('peerMessageReceived', function (zim, { messageList }) {
    setMessages(prev=>[...prev,...messageList])
});

instance.on('tokenWillExpire', function (zim, { second }) {
    console.log('tokenWillExpire', second);
    // You can call the renewToken method to renew the token. 
    // To generate a new Token, refer to the Prerequisites.
    zim.renewToken(selectedUser==="Ayush" ? tokenA : tokenB)
        .then(function(){
            console.log("token-renewed")
        })
        .catch(function(err){
            console.log(err)
        })
});

return ()=>{
  instance.destroy()
}

},[])

useEffect(()=>{
  if(messageEndRef.current){
    messageEndRef.current.scrollIntoView({behavior:'smooth'})
  }
},[messages])

const handleLogin=()=>{
  const info = {userID: selectedUser, userName: selectedUser==="Ayush" ? "Ayush" : "Ankush"};
  setUserInfo(info)
  const loginToken = selectedUser==="Ayush" ? tokenA : tokenB

  if(ZimInstance) {
    ZimInstance.login(info, loginToken)
    .then(function () {
      SetIsLoggedIn(true)
        console.log("logged in")
    })
    .catch(function (err) {
        console.log("logged in failed")
    });
  }
  else{
    console.log("zim instance not created")
  }
}

const handleSendMessage=()=>{
  if(!isLoggedIn) return

  const toConversationID = selectedUser==="Ayush" ? "Ankush" : "Ayush"; // Peer user's ID.
  const conversationType = 0; // Message type; One-to-one chat: 0, in-room chat: 1, group chat:2 
  const config = { 
    priority: 1, // Set priority for the message. 1: Low (by default). 2: Medium. 3: High.
  };

  var messageTextObj = { type: 1, message: messageText,extendedData:'' };

  ZimInstance.sendMessage(messageTextObj, toConversationID, conversationType, config)
    .then(function ({ message }) {
        // Message sent successfully.
        setMessages(prev=>[...prev,message])
    })
    .catch(function (err) {
        // Failed to send a message.
        console.log(err)
    });
    setMessageText("")

}

const formatTime = (timeStamp)=>{
  const date = new Date(timeStamp);
  return date.toLocaleTimeString([],{
    hour: '2-digit',minute:'2-digit'
  })
}




  return (
    <div className='w-full h-screen bg-cover bg-center flex items-center flex-col' style={{
      backgroundImage: `url(${bg})`,
      
    }}>
      <h1 className='text-white font-bold text-[30px]'>Real Time Chat App</h1>

      {!isLoggedIn ? (
        <div className='w-[90%] max-w-[600px] h-[400px] overflow-auto p-[20px] background-blur shadow-2xl bg-[Black] mt-[30px] rounded-x1 flex flex-col
        items-center justify-center gap-[30px] border-2 border-gray-700'>

          <h1 className='text-[30px] font-semibold text-white '>Select User</h1>
          <select className='px-[50px] rounded-x1 py-[5px] bg-[#1f2525] text-white flex justify-start ' onChange={(e)=>setSelectedUser(e.target.value)}
           value={selectedUser}>
            <option value="Ayush">Ayush</option>
            <option value="Ankush">Ankush</option>

          </select>
          <button className='p-[10px] bg-white font-semibold cursor-pointer text-black rounded-lg w-[100px]' onClick={handleLogin}>Login</button>

        </div>
      ):(
      <div className='w-[90%] max-w-[800px] h-[600px] overflow-auto p-[20px] background-blur shadow-2xl bg-[Black] mt-[30px] rounded-x1 flex flex-col
        items-center justify-center gap-[30px] border-2 border-gray-700'>

          <h2 className='text-white text-[20px] '>{userInfo.userName} <span className='text-gray-400'>chatting with</span> {selectedUser==="Ayush"? "Ankush" : "Ayush"}</h2>
          <div className='w-full h-[1px] bg-gray-800'></div>
          <div className='rounded-2xl w-full p-[20px] flex flex-col gap-[10px] items-center h-[400px] overflow-auto pb-[120px]'>


            {messages.map((msg,i)=>{
              const isOwnMessage  = msg.senderUserId==userInfo.userID
              return <div key={i} className={'w-full flex ${isOwnMessage? "justify-end" : "justify-start"}'}>

                <div className={'px-[20px] py-[10px] shadow-lg ${isOwnMessage? "bg-[#of1010] rounded-br-0 rounded-t-2xl rounded-bl-2xl": "bg-[#1c2124] rounded-bl-0 rounded-t-2xl rounded-br-2xl"} text-white '}>

                  <div>
                    {msg.message}
                  </div>

                  <div>
                    {formatTime(msg.timestamp)}
                  </div>

                </div>

              </div>
            })}
            <div ref={messageEndRef}/>

            <div className='flex items-center justify-center gap-[20px] w-full h-[100px]fixed bottom-0 px-[20px]'>

              <input type="text"  placeholder='message' className='rounded-2xl bg-gray-700
              outline-none text-white px-[20px] py-[10px] placeholder-white w-full' onChange={(e)=>setMessageText(e.target.value)} value={messageText}/>

              <button className='p-[10px] bg-white text-black rounded-2xl w-[100px] font-semibold ' onClick={handleSendMessage}>Send</button>

            </div>
          </div>
      </div>)}
    </div>
  )
}

export default App