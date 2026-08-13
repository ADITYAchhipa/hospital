import './globals.css';
import { AuthProvider } from '@/lib/authContext';
import { Navbar } from '@/components/Navbar';

export const metadata = {
  title: 'SwasthyaTap Hospital Portal | EMR & Clinical Management',
  description:
    'High-speed clinical EMR and healthcare workstation for hospitals and doctors to search patients, issue digital prescriptions, upload medical lab reports, and manage emergency blood network.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <body className="bg-[#F8FAFC] text-slate-800 min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
