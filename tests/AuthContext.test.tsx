import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { onAuthStateChanged } from 'firebase/auth'
import { AuthProvider, useAuth } from '../src/features/auth/AuthContext'

vi.mock('firebase/auth', () => ({
    onAuthStateChanged: vi.fn(),
}))

vi.mock('../src/services/firebase', () => ({
    auth: {},
}))

const mockOnAuthStateChanged = vi.mocked(onAuthStateChanged)

const TestComponent = () => {
    const { user, loading } = useAuth()

    return (
        <div>
            <p>{loading ? 'Cargando' : 'Finalizado'}</p>
            <p>{user ? user.email : 'Sin usuario'}</p>
        </div>
    )
}

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('debe mostrar el estado de carga mientras verifica la sesión', () => {
        mockOnAuthStateChanged.mockReturnValue(vi.fn())

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        expect(screen.getByText('Cargando')).toBeInTheDocument()
    })

    it('debe actualizar el usuario cuando Firebase confirma una sesión', async () => {
        const mockUser = {
            email: 'usuario@test.com',
        }

        mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
            if (typeof callback === 'function') {
                callback(mockUser as never)
            }
            return vi.fn()
        })

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        expect(await screen.findByText('usuario@test.com')).toBeInTheDocument()
        expect(screen.getByText('Finalizado')).toBeInTheDocument()
    })

    it('debe indicar que no hay usuario cuando no existe una sesión', async () => {
        mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
            if (typeof callback === 'function') {
                callback(null)
            }
            return vi.fn()
        })

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByText('Sin usuario')).toBeInTheDocument()
        })

        expect(screen.getByText('Finalizado')).toBeInTheDocument()
    })
})