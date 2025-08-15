
'use server';

import {
  getCollectionDocs,
  addDocument,
  updateDocument,
  deleteDocument,
} from './firestoreService';
import type { CheckPoint } from '@/lib/data';
import type { NewCheckPointFormValues } from '@/lib/schemas';
import { useGlobalSettingsStore } from '@/lib/store';

const COLLECTION_NAME = 'checkpoints';

/**
 * Helper function to get the current factory ID from the global store.
 * This is a placeholder for a more robust session/auth-based approach in the future.
 */
const getCurrentFactoryId = (): string => {
  // IMPORTANT: This uses the Zustand store's server-side instance.
  // This approach is simplified for this development stage.
  // In a production app, the user's factory would come from their authenticated session.
  const factoryId = useGlobalSettingsStore.getState().selectedFactory;
  if (!factoryId) {
    // This provides a default but also signals a potential issue if the factory isn't set.
    console.warn("No factory selected, defaulting to 'DMF'. This may not be correct.");
    return 'DMF';
  }
  return factoryId;
};

/**
 * Gets the full collection path for the current factory's checkpoints.
 */
const getCheckPointsCollectionPath = (): string => {
    const factoryId = getCurrentFactoryId();
    return `factories/${factoryId}/${COLLECTION_NAME}`;
}

/**
 * Fetches all check points for the factory.
 * @returns A promise that resolves to an array of check points with their IDs.
 */
export const getCheckPoints = async (): Promise<(CheckPoint & { id: string })[]> => {
    return getCollectionDocs(getCheckPointsCollectionPath());
};

/**
 * Adds a new check point document to the factory's collection.
 * @param data The data for the new check point.
 * @returns A promise that resolves to the newly created document's ID.
 */
export const addCheckPoint = async (data: NewCheckPointFormValues): Promise<string> => {
    const docRef = await addDocument(getCheckPointsCollectionPath(), data);
    return docRef.id;
};

/**
 * Updates an existing check point document.
 * @param id The ID of the check point to update.
 * @param data The data to update.
 * @returns A promise that resolves when the update is complete.
 */
export const updateCheckPoint = async (id: string, data: Partial<NewCheckPointFormValues>): Promise<void> => {
    return updateDocument(getCheckPointsCollectionPath(), id, data);
};

/**
 * Deletes a check point document by its ID.
 * @param id The ID of the check point to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export const deleteCheckPoint = async (id: string): Promise<void> => {
    return deleteDocument(getCheckPointsCollectionPath(), id);
};
