import { useState } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';

export function Chat() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const {
    messages,
    isConnected,
    currentRoom,
    createRoom,
    joinRoom,
    sendMessage,
  } = useWebSocket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  if (!username) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Enter your username</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (username.trim()) setUsername(username.trim());
            }}
          >
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder="Username"
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">
            Join or Create a Chat Room
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Create a new room</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (roomName.trim()) {
                    setIsCreating(true);
                    createRoom(roomName.trim(), username);
                  }
                }}
              >
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Room name"
                />
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Room'}
                </button>
              </form>
            </div>
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">
                Join an existing room
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (roomId.trim()) {
                    joinRoom(roomId.trim(), username);
                  }
                }}
              >
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Room code"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  Join Room
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="p-4 bg-white shadow">
        <h1 className="text-xl font-bold">{currentRoom.name}</h1>
        <p className="text-sm text-gray-600">Room Code: {currentRoom.id}</p>
        <p className="text-sm text-gray-600">
          Status: {isConnected ? 'Connected' : 'Disconnected'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div key={msg.id || index} className="mb-4">
            {msg.type === 'chat-message' && (
              <div className="bg-white p-3 rounded shadow">
                <p className="font-bold">{msg.sender}</p>
                <p>{msg.text}</p>
                <p className="text-xs text-gray-500">
                  {new Date(msg.timestamp || 0).toLocaleTimeString()}
                </p>
              </div>
            )}
            {msg.type === 'user-joined' && (
              <p className="text-sm text-gray-600">
                {msg.username} joined the chat
              </p>
            )}
            {msg.type === 'user-left' && (
              <p className="text-sm text-gray-600">
                {msg.username} left the chat
              </p>
            )}
            {msg.type === 'error' && (
              <p className="text-sm text-red-600">{msg.message}</p>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white shadow">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
