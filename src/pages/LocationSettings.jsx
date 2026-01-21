import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { MapPin, Save, Loader, Crosshair, Search } from 'lucide-react';
import settingsService from '../services/settingsService';

// Component to programmatically change map view
const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
};

// Fix for default Leaflet marker icons not showing
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}>
            <Popup>Selected Location: <br /> {position.lat.toFixed(6)}, {position.lng.toFixed(6)}</Popup>
        </Marker>
    );
};

const LocationSettings = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    // Default to Center of India
    const [position, setPosition] = useState({ lat: 20.5937, lng: 78.9629 });
    const [zoom, setZoom] = useState(5);
    const [loading, setLoading] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const settings = await settingsService.getSettings();
            if (settings && settings.officeLocation) {
                setPosition(settings.officeLocation);
                // Auto zoom if location is set
                setZoom(15);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setGettingLocation(true);
        setError('');

        const options = {
            enableHighAccuracy: true,
            timeout: 15000, // Increased timeout to 15s
            maximumAge: 0
        };

        const success = (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            setPosition({ lat: latitude, lng: longitude });
            setZoom(16);
            setGettingLocation(false);

            // detailed feedback
            if (accuracy > 1000) {
                setSuccessMessage(`Location found (approximate). Accuracy: ${Math.round(accuracy)}m. Please verify manually.`);
                setError('GPS signal weak. Using network location (may be inaccurate).');
            } else {
                setSuccessMessage(`Location found! Accuracy: ${Math.round(accuracy)} meters.`);
                setError('');
            }

            setTimeout(() => {
                setSuccessMessage('');
                setError('');
            }, 5000);
        };

        const error = (err) => {
            console.warn(`ERROR(${err.code}): ${err.message}`);
            let msg = 'Unable to retrieve your location.';
            if (err.code === 1) msg = 'Permission denied. Please allow location access.';
            if (err.code === 2) msg = 'Position unavailable. Check your GPS or network.';
            if (err.code === 3) msg = 'Location request timed out. Please try outdoors.';

            setError(msg);
            setGettingLocation(false);
        };

        navigator.geolocation.getCurrentPosition(success, error, options);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearching(true);
        setSearchResults([]);
        setError('');

        try {
            // Using OpenStreetMap Nominatim API
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();

            if (data && data.length > 0) {
                setSearchResults(data);
                // If only one result, auto-select it
                if (data.length === 1) {
                    selectSearchResult(data[0]);
                }
            } else {
                setError('No results found');
            }
        } catch (err) {
            console.error(err);
            setError('Search failed. Please try again.');
        } finally {
            setSearching(false);
        }
    };

    const selectSearchResult = (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        setPosition({ lat, lng });
        setZoom(16);
        setSearchResults([]); // Clear results
        setSuccessMessage(`Moved to: ${result.display_name}`);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccessMessage('');
        try {
            await settingsService.updateSettings({
                lat: position.lat,
                lng: position.lng,
                radius: 100 // Hardcoded for now, could be dynamic
            });
            setSuccessMessage('Location saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to save location');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="dashboard-container">
            <Header toggleSidebar={toggleSidebar} />
            <div className="dashboard-content-wrapper">
                <Sidebar isOpen={sidebarOpen} />
                <main className="main-content">
                    <div className="page-header">
                        <h2>Office Location Settings</h2>
                    </div>

                    <div className="location-settings-container" style={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        height: 'calc(100vh - 120px)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#fee2e2', borderRadius: '4px' }}>{error}</div>}
                        {successMessage && <div style={{ color: '#10b981', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#d1fae5', borderRadius: '4px' }}>{successMessage}</div>}

                        {/* Controls Toolbar */}
                        <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>

                            {/* Search Box */}
                            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '300px', position: 'relative' }}>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search place (e.g., 'Technopark, Trivandrum')"
                                    style={{
                                        padding: '0.5rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        flex: 1
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={searching}
                                    style={{
                                        backgroundColor: '#a855f7',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '0.5rem 1rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    {searching ? <Loader size={18} className="animate-spin" /> : <Search size={18} />}
                                </button>

                                {/* Search Results Dropdown */}
                                {searchResults.length > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        marginTop: '4px',
                                        zIndex: 1000,
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {searchResults.map((result) => (
                                            <div
                                                key={result.place_id}
                                                onClick={() => selectSearchResult(result)}
                                                style={{
                                                    padding: '0.5rem',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid #f3f4f6',
                                                    fontSize: '0.875rem'
                                                }}
                                                onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                            >
                                                {result.display_name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </form>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={handleGetCurrentLocation}
                                    disabled={gettingLocation}
                                    title="Get current GPS location"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        backgroundColor: '#10b981', // Emerald green
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '6px',
                                        cursor: gettingLocation ? 'not-allowed' : 'pointer',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    <Crosshair size={18} />
                                    {gettingLocation ? 'Locating...' : 'My Location'}
                                </button>

                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        backgroundColor: saving ? '#9ca3af' : '#2563eb',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '6px',
                                        cursor: saving ? 'not-allowed' : 'pointer',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                                    {saving ? 'Saving...' : 'Save Location'}
                                </button>
                            </div>
                        </div>

                        <div style={{ flex: 1, borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', position: 'relative', zIndex: 0 }}>
                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <Loader className="animate-spin" size={48} color="#2563eb" />
                                </div>
                            ) : (
                                <MapContainer
                                    center={position}
                                    zoom={zoom}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <ChangeView center={position} zoom={zoom} />
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                                        url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                                    />
                                    <LocationMarker position={position} setPosition={setPosition} />
                                </MapContainer>
                            )}
                        </div>

                        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '6px', fontSize: '0.875rem', color: '#374151' }}>
                            <strong>Selected Coordinates:</strong> Latitude: {position.lat?.toFixed(6)}, Longitude: {position.lng?.toFixed(6)}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LocationSettings;
