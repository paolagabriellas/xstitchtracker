"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface DeleteDialogProps {
  projectId: string;
  title: string;
  onClose: () => void;
}

export function DeleteDialog({ projectId, title, onClose }: DeleteDialogProps) {
  const router = useRouter();

  const handleDelete = async () => {
    const supabase = createClient();
    await supabase.from("projects").delete().eq("id", projectId);
    router.refresh(); // re-fetches the server component data
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-parch rounded-xl p-6 max-w-sm w-full">
        <h3 className="font-medium mb-2">Delete "{title}"?</h3>
        <p className="text-sm text-ink-3 mb-4">
          This will permanently delete all your progress. This can't be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="text-sm px-4 py-2">Cancel</button>
          <button onClick={handleDelete}
            className="text-sm px-4 py-2 bg-red-600 text-white rounded-lg">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}