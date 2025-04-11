import { InstallPrompt } from "@/components/install-prompt"
import { Logo } from "@/components/logo"
import { LoginForm } from "@/components/login-form"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="w-full p-4 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          <Logo />
        </div>
      </header>

      <main className="flex flex-col items-center justify-center p-4 pt-16">
        <div className="w-full max-w-md text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Annapurna Badavane Association</h1>
          <p className="text-gray-600 mt-2">Monthly maintenance bill generating portal</p>
        </div>

        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </main>

      {/* Add the InstallPrompt component */}
      <InstallPrompt />
    </div>
  )
}


