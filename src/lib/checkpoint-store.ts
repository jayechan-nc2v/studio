
import { create } from 'zustand';
import type { NewCheckPointFormValues } from '@/lib/schemas';
import { type CheckPoint } from '@/lib/data';
import * as checkPointService from '@/services/checkPointService';

// Store for Check Points
interface CheckPointState {
    checkPoints: CheckPoint[];
    loading: boolean;
    error: string | null;
    fetchCheckPoints: () => Promise<void>;
    addCheckPoint: (data: NewCheckPointFormValues) => Promise<void>;
    updateCheckPoint: (id: string, data: NewCheckPointFormValues) => Promise<void>;
    deleteCheckPoint: (id: string) => Promise<void>;
}

export const useCheckPointStore = create<CheckPointState>((set, get) => ({
    checkPoints: [],
    loading: false,
    error: null,
    fetchCheckPoints: async () => {
        set({ loading: true, error: null });
        try {
            const data = await checkPointService.getCheckPoints();
            set({ checkPoints: data, loading: false });
        } catch (error) {
            set({ error: "Failed to fetch check points.", loading: false });
        }
    },
    addCheckPoint: async (data) => {
        const newId = await checkPointService.addCheckPoint(data);
        const newCheckPoint = { id: newId, ...data };
        set((state) => ({ checkPoints: [newCheckPoint, ...state.checkPoints] }));
    },
    updateCheckPoint: async (id, data) => {
        await checkPointService.updateCheckPoint(id, data);
        set((state) => ({
            checkPoints: state.checkPoints.map(cp => 
                cp.id === id ? { ...cp, ...data } : cp
            )
        }));
    },
    deleteCheckPoint: async (id) => {
        await checkPointService.deleteCheckPoint(id);
        set((state) => ({
            checkPoints: state.checkPoints.filter(cp => cp.id !== id)
        }));
    }
}));
