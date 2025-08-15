
'use server';

import {
  getFactoryCollectionRef,
  getFactoryDocRef,
  getCollectionDocs,
  addDocument,
  updateDocument,
  deleteDocument,
} from './firestoreService';
import type { CheckPoint } from '@/lib/data';
import type { NewCheckPointFormValues } from '@/lib/schemas';

const COLLECTION_NAME = 'checkpoints';

// For now, we'll hardcode the factoryId. In the future, this will come from the user's session.
const MOCK_FACTORY_ID = 'DMF';

/**
 * Fetches all check points for the factory.
 * @returns A promise that resolves to an array of check points with their IDs.
 */
export const getCheckPoints = async (): Promise<(CheckPoint & { id: string })[]> => {
    return getCollectionDocs(getFactoryCollectionPath(MOCK_FACTORY_ID, COLLECTION_NAME));
};

/**
 * Adds a new check point document to the factory's collection.
 * @param data The data for the new check point.
 * @returns A promise that resolves to the newly created document's ID.
 */
export const addCheckPoint = async (data: NewCheckPointFormValues): Promise<string> => {
    const docRef = await addDocument(getFactoryCollectionPath(MOCK_FACTORY_ID, COLLECTION_NAME), data);
    return docRef.id;
};

/**
 * Updates an existing check point document.
 * @param id The ID of the check point to update.
 * @param data The data to update.
 * @returns A promise that resolves when the update is complete.
 */
export const updateCheckPoint = async (id: string, data: Partial<NewCheckPointFormValues>): Promise<void> => {
    return updateDocument(getFactoryCollectionPath(MOCK_FACTORY_ID, COLLECTION_NAME), id, data);
};

/**
 * Deletes a check point document by its ID.
 * @param id The ID of the check point to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export const deleteCheckPoint = async (id: string): Promise<void> => {
    return deleteDocument(getFactoryCollectionPath(MOCK_FACTORY_ID, COLLECTION_NAME), id);
};
