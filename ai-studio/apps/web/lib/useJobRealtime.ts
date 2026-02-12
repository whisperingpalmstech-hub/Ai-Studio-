
import { useEffect, useState } from 'react';
import { getSupabaseClient } from './supabase/client';
import { Database } from "../../../packages/database/types";

type Job = Database['public']['Tables']['jobs']['Row'];

export function useJobRealtime(userId?: string) {
    const [jobs, setJobs] = useState<Record<string, Job>>({});
    const [lastUpdate, setLastUpdate] = useState<Job | null>(null);

    useEffect(() => {
        if (!userId) return;

        const supabase = getSupabaseClient();

        // 1. Subscribe to job changes for this user
        const channel = supabase
            .channel(`public:jobs:user_id=eq.${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'jobs',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const updatedJob = payload.new as Job;
                    setJobs((prev) => ({
                        ...prev,
                        [updatedJob.id]: updatedJob,
                    }));
                    setLastUpdate(updatedJob);
                    console.log('Job update received via Realtime:', updatedJob);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Subscribed to Realtime job updates');
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return { jobs, lastUpdate };
}
