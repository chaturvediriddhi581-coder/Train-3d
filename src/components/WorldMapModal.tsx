import React from 'react';
import { STATIONS, SCENIC_LANDMARKS, TRACK_TOTAL_LENGTH } from '../game/trackNetwork';
import { X, MapPin, Navigation, Compass, FastForward } from 'lucide-react';

interface WorldMapModalProps {
  currentDistance: number;
  onTeleportToDistance: (distanceMeters: number) => void;
  onClose: () => void;
}

export const WorldMapModal: React.FC<WorldMapModalProps> = ({
  currentDistance,
  onTeleportToDistance,
  onClose,
}) => {
  const normalizedDist = ((currentDistance % TRACK_TOTAL_LENGTH) + TRACK_TOTAL_LENGTH) % TRACK_TOTAL_LENGTH;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-xl font-bold text-sky-400">Indian Railways Open World GPS Route</h2>
              <p className="text-xs text-slate-400">Total Corridor Length: 16.8 km • Multi-State Railway Network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live GPS Track Corridor Diagram */}
        <div className="p-6 bg-slate-950/70 border-b border-slate-800">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <span>START: New Delhi (0 km)</span>
            <span className="text-amber-400 font-mono font-bold">
              GPS Position: {(normalizedDist / 1000).toFixed(2)} km / {(TRACK_TOTAL_LENGTH / 1000).toFixed(1)} km
            </span>
            <span>LOOP RETURN: Delhi (16.8 km)</span>
          </div>

          {/* Graphical Progress Bar with Train Blip */}
          <div className="relative w-full h-5 bg-slate-800 rounded-full overflow-visible border border-slate-700">
            {/* Filled Progress */}
            <div 
              className="h-full bg-gradient-to-r from-sky-500 via-amber-500 to-emerald-500 rounded-full"
              style={{ width: `${(normalizedDist / TRACK_TOTAL_LENGTH) * 100}%` }}
            />
            {/* Live Train Blip */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-amber-400 rounded-full border-2 border-slate-900 shadow-lg flex items-center justify-center animate-pulse"
              style={{ left: `${(normalizedDist / TRACK_TOTAL_LENGTH) * 100}%` }}
              title="Your Train Live Location"
            >
              <Navigation className="w-3.5 h-3.5 text-slate-950 transform rotate-45" />
            </div>

            {/* Station Pins along line */}
            {STATIONS.map((st) => {
              const pct = (st.trackPosition / TRACK_TOTAL_LENGTH) * 100;
              return (
                <div
                  key={st.id}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full border border-slate-900"
                  style={{ left: `${pct}%` }}
                  title={`${st.name} (${(st.trackPosition / 1000).toFixed(1)} km)`}
                />
              );
            })}
          </div>
        </div>

        {/* Stations & Scenic Landmarks Directory */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Major Stations & Fast Travel Hubs</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STATIONS.map((st) => {
              const distFromTrain = Math.abs(st.trackPosition - normalizedDist);
              const isNearby = distFromTrain < 250;

              return (
                <div
                  key={st.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isNearby
                      ? 'border-emerald-500 bg-slate-800/80 shadow-md ring-1 ring-emerald-500/30'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{st.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono font-bold">
                          {st.code}
                        </span>
                      </div>
                      <div className="text-xs text-amber-400 font-medium">{st.hindiName}</div>
                      <div className="text-xs text-slate-400 mt-1">{st.state} • Limit: {st.speedLimitKmh} km/h</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono text-slate-300">{(st.trackPosition / 1000).toFixed(1)} km</div>
                      {isNearby && (
                        <span className="text-[10px] text-emerald-400 font-bold">At Platform</span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 my-3 leading-relaxed">
                    {st.description}
                  </p>

                  <button
                    onClick={() => {
                      onTeleportToDistance(st.trackPosition);
                      onClose();
                    }}
                    className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs tracking-wide flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    <span>Teleport Train Here</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Scenic Landmarks Grid */}
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mt-6 mb-3">Scenic Railway Landmarks</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {SCENIC_LANDMARKS.map((lm) => (
              <button
                key={lm.name}
                onClick={() => {
                  onTeleportToDistance(lm.trackPosition);
                  onClose();
                }}
                className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-sky-500/50 text-left transition-colors group"
              >
                <div className="font-semibold text-white group-hover:text-sky-300 truncate">{lm.name}</div>
                <div className="text-[11px] text-amber-400/80">{lm.hindiName}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{(lm.trackPosition / 1000).toFixed(1)} km • {lm.type.toUpperCase()}</div>
              </button>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Free-roam across India: Drive anywhere without compulsory missions or timers.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium"
          >
            Close Map
          </button>
        </div>

      </div>
    </div>
  );
};
