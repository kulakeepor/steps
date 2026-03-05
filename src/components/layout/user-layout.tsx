import { Header } from "./header";

export function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="cosmic-content container-apple py-8">{children}</main>
    </div>
  );
}
