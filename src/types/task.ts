export interface Task {
    id: string;
    userId: string;
    title: string;
    description: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateTaskData {
    title: string;
    description: string;
}

export interface UpdateTaskData {
    title: string;
    description: string;
}