
'use server';

import {
  addDocument,
  deleteDocument,
  getCollectionDocs,
  getFactoryCollectionPath,
  updateDocument,
} from './firestoreService';
import type { CheckPoint } from '@/lib/data';
import type { NewCheckPointFormValues } from '@/lib/schemas';

const COLLECTION_NAME = 'checkpoints';

/**
 * Gets the full collection path for a specific factory's checkpoints.
 * @param factoryId The ID of the factory (e.g., 'DMF').
 * @returns The full path to the collection.
 */
const getCheckPointsCollectionPath = (factoryId: string): string => {
    if (!factoryId) {
        throw new Error("Factory ID is required to interact with checkpoints.");
    }
    return getFactoryCollectionPath(factoryId, COLLECTION_NAME);
}

/**
 * Fetches all check points for a given factory.
 * @param factoryId The ID of the factory.
 * @returns A promise that resolves to an array of check points with their IDs.
 */
export const getCheckPoints = async (factoryId: string): Promise<(CheckPoint & { id: string })[]> => {
    const path = getCheckPointsCollectionPath(factoryId);
    return getCollectionDocs(path);
};

/**
 * Adds a new check point document to a factory's collection.
 * @param factoryId The ID of the factory.
 * @param data The data for the new check point.
 * @returns A promise that resolves to the newly created document's ID.
 */
export const addCheckPoint = async (factoryId: string, data: NewCheckPointFormValues): Promise<string> => {
    const path = getCheckPointsCollectionPath(factoryId);
    const docRef = await addDocument(path, data);
    return docRef.id;
};

/**
 * Updates an existing check point document in a factory's collection.
 * @param factoryId The ID of the factory.
 * @param id The ID of the check point to update.
 * @param data The data to update.
 * @returns A promise that resolves when the update is complete.
 */
export const updateCheckPoint = async (factoryId: string, id: string, data: Partial<NewCheckPointFormValues>): Promise<void> => {
    const path = getCheckPointsCollectionPath(factoryId);
    return updateDocument(path, id, data);
};

/**
 * Deletes a check point document by its ID from a factory's collection.
 * @param factoryId The ID of the factory.
 * @param id The ID of the check point to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export const deleteCheckPoint = async (factoryId: string, id: string): Promise<void> => {
    const path = getCheckPointsCollectionPath(factoryId);
    return deleteDocument(path, id);
};
