import React from "react";
import { X, BookOpen, ArrowRight, ShieldAlert, Sparkles, FileText, CheckCircle, PlusCircle, Code2 } from "lucide-react";
import { BENCHMARK_PRESETS } from "../data/benchmarkPresets";
import { BenchmarkPreset } from "../types";

interface PresetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: BenchmarkPreset) => void;
  onCustomBlank?: () => void;
  onCodePreset?: () => void;
}

export const PresetSelectorModal: React.FC<PresetSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  onCustomBlank,
  onCodePreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#141414]/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#141414] overflow-hidden text-[#141414]">
        {/* Header */}
        <div className="p-4 border-b border-[#141414] flex items-center justify-between bg-[#E4E3E0]">
          <div className="flex items-center space-x-2.5">
            <div>
              <span className="uppercase font-bold text-[10px] tracking-widest opacity-60 block">
                Benchmark &amp; Scenario Library
              </span>
              <h3 className="text-sm font-bold uppercase font-mono text-[#141414]">
                Select Benchmark Scenario or Enter Custom
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-[#141414] bg-white p-1 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Presets List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-[#F5F5F3]">
          {/* Quick Custom Launchers */}
          <div className="p-3 border border-[#141414] bg-[#E4E3E0] space-y-2">
            <span className="font-mono text-[9px] uppercase font-bold text-[#141414]/70 block">
              CUSTOM WORKSPACE &amp; VERBATIM OPTIONS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {onCustomBlank && (
                <button
                  type="button"
                  id="btn-modal-custom-blank"
                  onClick={() => {
                    onCustomBlank();
                    onClose();
                  }}
                  className="p-2.5 border border-[#141414] bg-white hover:bg-[#141414] hover:text-[#E4E3E0] text-left transition-colors flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold flex items-center gap-1.5">
                      <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Custom Blank Input
                    </span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <p className="font-serif italic text-[11px] opacity-75">
                    Start with empty context and prompt boxes to test your own documents and queries.
                  </p>
                </button>
              )}

              {onCodePreset && (
                <button
                  type="button"
                  id="btn-modal-code-preset"
                  onClick={() => {
                    onCodePreset();
                    onClose();
                  }}
                  className="p-2.5 border border-[#141414] bg-white hover:bg-[#141414] hover:text-[#E4E3E0] text-left transition-colors flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-blue-600" />
                      Code Verbatim Test
                    </span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <p className="font-serif italic text-[11px] opacity-75">
                    Check verbatim reproduction of code blocks with zero hallucination penalty.
                  </p>
                </button>
              )}
            </div>
          </div>

          <span className="font-mono text-[9px] uppercase font-bold text-[#141414]/70 block pt-1">
            STANDARD CURATED SCENARIOS
          </span>

          {BENCHMARK_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="p-3.5 border border-[#141414] bg-white flex flex-col justify-between gap-2.5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-[#141414]">
                      {preset.title}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 font-mono font-bold uppercase border border-[#141414] bg-[#E4E3E0] text-[#141414]">
                      {preset.category}
                    </span>
                  </div>
                </div>

                <p className="font-serif italic text-xs text-[#141414]/80 mb-2">
                  {preset.description}
                </p>

                <div className="bg-[#F5F5F3] p-2 border border-[#141414]/30 font-mono text-[10px] text-[#141414]">
                  <strong className="uppercase font-bold text-[9px] opacity-60 block mb-0.5">Expected Grounded Behavior:</strong>
                  {preset.expectedBehavior}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#141414]/15">
                <span className="font-mono text-[10px] text-[#141414]/60">
                  {preset.context.split(/\s+/).length} words reference context
                </span>
                <button
                  type="button"
                  id={`btn-select-preset-${preset.id}`}
                  onClick={() => {
                    onSelectPreset(preset);
                    onClose();
                  }}
                  className="border border-[#141414] bg-[#141414] text-white hover:bg-[#141414]/90 px-3 py-1 font-bold uppercase text-[9px] tracking-wider transition-colors flex items-center gap-1.5"
                >
                  <span>LOAD BENCHMARK</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#141414] bg-[#E4E3E0] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="border border-[#141414] bg-white px-3 py-1 text-[10px] uppercase font-bold hover:bg-[#F5F5F3]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
