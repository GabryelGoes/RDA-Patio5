
import React from 'react';
import { Vehicle, Stage } from './types.ts';

interface VehicleRowProps {
  vehicle: Vehicle;
}

const getStageColors = (stage: Stage) => {
  const s = stage.toLowerCase();
  if (s.includes('garantia')) return 'bg-red-600 text-white border-red-500';
  if (s.includes('avaliação') && s.includes('aguardando')) return 'bg-zinc-900 text-zinc-400 border-zinc-800';
  if (s.includes('avaliação') || s.includes('aprovação')) return 'bg-yellow-400 text-yellow-950 border-yellow-300';
  if (s.includes('aprovado') || s.includes('serviço')) return 'bg-orange-500 text-white border-orange-400';
  if (s.includes('peças')) return 'bg-blue-600 text-white border-blue-500';
  if (s.includes('teste')) return 'bg-emerald-300 text-emerald-950 border-emerald-200';
  if (s.includes('finalizado')) return 'bg-green-800 text-white border-green-700';
  if (s.includes('não aprovado')) return 'bg-purple-700 text-white border-purple-600';
  
  return 'bg-zinc-800 text-white border-zinc-700';
};

const VehicleRow: React.FC<VehicleRowProps> = ({ vehicle }) => {
  const colorClass = getStageColors(vehicle.stage);
  
  const getDisplayStage = (stage: string) => {
    if (stage.toLowerCase().includes('não aprovado')) return 'Nao Aprovado';
    return stage;
  };

  const getModelOnly = (fullModel: string) => {
    return fullModel.replace('Land Rover', '').trim();
  };

  const modelOnly = getModelOnly(vehicle.model);
  const displayStage = getDisplayStage(vehicle.stage);
  const firstName = vehicle.mechanic.split(' ')[0];

  return (
    <div className={`flex items-center w-full flex-1 rounded-[24px] border px-8 transition-all duration-700 shadow-xl overflow-hidden ${colorClass}`}>
      <div className="w-[22%] flex flex-col justify-center py-1">
        <h2 className="text-3xl font-black tracking-tighter truncate leading-none uppercase italic">
          {modelOnly}
        </h2>
        <span className="text-[10px] font-bold opacity-60 mt-1 uppercase tracking-[0.3em]">{vehicle.plate}</span>
      </div>

      <div className="w-[16%] flex flex-col justify-center border-l border-current/10 pl-6 py-1">
        <p className="text-xl font-bold truncate uppercase leading-tight tracking-tight">{vehicle.client}</p>
      </div>

      <div className="w-[34%] flex flex-col justify-center border-l border-current/10 pl-6 py-1">
        <div className="flex items-center gap-3">
          {vehicle.stage.toLowerCase().includes('serviço') && (
            <div className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </div>
          )}
          <p className={`font-black uppercase italic tracking-tighter leading-none truncate ${displayStage.length > 15 ? 'text-2xl' : 'text-3xl'}`}>
            {displayStage}
          </p>
        </div>
      </div>

      <div className="w-[14%] flex flex-col justify-center border-l border-current/10 pl-6 py-1">
        <p className="text-2xl font-black uppercase leading-none truncate tracking-tighter">
          {vehicle.deliveryDate}
        </p>
      </div>

      <div className="w-[14%] flex flex-col justify-center border-l border-current/10 pl-6 py-1">
        <p className="text-xl font-bold uppercase truncate leading-none tracking-tight">{firstName}</p>
      </div>
    </div>
  );
};

export default VehicleRow;
