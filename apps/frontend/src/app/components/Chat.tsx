import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';

export function Chat() {
  const [username, setUsername] = useState('');
  const [pendingUsername, setPendingUsername] = useState('');
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  if (!username) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Enter your username
          </Typography>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (pendingUsername.trim()) setUsername(pendingUsername.trim());
            }}
          >
            <TextField
              fullWidth
              label="Username"
              value={pendingUsername}
              onChange={(e) => setPendingUsername(e.target.value)}
              margin="normal"
            />
            <Button fullWidth type="submit" variant="contained">
              Continue
            </Button>
          </form>
        </Paper>
      </Container>
    );
  }

  if (!currentRoom) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Join or Create a Chat Room
          </Typography>
          <Box mb={4}>
            <Typography variant="subtitle1">Create a new room</Typography>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (roomName.trim()) {
                  setIsCreating(true);
                  createRoom(roomName.trim(), username);
                }
              }}
            >
              <TextField
                fullWidth
                label="Room name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                margin="normal"
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Room'}
              </Button>
            </form>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1">Join an existing room</Typography>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (roomId.trim()) joinRoom(roomId.trim(), username);
            }}
          >
            <TextField
              fullWidth
              label="Room code"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              margin="normal"
            />
            <Button fullWidth type="submit" variant="contained" color="primary">
              Join Room
            </Button>
          </form>
        </Paper>
      </Container>
    );
  }

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            {currentRoom.name} (Room Code: {currentRoom.id}) -
            {isConnected ? ' Connected' : ' Disconnected'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box flex={1} overflow="auto" p={2}>
        <List>
          {messages.map((msg, index) => (
            <ListItem key={msg.id || index} alignItems="flex-start">
              {msg.type === 'chat-message' && (
                <ListItemText
                  primary={`${msg.sender}`}
                  secondary={
                    <>
                      <Typography variant="body2">{msg.text}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(msg.timestamp || 0).toLocaleTimeString()}
                      </Typography>
                    </>
                  }
                />
              )}
              {msg.type === 'user-joined' && (
                <ListItemText secondary={`${msg.username} joined the chat`} />
              )}
              {msg.type === 'user-left' && (
                <ListItemText secondary={`${msg.username} left the chat`} />
              )}
              {msg.type === 'error' && (
                <ListItemText
                  secondary={msg.message}
                  primaryTypographyProps={{ color: 'error' }}
                />
              )}
            </ListItem>
          ))}
        </List>
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        p={2}
        display="flex"
        gap={2}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary">
          Send
        </Button>
      </Box>
    </Box>
  );
}
