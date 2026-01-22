import { useEffect, useRef, useState } from 'react';
import {
  Room,
  LocalAudioTrack,
  LocalVideoTrack,
  createLocalTracks,
} from 'livekit-client';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import './VoiceCall.css';

interface Transcript {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface VoiceCallProps {
  room: Room;
  transcripts: Transcript[];
  onToolCall: (toolCall: any) => void;
  onSummary: (summary: any) => void;
}

export default function VoiceCall({ room, transcripts, onToolCall, onSummary }: VoiceCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const audioRef = useRef<LocalAudioTrack | null>(null);
  const videoRef = useRef<LocalVideoTrack | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new transcripts come in
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  useEffect(() => {
    let isMounted = true;

    const enableAudio = async () => {
      // Skip if already set up or component unmounted
      if (audioRef.current || !isMounted) return;

      try {
        // Create a local microphone track
        const tracks = await createLocalTracks({ audio: true, video: false });
        const audioTrack = tracks.find(t => t.kind === 'audio');
        if (audioTrack && isMounted && !audioRef.current) {
          await room.localParticipant.publishTrack(audioTrack);
          audioRef.current = audioTrack as LocalAudioTrack;
          setIsAudioReady(true);
          console.log('Audio track published successfully');
        }
      } catch (error) {
        console.error('Error enabling audio:', error);
      }
    };

    enableAudio();

    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.stop();
        room.localParticipant.unpublishTrack(audioRef.current);
        audioRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.stop();
        room.localParticipant.unpublishTrack(videoRef.current);
      }
    };
  }, [room]);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.unmute();
      } else {
        audioRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = async () => {
    try {
      if (isVideoEnabled && videoRef.current) {
        videoRef.current.stop();
        videoRef.current.detach();
        await room.localParticipant.unpublishTrack(videoRef.current);
        videoRef.current = null;
        setIsVideoEnabled(false);
      } else {
        const tracks = await createLocalTracks({ audio: false, video: true });
        const videoTrack = tracks.find(t => t.kind === 'video');
        if (videoTrack) {
          await room.localParticipant.publishTrack(videoTrack);
          videoRef.current = videoTrack as LocalVideoTrack;
          const element = videoTrack.attach();
          element.style.width = '100%';
          element.style.height = '100%';
          element.style.objectFit = 'cover';
          const container = document.getElementById('local-video');
          if (container) {
            container.innerHTML = '';
            container.appendChild(element);
          }
          setIsVideoEnabled(true);
        }
      }
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  return (
    <div className="voice-call">
      <div className="video-container">
        <div id="avatar-container" className="avatar-container">
          <div className="avatar-placeholder">
            <div className="avatar-icon">🤖</div>
            <p>AI Assistant</p>
            <p className="avatar-subtitle">
              {isAudioReady ? 'Listening...' : 'Connecting...'}
            </p>
          </div>
        </div>
        <div id="local-video" className="local-video">
          {!isVideoEnabled && (
            <div className="video-placeholder">
              <p>Camera Off</p>
            </div>
          )}
        </div>
      </div>

      <div className="transcript-container">
        <h3>Conversation</h3>
        <div className="transcript">
          {transcripts.length === 0 ? (
            <p className="transcript-empty">
              {isAudioReady
                ? "Start speaking to begin the conversation!"
                : "Connecting to AI assistant..."}
            </p>
          ) : (
            transcripts.map((item, idx) => (
              <div
                key={idx}
                className={`transcript-line ${item.role === 'user' ? 'user' : 'assistant'}`}
              >
                <span className="transcript-role">
                  {item.role === 'user' ? 'You' : 'Assistant'}:
                </span>
                <span className="transcript-content">{item.content}</span>
              </div>
            ))
          )}
          <div ref={transcriptEndRef} />
        </div>
      </div>

      <div className="call-controls">
        <button
          className={`control-button ${isMuted ? 'muted' : ''}`}
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
          disabled={!isAudioReady}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        <button
          className={`control-button ${!isVideoEnabled ? 'disabled' : ''}`}
          onClick={toggleVideo}
          title={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
        >
          {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
        </button>
      </div>
    </div>
  );
}
