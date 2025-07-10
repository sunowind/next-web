import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '../RegisterForm';

// Mock zxcvbn
jest.mock('zxcvbn', () => ({
    __esModule: true,
    default: jest.fn((password: string) => ({
        score: password.length >= 8 ? 3 : password.length >= 6 ? 2 : 1,
        feedback: {
            suggestions: password.length < 6 ? ['使用更长的密码'] : [],
        },
    })),
}));

describe('RegisterForm', () => {
    beforeEach(() => {
        // Reset fetch mock
        (global.fetch as jest.Mock).mockClear();
    });

    it('renders all form fields correctly', () => {
        render(<RegisterForm />);

        expect(screen.getByText('用户注册')).toBeInTheDocument();
        expect(screen.getByLabelText('用户名')).toBeInTheDocument();
        expect(screen.getByLabelText('密码')).toBeInTheDocument();
        expect(screen.getByLabelText('确认密码')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '注册' })).toBeInTheDocument();
        expect(screen.getByText('已有账号？')).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', async () => {
        const user = userEvent.setup();
        render(<RegisterForm />);

        const submitButton = screen.getByRole('button', { name: '注册' });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('用户名不能为空')).toBeInTheDocument();
            expect(screen.getByText('密码不能为空')).toBeInTheDocument();
            expect(screen.getByText('请确认密码')).toBeInTheDocument();
        });
    });

    it('validates username format', async () => {
        const user = userEvent.setup();
        render(<RegisterForm />);

        const usernameInput = screen.getByLabelText('用户名');
        const submitButton = screen.getByRole('button', { name: '注册' });

        // Test too short username
        await user.type(usernameInput, 'ab');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('用户名至少需要3个字符')).toBeInTheDocument();
        });

        // Test invalid characters
        await user.clear(usernameInput);
        await user.type(usernameInput, 'user@name');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('用户名只能包含字母、数字和下划线')).toBeInTheDocument();
        });

        // Test too long username
        await user.clear(usernameInput);
        await user.type(usernameInput, 'a'.repeat(21));
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('用户名不能超过20个字符')).toBeInTheDocument();
        });
    });

    it('validates password strength', async () => {
        const user = userEvent.setup();
        render(<RegisterForm />);

        const passwordInput = screen.getByLabelText('密码');
        const submitButton = screen.getByRole('button', { name: '注册' });

        // Test weak password
        await user.type(passwordInput, '123');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('密码至少需要6个字符')).toBeInTheDocument();
        });

        // Test password strength indicator
        await user.clear(passwordInput);
        await user.type(passwordInput, '123456');

        await waitFor(() => {
            expect(screen.getByText('密码强度:')).toBeInTheDocument();
            expect(screen.getByText('一般')).toBeInTheDocument();
        });
    });

    it('validates password confirmation', async () => {
        const user = userEvent.setup();
        render(<RegisterForm />);

        const passwordInput = screen.getByLabelText('密码');
        const confirmPasswordInput = screen.getByLabelText('确认密码');
        const submitButton = screen.getByRole('button', { name: '注册' });

        await user.type(passwordInput, 'password123');
        await user.type(confirmPasswordInput, 'different123');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('两次输入的密码不一致')).toBeInTheDocument();
        });
    });

    it('submits form with valid data', async () => {
        const user = userEvent.setup();
        const mockResponse = {
            success: true,
            message: '注册成功',
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        render(<RegisterForm />);

        const usernameInput = screen.getByLabelText('用户名');
        const passwordInput = screen.getByLabelText('密码');
        const confirmPasswordInput = screen.getByLabelText('确认密码');
        const submitButton = screen.getByRole('button', { name: '注册' });

        await user.type(usernameInput, 'testuser');
        await user.type(passwordInput, 'password123');
        await user.type(confirmPasswordInput, 'password123');
        await user.click(submitButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: 'testuser',
                    password: 'password123',
                }),
            });
        });

        await waitFor(() => {
            expect(screen.getByText('注册成功')).toBeInTheDocument();
        });
    });

    it('handles registration failure', async () => {
        const user = userEvent.setup();
        const mockResponse = {
            success: false,
            message: '用户名已存在',
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        render(<RegisterForm />);

        const usernameInput = screen.getByLabelText('用户名');
        const passwordInput = screen.getByLabelText('密码');
        const confirmPasswordInput = screen.getByLabelText('确认密码');
        const submitButton = screen.getByRole('button', { name: '注册' });

        await user.type(usernameInput, 'existinguser');
        await user.type(passwordInput, 'password123');
        await user.type(confirmPasswordInput, 'password123');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('用户名已存在')).toBeInTheDocument();
        });
    });

    it('handles network error', async () => {
        const user = userEvent.setup();

        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        render(<RegisterForm />);

        const usernameInput = screen.getByLabelText('用户名');
        const passwordInput = screen.getByLabelText('密码');
        const confirmPasswordInput = screen.getByLabelText('确认密码');
        const submitButton = screen.getByRole('button', { name: '注册' });

        await user.type(usernameInput, 'testuser');
        await user.type(passwordInput, 'password123');
        await user.type(confirmPasswordInput, 'password123');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('注册失败，请稍后重试')).toBeInTheDocument();
        });
    });

    it('disables submit button during submission', async () => {
        const user = userEvent.setup();

        // Mock a delayed response
        (global.fetch as jest.Mock).mockImplementationOnce(
            () => new Promise(resolve => setTimeout(() => resolve({
                ok: true,
                json: async () => ({ success: true, message: '注册成功' }),
            }), 100))
        );

        render(<RegisterForm />);

        const usernameInput = screen.getByLabelText('用户名');
        const passwordInput = screen.getByLabelText('密码');
        const confirmPasswordInput = screen.getByLabelText('确认密码');
        const submitButton = screen.getByRole('button', { name: '注册' });

        await user.type(usernameInput, 'testuser');
        await user.type(passwordInput, 'password123');
        await user.type(confirmPasswordInput, 'password123');
        await user.click(submitButton);

        // Check if button is disabled and shows loading text
        expect(screen.getByRole('button', { name: '注册中...' })).toBeDisabled();

        // Wait for submission to complete
        await waitFor(() => {
            expect(screen.getByRole('button', { name: '注册' })).not.toBeDisabled();
        });
    });

    it('shows password strength indicator', async () => {
        const user = userEvent.setup();
        render(<RegisterForm />);

        const passwordInput = screen.getByLabelText('密码');

        await user.type(passwordInput, 'password123');

        await waitFor(() => {
            expect(screen.getByText('密码强度:')).toBeInTheDocument();
            expect(screen.getByText('强')).toBeInTheDocument();
        });
    });

    it('validates form fields on submit', async () => {
        const user = userEvent.setup();
        render(<RegisterForm />);

        const submitButton = screen.getByRole('button', { name: '注册' });

        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('用户名不能为空')).toBeInTheDocument();
        });
    });

    it('accepts valid username formats', async () => {
        const user = userEvent.setup();
        render(<RegisterForm />);

        const usernameInput = screen.getByLabelText('用户名');

        // Test valid username with letters, numbers, and underscores
        await user.type(usernameInput, 'user_123');
        await user.tab();

        await waitFor(() => {
            // Should not show any username error messages
            expect(screen.queryByText('用户名至少需要3个字符')).not.toBeInTheDocument();
            expect(screen.queryByText('用户名不能超过20个字符')).not.toBeInTheDocument();
            expect(screen.queryByText('用户名只能包含字母、数字和下划线')).not.toBeInTheDocument();
        });
    });
}); 