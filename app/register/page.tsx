"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import styles from "@/components/AuthLayout.module.css";
import { signIn } from "next-auth/react";
import { AlertCircle, Loader2 } from "lucide-react";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                await signIn("credentials", {
                    redirect: false,
                    email,
                    password,
                });
                router.push("/");
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.message || "Registration failed");
                setIsLoading(false);
            }
        } catch (err) {
            setError("Something went wrong");
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Join the Platform"
            subtitle="Start tracking your progress today"
            footerText="Already have an account?"
            footerLinkText="Log In"
            footerLinkHref="/login"
        >
            <form onSubmit={handleSubmit}>
                {error && (
                    <div className={styles.error}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        className={styles.input}
                        placeholder="John Doe"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className={styles.input}
                        placeholder="name@example.com"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className={styles.input}
                        placeholder="••••••••"
                    />
                </div>

                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 className="animate-spin" size={20} />
                            Creating Account...
                        </span>
                    ) : "Create Account"}
                </button>
            </form>
        </AuthLayout>
    );
}
