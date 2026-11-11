import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginWithEmail, loginWithGoogle } from "../features/auth/authService";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleEmailLogin = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            await loginWithEmail(email, password);
            navigate("/tasks");
        } catch {
            setError("No se pudo iniciar sesión. Verificá tus datos.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        setLoading(true);

        try {
            await loginWithGoogle();
            navigate("/tasks");
        } catch {
            setError("No se pudo iniciar sesión con Google.");
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
                    <span className="section-eyebrow">BIENVENIDO/A DE NUEVO</span>
                    <h1>Iniciar sesión</h1>
                    <p>Ingresá a tu espacio de trabajo y organizá tus tareas.</p>
                </div>

                <form className="auth-form" onSubmit={handleEmailLogin}>
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
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Ingresá tu contraseña"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="error-message" role="alert">
                            {error}
                        </div>
                    )}

                    <button
                        className="button button-primary auth-submit"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Ingresando..." : "Ingresar"}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>o también podés</span>
                </div>

                <button
                    className="button button-google"
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    <span className="google-symbol">G</span>
                    Continuar con Google
                </button>

                <p className="auth-footer">
                    ¿No tenés una cuenta? <Link to="/register">Registrate</Link>
                </p>
            </section>
        </main>
    );
}

export default Login;