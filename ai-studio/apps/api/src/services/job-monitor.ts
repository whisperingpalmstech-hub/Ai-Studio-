
import { supabaseAdmin } from "./supabase.js";
import { webSocketService } from "./websocket.js";

class JobMonitorService {
    private subscription: any = null;

    public start() {
        console.log("📡 Starting Supabase Job Monitor for Live Updates...");

        this.subscription = supabaseAdmin
            .channel('job-updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'jobs'
                },
                (payload) => {
                    const job = payload.new;
                    // console.log(`🔄 Job Update Detected: ${job.id} - ${job.status} (${job.progress}%)`);

                    // Relay the update to the user via WebSocket
                    webSocketService.sendToUser(job.user_id, {
                        type: "job_progress",
                        jobId: job.id,
                        status: job.status,
                        progress: job.progress,
                        nodeId: job.current_node, // Worker sets current_node to the text label
                        message: job.status === 'completed' ? 'Generation Complete' :
                            job.status === 'failed' ? `Error: ${job.error_message}` :
                                `Processing: ${job.current_node || 'Initializing'}...`,
                        results: job.results // Node-specific results for live preview
                    });

                    // If job is finished, send a job_complete message
                    if (job.status === 'completed') {
                        webSocketService.sendToUser(job.user_id, {
                            type: "job_complete",
                            jobId: job.id,
                            results: job.results,
                            outputs: job.outputs
                        });
                    } else if (job.status === 'failed') {
                        webSocketService.sendToUser(job.user_id, {
                            type: "job_failed",
                            jobId: job.id,
                            error: job.error_message
                        });
                    }
                }
            )
            .subscribe();
    }

    public stop() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}

export const jobMonitorService = new JobMonitorService();
