"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { parseFlossCross } from "@/lib/parser";
import { useRouter } from "next/navigation";

interface UploadZoneProps {
  currentCount: number;
}

export function UploadZone({ currentCount }: UploadZoneProps) {
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleFile = async (file: File) => {
    setError("");
    setUploading(true);

    try {
      const text = await file.text();
      let raw;
      try {
        raw = JSON.parse(text);
      }
      catch (e) {
        throw new Error("Invalid JSON file");
      }

      if (!raw?.model?.images?.[0]){
        throw new Error("Invalid FlossCross JSON: missing model images");
      }

      // validate it parses correctly
      const pattern = parseFlossCross(raw);

      if (pattern.stitches.length === 0) {
        throw new Error("Invalid FlossCross JSON: no stitches found");
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Not logged in");

      const { data, error: insertError } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          title: pattern.title,
          width: pattern.width,
          height: pattern.height,
          pattern_data: raw, // store the full FlossCross JSON
          done_keys: [],
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      router.push(`/project/${data.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to upload");
      setUploading(false);
    }
  };

  return (
    <div>
      <div
        className="border-2 border-dashed border-border rounded-xl p-10
                   text-center cursor-pointer hover:border-accent hover:bg-linen-2
                   transition-colors"
        onClick={() => document.getElementById("upload-input")?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
        }}
      >
        <p className="text-2xl mb-2">🧵</p>
        <p className="font-medium">
          {uploading ? "Uploading..." : "Drop your .json file here"}
        </p>
        <p className="text-xs text-ink-3 mt-1">or click to browse</p>
        <input
          id="upload-input"
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
          }}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-3 text-center">{error}</p>
      )}
    </div>
  );
}