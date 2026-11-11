import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import Tasks from "../src/pages/Tasks";

const mocks = vi.hoisted(() => ({
    logout: vi.fn(),
    createTask: vi.fn(),
    deleteTask: vi.fn(),
    getTasks: vi.fn(),
    subscribeToTasks: vi.fn(),
    toggleTaskCompleted: vi.fn(),
    updateTask: vi.fn(),
    useAuth: vi.fn(),
}));

vi.mock("../src/features/auth/AuthContext", () => ({
    useAuth: mocks.useAuth,
}));

vi.mock("../src/features/auth/authService", () => ({
    logout: mocks.logout,
}));

vi.mock("../src/features/tasks/taskService", () => ({
    createTask: mocks.createTask,
    deleteTask: mocks.deleteTask,
    getTasks: mocks.getTasks,
    subscribeToTasks: mocks.subscribeToTasks,
    toggleTaskCompleted: mocks.toggleTaskCompleted,
    updateTask: mocks.updateTask,
}));

const mockUser = {
    uid: "user-1",
    email: "usuario@matecode.com",
};

const mockTask = {
    id: "task-1",
    userId: "user-1",
    title: "Estudiar React",
    description: "Practicar componentes",
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
};

describe("Componente Tasks", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.useAuth.mockReturnValue({ user: mockUser });

        mocks.getTasks.mockResolvedValue([]);

        mocks.subscribeToTasks.mockImplementation((_userId, onTasksChange) => {
            onTasksChange([]);
            return vi.fn();
        });

        mocks.createTask.mockResolvedValue(undefined);
        mocks.deleteTask.mockResolvedValue(undefined);
        mocks.toggleTaskCompleted.mockResolvedValue(undefined);
        mocks.updateTask.mockResolvedValue(undefined);
        mocks.logout.mockResolvedValue(undefined);
    });

    it("debe mostrar el correo del usuario", async () => {
        render(<Tasks />);

        await screen.findByText("¡Todo listo para empezar!");

        expect(
            screen.getByText(/usuario@matecode\.com/)
        ).toBeInTheDocument();
    });

    it("debe mostrar un mensaje cuando no hay tareas", async () => {
        render(<Tasks />);

        expect(
            await screen.findByText("¡Todo listo para empezar!")
        ).toBeInTheDocument();
    });

    it("debe mostrar las tareas del usuario", async () => {
        mocks.subscribeToTasks.mockImplementation((_userId, onTasksChange) => {
            onTasksChange([mockTask]);
            return vi.fn();
        });

        render(<Tasks />);

        expect(
            await screen.findByText("Estudiar React")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Practicar componentes")
        ).toBeInTheDocument();
    });

    it("debe crear una tarea", async () => {
        render(<Tasks />);

        fireEvent.change(screen.getByLabelText("Título"), {
            target: { value: "Nueva tarea" },
        });

        fireEvent.change(screen.getByLabelText("Descripción"), {
            target: { value: "Descripción de prueba" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: /agregar tarea/i })
        );

        await waitFor(() => {
            expect(mocks.createTask).toHaveBeenCalledWith(
                "user-1",
                {
                    title: "Nueva tarea",
                    description: "Descripción de prueba",
                }
            );
        });
    });

    it("debe mostrar un error cuando falla la carga de tareas", async () => {
        mocks.subscribeToTasks.mockImplementation((_userId, _onTasksChange, onError) => {
            onError?.(new Error("Error de Firebase"));
            return vi.fn();
        });

        render(<Tasks />);

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent("No se pudieron cargar las tareas.");
    });

    it("debe permitir completar una tarea", async () => {
        mocks.subscribeToTasks.mockImplementation((_userId, onTasksChange) => {
            onTasksChange([mockTask]);
            return vi.fn();
        });

        render(<Tasks />);

        const completeButton = await screen.findByRole("button", {
            name: /completar/i,
        });

        fireEvent.click(completeButton);

        await waitFor(() => {
            expect(mocks.toggleTaskCompleted).toHaveBeenCalledWith(
                "task-1",
                true
            );
        });
    });

    it("debe permitir eliminar una tarea", async () => {
        mocks.subscribeToTasks.mockImplementation((_userId, onTasksChange) => {
            onTasksChange([mockTask]);
            return vi.fn();
        });

        render(<Tasks />);

        const deleteButton = await screen.findByRole("button", {
            name: /eliminar/i,
        });

        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(mocks.deleteTask).toHaveBeenCalledWith("task-1");
        });
    });

    it("debe permitir editar una tarea", async () => {
        mocks.subscribeToTasks.mockImplementation((_userId, onTasksChange) => {
            onTasksChange([mockTask]);
            return vi.fn();
        });

        render(<Tasks />);

        const editButton = await screen.findByRole("button", {
            name: /editar/i,
        });

        fireEvent.click(editButton);

        const titleInput = screen.getByDisplayValue("Estudiar React");
        const descriptionInput = screen.getByDisplayValue(
            "Practicar componentes"
        );

        fireEvent.change(titleInput, {
            target: { value: "Estudiar TypeScript" },
        });

        fireEvent.change(descriptionInput, {
            target: { value: "Practicar interfaces" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: /guardar cambios/i })
        );

        await waitFor(() => {
            expect(mocks.updateTask).toHaveBeenCalledWith(
                "task-1",
                {
                    title: "Estudiar TypeScript",
                    description: "Practicar interfaces",
                }
            );
        });
    });

    it("no debe crear una tarea cuando el título está vacío", async () => {
        render(<Tasks />);

        await screen.findByText("¡Todo listo para empezar!");

        const titleInput = screen.getByLabelText("Título");

        fireEvent.change(titleInput, {
            target: { value: "   " },
        });

        fireEvent.click(
            screen.getByRole("button", { name: /agregar tarea/i })
        );

        expect(mocks.createTask).not.toHaveBeenCalled();
    });

    it("debe mostrar un error cuando falla la creación de una tarea", async () => {
        mocks.createTask.mockRejectedValue(
            new Error("Error de Firebase")
        );

        render(<Tasks />);

        await screen.findByText("¡Todo listo para empezar!");

        fireEvent.change(screen.getByLabelText("Título"), {
            target: { value: "Nueva tarea" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: /agregar tarea/i })
        );

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "No se pudo crear la tarea."
        );
    });

    it("debe mostrar un error cuando falla la actualización de una tarea", async () => {
        mocks.subscribeToTasks.mockImplementation((_userId, onTasksChange) => {
            onTasksChange([mockTask]);
            return vi.fn();
        });

        mocks.updateTask.mockRejectedValue(
            new Error("Error de Firebase")
        );

        render(<Tasks />);

        fireEvent.click(
            await screen.findByRole("button", { name: /editar/i })
        );

        fireEvent.click(
            screen.getByRole("button", { name: /guardar cambios/i })
        );

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "No se pudieron guardar los cambios."
        );
    });

    it("debe mostrar un error cuando falla la eliminación de una tarea", async () => {
        mocks.subscribeToTasks.mockImplementation((_userId, onTasksChange) => {
            onTasksChange([mockTask]);
            return vi.fn();
        });

        mocks.deleteTask.mockRejectedValue(
            new Error("Error de Firebase")
        );

        render(<Tasks />);

        const deleteButton = await screen.findByRole("button", {
            name: /eliminar/i,
        });

        fireEvent.click(deleteButton);

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "No se pudo eliminar la tarea."
        );
    });
});