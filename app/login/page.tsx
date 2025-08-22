// "use client";

// import React, { useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";

// export default function LoginPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const redirectTo = searchParams.get("redirect") || "/academy/new";

//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     try {
//       const res = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username, password }),
//       });
//       const data: { ok?: boolean; error?: string } = await res
//         .json()
//         .catch(() => ({}));
//       if (!res.ok) {
//         throw new Error(data?.error || "Login failed");
//       }
//       router.replace(redirectTo);
//     } catch (err: unknown) {
//       const message = err instanceof Error ? err.message : "Login failed";
//       setError(message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
//       <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
//         <h1 className="text-2xl font-bold mb-4">Login</h1>
//         {error && (
//           <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
//             {error}
//           </div>
//         )}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Username</label>
//             <input
//               className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               autoFocus
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Password</label>
//             <input
//               type="password"
//               className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-indigo-600 text-white rounded-lg py-2 hover:bg-indigo-700 disabled:opacity-60"
//           >
//             {loading ? "Signing in..." : "Sign in"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }



"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock } from "lucide-react"; // icons

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/academy/new";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data: { ok?: boolean; error?: string } = await res
        .json()
        .catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Login failed");
      }
      router.replace(redirectTo);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Logo / Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-1">Sign in to continue</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-100 text-red-700 border border-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 border-blue-500" size={18} />
            <input
              className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-red-500 focus:ring-2  border-blue-800 text-blue-500"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
            <input
              type="password"
              className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-red-00 focus:ring-2  border-blue-800 text-blue-500"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white rounded-lg py-2 font-medium shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 disabled:opacity-60 transition"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Footer links */}
        <div className="text-sm text-center text-gray-500">
          <p>
            Don’t have an account?{" "}
            <a href="/signup" className="text-indigo-600 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
