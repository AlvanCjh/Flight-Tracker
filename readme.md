<img width="1919" height="981" alt="Screenshot 2026-01-21 144651" src="https://github.com/user-attachments/assets/482fe69d-a198-424c-a4de-30bd404d55d7" />

# ✈️ Real-Time Global Flight Tracker

A full-stack web application that tracks live aircraft positions globally. The project uses a **FastAPI** backend to interface with the OpenSky Network API via OAuth2 and a **React** frontend to visualize flight data on an interactive map.

## 🚀 Features
* **Live Global Tracking**: Displays the top 50 active flights worldwide with real-time updates every 30 seconds.
* **Interactive Map**: Built with Leaflet.js, featuring smooth panning and zooming.
* **On-Demand Details**: Click any aircraft to fetch specific departure and arrival airport codes (ICAO).
* **Visual Direction**: Custom airplane icons rotate based on the aircraft's true heading, including a dashed "tail" to show the flight path.
* **Automatic Flagging**: Displays the origin country's flag for each aircraft using FlagCDN.
* **Secure Authentication**: Implements OAuth2 Client Credentials flow to interact with OpenSky Network.

## 🛠️ Tech Stack
* **Frontend**: React.js, Leaflet, Axios, Vite.
* **Backend**: FastAPI (Python), Requests, Uvicorn, Python-Dotenv.
* **Data Provider**: [OpenSky Network API](https://opensky-network.org/).

## Installation
1. Prequisites
- Python 3.8+
- Node.js 16+
- An OpenSky Network Account with an API Client

2. Backend Setup
- Navigate to backend folder 

`cd backend`

- Create and activate a virtual environment

`python -m venv venv`
#Windows
`.\venv\Scripts\Activate`
#Mac/Linux
`source venv/bin/activate`

- Instal Dependencies

`pip install fastapi uvicorn requests python-dotenv`

- Create a .env file in the backend/ directory

`OPENSKY_CLIENT_ID=your_client_id_here`
`OPENSKY_CLIENT_SECRET=your_client_secret_here`

- Start the server

`uvicorn main:app --reload`

3. Frontend Setup
- Navigate to frontend folder 

`cd frontend`

- Install dependencies

`npm install`

- Start the development server

`npm run dev`

## 📁 Project Structure
```text
Flight Tracker/
├── backend/
│   ├── main.py            # FastAPI server logic
│   ├── .env               # Private API credentials (ignored by Git)
│   └── requirements.txt   # Python dependencies
└── frontend/
    ├── src/
    │   ├── App.jsx        # Main React component
    │   └── main.jsx       # Entry point
    ├── package.json       # Node.js dependencies
    └── vite.config.js     # Vite configuration


🔐 Security Note
This project uses .env files to manage sensitive API credentials. Never commit your .env file to a public repository. The included .gitignore is configured to prevent this.

📄 License
This project is open-source and available under the MIT License.



