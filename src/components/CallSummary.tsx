import { CallSummaryData } from '../App';
import './CallSummary.css';

interface CallSummaryProps {
  summary: CallSummaryData;
}

export default function CallSummary({ summary }: CallSummaryProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="call-summary">
      <h2>📋 Call Summary</h2>
      
      <div className="summary-section">
        <h3>Conversation Summary</h3>
        <p className="summary-text">{summary.summary}</p>
      </div>

      {summary.bookedAppointments && summary.bookedAppointments.length > 0 && (
        <div className="summary-section">
          <h3>📅 Booked Appointments</h3>
          <div className="appointments-list">
            {summary.bookedAppointments.map((apt, idx) => (
              <div key={idx} className="appointment-card">
                <div className="appointment-date">
                  {formatDate(apt.date)} at {formatTime(apt.time)}
                </div>
                {apt.service_type && (
                  <div className="appointment-service">
                    Service: {apt.service_type}
                  </div>
                )}
                <div className="appointment-id">ID: #{apt.id}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary.costBreakdown && (
        <div className="summary-section">
          <h3>💰 Cost Breakdown</h3>
          <div className="cost-breakdown">
            <div className="cost-items">
              {summary.costBreakdown.breakdown?.map((item: any, idx: number) => (
                <div key={idx} className="cost-item">
                  <span className="cost-service">{item.service}</span>
                  <span className="cost-amount">${item.cost.toFixed(4)}</span>
                  <span className="cost-unit">{item.unit}</span>
                </div>
              ))}
            </div>
            <div className="cost-total">
              <strong>Total: ${summary.costBreakdown.total?.toFixed(4) || '0.0000'}</strong>
            </div>
          </div>
        </div>
      )}

      <div className="summary-footer">
        <p>Thank you for using SuperBryn AI Voice Agent!</p>
      </div>
    </div>
  );
}
