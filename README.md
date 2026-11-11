MateCode - Aplicación de gestión de tareas

Aplicación web desarrollada como Proyecto Integrador M4 de Henry para MateCode. Permite a los usuarios administrar sus tareas diarias de manera sencilla, organizada y segura.

🚀 Tecnologías utilizadas

React: construcción de la interfaz.

TypeScript: tipado estático.

Vite: entorno de desarrollo y construcción.

React Router DOM: navegación entre páginas.

Firebase Authentication: registro e inicio de sesión.

Cloud Firestore: almacenamiento y persistencia de tareas.

AWS SES: envío de resúmenes de tareas por correo electrónico.

Vercel: ejecución de funciones serverless y despliegue.

Vitest y React Testing Library: pruebas de componentes.

✨ Funcionalidades

Registro e inicio de sesión con correo electrónico y contraseña.

Inicio de sesión con Google.

Rutas protegidas para usuarios autenticados.

Creación de tareas.

Edición de tareas.

Eliminación de tareas.

Marcado de tareas como completadas o pendientes.

Persistencia de información en Cloud Firestore.

Separación de tareas según el usuario autenticado.

Envío de resúmenes de tareas mediante AWS SES.

🎨 Diseño

La interfaz utiliza un estilo Soft Modern, con una estética limpia y amigable:

Fondo gris claro.

Tonos verde salvia, beige y azul suave.

Tarjetas blancas con bordes redondeados.

Sombras sutiles y una distribución adaptable a distintos dispositivos.

📂 Estructura del proyecto

proyectom4-matias-mancini/
├── api/
│   └── send-email.ts
├── src/
│   ├── features/
│   │   └── auth/
│   ├── pages/
│   ├── services/
│   ├── components/
│   ├── App.tsx
│   └── main.tsx
├── capturas/
├── .env.example
├── .gitignore
├── package.json
└── README.md

⚙️ Instalación y ejecución local

1. Clonar el repositorio

git clone URL_DEL_REPOSITORIO
cd proyectom4-matias-mancini

2. Instalar dependencias

npm install

3. Configurar las variables de entorno

Crear un archivo .env en la raíz del proyecto y completar las variables necesarias tomando como referencia .env.example.

Variables de Firebase:

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

Variables de AWS SES:

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-2
SES_FROM_EMAIL=
SES_TO_EMAIL=

Importante: las credenciales de AWS son privadas. No deben compartirse ni subirse al repositorio. Las variables de Firebase deben corresponder al proyecto configurado.

4. Iniciar la aplicación

npm run dev

Para ejecutar también las funciones serverless de Vercel en el entorno local:

npx vercel dev

La aplicación estará disponible en http://localhost:3000.

📧 Envío de correos con AWS SES

El proyecto utiliza Amazon Simple Email Service para enviar resúmenes de tareas.

La función serverless se encuentra en:

api/send-email.ts

El resumen incluye:

Cantidad total de tareas.

Cantidad de tareas completadas.

Cantidad de tareas pendientes.

Detalle y descripción de cada tarea.

Se realizó una prueba real de envío mediante una solicitud POST a /api/send-email y se comprobó la recepción del mensaje.

Durante las pruebas, AWS SES se encontraba en modo Sandbox, por lo que el destinatario debía ser una identidad verificada.

🧪 Verificación del proyecto

Comprobar los tipos de TypeScript:

npx tsc -b

Generar la versión de producción:

npm run build

📸 Evidencias de funcionamiento

1. Endpoint de la API

![Endpoint de la API](./src/assets/01-api-endpoint.png)


2. Envío exitoso mediante AWS SES

![Envío exitoso](./src/assets/02-envio-exitoso.png)

3. Recepción del correo electrónico

![Correo recibido](./src/assets/03-correo-recibido.png)
![Correo recibido](./src/assets/04-correo-recibido.png)


4. Identidad verificada en AWS SES

![Identidad verificada](./src/assets/05-ses-identidad-verificada.png)

5. Proyecto creado en Vercel

![Proyecto Vercel](./src/assets/06-vercel-proyecto.png)

🌐 Despliegue

Aplicación: pendiente de despliegue en producción.

Plataforma: Vercel.

👨‍💻 Autor

Matías Mancini

Proyecto Integrador M4 - Henry.