import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { logout } from "../features/auth/authService";
import {
    createTask,
    deleteTask,
    getTasks,
    subscribeToTasks,
    toggleTaskCompleted,
    updateTask,
} from "../features/tasks/taskService";
import type { Task } from "../types/task";

function Tasks() {
    const { user } = useAuth();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sendingSummary, setSendingSummary] = useState(false);
    const [error, setError] = useState("");
    const [summaryMessage, setSummaryMessage] = useState("");

    const loadTasks = async () => {
        if (!user) return;

        try {
            setError("");
            const userTasks = await getTasks(user.uid);
            setTasks(userTasks);
        } catch {
            setError("No se pudieron cargar las tareas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            setTasks([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const unsubscribe = subscribeToTasks(
            user.uid,
            (updatedTasks) => {
                setTasks(updatedTasks);
                setError("");
                setLoading(false);
            },
            () => {
                setError("No se pudieron cargar las tareas.");
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [user]);

    const handleCreateTask = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!user || !title.trim()) return;

        try {
            setSaving(true);
            setError("");

            await createTask(user.uid, {
                title: title.trim(),
                description: description.trim(),
            });

            setTitle("");
            setDescription("");

            await loadTasks();
        } catch {
            setError("No se pudo crear la tarea.");
        } finally {
            setSaving(false);
        }
    };

    const handleEditClick = (task: Task) => {
        setEditingTaskId(task.id);
        setEditTitle(task.title);
        setEditDescription(task.description);
        setError("");
    };

    const handleCancelEdit = () => {
        setEditingTaskId(null);
        setEditTitle("");
        setEditDescription("");
    };

    const handleSaveEdit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!editingTaskId || !editTitle.trim()) return;

        try {
            setSaving(true);
            setError("");

            await updateTask(editingTaskId, {
                title: editTitle.trim(),
                description: editDescription.trim(),
            });

            handleCancelEdit();
            await loadTasks();
        } catch {
            setError("No se pudieron guardar los cambios.");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleCompleted = async (task: Task) => {
        try {
            setError("");

            await toggleTaskCompleted(task.id, !task.completed);
            await loadTasks();
        } catch {
            setError("No se pudo actualizar la tarea.");
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            setError("");

            await deleteTask(taskId);
            await loadTasks();
        } catch {
            setError("No se pudo eliminar la tarea.");
        }
    };

    const handleSendSummary = async () => {
        if (!user?.email) {
            setError("No se encontró el correo del usuario.");
            return;
        }

        try {
            setSendingSummary(true);
            setError("");
            setSummaryMessage("");

            const response = await fetch("/api/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: user.email,
                    tasks: tasks.map((task) => ({
                        title: task.title,
                        description: task.description,
                        completed: task.completed,
                    })),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "No se pudo enviar el resumen."
                );
            }

            setSummaryMessage(
                "¡Tu resumen fue enviado correctamente!"
            );
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "No se pudo enviar el resumen."
            );
        } finally {
            setSendingSummary(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch {
            setError("No se pudo cerrar la sesión.");
        }
    };

    return (
        <main className="tasks-page">
            <div className="tasks-container">
                <header className="tasks-header">
                    <div className="brand">
                        <span className="brand-icon">✓</span>
                        <span>MateCode</span>
                    </div>

                    <button
                        className="button button-outline"
                        type="button"
                        onClick={handleLogout}
                    >
                        Cerrar sesión
                    </button>
                </header>

                <section className="welcome-section">
                    <div>
                        <span className="section-eyebrow">
                            TU ESPACIO DE TRABAJO
                        </span>
                        <h1>Mis tareas</h1>
                        <p>
                            ¡Hola! {user?.email}. Organizá tus pendientes y
                            avanzá a tu ritmo.
                        </p>
                    </div>

                    <div className="welcome-decoration" aria-hidden="true">
                        ✦
                    </div>
                </section>

                {error && (
                    <div className="error-message" role="alert">
                        {error}
                    </div>
                )}

                {summaryMessage && (
                    <p role="status">{summaryMessage}</p>
                )}

                <section className="task-form-card">
                    <div className="card-heading">
                        <div>
                            <span className="section-eyebrow">
                                ORGANIZACIÓN
                            </span>
                            <h2>Crear una tarea</h2>
                        </div>
                        <span className="card-icon">＋</span>
                    </div>

                    <form
                        className="task-form"
                        onSubmit={handleCreateTask}
                    >
                        <div className="form-group">
                            <label htmlFor="task-title">Título</label>
                            <input
                                id="task-title"
                                type="text"
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                                placeholder="Ej. Preparar informe"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="task-description">
                                Descripción
                            </label>
                            <textarea
                                id="task-description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                                placeholder="Agregá algunos detalles sobre esta tarea..."
                                rows={3}
                            />
                        </div>

                        <button
                            className="button button-primary"
                            type="submit"
                            disabled={saving}
                        >
                            {saving ? "Guardando..." : "＋ Agregar tarea"}
                        </button>
                    </form>
                </section>

                <section className="task-list-section">
                    <div className="list-heading">
                        <div>
                            <span className="section-eyebrow">
                                SEGUIMIENTO
                            </span>
                            <h2>Mis pendientes</h2>
                        </div>

                        <span className="task-counter">
                            {tasks.length}{" "}
                            {tasks.length === 1 ? "tarea" : "tareas"}
                        </span>

                        <button
                            className="button button-primary"
                            type="button"
                            onClick={handleSendSummary}
                            disabled={sendingSummary || loading}
                        >
                            {sendingSummary
                                ? "Enviando..."
                                : "✉ Enviar mi resumen"}
                        </button>
                    </div>

                    {loading ? (
                        <div className="empty-state">
                            <p>Cargando tus tareas...</p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">✦</span>
                            <h3>¡Todo listo para empezar!</h3>
                            <p>
                                Todavía no tenés tareas. Agregá la primera y
                                organizá tu día.
                            </p>
                        </div>
                    ) : (
                        <div className="task-list">
                            {tasks.map((task) => (
                                <article
                                    className={`task-card ${task.completed
                                            ? "task-completed"
                                            : ""
                                        }`}
                                    key={task.id}
                                >
                                    {editingTaskId === task.id ? (
                                        <form
                                            className="edit-form"
                                            onSubmit={handleSaveEdit}
                                        >
                                            <h3>Editar tarea</h3>

                                            <div className="form-group">
                                                <label
                                                    htmlFor={`edit-title-${task.id}`}
                                                >
                                                    Título
                                                </label>
                                                <input
                                                    id={`edit-title-${task.id}`}
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(event) =>
                                                        setEditTitle(
                                                            event.target.value
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label
                                                    htmlFor={`edit-description-${task.id}`}
                                                >
                                                    Descripción
                                                </label>
                                                <textarea
                                                    id={`edit-description-${task.id}`}
                                                    value={editDescription}
                                                    onChange={(event) =>
                                                        setEditDescription(
                                                            event.target.value
                                                        )
                                                    }
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="task-actions">
                                                <button
                                                    className="button button-primary"
                                                    type="submit"
                                                    disabled={saving}
                                                >
                                                    {saving
                                                        ? "Guardando..."
                                                        : "Guardar cambios"}
                                                </button>

                                                <button
                                                    className="button button-outline"
                                                    type="button"
                                                    onClick={handleCancelEdit}
                                                    disabled={saving}
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="task-card-content">
                                                <div className="task-title-row">
                                                    <h3>{task.title}</h3>
                                                    <span
                                                        className={`task-status ${task.completed
                                                                ? "status-completed"
                                                                : "status-pending"
                                                            }`}
                                                    >
                                                        {task.completed
                                                            ? "Completada"
                                                            : "Pendiente"}
                                                    </span>
                                                </div>

                                                <p className="task-description">
                                                    {task.description ||
                                                        "Sin descripción."}
                                                </p>
                                            </div>

                                            <div className="task-actions">
                                                <button
                                                    className="button button-soft"
                                                    type="button"
                                                    onClick={() =>
                                                        handleToggleCompleted(
                                                            task
                                                        )
                                                    }
                                                >
                                                    {task.completed
                                                        ? "Marcar pendiente"
                                                        : "✓ Completar"}
                                                </button>

                                                <button
                                                    className="button button-outline"
                                                    type="button"
                                                    onClick={() =>
                                                        handleEditClick(task)
                                                    }
                                                >
                                                    Editar
                                                </button>

                                                <button
                                                    className="button button-danger"
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteTask(
                                                            task.id
                                                        )
                                                    }
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

export default Tasks;