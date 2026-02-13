
import { WorkshopData, Vehicle, Stage } from './types.ts';

const API_KEY = (import.meta as any).env?.VITE_TRELLO_API_KEY || '';
const TOKEN = (import.meta as any).env?.VITE_TRELLO_TOKEN || '';
const BOARD_ID = (import.meta as any).env?.VITE_TRELLO_BOARD_ID || '';

export const fetchWorkshopData = async (): Promise<WorkshopData> => {
  if (!API_KEY || !TOKEN || !BOARD_ID) {
    return { boardName: "Erro: Variáveis não configuradas", vehicles: [] };
  }

  try {
    const [listsRes, cardsRes] = await Promise.all([
      fetch(`https://api.trello.com/1/boards/${BOARD_ID}/lists?key=${API_KEY}&token=${TOKEN}`),
      fetch(`https://api.trello.com/1/boards/${BOARD_ID}/cards?key=${API_KEY}&token=${TOKEN}`)
    ]);

    const lists = await listsRes.json();
    const cards = await cardsRes.json();

    const listMap = lists.reduce((acc: any, list: any) => {
      acc[list.id] = list.name;
      return acc;
    }, {});

    const vehicles: Vehicle[] = cards.map((card: any) => {
      const parts = card.name.split('-').map((p: string) => p.trim());
      return {
        id: card.id,
        model: parts[0] || 'Veículo',
        plate: parts[1] || '---',
        client: parts[2] || 'Cliente',
        stage: (listMap[card.idList] || 'Aguardando Avaliação') as Stage,
        deliveryDate: card.due ? new Date(card.due).toLocaleDateString('pt-BR') : 'A Definir',
        mechanic: card.labels?.[0]?.name || 'Pátio',
        lastActivity: new Date(card.dateLastActivity).toLocaleTimeString()
      };
    });

    return { boardName: "Oficina Rei do ABS", vehicles };
  } catch (error) {
    console.error(error);
    return { boardName: "Erro de Conexão", vehicles: [] };
  }
};
