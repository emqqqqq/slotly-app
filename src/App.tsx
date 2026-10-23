import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { BookPage } from "./pages/BookPage";
import { ManagePage } from "./pages/ManagePage";
import { useSlots } from "./hooks/useSlots";
import type { Page } from "./types";

function pageFromHash(): Page {
    return window.location.hash === "#manage" ? "manage" : "book";
}

export default function App() {
    const [page, setPage] = useState<Page>(pageFromHash);
    const { slots, loading, error, refresh } = useSlots();

    useEffect(() => {
        const onHashChange = () => setPage(pageFromHash());

        window.addEventListener("hashchange", onHashChange);
        return () => window.removeEventListener("hashchange", onHashChange);
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [page]);

    function navigate(next: Page) {
        window.location.hash = next === "manage" ? "manage" : "book";
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-[#0F172A]">
            <Header page={page} onNavigate={navigate} />

            <main className="flex-1">
                {page === "book" ? (
                    <BookPage
                        slots={slots}
                        loading={loading}
                        error={error}
                        onRefresh={refresh}
                    />
                ) : (
                    <ManagePage
                        slots={slots}
                        loading={loading}
                        error={error}
                        onRefresh={refresh}
                    />
                )}
            </main>

            <Footer />
        </div>
    );
}
