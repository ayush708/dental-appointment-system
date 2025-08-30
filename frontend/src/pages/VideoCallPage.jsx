import {
    ChatBubbleLeftIcon,
    CogIcon,
    MicrophoneIcon,
    MicrophoneSlashIcon,
    PhoneXMarkIcon,
    ShareIcon,
    UserGroupIcon,
    VideoCameraIcon,
    VideoCameraSlashIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const VideoCallPage = () => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [participants] = useState([
    { id: 1, name: 'Dr. Sarah Smith', isDoctor: true, avatar: '/api/placeholder/120/120' },
    { id: 2, name: 'John Doe', isDoctor: false, avatar: '/api/placeholder/120/120' }
  ]);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setIsConnected(false);
    // Navigate back or show end call screen
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  return (
    <div className="h-screen bg-gray-900 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900"></div>
      
      {/* Main video area */}
      <div className="relative h-full flex items-center justify-center">
        {/* Remote video (main) */}
        <div className="w-full h-full relative">
          <video
            ref={remoteVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
          
          {/* Overlay when video is disabled */}
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-semibold">DS</span>
                </div>
                <p className="text-white text-lg">Dr. Sarah Smith</p>
                <p className="text-gray-400 text-sm">Video turned off</p>
              </div>
            </div>
          )}

          {/* Call info overlay */}
          <div className="absolute top-6 left-6 bg-black bg-opacity-50 rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2 text-white">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Connected • {formatTime(callDuration)}</span>
            </div>
          </div>

          {/* Participants info */}
          <div className="absolute top-6 right-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black bg-opacity-50 rounded-lg px-4 py-2"
            >
              <div className="flex items-center space-x-2 text-white">
                <UserGroupIcon className="w-4 h-4" />
                <span className="text-sm">{participants.length} participants</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Local video (picture-in-picture) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-24 right-6 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600"
        >
          {isVideoEnabled ? (
            <video
              ref={localVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-sm font-semibold">You</span>
                </div>
                <p className="text-gray-400 text-xs">Video off</p>
              </div>
            </div>
          )}
          
          {!isAudioEnabled && (
            <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
              <MicrophoneSlashIcon className="w-3 h-3 text-white" />
            </div>
          )}
        </motion.div>
      </div>

      {/* Control panel */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
      >
        <div className="bg-black bg-opacity-80 rounded-2xl px-6 py-4">
          <div className="flex items-center space-x-4">
            {/* Audio toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleAudio}
              className={`p-4 rounded-full transition-colors ${
                isAudioEnabled 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isAudioEnabled ? (
                <MicrophoneIcon className="w-6 h-6" />
              ) : (
                <MicrophoneSlashIcon className="w-6 h-6" />
              )}
            </motion.button>

            {/* Video toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-colors ${
                isVideoEnabled 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isVideoEnabled ? (
                <VideoCameraIcon className="w-6 h-6" />
              ) : (
                <VideoCameraSlashIcon className="w-6 h-6" />
              )}
            </motion.button>

            {/* End call */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEndCall}
              className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            >
              <PhoneXMarkIcon className="w-6 h-6" />
            </motion.button>

            {/* Chat */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
            >
              <ChatBubbleLeftIcon className="w-6 h-6" />
            </motion.button>

            {/* Share screen */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
            >
              <ShareIcon className="w-6 h-6" />
            </motion.button>

            {/* Settings */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
            >
              <CogIcon className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Connection status */}
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <PhoneXMarkIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-white text-2xl font-semibold mb-2">Call Ended</h2>
            <p className="text-gray-400 mb-6">The video call has been terminated</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Return to Dashboard
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Network quality indicator */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
        <div className="bg-black bg-opacity-50 rounded-lg px-3 py-1">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-1 h-3 bg-green-500 rounded-full"></div>
              <div className="w-1 h-3 bg-green-500 rounded-full"></div>
              <div className="w-1 h-3 bg-green-500 rounded-full"></div>
              <div className="w-1 h-3 bg-gray-500 rounded-full"></div>
            </div>
            <span className="text-white text-xs">Good</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallPage;
