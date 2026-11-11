import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    collection: vi.fn(() => 'tasks-collection'),
    addDoc: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
    getDocs: vi.fn(),
    onSnapshot: vi.fn(),
    query: vi.fn(),
    serverTimestamp: vi.fn(),
    updateDoc: vi.fn(),
    where: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
    addDoc: mocks.addDoc,
    collection: mocks.collection,
    deleteDoc: mocks.deleteDoc,
    doc: mocks.doc,
    getDocs: mocks.getDocs,
    onSnapshot: mocks.onSnapshot,
    query: mocks.query,
    serverTimestamp: mocks.serverTimestamp,
    updateDoc: mocks.updateDoc,
    where: mocks.where,
    Timestamp: class Timestamp { },
}))

vi.mock('../src/services/firebase', () => ({
    db: {},
}))

mocks.collection.mockReturnValue('tasks-collection')

import {
    createTask,
    deleteTask,
    getTasks,
    subscribeToTasks,
    toggleTaskCompleted,
    updateTask,
} from '../src/features/tasks/taskService'

describe('taskService', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        mocks.collection.mockReturnValue('tasks-collection')
        mocks.query.mockReturnValue('tasks-query')
        mocks.where.mockReturnValue('user-filter')
        mocks.doc.mockReturnValue('task-reference')
        mocks.serverTimestamp.mockReturnValue('server-timestamp')
    })

    it('debe consultar las tareas filtradas por usuario', async () => {
        mocks.getDocs.mockResolvedValue({
            docs: [
                {
                    id: 'task-1',
                    data: () => ({
                        userId: 'user-1',
                        title: 'Estudiar React',
                        description: 'Practicar componentes',
                        completed: false,
                    }),
                },
            ],
        })

        const result = await getTasks('user-1')

        expect(mocks.where).toHaveBeenCalledWith(
            'userId',
            '==',
            'user-1',
        )
        expect(mocks.query).toHaveBeenCalledWith(
            'tasks-collection',
            'user-filter',
        )
        expect(result).toHaveLength(1)
        expect(result[0].title).toBe('Estudiar React')
        expect(result[0].userId).toBe('user-1')
        expect(result[0].createdAt).toBeInstanceOf(Date)
    })

    it('debe crear una tarea con el usuario correspondiente', async () => {
        mocks.addDoc.mockResolvedValue({ id: 'task-1' })

        await createTask('user-1', {
            title: 'Estudiar React',
            description: 'Practicar componentes',
        })

        expect(mocks.addDoc).toHaveBeenCalledWith(
            'tasks-collection',
            expect.objectContaining({
                userId: 'user-1',
                title: 'Estudiar React',
                description: 'Practicar componentes',
                completed: false,
                createdAt: 'server-timestamp',
                updatedAt: 'server-timestamp',
            }),
        )
    })

    it('debe actualizar una tarea', async () => {
        await updateTask('task-1', {
            title: 'Nuevo título',
            description: 'Nueva descripción',
        })

        expect(mocks.doc).toHaveBeenCalledWith(
            {},
            'tasks',
            'task-1',
        )

        expect(mocks.updateDoc).toHaveBeenCalledWith(
            'task-reference',
            expect.objectContaining({
                title: 'Nuevo título',
                description: 'Nueva descripción',
                updatedAt: 'server-timestamp',
            }),
        )
    })

    it('debe cambiar el estado de una tarea', async () => {
        await toggleTaskCompleted('task-1', true)

        expect(mocks.updateDoc).toHaveBeenCalledWith(
            'task-reference',
            {
                completed: true,
                updatedAt: 'server-timestamp',
            },
        )
    })

    it('debe eliminar una tarea', async () => {
        await deleteTask('task-1')

        expect(mocks.doc).toHaveBeenCalledWith(
            {},
            'tasks',
            'task-1',
        )

        expect(mocks.deleteDoc).toHaveBeenCalledWith(
            'task-reference',
        )
    })

    it('debe recibir cambios en tiempo real y permitir cancelar la suscripción', () => {
        const unsubscribe = vi.fn()
        const onTasksChange = vi.fn()

        mocks.onSnapshot.mockImplementation((_query, callback) => {
            callback({
                docs: [
                    {
                        id: 'task-1',
                        data: () => ({
                            userId: 'user-1',
                            title: 'Estudiar React',
                            description: 'Practicar componentes',
                            completed: false,
                        }),
                    },
                ],
            })

            return unsubscribe
        })

        const result = subscribeToTasks('user-1', onTasksChange)

        expect(mocks.where).toHaveBeenCalledWith(
            'userId',
            '==',
            'user-1',
        )

        expect(onTasksChange).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    id: 'task-1',
                    title: 'Estudiar React',
                    userId: 'user-1',
                }),
            ]),
        )

        expect(result).toBe(unsubscribe)

        result()

        expect(unsubscribe).toHaveBeenCalledOnce()
    })
})