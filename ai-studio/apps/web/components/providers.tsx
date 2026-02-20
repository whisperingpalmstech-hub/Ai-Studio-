"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { EnterpriseToaster } from "@/components/ui/enterprise-toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { I18nProvider } from "@/lib/i18n";

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        gcTime: 5 * 60 * 1000,
                        retry: 1,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <I18nProvider>
                {children}
            </I18nProvider>
            <EnterpriseToaster />
            <ConfirmModal />
        </QueryClientProvider>
    );
}

