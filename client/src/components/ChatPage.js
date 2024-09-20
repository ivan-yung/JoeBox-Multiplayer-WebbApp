import React, { useEffect, useState, useRef } from 'react';
import ChatBar from './ChatBar';
import ChatBody from './ChatBody';
import ChatFooter from './ChatFooter';
import GameDisplay from './gameHandlers/GameDisplay';
import supabase from '../supabaseClient';

import './styles/ChatPage.css';

const ChatPage = ({ socket }) => {
    const [messages, setMessages] = useState([]);
    const [typingStatus, setTypingStatus] = useState('');
    const lastMessageRef = useRef(null);
    const [newMessage, setNewMessage] = useState('');

    // Store the current user's name
    const currentUserName = localStorage.getItem('userName');
    const roomCode = localStorage.getItem('roomCode');

    useEffect(() => {
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('roomcode', roomCode);

            setMessages(data || []);
        };

        fetchMessages();

        const handleMessageResponse = (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        };

        const handleTypingResponse = (data) => {
            setTypingStatus(data);
        };

        socket.on('messageResponse', handleMessageResponse);
        socket.on('typingResponse', handleTypingResponse);

        // Cleanup listeners when component unmounts
        return () => {
            socket.off('messageResponse', handleMessageResponse);
            socket.off('typingResponse', handleTypingResponse);
        };
    }, [socket, roomCode]); // Reintroduce the `socket` dependency

    useEffect(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim() === '') return;

        socket.emit('message', {
            text: newMessage,
            name: currentUserName,
            roomCode: roomCode,
            socketID: socket.id,
        });

        setNewMessage('');
    };

    document.body.style.overflow = 'hidden';

    return (
        <>
        <div className="GameScreenMessages">
                <div className="">
                    <h1>Joe-Box</h1>
                </div>

            <div className = "window">
                    <ChatBar socket={socket} />
                    <div className = "gameDisp">
                        <GameDisplay socket={socket}/>
                    </div>
                    <div className="chat__main">
                        <ChatBody
                            socket={socket}
                            messages={messages}
                            typingStatus={typingStatus}
                            lastMessageRef={lastMessageRef}
                            currentUserName={currentUserName}
                        />
                        <div className = "sendTag">
                        <ChatFooter
                        socket={socket}
                        newMessage={newMessage}
                        setNewMessage={setNewMessage}
                        handleSendMessage={handleSendMessage}
                        />
                        </div>
                </div>
            </div>
        </div>
    </>
    );
};

export default ChatPage;
