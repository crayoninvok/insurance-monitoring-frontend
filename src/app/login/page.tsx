import { AuthCard } from '../../components/auth/AuthCard';
import { LoginForm } from '../../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <AuthCard
        title="Login"
        subtitle="Masuk menggunakan akun Anda. Untuk dev, gunakan admin seed: admin@local.test / admin123."
      >
        <LoginForm redirectTo="/budget" />
      </AuthCard>
    </div>
  );
}

