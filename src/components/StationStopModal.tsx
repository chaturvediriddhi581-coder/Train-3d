import React, { useState } from 'react';
import { StationData } from '../types/game';
import { railAudio } from '../audio/railAudio';
import { progressManager } from '../game/gameProgress';
import { Users, CheckCircle, Volume2, ArrowRight } from 'lucide-react';

interface StationStopModalProps {
  station: StationData;
  trainName: string;
  isCargoTrain: boolean;
  onClose: () => void;
}

export const StationStopModal: React.FC<StationStopModalProps> = ({
  station,
  trainName,
  isCargoTrain,
  onClose,
}) => {
  const [hasBoarded, setHasBoarded] = useState(false);
  const [passengersCount] = useState(Math.floor(180 + Math.random() * 240));
  const [cargoTons] = useState(Math.floor(450 + Math.random() * 300));

  const handleBoarding = () => {
    // Play station chime & synthesized announcement
    railAudio.playStationChime(station.name, trainName, 1);
    progressManager.recordStationStop(
      station.id,
      isCargoTrain ? 0 : passengersCount,
      isCargoTrain ? cargoTons : 0,
      true
    );
    setHasBoarded(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-400/80 rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Yellow Station Header */}
        <div className="bg-amber-400 text-slate-950 p-5 text-center">
          <div className="text-xs uppercase font-extrabold tracking-wider">Indian Railways • भारतीय रेल</div>
          <h2 className="text-2xl font-black">{station.name}</h2>
          <div className="text-sm font-bold opacity-90">{station.hindiName}</div>
          <div className="text-xs font-mono font-bold mt-1 inline-block bg-slate-950 text-amber-300 px-3 py-0.5 rounded">
            PLATFORM 1 • CODE: {station.code}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-xs text-slate-300 leading-relaxed text-center">
            {station.description}
          </div>

          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Assigned Train:</span>
              <span className="font-bold text-amber-300">{trainName}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{isCargoTrain ? 'Cargo Tonnage:' : 'Waiting Passengers:'}</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {isCargoTrain ? `${cargoTons} Tons Coal/Containers` : `${passengersCount} Passengers`}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Stopping Precision:</span>
              <span className="font-bold text-sky-400">Perfect Platform Alignment</span>
            </div>
          </div>

          {!hasBoarded ? (
            <button
              onClick={handleBoarding}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-sm tracking-wide uppercase shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Volume2 className="w-5 h-5" />
              <span>{isCargoTrain ? 'Load Freight & Announce' : 'Open Doors & Board Passengers'}</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="font-bold">Boarding Completed & Chime Broadcasted!</div>
                  <div>Station master signaled All-Right with green flag. +350 Pilot XP awarded!</div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide uppercase shadow-lg flex items-center justify-center gap-2"
              >
                <span>Depart Platform (Proceed)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 bg-slate-950 text-center border-t border-slate-800 text-[11px] text-slate-400">
          Tip: Close doors and advance throttle notch gently to prevent wheel slip.
        </div>

      </div>
    </div>
  );
};
