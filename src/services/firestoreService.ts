// This file will contain the core logic for interacting with Firestore.
// We will build this out in the next steps.

import { db } from '@/lib/firebase';
import { 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    addDoc, 
    setDoc, 
    deleteDoc, 
    query, 
    where,
    DocumentData,
    CollectionReference,
    DocumentReference,
    WriteBatch,
    writeBatch
} from 'firebase/firestore';

// =================================================================
// Generic Firestore Interaction Functions
// =================================================================

/**
 * Creates a typed Firestore converter for a given type T.
 * This ensures type safety when reading from and writing to Firestore.
 */
const converter = <T>() => ({
    toFirestore: (data: Partial<T>): DocumentData => data as DocumentData,
    fromFirestore: (snapshot: any, options: any): T => {
        const data = snapshot.data(options) as T;
        return data;
    },
});

/**
 * Creates a typed reference to a Firestore collection.
 * @param collectionName The name of the collection.
 */
const getCollectionRef = <T>(collectionName: string) => 
    collection(db, collectionName).withConverter(converter<T>());

/**
 * Creates a typed reference to a Firestore document.
 * @param collectionName The name of the collection.
 * @param id The ID of the document.
 */
const getDocRef = <T>(collectionName: string, id: string) =>
    doc(db, collectionName, id).withConverter(converter<T>());

/**
 * Fetches all documents from a specified collection.
 * @param collectionName The name of the collection.
 * @returns A promise that resolves to an array of documents with their IDs.
 */
export const getCollectionDocs = async <T>(collectionName: string): Promise<(T & { id: string })[]> => {
    const colRef = getCollectionRef<T>(collectionName);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Fetches a single document by its ID from a specified collection.
 * @param collectionName The name of the collection.
 * @param id The ID of the document to fetch.
 * @returns A promise that resolves to the document data with its ID, or null if not found.
 */
export const getDocument = async <T>(collectionName: string, id: string): Promise<(T & { id: string }) | null> => {
    const docRef = getDocRef<T>(collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
};

/**
 * Adds a new document to a specified collection.
 * @param collectionName The name of the collection.
 * @param data The data for the new document.
 * @returns A promise that resolves to the newly created document's reference.
 */
export const addDocument = async <T>(collectionName: string, data: T): Promise<DocumentReference<T>> => {
    const colRef = getCollectionRef<T>(collectionName);
    return addDoc(colRef, data);
};

/**
 * Updates an existing document in a specified collection.
 * @param collectionName The name of the collection.
 * @param id The ID of the document to update.
 * @param data The data to update, can be partial.
 * @returns A promise that resolves when the update is complete.
 */
export const updateDocument = async <T>(collectionName: string, id: string, data: Partial<T>): Promise<void> => {
    const docRef = getDocRef<T>(collectionName, id);
    return setDoc(docRef, data, { merge: true });
};

/**
 * Deletes a document from a specified collection by its ID.
 * @param collectionName The name of the collection.
 * @param id The ID of the document to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export const deleteDocument = async (collectionName: string, id: string): Promise<void> => {
    const docRef = getDocRef<any>(collectionName, id);
    return deleteDoc(docRef);
};

/**
 * Creates and returns a new WriteBatch instance.
 */
export const createBatch = (): WriteBatch => writeBatch(db);

// =================================================================
// Path Helper Functions (for structured, multi-factory data)
// =================================================================

/**
 * Gets the path for a factory-specific collection.
 * @param factoryId The ID of the factory (e.g., 'DMF').
 * @param collectionName The name of the sub-collection (e.g., 'machines').
 * @returns The full path to the sub-collection.
 */
export const getFactoryCollectionPath = (factoryId: string, collectionName: string): string => {
    return `factories/${factoryId}/${collectionName}`;
};

/**
 * Gets a typed reference to a factory-specific collection.
 * @param factoryId The ID of the factory.
 * @param collectionName The name of the sub-collection.
 */
export const getFactoryCollectionRef = <T>(factoryId: string, collectionName: string) => {
    return getCollectionRef<T>(getFactoryCollectionPath(factoryId, collectionName));
};

/**
 * Gets a typed reference to a document within a factory-specific collection.
 * @param factoryId The ID of the factory.
 * @param collectionName The name of the sub-collection.
 * @param docId The ID of the document.
 */
export const getFactoryDocRef = <T>(factoryId: string, collectionName: string, docId: string) => {
    return getDocRef<T>(getFactoryCollectionPath(factoryId, collectionName), docId);
};
