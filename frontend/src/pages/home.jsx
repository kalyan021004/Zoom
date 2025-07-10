import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { Button, IconButton, TextField, Typography, Box, Paper, Divider, Alert } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState('');
  const [createdCode, setCreatedCode] = useState('');
  const [showCreatedCode, setShowCreatedCode] = useState(false);
  const { addToUserHistory } = useContext(AuthContext);

  // Generate a random meeting code
  const generateMeetingCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateMeeting = async () => {
    const newMeetingCode = generateMeetingCode();
    setCreatedCode(newMeetingCode);
    setShowCreatedCode(true);
    await addToUserHistory(newMeetingCode);
  };

  const handleJoinCreatedMeeting = () => {
    navigate(`/${createdCode}`);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(createdCode);
    // You could add a toast notification here
  };

  const handleJoinVideoCall = async () => {
    if (!meetingCode.trim()) return;
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  return (
    <>
      <Box
        className="navBar"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={4}
        py={2}
        boxShadow={2}
        bgcolor="#ffffff"
      >
        <Button onClick={() => {
              navigate('/');
            }}>

        <Typography variant="h5" fontWeight="bold" color="primary">
          FriendsMeet 🎥
        </Typography>
        </Button>

        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/history')} color="primary">
            <RestoreIcon />
          </IconButton>
          <Typography variant="body1">History</Typography>

          <Button
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/auth');
            }}
            startIcon={<ExitToAppIcon />}
            variant="outlined"
            color="error"
          >
            Logout
          </Button>
        </Box>
      </Box>

      <Box className="meetContainer" display="flex" justifyContent="center" alignItems="center" minHeight="80vh" p={4}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 900, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Box flex={1}>
            <Typography variant="h4" gutterBottom>
              Meet your Friends, Anytime. Anywhere.
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Create a new meeting or join an existing one. High-quality video calls in seconds!
            </Typography>

            {/* Create Meeting Section */}
            <Box mt={3} mb={2}>
              <Typography variant="h6" gutterBottom color="primary">
                Start a new meeting
              </Typography>
              
              {!showCreatedCode ? (
                <Button 
                  onClick={handleCreateMeeting}
                  variant="contained" 
                  color="primary"
                  size="large"
                  startIcon={<VideoCallIcon />}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Create Meeting
                </Button>
              ) : (
                <Box>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      Meeting created! Share this code with your friends:
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {createdCode}
                      </Typography>
                      <IconButton 
                        onClick={handleCopyCode}
                        size="small"
                        color="primary"
                        title="Copy code"
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </Box>
                  </Alert>
                  
                  <Box display="flex" gap={2}>
                    <Button 
                      onClick={handleJoinCreatedMeeting}
                      variant="contained" 
                      color="primary"
                      size="large"
                      startIcon={<MeetingRoomIcon />}
                      fullWidth
                    >
                      Join Meeting
                    </Button>
                    <Button 
                      onClick={() => setShowCreatedCode(false)}
                      variant="outlined" 
                      color="secondary"
                      size="large"
                    >
                      Create New
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            {/* Join Meeting Section */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Join with a code
              </Typography>
              <Box display="flex" gap={2}>
                <TextField
                  value={meetingCode}
                  onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
                  label="Meeting Code"
                  variant="outlined"
                  placeholder="Enter meeting code"
                  fullWidth
                  inputProps={{ maxLength: 12 }}
                />
                <Button 
                  onClick={handleJoinVideoCall} 
                  variant="outlined" 
                  color="primary"
                  disabled={!meetingCode.trim()}
                  startIcon={<MeetingRoomIcon />}
                  sx={{ minWidth: 120 }}
                >
                  Join
                </Button>
              </Box>
            </Box>
          </Box>

          <Box flex={1} display={{ xs: 'none', md: 'block' }}>
            <img src="/logo3.png" alt="FriendsMeet Logo" style={{ maxWidth: '100%', height: 'auto' }} />
          </Box>
        </Paper>
      </Box>
    </>
  );
}

export default withAuth(HomeComponent);