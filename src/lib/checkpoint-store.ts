
import { create } from 'zustand';
import type { NewCheckPointFormValues } from '@/lib/schemas';
import { type CheckPoint } from '@/lib/data';
import * as checkPointService from '@/services/checkPointService';

// Store for Check Points
interface CheckPointState {
    checkPoints: CheckPoint[];
    loading: boolean;
    error: string | null;
    fetchCheckPoints: (factoryId: string) => Promise<void>;
    addCheckPoint: (factoryId: string, data: NewCheckPointFormValues) => Promise<void>;
    updateCheckPoint: (factoryId: string, id: string, data: NewCheckPointFormValues) => Promise<void>;
    deleteCheckPoint: (factoryId: string, id: string) => Promise<void>;
}

export const useCheckPointStore = create<CheckPointState>((set, get) => ({
    checkPoints: [],
    loading: false,
    error: null,
    fetchCheckPoints: async (factoryId) => {
        set({ loading: true, error: null });
        try {
            const data = await checkPointService.getCheckPoints(factoryId);
            set({ checkPoints: data, loading: false });
        } catch (error) {
            set({ error: "Failed to fetch check points.", loading: false });
        }
    },
    addCheckPoint: async (factoryId, data) => {
        const newId = await checkPointService.addCheckPoint(factoryId, data);
        const newCheckPoint = { id: newId, ...data };
        set((state) => ({ checkPoints: [newCheckPoint, ...state.checkPoints] }));
    },
    updateCheckPoint: async (factoryId, id, data) => {
        await checkPointService.updateCheckPoint(factoryId, id, data);
        set((state) => ({
            checkPoints: state.checkPoints.map(cp => 
                cp.id === id ? { ...cp, ...data } : cp
            )
        }));
    },
    deleteCheckPoint: async (factoryId, id) => {
        await checkPointService.deleteCheckPoint(factoryId, id);
        set((state) => ({
            checkPoints: state.checkPoints.filter(cp => cp.id !== id)
        }));
    }
}));
