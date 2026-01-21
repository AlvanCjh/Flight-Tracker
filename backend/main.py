from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import requests
import time
import os

# Load variables from .env file
load_dotenv()

app = FastAPI()

# CORS configuration for frontend and backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global dictionary to store token information
token_store = {
    "access_token": None,
    "expires_at": 0
}

def get_access_token():
    """Fetches a new OAuth2 token if the current one is expired."""
    # Real Credentials for OpenSky
    CLIENT_ID = os.getenv("OPENSKY_CLIENT_ID")
    CLIENT_SECRET = os.getenv("OPENSKY_CLIENT_SECRET")
    
    # Return existing token if its still valid
    if token_store["access_token"] and time.time() < token_store["expires_at"]:
        return token_store["access_token"]

    token_url = "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token"
    payload = {
        "grant_type": "client_credentials",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }

    try:
        # Requesting a new token
        response = requests.post(token_url, data=payload, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        token_store["access_token"] = data["access_token"]
        # Set expiry with a 60-second buffer
        token_store["expires_at"] = time.time() + data["expires_in"] - 60
        print("Successfully obtained new Access Token.")
        return token_store["access_token"]
    except Exception as e:
        print(f"Authentication Error: {e}")
        return None

# Route 1: Get all planes for markets
@app.get("/api/flights")
def get_all_flights_for_map():
    token = get_access_token()
    if not token:
        return {"status": "auth_error", "data": []}

    # URL for all flights worldwide
    url = f"https://opensky-network.org/api/states/all"
    headers = {"Authorization": f"Bearer {token}"} # Use the Bearer token

    try:
        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code == 429:
            return {"status": "limited", "data": []}

        if response.status_code != 200:
            print(f"OpenSky API Error: {response.status_code}")
            return {"status": "error", "data": []}
        
        data = response.json()
        states = data.get('states', [])

        if not states:
            return {"status": "empty", "data": []}
        
        processed_flights = []
        for s in states[:50]:
            processed_flights.append({
                "icao24": s[0],
                "callsign": s[1].strip() if s[1] else "N/A",
                "origin_country": s[2],
                "longitude": s[5],
                "latitude": s[6],
                "heading": s[10] or 0 
            })
        return {"status": "success", "data": processed_flights}
    except Exception as e:
        print(f"Backend processing error: {e}")
        return {"status": "error", "data": []}
    
# Route 2: Get airpots for one plane (onclick)
@app.get("/api/flights/{icao24}")
def get_single_flight_details(icao24: str):
    token = get_access_token()
    if not token: return {"departure": "N/A", "arrival": "N/A"}

    end_time = int(time.time())
    start_time = end_time - 86400 # Look back 24 hours

    url = f"https://opensky-network.org/api/flights/aircraft?icao24={icao24}&begin={start_time}&end={end_time}"
    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            flights = response.json()
            if flights:
                latest = flights[-1] # Most recent flight
                return {
                    "departure": latest.get("estDepartureAirport") or "Unknown",
                    "arrival": latest.get("estArrivalAirport") or "In Flight"
                }
        return {"departure": "N/A", "arrival": "N/A"}
    except Exception:
        return {"departure": "Error", "arrival": "Error"}
