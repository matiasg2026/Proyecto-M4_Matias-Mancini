import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerWithEmail } from "../features/auth/authService";

function Register() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await registerWithEmail(email, password);

            setSuccess("¡Cuenta creada correctamente! Redirigiendo al inicio de sesión...");

            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 2000);

            setPassword("");
        } catch {
            setError("No se pudo crear la cuenta. Verificá los datos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <div className="auth-brand">
                    <span className="brand-icon">✓</span>
                    <span>MateCode</span>
                </div>

                <div className="auth-heading">
                    <span className="section-eyebrow">EMPEZÁ HOY</span>
                    <h1>Crear cuenta</h1>
                    <p>
                        Creá tu cuenta y empezá a organizar tus tareas de manera sencilla.
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleRegister}>
                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="nombre@correo.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            minLength={6}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            autoComplete="new-password"
                            required
                        />
                        <span className="input-hint">
                            La contraseña debe tener al menos 6 caracteres.
                        </span>
                    </div>

                    {error && (
                        <div className="error-message" role="alert">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="success-message" role="status">
                            {success}
                        </div>
                    )}

                    <button
                        className="button button-primary auth-submit"
                        type="submit"
                        disabled={loading || Boolean(success)}
                    >
                        {loading ? "Creando cuenta..." : "Registrarme"}
                    </button>
                </form>

                <p className="auth-footer">
                    ¿Ya tenés una cuenta? <Link to="/login">Iniciá sesión</Link>
                </p>
            </section>
        </main>
    );
}

export default Register;