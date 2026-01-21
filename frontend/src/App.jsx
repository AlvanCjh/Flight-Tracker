import React, {useEffect, useState} from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Defining Airplane SVG Icon
const createAirplaneIcon = (heading) => {
  return L.divIcon({
    html: `
     <div style="transform: rotate(${heading}deg); display: flex; align-items: center; justify-content: center;">
      <svg viewBox="0 0 512 512" width="30" height="30" style="fill: #007bff; filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.5));">
        <path d="M448 336v-40L288 192V79.2c0-22.1-17.9-40-40-40s-40 17.9-40 40V192L48 296v40l160-48v113.6l-48 31.2V472l88-24 88 24v-39.2l-48-31.2V288l160 48z"/>
      </svg>
     </div>
    `,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15], 
  });
};

// Country Code
const countryToCode = {
  "United States": "us", "United Kingdom": "gb", "Germany": "de",
  "France": "fr", "Canada": "ca", "China": "cn", "Japan": "jp",
  "Malaysia": "my", "Singapore": "sg", "Australia": "au"
};

// Get country flag
const getFlagUrl = (country) => {
  const code = countryToCode[country] || "un"; // "un" is the United Nations flag fallback
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
};

function App() {
  const [flights, setFlights] = useState([]);
  const [details, setDetails] = useState({ departure: "Click to load...", arrival: ""});

  const fetchFlights = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/flights');
      if (res.data && res.data.status === "success") {
        setFlights(res.data.data);
      }   
    } catch (err) {
      console.error("Backend not running on port 8000");
    }
  };

  // To fetch airport data on click
  const handleMarkerClick = async (icao24) => {
    setDetails({ departure: "Fetching...", arrival: ""});
    try {
      const res = await axios.get(`http://localhost:8000/api/flights/${icao24}`);
      setDetails(res.data);
    } catch (err) {
      setDetails({ departure: "Error", arrival: "Error" });
    }
  };


  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

 return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {Array.isArray(flights) && flights.map(f => {
          
          // Calculate a simple directional tail line
          const tailLat = f.latitude - (Math.cos(f.heading * Math.PI / 180) * 1.5);
          const tailLng = f.longitude - (Math.sin(f.heading * Math.PI / 180) * 1.5);

          return f.latitude && f.longitude ? (
            <React.Fragment key={f.icao24}>
              <Polyline positions={[[f.latitude, f.longitude], [tailLat, tailLng]]} color="blue" weight={2} dashArray="5, 10" opacity={0.5} />
              <Marker position={[f.latitude, f.longitude]} icon={createAirplaneIcon(f.heading)}
                eventHandlers={{ click: () => handleMarkerClick(f.icao24) }}>
                <Popup>
                  <div style={{ textAlign: 'center' }}>
                    <img src={getFlagUrl(f.origin_country)} alt={f.origin_country} style={{ width: '30px', borderRadius: '2px' }} /><br />
                    <strong>Flight: {f.callsign}</strong><br />
                    Dep: {details.departure} | Arr: {details.arrival}<br />
                    Heading: {f.heading}°
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ) : null;
        })}
      </MapContainer>
    </div>
  );
}

export default App;