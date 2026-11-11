import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where,
    type DocumentData,
    type Unsubscribe,
} from "firebase/firestore";

import { db } from "../../services/firebase";
import type { Task, CreateTaskData, UpdateTaskData } from "../../types/task";

const tasksCollection = collection(db, "tasks");

const mapTask = (document: DocumentData): Task => {
    const data = document.data();

    return {
        id: document.id,
        userId: data.userId,
        title: data.title,
        description: data.description,
        completed: data.completed,
        createdAt: data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate()
            : new Date(),
    };
};

export const getTasks = async (userId: string): Promise<Task[]> => {
    const tasksQuery = query(
        tasksCollection,
        where("userId", "==", userId)
    );

    const snapshot = await getDocs(tasksQuery);

    return snapshot.docs.map(mapTask);
};

export const createTask = async (
    userId: string,
    taskData: CreateTaskData
): Promise<void> => {
    await addDoc(tasksCollection, {
        ...taskData,
        userId,
        completed: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
};

export const updateTask = async (
    taskId: string,
    taskData: UpdateTaskData
): Promise<void> => {
    const taskReference = doc(db, "tasks", taskId);

    await updateDoc(taskReference, {
        ...taskData,
        updatedAt: serverTimestamp(),
    });
};

export const toggleTaskCompleted = async (
    taskId: string,
    completed: boolean
): Promise<void> => {
    const taskReference = doc(db, "tasks", taskId);

    await updateDoc(taskReference, {
        completed,
        updatedAt: serverTimestamp(),
    });
};

export const deleteTask = async (taskId: string): Promise<void> => {
    const taskReference = doc(db, "tasks", taskId);

    await deleteDoc(taskReference);
};

export const subscribeToTasks = (
    userId: string,
    onTasksChange: (tasks: Task[]) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const tasksQuery = query(
        tasksCollection,
        where("userId", "==", userId)
    );

    return onSnapshot(
        tasksQuery,
        (snapshot) => {
            onTasksChange(snapshot.docs.map(mapTask));
        },
        (error) => {
            onError?.(error);
        }
    );
};