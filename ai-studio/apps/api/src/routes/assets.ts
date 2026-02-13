
import { Router, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { supabaseAdmin } from "../services/supabase.js";
import { NotFoundError } from "../middleware/error.js";

const router = Router();

// DELETE /api/v1/assets/:id - Delete a specific asset and its storage file
router.delete("/:id", async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const { id: assetId } = req.params;

        // 1. Get the asset to verify ownership and get storage path
        const { data: asset, error: fetchError } = await supabaseAdmin
            .from("assets")
            .select("*")
            .eq("id", assetId)
            .eq("user_id", user.id)
            .single();

        if (fetchError || !asset) {
            throw new NotFoundError("Asset not found or unauthorized");
        }

        // 2. Extract storage path from file_path URL
        const url = (asset as any).file_path;
        let storagePath = null;

        if (url.includes('/assets/')) {
            storagePath = url.split('/assets/')[1];
        } else if (url.includes('/outputs/')) {
            // Legacy/local paths
            storagePath = url.split('/outputs/')[1];
        }

        // 3. Delete from Storage if path found
        if (storagePath) {
            console.log(`🗑️ Deleting from storage: ${storagePath}`);
            const { error: storageError } = await supabaseAdmin.storage
                .from("assets")
                .remove([storagePath]);

            if (storageError) {
                console.warn(`⚠️ Failed to delete physical file: ${storageError.message}`);
            }
        }

        // 4. Delete from DB
        const { error: deleteError } = await supabaseAdmin
            .from("assets")
            .delete()
            .eq("id", assetId);

        if (deleteError) {
            throw deleteError;
        }

        console.log(`✅ Asset ${assetId} deleted successfully`);
        res.json({ message: "Asset and associated file deleted successfully" });
    } catch (err) {
        next(err);
    }
});

export { router as assetsRouter };
