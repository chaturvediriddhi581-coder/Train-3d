import React from 'react';
import { TrainType } from '../types/game';
import { TRAIN_CONFIGS } from '../game/trainModels';
import { X, Check, Zap, Gauge, Weight, ShieldCheck } from 'lucide-react';

interface TrainSelectorModalProps {
  currentTrain: TrainType;
  onSelectTrain: (train: TrainType) => void;
  onClose: () => void;
}

export const TrainSelectorModal: React.FC<TrainSelectorModalProps> = ({
  currentTrain,
  onSelectTrain,
  onClose,
}) => {
  const trainsList = Object.values(TRAIN_CONFIGS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-xl font-bold text-amber-400">Indian Railways Locomotive Depot</h2>
            <p className="text-xs text-slate-400">Select your preferred trainset or heavy hauler for free-roam driving</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Train Cards List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainsList.map((cfg) => {
              const isSelected = currentTrain === cfg.id;

              return (
                <div
                  key={cfg.id}
                  onClick={() => onSelectTrain(cfg.id)}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col justify-between relative overflow-hidden ${
                    isSelected
                      ? 'border-amber-400 bg-slate-800/90 shadow-xl ring-2 ring-amber-400/20'
                      : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  {/* Category Pill */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                      {cfg.category}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                        <Check className="w-4 h-4" /> Active Train
                      </span>
                    )}
                  </div>

                  {/* Title & Lore */}
                  <div>
                    <h3 className="text-lg font-bold text-white">{cfg.name}</h3>
                    <div className="text-xs font-medium text-amber-300/80 mb-2">{cfg.hindiName}</div>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-4">
                      {cfg.description}
                    </p>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-center mb-4">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                        <Gauge className="w-3 h-3 text-sky-400" /> Top Speed
                      </div>
                      <div className="text-sm font-bold font-mono text-white mt-0.5">{cfg.maxSpeedKmh} <span className="text-[10px]">km/h</span></div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                        <Zap className="w-3 h-3 text-amber-400" /> Power
                      </div>
                      <div className="text-sm font-bold font-mono text-white mt-0.5">{cfg.horsepower} <span className="text-[10px]">HP</span></div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                        <Weight className="w-3 h-3 text-emerald-400" /> Mass
                      </div>
                      <div className="text-sm font-bold font-mono text-white mt-0.5">{cfg.weightTons} <span className="text-[10px]">tons</span></div>
                    </div>
                  </div>

                  {/* Select Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTrain(cfg.id);
                      onClose();
                    }}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                  >
                    {isSelected ? 'Currently Driving' : 'Drive This Train'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>All locomotives equipped with KAVACH automatic train protection system.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium"
          >
            Close Depot
          </button>
        </div>

      </div>
    </div>
  );
};
