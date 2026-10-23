import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { LoaderCircle, Lock, LogOut, Mail, ShieldCheck } from "lucide-react";
import { supabase } from "../supabase";
import { Button } from "./ui/Button";
import { IconInput } from "./ui/Field";

type Props = {
    children: ReactNode;
};

type FieldErrors = { email?: string; password?: string };

function validate(email: string, password: string): FieldErrors {
    const errors: FieldErrors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.email = "Please enter a valid email address.";
    }
    if (!password) {
        errors.password = "Please enter your password.";
    }

    return errors;
}

export default function HostGate({ children }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setLoggedIn(!!data.session);
            setLoading(false);
        });

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setLoggedIn(!!session);
            }
        );

        return () => listener.subscription.unsubscribe();
    }, []);

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting) return;

        const errors = validate(email, password);
        setFieldErrors(errors);
        setError("");
        if (errors.email || errors.password) return;

        setSubmitting(true);

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (signInError) {
                console.error("Host login error:", signInError);
                setError("Incorrect email or password.");
            }
        } catch (err) {
            console.error("Unexpected host login error:", err);
            setError("Something went wrong. Please check your connection and try again.");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        setPassword("");
    }

    if (loading) {
        return (
            <div
                role="status"
                className="flex min-h-72 flex-col items-center justify-center text-[#64748B]"
            >
                <LoaderCircle
                    size={28}
                    className="animate-spin text-[#4F46E5]"
                    aria-hidden="true"
                />
                <p className="mt-3 text-sm font-medium">Checking your session...</p>
            </div>
        );
    }

    if (!loggedIn) {
        return (
            <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
                <section
                    aria-labelledby="host-login-title"
                    className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-8"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5]">
                    <ShieldCheck size={22} aria-hidden="true" />
                  </span>

                    <h2 id="host-login-title" className="mt-4 text-2xl font-bold">
                        Host login
                    </h2>
                    <p className="mt-1 text-sm text-[#64748B]">
                        Sign in to create and manage your time slots.
                    </p>

                    <form onSubmit={handleLogin} noValidate className="mt-6 space-y-4">
                        <IconInput
                            id="host-email"
                            name="email"
                            label="Email"
                            icon={Mail}
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            disabled={submitting}
                            error={fieldErrors.email}
                        />

                        <IconInput
                            id="host-password"
                            name="password"
                            label="Password"
                            icon={Lock}
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter your password"
                            disabled={submitting}
                            error={fieldErrors.password}
                        />

                        {error && (
                            <p
                                role="alert"
                                className="rounded-xl border border-[#DC2626]/20 bg-[#FEF2F2] p-3.5 text-sm text-[#DC2626]"
                            >
                                {error}
                            </p>
                        )}

                        <Button type="submit" fullWidth size="lg" loading={submitting}>
                            {submitting ? "Signing in..." : "Log in"}
                        </Button>
                    </form>
                </section>
            </div>
        );
    }

    return (
        <div>
            <div className="mx-auto flex max-w-6xl justify-end px-4 pt-4 sm:px-8">
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut size={16} aria-hidden="true" />
                    Log out
                </Button>
            </div>

            {children}
        </div>
    );
}
