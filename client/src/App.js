import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import useEncrypt from './useEncrypt';

const API_URL = 'http://localhost:8000';

const Chat = () => {
  const { encrypt, decrypt, initialized } = useEncrypt();
  const [user, setUser] = useState('');
  const [roomName, setRoomName] = useState('Default Room Name');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isInRoom, setIsInRoom] = useState(false);

  useEffect(() => {
    if (!initialized) return;

    const newSocket = io(API_URL, {
      transports: ['websocket'],
    });
    setSocket(newSocket);

    return () => {
      socket.emit('disconnectUser');
      newSocket.disconnect();
    };
  }, [initialized]);

  useEffect(() => {
    if (!socket || !isInRoom) return;

    const handleMessage = (message) => {
      const decryptedText = message.text || decrypt(message.text)
      setMessages((prevMessages, index) => [
        ...prevMessages,
        { from: message.username, content: decryptedText },
      ]);
    };

    socket.on('message', handleMessage);

    return () => {
      socket.off('message', handleMessage);
    };
  }, [socket, decrypt, user, isInRoom, message]);

  const sendMessage = useCallback(() => {
    if (!initialized || !isInRoom) return;
    if (message.trim() && socket) {
      const encryptedMessage = encrypt(message);
      socket.emit('chat', encryptedMessage);
      setMessage('');
    }
  }, [message]);

  return (
    <div>
      {
        initialized ?
          (
            <>
              <input
                type="text"
                placeholder="Your Username"
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
              {isInRoom ?
                <button onClick={() => {
                  socket.emit('disconnectUser');
                  setIsInRoom(false);
                }}>Leave Room</button>
                :
                <input
                  type="text"
                  placeholder="Room Name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              }
              <input
                type="text"
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              {!isInRoom && (
                <button onClick={() => {
                  socket.emit('joinRoom', { username: user, roomname: roomName });
                  setIsInRoom(true);
                }}>Join Room</button>
              )
              }
              <button onClick={sendMessage}>Send</button>
              <div>
                {messages.map((msg, index) => (
                  <div key={index}>
                    <strong>{msg.from}:</strong> {msg.content}
                  </div>
                ))}
              </div>
            </>
          ) :
          (
            <div>Initializing...</div>
          )
      }
    </div>
  );
};

export default Chat;
