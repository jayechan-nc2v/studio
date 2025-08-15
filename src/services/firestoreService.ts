// This file will contain the core logic for interacting with Firestore.
// We will build this out in the next steps.

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, setDoc, deleteDoc, query, where } from 'firebase/firestore';

// Example function to get all documents from a collection
export const getCollection = async (collectionName: string) => {
    const col = collection(db, collectionName);
    const snapshot = await getDocs(col);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
