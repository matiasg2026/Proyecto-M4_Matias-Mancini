import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
} from "firebase/auth";

import { auth } from "../../services/firebase";

// Registro con email y contraseña
export const registerWithEmail = async (
    email: string,
    password: string
) => {
    return await createUserWithEmailAndPassword(auth, email, password);
};

// Inicio de sesión con email y contraseña
export const loginWithEmail = async (
    email: string,
    password: string
) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

// Inicio de sesión con Google
export const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();

    return await signInWithPopup(auth, provider);
};

// Cerrar sesión
export const logout = async () => {
    return await signOut(auth);
};