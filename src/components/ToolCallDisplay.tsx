import { ToolCall } from '../App';
import './ToolCallDisplay.css';

interface ToolCallDisplayProps {
  toolCalls: ToolCall[];
}

export default function ToolCallDisplay({ toolCalls }: ToolCallDisplayProps) {
  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'identify_user':
        return '👤';
      case 'fetch_slots':
        return '📅';
      case 'book_appointment':
        return '✅';
      case 'retrieve_appointments':
        return '🔍';
      case 'cancel_appointment':
        return '❌';
      case 'modify_appointment':
        return '✏️';
      case 'end_conversation':
        return '👋';
      default:
        return '⚙️';
    }
  };

  const getToolName = (toolName: string) => {
    return toolName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="tool-calls-container">
      <h3>🛠️ Tool Calls</h3>
      <div className="tool-calls-list">
        {toolCalls.map((toolCall, idx) => (
          <div key={idx} className={`tool-call-card ${toolCall.error ? 'error' : toolCall.result?.success ? 'success' : 'pending'}`}>
            <div className="tool-call-header">
              <span className="tool-icon">{getToolIcon(toolCall.name)}</span>
              <span className="tool-name">{getToolName(toolCall.name)}</span>
              <span className="tool-time">
                {toolCall.timestamp.toLocaleTimeString()}
              </span>
            </div>
            
            {Object.keys(toolCall.arguments || {}).length > 0 && (
              <div className="tool-arguments">
                <strong>Arguments:</strong>
                <pre>{JSON.stringify(toolCall.arguments, null, 2)}</pre>
              </div>
            )}

            {toolCall.result && (
              <div className="tool-result">
                <strong>Result:</strong>
                <pre>{JSON.stringify(toolCall.result, null, 2)}</pre>
              </div>
            )}

            {toolCall.error && (
              <div className="tool-error">
                <strong>Error:</strong> {toolCall.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
