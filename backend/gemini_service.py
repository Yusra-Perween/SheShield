import os
import google.generativeai as genai

# Setup Gemini API key
# In production, use environment variables: os.getenv("GEMINI_API_KEY")
# For this prototype, we'll configure it directly if provided or mock it if missing.

def analyze_threat(text: str) -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        # Mocking the AI response if no API key is provided
        # This allows the frontend to be tested immediately
        text_lower = text.lower()
        if "help" in text_lower or "save me" in text_lower or "stop" in text_lower or "leave me" in text_lower:
            return {
                "threat_level": "HIGH",
                "confidence": 0.95,
                "action": "TRIGGER_SOS",
                "reasoning": "Detected distress keywords indicating immediate danger."
            }
        else:
            return {
                "threat_level": "LOW",
                "confidence": 0.8,
                "action": "NONE",
                "reasoning": "Normal conversation detected."
            }
            
    # Real Gemini integration
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-pro')
    
    prompt = f"""
    You are a threat detection AI for a women's safety app.
    Analyze the following transcribed audio text and determine if the user is in danger.
    Respond ONLY in JSON format with the following keys:
    - threat_level: "HIGH", "MEDIUM", or "LOW"
    - confidence: A float between 0.0 and 1.0
    - action: "TRIGGER_SOS" or "NONE"
    - reasoning: A brief explanation of why.
    
    Text to analyze: "{text}"
    """
    
    response = model.generate_content(prompt)
    # Parse JSON from response
    import json
    import re
    
    try:
        # Extract JSON block
        json_str = re.search(r'\{.*\}', response.text, re.DOTALL).group(0)
        return json.loads(json_str)
    except:
        return {
            "threat_level": "UNKNOWN",
            "confidence": 0.0,
            "action": "NONE",
            "reasoning": f"Failed to parse AI response. Raw: {response.text}"
        }
