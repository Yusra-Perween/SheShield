import React, { useState } from 'react';
import './App.css';

function App() {
  const [threatLevel, setThreatLevel] = useState(null);
  const [sosActive, setSosActive] = useState(false);
  const [audioTranscript, setAudioTranscript] = useState('');
  const [contacts, setContacts] = useState(['Mom', 'Best Friend', 'Police']); // Added state
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const triggerSOS = async () => {
    setSosActive(true);
    try {
      const response = await fetch('http://localhost:8000/api/sos', { method: 'POST' });
      const data = await response.json();
      alert(`${data.message}\nNotifying: ${contacts.join(', ')}`);
    } catch (err) {
      console.error(err);
      alert('Error triggering SOS. Make sure Python Backend is running on port 8000.');
    }
    setTimeout(() => setSosActive(false), 3000);
  };

  const fetchSafeZones = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/safe-zones');
      const data = await response.json();
      if (data.success) {
        const zoneNames = data.zones.map(z => z.name).join(', ');
        alert(`Found ${data.zones.length} safe zones nearby:\n${zoneNames}`);
      }
    } catch (err) {
      console.error(err);
      alert('Could not fetch safe zones. Backend might be offline.');
    }
  };

  const initiateFakeCall = () => {
    alert('Fake call scheduled in 3 seconds...');
    setTimeout(() => {
      setFakeCallActive(true);
      setTimeout(() => setFakeCallActive(false), 5000); // Call lasts 5 seconds
    }, 3000);
  };

  const startTimer = () => {
    setTimerSeconds(5); // 5 second demo timer
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          alert('Checkup Timer finished! Are you safe?');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const fetchGuides = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/guides');
      const data = await response.json();
      if (data.success) {
        const guidesStr = data.guides.map(g => `${g.title} (${g.type} - ${g.duration})`).join('\n');
        alert(`Self-Defense Guides Available:\n\n${guidesStr}`);
      }
    } catch (err) {
      console.error(err);
      alert('Could not fetch guides.');
    }
  };

  const fetchThreatLogs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/threat-logs');
      const data = await response.json();
      if (data.success) {
        const logsStr = data.logs.map(l => `Level: ${l.threat_level} | Action: ${l.action_taken}`).join('\n');
        alert(`Recent Threat Logs:\n${logsStr}`);
      }
    } catch (err) {
      console.error(err);
      alert('Could not fetch threat logs.');
    }
  };

  const simulateAudioThreat = async () => {
    const text = audioTranscript || "Help me, someone is following me!";
    try {
      const response = await fetch('http://localhost:8000/api/detect-threat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await response.json();
      setThreatLevel(data.analysis);
      if (data.analysis.action === 'TRIGGER_SOS') {
        triggerSOS();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to backend. Make sure it is running.');
    }
  };

  return (
    <div className="app-container">
      <header className="glass-header">
        <h1>🛡️ SheShield AI</h1>
        <p>Your Shield of Safety</p>
      </header>

      <main className="dashboard">
        <section className="card sos-section">
          <h2>Emergency Response</h2>
          <p>Press the button below if you are in immediate danger.</p>
          <button 
            className={`sos-btn ${sosActive ? 'active' : ''}`}
            onClick={triggerSOS}
          >
            {sosActive ? 'SOS SENT' : 'QUICK SOS'}
          </button>
        </section>

        <section className="card ai-section">
          <h2>AI Threat Detection</h2>
          <p>Simulate voice detection by typing a distress phrase.</p>
          <div className="input-group">
            <input 
              type="text" 
              placeholder="e.g. Help me, stop!"
              value={audioTranscript}
              onChange={(e) => setAudioTranscript(e.target.value)}
            />
            <button onClick={simulateAudioThreat}>Analyze</button>
          </div>
          
          {threatLevel && (
            <div className={`threat-result ${threatLevel.threat_level.toLowerCase()}`}>
              <h3>Status: {threatLevel.threat_level}</h3>
              <p>{threatLevel.reasoning}</p>
            </div>
          )}
        </section>

        <section className="card tools-section">
          <h2>Preventive Tools & Settings</h2>
          <div className="tools-grid">
            <button className="tool-btn" onClick={initiateFakeCall}>
              {fakeCallActive ? '📞 RINGING...' : '📞 Fake Call'}
            </button>
            <button className="tool-btn" onClick={fetchSafeZones}>📍 Safety Map</button>
            <button className="tool-btn" onClick={startTimer}>
              {timerSeconds > 0 ? `⏱️ ${timerSeconds}s remaining` : '⏱️ Checkup Timer'}
            </button>
            <button className="tool-btn" onClick={() => alert(`Current Contacts: ${contacts.join(', ')}`)}>👥 Contacts</button>
            <button className="tool-btn" onClick={fetchThreatLogs}>📊 Safety Analytics</button>
            <button className="tool-btn highlight" onClick={fetchGuides}>🥋 Defense Guides</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

