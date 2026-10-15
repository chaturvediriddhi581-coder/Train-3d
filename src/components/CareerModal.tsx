import React, { useState } from 'react';
import { progressManager } from '../game/gameProgress';
import { PlayerProgress } from '../types/game';
import { X, Award, MapPin, Users, Train, Save, RotateCcw, Check } from 'lucide-react';

interface CareerModalProps {
  onClose: () => void;
}

export const CareerModal: React.FC<CareerModalProps> = ({ onClose }) => {
  const [progress, setProgress] = useState<PlayerProgress>(progressManager.getProgress());
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = () => {
    progressManager.save();
    setSaveMessage('Career progress successfully saved to local device!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your career stats?')) {
      progressManager.reset();
      setProgress(progressManager.getProgress());
      setSaveMessage('Career stats reset to rookie level.');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const nextLevelXp = progress.level * 600;
  const xpPercent = Math.min(100, Math.round((progress.xp / nextLevelXp) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-xl font-bold text-amber-400">Loco Pilot Service Record</h2>
              <p className="text-xs text-slate-400">Indian Railways Driver Dossier & Career Statistics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {saveMessage && (
            <div className="p-3 bg-emerald-950/90 border border-emerald-500 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{saveMessage}</span>
            </div>
          )}

          {/* Pilot Badge Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 font-black text-xl">
              L{progress.level}
            </div>
            <div className="flex-1">
              <div className="text-base font-bold text-white">{progress.pilotName}</div>
              <div className="text-xs text-amber-400 font-medium">{progress.rank}</div>
              {/* XP Progress Bar */}
              <div className="mt-2">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Experience Points</span>
                  <span>{progress.xp} / {nextLevelXp} XP ({xpPercent}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Career Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Train className="w-4 h-4 text-sky-400" /> Total Distance
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {progress.totalDistanceKm.toFixed(1)} <span className="text-xs text-slate-400">km</span>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" /> Passengers Hauled
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {progress.passengersTransported.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" /> Punctual Stops
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {progress.onTimeStops} <span className="text-xs text-slate-400">stations</span>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-400" /> Stations Discovered
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {progress.stationsVisited.length} <span className="text-xs text-slate-400">/ 5</span>
              </div>
            </div>
          </div>

          {/* Save / Reset Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Progress</span>
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-red-950/80 hover:text-red-300 font-semibold text-xs border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
};
