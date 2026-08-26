import UserLayout from '../../components/user/UserLayout';

export default function BudgetAppLayout({ children }: { children: React.ReactNode }) {
  return <UserLayout>{children}</UserLayout>;
}
