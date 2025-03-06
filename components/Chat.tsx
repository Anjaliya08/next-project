import { useState } from 'react';
import { useSocket } from '../hooks/useSocket';

interface ChatProps {
  userId: string;
}

export default function Chat({ userId }: ChatProps) {
  const { messages, sendMessage } = useSocket();
  const [content, setContent] = useState('');
  const [receiverId, setReceiverId] = useState('');

  const handleSend = async () => {
    if (!receiverId || !content.trim()) return;

    const messageData = { senderId: userId, receiverId, content };
    sendMessage(messageData);

    await fetch('/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
    });

    setContent('');
  };

  return (
    <div className="chat-container">
      <input
        type="text"
        placeholder="Receiver ID"
        value={receiverId}
        onChange={(e) => setReceiverId(e.target.value)}
      />
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.senderId === userId ? 'sent' : 'received'}>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type a message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
