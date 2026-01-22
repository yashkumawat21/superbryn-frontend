# SuperBryn Frontend - AI Voice Agent UI

React frontend for the AI Voice Agent using LiveKit Web SDK.

## Tech Stack

- **React + TypeScript**: UI framework
- **Vite**: Build tool
- **LiveKit Client**: WebRTC client for real-time communication
- **Axios**: HTTP client
- **Lucide React**: Icons

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:3001
```

For production, set this to your deployed backend URL.

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## Features

- ✅ Connect to LiveKit room
- ✅ Voice call interface
- ✅ Real-time transcript display
- ✅ Tool call visualization
- ✅ Call summary display
- ✅ Cost breakdown display
- ✅ Avatar video display (placeholder)
- ✅ Mute/unmute controls
- ✅ Video toggle controls

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── VoiceCall.tsx       # Main call interface
│   │   ├── ToolCallDisplay.tsx # Tool calls UI
│   │   └── CallSummary.tsx     # Summary display
│   ├── App.tsx                 # Main app component
│   ├── App.css                 # App styles
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Usage

1. Click "Start Conversation" to connect
2. Allow microphone/camera permissions
3. Speak naturally to the AI agent
4. View tool calls as they happen
5. Review summary at the end of the call

## Deployment

### Netlify

```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Vercel

```bash
npm run build
# Deploy to Vercel
```

Make sure to set `VITE_API_URL` environment variable in your hosting platform.

## Notes

- The avatar video placeholder will show when the agent's video track is published
- Tool calls are displayed in real-time as they occur
- Call summary appears automatically when the conversation ends
- Cost breakdown is shown if available
