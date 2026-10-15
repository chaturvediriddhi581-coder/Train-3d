import React, { useState } from 'react';
import { 
  TrainState, 
  CameraViewMode, 
  SignalAspect, 
  WeatherType,
  StationData
} from '../types/game';
import { TRAIN_CONFIGS } from '../game/trainModels';
import { 
  Volume2, 
  VolumeX, 
  Eye, 
  Compass, 
  Zap, 
  Sun, 
  CloudRain, 
  Map as MapIcon, 
  RotateCcw,
  Sliders,
  AlertTriangle,
  Lightbulb,
  Wind
} from 'lucide-react';
import { railAudio } from '../audio/railAudio';

interface TrainHUDProps {
  state: TrainState;
  trainType: string;
  cameraMode: CameraViewMode;
  onSetCameraMode: (mode: CameraViewMode) => void;
  weather: WeatherType;
  onSetWeather: (w: WeatherType) => void;
  nextSignal: { aspect: SignalAspect; targetSpeedKmh: number; distanceTo: number } | null;
  nextStation: { station: StationData; distanceTo: number } | null;
  onThrottleChange: (notch: number) => void;
  onBrakeChange: (brake: number) => void;
  onReverserChange: (rev: 1 | 0 | -1) => void;
  onEmergencyBrake: () => void;
  onHornStart: () => void;
  onHornStop: () => void;
  onToggleLights: () => void;
  onToggleCabLight: () => void;
  onToggleWipers: () => void;
  onTogglePantograph: () => void;
  onToggleDoors: () => void;
  onOpenTrainSelector: () => void;
  onOpenMap: () => void;
  onOpenCareer: () => void;
  onOpenHelp: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TrainHUD: React.FC<TrainHUDProps> = ({
  state,
  trainType,
  cameraMode,
  onSetCameraMode,
  weather,
  onSetWeather,
  nextSignal,
  nextStation,
  onThrottleChange,
  onBrakeChange,
  onReverserChange,
  onEmergencyBrake,
  onHornStart,
  onHornStop,
  onToggleLights,
  onToggleCabLight,
  onToggleWipers,
  onTogglePantograph,
  onToggleDoors,
  onOpenTrainSelector,
  onOpenMap,
  onOpenCareer,
  onOpenHelp,
  isMuted,
  onToggleMute,
}) => {
  const [hudCollapsed, setHudCollapsed] = useState(false);
  const cfg = TRAIN_CONFIGS[trainType as keyof typeof TRAIN_CONFIGS] || TRAIN_CONFIGS.vande_bharat;
  const speedAbs = Math.abs(Math.round(state.speedKmh));

  // Determine signal aspect color
  const getSignalColor = (aspect?: SignalAspect) => {
    switch (aspect) {
      case 'green': return 'bg-emerald-500 border-emerald-300';
      case 'double_yellow': return 'bg-amber-400 border-amber-200';
      case 'yellow': return 'bg-amber-500 border-amber-300';
      case 'red': return 'bg-red-600 border-red-300';
      default: return 'bg-emerald-500 border-emerald-300';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none">
      {/* TOP STATUS BAR (Glassmorphic dark minimal banner) */}
      <div className="flex items-center justify-between pointer-events-auto">
        {/* Left: Train Brand & Current Station */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3.5 py-2 shadow-2xl">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold text-sm tracking-wide">{cfg.name}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                {cfg.traction}
              </span>
            </div>
            {nextStation && (
              <div className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                <span>Next: <strong className="text-white">{nextStation.station.name}</strong></span>
                <span className="text-slate-400">({Math.round(nextStation.distanceTo)}m)</span>
                <span className="text-amber-300 ml-1 text-[11px] font-mono">Limit: {nextStation.station.speedLimitKmh} km/h</span>
              </div>
            )}
          </div>
        </div>

        {/* Center: KAVACH Alert Bar (Indian Automatic Train Protection) */}
        {state.kavachAlert && (
          <div className="bg-red-950/95 border-2 border-red-500 text-red-200 font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg animate-bounce">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-xs sm:text-sm">{state.kavachAlert}</span>
          </div>
        )}

        {/* Right: Quick Menu Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 shadow-2xl">
          <button
            onClick={onOpenMap}
            title="Open World GPS Map (M)"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sky-300 transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <MapIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Map</span>
          </button>

          <button
            onClick={onOpenTrainSelector}
            title="Switch Locomotive (T)"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-300 transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">Trains</span>
          </button>

          <button
            onClick={onOpenCareer}
            title="Driver Career & Save"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-emerald-300 transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <span>Career</span>
          </button>

          <button
            onClick={onToggleMute}
            title="Mute / Unmute Audio"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={onOpenHelp}
            title="Controls & Instructions"
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold"
          >
            Help
          </button>
        </div>
      </div>

      {/* FLOATING CAMERA & ENVIRONMENT PILLS (Top Left Under Header) */}
      <div className="flex items-center justify-between w-full pointer-events-auto mt-2">
        {/* Camera Views */}
        <div className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-lg text-xs">
          {(['cab', 'chase', 'orbit', 'railfan', 'window', 'top'] as CameraViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onSetCameraMode(mode)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-all font-medium ${
                cameraMode === mode
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Weather & Time */}
        <div className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-lg text-xs">
          {(['day', 'sunset', 'night', 'monsoon', 'fog'] as WeatherType[]).map((w) => (
            <button
              key={w}
              onClick={() => onSetWeather(w)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-all font-medium ${
                weather === w
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {w === 'monsoon' ? '🌧️ Monsoon' : w === 'fog' ? '🌫️ Fog' : w}
            </button>
          ))}
        </div>
      </div>

      {/* CENTRAL 3D VIEWPORT IS 100% UNOBSTRUCTED */}
      <div className="flex-1" />

      {/* COLLAPSIBLE BOTTOM CONSOLIDATED DOCK */}
      <div className="pointer-events-auto flex flex-col items-center">
        {/* Collapse / Expand Tab */}
        <button
          onClick={() => setHudCollapsed(!hudCollapsed)}
          className="mb-1.5 px-4 py-1 rounded-full bg-slate-900/90 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 backdrop-blur-md transition-transform hover:scale-105"
        >
          {hudCollapsed ? '▲ Show Driver Controls' : '▼ Cinema Mode (Hide HUD)'}
        </button>

        {!hudCollapsed && (
          <div className="w-full max-w-4xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl p-3 shadow-2xl text-white">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              
              {/* SECTION 1: SPEEDOMETER & TELEMETRY (cols 1-4) */}
              <div className="md:col-span-4 flex items-center justify-around bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                {/* Speed Gauge */}
                <div className="text-center">
                  <div className="text-4xl font-black font-mono tracking-tight text-white flex items-baseline justify-center">
                    <span>{speedAbs}</span>
                    <span className="text-xs font-normal text-slate-400 ml-1">km/h</span>
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
                    Speedometer
                  </div>
                  <div className="text-[11px] text-amber-400 font-mono">
                    Max: {cfg.maxSpeedKmh} km/h
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="h-12 w-[1px] bg-slate-800" />

                {/* Signaling & KAVACH Unit */}
                <div className="text-center flex flex-col items-center">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div 
                      className={`w-4 h-4 rounded-full border-2 ${getSignalColor(nextSignal?.aspect)} shadow-md`}
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      {nextSignal?.aspect?.replace('_', ' ') || 'GREEN'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Next Sig: {nextSignal ? `${Math.round(nextSignal.distanceTo)}m` : 'Clear'}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                    KAVACH ACTIVE
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="h-12 w-[1px] bg-slate-800" />

                {/* Tractive Force & Brake Pressure */}
                <div className="text-center text-xs">
                  <div className="text-slate-300 font-mono font-bold">
                    {state.tractiveEffortKn} <span className="text-[10px] text-slate-400">kN</span>
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase">Traction</div>

                  <div className="text-slate-300 font-mono font-bold mt-1">
                    {state.brakePipePressureBar.toFixed(1)} <span className="text-[10px] text-slate-400">bar</span>
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase">Brake Pipe</div>
                </div>
              </div>

              {/* SECTION 2: THROTTLE & BRAKE LEVERS (cols 5-8) */}
              <div className="md:col-span-5 flex flex-col gap-2 bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                {/* Reverser Selector */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">REVERSER:</span>
                  <div className="flex items-center gap-1">
                    {([-1, 0, 1] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => onReverserChange(r)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                          state.reverser === r
                            ? r === 1 ? 'bg-emerald-600 text-white' : r === -1 ? 'bg-amber-600 text-white' : 'bg-slate-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {r === 1 ? 'FWD' : r === 0 ? 'N' : 'REV'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Throttle Notches (0 to 8) */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-emerald-400 font-semibold">THROTTLE (Notch {state.throttleNotch}/8)</span>
                    <span className="text-slate-400">{Math.round((state.throttleNotch / 8) * 100)}%</span>
                  </div>
                  <div className="grid grid-cols-9 gap-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((notch) => (
                      <button
                        key={notch}
                        onClick={() => onThrottleChange(notch)}
                        className={`py-1.5 rounded text-xs font-mono font-bold transition-all ${
                          state.throttleNotch >= notch
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {notch}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Train Brake Lever Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-red-400 font-semibold">TRAIN BRAKE (A9)</span>
                    <span className="text-slate-400 font-mono">{Math.round(state.trainBrake * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={state.trainBrake}
                    onChange={(e) => onBrakeChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>
              </div>

              {/* SECTION 3: HORN & AUXILIARY CONTROLS (cols 9-12) */}
              <div className="md:col-span-3 flex flex-col gap-2">
                {/* BIG INDIAN RAILWAYS DUAL-TONE HORN BUTTON */}
                <button
                  onMouseDown={onHornStart}
                  onMouseUp={onHornStop}
                  onTouchStart={(e) => { e.preventDefault(); onHornStart(); }}
                  onTouchEnd={(e) => { e.preventDefault(); onHornStop(); }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:from-amber-700 active:to-amber-800 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl flex items-center justify-center gap-2 border-2 border-amber-300 transition-all active:scale-95"
                >
                  <Volume2 className="w-5 h-5 fill-slate-950" />
                  <span>DUAL HORN (PEE-POON)</span>
                </button>

                {/* Secondary Toggles (Emergency Brake, Lights, Pantograph, Doors) */}
                <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                  <button
                    onClick={onEmergencyBrake}
                    title="Emergency Brake (X)"
                    className={`p-2 rounded-lg font-bold transition-colors ${
                      state.emergencyBrake ? 'bg-red-600 text-white animate-pulse' : 'bg-red-950 text-red-300 border border-red-800 hover:bg-red-900'
                    }`}
                  >
                    EMG
                  </button>

                  <button
                    onClick={onToggleLights}
                    title="Loco Headlights (L)"
                    className={`p-2 rounded-lg font-semibold flex items-center justify-center ${
                      state.headlights !== 'off' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={onToggleWipers}
                    title="Windshield Wipers (R)"
                    className={`p-2 rounded-lg font-semibold flex items-center justify-center ${
                      state.wipersActive ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Wind className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={onToggleDoors}
                    title="Coach Doors"
                    disabled={speedAbs > 0}
                    className={`p-2 rounded-lg font-semibold text-center ${
                      speedAbs > 0 ? 'bg-slate-900 text-slate-600 cursor-not-allowed' : state.doorsOpen ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {state.doorsOpen ? 'DOORS' : 'DOOR'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
