import React from 'react';
import { X, Smartphone, Keyboard, ShieldAlert, Award } from 'lucide-react';

interface InstructionsModalProps {
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-xl font-bold text-amber-400">Loco Pilot Operating Handbook</h2>
            <p className="text-xs text-slate-400">Indian Railways Driver Controls & Signal Guidelines</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Mobile Touch Controls Section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2 mb-3">
              <Smartphone className="w-4 h-4" /> Touch Controls (Mobile / Tablet)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-amber-300">Dual-Tone Horn:</span>
                <p className="text-slate-400 mt-1">Press and hold the big yellow button on the bottom right for the authentic Indian Railways "Pee-Poon" pneumatic horn.</p>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-emerald-300">Throttle & Brake:</span>
                <p className="text-slate-400 mt-1">Tap notches 0 through 8 to apply tractive power. Drag the red Train Brake slider to apply service air brakes.</p>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-sky-300">Camera Orbit:</span>
                <p className="text-slate-400 mt-1">Touch and drag across the 3D scene to look around in cab view or orbit around the train in external views.</p>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-purple-300">Camera & Views:</span>
                <p className="text-slate-400 mt-1">Tap the top pills to switch between Cab (1st person), Follow, Orbit, Railfan Flyby, Window, and Top-Down view.</p>
              </div>
            </div>
          </div>

          {/* Desktop Keyboard Controls Section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-3">
              <Keyboard className="w-4 h-4" /> Keyboard Shortcuts (Desktop / Laptop)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Throttle Up:</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono font-bold text-amber-300 border border-slate-700">W / ↑</kbd>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Throttle Down:</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono font-bold text-amber-300 border border-slate-700">S / ↓</kbd>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Pneumatic Horn:</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono font-bold text-amber-300 border border-slate-700">H / Space</kbd>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Train Brake:</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono font-bold text-amber-300 border border-slate-700">B</kbd>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Emergency Brake:</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono font-bold text-red-400 border border-slate-700">X</kbd>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Cycle Camera:</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono font-bold text-sky-300 border border-slate-700">C</kbd>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Open World Map:</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono font-bold text-sky-300 border border-slate-700">M</kbd>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Switch Locomotive:</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono font-bold text-amber-300 border border-slate-700">T</kbd>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Headlights:</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded font-mono font-bold text-slate-200 border border-slate-700">L</kbd>
              </div>
            </div>
          </div>

          {/* Railway Rules & Signaling */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Indian Railways Signaling & KAVACH Rules
            </h4>
            <ul className="space-y-1 text-slate-300 list-disc list-inside">
              <li><strong className="text-emerald-400">Green Signal:</strong> Clear track. Proceed at normal authorized line speed.</li>
              <li><strong className="text-amber-400">Yellow / Double Yellow:</strong> Caution! Next signal may be red. Reduce speed below 50 km/h.</li>
              <li><strong className="text-red-400">Red Signal:</strong> Danger! Train must stop completely before the signal. KAVACH automatic train protection will trip the emergency brake if you pass at danger.</li>
              <li><strong className="text-sky-400">Platform Boarding:</strong> Bring the train to a complete stop next to station platforms to trigger passenger boarding and earn pilot XP.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wide"
          >
            Start Driving
          </button>
        </div>

      </div>
    </div>
  );
};
