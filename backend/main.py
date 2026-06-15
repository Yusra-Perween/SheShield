from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import gemini_service

app = FastAPI(title="SheShield AI Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ThreatRequest(BaseModel):
    text: str
    
@app.get("/")
def read_root():
    return {"message": "SheShield AI Backend is Running"}

@app.post("/api/detect-threat")
def detect_threat(request: ThreatRequest):
    try:
        result = gemini_service.analyze_threat(request.text)
        return {"success": True, "analysis": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
@app.post("/api/sos")
def trigger_sos():
    # In a real app, this would integrate with Firebase to send SMS/Notifications
    return {"success": True, "message": "SOS protocol activated. Emergency contacts notified."}

@app.get("/api/safe-zones")
def get_safe_zones():
    # Returns mocked data for safe zones like hospitals and police stations
    return {
        "success": True,
        "zones": [
            {"id": 1, "name": "City Center Police Station", "lat": 40.7128, "lng": -74.0060, "type": "police"},
            {"id": 2, "name": "General Hospital", "lat": 40.7138, "lng": -74.0080, "type": "hospital"}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

