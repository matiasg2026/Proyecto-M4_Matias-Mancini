import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import type { VercelRequest, VercelResponse } from "@vercel/node";

type TaskSummaryItem = {
    title: string;
    description: string;
    completed: boolean;
};

type TaskSummaryBody = {
    email: unknown;
    tasks: unknown;
};

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidTask(value: unknown): value is TaskSummaryItem {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const task = value as Record<string, unknown>;

    return (
        typeof task.title === "string" &&
        typeof task.description === "string" &&
        typeof task.completed === "boolean"
    );
}

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
): Promise<void> {
    if (request.method !== "POST") {
        response.setHeader("Allow", "POST");
        response.status(405).json({
            error: "Método no permitido",
        });
        return;
    }

    const body = request.body as TaskSummaryBody | undefined;
    const email = body?.email;
    const tasks = body?.tasks;

    if (typeof email !== "string" || !Array.isArray(tasks)) {
        response.status(400).json({
            error: "Los datos enviados son inválidos",
        });
        return;
    }

    const normalizedEmail = email.trim();

    if (!isValidEmail(normalizedEmail)) {
        response.status(400).json({
            error: "El correo no es válido",
        });
        return;
    }

    if (tasks.length > 100 || !tasks.every(isValidTask)) {
        response.status(400).json({
            error: "La lista de tareas no es válida",
        });
        return;
    }

    const region = process.env.AWS_REGION?.trim();
    const from = process.env.SES_FROM_EMAIL?.trim();
    const to = process.env.SES_TO_EMAIL?.trim();

    if (!region || !from || !to) {
        console.error("Faltan variables de entorno de SES");

        response.status(500).json({
            error: "El servidor no está configurado correctamente",
        });
        return;
    }

    const completedTasks = tasks.filter((task) => task.completed).length;
    const pendingTasks = tasks.length - completedTasks;

    const taskDetails = tasks.map((task, index) => {
        const status = task.completed ? "Completada" : "Pendiente";

        return [
            `${index + 1}. ${task.title}`,
            `Estado: ${status}`,
            `Descripción: ${task.description || "Sin descripción"}`,
        ].join("\n");
    });

    const emailBody = [
        "Resumen de tareas - MateCode",
        "",
        `Total de tareas: ${tasks.length}`,
        `Completadas: ${completedTasks}`,
        `Pendientes: ${pendingTasks}`,
        "",
        "Detalle de tareas:",
        "",
        ...taskDetails,
    ].join("\n");

    const sesClient = new SESClient({ region });

    try {
        const command = new SendEmailCommand({
            Source: from,
            Destination: {
                ToAddresses: [to],
            },
            ReplyToAddresses: [normalizedEmail],
            Message: {
                Subject: {
                    Data: "Resumen de tareas - MateCode",
                    Charset: "UTF-8",
                },
                Body: {
                    Text: {
                        Data: emailBody,
                        Charset: "UTF-8",
                    },
                },
            },
        });

        const result = await sesClient.send(command);

        response.status(200).json({
            message: "Resumen enviado correctamente",
            messageId: result.MessageId,
        });
    } catch (error: unknown) {
        console.error("Error enviando resumen con SES:", error);

        response.status(500).json({
            error: "No se pudo enviar el resumen de tareas",
        });
    }
}