import { useState, useEffect, useRef, useCallback } from 'react';
import { Room, RoomEvent, RemoteParticipant, Track, TrackPublication, RemoteTrack, DataPacket_Kind } from 'livekit-client';
import axios from 'axios';
import './App.css';
import VoiceCall from './components/VoiceCall';
import CallSummary from './components/CallSummary';
import ToolCallDisplay from './components/ToolCallDisplay';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ToolCall {
  name: string;
  arguments: any;
  result?: any;
  error?: string;
  timestamp: Date;
}

export interface Transcript {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface CallSummaryData {
  summary: string;
  bookedAppointments: any[];
  toolCalls: ToolCall[];
  costBreakdown?: any;
}

function App() {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [summary, setSummary] = useState<CallSummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const roomRef = useRef<Room | null>(null);

  // Handle data messages from the agent
  const handleDataReceived = useCallback((payload: Uint8Array, participant?: RemoteParticipant) => {
    try {
      const decoder = new TextDecoder();
      const data = JSON.parse(decoder.decode(payload));
      console.log('Received data from agent:', data);

      switch (data.type) {
        case 'transcript':
          setTranscripts(prev => [...prev, {
            role: data.role,
            content: data.content,
            timestamp: new Date(),
          }]);
          break;

        case 'toolCall':
          setToolCalls(prev => [...prev, {
            ...data.toolCall,
            timestamp: new Date(),
          }]);
          break;

        case 'summary':
          setSummary({
            summary: data.summary,
            bookedAppointments: data.bookedAppointments || [],
            toolCalls: data.toolCalls || [],
          });
          break;

        default:
          console.log('Unknown data type:', data.type);
      }
    } catch (err) {
      console.error('Error parsing data message:', err);
    }
  }, []);

  const connectToRoom = async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setError(null);

    try {
      const roomName = `room-${Date.now()}`;
      const participantName = `user-${Math.random().toString(36).substring(7)}`;

      // Get access token from backend
      const { data } = await axios.post(`${API_BASE_URL}/api/token`, {
        roomName,
        participantName,
      });

      const { token, url } = data;

      // Create LiveKit room
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: { width: 640, height: 480 },
        },
      });

      // Set up event listeners
      newRoom.on(RoomEvent.Connected, () => {
        console.log('Connected to room');
        setIsConnected(true);
        setIsConnecting(false);
      });

      newRoom.on(RoomEvent.Disconnected, () => {
        console.log('Disconnected from room');
        setIsConnected(false);
        setIsConnecting(false);
      });

      newRoom.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication: TrackPublication, participant: RemoteParticipant) => {
        console.log(`Track subscribed: ${track.kind} from ${participant.identity}`);

        if (track.kind === 'audio') {
          // Attach audio track to play agent's voice
          const audioElement = track.attach();
          audioElement.id = `audio-${participant.identity}`;
          audioElement.style.display = 'none';
          document.body.appendChild(audioElement);
          console.log('Agent audio track attached and playing');
        } else if (track.kind === 'video') {
          const element = track.attach();
          document.getElementById('avatar-container')?.appendChild(element);
        }
      });

      newRoom.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack, publication: TrackPublication, participant: RemoteParticipant) => {
        console.log(`Track unsubscribed: ${track.kind} from ${participant.identity}`);
        const elements = track.detach();
        elements.forEach(el => el.remove());
      });

      // Listen for data messages from the agent
      newRoom.on(RoomEvent.DataReceived, handleDataReceived);

      // Connect to room
      await newRoom.connect(url, token);

      roomRef.current = newRoom;
      setRoom(newRoom);

      // Simulate tool call events (in production, these would come from WebSocket or room data)
      // For now, we'll simulate based on conversation
    } catch (err: any) {
      console.error('Error connecting to room:', err);
      setError(err.message || 'Failed to connect to room');
      setIsConnecting(false);
    }
  };

  const disconnectFromRoom = async () => {
    if (roomRef.current) {
      roomRef.current.off(RoomEvent.DataReceived, handleDataReceived);
      roomRef.current.disconnect();
      roomRef.current = null;
      setRoom(null);
      setIsConnected(false);
      setToolCalls([]);
      setTranscripts([]);
      setSummary(null);
    }
  };

  const addToolCall = (toolCall: Omit<ToolCall, 'timestamp'>) => {
    setToolCalls(prev => [...prev, { ...toolCall, timestamp: new Date() }]);
  };

  const handleSummary = (summaryData: CallSummaryData) => {
    setSummary(summaryData);
  };

  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎙️ SuperBryn AI Voice Agent</h1>
        <p>Book appointments with natural conversation</p>
      </header>

      <main className="app-main">
        {!isConnected && !isConnecting && (
          <div className="welcome-screen">
            <div className="welcome-content">
              <h2>Ready to start your conversation?</h2>
              <p>Click the button below to connect and start talking with our AI assistant.</p>
              <button className="connect-button" onClick={connectToRoom}>
                Start Conversation
              </button>
            </div>
          </div>
        )}

        {isConnecting && (
          <div className="connecting-screen">
            <div className="spinner"></div>
            <p>Connecting to voice agent...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {isConnected && room && (
          <>
            <VoiceCall
              room={room}
              transcripts={transcripts}
              onToolCall={addToolCall}
              onSummary={handleSummary}
            />
            {toolCalls.length > 0 && (
              <ToolCallDisplay toolCalls={toolCalls} />
            )}
            {summary && (
              <CallSummary summary={summary} />
            )}
            <button className="disconnect-button" onClick={disconnectFromRoom}>
              End Conversation
            </button>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
